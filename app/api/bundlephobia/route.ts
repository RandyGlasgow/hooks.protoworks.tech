import { NextResponse } from "next/server";

const PACKAGE_NAME = "@protoworx/react-ripple-effect";
const PACKAGE_VERSION = "0.0.6";

export const revalidate = 3600; // Revalidate every hour

interface BundlephobiaResponse {
  size: number;
  gzip: number;
  version: string;
  dependencyCount: number;
  hasJSModule: boolean;
  hasJSNext: boolean;
  isModuleType: boolean;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const response = await fetch(
      `https://bundlephobia.com/api/size?package=${PACKAGE_NAME}@${PACKAGE_VERSION}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Package not found on Bundlephobia" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch bundle size data" },
        { status: response.status }
      );
    }

    const data: BundlephobiaResponse = await response.json();

    return NextResponse.json(
      {
        size: data.size,
        gzip: data.gzip,
        version: data.version,
        dependencyCount: data.dependencyCount,
        hasJSModule: data.hasJSModule,
        hasJSNext: data.hasJSNext,
        isModuleType: data.isModuleType,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching Bundlephobia data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
