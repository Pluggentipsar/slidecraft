"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const CONTENT_DIR = path.join(process.cwd(), "content");

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/.test(slug);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function uniqueSlug(base: string): string {
  if (!fs.existsSync(path.join(CONTENT_DIR, `${base}.mdx`))) return base;
  let i = 2;
  while (fs.existsSync(path.join(CONTENT_DIR, `${base}-${i}.mdx`))) {
    i++;
  }
  return `${base}-${i}`;
}

/**
 * Duplicera en befintlig presentation → ny fil med "{slug}-kopia.mdx"
 * (eller -kopia-2, -3 om den finns).
 */
export async function duplicatePresentation(
  slug: string
): Promise<{ ok: boolean; newSlug?: string; error?: string }> {
  try {
    if (!isValidSlug(slug)) return { ok: false, error: "Ogiltig slug" };
    const src = path.join(CONTENT_DIR, `${slug}.mdx`);
    if (!fs.existsSync(src)) return { ok: false, error: "Presentation finns inte" };

    const base = uniqueSlug(`${slug}-kopia`);
    const dst = path.join(CONTENT_DIR, `${base}.mdx`);

    // Läs källan, justera title i frontmatter så kopian går att skilja från original
    const raw = fs.readFileSync(src, "utf-8");
    const adjusted = raw.replace(
      /^(---[\s\S]*?\ntitle:\s*)(.+?)(\r?\n)/,
      (match, pre, title, nl) => {
        const cleanTitle = title.replace(/^["']|["']$/g, "").trim();
        return `${pre}${JSON.stringify(`${cleanTitle} (kopia)`)}${nl}`;
      }
    );

    fs.writeFileSync(dst, adjusted, "utf-8");

    revalidatePath("/");
    revalidatePath(`/${base}`);
    return { ok: true, newSlug: base };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Okänt fel" };
  }
}

/**
 * Skapa en ny, tom presentation. Returnerar slug:en så klienten kan
 * navigera direkt till /slug/edit.
 */
export async function createPresentation(input: {
  title: string;
  theme?: string;
  tags?: string[];
}): Promise<{ ok: boolean; slug?: string; error?: string }> {
  try {
    const title = (input.title || "").trim();
    if (!title) return { ok: false, error: "Titel krävs" };

    const base = slugify(title) || "ny-presentation";
    const slug = uniqueSlug(base);
    const theme = input.theme || "default";
    const tagsLine =
      input.tags && input.tags.length > 0
        ? `\ntags: [${input.tags.map((t) => JSON.stringify(t)).join(", ")}]`
        : "";

    const body = `---
title: ${JSON.stringify(title)}
date: "${new Date().toISOString().slice(0, 10)}"
theme: ${theme}${tagsLine}
---

<TitleSlide
  title=${JSON.stringify(title)}
  date="${new Date().toISOString().slice(0, 10)}"
/>

<GiantText align="center">
  Första **slagkraftiga** meningen.
</GiantText>
`;

    fs.writeFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), body, "utf-8");

    revalidatePath("/");
    revalidatePath(`/${slug}`);
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Okänt fel" };
  }
}
