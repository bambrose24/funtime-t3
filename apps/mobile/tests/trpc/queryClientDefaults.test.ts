import { dehydrate } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/trpc/create-query-client";

describe("createQueryClient defaults", () => {
  it("keeps offline-first queries with retries", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions().queries;

    expect(defaults?.networkMode).toBe("offlineFirst");
    expect(defaults?.retry).toBe(2);
    expect(defaults?.staleTime).toBe(5 * 60 * 1000);
  });

  it("does not auto-retry or queue mutations offline", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions().mutations;

    expect(defaults?.networkMode).toBe("online");
    expect(defaults?.retry).toBe(0);
  });

  it("registers no global mutation onSettled invalidation", () => {
    const client = createQueryClient();
    const mutationCache = client.getMutationCache();

    expect(mutationCache.config.onSettled).toBeUndefined();
    expect(mutationCache.config.onSuccess).toBeUndefined();
  });

  it("dehydrates without mutations when none are configured to persist", () => {
    const client = createQueryClient();
    client.setQueryData(["teams", "getTeams"], [{ teamid: 1 }]);

    const dehydrated = dehydrate(client, {
      shouldDehydrateMutation: () => false,
    });

    expect(dehydrated.queries.length).toBeGreaterThan(0);
    expect(dehydrated.mutations).toEqual([]);
  });
});
