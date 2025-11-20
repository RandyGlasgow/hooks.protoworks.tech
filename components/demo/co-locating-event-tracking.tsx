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

type AnalyticsEvents = {
  "analytics:user-logged-in": { method: string; userId?: string };
  "analytics:cart-item-added": { productId: string; quantity: number };
  "analytics:checkout-started": { cartValue: number };
};

type LogEntry = {
  id: string;
  event: string;
  data: unknown;
  time: string;
};

export default function CoLocatingEventTrackingDemo() {
  return (
    <EventProvider client={client}>
      <div className="p-4 border rounded-lg space-y-6">
        <div className="flex flex-wrap gap-3">
          <LoginButton />
          <AddToCartButton />
          <CheckoutButton />
        </div>
        <AnalyticsTracker />
      </div>
    </EventProvider>
  );
}

function AnalyticsTracker() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const track = (event: string, data: unknown) => {
    setLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        event,
        data,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  useMonitorEvent<AnalyticsEvents>({
    "analytics:user-logged-in": (data) => track("user-logged-in", data),
    "analytics:cart-item-added": (data) => track("cart-item-added", data),
    "analytics:checkout-started": (data) => track("checkout-started", data),
  });

  return (
    <div className="shadow-inner p-4 rounded-lg border bg-card">
      <div className="text-sm font-semibold text-muted-foreground mb-2">
        Analytics Tracker
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        All events handled centrally — no analytics imports needed in components
      </div>
      {logs.length === 0 ? (
        <div className="text-sm text-muted-foreground italic">
          Click buttons above to trigger events...
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="text-sm p-3 rounded border bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-blue-600">{log.event}</span>
                <span className="text-xs text-muted-foreground">{log.time}</span>
              </div>
              <pre className="text-xs font-mono bg-background p-2 rounded mt-1 overflow-x-auto">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoginButton() {
  const trigger = useTriggerEvent<AnalyticsEvents>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleClick = () => {
    const method = ["email", "google", "github"][Math.floor(Math.random() * 3)];
    const userId = `user-${Math.floor(Math.random() * 10000)}`;

    trigger("analytics:user-logged-in", { method, userId });
    setIsLoggedIn(true);
    setTimeout(() => setIsLoggedIn(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoggedIn}
      className={cn(
        "px-4 py-2 rounded transition-colors text-white",
        isLoggedIn ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
      )}
    >
      {isLoggedIn ? "✓ Logged In" : "Login"}
    </button>
  );
}

function AddToCartButton() {
  const trigger = useTriggerEvent<AnalyticsEvents>();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    const products = ["prod-123", "prod-456", "prod-789"];
    const productId = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;

    trigger("analytics:cart-item-added", { productId, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={added}
      className={cn(
        "px-4 py-2 rounded transition-colors text-white",
        added ? "bg-green-600" : "bg-purple-600 hover:bg-purple-700"
      )}
    >
      {added ? "✓ Added to Cart" : "Add to Cart"}
    </button>
  );
}

function CheckoutButton() {
  const trigger = useTriggerEvent<AnalyticsEvents>();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleClick = () => {
    const cartValue = Math.floor(Math.random() * 500) + 50;
    trigger("analytics:checkout-started", { cartValue });
    setCheckingOut(true);
    setTimeout(() => setCheckingOut(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={checkingOut}
      className={cn(
        "px-4 py-2 rounded transition-colors text-white",
        checkingOut ? "bg-green-600" : "bg-orange-600 hover:bg-orange-700"
      )}
    >
      {checkingOut ? "Processing..." : "Checkout"}
    </button>
  );
}
