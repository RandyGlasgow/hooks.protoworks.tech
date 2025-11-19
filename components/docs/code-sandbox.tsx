"use client";

import { CodeBlock } from "@/components/code-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface CodeSandboxProps {
  title?: string;
  description?: string;
  demo: ReactNode;
  code: string;
  language?: string;
}

export function CodeSandbox({
  title,
  description,
  demo,
  code,
  language = "tsx",
}: CodeSandboxProps) {
  return (
    <div className="my-8">
      {title && (
        <div className="mb-4">
          <h3 className="text-2xl font-semibold mb-2">{title}</h3>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <Card className="border-dashed shadow-inner border-purple-200">
        <CardHeader>
          <CardTitle>Live Demo</CardTitle>
        </CardHeader>
        <CardContent>{demo}</CardContent>
      </Card>
      <div className="mt-4">
        <Tabs defaultValue="code" className="w-full">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="mt-4">
            <CodeBlock className={`language-${language}`}>{code}</CodeBlock>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
