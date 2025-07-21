import * as React from "react";
import { TextInput, TextInputProps } from "react-native";
import { cn } from "~/lib/utils";

type InputProps = TextInputProps & {
  className?: string;
};

function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
        "focus:border-ring focus:outline-none",
        className,
      )}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
