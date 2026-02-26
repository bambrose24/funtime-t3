import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { MobileLeaderboardTable } from "@/components/leaderboard/MobileLeaderboardTable";

const mockPush = jest.fn();
const mockUseQuery = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

jest.mock("@/lib/trpc/react", () => ({
  clientApi: {
    session: {
      current: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
    },
  },
}));

const leaderboard = {
  correctCountsSorted: [
    {
      rank: 1,
      correct: 12,
      member: {
        membership_id: 101,
        user_id: "u-1",
        people: { username: "alice" },
      },
    },
    {
      rank: 2,
      correct: 10,
      member: {
        membership_id: 102,
        user_id: "u-2",
        people: { username: "bob" },
      },
    },
    {
      rank: 2,
      correct: 10,
      member: {
        membership_id: 103,
        user_id: "u-3",
        people: { username: "carol" },
      },
    },
  ],
} as any;

describe("MobileLeaderboardTable", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({ data: { dbUser: { uid: "u-1" } } });
  });

  it("shows an empty-state message when leaderboard data is missing", () => {
    render(<MobileLeaderboardTable leaderboard={null} leagueId="42" />);
    expect(screen.getByText("No leaderboard data available")).toBeTruthy();
  });

  it("renders tie ranks and navigates to member profile on press", () => {
    render(<MobileLeaderboardTable leaderboard={leaderboard} leagueId="42" />);

    expect(screen.getByText("alice")).toBeTruthy();
    expect(screen.getAllByText("2")).toHaveLength(2);

    fireEvent.press(screen.getByText("alice"));
    expect(mockPush).toHaveBeenCalledWith("/league/42/player/101");
  });
});
