import {
  sanitizeLogMeta,
  syncAnalyticsIdentity,
  type AnalyticsClient,
} from "@/lib/observability/analyticsIdentity";

describe("syncAnalyticsIdentity", () => {
  function fakeClient(): AnalyticsClient & {
    identify: jest.Mock;
    reset: jest.Mock;
  } {
    return {
      identify: jest.fn(),
      reset: jest.fn(),
    };
  }

  it("identifies on sign-in", () => {
    const client = fakeClient();
    syncAnalyticsIdentity({ type: "signed_in", uid: "user-a" }, client);
    expect(client.identify).toHaveBeenCalledWith("user-a");
    expect(client.reset).not.toHaveBeenCalled();
  });

  it("resets then identifies on A-to-B switch", () => {
    const client = fakeClient();
    syncAnalyticsIdentity(
      { type: "switched", previousUid: "user-a", nextUid: "user-b" },
      client,
    );
    expect(client.reset).toHaveBeenCalledTimes(1);
    expect(client.identify).toHaveBeenCalledWith("user-b");
    expect(client.reset.mock.invocationCallOrder[0]).toBeLessThan(
      client.identify.mock.invocationCallOrder[0]!,
    );
  });

  it("resets on sign-out", () => {
    const client = fakeClient();
    syncAnalyticsIdentity(
      { type: "signed_out", previousUid: "user-a" },
      client,
    );
    expect(client.reset).toHaveBeenCalledTimes(1);
    expect(client.identify).not.toHaveBeenCalled();
  });

  it("no-ops for none and missing client", () => {
    const client = fakeClient();
    syncAnalyticsIdentity({ type: "none" }, client);
    syncAnalyticsIdentity({ type: "signed_in", uid: "x" }, null);
    expect(client.identify).not.toHaveBeenCalled();
    expect(client.reset).not.toHaveBeenCalled();
  });
});

describe("sanitizeLogMeta", () => {
  it("redacts sensitive keys and bounds payloads", () => {
    const sanitized = sanitizeLogMeta({
      component: "PickForm",
      email: "a@b.com",
      access_token: "secret",
      note: "x".repeat(600),
      nested: { a: 1 },
    });
    expect(sanitized.email).toBe("[redacted]");
    expect(sanitized.access_token).toBe("[redacted]");
    expect(sanitized.nested).toBe("[omitted]");
    expect(String(sanitized.note).endsWith("…")).toBe(true);
    expect(String(sanitized.note).length).toBeLessThanOrEqual(501);
  });
});
