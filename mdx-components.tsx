import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/code-block";

// This file allows you to provide custom React components
// to be used in MDX files. You can customize and extend
// this file to suit your needs.

// For more information on MDX components, see:
// https://mdxjs.com/docs/getting-started/#mdxcontent

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings with proper spacing
    h1: ({ children }) => (
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-8 mb-4 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-3">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-4 mb-2">
        {children}
      </h4>
    ),
    // Links with hover effects
    a: ({ href, children }) => (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
      >
        {children}
      </a>
    ),
    // Code blocks with proper styling and syntax highlighting
    code: ({ children, className, ...props }) => {
      const isInline = !className || !className.startsWith("language-");
      if (isInline) {
        return (
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            {children}
          </code>
        );
      }
      // For code blocks, pass through - the pre component will handle wrapping
      return <code className={className} {...props}>{children}</code>;
    },
    // Pre blocks with CodeBlock wrapper for syntax highlighted code
    pre: ({ children, ...props }) => {
      // rehype-pretty-code wraps code in pre, so children should be a code element
      // Extract language from the code element's className
      let language = "";
      let codeChildren = children;
      
      if (
        typeof children === "object" &&
        children !== null &&
        "props" in children
      ) {
        const codeClassName = children.props?.className || "";
        if (codeClassName.startsWith("language-")) {
          language = codeClassName.replace(/language-/, "");
          codeChildren = children;
        }
      }
      
      // If we found a language, wrap in CodeBlock
      if (language) {
        return (
          <CodeBlock className={`language-${language}`} {...props}>
            {codeChildren}
          </CodeBlock>
        );
      }
      
      // Fallback for regular pre blocks
      return (
        <pre className="overflow-x-auto rounded-lg border bg-muted p-4 my-4" {...props}>
          {children}
        </pre>
      );
    },
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    // Lists
    ul: ({ children }) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),
    // Paragraphs
    p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>,
    // Tables
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full border-collapse border">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),
    // Horizontal rule
    hr: () => <hr className="my-8 border-t" />,
    ...components,
  };
}

