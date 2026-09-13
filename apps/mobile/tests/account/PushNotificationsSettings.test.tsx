import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { PushNotificationsSettings } from "@/components/settings/PushNotificationsSettings";

const mockToggle = jest.fn();
const mockRefresh = jest.fn();
const mockOpenSettings = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("toggle stays enabled with durable preference and zero tokens", () => {
  render(
    <PushNotificationsSettings
      preference={false}
      tokenCount={0}
      reason="in_app_disabled"
      osPermission="undetermined"
      onToggle={mockToggle}
      onRefresh={mockRefresh}
    />,
  );

  expect(screen.getByText("Preference: Off")).toBeTruthy();
  expect(
    screen.getByText(
      /Turn this on to receive reminders, summaries, and message alerts/i,
    ),
  ).toBeTruthy();

  const toggle = screen.getByLabelText("Allow Push Notifications");
  expect(toggle.props.disabled).toBe(false);
  fireEvent(toggle, "valueChange", true);
  expect(mockToggle).toHaveBeenCalledTimes(1);
});

test("OS-denied state shows its own guidance and open-settings action", () => {
  render(
    <PushNotificationsSettings
      preference={true}
      tokenCount={0}
      reason="ok"
      osPermission="denied"
      onToggle={mockToggle}
      onRefresh={mockRefresh}
      onOpenSettings={mockOpenSettings}
    />,
  );

  expect(screen.getByText("Blocked by OS")).toBeTruthy();
  expect(
    screen.getByText(/Open system settings and allow notifications/i),
  ).toBeTruthy();
  fireEvent.press(screen.getByText("Open system settings"));
  expect(mockOpenSettings).toHaveBeenCalledTimes(1);
});

test("storage-unavailable state disables the toggle and explains itself", () => {
  render(
    <PushNotificationsSettings
      preference={false}
      tokenCount={0}
      reason="storage_unavailable"
      unavailable
      osPermission="granted"
      onToggle={mockToggle}
      onRefresh={mockRefresh}
    />,
  );

  expect(screen.getByText("Unavailable")).toBeTruthy();
  expect(
    screen.getByText(/Notification delivery settings are temporarily unavailable/i),
  ).toBeTruthy();
  expect(screen.queryByText("Open system settings")).toBeNull();

  const toggle = screen.getByLabelText("Allow Push Notifications");
  expect(toggle.props.disabled).toBe(true);
  fireEvent(toggle, "valueChange", true);
  expect(mockToggle).not.toHaveBeenCalled();
});

test("in-app-disabled copy differs from OS-denied copy", () => {
  render(
    <PushNotificationsSettings
      preference={false}
      tokenCount={1}
      reason="in_app_disabled"
      osPermission="granted"
      onToggle={mockToggle}
      onRefresh={mockRefresh}
      onOpenSettings={mockOpenSettings}
    />,
  );

  expect(screen.getByText("Disabled")).toBeTruthy();
  expect(screen.getByText(/Preference off/i)).toBeTruthy();
  expect(screen.queryByText("Open system settings")).toBeNull();
  expect(screen.queryByText(/Blocked by OS/i)).toBeNull();
});
