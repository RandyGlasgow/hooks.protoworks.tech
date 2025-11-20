"use client";

import { cn } from "@/lib/utils";
import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import { useState } from "react";
import type React from "react";

const client = new EventDriver();

type PackageEvents = {
  "package:order": { orderId: string; customerName: string };
  "package:shipped": {
    orderId: string;
    trackingNumber: string;
    carrier: string;
  };
};

type Order = {
  orderId: string;
  customerName: string;
  status: "idle" | "processing" | "complete";
  trackingNumber?: string;
  carrier?: string;
};

const CUSTOMERS = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Williams", "Charlie Brown"];
const DELAY = () => Math.random() * 4000 + 1000;

const STATUS_CONFIG = {
  idle: {
    icon: "⏸️",
    color: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
    border: "border-l-gray-400 dark:border-l-gray-600",
  },
  processing: {
    icon: "⏳",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    border: "border-l-blue-500 dark:border-l-blue-400",
  },
  complete: {
    icon: "✅",
    color: "text-green-500 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    border: "border-l-green-500 dark:border-l-green-400",
  },
} as const;

export default function EventDrivenWorkflowDemo() {
  return (
    <EventProvider client={client}>
      <div className="p-4 border rounded-lg space-y-4">
        <ShipPackageButton />
        <WorkflowMonitors />
        <OrderList />
      </div>
    </EventProvider>
  );
}

function ShipPackageButton() {
  const trigger = useTriggerEvent<PackageEvents>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    setIsProcessing(true);
    trigger("package:order", {
      orderId: `ORD-${Date.now()}`,
      customerName: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    setIsProcessing(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={cn(
        "px-4 py-2 rounded transition-colors text-white",
        isProcessing
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      )}
    >
      {isProcessing ? "Creating..." : "Ship Package"}
    </button>
  );
}

function OrderProcessorMonitor() {
  const trigger = useTriggerEvent<PackageEvents>();

  useMonitorEvent<PackageEvents>({
    "package:order": async (data: { orderId: string; customerName: string }) => {
      await new Promise((resolve) => setTimeout(resolve, DELAY()));
      trigger("package:shipped", {
        orderId: data.orderId,
        trackingNumber: `TRK-${Date.now()}`,
        carrier: "FastShip Express",
      });
    },
  });

  return null;
}

function ShippingNotificationMonitor() {
  useMonitorEvent<PackageEvents>({
    "package:shipped": async () => {
      await new Promise((resolve) => setTimeout(resolve, DELAY()));
    },
  });

  return null;
}

function WorkflowMonitors() {
  return (
    <>
      <OrderProcessorMonitor />
      <ShippingNotificationMonitor />
    </>
  );
}

function OrderCreationMonitor({
  setOrders,
}: {
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  useMonitorEvent<PackageEvents>({
    "package:order": async (data: { orderId: string; customerName: string }) => {
      setOrders((prev) => [
        { orderId: data.orderId, customerName: data.customerName, status: "idle" },
        ...prev,
      ]);

      await new Promise((resolve) => setTimeout(resolve, DELAY()));
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

function OrderCompletionMonitor({
  setOrders,
}: {
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  useMonitorEvent<PackageEvents>({
    "package:shipped": (data: { orderId: string; trackingNumber: string; carrier: string }) => {
      setOrders((prev) =>
        prev.map((order) =>
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

  return (
    <>
      <OrderCreationMonitor setOrders={setOrders} />
      <OrderCompletionMonitor setOrders={setOrders} />
      <div className="shadow-inner p-4 rounded-lg border bg-card">
        <div className="text-sm font-semibold text-muted-foreground mb-3">
          Orders ({orders.length})
        </div>
        {orders.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            Click "Ship Package" to create an order...
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              return (
                <div
                  key={order.orderId}
                  className={cn(
                    "text-sm p-3 rounded border-l-4 transition-colors",
                    config.bg,
                    config.border
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn("text-lg", config.color)}>{config.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground mb-1">
                        {order.orderId}
                      </div>
                      <div className="text-muted-foreground mb-1">
                        Customer: {order.customerName}
                      </div>
                      <div className={cn("text-xs font-medium uppercase mb-1", config.color)}>
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
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
