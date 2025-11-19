"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/code-block";
import { ReactNode } from "react";

interface ExampleSectionProps {
  title: string;
  description?: string;
  eventFlow?: string;
  demo: ReactNode;
  code: string;
  language?: string;
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ExampleSection({
  title,
  description,
  eventFlow,
  demo,
  code,
  language = "tsx",
}: ExampleSectionProps) {
  const id = toSlug(title);
  
  return (
    <div className="my-12" id={id}>
      <div className="mb-6">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-8 mb-4">
          {title}
        </h2>
        {description && (
          <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
            {description}
          </p>
        )}
        {eventFlow && (
          <div className="my-4">
            <h4 className="text-sm font-semibold mb-2">Event Flow:</h4>
            <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-sm">
              <code>{eventFlow}</code>
            </pre>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Tabs defaultValue="demo" className="w-full">
          <TabsList>
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="demo" className="mt-4">
            <Card className="border-dashed shadow-inner">
              <CardHeader>
                <CardTitle>Live Demo</CardTitle>
              </CardHeader>
              <CardContent>{demo}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="code" className="mt-4">
            <CodeBlock className={`language-${language}`}>{code}</CodeBlock>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

