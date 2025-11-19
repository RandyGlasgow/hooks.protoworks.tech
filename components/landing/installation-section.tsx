"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Github, BookOpen } from "lucide-react";
import Link from "next/link";

const installCommands = {
  npm: "npm install @protoworx/react-ripple-effect",
  yarn: "yarn add @protoworx/react-ripple-effect",
  pnpm: "pnpm add @protoworx/react-ripple-effect",
};

export function InstallationSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="bg-gradient-to-b from-background to-muted/20 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Get Started
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Install the package and start building event-driven React applications in minutes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="npm" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="npm">npm</TabsTrigger>
                <TabsTrigger value="yarn">yarn</TabsTrigger>
                <TabsTrigger value="pnpm">pnpm</TabsTrigger>
              </TabsList>
              {Object.entries(installCommands).map(([key, command]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
                    <code className="flex-1 font-mono text-sm">{command}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(command, key)}
                      className="shrink-0"
                    >
                      {copied === key ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="default">
            <Link href="/docs/getting-started">
              <BookOpen className="mr-2 size-5" />
              Read Documentation
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
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

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Licensed under{" "}
            <Link
              href="https://github.com/randyglasgow/react-ripple-effect/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              MIT License
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

