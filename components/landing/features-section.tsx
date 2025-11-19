"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Type, Timer, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Type,
    title: "TypeScript Support",
    description: "Full type safety for event keys and payloads. Define your EventMap and get autocomplete everywhere.",
    badge: "Type-Safe",
  },
  {
    icon: Timer,
    title: "Debounce & Throttle",
    description: "Control event frequency with built-in debounce and throttle support. Perfect for search inputs and scroll handlers.",
    badge: "Performance",
  },
  {
    icon: Zap,
    title: "Async Callbacks",
    description: "Support for async callbacks with await support. Trigger events and wait for all handlers to complete.",
    badge: "Modern",
  },
  {
    icon: Shield,
    title: "Lightweight",
    description: "Tiny bundle size with zero dependencies. Built for performance without sacrificing developer experience.",
    badge: "Fast",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-b bg-background py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Powerful Features
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Everything you need to build decoupled, event-driven React applications.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="relative overflow-hidden">
                <CardHeader>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

