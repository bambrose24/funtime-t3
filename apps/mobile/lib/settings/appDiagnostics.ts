export type AppDiagnostics = {
  appVersion: string;
  buildVersion: string;
  bundleIdentifier: string;
  applicationName: string;
  otaSource: "BUILD" | "OTA";
  otaVersion: string;
  otaUpdateId: string;
  otaCreatedAt: string;
  runtimeVersion: string;
  updateChannel: string;
  updatesEnabled: string;
  platform: string;
  executionEnvironment: string;
};

export type AppDiagnosticsInput = {
  appVersion?: string | null;
  buildVersion?: string | null;
  bundleIdentifier?: string | null;
  applicationName?: string | null;
  isEmbeddedLaunch?: boolean | null;
  updateId?: string | null;
  createdAt?: Date | string | null;
  runtimeVersion?: string | null;
  updateChannel?: string | null;
  updatesEnabled?: boolean | null;
  platform?: string | null;
  executionEnvironment?: string | null;
};

type AppDiagnosticsKey = keyof AppDiagnostics;

type AppDiagnosticsField = {
  key: AppDiagnosticsKey;
  label: string;
};

const DEFAULT_VALUE = "n/a";

const toDisplayValue = (value?: string | null) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized.length > 0 ? normalized : DEFAULT_VALUE;
};

const toDateDisplayValue = (value?: Date | string | null) => {
  if (!value) {
    return DEFAULT_VALUE;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return DEFAULT_VALUE;
  }

  return parsed.toISOString();
};

export const APP_DIAGNOSTICS_FIELDS: AppDiagnosticsField[] = [
  { key: "appVersion", label: "App Version" },
  { key: "buildVersion", label: "Build Version" },
  { key: "bundleIdentifier", label: "Bundle Identifier" },
  { key: "applicationName", label: "Application Name" },
  { key: "otaSource", label: "OTA Source" },
  { key: "otaVersion", label: "OTA Version" },
  { key: "otaUpdateId", label: "OTA Update ID" },
  { key: "otaCreatedAt", label: "OTA Created At" },
  { key: "runtimeVersion", label: "Runtime Version" },
  { key: "updateChannel", label: "Update Channel" },
  { key: "updatesEnabled", label: "Updates Enabled" },
  { key: "platform", label: "Platform" },
  { key: "executionEnvironment", label: "Execution Environment" },
];

export const buildAppDiagnostics = (
  input: AppDiagnosticsInput,
): AppDiagnostics => {
  const otaSource: AppDiagnostics["otaSource"] =
    input.isEmbeddedLaunch === false ? "OTA" : "BUILD";

  const runtimeVersion = toDisplayValue(input.runtimeVersion);
  const updateId = toDisplayValue(input.updateId);

  return {
    appVersion: toDisplayValue(input.appVersion),
    buildVersion: toDisplayValue(input.buildVersion),
    bundleIdentifier: toDisplayValue(input.bundleIdentifier),
    applicationName: toDisplayValue(input.applicationName),
    otaSource,
    otaVersion:
      otaSource === "BUILD" ? "embedded" : runtimeVersion !== DEFAULT_VALUE ? runtimeVersion : updateId,
    otaUpdateId: otaSource === "BUILD" ? "embedded" : updateId,
    otaCreatedAt:
      otaSource === "BUILD"
        ? DEFAULT_VALUE
        : toDateDisplayValue(input.createdAt),
    runtimeVersion,
    updateChannel: toDisplayValue(input.updateChannel),
    updatesEnabled:
      typeof input.updatesEnabled === "boolean"
        ? String(input.updatesEnabled)
        : DEFAULT_VALUE,
    platform: toDisplayValue(input.platform),
    executionEnvironment: toDisplayValue(input.executionEnvironment),
  };
};

export const formatAppDiagnosticsForClipboard = (
  diagnostics: AppDiagnostics,
) => {
  return APP_DIAGNOSTICS_FIELDS.map((field) => {
    return `${field.label}: ${diagnostics[field.key]}`;
  }).join("\n");
};
