import AsyncStorage from "@react-native-async-storage/async-storage";

/** Must match the key used by createAsyncStoragePersister in react.tsx. */
export const QUERY_CACHE_STORAGE_KEY = "REACT_QUERY_OFFLINE_CACHE";

export async function removePersistedQueryCache(): Promise<void> {
  await AsyncStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
}
