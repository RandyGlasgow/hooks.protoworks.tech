"use client";

import { cn } from "@/lib/utils";
import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import { memo, useState } from "react";

const client = new EventDriver();

export default function BasicSetupDemo() {
  return (
    <EventProvider client={client}>
      <div className="p-4 border rounded-lg">
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-2">
            <MemoizedButtonList />
          </div>
          <MonitorEventLog />
        </div>
      </div>
    </EventProvider>
  );
}

function ButtonList() {
  return (
    <div className="flex flex-col gap-2">
      <TriggerEventButton
        eventType="blue"
        className="bg-blue-600 hover:bg-blue-700"
        label="Blue Event"
      />
      <TriggerEventButton
        eventType="red"
        className="bg-red-600 hover:bg-red-700"
        label="Red Event"
      />
      <TriggerEventButton
        eventType="green"
        className="bg-green-600 hover:bg-green-700"
        label="Green Event"
      />
    </div>
  );
}

const MemoizedButtonList = memo(ButtonList);

function TriggerEventButton({
  eventType,
  label,
  className,
}: {
  eventType: string;
  className: string;
  label: string;
}) {
  const trigger = useTriggerEvent();

  return (
    <button
      onClick={() => trigger(eventType, `Hello from ${label}!`)}
      className={cn(
        "px-4 py-2 text-white rounded transition-colors",
        className
      )}
    >
      {label}
    </button>
  );
}

function MonitorEventLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const handlePushLog = (log: string) => {
    setLogs((prev) => [log, ...prev]);
  };

  useMonitorEvent({
    blue: (data: string) => {
      handlePushLog(`🔵 Blue: ${data} \n ${new Date().toISOString()}`);
    },
    red: (data: string) => {
      handlePushLog(`🔴 Red: ${data} \n ${new Date().toISOString()}`);
    },
    green: (data: string) => {
      handlePushLog(`🟢 Green: ${data} \n ${new Date().toISOString()}`);
    },
  });

  return (
    <div className="flex-1 shadow-inner p-2 rounded-lg border bg-card">
      <div className="text-sm text-muted-foreground mb-2">
        Listening for events…
      </div>
      {logs.length > 0 && (
        <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2">
          {logs.map((log, index) => (
            <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
