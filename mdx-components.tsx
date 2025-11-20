import BasicSetupDemo from "@/components/demo/basic-setup";
import EventDrivenWorkflowDemo from "@/components/demo/event-driven-workflow";
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
    EventDrivenWorkflowDemo,
    AutoTypeTable: (props: any) => (
      <AutoTypeTable {...props} generator={generator} />
    ),
    ...components,
  };
}
