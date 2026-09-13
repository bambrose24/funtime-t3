import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import {
  getHomeLeagueRowPresentation,
  HomeLeagueCard,
  type HomeLeagueCardData,
  type HomeLeagueWeeklyStatus,
} from "@/components/home/HomeLeagueCard";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

function league(
  overrides: Partial<Omit<HomeLeagueCardData, "weeklyStatus">> & {
    weeklyStatus: HomeLeagueWeeklyStatus;
  },
): HomeLeagueCardData {
  return {
    league_id: 10,
    name: "Sunday Funday",
    season: 2026,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("submitted shows week and View picks", () => {
  render(
    <HomeLeagueCard
      data={league({
        weeklyStatus: { state: "submitted", week: 3 },
      })}
    />,
  );
  expect(screen.getByText("Picks are in")).toBeTruthy();
  expect(screen.getByText("Week 3")).toBeTruthy();
  fireEvent.press(screen.getByText("View picks"));
  expect(mockPush).toHaveBeenCalledWith("/league/10?week=3");
});

test("needed shows Make picks and routes to pick screen", () => {
  render(
    <HomeLeagueCard
      data={league({
        weeklyStatus: { state: "needed", week: 4 },
      })}
    />,
  );
  expect(screen.getByText("Picks needed")).toBeTruthy();
  fireEvent.press(screen.getByText("Make picks"));
  expect(mockPush).toHaveBeenCalledWith("/league/10/pick");
});

test("closed shows closed copy without a pick action", () => {
  render(
    <HomeLeagueCard
      data={league({
        weeklyStatus: { state: "closed", week: 2 },
      })}
    />,
  );
  expect(screen.getByText("Picks not submitted · Closed")).toBeTruthy();
  expect(screen.getByText("Week 2")).toBeTruthy();
  expect(screen.queryByText("Make picks")).toBeNull();
  expect(screen.queryByText("View picks")).toBeNull();
});

test("no_schedule and season_over show context without pick actions", () => {
  const { rerender } = render(
    <HomeLeagueCard
      data={league({
        weeklyStatus: {
          state: "no_schedule",
          week: null,
        } as HomeLeagueWeeklyStatus,
      })}
    />,
  );
  expect(screen.getByText("Waiting for the schedule")).toBeTruthy();
  expect(screen.queryByText("Make picks")).toBeNull();

  rerender(
    <HomeLeagueCard
      data={league({
        weeklyStatus: {
          state: "season_over",
          week: 18,
        } as HomeLeagueWeeklyStatus,
      })}
    />,
  );
  expect(screen.getByText("Season complete")).toBeTruthy();
  expect(screen.queryByText("Make picks")).toBeNull();
});

test("unavailable status never claims picks are in", () => {
  render(
    <HomeLeagueCard
      data={league({
        weeklyStatus: { state: "submitted", week: 1 },
      })}
      statusUnavailable
    />,
  );
  expect(screen.getByText("Status unavailable")).toBeTruthy();
  expect(screen.queryByText("Picks are in")).toBeNull();
  expect(screen.queryByText("View picks")).toBeNull();
});

test("presentation helper never surfaces partial-progress copy", () => {
  const states: HomeLeagueWeeklyStatus[] = [
    { state: "submitted", week: 1 },
    { state: "needed", week: 1 },
    { state: "closed", week: 1 },
    { state: "no_schedule", week: null } as HomeLeagueWeeklyStatus,
    { state: "season_over", week: 18 },
  ];
  for (const status of states) {
    const presentation = getHomeLeagueRowPresentation({
      leagueId: 1,
      status,
      statusUnavailable: false,
    });
    expect(presentation.statusLabel).not.toMatch(/picks left/i);
    expect(presentation.statusLabel).not.toMatch(/picked/i);
    expect(presentation.statusLabel).not.toMatch(/Finish remaining picks/i);
  }
});
