import { AuroraText } from "@/components/ui/aurora-text";
import { Button } from "@/components/ui/base-button";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-2">
      <section
        id="hero"
        className="h-[95vh] flex flex-col gap-6 justify-center items-center"
      >
        <h1 className="text-5xl font-bold max-w-3xl text-center tracking-tighter">
          A tiny, hook based <AuroraText>event bus</AuroraText> for React.
        </h1>
        <p className="text-lg text-center max-w-xl mx-auto text-muted-foreground">
          Let your components communicate via named events. Type-safe,
          lightweight, and built with hooks.
        </p>
        <div className="flex gap-4">
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
      </section>
      <section id="features">
        <h2 className="text-2xl font-bold">Features</h2>
      </section>
      <section id="visualization"></section>
    </main>
  );
}
