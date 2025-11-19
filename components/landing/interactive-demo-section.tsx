"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/registry/magicui/animated-beam";
import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import {
  BarChart3,
  Bell,
  Database,
  FileText,
  RefreshCw,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { forwardRef, useMemo, useRef, useState } from "react";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; label?: string }
>(({ className, children, label }, ref) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        className={cn(
          "relative z-20 flex size-16 items-center justify-center rounded-full border-2 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
          className
        )}
      >
        {children}
      </div>
      {label && (
        <div className="text-center">
          <div className="text-xs font-semibold">{label}</div>
        </div>
      )}
    </div>
  );
});

Circle.displayName = "Circle";

type EventLog = {
  id: string;
  event: string;
  timestamp: number;
};

// Trigger Components
function TriggerButton({
  eventName,
  label,
  icon: Icon,
  onTrigger,
}: {
  eventName: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onTrigger: () => void;
}) {
  const trigger = useTriggerEvent();

  const handleClick = () => {
    trigger(eventName, { timestamp: Date.now() });
    onTrigger();
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full justify-start"
    >
      <Icon className="mr-2 size-4" />
      Trigger {label}
    </Button>
  );
}

// Monitor Components
function MonitorCircle({
  eventNames,
  label,
  icon: Icon,
  className,
  monitorRef,
  onEventReceived,
}: {
  eventNames: string[];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  monitorRef: React.RefObject<HTMLDivElement>;
  onEventReceived: (eventName: string) => void;
}) {
  useMonitorEvent(
    eventNames.reduce((acc, eventName) => {
      acc[eventName] = () => {
        onEventReceived(eventName);
      };
      return acc;
    }, {} as Record<string, () => void>)
  );

  return (
    <Circle ref={monitorRef} className={className} label={label}>
      <Icon className="size-5" />
    </Circle>
  );
}

// Main Demo Component
function EventBusDemo({
  containerRef,
  trigger1Ref,
  trigger2Ref,
  trigger3Ref,
  monitor1Ref,
  monitor2Ref,
  monitor3Ref,
  monitor4Ref,
  monitor5Ref,
  activeBeams,
  setEventLogs,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  trigger1Ref: React.RefObject<HTMLDivElement>;
  trigger2Ref: React.RefObject<HTMLDivElement>;
  trigger3Ref: React.RefObject<HTMLDivElement>;
  monitor1Ref: React.RefObject<HTMLDivElement>;
  monitor2Ref: React.RefObject<HTMLDivElement>;
  monitor3Ref: React.RefObject<HTMLDivElement>;
  monitor4Ref: React.RefObject<HTMLDivElement>;
  monitor5Ref: React.RefObject<HTMLDivElement>;
  activeBeams: Set<string>;
  setEventLogs: React.Dispatch<React.SetStateAction<EventLog[]>>;
}) {
  const handleEventReceived = (eventName: string) => {
    setEventLogs((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          event: eventName,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 10)
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-[750px] w-full items-center justify-between overflow-hidden rounded-lg border bg-background p-4 sm:p-8"
    >
      {/* Trigger Side */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="mb-4 text-sm font-semibold text-muted-foreground">
            Triggers
          </div>
          <div className="flex flex-col gap-6">
            <Circle
              ref={trigger1Ref}
              className="border-blue-500 bg-blue-100 dark:bg-blue-900"
              label="User Action"
            >
              <Zap className="size-6 text-blue-500" />
            </Circle>
            <Circle
              ref={trigger2Ref}
              className="border-green-500 bg-green-100 dark:bg-green-900"
              label="Cart Update"
            >
              <ShoppingCart className="size-6 text-green-500" />
            </Circle>
            <Circle
              ref={trigger3Ref}
              className="border-purple-500 bg-purple-100 dark:bg-purple-900"
              label="Notification"
            >
              <Bell className="size-6 text-purple-500" />
            </Circle>
          </div>
        </div>
      </div>

      {/* Monitor Side */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="mb-6 text-sm font-semibold text-muted-foreground">
            Monitors
          </div>
          <div className="flex flex-col gap-12">
            <MonitorCircle
              monitorRef={monitor1Ref}
              eventNames={["user-action", "notification"]}
              className="border-blue-500 bg-blue-100 dark:bg-blue-900"
              label="Analytics"
              icon={BarChart3}
              onEventReceived={handleEventReceived}
            />
            <MonitorCircle
              monitorRef={monitor2Ref}
              eventNames={["user-action", "cart-update"]}
              className="border-green-500 bg-green-100 dark:bg-green-900"
              label="UI Update"
              icon={RefreshCw}
              onEventReceived={handleEventReceived}
            />
            <MonitorCircle
              monitorRef={monitor3Ref}
              eventNames={["cart-update", "notification"]}
              className="border-purple-500 bg-purple-100 dark:bg-purple-900"
              label="Toast"
              icon={Bell}
              onEventReceived={handleEventReceived}
            />
            <MonitorCircle
              monitorRef={monitor4Ref}
              eventNames={["user-action", "notification"]}
              className="border-orange-500 bg-orange-100 dark:bg-orange-900"
              label="Logger"
              icon={FileText}
              onEventReceived={handleEventReceived}
            />
            <MonitorCircle
              monitorRef={monitor5Ref}
              eventNames={["cart-update", "notification"]}
              className="border-cyan-500 bg-cyan-100 dark:bg-cyan-900"
              label="Cache"
              icon={Database}
              onEventReceived={handleEventReceived}
            />
          </div>
        </div>
      </div>

      {/* Animated Beams - One trigger can connect to multiple monitors */}
      {activeBeams.has("user-action") && (
        <>
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger1Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor1Ref as React.RefObject<HTMLElement | null>}
            curvature={-50}
            duration={2}
            pathColor="hsl(217 91% 60%)"
            gradientStartColor="#3b82f6"
            gradientStopColor="#3b82f6"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger1Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor2Ref as React.RefObject<HTMLElement | null>}
            curvature={-30}
            duration={2}
            pathColor="hsl(217 91% 60%)"
            gradientStartColor="#3b82f6"
            gradientStopColor="#3b82f6"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger1Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor4Ref as React.RefObject<HTMLElement | null>}
            curvature={0}
            duration={2}
            pathColor="hsl(217 91% 60%)"
            gradientStartColor="#3b82f6"
            gradientStopColor="#3b82f6"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
        </>
      )}
      {activeBeams.has("cart-update") && (
        <>
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger2Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor2Ref as React.RefObject<HTMLElement | null>}
            curvature={-20}
            duration={2}
            pathColor="hsl(142 76% 36%)"
            gradientStartColor="#22c55e"
            gradientStopColor="#22c55e"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger2Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor3Ref as React.RefObject<HTMLElement | null>}
            curvature={0}
            duration={2}
            pathColor="hsl(142 76% 36%)"
            gradientStartColor="#22c55e"
            gradientStopColor="#22c55e"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger2Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor5Ref as React.RefObject<HTMLElement | null>}
            curvature={20}
            duration={2}
            pathColor="hsl(142 76% 36%)"
            gradientStartColor="#22c55e"
            gradientStopColor="#22c55e"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
        </>
      )}
      {activeBeams.has("notification") && (
        <>
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger3Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor3Ref as React.RefObject<HTMLElement | null>}
            curvature={20}
            duration={2}
            pathColor="hsl(271 91% 65%)"
            gradientStartColor="#a855f7"
            gradientStopColor="#a855f7"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger3Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor1Ref as React.RefObject<HTMLElement | null>}
            curvature={50}
            duration={2}
            pathColor="hsl(271 91% 65%)"
            gradientStartColor="#a855f7"
            gradientStopColor="#a855f7"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger3Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor4Ref as React.RefObject<HTMLElement | null>}
            curvature={0}
            duration={2}
            pathColor="hsl(271 91% 65%)"
            gradientStartColor="#a855f7"
            gradientStopColor="#a855f7"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement | null>}
            fromRef={trigger3Ref as React.RefObject<HTMLElement | null>}
            toRef={monitor5Ref as React.RefObject<HTMLElement | null>}
            curvature={-20}
            duration={2}
            pathColor="hsl(271 91% 65%)"
            gradientStartColor="#a855f7"
            gradientStopColor="#a855f7"
            startYOffset={0}
            endYOffset={0}
            className="z-0"
          />
        </>
      )}
    </div>
  );
}

export function InteractiveDemoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trigger1Ref = useRef<HTMLDivElement>(null);
  const trigger2Ref = useRef<HTMLDivElement>(null);
  const trigger3Ref = useRef<HTMLDivElement>(null);
  const monitor1Ref = useRef<HTMLDivElement>(null);
  const monitor2Ref = useRef<HTMLDivElement>(null);
  const monitor3Ref = useRef<HTMLDivElement>(null);
  const monitor4Ref = useRef<HTMLDivElement>(null);
  const monitor5Ref = useRef<HTMLDivElement>(null);

  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [activeBeams, setActiveBeams] = useState<Set<string>>(new Set());

  // Create EventDriver instance
  const eventDriver = useMemo(() => new EventDriver(), []);

  const handleTrigger = (eventName: string) => {
    // Show beam animation
    setActiveBeams((prev) => new Set(prev).add(eventName));
    setTimeout(() => {
      setActiveBeams((prev) => {
        const next = new Set(prev);
        next.delete(eventName);
        return next;
      });
    }, 2000);
  };

  return (
    <section className="border-b bg-muted/30 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            See It In Action
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Watch events flow between components in real-time. Click the buttons
            to trigger events and see them propagate through the event bus.
          </p>
        </div>

        <EventProvider client={eventDriver}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Demo Visualization */}
            <Card className="border-dashed shadow-inner">
              <CardHeader>
                <CardTitle>Event Bus Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <EventBusDemo
                  containerRef={containerRef as React.RefObject<HTMLDivElement>}
                  trigger1Ref={trigger1Ref as React.RefObject<HTMLDivElement>}
                  trigger2Ref={trigger2Ref as React.RefObject<HTMLDivElement>}
                  trigger3Ref={trigger3Ref as React.RefObject<HTMLDivElement>}
                  monitor1Ref={monitor1Ref as React.RefObject<HTMLDivElement>}
                  monitor2Ref={monitor2Ref as React.RefObject<HTMLDivElement>}
                  monitor3Ref={monitor3Ref as React.RefObject<HTMLDivElement>}
                  monitor4Ref={monitor4Ref as React.RefObject<HTMLDivElement>}
                  monitor5Ref={monitor5Ref as React.RefObject<HTMLDivElement>}
                  activeBeams={activeBeams}
                  setEventLogs={setEventLogs}
                />
              </CardContent>
            </Card>

            {/* Controls and Event Log */}
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trigger Events</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <TriggerButton
                    eventName="user-action"
                    label="User Action Event"
                    icon={Zap}
                    onTrigger={() => handleTrigger("user-action")}
                  />
                  <TriggerButton
                    eventName="cart-update"
                    label="Cart Update Event"
                    icon={ShoppingCart}
                    onTrigger={() => handleTrigger("cart-update")}
                  />
                  <TriggerButton
                    eventName="notification"
                    label="Notification Event"
                    icon={Bell}
                    onTrigger={() => handleTrigger("notification")}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto">
                    {eventLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No events triggered yet. Click a button above to trigger
                        an event.
                      </p>
                    ) : (
                      eventLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between rounded-lg border bg-muted/50 p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {log.event}
                            </Badge>
                            <span className="text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </EventProvider>
      </div>
    </section>
  );
}
