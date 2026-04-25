export interface BrandWatermark {
  /** Path till logo (PNG med transparens funkar bäst) */
  logo: string;
  /** Liten text bredvid logon, t.ex. tagline eller produktnamn */
  tagline?: string;
  /** Position på slide. Default "bottom-left". */
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  /** Max-höjd på logon i CSS-enheter (default "1.5rem") */
  size?: string;
  /** Opacity 0-1 (default 0.55) */
  opacity?: number;
  /** Dölj på första sliden (där logon redan dominerar). Default true. */
  hideOnFirst?: boolean;
}

export interface PresentationMeta {
  slug: string;
  title: string;
  event?: string;
  author?: string;
  date?: string;
  theme?: string;
  description?: string;
  brand?: BrandWatermark;
  /** Taggar från frontmatter: ["pitch", "workshop", "extern"] osv. */
  tags?: string[];
  /** ISO-datum (YYYY-MM-DD) för senaste ändring, från fil-mtime */
  updatedAt?: string;
  /** Antal slides i presentationen (räknas vid build-tid) */
  slideCount?: number;
  /**
   * Subtil ambient-partikelbakgrund bakom textslides.
   * - `true` → aktiv på alla slides
   * - `"21-25"` → aktiv endast på slides 21–25 (1-indexerat)
   * - `false` / utelämnad → aldrig
   */
  ambient?: boolean | string;
  /**
   * Hur presentationen får deployas/visas av publiken.
   * - `"full"` (default) — allt (MDX + media) serveras från deployad version
   * - `"cloud-media"` — MDX deployad, media hämtas från extern storage
   *   (t.ex. Supabase Storage). Använder absoluta URL:er i MDX.
   * - `"local-only"` — media finns bara lokalt. Audience-vyn visar
   *   platshållare istället för bilder/video. Presentera från din laptop
   *   (via npm run present eller Cloudflare Tunnel).
   */
  deploy?: "full" | "cloud-media" | "local-only";
}

export interface PresentationFile {
  meta: PresentationMeta;
  /** MDX body utan frontmatter (för PresentationRenderer) */
  content: string;
  /** Fullständig fil-råtext inklusive frontmatter (för editor som ska parse:a själv) */
  raw: string;
}
