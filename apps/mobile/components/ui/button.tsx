import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable } from "react-native";
import { Text, TextClassContext } from "./text";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "flex flex-row items-center justify-center rounded-full web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary shadow active:bg-primary/90",
        destructive: "bg-destructive shadow-sm active:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm active:bg-accent active:text-accent-foreground",
        secondary: "bg-secondary shadow-sm active:bg-secondary/80",
        ghost: "active:bg-accent active:text-accent-foreground",
        link: "web:underline-offset-4 web:hover:underline web:focus:underline",
      },
      size: {
        default: "h-10 px-4 py-2 native:h-12 native:px-5 native:py-3",
        sm: "h-8 px-3 text-xs native:h-10 native:px-4",
        lg: "h-10 px-8 native:h-14",
        icon: "h-9 w-9 native:h-12 native:w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva(
  "web:whitespace-nowrap text-sm native:text-base font-medium text-foreground web:transition-colors",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-foreground",
        secondary: "text-secondary-foreground",
        ghost: "text-foreground",
        link: "text-primary",
      },
      size: {
        default: "",
        sm: "",
        lg: "native:text-lg",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode;
    "data-active"?: boolean;
    disablePressEffect?: boolean;
  };

function Button({ className, variant, size, children, disablePressEffect = false, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider
      value={cn(
        props.disabled && "web:pointer-events-none",
        buttonTextVariants({ variant, size }),
      )}
    >
      <Pressable
        className={cn(
          props.disabled && "web:pointer-events-none opacity-50",
          buttonVariants({ variant, size, className }),
        )}
        role="button"
        style={({ pressed }) => [
          !disablePressEffect && pressed && { transform: [{ scale: 0.95 }] },
        ]}
        {...props}
      >
        {typeof children === "string" ? <Text>{children}</Text> : children}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
