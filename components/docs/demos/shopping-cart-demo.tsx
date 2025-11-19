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

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type AppEvents = {
  "cart:updated": {
    item: CartItem;
    action: "add" | "remove" | "update";
  };
  "toast.show": {
    message: string;
    type?: "info" | "success" | "error";
  };
};

const client = new EventDriver();

function ProductList() {
  const trigger = useTriggerEvent<AppEvents>();

  const products = [
    { id: "1", name: "Product 1", price: 29.99 },
    { id: "2", name: "Product 2", price: 39.99 },
  ];

  const handleAddToCart = (product: { id: string; name: string; price: number }) => {
    trigger("cart:updated", {
      item: {
        ...product,
        quantity: 1,
      },
      action: "add",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{product.name}</div>
              <div className="text-sm text-muted-foreground">${product.price.toFixed(2)}</div>
            </div>
            <Button onClick={() => handleAddToCart(product)} size="sm">
              Add to Cart
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CartSidebar() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const trigger = useTriggerEvent<AppEvents>();

  useMonitorEvent<AppEvents>({
    "cart:updated": (data: AppEvents["cart:updated"]) => {
      setCartItems((prev) => {
        if (data.action === "add") {
          const existing = prev.find((item) => item.id === data.item.id);
          if (existing) {
            return prev.map((item) =>
              item.id === data.item.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return [...prev, data.item];
        } else if (data.action === "remove") {
          return prev.filter((item) => item.id !== data.item.id);
        }
        return prev;
      });
    },
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRemove = (itemId: string) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      trigger("cart:updated", {
        item,
        action: "remove",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopping Cart</CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cart is empty</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary">x{item.quantity}</Badge> ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <Button
                  onClick={() => handleRemove(item.id)}
                  size="sm"
                  variant="destructive"
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="font-bold">Total: ${total.toFixed(2)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CartNotifications() {
  const trigger = useTriggerEvent<AppEvents>();
  const [notifications, setNotifications] = useState<string[]>([]);

  useMonitorEvent<AppEvents>({
    "cart:updated": (data: AppEvents["cart:updated"]) => {
      if (data.action === "add") {
        const message = `${data.item.name} added to cart!`;
        setNotifications((prev) => [...prev.slice(-2), message]);
        trigger("toast.show", {
          message,
          type: "success",
        });
      } else if (data.action === "remove") {
        const message = `${data.item.name} removed from cart`;
        setNotifications((prev) => [...prev.slice(-2), message]);
        trigger("toast.show", {
          message,
          type: "info",
        });
      }
    },
  });

  if (notifications.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold mb-2">Notifications</div>
        <div className="space-y-1">
          {notifications.map((notif, i) => (
            <div key={i} className="text-sm text-muted-foreground">{notif}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ShoppingCartDemo() {
  const eventDriver = useMemo(() => new EventDriver(), []);

  return (
    <EventProvider client={eventDriver}>
      <div className="grid gap-4 md:grid-cols-2">
        <ProductList />
        <div className="space-y-4">
          <CartSidebar />
          <CartNotifications />
        </div>
      </div>
    </EventProvider>
  );
}

