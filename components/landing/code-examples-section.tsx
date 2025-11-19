"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const codeExamples = {
  basic: `'use client';

import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from '@protoworx/react-ripple-effect';

const client = new EventDriver();

export default function App() {
  return (
    <EventProvider client={client}>
      <TriggerButton />
      <EventListener />
    </EventProvider>
  );
}

function TriggerButton() {
  const trigger = useTriggerEvent();

  return (
    <button onClick={() => trigger('test', 'Hello, world!')}>
      Trigger Event
    </button>
  );
}

function EventListener() {
  useMonitorEvent({
    test: (data: string) => {
      console.log('Test event:', data);
    },
  });

  return <div>Listening for "test" events…</div>;
}`,
  typescript: `type AppEvents = {
  'user-logged-in': { userId: number; username: string };
  'toast.show': { message: string; type?: 'info' | 'error' };
};

// Triggering
const trigger = useTriggerEvent<AppEvents>();

trigger('user-logged-in', { userId: 1, username: 'alice' });
trigger('toast.show', { message: 'Saved!', type: 'info' });

// Monitoring
useMonitorEvent<AppEvents>({
  'user-logged-in': (data) => {
    // data is typed as { userId: number; username: string }
    console.log('Logged in as', data.username);
  },
  'toast.show': (data) => {
    console.log('Toast:', data.message);
  },
});`,
  debounce: `useMonitorEvent({
  'search:input': {
    callback: (query: string) => {
      // Only fire after the user stops typing for 300ms
      performSearch(query);
    },
    debounce: 300,
  },
  'window:scroll': {
    callback: () => {
      // At most once per 100ms
      updateScrollPosition();
    },
    throttle: 100,
  },
});`,
  async: `// Subscribe with async callback
useMonitorEvent({
  'save-data': async (data) => {
    await saveToDatabase(data);
    console.log('Data saved!');
  },
});

// Trigger and await
const trigger = useTriggerEvent();
await trigger('save-data', { userId: 123 });
console.log('All handlers completed');`,
};

export function CodeExamplesSection() {
  return (
    <section className="border-b bg-background py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Code Examples
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Get started in minutes with these simple examples.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 p-0">
                <TabsTrigger
                  value="basic"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Basic Usage
                </TabsTrigger>
                <TabsTrigger
                  value="typescript"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  TypeScript
                </TabsTrigger>
                <TabsTrigger
                  value="debounce"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Debounce/Throttle
                </TabsTrigger>
                <TabsTrigger
                  value="async"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Async Callbacks
                </TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="m-0">
                <pre className="overflow-x-auto rounded-b-lg bg-muted/50 p-6 font-mono text-sm">
                  <code className="text-foreground">{codeExamples.basic}</code>
                </pre>
              </TabsContent>
              <TabsContent value="typescript" className="m-0">
                <pre className="overflow-x-auto rounded-b-lg bg-muted/50 p-6 font-mono text-sm">
                  <code className="text-foreground">{codeExamples.typescript}</code>
                </pre>
              </TabsContent>
              <TabsContent value="debounce" className="m-0">
                <pre className="overflow-x-auto rounded-b-lg bg-muted/50 p-6 font-mono text-sm">
                  <code className="text-foreground">{codeExamples.debounce}</code>
                </pre>
              </TabsContent>
              <TabsContent value="async" className="m-0">
                <pre className="overflow-x-auto rounded-b-lg bg-muted/50 p-6 font-mono text-sm">
                  <code className="text-foreground">{codeExamples.async}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

