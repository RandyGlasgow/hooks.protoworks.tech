"use client";

import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AppEvents = {
  "analytics.track": {
    event: string;
    properties?: Record<string, any>;
  };
};

const client = new EventDriver();

function Navigation() {
  const trigger = useTriggerEvent<AppEvents>();

  const handleNavClick = (page: string) => {
    trigger("analytics.track", {
      event: "navigation_click",
      properties: { page },
    });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleNavClick("home")} variant="outline" size="sm">
        Home
      </Button>
      <Button onClick={() => handleNavClick("products")} variant="outline" size="sm">
        Products
      </Button>
      <Button onClick={() => handleNavClick("about")} variant="outline" size="sm">
        About
      </Button>
    </div>
  );
}

function ProductCard() {
  const trigger = useTriggerEvent<AppEvents>();

  const handleView = (productId: string) => {
    trigger("analytics.track", {
      event: "product_view",
      properties: { productId },
    });
  };

  const handleAddToCart = (productId: string) => {
    trigger("analytics.track", {
      event: "add_to_cart",
      properties: { productId },
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-2">Product Name</h3>
        <div className="flex gap-2">
          <Button onClick={() => handleView("123")} size="sm">
            View
          </Button>
          <Button onClick={() => handleAddToCart("123")} size="sm" variant="outline">
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsService() {
  const [events, setEvents] = useState<Array<{ event: string; properties?: Record<string, any> }>>([]);

  useMonitorEvent<AppEvents>({
    "analytics.track": (data: AppEvents["analytics.track"]) => {
      setEvents((prev) => [...prev.slice(-4), data]);
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold mb-2">Analytics Events</div>
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-sm text-muted-foreground">No events yet</div>
          ) : (
            events.map((event, i) => (
              <div key={i} className="text-sm">
                <Badge variant="secondary" className="mr-2">{event.event}</Badge>
                <span className="text-muted-foreground">
                  {JSON.stringify(event.properties)}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDemo() {
  const eventDriver = useMemo(() => new EventDriver(), []);

  return (
    <EventProvider client={eventDriver}>
      <div className="space-y-4">
        <Navigation />
        <ProductCard />
        <AnalyticsService />
      </div>
    </EventProvider>
  );
}

