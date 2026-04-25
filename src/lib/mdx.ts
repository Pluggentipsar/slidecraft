import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BrandWatermark, PresentationFile, PresentationMeta } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getPresentationSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPresentation(slug: string): PresentationFile | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const dateStr =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : data.date
        ? String(data.date)
        : undefined;

  const brand: BrandWatermark | undefined =
    data.brand && typeof data.brand === "object" && data.brand.logo
      ? {
          logo: String(data.brand.logo),
          tagline: data.brand.tagline ? String(data.brand.tagline) : undefined,
          position: data.brand.position ?? "bottom-left",
          size: data.brand.size ?? "1.5rem",
          opacity:
            typeof data.brand.opacity === "number" ? data.brand.opacity : 0.55,
          hideOnFirst:
            typeof data.brand.hideOnFirst === "boolean"
              ? data.brand.hideOnFirst
              : true,
        }
      : undefined;

  // Tags: accepterar array, comma-separerad string, eller saknas
  const tags: string[] | undefined = Array.isArray(data.tags)
    ? data.tags.map((t) => String(t).trim()).filter(Boolean)
    : typeof data.tags === "string"
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

  // File mtime → ISO-datum (YYYY-MM-DD)
  let updatedAt: string | undefined;
  try {
    const stat = fs.statSync(filePath);
    updatedAt = stat.mtime.toISOString().slice(0, 10);
  } catch {
    updatedAt = undefined;
  }

  // Slide-count: räknar top-level JSX-element som inte är <Notes>.
  // Enkel regex (inte AST) men tillräckligt exakt för översikten.
  const slideCount = (() => {
    const lines = content.split("\n");
    let count = 0;
    let insideNotes = false;
    for (const line of lines) {
      if (/^<\/Notes>/.test(line)) {
        insideNotes = false;
        continue;
      }
      if (/^<Notes>/.test(line)) {
        insideNotes = true;
        continue;
      }
      if (insideNotes) continue;
      if (/^<[A-Z][A-Za-z0-9]*/.test(line)) count++;
    }
    return count > 0 ? count : undefined;
  })();

  const meta: PresentationMeta = {
    slug,
    title: data.title ?? slug,
    event: data.event,
    author: data.author,
    date: dateStr,
    theme: data.theme ?? "default",
    description: data.description,
    brand,
    tags,
    updatedAt,
    slideCount,
    ambient:
      data.ambient === true
        ? true
        : typeof data.ambient === "string"
          ? data.ambient
          : false,
    deploy:
      data.deploy === "cloud-media" ||
      data.deploy === "local-only" ||
      data.deploy === "full"
        ? data.deploy
        : undefined,
  };

  return { meta, content, raw };
}

export function getAllPresentations(): PresentationMeta[] {
  return getPresentationSlugs()
    .map((slug) => getPresentation(slug)?.meta)
    .filter((meta): meta is PresentationMeta => meta !== undefined)
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      return a.title.localeCompare(b.title);
    });
}
