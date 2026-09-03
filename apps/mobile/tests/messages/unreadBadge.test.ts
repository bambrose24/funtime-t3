import { getUnreadBadgeLabel } from "@/lib/messages/unreadBadge";

describe("getUnreadBadgeLabel", () => {
  it.each([
    [0, null],
    [-1, null],
    [1, "1"],
    [99, "99"],
    [100, "99+"],
  ])("formats %s unread messages as %s", (count, expected) => {
    expect(getUnreadBadgeLabel(count)).toBe(expected);
  });
});
