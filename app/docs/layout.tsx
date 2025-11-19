import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <article className="max-w-none">{children}</article>
    </div>
  );
}
