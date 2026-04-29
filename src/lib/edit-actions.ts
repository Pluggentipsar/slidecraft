"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import type { ParsedPresentation } from "./mdx-parser";
import { parseMdx, serializeMdx } from "./mdx-parser";

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

/**
 * Server action: uppdatera en specifik prop på en specifik slide.
 *
 * Används av M-mode (presenter-vyn) för snabba edits utan att gå in i
 * editor-vyn. Tomt värde tar bort propet helt.
 */
export async function updateSlideProp(
  slug: string,
  slideIndex: number,
  propName: string,
  value: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return { ok: false, error: "Ogiltig slug" };
    }
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(propName)) {
      return { ok: false, error: "Ogiltigt prop-namn" };
    }

    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
      return { ok: false, error: "Presentation finns inte" };
    }

    const source = fs.readFileSync(filePath, "utf-8");
    const parsed = parseMdx(source);

    if (slideIndex < 0 || slideIndex >= parsed.slides.length) {
      return { ok: false, error: "Slide-index utanför range" };
    }

    const slide = parsed.slides[slideIndex];
    const newProps = { ...slide.props };
    if (value === "") {
      delete newProps[propName];
    } else {
      newProps[propName] = value;
    }

    parsed.slides[slideIndex] = { ...slide, props: newProps };

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
