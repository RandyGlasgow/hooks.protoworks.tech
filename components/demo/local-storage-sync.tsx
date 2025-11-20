"use client";

import { cn } from "@/lib/utils";
import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import { useEffect, useState } from "react";

const client = new EventDriver();

type StorageEvents = {
  "storage:change": { key: string; value: string | null; source: "local" | "cross-tab" };
};

type UserPreferences = {
  name: string;
  theme: "light" | "dark" | "auto";
  language: "en" | "es" | "fr" | "de";
};

const STORAGE_KEY = "user-preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  name: "",
  theme: "auto",
  language: "en",
};

// Storage Manager Component - Bridges localStorage and event bus
function StorageManager() {
  const trigger = useTriggerEvent<StorageEvents>();

  useEffect(() => {
    // Listen to browser's storage event for cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== e.oldValue) {
        trigger("storage:change", {
          key: e.key,
          value: e.newValue,
          source: "cross-tab",
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [trigger]);

  return null;
}

export default function LocalStorageSyncDemo() {
  return (
    <EventProvider client={client}>
      <StorageManager />
      <div className="p-4 border rounded-lg space-y-6">
        <UserPreferencesEditor />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PreferencesDisplay title="Profile Card" />
          <PreferencesDisplay title="Settings Panel" />
        </div>
        <StorageMonitor />
      </div>
    </EventProvider>
  );
}

function UserPreferencesEditor() {
  const trigger = useTriggerEvent<StorageEvents>();
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    const serialized = JSON.stringify(updated);
    localStorage.setItem(STORAGE_KEY, serialized);
    trigger("storage:change", {
      key: STORAGE_KEY,
      value: serialized,
      source: "local",
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Edit Preferences</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={preferences.name}
            onChange={(e) => updatePreference("name", e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="flex gap-2">
            {(["light", "dark", "auto"] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => updatePreference("theme", theme)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg border transition-colors capitalize",
                  preferences.theme === theme
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-background hover:bg-muted border-border"
                )}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={preferences.language}
            onChange={(e) =>
              updatePreference("language", e.target.value as UserPreferences["language"])
            }
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Changes are saved to localStorage and synchronized across all components and browser tabs
          </p>
        </div>
      </div>
    </div>
  );
}

function PreferencesDisplay({ title }: { title: string }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [lastUpdateSource, setLastUpdateSource] = useState<"local" | "cross-tab" | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  useMonitorEvent<StorageEvents>({
    "storage:change": (data: { key: string; value: string | null; source: "local" | "cross-tab" }) => {
      if (data.key === STORAGE_KEY) {
        try {
          const parsed = data.value ? JSON.parse(data.value) : DEFAULT_PREFERENCES;
          setPreferences(parsed);
          setLastUpdateSource(data.source);
          setUpdateCount((prev) => prev + 1);
        } catch {
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
    },
  });

  // Load initial value from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPreferences(parsed);
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  const themeColors = {
    light: "bg-yellow-50 border-yellow-300 text-yellow-950",
    dark: "bg-indigo-950 border-indigo-800 text-indigo-100",
    auto: "bg-purple-50 border-purple-300 text-purple-950 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100",
  };

  const languageNames = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
  };

  return (
    <div className={cn("p-6 border-2 rounded-lg transition-colors", themeColors[preferences.theme])}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg">{title}</h4>
        {lastUpdateSource && (
          <div
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              lastUpdateSource === "cross-tab"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            )}
          >
            {lastUpdateSource === "cross-tab" ? "🌐 Cross-tab" : "💾 Local"}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-sm opacity-80">Name:</span>{" "}
          <span className="font-semibold">{preferences.name || "Not set"}</span>
        </div>
        <div>
          <span className="text-sm opacity-80">Theme:</span>{" "}
          <span className="font-semibold capitalize">{preferences.theme}</span>
        </div>
        <div>
          <span className="text-sm opacity-80">Language:</span>{" "}
          <span className="font-semibold">{languageNames[preferences.language]}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-current/20">
        <div className="flex items-center justify-between text-xs opacity-60">
          <span>Updates received: {updateCount}</span>
          <span>Listening to storage events</span>
        </div>
      </div>
    </div>
  );
}

function StorageMonitor() {
  const [storageValue, setStorageValue] = useState<string | null>(null);
  const [changeHistory, setChangeHistory] = useState<
    Array<{ key: string; value: string | null; source: "local" | "cross-tab"; time: string }>
  >([]);

  useMonitorEvent<StorageEvents>({
    "storage:change": (data: { key: string; value: string | null; source: "local" | "cross-tab" }) => {
      setStorageValue(data.value);
      setChangeHistory((prev) => [
        {
          key: data.key,
          value: data.value,
          source: data.source,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    },
  });

  // Load initial value
  useEffect(() => {
    if (typeof window !== "undefined") {
      setStorageValue(localStorage.getItem(STORAGE_KEY));
    }
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold mb-1">Storage Monitor</h3>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of localStorage changes
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{changeHistory.length}</div>
          <div className="text-xs text-muted-foreground">changes</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-muted rounded">
          <div className="text-xs text-muted-foreground mb-1">Current Storage Value:</div>
          <pre className="text-xs font-mono bg-background p-2 rounded overflow-x-auto">
            {storageValue ? JSON.stringify(JSON.parse(storageValue), null, 2) : "null"}
          </pre>
        </div>

        {changeHistory.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Change History:
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {changeHistory.map((change, index) => (
                <div
                  key={index}
                  className="text-xs p-2 rounded border bg-muted/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        change.source === "cross-tab"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      )}
                    >
                      {change.source === "cross-tab" ? "🌐 Cross-tab" : "💾 Local"}
                    </span>
                    <span className="text-muted-foreground">{change.time}</span>
                  </div>
                  <span className="font-mono text-xs">{change.key}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {changeHistory.length === 0 && (
          <div className="text-sm text-muted-foreground italic text-center py-4">
            Make changes above to see storage events...
          </div>
        )}
      </div>
    </div>
  );
}

