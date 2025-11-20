"use client";

import { cn } from "@/lib/utils";
import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import { useState } from "react";

const client = new EventDriver();

type Theme = "light" | "dark" | "system";
type ThemeEvents = {
  "theme:change": { theme: Theme };
};

const THEMES: Array<{ value: Theme; label: string; icon: string }> = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "system", label: "System", icon: "💻" },
];

const THEME_CONFIG = {
  light: {
    icon: "☀️",
    bg: "bg-yellow-50 border-yellow-300 text-yellow-950",
    title: "text-yellow-950",
  },
  dark: {
    icon: "🌙",
    bg: "bg-indigo-950 border-indigo-800 text-indigo-100",
    title: "text-indigo-50",
  },
  system: {
    icon: "💻",
    bg: "bg-purple-50 border-purple-300 text-purple-950 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100",
    title: "text-purple-950 dark:text-purple-50",
  },
} as const;

export default function StateSynchronizationDemo() {
  return (
    <EventProvider client={client}>
      <div className="p-4 border rounded-lg space-y-6">
        <ThemeSwitcher />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThemeAwareCard title="Card 1" />
          <ThemeAwareCard title="Card 2" />
          <ThemeAwareCard title="Card 3" />
        </div>
        <ThemeDisplay />
      </div>
    </EventProvider>
  );
}

function ThemeSwitcher() {
  const trigger = useTriggerEvent<ThemeEvents>();
  const [currentTheme, setCurrentTheme] = useState<Theme>("light");

  const handleChange = (theme: Theme) => {
    setCurrentTheme(theme);
    trigger("theme:change", { theme });
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Theme Switcher</h3>
      <div className="flex gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme.value}
            type="button"
            onClick={() => handleChange(theme.value)}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg border transition-colors",
              currentTheme === theme.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-background hover:bg-muted border-border"
            )}
          >
            <div className="text-2xl mb-1">{theme.icon}</div>
            <div className="text-sm font-medium">{theme.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ThemeAwareCard({ title }: { title: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useMonitorEvent<ThemeEvents>({
    "theme:change": (data) => setTheme(data.theme),
  });

  const config = THEME_CONFIG[theme];

  return (
    <div className={cn("p-6 border-2 rounded-lg transition-colors", config.bg)}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{config.icon}</span>
        <h4 className={cn("font-semibold", config.title)}>{title}</h4>
      </div>
      <p className="text-sm opacity-80">
        Current theme: <span className="font-medium">{theme}</span>
      </p>
      <p className="text-xs mt-2 opacity-60">
        This card automatically updates when the theme changes, without prop drilling!
      </p>
    </div>
  );
}

function ThemeDisplay() {
  const [theme, setTheme] = useState<Theme>("light");
  const [updateCount, setUpdateCount] = useState(0);

  useMonitorEvent<ThemeEvents>({
    "theme:change": (data) => {
      setTheme(data.theme);
      setUpdateCount((prev) => prev + 1);
    },
  });

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">Theme State Monitor</h3>
          <p className="text-sm text-muted-foreground">
            Listening for theme changes across the app
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{updateCount}</div>
          <div className="text-xs text-muted-foreground">updates</div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-muted rounded">
        <div className="text-sm">
          <span className="text-muted-foreground">Current theme:</span>{" "}
          <span className="font-semibold">{theme}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          This component stays in sync with all theme changes, no props needed!
        </div>
      </div>
    </div>
  );
}
