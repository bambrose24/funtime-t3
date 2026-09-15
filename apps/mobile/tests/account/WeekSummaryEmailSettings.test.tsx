import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { WeekSummaryEmailSettings } from "@/components/settings/WeekSummaryEmailSettings";

const mockToggle = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("toggle reports the current preference and can be flipped", () => {
  render(
    <WeekSummaryEmailSettings enabled={true} onToggle={mockToggle} />,
  );

  const toggle = screen.getByLabelText("Weekly recap emails");
  expect(toggle.props.value).toBe(true);
  fireEvent(toggle, "valueChange", false);
  expect(mockToggle).toHaveBeenCalledTimes(1);
});

test("toggle is disabled while a save is in flight", () => {
  render(
    <WeekSummaryEmailSettings
      enabled={false}
      isUpdating
      onToggle={mockToggle}
    />,
  );

  const toggle = screen.getByLabelText("Weekly recap emails");
  expect(toggle.props.disabled).toBe(true);
  fireEvent(toggle, "valueChange", true);
  expect(mockToggle).not.toHaveBeenCalled();
});
