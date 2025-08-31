import { Font, Tailwind } from "@react-email/components";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <Tailwind
      config={{
        theme: {
          colors: {
            background: "hsl(0, 0%, 100%)",
            foreground: "hsl(240, 10%, 3.9%)",
            card: "hsl(0, 0%, 100%)",
            "card-foreground": "hsl(240, 10%, 3.9%)",
            popover: "hsl(0, 0%, 100%)",
            "popover-foreground": "hsl(240, 10%, 3.9%)",
            primary: "hsl(142.1, 76.2%, 36.3%)",
            "primary-foreground": "hsl(355.7, 100%, 97.3%)",
            correct: "hsl(142, 76%, 36%)",
            "correct-foreground": "hsl(240, 10%, 3.9%)",
            wrong: "hsl(0, 84%, 60%)",
            "wrong-foreground": "hsl(240, 10%, 3.9%)",
            warning: "#f59e0b",
            "warning-foreground": "hsl(240, 10%, 3.9%)",
            simulated: "hsl(45.4, 93.4%, 47.5%)",
            "simulated-foreground": "hsl(240, 10%, 3.9%)",
            pending: "hsl(217.2, 91.2%, 59.8%)",
            "pending-foreground": "hsl(240, 10%, 3.9%)",
            secondary: "hsl(240, 4.8%, 95.9%)",
            "secondary-foreground": "hsl(240, 5.9%, 10%)",
            muted: "hsl(240, 4.8%, 95.9%)",
            "muted-foreground": "hsl(240, 3.8%, 46.1%)",
            accent: "hsl(240, 4.8%, 95.9%)",
            "accent-foreground": "hsl(240, 5.9%, 10%)",
            destructive: "hsl(0, 84.2%, 60.2%)",
            "destructive-foreground": "hsl(0, 0%, 98%)",
            border: "hsl(240, 5.9%, 90%)",
            input: "hsl(240, 5.9%, 90%)",
            ring: "hsl(142.1, 76.2%, 36.3%)",
            chart1: "hsl(12, 76%, 61%)",
            chart2: "hsl(173, 58%, 39%)",
            chart3: "hsl(197, 37%, 24%)",
            chart4: "hsl(43, 74%, 66%)",
            chart5: "hsl(27, 87%, 67%)",
          },
          borderRadius: {
            lg: "0.5rem",
            md: "calc(0.5rem - 2px)",
            sm: "calc(0.5rem - 4px)",
          },
        },
      }}
    >
      <Font
        fontFamily="Inter"
        fallbackFontFamily="sans-serif"
        fontWeight={400}
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
