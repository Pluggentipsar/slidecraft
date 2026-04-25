/**
 * Tema-system.
 *
 * Ett tema definierar ett komplett formspråk:
 * - Färger
 * - Typografi (fonts, weights, letter-spacing, case)
 * - Geometri (radius, borders, shadows)
 * - Motion (easing, durations, entrance-stil)
 * - Ornamentik (accent-linjer, decorations)
 *
 * Tema sätts i MDX frontmatter: theme: sunset
 */

export interface ThemeTokens {
  // Färger
  bg: string;
  bgSurface: string;
  text: string;
  textMuted: string;
  accent: string;
  accentGlow: string;
  accentDim: string;

  // Typografi
  fontDisplay: string; // För rubriker (heading)
  fontBody: string; // För löptext
  fontMono: string; // För kod och caption-text
  headingWeight: number | string; // 400, 500, 700, etc
  headingTracking: string; // letter-spacing (tex "-0.03em")
  headingCase: "normal" | "uppercase" | "lowercase";
  bodyTracking: string;

  // Geometri
  radius: string; // border-radius (tex "0.75rem" eller "0")
  borderWidth: string; // border thickness (tex "1px")
  slideMaxWidth: string; // content max-width (tex "72rem")

  // Motion
  motionEase: string; // CSS cubic-bezier
  motionDuration: string; // "0.6s"
  entranceStyle: "fade" | "slide" | "scale" | "snap"; // slide entry-animation

  // Ornament
  ornamentStyle: "line" | "starburst" | "dot" | "none" | "square";
  ornamentColor: string; // brukar matcha accent eller text

  // Valfri decoration-URL (tex noise-texture)
  backgroundTexture?: string;
}

export const themes: Record<string, ThemeTokens> = {
  /**
   * DEFAULT - Modern elegans.
   * Fraunces (serif) + Inter. Varm mörk palett med cyan accent.
   * Precision och balans.
   */
  default: {
    bg: "#0b0c0f",
    bgSurface: "#14161b",
    text: "#ece9e2",
    textMuted: "#8a8a92",
    accent: "#06b6d4",
    accentGlow: "rgba(6, 182, 212, 0.35)",
    accentDim: "rgba(6, 182, 212, 0.15)",

    fontDisplay: '"Fraunces", "Iowan Old Style", "Palatino", serif',
    fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", "Consolas", monospace',
    headingWeight: 600,
    headingTracking: "-0.025em",
    headingCase: "normal",
    bodyTracking: "0",

    radius: "0.75rem",
    borderWidth: "1px",
    slideMaxWidth: "72rem",

    motionEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    motionDuration: "0.6s",
    entranceStyle: "slide",

    ornamentStyle: "line",
    ornamentColor: "var(--accent)",
  },

  /**
   * SUNSET - Värme, melankoli, berättande.
   * Playfair Display för rubriker, Manrope för text.
   * Mjuka former, varmare färgskala.
   */
  sunset: {
    bg: "#1a0a14",
    bgSurface: "#251320",
    text: "#f4e8dc",
    textMuted: "#a09290",
    accent: "#ff6b6b",
    accentGlow: "rgba(255, 107, 107, 0.4)",
    accentDim: "rgba(255, 107, 107, 0.15)",

    fontDisplay: '"Playfair Display", "Georgia", serif',
    fontBody: '"Manrope", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    headingWeight: 700,
    headingTracking: "-0.02em",
    headingCase: "normal",
    bodyTracking: "0",

    radius: "1rem",
    borderWidth: "1px",
    slideMaxWidth: "72rem",

    motionEase: "cubic-bezier(0.16, 1, 0.3, 1)",
    motionDuration: "0.7s",
    entranceStyle: "fade",

    ornamentStyle: "line",
    ornamentColor: "var(--accent)",
  },

  /**
   * EDITORIAL - Som en fin tidskrift. Serif genomgående.
   * Instrument Serif + Inter. Lugn, vågad, självklar.
   */
  editorial: {
    bg: "#14120e",
    bgSurface: "#1d1a14",
    text: "#f2ede0",
    textMuted: "#958e7a",
    accent: "#d4a24c",
    accentGlow: "rgba(212, 162, 76, 0.35)",
    accentDim: "rgba(212, 162, 76, 0.15)",

    fontDisplay: '"Instrument Serif", "Iowan Old Style", "Didot", serif',
    fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    headingWeight: 400,
    headingTracking: "-0.02em",
    headingCase: "normal",
    bodyTracking: "0.01em",

    radius: "0.25rem",
    borderWidth: "1px",
    slideMaxWidth: "68rem",

    motionEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    motionDuration: "0.6s",
    entranceStyle: "fade",

    ornamentStyle: "line",
    ornamentColor: "var(--accent)",
  },

  /**
   * MINIMAL - Ljust, lugnt, svart och vitt.
   * Maxentioness. Inget dekorativt.
   */
  minimal: {
    bg: "#f8f7f4",
    bgSurface: "#ebeae7",
    text: "#0a0a0a",
    textMuted: "#666666",
    accent: "#0a0a0a",
    accentGlow: "rgba(0, 0, 0, 0.1)",
    accentDim: "rgba(0, 0, 0, 0.08)",

    fontDisplay: '"Inter", system-ui, sans-serif',
    fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    headingWeight: 700,
    headingTracking: "-0.03em",
    headingCase: "normal",
    bodyTracking: "0",

    radius: "0.25rem",
    borderWidth: "1px",
    slideMaxWidth: "64rem",

    motionEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    motionDuration: "0.4s",
    entranceStyle: "fade",

    ornamentStyle: "none",
    ornamentColor: "var(--text)",
  },

  /**
   * RETRO_FUTURISM - 80-tals synthwave möter sci-fi.
   * Space Grotesk + mono, glow överallt, magenta/cyan.
   */
  retro_futurism: {
    bg: "#07051a",
    bgSurface: "#0f0a2a",
    text: "#e8e6ff",
    textMuted: "#8a85b8",
    accent: "#ff2a6d",
    accentGlow: "rgba(255, 42, 109, 0.5)",
    accentDim: "rgba(255, 42, 109, 0.18)",

    fontDisplay: '"Space Grotesk", "Inter", sans-serif',
    fontBody: '"Space Grotesk", "Inter", sans-serif',
    fontMono: '"JetBrains Mono", "Courier New", monospace',
    headingWeight: 700,
    headingTracking: "-0.02em",
    headingCase: "uppercase",
    bodyTracking: "0.02em",

    radius: "0",
    borderWidth: "2px",
    slideMaxWidth: "72rem",

    motionEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    motionDuration: "0.3s",
    entranceStyle: "snap",

    ornamentStyle: "square",
    ornamentColor: "var(--accent)",
  },

  /**
   * OMTNK — Mörk teal, mintaccent. (Example/brand theme.)
   *
   * Lågmäld, värdig palett. Ursprungligen byggt för en samtalsstöd-
   * produkt för kommuner — sparat som exempel på en brand-specifik
   * tema-profil. Kopiera och anpassa för din egen produkt/brand.
   */
  omtnk: {
    bg: "#2d5450",
    bgSurface: "#244542",
    text: "#ffffff",
    textMuted: "rgba(255, 255, 255, 0.7)",
    accent: "#90e6d4",
    accentGlow: "rgba(144, 230, 212, 0.4)",
    accentDim: "rgba(144, 230, 212, 0.15)",

    fontDisplay: '"Fraunces", "Iowan Old Style", "Palatino", serif',
    fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    headingWeight: 500,
    headingTracking: "-0.02em",
    headingCase: "normal",
    bodyTracking: "0",

    radius: "0.75rem",
    borderWidth: "1px",
    slideMaxWidth: "72rem",

    motionEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    motionDuration: "0.7s",
    entranceStyle: "fade",

    ornamentStyle: "line",
    ornamentColor: "var(--accent)",
  },

  /**
   * KARLSKRONA — Editorial, fotografisk, jordnära. (Example theme.)
   *
   * Konjak-accent, tegel för moment-text, djup salvia som sekundärt.
   * Fungerar mot atmosfäriska fotobakgrunder (persika/salvia/karamell)
   * + kräm + svart. Bra utgångspunkt för editorial-narrativa
   * presentationer.
   */
  karlskrona: {
    bg: "#0a0908",
    bgSurface: "#1a1512",
    text: "#f7f1e6",
    textMuted: "rgba(247, 241, 230, 0.65)",
    accent: "#b4763a",
    accentGlow: "rgba(180, 118, 58, 0.35)",
    accentDim: "rgba(180, 118, 58, 0.15)",

    fontDisplay: '"Fraunces", "Iowan Old Style", "Palatino", serif',
    fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    headingWeight: 500,
    headingTracking: "-0.025em",
    headingCase: "normal",
    bodyTracking: "0.01em",

    radius: "0.5rem",
    borderWidth: "1px",
    slideMaxWidth: "72rem",

    motionEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    motionDuration: "0.7s",
    entranceStyle: "fade",

    ornamentStyle: "line",
    ornamentColor: "var(--accent)",
  },

  /**
   * FOREST - Grön, lugn, naturinspirerad.
   */
  forest: {
    bg: "#0a120c",
    bgSurface: "#121d14",
    text: "#e8ede4",
    textMuted: "#89958c",
    accent: "#7ed957",
    accentGlow: "rgba(126, 217, 87, 0.35)",
    accentDim: "rgba(126, 217, 87, 0.15)",

    fontDisplay: '"Fraunces", serif',
    fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    headingWeight: 500,
    headingTracking: "-0.02em",
    headingCase: "normal",
    bodyTracking: "0",

    radius: "0.5rem",
    borderWidth: "1px",
    slideMaxWidth: "72rem",

    motionEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    motionDuration: "0.7s",
    entranceStyle: "fade",

    ornamentStyle: "line",
    ornamentColor: "var(--accent)",
  },
};

export function getTheme(name?: string): ThemeTokens {
  if (!name) return themes.default;
  return themes[name] ?? themes.default;
}

/**
 * Konverterar tema-tokens till CSS-variabler som kan injiceras via style-attribut.
 */
export function themeToCssVars(theme: ThemeTokens): Record<string, string> {
  return {
    // Färger
    "--bg": theme.bg,
    "--bg-surface": theme.bgSurface,
    "--text": theme.text,
    "--text-muted": theme.textMuted,
    "--accent": theme.accent,
    "--accent-glow": theme.accentGlow,
    "--accent-dim": theme.accentDim,

    // Typografi
    "--font-display": theme.fontDisplay,
    "--font-body": theme.fontBody,
    "--font-mono": theme.fontMono,
    "--heading-weight": String(theme.headingWeight),
    "--heading-tracking": theme.headingTracking,
    "--heading-case": theme.headingCase,
    "--body-tracking": theme.bodyTracking,

    // Geometri
    "--radius": theme.radius,
    "--border-width": theme.borderWidth,
    "--slide-max-width": theme.slideMaxWidth,

    // Motion
    "--motion-ease": theme.motionEase,
    "--motion-duration": theme.motionDuration,

    // Ornament
    "--ornament-color": theme.ornamentColor,
  };
}
