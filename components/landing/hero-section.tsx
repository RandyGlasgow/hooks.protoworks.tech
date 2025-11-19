"use client"

import { useRef, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedBeam } from "@/registry/magicui/animated-beam";
import { Github, BookOpen, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-16 items-center justify-center rounded-full border-2 bg-background p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const monitorRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-b bg-gradient-to-b from-background to-muted/20 px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <Badge variant="secondary" className="text-sm">
            <Zap className="mr-1 size-3" />
            Lightweight Event Bus for React
          </Badge>
        </div>

        {/* Main Headline */}
        <h1 className="mb-6 text-center text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          A tiny, hook-based{" "}
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            event bus
          </span>{" "}
          for React
        </h1>

        {/* Tagline */}
        <p className="mx-auto mb-12 max-w-2xl text-center text-xl text-muted-foreground sm:text-2xl">
          Let your components communicate via named events. Type-safe, lightweight, and
          built with hooks.
        </p>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="text-base">
            <Link href="/docs/getting-started">
              <BookOpen className="mr-2 size-5" />
              Get Started
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link
              href="https://github.com/randyglasgow/react-ripple-effect"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 size-5" />
              View on GitHub
            </Link>
          </Button>
        </div>

        {/* AnimatedBeam Visualization */}
        <div
          ref={containerRef}
          className="relative mx-auto flex h-[300px] w-full max-w-4xl items-center justify-between overflow-hidden rounded-lg border bg-muted/30 p-4 sm:h-[400px] sm:p-10"
        >
          <div className="flex flex-col items-center gap-4">
            <Circle ref={triggerRef} className="border-primary bg-primary/10">
              <Zap className="size-8 text-primary" />
            </Circle>
            <div className="text-center">
              <div className="font-semibold">Trigger</div>
              <div className="text-sm text-muted-foreground">useTriggerEvent</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Circle ref={monitorRef} className="border-purple-500 bg-purple-500/10">
              <Zap className="size-8 text-purple-500" />
            </Circle>
            <div className="text-center">
              <div className="font-semibold">Monitor</div>
              <div className="text-sm text-muted-foreground">useMonitorEvent</div>
            </div>
          </div>

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={triggerRef}
            toRef={monitorRef}
            curvature={-75}
            duration={3}
            pathColor="hsl(var(--muted-foreground))"
            pathWidth={2}
            gradientStartColor="#3b82f6"
            gradientStopColor="#9333ea"
          />
        </div>

        {/* Package Name */}
        <div className="mt-12 text-center">
          <code className="rounded-lg bg-muted px-4 py-2 text-sm font-mono">
            @protoworx/react-ripple-effect
          </code>
        </div>
      </div>
    </section>
  );
}

