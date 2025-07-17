export function getBaseUrl() {
  if (__DEV__) {
    return "http://localhost:3000/api/trpc";
  }
  return "https://www.play-funtime.com/api/trpc";
}
