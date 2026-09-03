import { pixelBasedPreset, Tailwind } from "react-email";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              background: "hsl(0, 0%, 100%)",
              foreground: "hsl(240, 10%, 3.9%)",
              primary: "hsl(142.1, 76.2%, 36.3%)",
              "primary-foreground": "hsl(355.7, 100%, 97.3%)",
              correct: "hsl(142, 76%, 36%)",
              wrong: "hsl(0, 84%, 60%)",
              warning: "#f59e0b",
              pending: "hsl(217.2, 91.2%, 59.8%)",
              secondary: "hsl(240, 4.8%, 95.9%)",
              "secondary-foreground": "hsl(240, 5.9%, 10%)",
              muted: "hsl(240, 4.8%, 95.9%)",
              "muted-foreground": "hsl(240, 3.8%, 46.1%)",
              destructive: "hsl(0, 84.2%, 60.2%)",
              border: "hsl(240, 5.9%, 90%)",
            },
          },
        },
      }}
    >
      {children}
    </Tailwind>
  );
}
