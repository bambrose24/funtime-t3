import { NextResponse } from "next/server";

type AndroidAssetLinkStatement = {
  relation: string[];
  target: {
    namespace: "android_app";
    package_name: string;
    sha256_cert_fingerprints: string[];
  };
};

const parseCsv = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

const readStatements = (): AndroidAssetLinkStatement[] => {
  const raw = process.env.ANDROID_DEEPLINK_TARGETS_JSON?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AndroidAssetLinkStatement[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error("Invalid ANDROID_DEEPLINK_TARGETS_JSON", error);
    }
  }

  const packageName = process.env.ANDROID_DEEPLINK_PACKAGE_NAME?.trim();
  const fingerprints = parseCsv(
    process.env.ANDROID_DEEPLINK_SHA256_CERT_FINGERPRINTS,
  );

  if (!packageName || fingerprints.length === 0) {
    return [];
  }

  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];
};

export async function GET() {
  return NextResponse.json(readStatements(), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
