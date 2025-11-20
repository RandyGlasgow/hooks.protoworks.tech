import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock, Code, Package, Type } from "lucide-react";

export interface Feature {
  Icon: LucideIcon;
  name: string;
  description: string;
  className?: string;
  href?: string;
  cta?: string;
}

/**
 * Formats bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Extracts features from README markdown content
 */
export function extractFeaturesFromReadme(
  readme: string | null | undefined
): Feature[] {
  if (!readme) {
    return getDefaultFeatures();
  }

  const features: Feature[] = [];

  // Extract features from "gives you:" section
  const givesYouMatch = readme.match(/gives you:[\s\S]*?(?=\n##|\n#|$)/);
  if (givesYouMatch) {
    const section = givesYouMatch[0];
    // Look for bullet points with asterisks or dashes
    const bullets = section.match(/^[\s]*[-*]\s+(.+)$/gm);
    if (bullets) {
      bullets.forEach((bullet) => {
        const text = bullet
          .replace(/^[\s]*[-*]\s+/, "")
          .trim()
          .replace(/\*\*/g, "");
        if (text) {
          // Map to appropriate feature based on keywords
          if (
            text.toLowerCase().includes("lightweight") ||
            text.toLowerCase().includes("event driver")
          ) {
          } else if (text.toLowerCase().includes("provider")) {
            features.push({
              Icon: Code,
              name: "React Provider",
              description: text,
            });
          } else if (text.toLowerCase().includes("hook")) {
            features.push({
              Icon: Code,
              name: "Hook-Based API",
              description: text,
            });
          } else if (
            text.toLowerCase().includes("type") ||
            text.toLowerCase().includes("typescript")
          ) {
            features.push({
              Icon: Type,
              name: "TypeScript Support",
              description: text,
            });
          } else if (
            text.toLowerCase().includes("debounce") ||
            text.toLowerCase().includes("throttle")
          ) {
            features.push({
              Icon: Clock,
              name: "Debounce & Throttle",
              description: text,
            });
          } else if (text.toLowerCase().includes("async")) {
            features.push({
              Icon: CheckCircle2,
              name: "Async Callback Support",
              description: text,
            });
          }
        }
      });
    }
  }

  // Extract from key sections if not enough features found
  if (features.length < 3) {
    // Look for "Type-safe events" or similar
    if (
      readme.toLowerCase().includes("type-safe") &&
      !features.some((f) => f.name.includes("TypeScript"))
    ) {
      features.push({
        Icon: Type,
        name: "Type-Safe Events",
        description: "Full TypeScript type safety for event keys and payloads.",
      });
    }

    // Look for debounce/throttle mentions
    if (
      readme.toLowerCase().includes("debounce") &&
      !features.some((f) => f.name.includes("Debounce"))
    ) {
      features.push({
        Icon: Clock,
        name: "Debounce & Throttle",
        description:
          "Built-in support for debouncing and throttling event handlers.",
      });
    }

    // Look for async support
    if (
      readme.toLowerCase().includes("async") &&
      !features.some((f) => f.name.includes("Async"))
    ) {
      features.push({
        Icon: CheckCircle2,
        name: "Async Callbacks",
        description:
          "Support for asynchronous event handlers with Promise-based triggers.",
      });
    }
  }

  // If still no features, use defaults
  if (features.length === 0) {
    return getDefaultFeatures();
  }

  return features;
}

/**
 * Default features if README parsing fails
 */
function getDefaultFeatures(): Feature[] {
  return [
    {
      Icon: Code,
      name: "Hook-Based API",
      description: "Modern React hooks for triggering and monitoring events.",
    },
    {
      Icon: Type,
      name: "TypeScript Support",
      description: "Full type safety for event keys and payloads.",
    },
    {
      Icon: Clock,
      name: "Debounce & Throttle",
      description:
        "Built-in support for debouncing and throttling event handlers.",
    },
    {
      Icon: CheckCircle2,
      name: "Async Callbacks",
      description:
        "Support for asynchronous event handlers with Promise-based triggers.",
    },
  ];
}

/**
 * Creates a bundle size feature card
 */
export function createBundleSizeFeature(
  size: number | undefined,
  gzip: number | undefined
): Feature | null {
  if (size === undefined || gzip === undefined) {
    return null;
  }

  return {
    Icon: Package,
    name: "Tiny Bundle Size",
    description: `Only ${formatBytes(
      gzip
    )} gzipped. A minimal in-memory event bus for React components.`,
    className: "col-span-3 lg:col-span-2", // Make it prominent
    href: "https://bundlephobia.com/package/@protoworx/react-ripple-effect",
    cta: "View on Bundlephobia",
  };
}

/**
 * Combines all features including bundle size
 */
export function combineFeatures(
  readmeFeatures: Feature[],
  bundleSizeFeature: Feature | null
): Feature[] {
  const allFeatures = [...readmeFeatures];

  if (bundleSizeFeature) {
    // Insert bundle size as the first feature
    allFeatures.unshift(bundleSizeFeature);
  }

  // Add className to features for grid layout if not set
  return allFeatures.map((feature, index) => ({
    ...feature,
    className:
      feature.className || getDefaultClassName(index, allFeatures.length),
  }));
}

/**
 * Gets default className for grid layout
 */
function getDefaultClassName(index: number, total: number): string {
  // Simple grid layout: alternate between 1 and 2 column spans
  if (index === 0) {
    return "col-span-3 lg:col-span-1";
  }
  if (index % 2 === 0) {
    return "col-span-3 lg:col-span-1";
  }
  return "col-span-3 lg:col-span-1";
}
