import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export type NavItem = {
  title: string;
  url: string;
  isActive?: boolean;
};

export type NavSection = {
  title: string;
  url: string;
  items: NavItem[];
};

export type DocsNavigation = {
  navMain: NavSection[];
};

/**
 * Converts kebab-case or snake_case to Title Case
 */
function toTitleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Converts a title to a URL-friendly slug
 */
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Extracts ExampleSection titles from an MDX file
 */
function extractExampleSections(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, "utf-8");
    // Match ExampleSection components with title prop
    const regex = /<ExampleSection\s+[^>]*title=["']([^"']+)["']/g;
    const titles: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      titles.push(match[1]);
    }

    return titles;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

/**
 * Recursively scans the docs directory and generates navigation structure
 */
function scanDocsDirectory(
  dirPath: string,
  basePath: string = "/docs",
  relativePath: string = ""
): NavSection[] {
  const sections: NavSection[] = [];
  const entries = readdirSync(dirPath, { withFileTypes: true });

  // Separate directories and files
  const directories = entries.filter((entry) => entry.isDirectory());
  const files = entries.filter((entry) => entry.isFile());

  // Process directories (sections)
  for (const dir of directories) {
    const dirPathFull = join(dirPath, dir.name);
    const dirRelativePath = relativePath
      ? `${relativePath}/${dir.name}`
      : dir.name;
    const dirUrl = `${basePath}/${dirRelativePath}`;

    // Look for any .mdx or .md file in this directory
    const allFiles = readdirSync(dirPathFull, { withFileTypes: true });
    const mdxFiles = allFiles.filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))
    );

    if (mdxFiles.length > 0) {
      // Find the main file (prefer page.mdx/page.md, otherwise use first file)
      const pageFile =
        mdxFiles.find(
          (entry) => entry.name === "page.mdx" || entry.name === "page.md"
        ) || mdxFiles[0];

      const mainFileName = pageFile.name.replace(/\.(mdx|md)$/, "");
      const isPageFile =
        pageFile.name === "page.mdx" || pageFile.name === "page.md";

      // URL: if it's page.mdx, use directory URL; otherwise use directory + filename
      const mainFileUrl = isPageFile ? dirUrl : `${dirUrl}/${mainFileName}`;

      // Title: use the actual filename (or directory name if it's page.mdx)
      const mainFileTitle = isPageFile
        ? toTitleCase(dir.name)
        : toTitleCase(mainFileName);

      // This directory has a page, so it's a section with a page
      const items: NavItem[] = [];

      // Check for ExampleSection components in the main file
      const mainFilePath = join(dirPathFull, pageFile.name);
      const exampleTitles = extractExampleSections(mainFilePath);

      // Check for nested items (other files or subdirectories)
      const nestedDirs = allFiles.filter((entry) => entry.isDirectory());
      const nestedFiles = mdxFiles.filter(
        (entry) => entry.name !== pageFile.name
      );

      // Determine if we should show nested content
      // Show nested if: there are examples, other files, or subdirectories
      const hasNestedContent =
        exampleTitles.length > 0 ||
        nestedFiles.length > 0 ||
        nestedDirs.length > 0;

      if (hasNestedContent) {
        // Add example sections as nested items
        for (const exampleTitle of exampleTitles) {
          const exampleSlug = toSlug(exampleTitle);
          items.push({
            title: exampleTitle,
            url: `${mainFileUrl}#${exampleSlug}`,
          });
        }

        // Add nested files as items
        for (const file of nestedFiles) {
          const fileName = file.name.replace(/\.(mdx|md)$/, "");
          items.push({
            title: toTitleCase(fileName),
            url: `${dirUrl}/${fileName}`,
          });
        }

        // Recursively process nested directories
        for (const nestedDir of nestedDirs) {
          const nestedDirPath = join(dirPathFull, nestedDir.name);

          // Check if nested directory has its own .mdx or .md file
          const nestedMdxFiles = readdirSync(nestedDirPath, {
            withFileTypes: true,
          }).filter(
            (entry) =>
              entry.isFile() &&
              (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))
          );

          // If nested directory has an .mdx/.md file, skip it (it will be a separate section)
          // Only process nested directories without .mdx/.md files as items
          if (nestedMdxFiles.length === 0) {
            const nestedItems = scanDocsDirectory(
              nestedDirPath,
              basePath,
              `${dirRelativePath}/${nestedDir.name}`
            );
            // Flatten nested sections into items
            for (const nestedSection of nestedItems) {
              items.push(...nestedSection.items);
            }
          }
        }
      }

      sections.push({
        title: mainFileTitle,
        url: mainFileUrl,
        items,
      });
    } else {
      // Directory without any .mdx/.md files - treat as a section container
      const nestedSections = scanDocsDirectory(
        dirPathFull,
        basePath,
        dirRelativePath
      );
      sections.push(...nestedSections);
    }
  }

  // Process standalone files in root (if any)
  for (const file of files) {
    if (file.name.endsWith(".mdx") || file.name.endsWith(".md")) {
      const fileName = file.name.replace(/\.(mdx|md)$/, "");
      const fileUrl = relativePath
        ? `${basePath}/${relativePath}/${fileName}`
        : `${basePath}/${fileName}`;

      // If we don't have a section for this yet, create one
      if (
        sections.length === 0 ||
        sections[sections.length - 1].items.length > 0
      ) {
        sections.push({
          title: "Documentation",
          url: basePath,
          items: [],
        });
      }

      const lastSection = sections[sections.length - 1];
      lastSection.items.push({
        title: toTitleCase(fileName),
        url: fileUrl,
      });
    }
  }

  return sections;
}

/**
 * Generates navigation structure from the docs directory
 */
export function getDocsNavigation(): DocsNavigation {
  const docsPath = join(process.cwd(), "app", "docs");

  try {
    const navMain = scanDocsDirectory(docsPath);
    return { navMain };
  } catch (error) {
    console.error("Error scanning docs directory:", error);
    return { navMain: [] };
  }
}
