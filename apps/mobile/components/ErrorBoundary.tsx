import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { reportCrash } from "@/lib/app/crashReporting";

type Props = {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void | Promise<void>;
  onBeforeRetry?: () => void;
};

type State = {
  error: Error | null;
  resetKey: number;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
    resetKey: 0,
  };

  private reportedForError: Error | null = null;

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (this.reportedForError !== error) {
      this.reportedForError = error;
      reportCrash(error, {
        componentStack: info.componentStack,
        source: "error_boundary",
      });
      this.props.onError?.(error, info);
    }
  }

  private handleRetry = () => {
    this.props.onBeforeRetry?.();
    this.reportedForError = null;
    this.setState((prev) => ({
      error: null,
      resetKey: prev.resetKey + 1,
    }));
  };

  private handleReset = async () => {
    try {
      await this.props.onReset?.();
    } finally {
      this.handleRetry();
    }
  };

  render() {
    if (this.state.error) {
      return (
        <View className="bg-app-bg-light dark:bg-app-bg-dark flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-2xl font-bold">
            Something went wrong
          </Text>
          <Text className="mb-6 text-center text-base text-gray-600 dark:text-gray-400">
            The app hit an unexpected error. You can try again, or clear local
            cache if the problem keeps happening.
          </Text>
          <Button onPress={this.handleRetry} className="mb-3 w-full max-w-sm">
            Try again
          </Button>
          {this.props.onReset ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void this.handleReset();
              }}
              className="py-2"
            >
              <Text className="text-center text-sm text-gray-600 underline dark:text-gray-400">
                Clear cache and retry
              </Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
