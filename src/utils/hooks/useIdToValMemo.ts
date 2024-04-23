import { useCallback, useMemo } from "react";

export function useDictify<T, U extends string | number>(
  vals: Array<T>,
  keyFn: (val: T) => U,
): Map<U, T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keyFnCallback = useCallback(keyFn, [vals]);
  return useMemo(() => {
    return vals.reduce((prev, curr) => {
      const key = keyFnCallback(curr);
      prev.set(key, curr);
      return prev;
    }, new Map<U, T>());
  }, [vals, keyFnCallback]);
}
