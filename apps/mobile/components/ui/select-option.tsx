import * as React from "react";
import { TouchableOpacity } from "react-native";
import { Text } from "./text";
import { cn } from "~/lib/utils";

type SelectOptionProps = React.ComponentProps<typeof TouchableOpacity> & {
  children?: React.ReactNode;
  selected?: boolean;
};

function SelectOption({
  className,
  selected = false,
  children,
  ...props
}: SelectOptionProps) {
  return (
    <TouchableOpacity
      className={cn(
        "flex flex-row items-center justify-center rounded-md border-2",
        // Base styles
        "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800",
        // Selected state
        selected && "border-primary bg-primary/10 dark:bg-primary/20",
        className,
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(
            "text-base font-semibold text-gray-900 dark:text-gray-100",
            selected && "text-primary dark:text-primary",
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export { SelectOption };
export type { SelectOptionProps };
