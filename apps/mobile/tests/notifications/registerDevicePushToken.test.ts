import { Platform } from "react-native";
import { registerDevicePushToken } from "@/lib/notifications/registerDevicePushToken";

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();
const mockGetExpoPushTokenAsync = jest.fn();

jest.mock("expo-notifications", () => ({
  AndroidImportance: { DEFAULT: 3 },
  getPermissionsAsync: (...args: unknown[]) =>
    mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) =>
    mockRequestPermissionsAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) =>
    mockSetNotificationChannelAsync(...args),
  getExpoPushTokenAsync: (...args: unknown[]) =>
    mockGetExpoPushTokenAsync(...args),
}));

jest.mock("expo-constants", () => ({
  easConfig: { projectId: "test-project" },
  expoConfig: { extra: { eas: { projectId: "test-project" } } },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("does not prompt when requestPermissionIfNeeded is false", async () => {
  mockGetPermissionsAsync.mockResolvedValue({ status: "undetermined" });
  const registerPushToken = jest.fn();

  const result = await registerDevicePushToken({
    registerPushToken,
    requestPermissionIfNeeded: false,
  });

  expect(result).toEqual({
    status: "permission_not_granted",
    permissionStatus: "undetermined",
  });
  expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  expect(registerPushToken).not.toHaveBeenCalled();
});

test("registers when permission is already granted without prompting", async () => {
  mockGetPermissionsAsync.mockResolvedValue({ status: "granted" });
  mockGetExpoPushTokenAsync.mockResolvedValue({
    data: "ExponentPushToken[abc]",
  });
  const registerPushToken = jest.fn().mockResolvedValue({ success: true });

  const result = await registerDevicePushToken({
    registerPushToken,
    requestPermissionIfNeeded: false,
  });

  expect(result).toEqual({
    status: "registered",
    token: "ExponentPushToken[abc]",
  });
  expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  expect(registerPushToken).toHaveBeenCalledWith({
    token: "ExponentPushToken[abc]",
    platform:
      Platform.OS === "ios" || Platform.OS === "android"
        ? Platform.OS
        : "web",
  });
});
