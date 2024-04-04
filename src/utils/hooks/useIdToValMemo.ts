import { useMemo } from "react";

export function useDictify<T, U extends string | number>(
  vals: Array<T>,
  keyFn: (val: T) => U,
): Map<U, T> {
  return useMemo(() => {
    return vals.reduce((prev, curr) => {
      const key = keyFn(curr);
      prev.set(key, curr);
      return prev;
    }, new Map<U, T>());
  }, [vals, keyFn]);
}
