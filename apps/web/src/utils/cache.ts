import { unstable_cache } from "next/cache";
import { parse, stringify } from "superjson";

export const cache = <T, P extends unknown[]>(
  fn: (...params: P) => Promise<T>,
  keys: Parameters<typeof unstable_cache>[1],
  opts?: Parameters<typeof unstable_cache>[2],
) => {
  const wrap = async (params: unknown[]): Promise<string> => {
    const result = await fn(...(params as P));
    return stringify(result);
  };

  const cachedFn = unstable_cache(wrap, keys, opts);

  return async (...params: P): Promise<T> => {
    const result = await cachedFn(params);
    return parse(result);
  };
};

// uid or email
export function getCoreUserTag(key: number | string) {
  return `coreUser_${key}`;
}
