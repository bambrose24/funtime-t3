import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearPendingPushTokenRevocation,
  enqueuePendingPushTokenRevocation,
  flushPendingPushTokenRevocations,
  isNetworkOnline,
  PENDING_PUSH_TOKEN_REVOCATIONS_KEY,
  PUSH_TOKEN_REVOKE_TIMEOUT_MS,
  readPendingPushTokenRevocations,
  revokePushTokenBestEffort,
  withTimeout,
  writePendingPushTokenRevocations,
  type PendingPushTokenRevocation,
} from "@/lib/auth/pendingPushTokenRevocation";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(),
}));

const NetInfo = jest.requireMock("@react-native-community/netinfo") as {
  fetch: jest.Mock;
};

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("pendingPushTokenRevocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getItem.mockResolvedValue(null);
    storage.setItem.mockResolvedValue(undefined);
    storage.removeItem.mockResolvedValue(undefined);
    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  describe("withTimeout", () => {
    it("rejects when the promise does not settle in time", async () => {
      jest.useFakeTimers();
      const pending = withTimeout(
        new Promise(() => undefined),
        100,
        "timed out",
      );
      const assertion = expect(pending).rejects.toThrow("timed out");
      await jest.advanceTimersByTimeAsync(100);
      await assertion;
      jest.useRealTimers();
    });
  });

  describe("queue persistence", () => {
    it("stores unique token/uid pairs", async () => {
      const first: PendingPushTokenRevocation = {
        token: "tok-a",
        uid: 1,
      };
      storage.getItem.mockResolvedValueOnce(JSON.stringify([first]));

      await enqueuePendingPushTokenRevocation({ token: "tok-a", uid: 1 });
      expect(storage.setItem).toHaveBeenCalledWith(
        PENDING_PUSH_TOKEN_REVOCATIONS_KEY,
        JSON.stringify([first]),
      );

      storage.getItem.mockResolvedValueOnce(JSON.stringify([first]));
      await enqueuePendingPushTokenRevocation({ token: "tok-b", uid: 1 });
      expect(storage.setItem).toHaveBeenLastCalledWith(
        PENDING_PUSH_TOKEN_REVOCATIONS_KEY,
        JSON.stringify([first, { token: "tok-b", uid: 1 }]),
      );
    });

    it("clears a matching entry", async () => {
      storage.getItem.mockResolvedValueOnce(
        JSON.stringify([
          { token: "tok-a", uid: 1 },
          { token: "tok-b", uid: 1 },
        ]),
      );
      await clearPendingPushTokenRevocation("tok-a", 1);
      expect(storage.setItem).toHaveBeenCalledWith(
        PENDING_PUSH_TOKEN_REVOCATIONS_KEY,
        JSON.stringify([{ token: "tok-b", uid: 1 }]),
      );
    });
  });

  describe("revokePushTokenBestEffort", () => {
    it("queues without calling unregister when offline", async () => {
      NetInfo.fetch.mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      });
      const unregisterPushToken = jest.fn();

      const result = await revokePushTokenBestEffort({
        token: "tok-a",
        uid: 9,
        unregisterPushToken,
      });

      expect(result).toBe("queued");
      expect(unregisterPushToken).not.toHaveBeenCalled();
      expect(storage.setItem).toHaveBeenCalled();
    });

    it("returns revoked and clears pending on success", async () => {
      storage.getItem.mockResolvedValue(
        JSON.stringify([{ token: "tok-a", uid: 9 }]),
      );
      const unregisterPushToken = jest.fn().mockResolvedValue({
        success: true,
        updatedCount: 1,
        unavailable: false,
      });

      const result = await revokePushTokenBestEffort({
        token: "tok-a",
        uid: 9,
        unregisterPushToken,
      });

      expect(result).toBe("revoked");
      expect(unregisterPushToken).toHaveBeenCalledWith({ token: "tok-a" });
    });

    it("queues when unregister times out instead of hanging", async () => {
      jest.useFakeTimers();
      const unregisterPushToken = jest.fn(
        () => new Promise<{
          success: boolean;
          updatedCount: number;
          unavailable: boolean;
        }>(() => undefined),
      );

      const resultPromise = revokePushTokenBestEffort({
        token: "tok-a",
        uid: 9,
        unregisterPushToken,
        timeoutMs: 50,
      });
      await jest.advanceTimersByTimeAsync(50);
      await expect(resultPromise).resolves.toBe("queued");
      expect(storage.setItem).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe("flushPendingPushTokenRevocations", () => {
    it("only retries entries for the signed-in uid", async () => {
      storage.getItem.mockResolvedValue(
        JSON.stringify([
          { token: "mine", uid: 1 },
          { token: "theirs", uid: 2 },
        ]),
      );
      const unregisterPushToken = jest.fn().mockResolvedValue({
        success: true,
        updatedCount: 1,
        unavailable: false,
      });

      await flushPendingPushTokenRevocations({
        uid: 1,
        unregisterPushToken,
      });

      expect(unregisterPushToken).toHaveBeenCalledTimes(1);
      expect(unregisterPushToken).toHaveBeenCalledWith({ token: "mine" });
    });

    it("skips flush when offline", async () => {
      NetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: false,
      });
      storage.getItem.mockResolvedValue(
        JSON.stringify([{ token: "mine", uid: 1 }]),
      );
      const unregisterPushToken = jest.fn();

      await flushPendingPushTokenRevocations({
        uid: 1,
        unregisterPushToken,
      });

      expect(unregisterPushToken).not.toHaveBeenCalled();
    });
  });

  describe("isNetworkOnline", () => {
    it("treats explicit unreachable as offline", async () => {
      NetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: false,
      });
      await expect(isNetworkOnline()).resolves.toBe(false);
    });
  });

  describe("read/write edge cases", () => {
    it("returns empty list for corrupt storage", async () => {
      storage.getItem.mockResolvedValueOnce("not-json");
      await expect(readPendingPushTokenRevocations()).resolves.toEqual([]);
    });

    it("removes the key when writing an empty list", async () => {
      await writePendingPushTokenRevocations([]);
      expect(storage.removeItem).toHaveBeenCalledWith(
        PENDING_PUSH_TOKEN_REVOCATIONS_KEY,
      );
    });
  });

  it("exposes the shared timeout constant", () => {
    expect(PUSH_TOKEN_REVOKE_TIMEOUT_MS).toBeGreaterThan(0);
  });
});
