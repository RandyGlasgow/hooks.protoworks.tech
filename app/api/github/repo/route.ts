import { NextResponse } from "next/server";

const GITHUB_OWNER = "RandyGlasgow";
const GITHUB_REPO = "react-ripple-effect";

export const revalidate = 3600; // Revalidate every hour

interface GitHubRepoResponse {
  stargazers_count: number;
  forks_count: number;
  description: string | null;
  language: string | null;
  license: {
    name: string;
  } | null;
  topics: string[];
  [key: string]: unknown;
}

interface GitHubContentResponse {
  content: string;
  encoding: string;
  [key: string]: unknown;
}

interface PackageJson {
  name: string;
  version: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    // Fetch repository metadata
    const repoResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }
      if (repoResponse.status === 429) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch repository data" },
        { status: repoResponse.status }
      );
    }

    const repoData: GitHubRepoResponse = await repoResponse.json();

    // Fetch package.json
    const packageJsonResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/package.json`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      }
    );

    let packageJson: PackageJson | null = null;

    if (packageJsonResponse.ok) {
      const contentData: GitHubContentResponse =
        await packageJsonResponse.json();

      if (contentData.encoding === "base64" && contentData.content) {
        try {
          const decodedContent = Buffer.from(
            contentData.content,
            "base64"
          ).toString("utf-8");
          packageJson = JSON.parse(decodedContent) as PackageJson;
        } catch (error) {
          console.error("Failed to decode or parse package.json:", error);
          // Continue without package.json data
        }
      }
    }

    // Fetch README.md
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/README.md`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      }
    );

    let readme: string | null = null;

    if (readmeResponse.ok) {
      const readmeData: GitHubContentResponse = await readmeResponse.json();

      if (readmeData.encoding === "base64" && readmeData.content) {
        try {
          readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
        } catch (error) {
          console.error("Failed to decode README:", error);
          // Continue without README data
        }
      }
    }

    return NextResponse.json(
      {
        repository: {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          description: repoData.description,
          language: repoData.language,
          license: repoData.license?.name || null,
          topics: repoData.topics || [],
          readme: readme,
        },
        package: packageJson
          ? {
              name: packageJson.name,
              version: packageJson.version,
            }
          : null,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching GitHub repository data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
