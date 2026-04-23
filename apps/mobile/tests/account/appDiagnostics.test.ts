import {
  buildAppDiagnostics,
  formatAppDiagnosticsForClipboard,
} from "@/lib/settings/appDiagnostics";

describe("buildAppDiagnostics", () => {
  it("builds embedded build diagnostics when launch source is binary", () => {
    const diagnostics = buildAppDiagnostics({
      appVersion: "54.0.6",
      buildVersion: "54.0.6",
      bundleIdentifier: "host.exp.Exponent",
      applicationName: "Expo Go",
      isEmbeddedLaunch: true,
      runtimeVersion: "exposdk:54.0.0",
      updatesEnabled: true,
      platform: "ios",
      executionEnvironment: "storeClient",
    });

    expect(diagnostics.otaSource).toBe("BUILD");
    expect(diagnostics.otaVersion).toBe("embedded");
    expect(diagnostics.otaUpdateId).toBe("embedded");
    expect(diagnostics.otaCreatedAt).toBe("n/a");
    expect(diagnostics.runtimeVersion).toBe("exposdk:54.0.0");
  });

  it("builds ota diagnostics when a remote update is running", () => {
    const diagnostics = buildAppDiagnostics({
      appVersion: "1.0.0",
      buildVersion: "102",
      isEmbeddedLaunch: false,
      updateId: "1234-update-id",
      createdAt: "2026-03-13T00:00:00.000Z",
      runtimeVersion: "1.0.0",
      updateChannel: "production",
      updatesEnabled: true,
    });

    expect(diagnostics.otaSource).toBe("OTA");
    expect(diagnostics.otaVersion).toBe("1.0.0");
    expect(diagnostics.otaUpdateId).toBe("1234-update-id");
    expect(diagnostics.otaCreatedAt).toBe("2026-03-13T00:00:00.000Z");
    expect(diagnostics.updateChannel).toBe("production");
  });
});

describe("formatAppDiagnosticsForClipboard", () => {
  it("renders newline-separated diagnostics entries", () => {
    const diagnostics = buildAppDiagnostics({
      appVersion: "1.0.0",
      buildVersion: "100",
      isEmbeddedLaunch: true,
    });

    const formatted = formatAppDiagnosticsForClipboard(diagnostics);
    expect(formatted).toContain("App Version: 1.0.0");
    expect(formatted).toContain("Build Version: 100");
    expect(formatted).toContain("OTA Source: BUILD");
    expect(formatted.split("\n").length).toBeGreaterThan(5);
  });
});
