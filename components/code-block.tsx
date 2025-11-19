"use client";

import { Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

// Helper function to extract text content from React nodes
function extractTextContent(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as any).props;
    if (props && "children" in props) {
      return extractTextContent(props.children);
    }
  }
  return "";
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  // Extract language from className (e.g., "language-tsx" -> "tsx")
  const language = className?.replace(/language-/, "") || "";
  
  // Extract code text from the DOM element after render
  useEffect(() => {
    if (codeRef.current) {
      // Store the text content for copying
      (codeRef.current as any).__codeText = codeRef.current.textContent || "";
    }
  }, [children]);

  const handleCopy = async () => {
    try {
      const codeElement = codeRef.current;
      const codeText = 
        (codeElement as any)?.__codeText || 
        codeElement?.textContent || 
        extractTextContent(children);
      
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border bg-card shadow-sm">
      {language && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="overflow-x-auto bg-muted/30">
        <pre
          className="p-4 text-sm [&>code]:block [&>code]:w-full [&>code]:overflow-x-auto"
          {...props}
        >
          <code ref={codeRef} className={className}>
            {children}
          </code>
        </pre>
      </div>
      {!language && (
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-md bg-background/90 backdrop-blur-sm p-1.5 shadow-sm opacity-0 transition-all hover:bg-background hover:scale-110 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4 text-foreground" />
          )}
        </button>
      )}
    </div>
  );
}

