import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ClosedWeekState } from "@/components/picks/ClosedWeekState";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("closed week replaces the form with a closed state and back action", () => {
  render(
    <ClosedWeekState
      week={4}
      deadline={new Date("2026-09-13T17:00:00.000Z")}
      leagueId={42}
    />,
  );

  expect(screen.getByText("Picks are closed for week 4")).toBeTruthy();
  expect(screen.queryByText("Submit Picks")).toBeNull();
  fireEvent.press(screen.getByText("Back to league"));
  expect(mockPush).toHaveBeenCalledWith("/league/42");
});
