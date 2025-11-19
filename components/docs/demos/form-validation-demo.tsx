"use client";

import {
  EventDriver,
  EventProvider,
  useMonitorEvent,
  useTriggerEvent,
} from "@protoworx/react-ripple-effect";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type AppEvents = {
  "form:validate": {
    field: string;
    value: string;
  };
  "form:error": {
    field: string;
    error: string;
  };
  "form:success": {
    field: string;
  };
};

const client = new EventDriver();

function ContactForm() {
  const trigger = useTriggerEvent<AppEvents>();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    message: "",
  });
  const [fieldStates, setFieldStates] = useState<Record<string, "error" | "success" | "default">>({
    name: "default",
    email: "default",
    message: "default",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    trigger("form:validate", { field, value });
  };

  useMonitorEvent<AppEvents>({
    "form:error": (data: AppEvents["form:error"]) => {
      setFieldStates((prev) => ({ ...prev, [data.field]: "error" }));
    },
    "form:success": (data: AppEvents["form:success"]) => {
      setFieldStates((prev) => ({ ...prev, [data.field]: "success" }));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={
              fieldStates.name === "error"
                ? "border-red-500 focus-visible:ring-red-500"
                : fieldStates.name === "success"
                ? "border-green-500 focus-visible:ring-green-500"
                : ""
            }
            placeholder="Enter your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={
              fieldStates.email === "error"
                ? "border-red-500 focus-visible:ring-red-500"
                : fieldStates.email === "success"
                ? "border-green-500 focus-visible:ring-green-500"
                : ""
            }
            placeholder="your.email@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            className={
              fieldStates.message === "error"
                ? "border-red-500 focus-visible:ring-red-500"
                : fieldStates.message === "success"
                ? "border-green-500 focus-visible:ring-green-500"
                : ""
            }
            placeholder="Enter your message..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ValidationService() {
  const trigger = useTriggerEvent<AppEvents>();

  useMonitorEvent<AppEvents>({
    "form:validate": {
      callback: (data: AppEvents["form:validate"]) => {
        const { field, value } = data;

        if (field === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            trigger("form:error", {
              field,
              error: "Invalid email format",
            });
          } else {
            trigger("form:success", { field });
          }
        } else if (field === "name") {
          if (value.length < 2) {
            trigger("form:error", {
              field,
              error: "Name must be at least 2 characters",
            });
          } else {
            trigger("form:success", { field });
          }
        } else if (field === "message") {
          if (value.length < 10) {
            trigger("form:error", {
              field,
              error: "Message must be at least 10 characters",
            });
          } else {
            trigger("form:success", { field });
          }
        }
      },
      debounce: 300,
    },
  });

  return null;
}

function ErrorDisplay() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useMonitorEvent<AppEvents>({
    "form:error": (data: AppEvents["form:error"]) => {
      setErrors((prev) => ({
        ...prev,
        [data.field]: data.error,
      }));
    },
    "form:success": (data: AppEvents["form:success"]) => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[data.field];
        return next;
      });
    },
  });

  if (Object.keys(errors).length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400 text-base">
          Validation Errors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(errors).map(([field, error]) => (
            <div key={field} className="text-sm text-red-600 dark:text-red-400">
              <span className="font-medium capitalize">{field}:</span> {error}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FormValidationDemo() {
  const eventDriver = useMemo(() => new EventDriver(), []);

  return (
    <EventProvider client={eventDriver}>
      <div className="space-y-4">
        <ContactForm />
        <ValidationService />
        <ErrorDisplay />
      </div>
    </EventProvider>
  );
}

