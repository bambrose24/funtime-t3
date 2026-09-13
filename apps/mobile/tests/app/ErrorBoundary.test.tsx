import React from "react";
import { Text } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const mockReportCrash = jest.fn();
jest.mock("@/lib/app/crashReporting", () => ({
  reportCrash: (...args: unknown[]) => mockReportCrash(...args),
}));

function AlwaysBoom(): React.ReactNode {
  throw new Error("boom");
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders fallback when a child throws and reports once", () => {
  render(
    <ErrorBoundary>
      <AlwaysBoom />
    </ErrorBoundary>,
  );

  expect(screen.getByText("Something went wrong")).toBeTruthy();
  expect(mockReportCrash).toHaveBeenCalledTimes(1);
  expect(mockReportCrash.mock.calls[0]?.[0]).toEqual(expect.any(Error));
});

test("retry remounts children after an error", () => {
  let shouldThrow = true;
  function Boom() {
    if (shouldThrow) {
      throw new Error("boom");
    }
    return <Text>Safe child</Text>;
  }

  render(
    <ErrorBoundary
      onBeforeRetry={() => {
        shouldThrow = false;
      }}
    >
      <Boom />
    </ErrorBoundary>,
  );

  expect(screen.getByText("Something went wrong")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "Try again" }));
  expect(screen.getByText("Safe child")).toBeTruthy();
  expect(mockReportCrash).toHaveBeenCalledTimes(1);
});
