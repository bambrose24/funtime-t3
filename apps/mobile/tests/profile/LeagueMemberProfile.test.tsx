import React from "react";
import { ScrollView } from "react-native";
import { act, render, screen } from "@testing-library/react-native";
import { LeagueMemberProfile } from "@/components/profile/LeagueMemberProfile";

const mockProfileQuery = jest.fn();
const mockRefetchProfile = jest.fn();
const mockRefetchTeams = jest.fn();
jest.mock("@/lib/trpc/react", () => ({
  clientApi: {
    playerProfile: {
      get: { useQuery: (...args: unknown[]) => mockProfileQuery(...args) },
    },
    teams: {
      getTeams: {
        useQuery: () => ({
          data: [],
          isLoading: false,
          refetch: mockRefetchTeams,
        }),
      },
    },
  },
}));
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/lib/useColorScheme", () => ({
  useColorScheme: () => ({ isDarkColorScheme: false }),
}));
jest.mock("@/components/shared/TeamLogo", () => ({ TeamLogo: () => null }));
jest.mock("@/components/league/LeagueTabLoadingSkeleton", () => ({
  LeagueTabLoadingSkeleton: () => null,
}));
const profile = (
  hidden: boolean,
  picks: { winner: number; loser: number; score: number }[] = [],
) => ({
  superbowlPickHidden: hidden,
  correctPicks: 0,
  wrongPicks: 0,
  member: {
    people: { username: "opponent", email: "opponent@example.com" },
    role: "player",
    superbowl: picks,
    WeekWinners: [],
    leaguemessages: [],
  },
});
function query(data: ReturnType<typeof profile>) {
  mockProfileQuery.mockReturnValue({
    data,
    isLoading: false,
    refetch: mockRefetchProfile,
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  mockRefetchProfile.mockResolvedValue(undefined);
  mockRefetchTeams.mockResolvedValue(undefined);
});
test("redacted prediction shows hidden copy instead of claiming no submission", () => {
  query(profile(true));
  render(<LeagueMemberProfile leagueId="1" memberId="2" />);
  expect(
    screen.getByText("Super Bowl picks are hidden until the season starts."),
  ).toBeTruthy();
  expect(screen.queryByText("No Super Bowl pick submitted.")).toBeNull();
  expect(screen.queryByText(/Total Score:/)).toBeNull();
});
test("visible profile with no prediction shows the genuine empty state", () => {
  query(profile(false));
  render(<LeagueMemberProfile leagueId="1" memberId="2" />);
  expect(screen.getByText("No Super Bowl pick submitted.")).toBeTruthy();
});
test("refreshed redacted response removes a previously cached prediction", async () => {
  query(profile(false, [{ winner: 1, loser: 2, score: 57 }]));
  const view = render(<LeagueMemberProfile leagueId="1" memberId="2" />);
  expect(screen.getByText("Total Score: 57")).toBeTruthy();
  await act(async () => {
    await view
      .UNSAFE_getByType(ScrollView)
      .props.refreshControl.props.onRefresh();
  });
  expect(mockRefetchProfile).toHaveBeenCalledTimes(1);
  expect(mockRefetchTeams).toHaveBeenCalledTimes(1);
  query(profile(true));
  view.rerender(<LeagueMemberProfile leagueId="1" memberId="2" />);
  expect(screen.queryByText("Total Score: 57")).toBeNull();
  expect(
    screen.getByText("Super Bowl picks are hidden until the season starts."),
  ).toBeTruthy();
});
