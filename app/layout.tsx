import { LayoutWrapper } from "@/components/layout-wrapper";
import { getDocsNavigation } from "@/lib/docs-navigation";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "@protoworx/react-ripple-effect - A tiny, hook-based event bus for React",
  description:
    "A lightweight, hook-based event bus for React that lets your components communicate via named events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigation = getDocsNavigation();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper navigation={navigation}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
