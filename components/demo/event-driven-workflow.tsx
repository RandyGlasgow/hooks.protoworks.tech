"use client";

import { cn } from "@/lib/utils";
import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import { useState } from "react";

const client = new EventDriver();

type PackageEvents = {
  "package:order": { orderId: string; customerName: string };
  "package:shipped": {
    orderId: string;
    trackingNumber: string;
    carrier: string;
  };
};

interface Order {
  orderId: string;
  customerName: string;
  status: "idle" | "processing" | "complete";
  trackingNumber?: string;
  carrier?: string;
}

export default function EventDrivenWorkflowDemo() {
  return (
    <EventProvider client={client}>
      <div className="p-4 border rounded-lg">
        <div className="flex flex-col gap-4">
          <ShipPackageButton />
          <WorkflowMonitors />
          <OrderList />
        </div>
      </div>
    </EventProvider>
  );
}

function ShipPackageButton() {
  const trigger = useTriggerEvent<PackageEvents>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleShipPackage = async () => {
    setIsProcessing(true);
    const orderId = `ORD-${Date.now()}`;
    const customers = [
      "John Doe",
      "Jane Smith",
      "Bob Johnson",
      "Alice Williams",
      "Charlie Brown",
    ];
    const customerName =
      customers[Math.floor(Math.random() * customers.length)];

    trigger("package:order", {
      orderId,
      customerName,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    setIsProcessing(false);
  };

  return (
    <button
      onClick={handleShipPackage}
      disabled={isProcessing}
      className={cn(
        "px-4 py-2 text-white rounded transition-colors",
        "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      )}
    >
      {isProcessing ? "Creating..." : "Ship Package"}
    </button>
  );
}

// Monitor 1: Order Processing - listens to package:order, then triggers package:shipped
function OrderProcessorMonitor() {
  const trigger = useTriggerEvent<PackageEvents>();
  const listenerId = "order-processor";

  useMonitorEvent<PackageEvents>({
    "package:order": async (data: PackageEvents["package:order"]) => {
      console.log(`[${listenerId}] Processing order ${data.orderId}`);
      // Simulate async order processing with random delay between 1-5s
      const delay = Math.random() * 4000 + 1000; // 1000ms to 5000ms
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Chain: Trigger next event in the workflow
      trigger("package:shipped", {
        orderId: data.orderId,
        trackingNumber: `TRK-${Date.now()}`,
        carrier: "FastShip Express",
      });
    },
  });

  return null; // Monitor doesn't render anything
}

// Monitor 2: Shipping Notification - listens to package:shipped (end of chain)
function ShippingNotificationMonitor() {
  const listenerId = "shipping-notification";

  useMonitorEvent<PackageEvents>({
    "package:shipped": async (data: PackageEvents["package:shipped"]) => {
      console.log(
        `[${listenerId}] Sending notification for order ${data.orderId}`
      );
      // Simulate async notification sending with random delay between 1-5s
      const delay = Math.random() * 4000 + 1000; // 1000ms to 5000ms
      await new Promise((resolve) => setTimeout(resolve, delay));
      // Workflow chain completes here
    },
  });

  return null; // Monitor doesn't render anything
}

function WorkflowMonitors() {
  return (
    <>
      <OrderProcessorMonitor />
      <ShippingNotificationMonitor />
    </>
  );
}

// Monitor for order event - creates new order in idle state, then moves to processing
function OrderCreationMonitor({
  setOrders,
}: {
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  const listenerId = "order-creation";

  useMonitorEvent<PackageEvents>({
    "package:order": async (data: PackageEvents["package:order"]) => {
      console.log(`[${listenerId}] Creating order ${data.orderId}`);
      // Create order in idle state
      setOrders((prev) => [
        {
          orderId: data.orderId,
          customerName: data.customerName,
          status: "idle",
        },
        ...prev,
      ]);

      // Move to processing after random delay between 1-5s
      const idleDelay = Math.random() * 4000 + 1000; // 1000ms to 5000ms
      await new Promise((resolve) => setTimeout(resolve, idleDelay));
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === data.orderId && order.status === "idle"
            ? { ...order, status: "processing" }
            : order
        )
      );
    },
  });

  return null;
}

// Monitor for shipped event - moves order to complete state
function OrderCompletionMonitor({
  setOrders,
}: {
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  const listenerId = "order-completion";

  useMonitorEvent<PackageEvents>({
    "package:shipped": (data: PackageEvents["package:shipped"]) => {
      console.log(`[${listenerId}] Completing order ${data.orderId}`);
      setOrders((prev) =>
        prev.map((order) =>
          // Handle both "processing" and "idle" states to avoid race conditions
          order.orderId === data.orderId &&
          (order.status === "processing" || order.status === "idle")
            ? {
                ...order,
                status: "complete",
                trackingNumber: data.trackingNumber,
                carrier: data.carrier,
              }
            : order
        )
      );
    },
  });

  return null;
}

function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "idle":
        return "⏸️";
      case "processing":
        return "⏳";
      case "complete":
        return "✅";
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "idle":
        return "text-gray-500";
      case "processing":
        return "text-blue-500";
      case "complete":
        return "text-green-500";
    }
  };

  const getStatusBg = (status: Order["status"]) => {
    switch (status) {
      case "idle":
        return "bg-gray-50 border-gray-200";
      case "processing":
        return "bg-blue-50 border-blue-200";
      case "complete":
        return "bg-green-50 border-green-200";
    }
  };

  return (
    <>
      <OrderCreationMonitor setOrders={setOrders} />
      <OrderCompletionMonitor setOrders={setOrders} />
      <div className="flex-1 shadow-inner p-4 rounded-lg border bg-card">
        <div className="text-sm font-semibold text-muted-foreground mb-3">
          Orders ({orders.length})
        </div>
        {orders.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            Click "Ship Package" to create an order...
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className={cn(
                  "text-sm p-3 rounded border-l-4 transition-colors",
                  getStatusBg(order.status),
                  order.status === "complete" && "border-l-green-500",
                  order.status === "processing" && "border-l-blue-500",
                  order.status === "idle" && "border-l-gray-400"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className={cn("text-lg", getStatusColor(order.status))}>
                    {getStatusIcon(order.status)}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-1">
                      {order.orderId}
                    </div>
                    <div className="text-muted-foreground mb-1">
                      Customer: {order.customerName}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-medium uppercase mb-1",
                        getStatusColor(order.status)
                      )}
                    >
                      {order.status}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📦 {order.trackingNumber} via {order.carrier}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
