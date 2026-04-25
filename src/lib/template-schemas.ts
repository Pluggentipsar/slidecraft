/**
 * Schema-definitioner för alla templates.
 *
 * Varje template har en lista med fält (props). Fälttyper:
 * - text: Enkel-rads text
 * - multiline: Flera rader (textarea)
 * - select: Dropdown med fasta val
 * - number: Numeriskt värde (som string i MDX)
 * - boolean: On/off
 * - image: Bildpath (string)
 * - color: CSS-färg
 * - list: Lista av strängar (markdown-punkter eller comma-separerade)
 * - children: Innehåll mellan taggar (för templates som tar children)
 *
 * Används av redigeringsläget för att rendera rätt input per fält.
 */

export type FieldType =
  | "text"
  | "multiline"
  | "select"
  | "number"
  | "boolean"
  | "image"
  | "color"
  | "list"
  | "children";

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: string[]; // för select
  default?: string | number | boolean;
  /** Visuell variant. "pills" ger segmented control istället för dropdown. */
  variant?: "pills";
}

export interface TemplateSchema {
  name: string;
  description: string;
  fields: FieldSchema[];
  /** Special: templates som tar barn-komponenter (Timeline → TimelineEvent, Comparison → ComparisonColumn) */
  childrenType?: "slot" | "TimelineEvent" | "ComparisonColumn" | "SpotlightCard" | "TeamMember";
  /** När template har children som är ren text/markdown */
  hasContent?: boolean;
}

export const templateSchemas: Record<string, TemplateSchema> = {
  TitleSlide: {
    name: "TitleSlide",
    description: "Titelsida med titel, undertitel och meta",
    fields: [
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "author", label: "Författare", type: "text" },
      { name: "event", label: "Event", type: "text" },
      { name: "date", label: "Datum", type: "text", placeholder: "2026-04-29" },
      {
        name: "titleSize",
        label: "Titel-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "subtitleSize",
        label: "Undertitel-storlek",
        type: "select",
        options: ["sm", "md", "lg"],
        default: "md",
      },
    ],
  },

  GiantText: {
    name: "GiantText",
    description: "Stort uttalande. **text** blir accent-färgad.",
    fields: [
      {
        name: "align",
        label: "Justering",
        type: "select",
        options: ["left", "center"],
        default: "left",
      },
      {
        name: "size",
        label: "Textstorlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  Quote: {
    name: "Quote",
    description: "Citat med vertikal linje och attribution",
    fields: [
      { name: "attribution", label: "Avsändare", type: "text" },
      { name: "context", label: "Kontext (UPPERCASE tag)", type: "text" },
      {
        name: "size",
        label: "Citat-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  ImageText: {
    name: "ImageText",
    description: "Bild + text, split-layout",
    fields: [
      { name: "image", label: "Bild", type: "image", required: true },
      { name: "alt", label: "Alt-text", type: "text" },
      {
        name: "layout",
        label: "Bildens position",
        type: "select",
        options: ["left", "right"],
        default: "left",
      },
    ],
    hasContent: true,
  },

  BulletBuild: {
    name: "BulletBuild",
    description: "Punktlista som byggs fram med steg",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "bulletSize",
        label: "Punkt-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true, // innehåller markdown-lista
  },

  SideScrollList: {
    name: "SideScrollList",
    description: "Stor blobb med siffra, scrollar in",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "blobColor", label: "Blobb-färg", type: "color" },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "pointSize",
        label: "Punkt-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  NumberedReveal: {
    name: "NumberedReveal",
    description: "Numrerad lista med pil-animation",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "itemSize",
        label: "Punkt-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  Timeline: {
    name: "Timeline",
    description: "Tidslinje med noder",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      {
        name: "orientation",
        label: "Riktning",
        type: "select",
        options: ["horizontal", "vertical"],
        default: "horizontal",
      },
    ],
    childrenType: "TimelineEvent",
  },

  TimelineEvent: {
    name: "TimelineEvent",
    description: "Händelse i en tidslinje",
    fields: [
      { name: "date", label: "Datum/år", type: "text", required: true, placeholder: "2023" },
      { name: "title", label: "Titel", type: "text" },
    ],
    hasContent: true,
  },

  Reflection: {
    name: "Reflection",
    description: "Reflektionsfrågor med steg",
    fields: [
      { name: "title", label: "Huvudfråga", type: "text" },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text", default: "Reflektion" },
      { name: "duration", label: "Duration", type: "text", placeholder: "5 min i par" },
      {
        name: "titleSize",
        label: "Huvudfråge-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "questionSize",
        label: "Fråge-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  Comparison: {
    name: "Comparison",
    description: "Två kolumner sida vid sida",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      {
        name: "accentSide",
        label: "Accent-sida",
        type: "select",
        options: ["left", "right", "none"],
        default: "right",
      },
    ],
    childrenType: "ComparisonColumn",
  },

  ComparisonColumn: {
    name: "ComparisonColumn",
    description: "Kolumn i en jämförelse",
    fields: [{ name: "title", label: "Kolumn-titel", type: "text", required: true }],
    hasContent: true,
  },

  StatCounter: {
    name: "StatCounter",
    description: "Animerad siffra",
    fields: [
      { name: "value", label: "Siffra", type: "number", required: true },
      { name: "suffix", label: "Suffix (t.ex. %)", type: "text" },
      { name: "prefix", label: "Prefix", type: "text" },
      { name: "label", label: "Förklarande text", type: "multiline" },
      { name: "source", label: "Källa (UPPERCASE)", type: "text" },
      { name: "decimals", label: "Antal decimaler", type: "number", default: 0 },
      { name: "duration", label: "Animationstid (sek)", type: "number", default: 1.6 },
    ],
  },

  CodeReveal: {
    name: "CodeReveal",
    description: "Kod/prompt som typas ut",
    fields: [
      { name: "language", label: "Språk", type: "text", default: "text" },
      { name: "title", label: "Rubrik", type: "text" },
      { name: "caption", label: "Undertext", type: "text" },
      { name: "speed", label: "Hastighet (ms/tecken)", type: "number", default: 15 },
      {
        name: "mode",
        label: "Läge",
        type: "select",
        options: ["typewriter", "instant"],
        default: "typewriter",
      },
    ],
    hasContent: true,
  },

  PromptAnimation: {
    name: "PromptAnimation",
    description: "Prompt typas och resultat visas bredvid",
    fields: [
      { name: "promptText", label: "Prompt-text", type: "multiline", required: true },
      { name: "resultText", label: "Resultattext", type: "multiline" },
      {
        name: "layout",
        label: "Layout",
        type: "select",
        options: ["left", "right"],
        default: "right",
      },
      { name: "typeSpeed", label: "Typhastighet (ms)", type: "number", default: 25 },
      {
        name: "codeSnippet",
        label: "Kodexempel (valfritt)",
        type: "multiline",
        hint: "Visas mellan prompt och resultat. Lämna tomt för att hoppa över.",
      },
    ],
  },

  HeroImage: {
    name: "HeroImage",
    description: "Full-bild bakgrund med text-overlay",
    fields: [
      { name: "src", label: "Bild", type: "image", required: true },
      { name: "alt", label: "Alt-text", type: "text" },
      {
        name: "align",
        label: "Textposition",
        type: "select",
        options: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
        default: "bottom-left",
      },
      {
        name: "gradient",
        label: "Gradient-riktning",
        type: "select",
        options: ["top", "bottom", "left", "right", "none"],
        default: "bottom",
      },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number", default: 0.35 },
      { name: "blur", label: "Blurra bild", type: "boolean" },
    ],
    hasContent: true,
  },

  LayeredText: {
    name: "LayeredText",
    description: "Text + urklippt subjekt (PNG rekommenderas)",
    fields: [
      { name: "image", label: "Bild", type: "image", required: true },
      { name: "alt", label: "Alt-text", type: "text" },
      {
        name: "imagePosition",
        label: "Bildposition",
        type: "select",
        options: ["left", "right", "center"],
        default: "right",
      },
      { name: "imageSize", label: "Storlek (%)", type: "number", default: 85 },
      { name: "background", label: "Bakgrundsfärg", type: "color" },
      { name: "textColor", label: "Textfärg", type: "color" },
      { name: "textInFront", label: "Text framför bild", type: "boolean" },
    ],
    hasContent: true,
  },

  ImageBleed: {
    name: "ImageBleed",
    description: "Bild spiller ut i hörn med rotation",
    fields: [
      { name: "image", label: "Bild", type: "image", required: true },
      {
        name: "corner",
        label: "Hörn",
        type: "select",
        options: ["top-right", "bottom-right", "top-left", "bottom-left"],
        default: "top-right",
      },
      { name: "size", label: "Storlek (%)", type: "number", default: 55 },
      { name: "rotate", label: "Rotation (grader)", type: "number", default: 0 },
    ],
    hasContent: true,
  },

  Collage: {
    name: "Collage",
    description: "Flera bilder i rutnät",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "images", label: "Bilder (komma-separerat)", type: "multiline", required: true },
      {
        name: "layout",
        label: "Layout",
        type: "select",
        options: ["grid-2", "grid-3", "grid-4", "grid-5-hero", "auto"],
        default: "auto",
      },
    ],
  },

  PictureQuote: {
    name: "PictureQuote",
    description: "Citat med porträttbild",
    fields: [
      { name: "image", label: "Porträttbild", type: "image", required: true },
      { name: "attribution", label: "Namn", type: "text", required: true },
      { name: "context", label: "Kontext (UPPERCASE)", type: "text" },
      {
        name: "imagePosition",
        label: "Bildposition",
        type: "select",
        options: ["left", "right"],
        default: "left",
      },
      {
        name: "size",
        label: "Citat-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  VideoEmbed: {
    name: "VideoEmbed",
    description: "Inbäddad video",
    fields: [
      { name: "src", label: "Video-URL/path", type: "text", required: true },
      { name: "title", label: "Rubrik", type: "text" },
      { name: "caption", label: "Undertext", type: "text" },
      { name: "autoplay", label: "Autoplay", type: "boolean" },
      { name: "loop", label: "Loop", type: "boolean" },
      { name: "muted", label: "Muted", type: "boolean" },
      {
        name: "aspectRatio",
        label: "Aspect ratio",
        type: "select",
        options: ["16/9", "4/3", "1/1", "9/16"],
        default: "16/9",
      },
    ],
  },

  VideoBackground: {
    name: "VideoBackground",
    description: "Video som bakgrund",
    fields: [
      { name: "src", label: "Video-path", type: "text", required: true },
      {
        name: "align",
        label: "Textposition",
        type: "select",
        options: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
        default: "bottom-left",
      },
      {
        name: "gradient",
        label: "Gradient",
        type: "select",
        options: ["top", "bottom", "left", "right", "none"],
        default: "bottom",
      },
      { name: "overlay", label: "Mörker-opacity", type: "number", default: 0.4 },
      { name: "blur", label: "Blurra video", type: "boolean" },
      { name: "paused", label: "Pausad", type: "boolean", hint: "Stanna första rutan" },
    ],
    hasContent: true,
  },

  SlideshowMorph: {
    name: "SlideshowMorph",
    description: "Bildmorfning mellan flera bilder",
    fields: [
      { name: "images", label: "Bilder (komma-separerat)", type: "multiline", required: true },
      { name: "captions", label: "Rubriker (komma-separerat)", type: "multiline" },
      {
        name: "morph",
        label: "Morfning",
        type: "select",
        options: ["crossfade", "scale", "slide", "zoom-blur"],
        default: "crossfade",
      },
      { name: "showCounter", label: "Visa räknare", type: "boolean", default: true },
      {
        name: "autoPlay",
        label: "Auto-play (sekunder per bild)",
        type: "number",
        hint: "Lämna tomt för manuell stegning",
      },
    ],
  },

  GiantScroll: {
    name: "GiantScroll",
    description: "Gigantisk text som rullar",
    fields: [
      { name: "text", label: "Text", type: "text", required: true },
      {
        name: "direction",
        label: "Riktning",
        type: "select",
        options: ["left", "right"],
        default: "left",
      },
      {
        name: "secondsPerInstance",
        label: "Sekunder per instans",
        type: "number",
        default: 30,
        hint: "Högre = lugnare tempo. 30-60 är lagom.",
      },
      { name: "heightRatio", label: "Höjd (0-1)", type: "number", default: 0.66 },
      { name: "loop", label: "Oändlig loop", type: "boolean", default: true },
      { name: "color", label: "Färg", type: "color" },
      { name: "outline", label: "Endast kontur", type: "boolean" },
    ],
  },

  LayeredScroll: {
    name: "LayeredScroll",
    description: "Bakgrund + rullande ord + objekt framför (editorial moment)",
    fields: [
      { name: "text", label: "Highlight-ord", type: "text", required: true },
      { name: "bgImage", label: "Bakgrundsbild (URL)", type: "text" },
      { name: "bgColor", label: "Bakgrundsfärg (om ingen bild)", type: "color" },
      { name: "foregroundImage", label: "Objektbild (transparent PNG)", type: "text" },
      { name: "foregroundAlt", label: "Alt-text objekt", type: "text" },
      {
        name: "foregroundHeightRatio",
        label: "Objektets höjd (0-1)",
        type: "number",
        default: 0.75,
      },
      { name: "textColor", label: "Textfärg", type: "color", default: "#1a1a1a" },
      {
        name: "direction",
        label: "Riktning",
        type: "select",
        options: ["left", "right"],
        default: "left",
      },
      {
        name: "secondsPerInstance",
        label: "Sekunder per instans",
        type: "number",
        default: 22,
        hint: "Högre = lugnare tempo",
      },
      { name: "heightRatio", label: "Textens höjd (0-1)", type: "number", default: 0.55 },
      {
        name: "fontStyle",
        label: "Font-style",
        type: "select",
        options: ["italic", "normal"],
        default: "italic",
      },
      { name: "loop", label: "Oändlig loop", type: "boolean", default: true },
    ],
  },

  ParticleField: {
    name: "ParticleField",
    description: "Canvas-baserat partikelsystem",
    fields: [
      { name: "count", label: "Antal partiklar", type: "number", default: 600 },
      {
        name: "formations",
        label: "Formations (komma-sep)",
        type: "text",
        hint: "scatter, circle, square, cross, heart, wave, spiral",
      },
      { name: "color", label: "Färg", type: "color" },
      { name: "size", label: "Storlek (px)", type: "number", default: 2.5 },
    ],
  },

  LoadingSlide: {
    name: "LoadingSlide",
    description: "Loading-indikator",
    fields: [
      {
        name: "variant",
        label: "Variant",
        type: "select",
        options: ["spinner", "dots", "pulse", "progress", "orbit"],
        default: "spinner",
      },
      { name: "title", label: "Rubrik", type: "text" },
      { name: "subtitle", label: "Undertext", type: "multiline" },
    ],
  },

  PollQuestion: {
    name: "PollQuestion",
    description: "Interaktiv flervalsfråga",
    fields: [
      { name: "question", label: "Frågan", type: "multiline", required: true },
      { name: "options", label: "Alternativ (komma-sep)", type: "multiline", required: true },
      {
        name: "results",
        label: "Resultat (%, komma-sep)",
        type: "text",
        placeholder: "5, 15, 55, 25",
      },
      { name: "correct", label: "Rätt alternativ (0-indexerat)", type: "number" },
      { name: "reveal", label: "Reveal-text", type: "multiline" },
    ],
  },

  SectionDivider: {
    name: "SectionDivider",
    description: "Avsnittsövergång",
    fields: [
      { name: "number", label: "Nummer (01, 02...)", type: "text" },
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "duration", label: "Duration", type: "text", placeholder: "30 min" },
      {
        name: "variant",
        label: "Variant",
        type: "select",
        options: ["centered", "left", "hero"],
        default: "centered",
      },
      {
        name: "titleSize",
        label: "Titel-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "subtitleSize",
        label: "Undertitel-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
  },

  Callout: {
    name: "Callout",
    description: "Uppmärksamhetsruta med ikon",
    fields: [
      {
        name: "variant",
        label: "Variant",
        type: "select",
        options: ["info", "insight", "warning", "success", "quote", "danger"],
        default: "insight",
      },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "preHeading", label: "För-rubrik", type: "text" },
      {
        name: "titleSize",
        label: "Titel-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "bodySize",
        label: "Brödtext-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  VoiceCollage: {
    name: "VoiceCollage",
    description: "Grid av korta citat - röster från fältet",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  EmotionRow: {
    name: "EmotionRow",
    description: "Rad med färgade kategori-pills (emojis + label)",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      {
        name: "stepped",
        label: "Stega fram en i taget",
        type: "boolean",
        hint: "Space/pil triggar nästa kategori",
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  BeforeAfter: {
    name: "BeforeAfter",
    description: "Prompt + faktiskt resultat (bild/video/text) sida vid sida",
    fields: [
      { name: "promptText", label: "Prompt-text", type: "multiline", required: true },
      { name: "promptLabel", label: "Prompt-etikett", type: "text", default: "Prompt" },
      { name: "resultImage", label: "Resultat (bild)", type: "image" },
      { name: "resultVideo", label: "Resultat (video-path)", type: "text" },
      { name: "resultText", label: "Resultat (text)", type: "multiline" },
      { name: "resultLabel", label: "Resultat-etikett", type: "text", default: "Resultat" },
      { name: "resultCaption", label: "Resultat-caption", type: "text" },
      {
        name: "layout",
        label: "Layout",
        type: "select",
        options: ["row", "column"],
        default: "row",
      },
      { name: "typeSpeed", label: "Typhastighet (ms)", type: "number", default: 20 },
    ],
  },

  Outro: {
    name: "Outro",
    description: "Avslutnings-slide med tack/kontakt/QR-kod",
    fields: [
      { name: "title", label: "Rubrik", type: "text", default: "Tack" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "email", label: "E-post", type: "text" },
      { name: "web", label: "Webbadress", type: "text" },
      { name: "socials", label: "Sociala medier", type: "text" },
      { name: "qrUrl", label: "URL för QR-kod", type: "text" },
      { name: "qrCaption", label: "QR-caption", type: "text" },
      { name: "cta", label: "Call-to-action", type: "text" },
      {
        name: "titleSize",
        label: "Titel-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "lg",
      },
    ],
  },

  StatCompare: {
    name: "StatCompare",
    description: "Två siffror i relation med pil (tex 3% → 68%)",
    fields: [
      { name: "from", label: "Från (siffra)", type: "number", required: true },
      { name: "fromPrefix", label: "Från-prefix", type: "text" },
      { name: "fromSuffix", label: "Från-suffix (tex %)", type: "text" },
      { name: "fromLabel", label: "Från-etikett (tex 2022)", type: "text" },
      { name: "to", label: "Till (siffra)", type: "number", required: true },
      { name: "toPrefix", label: "Till-prefix", type: "text" },
      { name: "toSuffix", label: "Till-suffix", type: "text" },
      { name: "toLabel", label: "Till-etikett", type: "text" },
      { name: "title", label: "Rubrik", type: "text" },
      { name: "caption", label: "Caption (förklarar statistiken)", type: "multiline" },
      { name: "duration", label: "Animationstid (s)", type: "number", default: 1.8 },
      { name: "decimals", label: "Decimaler", type: "number", default: 0 },
    ],
  },

  Passage: {
    name: "Passage",
    description: "Långform text med highlights (**fet** = accent)",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
      {
        name: "align",
        label: "Justering",
        type: "select",
        options: ["left", "center"],
        default: "left",
      },
      {
        name: "width",
        label: "Bredd",
        type: "select",
        options: ["narrow", "wide"],
        default: "narrow",
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "textSize",
        label: "Text-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  MapPins: {
    name: "MapPins",
    description: "Karta med animerade pins på angivna koordinater",
    fields: [
      { name: "mapImage", label: "Karta (bild)", type: "image", required: true },
      { name: "alt", label: "Alt-text", type: "text" },
      { name: "title", label: "Rubrik", type: "text" },
      {
        name: "stepped",
        label: "Stega fram en pin i taget",
        type: "boolean",
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  VideoChapters: {
    name: "VideoChapters",
    description: "Video med klickbara tidsmarkörer i sidopanel",
    fields: [
      { name: "src", label: "Video-path", type: "text", required: true },
      { name: "title", label: "Rubrik", type: "text" },
      { name: "autoPlay", label: "Autoplay", type: "boolean", default: true },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  HotspotImage: {
    name: "HotspotImage",
    description: "Bild med klickbara/stegbara hotspots som visar tooltip",
    fields: [
      { name: "src", label: "Bild", type: "image", required: true },
      { name: "alt", label: "Alt-text", type: "text" },
      { name: "title", label: "Rubrik", type: "text" },
      {
        name: "stepped",
        label: "Stega fram med space",
        type: "boolean",
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  AiConversation: {
    name: "AiConversation",
    description: "Simulerad chatt-dialog - meddelanden typas fram med typing-indikator",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
      { name: "userLabel", label: "Användaretikett", type: "text", default: "Du" },
      { name: "aiLabel", label: "AI-etikett", type: "text", default: "AI" },
      {
        name: "stepped",
        label: "Stega fram med space",
        type: "boolean",
        hint: "Annars auto-play",
      },
      {
        name: "userSpeed",
        label: "User-typhastighet (ms)",
        type: "number",
        default: 8,
      },
      {
        name: "aiSpeed",
        label: "AI-typhastighet (ms)",
        type: "number",
        default: 12,
      },
      {
        name: "thinkingDelay",
        label: "AI tänker (ms)",
        type: "number",
        default: 700,
      },
      {
        name: "betweenDelay",
        label: "Paus mellan meddelanden (ms)",
        type: "number",
        default: 500,
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  BrandIntro: {
    name: "BrandIntro",
    description: "Logo-dominerande öppnings-/avslutsslide med tagline och meta",
    fields: [
      { name: "logo", label: "Logo (path)", type: "image", required: true },
      { name: "alt", label: "Alt-text", type: "text" },
      {
        name: "logoHeight",
        label: "Logo-höjd (vh)",
        type: "number",
        default: 28,
        hint: "Procent av slide-höjd",
      },
      { name: "tagline", label: "Tagline", type: "multiline" },
      { name: "eyebrow", label: "Eyebrow (UPPERCASE)", type: "text" },
      { name: "meta", label: "Meta-rad i botten (UPPERCASE)", type: "text" },
      {
        name: "background",
        label: "Bakgrundsstil",
        type: "select",
        options: ["solid", "radial", "split"],
        default: "radial",
        variant: "pills",
      },
      { name: "bgColor", label: "Bakgrundsfärg (override)", type: "color" },
    ],
    hasContent: true,
  },

  BigStat: {
    name: "BigStat",
    description: "Editorial chock-siffra med kontext ovanför, under och källa",
    fields: [
      { name: "value", label: "Siffra", type: "number", required: true },
      { name: "prefix", label: "Prefix", type: "text" },
      { name: "suffix", label: "Suffix (tex %)", type: "text" },
      { name: "eyebrow", label: "Eyebrow (UPPERCASE)", type: "text" },
      { name: "contextAbove", label: "Kontext ovanför", type: "multiline" },
      { name: "contextBelow", label: "Kontext under", type: "multiline" },
      { name: "source", label: "Källa (UPPERCASE)", type: "text" },
      {
        name: "duration",
        label: "Animationstid (s)",
        type: "number",
        default: 2,
      },
      { name: "decimals", label: "Decimaler", type: "number", default: 0 },
      {
        name: "layout",
        label: "Layout",
        type: "select",
        options: ["editorial", "centered", "frame"],
        default: "editorial",
        variant: "pills",
      },
      { name: "color", label: "Sifferfärg (override)", type: "color" },
    ],
  },

  ChatPreview: {
    name: "ChatPreview",
    description: "Mockad chattwidget i faux browser-frame bredvid text",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
      { name: "description", label: "Beskrivning under titeln", type: "multiline" },
      { name: "widgetName", label: "Widget-namn", type: "text", default: "Chatt" },
      {
        name: "widgetStatus",
        label: "Widget-status",
        type: "text",
        default: "Online nu",
      },
      { name: "widgetAccent", label: "Widget-accent (override)", type: "color" },
      {
        name: "chatPosition",
        label: "Chatt-position",
        type: "select",
        options: ["left", "right"],
        default: "right",
        variant: "pills",
      },
      {
        name: "autoplay",
        label: "Spela upp automatiskt",
        type: "boolean",
        default: true,
      },
      {
        name: "beat",
        label: "Paus mellan meddelanden (ms)",
        type: "number",
        default: 900,
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  MetricGrid: {
    name: "MetricGrid",
    description: "Rutnät av metric-cards (dashboards, vinster, KPI:er) med stagger-reveal",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
      {
        name: "columns",
        label: "Kolumner",
        type: "number",
        hint: "Lämna tomt för auto (2/3/4 baserat på antal items)",
      },
      {
        name: "variant",
        label: "Variant",
        type: "select",
        options: ["card", "minimal", "dashboard"],
        default: "card",
        variant: "pills",
      },
      {
        name: "stagger",
        label: "Stagger mellan items (ms)",
        type: "number",
        default: 80,
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  TierStack: {
    name: "TierStack",
    description: "Stigande accent-nivåer (samtycke, severity, Bloom-stege)",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
      { name: "description", label: "Beskrivning", type: "multiline" },
      {
        name: "orientation",
        label: "Riktning",
        type: "select",
        options: ["horizontal", "vertical"],
        default: "horizontal",
        variant: "pills",
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    hasContent: true,
  },

  TeamIntro: {
    name: "TeamIntro",
    description:
      "Founder/team-presentation med video- eller bild-bakgrund, gradient för läsbarhet och glassmorphism-kort per medlem",
    fields: [
      {
        name: "background",
        label: "Bakgrund (video-path eller bild)",
        type: "text",
        required: true,
      },
      {
        name: "backgroundType",
        label: "Bakgrundstyp",
        type: "select",
        options: ["video", "image"],
        default: "video",
        variant: "pills",
      },
      { name: "title", label: "Stor titel (UPPERCASE)", type: "text", required: true },
      { name: "eyebrow", label: "Eyebrow (UPPERCASE)", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      {
        name: "gradient",
        label: "Gradient",
        type: "select",
        options: ["both", "top", "bottom", "center", "none"],
        default: "both",
        variant: "pills",
      },
      {
        name: "overlay",
        label: "Bakgrunds-mörkning (0–1)",
        type: "number",
        default: 0.35,
      },
      {
        name: "columns",
        label: "Kolumner",
        type: "number",
        hint: "Lämna tomt för auto",
      },
      {
        name: "titleSize",
        label: "Titel-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "lg",
      },
    ],
    childrenType: "slot",
  },

  SpotlightContrast: {
    name: "SpotlightContrast",
    description:
      "Två kort där det andra (hero) växer och stjäl scenen i steg 2 — perfekt för 'A vs B där B är hjälten'",
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
      {
        name: "hero",
        label: "Hjälte-position",
        type: "select",
        options: ["left", "right"],
        default: "right",
        variant: "pills",
      },
      {
        name: "intensity",
        label: "Storleksskillnad",
        type: "select",
        options: ["subtle", "balanced", "dramatic"],
        default: "balanced",
        variant: "pills",
      },
      {
        name: "titleSize",
        label: "Rubrik-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
    ],
    childrenType: "slot",
  },

  AcronymList: {
    name: "AcronymList",
    description:
      "Akronym/modell som expanderas bokstav för bokstav (SAMR, ECPA, Bloom). Format per punkt: **B** · Ord · Beskrivning",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text", placeholder: "§ Puentedura · 2006" },
      { name: "title", label: "Rubrik", type: "text" },
      { name: "tagline", label: "Avslutande text", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0–1)", type: "number", default: 0.7 },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  HeroStatement: {
    name: "HeroStatement",
    description:
      "Tre rader med olika typografi: kicker (mono) / whisper (italic) / shout (MEGA bold). Separera med blankrader.",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "theme",
        label: "Tema",
        type: "select",
        options: ["dark", "cream"],
        default: "dark",
        variant: "pills",
      },
    ],
    hasContent: true,
  },

  HookStatement: {
    name: "HookStatement",
    description:
      "Provokativ öppningsmening som reveals ord-för-ord med dramatisk pacing. **fet** = accent + extra paus.",
    fields: [
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "overlay", label: "Mörker-opacity (0–1)", type: "number", default: 0.7 },
      {
        name: "pauseAfter",
        label: "Paus efter sista ord (ms)",
        type: "number",
        default: 2400,
      },
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
    ],
    hasContent: true,
  },

  Manifesto: {
    name: "Manifesto",
    description:
      "Deklarativ one-liner — ord animeras in med blur. *kursiv* och **fet** ger accentfärg.",
    fields: [
      {
        name: "text",
        label: "Text",
        type: "multiline",
        hint: "Lämna tomt för att använda children istället",
      },
      {
        name: "variant",
        label: "Variant",
        type: "select",
        options: ["display", "serif", "condensed"],
        default: "display",
        variant: "pills",
      },
      {
        name: "align",
        label: "Justering",
        type: "select",
        options: ["left", "center"],
        default: "left",
        variant: "pills",
      },
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text", placeholder: "§ III · Titel" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "decoration",
        label: "Dekorativ glyph/nummer",
        type: "text",
        hint: "Stort tecken bakom texten, t.ex. 'III' eller '01'",
      },
    ],
    hasContent: true,
  },

  PromptHero: {
    name: "PromptHero",
    description:
      "Hero-slide med stor titel, exempel-prompt i chattbubbla och karaktärsbild till höger",
    fields: [
      { name: "eyebrow", label: "Eyebrow / fråga (stödjer **fet**)", type: "text" },
      { name: "title", label: "Titel", type: "text", required: true },
      {
        name: "titleSize",
        label: "Titel-storlek",
        type: "select",
        options: ["md", "lg", "xl"],
        default: "xl",
      },
      { name: "subtitle", label: "Undertitel (stödjer **fet**)", type: "multiline" },
      { name: "image", label: "Karaktärsbild", type: "image", required: true },
      { name: "imageAlt", label: "Alt-text för bild", type: "text" },
      { name: "background", label: "Bakgrundsbild", type: "image" },
      { name: "prompt", label: "Prompt-text i chattbubbla", type: "multiline" },
      { name: "promptModel", label: "Avsändarnamn i bubbla", type: "text", default: "ChatGPT" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "imageOffsetY",
        label: "Bildens vertikala förskjutning",
        type: "text",
        placeholder: "10% eller 4rem",
      },
    ],
  },

  ThreeUp: {
    name: "ThreeUp",
    description:
      "Tre-kolumners grid med jämförbara exempel. Format per punkt: **Label** · hint · /bild.png · tag:Tag",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "body", label: "Brödtext under titel", type: "multiline" },
      { name: "background", label: "Bakgrund (CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "stepped",
        label: "Stega fram en i taget",
        type: "boolean",
        default: true,
      },
    ],
    hasContent: true,
  },

  SpeakerIntro: {
    name: "SpeakerIntro",
    description:
      "Föreläsarens visitkort: stort namn, polaroid-video, fotobakgrund, sociala kanaler",
    fields: [
      { name: "name", label: "Namn", type: "text", required: true },
      { name: "title", label: "Roll/titel (radbryt med \\n)", type: "multiline" },
      { name: "eyebrow", label: "Eyebrow (UPPERCASE)", type: "text" },
      { name: "videoSrc", label: "Video (path)", type: "text", required: true },
      { name: "videoPoster", label: "Poster-bild för videon", type: "image" },
      { name: "background", label: "Fotobakgrund (path)", type: "image" },
      { name: "bookSrc", label: "Bok/produkt-bild", type: "image" },
      { name: "bookAlt", label: "Alt-text bok", type: "text" },
      { name: "linkedin", label: "LinkedIn-handle", type: "text" },
      { name: "instagram", label: "Instagram-handle", type: "text" },
      { name: "email", label: "E-post", type: "text" },
      { name: "spotify1", label: "Spotify-länk 1", type: "text" },
      { name: "spotify2", label: "Spotify-länk 2", type: "text" },
      { name: "website", label: "Webbsida", type: "text" },
    ],
  },

  AiArHero: {
    name: "AiArHero",
    description:
      "Öppningsslide för AI-är-sektionen. Gigantiskt 'AI är…' centrerat med pulserande prickar",
    fields: [],
  },

  AiArMedia: {
    name: "AiArMedia",
    description:
      "Återkommande mall för AI-är-sektionen. Visar video (manuell play) eller bild (klick-för-förstor) med 'AI är…'-ankare top-left",
    fields: [
      { name: "video", label: "Video (path)", type: "text" },
      { name: "image", label: "Bild", type: "image" },
      { name: "alt", label: "Alt-text", type: "text" },
      { name: "caption", label: "Caption under mediet", type: "text" },
      { name: "label", label: "Ankare top-left", type: "text", default: "AI är…" },
      {
        name: "aspectRatio",
        label: "Aspect ratio",
        type: "text",
        placeholder: "16 / 9",
        hint: "Default 16/9 för video, auto för bild",
      },
    ],
  },

  RealOrFake: {
    name: "RealOrFake",
    description:
      "Två porträtt — publiken gissar vilken är riktig, vid steg avslöjas AI-influencer",
    fields: [
      { name: "leftImage", label: "Vänster bild", type: "image", required: true },
      { name: "leftName", label: "Vänster namn", type: "text", required: true },
      { name: "rightImage", label: "Höger bild", type: "image", required: true },
      { name: "rightName", label: "Höger namn", type: "text", required: true },
      {
        name: "realSide",
        label: "Vilken sida är riktig",
        type: "select",
        options: ["left", "right"],
        required: true,
        variant: "pills",
      },
      {
        name: "question",
        label: "Frågan på steg 0",
        type: "text",
        default: "Vilken är på riktigt?",
      },
      { name: "realLabel", label: "Etikett riktig person", type: "text", default: "Faktisk person" },
      { name: "fakeLabel", label: "Etikett AI-influencer", type: "text", default: "Syntetisk · AI" },
      { name: "label", label: "Ankare top-left", type: "text", default: "AI är…" },
    ],
  },

  PromptWindow: {
    name: "PromptWindow",
    description:
      "Fejk-ChatGPT-fönster där en lång prompt typas in. För 'eleven fuskar'-moment",
    fields: [
      { name: "promptText", label: "Prompt-text", type: "multiline", hint: "Lämna tomt för att använda children" },
      { name: "typeSpeed", label: "Typhastighet (ms/tecken)", type: "number", default: 8 },
      { name: "label", label: "AI är…-ankare", type: "text", default: "AI är…", hint: "Sätt till tom sträng för att dölja" },
      { name: "modelName", label: "Modell-namn i header", type: "text", default: "ChatGPT" },
      { name: "portrait", label: "Porträttbild (vänster)", type: "image" },
      { name: "portraitAlt", label: "Alt-text porträtt", type: "text" },
      { name: "portraitCaption", label: "Caption under porträtt", type: "text" },
      { name: "background", label: "Fotobakgrund (path)", type: "image" },
      { name: "darken", label: "Mörker-opacity (0-1)", type: "number", default: 0.6 },
    ],
    hasContent: true,
  },

  AiKanVara: {
    name: "AiKanVara",
    description:
      "Stort typewriter-typsatt nyckelord till vänster + PNG-objekt till höger. Bryter AI-är-sektionens snabba tempo",
    fields: [
      { name: "word", label: "Nyckelord", type: "text", required: true },
      { name: "image", label: "PNG-bild (transparent)", type: "image" },
      { name: "alt", label: "Alt-text", type: "text" },
      {
        name: "size",
        label: "Storleksskala",
        type: "select",
        options: ["sm", "md", "lg"],
        default: "md",
        variant: "pills",
      },
      { name: "label", label: "Ankare top-left", type: "text", default: "AI kan vara…" },
      { name: "typeSpeed", label: "Ms per tecken", type: "number", default: 55 },
      { name: "imageRotation", label: "Bildrotation (grader)", type: "number" },
      { name: "imageOffsetY", label: "Bildens vertikala förskjutning (px)", type: "number" },
      { name: "background", label: "Fotobakgrund (path)", type: "image" },
    ],
  },

  AiHyperobject: {
    name: "AiHyperobject",
    description:
      "Hyperobjekt: AI som kraft som genomsyrar allt. Stor titel + hoptrasslade taggar mot fotobakgrund",
    fields: [
      { name: "title", label: "Titel", type: "text", default: "AI är inte en sak till!" },
      { name: "emphasis", label: "Betonat ord (konjak-färgat)", type: "text", default: "inte" },
      { name: "tags", label: "Taggar (komma-separerat)", type: "multiline" },
      { name: "background", label: "Fotobakgrund (path)", type: "image" },
      { name: "darken", label: "Overlay-opacity (0-1)", type: "number", default: 0.72 },
    ],
  },

  NamedPortrait: {
    name: "NamedPortrait",
    description:
      "Porträtt centrerat med namnet rullande som ambient vattenstämpel bakom",
    fields: [
      { name: "image", label: "Porträttbild", type: "image", required: true },
      { name: "alt", label: "Alt-text", type: "text" },
      { name: "name", label: "Namn", type: "text", required: true },
      { name: "background", label: "Fotobakgrund (path)", type: "image" },
      { name: "darken", label: "Mörker-opacity (0-1)", type: "number", default: 0.55 },
      { name: "scrollDuration", label: "Sekunder per rullning", type: "number", default: 40 },
      {
        name: "direction",
        label: "Rullningsriktning",
        type: "select",
        options: ["left", "right"],
        default: "left",
        variant: "pills",
      },
    ],
  },

  FigureQuote: {
    name: "FigureQuote",
    description:
      "Citat + figurbild flush mot ett hörn. Diagonal gradient så textsidan blir läsbar",
    fields: [
      { name: "quote", label: "Citat", type: "multiline", required: true },
      { name: "attribution", label: "Avsändare", type: "text" },
      { name: "context", label: "Kontext (årtal/roll)", type: "text" },
      { name: "image", label: "Figurbild (transparent PNG)", type: "image" },
      { name: "alt", label: "Alt-text", type: "text" },
      { name: "background", label: "Fotobakgrund (path)", type: "image", default: "/bilder/karlskrona/bg-caramel.jpg" },
      {
        name: "imageCorner",
        label: "Bildens hörn",
        type: "select",
        options: ["bottom-right", "bottom-left"],
        default: "bottom-right",
        variant: "pills",
      },
      { name: "darken", label: "Overlay-mörker (0-1)", type: "number", default: 0.55 },
      {
        name: "quoteSize",
        label: "Citat-storlek",
        type: "select",
        options: ["md", "lg", "xl"],
        default: "xl",
        variant: "pills",
      },
    ],
  },

  ErrorSlide: {
    name: "ErrorSlide",
    description:
      "Fejkad 404/system-felsida för satiriska moment. Glitchande felkod + framstegsindikator",
    fields: [
      { name: "errorCode", label: "Felkod", type: "text", default: "404" },
      { name: "errorTitle", label: "Underrubrik (UPPERCASE)", type: "text", default: "FÖRELÄSNINGEN KUNDE INTE LADDAS" },
      { name: "errorMessage", label: "Beskrivning (\\n för radbrytning)", type: "multiline" },
      { name: "errorTag", label: "Tag uppe vänster", type: "text", default: "ERR_AI_TAKEOVER" },
      { name: "timestamp", label: "Tidsstämpel", type: "text" },
      { name: "showProgress", label: "Visa progress-indikator", type: "boolean", default: true },
      { name: "progressLabel", label: "Progress-text", type: "text", default: "ÅTERSTÄLLER KONTROLLEN…" },
    ],
  },

  FullscreenVideo: {
    name: "FullscreenVideo",
    description:
      "Distraktionsfri videospelare på hela sliden. Inget overlay, inga kontroller som default",
    fields: [
      { name: "src", label: "Video-path", type: "text", required: true },
      { name: "poster", label: "Poster-bild", type: "image" },
      { name: "loop", label: "Loop", type: "boolean", default: false },
      { name: "autoPlay", label: "Autoplay", type: "boolean", default: true },
      { name: "muted", label: "Mutad", type: "boolean", default: true },
      { name: "controls", label: "Visa kontroller", type: "boolean", default: false },
      {
        name: "fit",
        label: "Object-fit",
        type: "select",
        options: ["cover", "contain"],
        default: "contain",
        variant: "pills",
      },
      { name: "background", label: "Bakgrund vid contain", type: "color", default: "#000" },
    ],
  },

  SamrLadder: {
    name: "SamrLadder",
    description:
      "SAMR-modellen som färgkodad trappa, video i höger halva. Stegas fram med space",
    fields: [
      { name: "videoSrc", label: "Video (path)", type: "text" },
      { name: "background", label: "Bakgrundsbild", type: "image" },
      { name: "eyebrow", label: "Eyebrow (UPPERCASE)", type: "text", default: "SAMR" },
      { name: "title", label: "Titel", type: "text", default: "Fyra sätt att använda AI." },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "videoFocusY", label: "Video vertikal fokus (0-100)", type: "number", default: 62, hint: "Högre = visa lägre del av källan" },
      { name: "videoZoom", label: "Video extra-zoom", type: "number", default: 1.4 },
    ],
  },

  ChatHero: {
    name: "ChatHero",
    description:
      "Hero med stor titel, bild höger och fler-turnerande chattkonversation som animeras in",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Titel", type: "text", required: true },
      {
        name: "titleSize",
        label: "Titel-storlek",
        type: "select",
        options: ["md", "lg", "xl"],
        default: "xl",
        variant: "pills",
      },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "image", label: "Bild höger", type: "image" },
      { name: "imageAlt", label: "Alt-text bild", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "aiLabel", label: "AI-avatar-etikett", type: "text", default: "AI" },
      { name: "userPattern", label: "Regex för user-sida", type: "text", default: "elev|du|user|jag|erik" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "beat", label: "Ms mellan meddelanden", type: "number", default: 1600 },
      { name: "voice", label: "Visa pulserande mikrofon-ikon", type: "boolean" },
    ],
    hasContent: true,
  },

  InputHero: {
    name: "InputHero",
    description:
      "Hero med stor titel, ChatGPT-stilad input-bar som prompt och bild flush mot bottenhögre",
    fields: [
      { name: "eyebrow", label: "Eyebrow (stödjer **fet**)", type: "text" },
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "subtitle", label: "Undertitel (stödjer **fet**)", type: "multiline" },
      { name: "prompt", label: "Prompt-text i input-bar", type: "multiline", required: true },
      { name: "image", label: "Bild (bottenhögre)", type: "image", required: true },
      { name: "imageAlt", label: "Alt-text bild", type: "text" },
      { name: "background", label: "Bakgrundsbild", type: "image" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "dim", label: "Dim-färg för otonade ord", type: "color" },
    ],
  },

  CodeGeneration: {
    name: "CodeGeneration",
    description:
      "Prompt animeras fram i input-bar, sen typas kod ut bokstav för bokstav. Stödjer fullbg-variant",
    fields: [
      { name: "eyebrow", label: "Eyebrow (stödjer **fet**)", type: "text" },
      { name: "title", label: "Titel (stödjer **fet**)", type: "text" },
      { name: "subtitle", label: "Undertitel (stödjer **fet**)", type: "multiline" },
      { name: "prompt", label: "Prompt-text", type: "multiline" },
      { name: "code", label: "Kod-sträng (eller via children)", type: "multiline" },
      { name: "codeSpeed", label: "Tecken per sekund", type: "number", default: 55 },
      { name: "background", label: "Bakgrundsbild", type: "image" },
      { name: "videoSrc", label: "Video (höger sida)", type: "text" },
      { name: "videoAspect", label: "Video aspect", type: "text", placeholder: "16 / 9" },
      {
        name: "variant",
        label: "Layout-variant",
        type: "select",
        options: ["split", "fullbg"],
        default: "split",
        variant: "pills",
      },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  EditorialHero: {
    name: "EditorialHero",
    description:
      "Magazine-style section opener: gigantiskt italic-ord, mono-kicker, dekorativt bakgrundsnummer",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "number", label: "Bakgrundsnummer", type: "text", placeholder: "04" },
      { name: "word", label: "Huvudordet", type: "text", required: true },
      { name: "body", label: "Brödtext (1-2 meningar)", type: "multiline" },
      { name: "image", label: "Bild (valfri)", type: "image" },
      { name: "imageAlt", label: "Alt-text", type: "text" },
      {
        name: "imagePlacement",
        label: "Bildens placering",
        type: "select",
        options: ["right", "bottom-right", "full-bleed-right"],
        default: "right",
        variant: "pills",
      },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "theme",
        label: "Bakgrundston",
        type: "select",
        options: ["dark", "cream"],
        default: "dark",
        variant: "pills",
      },
    ],
  },

  ProcessChain: {
    name: "ProcessChain",
    description:
      "Kedja av processteg, stegas fram. Format per punkt: **Label** · hint · kind[:image-url]",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "body", label: "Brödtext", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "direction",
        label: "Riktning",
        type: "select",
        options: ["horizontal", "vertical"],
        default: "horizontal",
        variant: "pills",
      },
    ],
    hasContent: true,
  },

  Lightbox: {
    name: "Lightbox",
    description:
      "Fullskärms-overlay för bild eller video i förstorad storlek. Styrs via open/onClose-state",
    fields: [
      { name: "image", label: "Bild-URL", type: "image" },
      { name: "video", label: "Video-URL", type: "text" },
      { name: "caption", label: "Caption", type: "text" },
    ],
  },

  StudentVoices: {
    name: "StudentVoices",
    description:
      "Grid av elev-citat i glasmorfism-kort. Format: `- **Avsändare:** Citat`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "body", label: "Brödtext", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  TwoPaths: {
    name: "TwoPaths",
    description:
      "Två kolumner sida vid sida med olika accent. Format: `- Vänster · Höger`",
    fields: [
      { name: "title", label: "Gemensam titel", type: "text" },
      { name: "leftTitle", label: "Vänster rubrik", type: "text" },
      { name: "rightTitle", label: "Höger rubrik", type: "text" },
      { name: "leftAccent", label: "Vänster accent", type: "color" },
      { name: "rightAccent", label: "Höger accent", type: "color" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
    ],
    hasContent: true,
  },

  StatsTriptych: {
    name: "StatsTriptych",
    description:
      "Tre siffror med animerad räkning. Format per punkt: `värde · etikett`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "source", label: "Källa (UPPERCASE)", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  GrowingStatement: {
    name: "GrowingStatement",
    description:
      "Texten växer in bokstav för bokstav. **fet** ger accent + glow",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "align",
        label: "Justering",
        type: "select",
        options: ["center", "left"],
        default: "center",
        variant: "pills",
      },
      { name: "whisper", label: "Italic whisper-text ovanför", type: "text" },
    ],
    hasContent: true,
  },

  ChatFullscreen: {
    name: "ChatFullscreen",
    description:
      "Helsides-chattflöde där meddelanden typas fram med pacing. Format: `- **Roll:** text`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "aiLabel", label: "AI-avsändare-etikett", type: "text", default: "Tutor" },
      { name: "userLabel", label: "User-etikett", type: "text", default: "Elev" },
      { name: "userPattern", label: "Regex för user-sida", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "aiSpeed", label: "AI ms/tecken", type: "number", default: 14 },
      { name: "userSpeed", label: "User ms/tecken", type: "number", default: 10 },
      { name: "thinkingDelay", label: "AI tänker-paus (ms)", type: "number", default: 600 },
      { name: "betweenDelay", label: "Paus mellan meddelanden (ms)", type: "number", default: 400 },
    ],
    hasContent: true,
  },

  VibeCoding: {
    name: "VibeCoding",
    description:
      "Elev skriver prompt → video av resultatet spelas upp till höger. För 'vibecoding'-exempel",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "subject", label: "Ämne (small caps)", type: "text" },
      { name: "student", label: "Ålder/avsändare", type: "text" },
      { name: "title", label: "Titel — vad eleven byggde", type: "text" },
      { name: "caption", label: "Caption under prompt-bubblan", type: "text" },
      { name: "videoSrc", label: "Video (path)", type: "text" },
      { name: "videoAspect", label: "Video aspect", type: "text", default: "9 / 16", placeholder: "16 / 9" },
      { name: "background", label: "Bakgrundsbild", type: "image" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  StarterSentences: {
    name: "StarterSentences",
    description:
      "Startmeningar som typas fram en i taget. Format: `- Kategori · Startmening`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "typeSpeed", label: "Ms per tecken", type: "number", default: 35 },
    ],
    hasContent: true,
  },

  Bollplank: {
    name: "Bollplank",
    description:
      "Lärare ställer fråga till AI om elevgrupp; AI 'tänker högt' och svarar",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "prompt", label: "Lärarens fråga", type: "multiline" },
      { name: "aiResponse", label: "AI:s svar (override default)", type: "multiline" },
      { name: "aiSpeed", label: "Ms per tecken (AI)", type: "number" },
      { name: "thinkingDelay", label: "AI tänker-paus (ms)", type: "number" },
    ],
    hasContent: true,
  },

  BloomComparison: {
    name: "BloomComparison",
    description:
      "Bloom-pyramid med två kolumner per nivå. Format: `- **Verb** · vänster · höger · #färg`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "leftTitle", label: "Vänster rubrik", type: "text" },
      { name: "rightTitle", label: "Höger rubrik", type: "text" },
      { name: "leftBadge", label: "Vänster badge", type: "text" },
      { name: "rightBadge", label: "Höger badge", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  ThreeActs: {
    name: "ThreeActs",
    description:
      "Tre kolumner med stegad reveal. Format: `- **Ord** · #färg · Tagline · b1 | b2 | b3 · Avslutning`",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "bottomLine", label: "Sammanfattande rad i botten", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
    ],
    hasContent: true,
  },

  Pitfall: {
    name: "Pitfall",
    description:
      "AI-fälla: stort ord, fejkad fråga + AI-svar typas fram, sen röd korrigering",
    fields: [
      { name: "badge", label: "Badge (UPPERCASE)", type: "text", placeholder: "FÄLLA 01" },
      { name: "chapter", label: "Kapitel-markör", type: "text" },
      { name: "word", label: "Det stora ordet", type: "text", required: true },
      { name: "subtitle", label: "Beskrivning under", type: "multiline" },
      { name: "question", label: "Exempel-fråga (user-bubbla)", type: "multiline" },
      { name: "answer", label: "AI:s fel svar", type: "multiline" },
      { name: "correction", label: "Korrigering (röd)", type: "multiline" },
      { name: "tagline", label: "Italic-rad i botten", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color", default: "#E84D4D" },
      { name: "typeSpeed", label: "Ms per tecken", type: "number", default: 22 },
    ],
    hasContent: true,
  },

  PromptPrinciples: {
    name: "PromptPrinciples",
    description:
      "Promptprinciper med dålig vs bra exempel. Format: `- **Namn** · Beskrivning · Dålig · Bra`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  AgentCatalog: {
    name: "AgentCatalog",
    description:
      "Header + agent-katalog (numrerade kort) vänster, video höger. Format: `- **Namn** · Beskrivning`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Italic undertitel", type: "multiline" },
      { name: "tagline", label: "Avslutande rad (citat-stil)", type: "multiline" },
      { name: "videoSrc", label: "Video (path)", type: "text" },
      { name: "videoAspect", label: "Video aspect", type: "text", default: "16 / 9" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color", default: "#EC7E26" },
    ],
    hasContent: true,
  },

  ExampleGrid: {
    name: "ExampleGrid",
    description:
      "Rutnät av kort med korta textinnehåll. Stödjer **fet** för accent",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "tagline", label: "Tagline under", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "columns", label: "Antal kolumner", type: "number", default: 3 },
    ],
    hasContent: true,
  },

  LixPanels: {
    name: "LixPanels",
    description:
      "ChatGPT-bar med prompt + tre nivåkortpanel. Format: `- **Nivå** · Etikett · Texten`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "prompt", label: "ChatGPT-prompt", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "typeSpeed", label: "Ms per tecken", type: "number", default: 12 },
    ],
    hasContent: true,
  },

  TranslationDemo: {
    name: "TranslationDemo",
    description:
      "Stegad demo: prompt → svensk text → arabisk text → ord-par. Default-content om inget anges",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "prompt", label: "Prompt", type: "multiline" },
      { name: "swedishText", label: "Svensk text", type: "multiline", hint: "Lämna tomt för default" },
      { name: "arabicText", label: "Arabisk text", type: "multiline", hint: "Lämna tomt för default" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
  },

  QuizDemo: {
    name: "QuizDemo",
    description:
      "Animerad quiz-demo: ChatGPT-prompt + flerval där fel klick visas först, sen rätt",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "prompt", label: "ChatGPT-prompt", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "question", label: "Frågan", type: "multiline" },
      { name: "correctIndex", label: "Index för rätt svar", type: "number", default: 1 },
      { name: "wrongFirstIndex", label: "Index för fel klick först", type: "number", default: 0 },
      { name: "explanation", label: "Förklaring vid rätt svar", type: "multiline" },
    ],
  },

  VoiceFeedback: {
    name: "VoiceFeedback",
    description:
      "Talad prompt typas fram + feedback-sektioner. Format: `- **Rubrik** · Beskrivning · Övning1 | Övning2`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "transcript", label: "Transkriberad talprompt", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "typeSpeed", label: "Ms per tecken", type: "number", default: 14 },
    ],
    hasContent: true,
  },

  RotatingStatement: {
    name: "RotatingStatement",
    description:
      "Stor typografi där ett ord roterar. Pedagogisk modell: 'Vi behöver lära MED/OM/MOT/GENOM AI'",
    fields: [
      { name: "prefix", label: "Text före roterande ord", type: "text" },
      { name: "words", label: "Roterande ord (komma-separerat)", type: "multiline", placeholder: "med, om, mot, genom, trots" },
      { name: "suffix", label: "Text efter roterande ord", type: "text" },
      { name: "interval", label: "Ms mellan byten", type: "number", default: 2800 },
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "background", label: "Bakgrund (bild eller video-path)", type: "text" },
      {
        name: "backgroundType",
        label: "Bakgrundstyp",
        type: "select",
        options: ["image", "video"],
        hint: "Auto-detekteras om tomt",
        variant: "pills",
      },
      { name: "accent", label: "Accentfärg", type: "color", default: "#EC7E26" },
      { name: "overlay", label: "Overlay-opacity (0-1)", type: "number", default: 0.5 },
    ],
  },

  ChatSplit: {
    name: "ChatSplit",
    description:
      "Två chattfönster sida vid sida. Format: `- L **Roll:** text` eller `- R **Roll:** text`",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "leftTitle", label: "Vänster rubrik", type: "text" },
      { name: "leftSubtitle", label: "Vänster undertitel", type: "text" },
      { name: "leftAccent", label: "Vänster accent", type: "color" },
      { name: "rightTitle", label: "Höger rubrik", type: "text" },
      { name: "rightSubtitle", label: "Höger undertitel", type: "text" },
      { name: "rightAccent", label: "Höger accent", type: "color" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "chapter", label: "Kapitel-markör", type: "text" },
    ],
    hasContent: true,
  },

  EditorialQuote: {
    name: "EditorialQuote",
    description:
      "Citat med typografisk hierarki per segment. Format: `- Text · style` (whisper|bridge|shout|landing|pause)",
    fields: [
      { name: "kicker", label: "Kicker (UPPERCASE)", type: "text" },
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "decoration", label: "Dekorativ glyph", type: "text", hint: "Default öppnande citattecken" },
      {
        name: "align",
        label: "Justering",
        type: "select",
        options: ["left", "center", "right"],
        default: "left",
        variant: "pills",
      },
    ],
    hasContent: true,
  },

  RevealList: {
    name: "RevealList",
    description:
      "Persistent prefix + lista som avslöjas en rad i taget. **fet** ger accent",
    fields: [
      { name: "prefix", label: "Persistent text ovanför", type: "text" },
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "stagger", label: "Sekunder mellan rader", type: "number", default: 0.9 },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number", default: 0.55 },
    ],
    hasContent: true,
  },

  UCurveChart: {
    name: "UCurveChart",
    description:
      "U-formad kurva med zoner. Format: `- Label · tone · Beskrivning` (tones: neutral|danger|success)",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "xLabel", label: "X-axel-etikett", type: "text" },
      { name: "yLabel", label: "Y-axel-etikett", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
    ],
    hasContent: true,
  },

  NoviceDilemma: {
    name: "NoviceDilemma",
    description:
      "Två karaktärer (novis/expert) med AI i mitten. Visar att AI förstärker existerande kompetens",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text", default: "Vem gynnas av AI?" },
      { name: "leftLabel", label: "Vänster etikett", type: "text", default: "Novis" },
      { name: "leftOutput", label: "Vänster output", type: "text", default: "Plausibelt svar" },
      { name: "rightLabel", label: "Höger etikett", type: "text", default: "Expert" },
      { name: "rightOutput", label: "Höger output", type: "text", default: "Granskat + vidareutvecklat" },
      { name: "middleLabel", label: "Mittetikett", type: "text", default: "AI" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color", default: "#EC7E26" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number", default: 0.6 },
    ],
  },

  LivePoll: {
    name: "LivePoll",
    description:
      "Interaktiv poll mot Supabase. Format: `- Label · tone · Beskrivning` (tones: neutral|danger|success|accent)",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text" },
      { name: "subtitle", label: "Undertitel", type: "multiline" },
      { name: "pollKey", label: "Unik poll-nyckel", type: "text", required: true, hint: "Kort, beskrivande, t.ex. 'zone-check'" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
    ],
    hasContent: true,
  },

  TriadStatement: {
    name: "TriadStatement",
    description:
      "Retorisk triad: 2-3 premisser → en landning. Separera med `---` på egen rad",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number", default: 0.6 },
      { name: "accent", label: "Accentfärg", type: "color", default: "#EC7E26" },
    ],
    hasContent: true,
  },

  TwoSides: {
    name: "TwoSides",
    description:
      "Två-kolumn-jämförelse med tonalitet. Separera kolumner med `---`. Variants: list eller study",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "intro", label: "Intro-rad ovanför kolumner", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "variant",
        label: "Variant",
        type: "select",
        options: ["list", "study"],
        default: "list",
        variant: "pills",
      },
      { name: "leftLabel", label: "Vänster etikett", type: "text", required: true },
      {
        name: "leftTone",
        label: "Vänster tone",
        type: "select",
        options: ["positive", "warning", "danger", "neutral"],
        variant: "pills",
      },
      { name: "leftMeta", label: "Vänster meta-tagg (study)", type: "text" },
      { name: "rightLabel", label: "Höger etikett", type: "text", required: true },
      {
        name: "rightTone",
        label: "Höger tone",
        type: "select",
        options: ["positive", "warning", "danger", "neutral"],
        variant: "pills",
      },
      { name: "rightMeta", label: "Höger meta-tagg (study)", type: "text" },
      { name: "separator", label: "Mittseparator (vs/&)", type: "text" },
    ],
    hasContent: true,
  },

  EvidenceConstellation: {
    name: "EvidenceConstellation",
    description:
      "Forskningsläget som stjärnbilder. Densitet visar evidensstyrkan. Separera kolumner med `---`",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "intro", label: "Intro-rad ovanför kolumner", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number", default: 0.85 },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "leftLabel", label: "Vänster etikett", type: "text", required: true },
      {
        name: "leftTone",
        label: "Vänster tone",
        type: "select",
        options: ["positive", "warning", "danger", "neutral"],
        variant: "pills",
      },
      { name: "leftDensity", label: "Vänster stjärn-densitet", type: "number" },
      { name: "rightLabel", label: "Höger etikett", type: "text", required: true },
      {
        name: "rightTone",
        label: "Höger tone",
        type: "select",
        options: ["positive", "warning", "danger", "neutral"],
        variant: "pills",
      },
      { name: "rightDensity", label: "Höger stjärn-densitet", type: "number" },
    ],
    hasContent: true,
  },

  FrictionMap: {
    name: "FrictionMap",
    description:
      "AI som automatiserande teknologi som flackar ut lärandets friktionspunkter — animerat",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text", default: "§ Pedagogiskt ansvar" },
      { name: "accent", label: "Accentfärg", type: "color", default: "#EC7E26" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number", default: 0.92 },
      { name: "peak1Label", label: "Topp 1 etikett", type: "text", default: "Friktion" },
      { name: "peak2Label", label: "Topp 2 etikett", type: "text", default: "Önskvärd svårighet" },
      { name: "peak3Label", label: "Topp 3 etikett", type: "text", default: "Meningsfullt motstånd" },
      { name: "hero", label: "Hero-text", type: "multiline", default: "AI är en *automatiserande* teknologi." },
      { name: "bridge", label: "Bridge-text", type: "multiline", default: "Den tar bort friktionen." },
      { name: "landing", label: "Landing-text", type: "multiline", default: "Det är **friktionen** vi måste designa för." },
    ],
  },

  StrategySpectrum: {
    name: "StrategySpectrum",
    description:
      "Tre strategiska val sida vid sida. Format: `- Titel · tone · [recommended ·] Beskrivning`",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "intro", label: "Intro-rad", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  LensIntro: {
    name: "LensIntro",
    description:
      "Typografisk inledning för lins-sektion. Stort lins-namn, dekorativt index, frågan som subtitle",
    fields: [
      { name: "number", label: "Linsens nummer", type: "text", default: "01" },
      { name: "total", label: "Totalt antal linser", type: "text", default: "05" },
      { name: "name", label: "Linsens namn", type: "text", required: true },
      { name: "subtitle", label: "Frågan som ramar linsen", type: "multiline" },
      { name: "tagline", label: "Tagline (lins, inte svar)", type: "multiline" },
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text", hint: "Default '§ Lins X / Y'" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number", default: 0.7 },
      { name: "accent", label: "Accentfärg", type: "color", default: "#EC7E26" },
    ],
  },

  DualAffordance: {
    name: "DualAffordance",
    description:
      "Verktyg med dubbel affordans (lärande / genväg). Format: `- **Verktyg** · positiv / negativ`",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "intro", label: "Intro-rad", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "positiveLabel", label: "Positiv kolumn-etikett", type: "text", default: "Inbjuder till lärande" },
      { name: "negativeLabel", label: "Negativ kolumn-etikett", type: "text", default: "Inbjuder till genväg" },
      { name: "positiveColor", label: "Positiv färg", type: "color" },
      { name: "negativeColor", label: "Negativ färg", type: "color" },
    ],
    hasContent: true,
  },

  SAMRSpectrum: {
    name: "SAMRSpectrum",
    description:
      "SAMR som horisontellt spektrum (inte stege). Format: `- **Bokstav** · Namn · Exempel`",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "intro", label: "Intro-rad", type: "multiline" },
      { name: "task", label: "Uppgift som tagg", type: "text" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  BloomPyramid: {
    name: "BloomPyramid",
    description:
      "Bloom som pyramid med dubbla läsningar. Format: `- **Nivå** · beskrivning` (toppen först)",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "intro", label: "Intro-rad", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
      { name: "accent", label: "Accentfärg", type: "color" },
      {
        name: "arrows",
        label: "Pilar",
        type: "select",
        options: ["both", "up", "down", "none"],
        default: "both",
        variant: "pills",
      },
      { name: "upLabel", label: "Uppåt-pil etikett", type: "text" },
      { name: "downLabel", label: "Nedåt-pil etikett", type: "text" },
    ],
    hasContent: true,
  },

  JagAIJagFlow: {
    name: "JagAIJagFlow",
    description:
      "JAG-AI-JAG-modellen: tre faser horisontellt. Format: `- **Titel** · caption · item1 · item2 · ...`",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "intro", label: "Intro-rad", type: "multiline" },
      { name: "closing", label: "Avslutande mening (citat)", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
    hasContent: true,
  },

  LensApplication: {
    name: "LensApplication",
    description:
      "Konkret klassrumsexempel med linskoppling. Split-screen med media på en sida och text på andra",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "subject", label: "Ämne-tagg (UPPERCASE)", type: "text" },
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "mekanism", label: "Mekanism-text (stödjer **fet**)", type: "multiline" },
      { name: "imageUrl", label: "Bild-URL", type: "image" },
      { name: "videoUrl", label: "Video-URL (override bild)", type: "text" },
      {
        name: "mediaPlacement",
        label: "Media-placering",
        type: "select",
        options: ["left", "right"],
        default: "right",
        variant: "pills",
      },
      { name: "lenses", label: "Linser (komma-separerat)", type: "text", hint: "Lins-namn som taggar" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
      { name: "accent", label: "Accentfärg", type: "color" },
    ],
  },

  BeforeAfterPhases: {
    name: "BeforeAfterPhases",
    description:
      "Lärarens designram (Före → AI → Efter) med tidslinje. Format: `- **Fas** · tid · caption · item1 · ...`",
    fields: [
      { name: "chapter", label: "Kapitel-markör (UPPERCASE)", type: "text" },
      { name: "intro", label: "Intro-rad", type: "multiline" },
      { name: "background", label: "Bakgrund (bild eller CSS)", type: "text" },
      { name: "overlay", label: "Mörker-opacity (0-1)", type: "number" },
      { name: "accent", label: "Accentfärg", type: "color" },
      { name: "highlightLast", label: "Markera sista fasen som länk", type: "boolean", default: true },
    ],
    hasContent: true,
  },

  SpotlightCard: {
    name: "SpotlightCard",
    description: "Kort i SpotlightContrast",
    fields: [
      { name: "title", label: "Kortets titel", type: "text", required: true },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
    ],
    hasContent: true,
  },

  TeamMember: {
    name: "TeamMember",
    description: "Medlem i TeamIntro",
    fields: [
      { name: "name", label: "Namn", type: "text", required: true },
      { name: "role", label: "Roll/yrke", type: "text" },
    ],
    hasContent: true,
  },
};

export function getTemplateSchema(name: string): TemplateSchema | undefined {
  return templateSchemas[name];
}

/**
 * Lista alla slide-templates (exkluderar sub-components som TimelineEvent,
 * ComparisonColumn som bara används som children).
 */
export const SUB_COMPONENTS = new Set([
  "TimelineEvent",
  "ComparisonColumn",
  "SpotlightCard",
  "TeamMember",
]);

export function getSlideTemplates(): Array<{ tag: string; schema: TemplateSchema }> {
  return Object.entries(templateSchemas)
    .filter(([tag]) => !SUB_COMPONENTS.has(tag))
    .map(([tag, schema]) => ({ tag, schema }));
}

/**
 * Skapa en ny slide med standardvärden för angiven template.
 * Fyller required-fält med placeholder-text och sätter select-defaults.
 */
export function createDefaultSlide(
  tag: string
): { tag: string; props: Record<string, string | number | boolean | null>; content: string | null; children: never[] } {
  const schema = templateSchemas[tag];
  if (!schema) {
    return { tag, props: {}, content: null, children: [] };
  }

  const props: Record<string, string | number | boolean | null> = {};
  for (const field of schema.fields) {
    if (field.default !== undefined) {
      props[field.name] = field.default;
    } else if (field.required) {
      // Placeholder-text så fältet syns tydligt
      if (field.type === "text" || field.type === "multiline") {
        props[field.name] = field.placeholder ?? `Ny ${field.label.toLowerCase()}`;
      } else if (field.type === "number") {
        props[field.name] = 0;
      } else if (field.type === "boolean") {
        props[field.name] = false;
      } else if (field.type === "select" && field.options?.[0]) {
        props[field.name] = field.options[0];
      } else {
        props[field.name] = "";
      }
    }
  }

  let content: string | null = null;
  if (schema.hasContent) {
    content = "\n- Ny punkt\n- Ännu en punkt\n";
  } else if (schema.childrenType === "TimelineEvent") {
    content = '\n  <TimelineEvent date="2026" title="Händelse">\n    Beskrivning\n  </TimelineEvent>\n';
  } else if (schema.childrenType === "ComparisonColumn") {
    content = '\n  <ComparisonColumn title="Vänster">\n  - Punkt\n  </ComparisonColumn>\n  <ComparisonColumn title="Höger">\n  - Punkt\n  </ComparisonColumn>\n';
  }

  return { tag, props, content, children: [] };
}
