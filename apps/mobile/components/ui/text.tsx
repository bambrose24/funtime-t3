import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Text as RNText } from "react-native";
import { cn } from "~/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

const textVariants = cva("text-base text-foreground web:select-text", {
  variants: {
    variant: {
      default: "",
      destructive: "text-destructive",
      muted: "text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      list: "my-6 ml-6 [&>li]:mt-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type TextProps = React.ComponentProps<typeof RNText> &
  VariantProps<typeof textVariants>;

function Text({ className, variant, ...props }: TextProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <RNText
      className={cn(textVariants({ variant }), textClass, className)}
      {...props}
    />
  );
}

export { Text, TextClassContext, textVariants };
export type { TextProps };
