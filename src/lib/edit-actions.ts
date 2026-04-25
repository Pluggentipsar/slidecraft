"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import type { ParsedPresentation } from "./mdx-parser";
import { serializeMdx } from "./mdx-parser";

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Server action: skriv tillbaka en redigerad presentation till disk.
 * Revaliderar både presentation-route och edit-route.
 */
export async function savePresentation(
  slug: string,
  parsed: ParsedPresentation
): Promise<{ ok: boolean; error?: string }> {
  try {
    // Validera slug - bara enkla filnamnstecken
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return { ok: false, error: "Ogiltig slug" };
    }

    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
      return { ok: false, error: "Presentation finns inte" };
    }

    const serialized = serializeMdx(parsed);
    fs.writeFileSync(filePath, serialized, "utf-8");

    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/edit`);

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Okänt fel";
    return { ok: false, error: message };
  }
}
