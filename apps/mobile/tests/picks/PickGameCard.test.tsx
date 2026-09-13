import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { PickGameCard } from "@/components/picks/PickGameCard";

const homeTeam = { teamid: 1, abbrev: "KC" } as any;
const awayTeam = { teamid: 2, abbrev: "BUF" } as any;

const buildGame = (overrides: Record<string, unknown> = {}) =>
  ({
    ts: new Date(Date.now() + 60 * 60 * 1000),
    is_tiebreaker: false,
    awayrecord: "10-7",
    homerecord: "12-5",
    ...overrides,
  }) as any;

describe("PickGameCard", () => {
  it("renders open state and allows selecting a team before kickoff", () => {
    const onTeamSelect = jest.fn();

    render(
      <PickGameCard
        game={buildGame()}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        selectedWinner={null}
        onTeamSelect={onTeamSelect}
        locked={false}
      />,
    );

    expect(screen.getByText("Open")).toBeTruthy();
    fireEvent.press(screen.getByText("BUF"));
    expect(onTeamSelect).toHaveBeenCalledWith(awayTeam.teamid);
  });

  it("renders locked state and prevents team selection when locked", () => {
    const onTeamSelect = jest.fn();

    render(
      <PickGameCard
        game={buildGame()}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        selectedWinner={awayTeam.teamid}
        onTeamSelect={onTeamSelect}
        locked
      />,
    );

    expect(screen.getByText("Locked")).toBeTruthy();
    expect(screen.getByText("Locked at kickoff")).toBeTruthy();
    fireEvent.press(screen.getByText("BUF"));
    expect(onTeamSelect).not.toHaveBeenCalled();
  });
});
