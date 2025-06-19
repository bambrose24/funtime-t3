import { Font, Tailwind } from "@react-email/components";
import config from "../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

export function Provider({ children }: { children: React.ReactNode }) {
  const fullConfig = resolveConfig(config);
  return (
    <Tailwind
      config={{
        theme: {
          ...fullConfig.theme, // Include the full resolved theme
          colors: {
            ...fullConfig.theme?.colors, // Include default Tailwind colors
            background: "hsl(0, 0%, 100%)", // --background
            foreground: "hsl(240, 10%, 3.9%)", // --foreground
            card: "hsl(0, 0%, 100%)", // --card
            "card-foreground": "hsl(240, 10%, 3.9%)", // --card-foreground
            popover: "hsl(0, 0%, 100%)", // --popover
            "popover-foreground": "hsl(240, 10%, 3.9%)", // --popover-foreground
            primary: "hsl(142.1, 76.2%, 36.3%)", // --primary
            "primary-foreground": "hsl(355.7, 100%, 97.3%)", // --primary-foreground
            correct: "hsl(142, 76%, 36%)", // --correct
            "correct-foreground": "hsl(240, 10%, 3.9%)", // --correct-foreground
            wrong: "hsl(0, 84%, 60%)", // --wrong
            "wrong-foreground": "hsl(240, 10%, 3.9%)", // --wrong-foreground
            warning: "#f59e0b", // --warning
            "warning-foreground": "hsl(240, 10%, 3.9%)", // --warning-foreground
            simulated: "hsl(45.4, 93.4%, 47.5%)", // --simulated
            "simulated-foreground": "hsl(240, 10%, 3.9%)", // --simulated-foreground
            pending: "hsl(217.2, 91.2%, 59.8%)", // --pending
            "pending-foreground": "hsl(240, 10%, 3.9%)", // --pending-foreground
            secondary: "hsl(240, 4.8%, 95.9%)", // --secondary
            "secondary-foreground": "hsl(240, 5.9%, 10%)", // --secondary-foreground
            muted: "hsl(240, 4.8%, 95.9%)", // --muted
            "muted-foreground": "hsl(240, 3.8%, 46.1%)", // --muted-foreground
            accent: "hsl(240, 4.8%, 95.9%)", // --accent
            "accent-foreground": "hsl(240, 5.9%, 10%)", // --accent-foreground
            destructive: "hsl(0, 84.2%, 60.2%)", // --destructive
            "destructive-foreground": "hsl(0, 0%, 98%)", // --destructive-foreground
            border: "hsl(240, 5.9%, 90%)", // --border
            input: "hsl(240, 5.9%, 90%)", // --input
            ring: "hsl(142.1, 76.2%, 36.3%)", // --ring
            chart1: "hsl(12, 76%, 61%)", // --chart-1
            chart2: "hsl(173, 58%, 39%)", // --chart-2
            chart3: "hsl(197, 37%, 24%)", // --chart-3
            chart4: "hsl(43, 74%, 66%)", // --chart-4
            chart5: "hsl(27, 87%, 67%)", // --chart-5
          },
          borderRadius: {
            ...fullConfig.theme?.borderRadius, // Include default border radius
            lg: "0.5rem", // --radius
            md: "calc(0.5rem - 2px)", // derived from --radius
            sm: "calc(0.5rem - 4px)", // derived from --radius
          },
          extend: {
            keyframes: {
              ...fullConfig.theme?.keyframes, // Include default keyframes
              "accordion-down": {
                from: { height: "0" },
                to: { height: "var(--radix-accordion-content-height)" },
              },
              "accordion-up": {
                from: { height: "var(--radix-accordion-content-height)" },
                to: { height: "0" },
              },
            },
            animation: {
              ...fullConfig.theme?.animation, // Include default animations
              "accordion-down": "accordion-down 0.2s ease-out",
              "accordion-up": "accordion-up 0.2s ease-out",
            },
          },
        },
      }}
    >
      <Font
        fontFamily="Inter"
        fallbackFontFamily="sans-serif"
        fontWeight={400} // You can adjust this if needed (e.g., 500, 600, 700 for other weights)
        fontStyle="normal"
        webFont={{
          url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
          format: "woff2",
        }}
      />
      {children}
    </Tailwind>
  );
}
