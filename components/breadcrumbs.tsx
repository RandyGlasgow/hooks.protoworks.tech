"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { DocsNavigation } from "@/lib/docs-navigation";

function toTitleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Recursively find a path in navigation structure
function findPathInNavigation(
  sections: DocsNavigation["navMain"],
  targetPath: string
): { title: string; url: string } | null {
  for (const section of sections) {
    // Check if section URL matches
    if (section.url === targetPath) {
      return { title: section.title, url: section.url };
    }
    
    // Check items
    for (const item of section.items || []) {
      if (item.url === targetPath) {
        return { title: item.title, url: item.url };
      }
    }
  }
  return null;
}

// Find valid paths from navigation structure
function findValidPaths(
  navigation: DocsNavigation,
  pathname: string
): Array<{ href: string; title: string }> {
  const validPaths: Array<{ href: string; title: string }> = [];
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [];
  }

  // Build up valid paths by checking navigation
  for (let i = 0; i < segments.length; i++) {
    const path = `/${segments.slice(0, i + 1).join("/")}`;
    const found = findPathInNavigation(navigation.navMain, path);
    
    if (found) {
      validPaths.push({ href: found.url, title: found.title });
    } else if (i === segments.length - 1) {
      // For the current page, use the segment title even if not in nav
      validPaths.push({ href: path, title: toTitleCase(segments[i]) });
    }
    // If not found and not the last segment, skip it (don't create broken link)
  }

  return validPaths;
}

interface BreadcrumbsProps {
  navigation?: DocsNavigation;
}

export function Breadcrumbs({ navigation }: BreadcrumbsProps) {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const segments = pathname.split("/").filter(Boolean);

  // If we have navigation, use it to find valid paths
  let breadcrumbItems: Array<{ href: string; title: string; isLast: boolean }> = [];
  
  if (navigation) {
    const validPaths = findValidPaths(navigation, pathname);
    breadcrumbItems = validPaths.map((item, index) => ({
      ...item,
      isLast: index === validPaths.length - 1,
    }));
  } else {
    // Fallback: use segments but only link to current page
    breadcrumbItems = segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const isLast = index === segments.length - 1;
      const title = toTitleCase(segment);
      return { href, title, isLast };
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item) => (
          <React.Fragment key={item.href}>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

