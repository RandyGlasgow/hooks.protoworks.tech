import BasicSetupDemo from "@/components/demo/basic-setup";
import CoLocatingEventTrackingDemo from "@/components/demo/co-locating-event-tracking";
import EventDrivenWorkflowDemo from "@/components/demo/event-driven-workflow";
import LocalStorageSyncDemo from "@/components/demo/local-storage-sync";
import MultiStepFormDemo from "@/components/demo/multi-step-form";
import StateSynchronizationDemo from "@/components/demo/state-synchronization";
import { createGenerator } from "fumadocs-typescript";
import { AutoTypeTable } from "fumadocs-typescript/ui";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

const generator = createGenerator();

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    BasicSetupDemo,
    CoLocatingEventTrackingDemo,
    EventDrivenWorkflowDemo,
    LocalStorageSyncDemo,
    MultiStepFormDemo,
    StateSynchronizationDemo,
    AutoTypeTable: (props: any) => (
      <AutoTypeTable {...props} generator={generator} />
    ),
    ...components,
  };
}
