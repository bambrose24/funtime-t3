import { isPickLocked } from "@funtime/api/utils/pickPermissions";
import { getPickWindow } from "@/lib/picks/getPickWindow";

const game = (gid: number, ts: Date, is_tiebreaker = false) => ({
  gid,
  ts,
  is_tiebreaker,
});

describe("getPickWindow", () => {
  const kickoff = new Date("2026-09-13T17:00:00.000Z");
  const later = new Date("2026-09-13T20:00:00.000Z");
  const games = [
    game(1, kickoff, false),
    game(2, later, true),
  ];

  it("keeps everything open before the first kickoff", () => {
    const now = new Date(kickoff.getTime() - 1);
    const window = getPickWindow({
      policy: "close_at_first_game_start",
      games,
      now,
    });
    expect(window.isWeekClosed).toBe(false);
    expect(window.deadline?.getTime()).toBe(kickoff.getTime());
    expect(window.lockedGameIds.size).toBe(0);
    expect(window.isTiebreakerLocked).toBe(false);
  });

  it("closes the week at first kickoff under first-kickoff policy", () => {
    const window = getPickWindow({
      policy: "close_at_first_game_start",
      games,
      now: kickoff,
    });
    expect(window.isWeekClosed).toBe(true);
    expect([...window.lockedGameIds].sort()).toEqual([1, 2]);
    expect(window.isTiebreakerLocked).toBe(true);
  });

  it("locks only started games under per-game policy", () => {
    const between = new Date("2026-09-13T18:00:00.000Z");
    const window = getPickWindow({
      policy: "allow_late_and_lock_after_start",
      games,
      now: between,
    });
    expect(window.isWeekClosed).toBe(false);
    expect(window.deadline).toBeNull();
    expect([...window.lockedGameIds]).toEqual([1]);
    expect(window.isTiebreakerLocked).toBe(false);
  });

  it("locks the tiebreaker once its kickoff arrives under per-game policy", () => {
    const window = getPickWindow({
      policy: null,
      games,
      now: later,
    });
    expect(window.isWeekClosed).toBe(false);
    expect([...window.lockedGameIds].sort()).toEqual([1, 2]);
    expect(window.isTiebreakerLocked).toBe(true);
  });

  it("matches shared inclusive kickoff lock semantics", () => {
    expect(isPickLocked(kickoff, new Date(kickoff.getTime() - 1))).toBe(false);
    expect(isPickLocked(kickoff, kickoff)).toBe(true);
  });
});
