import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const REQUEST_TIMEOUT_MS = 15_000;

// ESPN rejects Bun's HTTP transport even with matching request headers.
// Keep the cron on Bun, but use Node's native fetch for this request only.
// Inline the dependency-free helper so bundled callers need no companion file.
const NODE_FETCH_SCRIPT = `
const response = await fetch(process.argv[1], {
  signal: AbortSignal.timeout(${REQUEST_TIMEOUT_MS}),
});
const body = await response.text();
process.stdout.write(JSON.stringify({
  status: response.status,
  statusText: response.statusText,
  contentType: response.headers.get("content-type"),
  body,
}));
`;

/** @param {string} url */
export async function fetchEspnWithNode(url) {
  const { stdout } = await execFileAsync(
    "node",
    ["--input-type=module", "-e", NODE_FETCH_SCRIPT, url],
    {
      encoding: "utf8",
      timeout: REQUEST_TIMEOUT_MS + 5_000,
      maxBuffer: 16 * 1024 * 1024,
      // Ensure a wedged child cannot outlive the cron indefinitely.
      killSignal: "SIGKILL",
    },
  );
  const result = JSON.parse(stdout);
  // Preserve HTTP errors and content type for the client's existing validation.
  return new Response(
    [204, 205, 304].includes(result.status) ? null : result.body,
    {
      status: result.status,
      statusText: result.statusText,
      headers: result.contentType ? { "content-type": result.contentType } : {},
    },
  );
}

/** @param {string} url */
export function fetchEspnResponse(url) {
  return process.versions.bun
    ? fetchEspnWithNode(url)
    : fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
}
