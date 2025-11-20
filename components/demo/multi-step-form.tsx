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

type FormEvents = {
  "step:validate": { step: number; isValid: boolean; data: any };
  "step:change": { step: number };
  "form:submit": { formData: any };
};

type FormData = {
  personalInfo: { name: string; email: string };
  shipping: { address: string; city: string; zipCode: string };
  payment: { cardNumber: string; expiryDate: string };
};

const STEPS = [
  { id: 1, title: "Personal Info" },
  { id: 2, title: "Shipping" },
  { id: 3, title: "Payment" },
  { id: 4, title: "Review" },
];

const INITIAL_FORM_DATA: FormData = {
  personalInfo: { name: "", email: "" },
  shipping: { address: "", city: "", zipCode: "" },
  payment: { cardNumber: "", expiryDate: "" },
};

export default function MultiStepFormDemo() {
  return (
    <EventProvider client={client}>
      <div className="p-4 border rounded-lg">
        <WizardContainer />
      </div>
    </EventProvider>
  );
}

function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useMonitorEvent<FormEvents>({
    "step:change": (data) => setCurrentStep(data.step),
    "step:validate": (data) => {
      if (data.isValid) {
        setCompletedSteps((prev) => new Set([...prev, data.step]));
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator currentStep={currentStep} completedSteps={completedSteps} />
      <StepContent step={currentStep} formData={formData} />
      <NavigationButtons currentStep={currentStep} />
    </div>
  );
}

function ProgressIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: Set<number>;
}) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
              >
                {isCompleted ? "✓" : step.id}
              </div>
              <div
                className={cn(
                  "text-xs mt-2 text-center",
                  isCurrent
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {step.title}
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-1 flex-1 mx-2 -mt-5",
                  isCompleted
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepContent({ step, formData }: { step: number; formData: FormData }) {
  switch (step) {
    case 1:
      return <PersonalInfoStep initialData={formData.personalInfo} />;
    case 2:
      return <ShippingStep initialData={formData.shipping} />;
    case 3:
      return <PaymentStep initialData={formData.payment} />;
    case 4:
      return <ReviewStep formData={formData} />;
    default:
      return null;
  }
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-md bg-background"
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
}

function StepButtons({ onBack, onNext, showBack = false }: { onBack?: () => void; onNext: () => void; showBack?: boolean }) {
  return (
    <div className="flex gap-2">
      {showBack && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onBack?.();
          }}
          className="flex-1 px-4 py-2 border rounded hover:bg-muted transition-colors"
        >
          Back
        </button>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onNext();
        }}
        className={cn(
          "px-4 py-2 rounded text-white transition-colors",
          showBack ? "flex-1 bg-blue-600 hover:bg-blue-700" : "w-full bg-blue-600 hover:bg-blue-700"
        )}
      >
        Next
      </button>
    </div>
  );
}

function PersonalInfoStep({ initialData }: { initialData: FormData["personalInfo"] }) {
  const trigger = useTriggerEvent<FormEvents>();
  const [data, setData] = useState(initialData);

  const handleNext = () => {
    const isValid = data.name.trim() !== "" && data.email.includes("@");
    trigger("step:validate", { step: 1, isValid, data: { personalInfo: data } });
    if (isValid) trigger("step:change", { step: 2 });
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      <div className="space-y-4">
        <FormField label="Name" value={data.name} onChange={(v) => setData((p) => ({ ...p, name: v }))} placeholder="Enter your name" />
        <FormField label="Email" type="email" value={data.email} onChange={(v) => setData((p) => ({ ...p, email: v }))} placeholder="Enter your email" />
        <StepButtons onNext={handleNext} />
      </div>
    </div>
  );
}

function ShippingStep({ initialData }: { initialData: FormData["shipping"] }) {
  const trigger = useTriggerEvent<FormEvents>();
  const [data, setData] = useState(initialData);

  const handleNext = () => {
    const isValid = data.address.trim() !== "" && data.city.trim() !== "" && data.zipCode.trim() !== "";
    trigger("step:validate", { step: 2, isValid, data: { shipping: data } });
    if (isValid) trigger("step:change", { step: 3 });
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
      <div className="space-y-4">
        <FormField label="Address" value={data.address} onChange={(v) => setData((p) => ({ ...p, address: v }))} placeholder="Enter your address" />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" value={data.city} onChange={(v) => setData((p) => ({ ...p, city: v }))} placeholder="City" />
          <FormField label="Zip Code" value={data.zipCode} onChange={(v) => setData((p) => ({ ...p, zipCode: v }))} placeholder="Zip Code" />
        </div>
        <StepButtons onBack={() => trigger("step:change", { step: 1 })} onNext={handleNext} showBack />
      </div>
    </div>
  );
}

function PaymentStep({ initialData }: { initialData: FormData["payment"] }) {
  const trigger = useTriggerEvent<FormEvents>();
  const [data, setData] = useState(initialData);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(" ") || digits;
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length >= 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const handleNext = () => {
    const isValid = data.cardNumber.replace(/\s/g, "").length === 16 && data.expiryDate.length === 5;
    trigger("step:validate", { step: 3, isValid, data: { payment: data } });
    if (isValid) trigger("step:change", { step: 4 });
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
      <div className="space-y-4">
        <FormField
          label="Card Number"
          value={data.cardNumber}
          onChange={(v) => setData((p) => ({ ...p, cardNumber: formatCardNumber(v) }))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
        />
        <FormField
          label="Expiry Date"
          value={data.expiryDate}
          onChange={(v) => setData((p) => ({ ...p, expiryDate: formatExpiry(v) }))}
          placeholder="MM/YY"
          maxLength={5}
        />
        <StepButtons onBack={() => trigger("step:change", { step: 2 })} onNext={handleNext} showBack />
      </div>
    </div>
  );
}

function ReviewStep({ formData }: { formData: FormData }) {
  const trigger = useTriggerEvent<FormEvents>();

  const handleSubmit = () => {
    trigger("form:submit", { formData });
    alert("Form submitted successfully! 🎉");
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
      <div className="space-y-4 mb-6">
        <ReviewSection title="Personal Information">
          <p className="text-sm text-muted-foreground">Name: {formData.personalInfo.name}</p>
          <p className="text-sm text-muted-foreground">Email: {formData.personalInfo.email}</p>
        </ReviewSection>
        <ReviewSection title="Shipping Address">
          <p className="text-sm text-muted-foreground">{formData.shipping.address}</p>
          <p className="text-sm text-muted-foreground">
            {formData.shipping.city}, {formData.shipping.zipCode}
          </p>
        </ReviewSection>
        <ReviewSection title="Payment">
          <p className="text-sm text-muted-foreground">Card: •••• {formData.payment.cardNumber.slice(-4)}</p>
          <p className="text-sm text-muted-foreground">Expiry: {formData.payment.expiryDate}</p>
        </ReviewSection>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => trigger("step:change", { step: 3 })}
          className="flex-1 px-4 py-2 border rounded hover:bg-muted transition-colors"
        >
          Back
        </button>
        <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          Submit
        </button>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-muted rounded">
      <h4 className="font-semibold mb-2">{title}</h4>
      {children}
    </div>
  );
}

function NavigationButtons({ currentStep }: { currentStep: number }) {
  const trigger = useTriggerEvent<FormEvents>();

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <button
        onClick={() => trigger("step:change", { step: currentStep - 1 })}
        disabled={currentStep === 1}
        className={cn(
          "px-4 py-2 rounded transition-colors",
          currentStep === 1
            ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
            : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
        )}
      >
        ← Previous Step
      </button>
      <div className="text-xs">
        Step {currentStep} of {STEPS.length}
      </div>
    </div>
  );
}
