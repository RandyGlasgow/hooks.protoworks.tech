import { AuroraText } from "@/components/ui/aurora-text";
import { Button } from "@/components/ui/base-button";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  combineFeatures,
  createBundleSizeFeature,
  extractFeaturesFromReadme,
} from "@/lib/features";
import { BookOpen, Star } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import logo from "../icon.png";

async function getGitHubData() {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/github/repo`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch GitHub data:", error);
    return null;
  }
}

async function getBundlephobiaData() {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/bundlephobia`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Bundlephobia data:", error);
    return null;
  }
}

async function getFeaturesData(githubData: any, bundlephobiaData: any) {
  const readme = githubData?.repository?.readme;
  const readmeFeatures = extractFeaturesFromReadme(readme);

  const bundleSizeFeature = createBundleSizeFeature(
    bundlephobiaData?.size,
    bundlephobiaData?.gzip
  );

  return combineFeatures(readmeFeatures, bundleSizeFeature);
}

export default async function HomePage() {
  const [githubData, bundlephobiaData] = await Promise.all([
    getGitHubData(),
    getBundlephobiaData(),
  ]);

  const stars = githubData?.repository?.stars;
  const version = githubData?.package?.version;
  const features = await getFeaturesData(githubData, bundlephobiaData);

  return (
    <main className="flex flex-col gap-2">
      <section
        id="hero"
        className="h-[95vh] flex flex-col gap-6 justify-center items-center"
      >
        <Image
          src={logo}
          alt="Logo"
          width={125}
          height={125}
          className="mb-4 border border-gray-500/70 border-dashed object-fill shadow-lg rounded-md dark:invert"
        />
        <h1 className="text-5xl font-bold max-w-3xl text-center tracking-tighter">
          A tiny, hook based <AuroraText>event bus</AuroraText> for React.
        </h1>
        <p className="text-lg text-center max-w-xl mx-auto text-muted-foreground">
          Let your components communicate via named events. Type-safe,
          lightweight, and built with hooks.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <div className="flex gap-4 items-center">
            <Button
              variant="primary"
              render={
                <Link href="/docs">
                  <BookOpen className="size-4" />
                  Get Started
                </Link>
              }
            ></Button>
            <Button
              variant="outline"
              render={
                <Link href="https://github.com/randyglasgow/react-ripple-effect">
                  <FaGithub className="size-4" />
                  View on GitHub
                </Link>
              }
            >
              View on GitHub
            </Button>
          </div>
          {(stars !== undefined || version) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {stars !== undefined && (
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  <span>{stars.toLocaleString()}</span>
                </div>
              )}
              {version && (
                <span className="px-2 py-1 bg-muted rounded-md font-mono">
                  v{version}
                </span>
              )}
            </div>
          )}
        </div>
      </section>
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Features</h2>
        <BentoGrid>
          {features.map((feature) => {
            const { Icon, name, description, className, href, cta } = feature;
            return (
              <BentoCard
                key={name}
                name={name}
                className={className || ""}
                Icon={Icon}
                description={description}
                background={
                  <Icon className="size-96 text-secondary/80 absolute top-0 left-0" />
                }
                href={href || "/docs"}
                cta={cta || "Learn more"}
              />
            );
          })}
        </BentoGrid>
      </section>
      <section id="visualization"></section>
    </main>
  );
}
