import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import rehypePrettyCode from "rehype-pretty-code";

const nextConfig: NextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Optionally, add any other Next.js config below
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  // @ts-expect-error - rehypePlugins is not in the type definition but is supported
  rehypePlugins: [
    [
      rehypePrettyCode,
      {
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
        onVisitLine(node: {
          children: Array<{ type: string; value?: string }>;
        }) {
          // Prevent lines from collapsing in `display: grid` mode, and allow empty
          // lines to be copy/pasted
          if (node.children.length === 0) {
            node.children = [{ type: "text", value: " " }];
          }
        },
        onVisitHighlightedLine(node: { properties: { className?: string[] } }) {
          node.properties.className = ["line", "highlighted"];
        },
        onVisitHighlightedWord(node: { properties: { className?: string[] } }) {
          node.properties.className = ["word", "highlighted"];
        },
      },
    ],
  ],
});

// Wrap MDX and Next.js config with each other
export default withMDX(nextConfig);
