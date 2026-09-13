import { QueryClient } from "@tanstack/react-query";
import {
  purgeAccountScopedCache,
  resolveIdentityTransition,
  shouldPurgeAccountCache,
} from "@/lib/auth/identitySession";

describe("resolveIdentityTransition", () => {
  it("returns none when the uid is unchanged", () => {
    expect(resolveIdentityTransition("a", "a")).toEqual({ type: "none" });
    expect(resolveIdentityTransition(null, null)).toEqual({ type: "none" });
  });

  it("detects signed_in from null", () => {
    expect(resolveIdentityTransition(null, "user-a")).toEqual({
      type: "signed_in",
      uid: "user-a",
    });
  });

  it("detects signed_out to null", () => {
    expect(resolveIdentityTransition("user-a", null)).toEqual({
      type: "signed_out",
      previousUid: "user-a",
    });
  });

  it("detects A-to-B switches", () => {
    expect(resolveIdentityTransition("user-a", "user-b")).toEqual({
      type: "switched",
      previousUid: "user-a",
      nextUid: "user-b",
    });
  });
});

describe("shouldPurgeAccountCache", () => {
  it("purges on signed_out and switched only", () => {
    expect(
      shouldPurgeAccountCache({ type: "signed_out", previousUid: "a" }),
    ).toBe(true);
    expect(
      shouldPurgeAccountCache({
        type: "switched",
        previousUid: "a",
        nextUid: "b",
      }),
    ).toBe(true);
    expect(shouldPurgeAccountCache({ type: "none" })).toBe(false);
    expect(shouldPurgeAccountCache({ type: "signed_in", uid: "a" })).toBe(
      false,
    );
  });
});

describe("purgeAccountScopedCache", () => {
  it("cancels queries, clears the client, and removes persisted cache", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["session", "current"], { uid: "user-a" });
    queryClient.setQueryData(["home", "summary"], [{ league_id: 1 }]);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(2);

    const removePersistedCache = jest.fn().mockResolvedValue(undefined);
    const cancelSpy = jest.spyOn(queryClient, "cancelQueries");

    await purgeAccountScopedCache({ queryClient, removePersistedCache });

    expect(cancelSpy).toHaveBeenCalled();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(queryClient.getMutationCache().getAll()).toHaveLength(0);
    expect(removePersistedCache).toHaveBeenCalledTimes(1);
  });
});
