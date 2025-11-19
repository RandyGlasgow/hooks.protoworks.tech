"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import type { DocsNavigation } from "@/lib/docs-navigation";

export function LayoutWrapper({ 
  children,
  navigation 
}: { 
  children: React.ReactNode;
  navigation: DocsNavigation;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar navigation={navigation} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs navigation={navigation} />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

