export function getBaseUrl() {
  if (__DEV__) {
    return "http://localhost:3000";
  }
  return "https://www.play-funtime.com";
}
