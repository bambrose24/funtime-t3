const JOIN_PATH_MARKER = "/join-league/";
const WEB_PROTOCOLS = new Set(["http", "https"]);

const sanitizeLeagueCode = (value: string) => {
  const withoutHash = value.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  const firstPathSegment = withoutQuery.split("/")[0] ?? "";
  const decoded = decodeURIComponent(firstPathSegment.trim());
  return decoded.replace(/^\/+/, "").replace(/\/+$/, "");
};

const extractFromJoinPath = (path: string) => {
  const normalizedPath = path.replace(/^\/--\//, "/");
  const markerIndex = normalizedPath.toLowerCase().lastIndexOf(JOIN_PATH_MARKER);
  if (markerIndex < 0) {
    return null;
  }

  const candidate = normalizedPath.slice(markerIndex + JOIN_PATH_MARKER.length);
  const code = sanitizeLeagueCode(candidate);
  return code.length > 0 ? code : null;
};

const extractFromParsedUrl = (input: string, base?: string) => {
  const parsed = base ? new URL(input, base) : new URL(input);
  const protocol = parsed.protocol.replace(":", "").toLowerCase();
  const path =
    !WEB_PROTOCOLS.has(protocol) && parsed.hostname
      ? `/${parsed.hostname}${parsed.pathname}`
      : parsed.pathname;

  const fromPath = extractFromJoinPath(path);
  if (fromPath) {
    return fromPath;
  }

  if (path.replace(/^\/--\//, "/").toLowerCase() === "/join-league") {
    const queryCode = parsed.searchParams.get("code");
    if (queryCode) {
      return sanitizeLeagueCode(queryCode);
    }
  }

  return null;
};

export function extractLeagueCode(rawInput: string) {
  const input = rawInput.trim();
  if (!input) {
    return "";
  }

  const directJoinPathCode = extractFromJoinPath(input);
  if (directJoinPathCode) {
    return directJoinPathCode;
  }

  try {
    const urlCode = extractFromParsedUrl(input);
    if (urlCode) {
      return urlCode;
    }
  } catch {
    // Fall through to relative URL parsing / plain-code fallback.
  }

  if (input.startsWith("/")) {
    try {
      const relativeUrlCode = extractFromParsedUrl(input, "https://play-funtime.com");
      if (relativeUrlCode) {
        return relativeUrlCode;
      }
    } catch {
      // Fall through to plain-code fallback.
    }
  }

  return sanitizeLeagueCode(input);
}
