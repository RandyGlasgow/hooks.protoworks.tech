"use client";

import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

type AppEvents = {
  "workflow:start": { orderId: string };
  "workflow:step1-complete": { orderId: string; step1Data: any };
  "workflow:step2-complete": { orderId: string; step2Data: any };
  "workflow:step3-complete": { orderId: string; step3Data: any };
  "workflow:complete": { orderId: string; result: any };
  "workflow:error": { orderId: string; error: string };
};

const client = new EventDriver();

function WorkflowStarter() {
  const trigger = useTriggerEvent<AppEvents>();
  const [orderId, setOrderId] = useState(1);

  const handleStart = () => {
    const id = `order-${orderId}`;
    setOrderId((prev) => prev + 1);
    trigger("workflow:start", { orderId: id });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleStart}>Start Order Processing</Button>
      </CardContent>
    </Card>
  );
}

function Step1Processor() {
  const trigger = useTriggerEvent<AppEvents>();
  const [status, setStatus] = useState<"idle" | "processing" | "complete">("idle");
  const [currentOrder, setCurrentOrder] = useState<string | null>(null);

  useMonitorEvent<AppEvents>({
    "workflow:start": async (data: AppEvents["workflow:start"]) => {
      setStatus("processing");
      setCurrentOrder(data.orderId);
      
      // Simulate async processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Trigger next step
      trigger("workflow:step1-complete", {
        orderId: data.orderId,
        step1Data: { validated: true, inventoryChecked: true },
      });
      
      setStatus("complete");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Step 1: Validate Order
          {status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {status === "idle" && <Circle className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentOrder && (
          <div className="text-sm">
            <Badge variant="secondary">{currentOrder}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Step2Processor() {
  const trigger = useTriggerEvent<AppEvents>();
  const [status, setStatus] = useState<"idle" | "processing" | "complete">("idle");
  const [currentOrder, setCurrentOrder] = useState<string | null>(null);

  useMonitorEvent<AppEvents>({
    "workflow:step1-complete": async (data: AppEvents["workflow:step1-complete"]) => {
      setStatus("processing");
      setCurrentOrder(data.orderId);
      
      // Simulate async processing
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      // Trigger next step
      trigger("workflow:step2-complete", {
        orderId: data.orderId,
        step2Data: { paymentProcessed: true, amount: 99.99 },
      });
      
      setStatus("complete");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Step 2: Process Payment
          {status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {status === "idle" && <Circle className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentOrder && (
          <div className="text-sm">
            <Badge variant="secondary">{currentOrder}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Step3Processor() {
  const trigger = useTriggerEvent<AppEvents>();
  const [status, setStatus] = useState<"idle" | "processing" | "complete">("idle");
  const [currentOrder, setCurrentOrder] = useState<string | null>(null);

  useMonitorEvent<AppEvents>({
    "workflow:step2-complete": async (data: AppEvents["workflow:step2-complete"]) => {
      setStatus("processing");
      setCurrentOrder(data.orderId);
      
      // Simulate async processing
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Trigger completion
      trigger("workflow:step3-complete", {
        orderId: data.orderId,
        step3Data: { shipped: true, trackingNumber: "TRK123456" },
      });
      
      setStatus("complete");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Step 3: Ship Order
          {status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {status === "idle" && <Circle className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentOrder && (
          <div className="text-sm">
            <Badge variant="secondary">{currentOrder}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WorkflowCompletionHandler() {
  const [completedOrders, setCompletedOrders] = useState<Array<{ orderId: string; result: any }>>([]);

  useMonitorEvent<AppEvents>({
    "workflow:step3-complete": (data: AppEvents["workflow:step3-complete"]) => {
      // Final step - mark workflow as complete
      setCompletedOrders((prev) => [
        ...prev.slice(-4),
        {
          orderId: data.orderId,
          result: {
            validated: true,
            paymentProcessed: true,
            shipped: true,
            trackingNumber: data.step3Data.trackingNumber,
          },
        },
      ]);
    },
  });

  if (completedOrders.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completed Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {completedOrders.map((order, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
              <div>
                <Badge variant="outline" className="mr-2">{order.orderId}</Badge>
                <span className="text-sm text-muted-foreground">
                  Tracking: {order.result.trackingNumber}
                </span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowLogger() {
  const [logs, setLogs] = useState<Array<{ event: string; orderId: string; timestamp: number }>>([]);

  useMonitorEvent<AppEvents>({
    "workflow:start": (data: AppEvents["workflow:start"]) => {
      setLogs((prev) => [...prev.slice(-9), { event: "start", orderId: data.orderId, timestamp: Date.now() }]);
    },
    "workflow:step1-complete": (data: AppEvents["workflow:step1-complete"]) => {
      setLogs((prev) => [...prev.slice(-9), { event: "step1-complete", orderId: data.orderId, timestamp: Date.now() }]);
    },
    "workflow:step2-complete": (data: AppEvents["workflow:step2-complete"]) => {
      setLogs((prev) => [...prev.slice(-9), { event: "step2-complete", orderId: data.orderId, timestamp: Date.now() }]);
    },
    "workflow:step3-complete": (data: AppEvents["workflow:step3-complete"]) => {
      setLogs((prev) => [...prev.slice(-9), { event: "step3-complete", orderId: data.orderId, timestamp: Date.now() }]);
    },
  });

  if (logs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-xs">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{log.event}</Badge>
              <span className="text-muted-foreground">{log.orderId}</span>
              <span className="text-muted-foreground ml-auto">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MultiStepWorkflowDemo() {
  const eventDriver = useMemo(() => new EventDriver(), []);

  return (
    <EventProvider client={eventDriver}>
      <div className="space-y-4">
        <WorkflowStarter />
        <div className="grid gap-4 md:grid-cols-3">
          <Step1Processor />
          <Step2Processor />
          <Step3Processor />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <WorkflowCompletionHandler />
          <WorkflowLogger />
        </div>
      </div>
    </EventProvider>
  );
}

