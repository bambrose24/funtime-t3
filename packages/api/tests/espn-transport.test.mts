import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import test from "node:test";

import {
  fetchEspnResponse,
  fetchEspnWithNode,
} from "../server/services/espn/transport.mjs";

test("ESPN transport preserves data and failures through the Node helper", async (t) => {
  const server = createServer((req, res) => {
    if (req.url === "/disconnect") {
      req.socket.destroy();
      return;
    }
    if (req.url === "/denied") {
      res.writeHead(403, { "content-type": "text/html" });
      res.end("<h1>Access Denied</h1>");
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        userAgent: req.headers["user-agent"],
        // Exceeds execFile's default buffer; season responses can be large.
        payload: "x".repeat(2 * 1024 * 1024),
      }),
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;

  // The helper must handle full-season payloads and use Node's transport.
  {
    const response = await fetchEspnWithNode(base);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.userAgent, "node");
    assert.equal(data.payload.length, 2 * 1024 * 1024);
  }
  // Exercise runtime routing under both Node and Bun.
  {
    const response = await fetchEspnResponse(base);
    assert.equal((await response.json()).userAgent, "node");
  }
  // HTTP failures must reach the existing ESPNResponseError validation.
  {
    const response = await fetchEspnWithNode(`${base}/denied`);
    assert.equal(response.ok, false);
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("content-type"), "text/html");
    assert.equal(await response.text(), "<h1>Access Denied</h1>");
  }
  // Transport failures must reject rather than return empty game data.
  {
    await assert.rejects(fetchEspnWithNode(`${base}/disconnect`));
  }
});
