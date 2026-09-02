export function getUnreadBadgeLabel(unreadCount: number): string | null {
  if (!Number.isFinite(unreadCount) || unreadCount <= 0) {
    return null;
  }

  return unreadCount > 99 ? "99+" : String(Math.floor(unreadCount));
}
