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
  childrenType?: "slot" | "TimelineEvent" | "ComparisonColumn";
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

  InvisibleChildPatterns: {
    name: "InvisibleChildPatterns",
    description:
      'Numrerat rutnät av mönster med stegad reveal. Format per rad: "**Namn** · sammanfattning · källa". Generellt återanvändbar för pedagogiska/kliniska mönster-modeller.',
    fields: [
      { name: "title", label: "Rubrik", type: "text" },
      { name: "tag", label: "Tag (UPPERCASE)", type: "text" },
      {
        name: "titleSize",
        label: "Titel-storlek",
        type: "select",
        options: ["sm", "md", "lg", "xl"],
        default: "md",
      },
      {
        name: "columns",
        label: "Antal kolumner",
        type: "number",
        default: 3,
        hint: "3 fungerar bäst för 6-9 mönster",
      },
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
export const SUB_COMPONENTS = new Set(["TimelineEvent", "ComparisonColumn"]);

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
