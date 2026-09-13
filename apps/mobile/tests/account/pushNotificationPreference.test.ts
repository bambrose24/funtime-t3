import {
  getPushPreferencePresentation,
  NOTIFICATION_PERMISSION_CONTEXT_BODY,
  NOTIFICATION_PERMISSION_CONTEXT_TITLE,
} from "@/lib/settings/pushNotificationPreference";

describe("getPushPreferencePresentation", () => {
  it("keeps the toggle available with zero tokens when preference is off", () => {
    const presentation = getPushPreferencePresentation({
      preference: false,
      tokenCount: 0,
      reason: "in_app_disabled",
      osPermission: "undetermined",
    });

    expect(presentation.canToggle).toBe(true);
    expect(presentation.preferenceOn).toBe(false);
    expect(presentation.statusLabel).toBe("Disabled");
    expect(presentation.guidance).toMatch(/before a device token exists/i);
    expect(presentation.showOpenSettings).toBe(false);
  });

  it("renders OS-denied guidance and an open-settings path", () => {
    const presentation = getPushPreferencePresentation({
      preference: true,
      tokenCount: 0,
      reason: "ok",
      osPermission: "denied",
    });

    expect(presentation.canToggle).toBe(true);
    expect(presentation.statusLabel).toBe("Blocked by OS");
    expect(presentation.guidance).toMatch(/system settings/i);
    expect(presentation.showOpenSettings).toBe(true);
  });

  it("renders storage-unavailable guidance and disables the toggle", () => {
    const presentation = getPushPreferencePresentation({
      preference: false,
      tokenCount: 0,
      reason: "storage_unavailable",
      unavailable: true,
      osPermission: "granted",
    });

    expect(presentation.canToggle).toBe(false);
    expect(presentation.statusLabel).toBe("Unavailable");
    expect(presentation.guidance).toMatch(/temporarily unavailable/i);
    expect(presentation.showOpenSettings).toBe(false);
  });

  it("explains enabled preference with zero tokens", () => {
    const presentation = getPushPreferencePresentation({
      preference: true,
      tokenCount: 0,
      reason: "ok",
      osPermission: "granted",
    });

    expect(presentation.canToggle).toBe(true);
    expect(presentation.preferenceOn).toBe(true);
    expect(presentation.summary).toMatch(/waiting for this device/i);
  });
});

describe("notification permission context copy", () => {
  it("explains why Funtime asks before the OS prompt", () => {
    expect(NOTIFICATION_PERMISSION_CONTEXT_TITLE).toMatch(/notifications/i);
    expect(NOTIFICATION_PERMISSION_CONTEXT_BODY).toMatch(/reminders/i);
    expect(NOTIFICATION_PERMISSION_CONTEXT_BODY).toMatch(/permission/i);
  });
});
