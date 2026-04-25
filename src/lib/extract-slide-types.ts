/**
 * Extraherar slide-metadata från MDX-källkoden.
 *
 * Vi parsar MDX själva eftersom `slide.type` är en opaque reference när
 * templates kommer via RSC (next-mdx-remote/rsc) - displayName och name
 * är inte tillgängliga på klienten.
 *
 * Returnerar: array med metadata per slide (template-namn + primär text).
 */

export interface SlideMeta {
  templateName: string;
  primaryText?: string;
  secondaryText?: string;
}

export function extractSlideMetas(source: string): SlideMeta[] {
  const metas: SlideMeta[] = [];

  // Vi går igenom source och hittar alla top-level-komponenter.
  // En top-level-komponent är en rad som börjar med `<Name` i kolumn 0.
  // Efter varje hittad komponent läser vi tills vi hittar nästa top-level
  // (eller slutet), och extraherar relevanta props / children.

  const lines = source.split("\n");
  const componentStarts: { tag: string; startLine: number; endLine: number }[] = [];

  // Hitta startrader för alla top-level-komponenter
  for (let i = 0; i < lines.length; i++) {
    const match = /^<([A-Z][A-Za-z0-9]*)/.exec(lines[i]);
    if (match) {
      componentStarts.push({ tag: match[1], startLine: i, endLine: -1 });
    }
  }

  // Sätt endLine = startLine av nästa komponent, eller slutet
  for (let i = 0; i < componentStarts.length; i++) {
    componentStarts[i].endLine =
      i + 1 < componentStarts.length
        ? componentStarts[i + 1].startLine - 1
        : lines.length - 1;
  }

  for (const comp of componentStarts) {
    const blockLines = lines.slice(comp.startLine, comp.endLine + 1);
    const block = blockLines.join("\n");

    const meta: SlideMeta = {
      templateName: comp.tag,
    };

    // Extrahera relevanta fält per template
    switch (comp.tag) {
      case "TitleSlide":
      case "SectionDivider":
        meta.primaryText = extractProp(block, "title");
        meta.secondaryText = extractProp(block, "subtitle");
        break;
      case "GiantText":
        meta.primaryText = extractInnerText(block, "GiantText");
        break;
      case "Quote":
      case "PictureQuote":
        meta.primaryText = extractInnerText(block, comp.tag);
        meta.secondaryText = extractProp(block, "attribution");
        break;
      case "GiantScroll":
        meta.primaryText = extractProp(block, "text");
        break;
      case "LayeredScroll":
        meta.primaryText = extractProp(block, "text");
        meta.secondaryText = extractProp(block, "foregroundImage") ?? extractProp(block, "bgImage");
        break;
      case "StatCounter": {
        const value = extractProp(block, "value");
        const suffix = extractProp(block, "suffix") ?? "";
        meta.primaryText = value ? `${value}${suffix}` : undefined;
        meta.secondaryText = extractProp(block, "label");
        break;
      }
      case "PromptAnimation":
        meta.primaryText = extractProp(block, "resultText");
        meta.secondaryText = extractProp(block, "promptText");
        break;
      case "PollQuestion":
        meta.primaryText = extractProp(block, "question");
        break;
      case "HeroImage":
      case "VideoBackground":
      case "ImageBleed":
      case "LayeredText":
        meta.primaryText = extractFirstHeading(block);
        break;
      case "Callout":
      case "Reflection":
        meta.primaryText = extractProp(block, "title");
        break;
      case "BulletBuild":
      case "SideScrollList":
      case "NumberedReveal":
      case "Timeline":
      case "Comparison":
        meta.primaryText = extractProp(block, "title");
        break;
      case "CodeReveal":
        meta.primaryText = extractProp(block, "title") ?? extractProp(block, "caption");
        meta.secondaryText = extractProp(block, "language");
        break;
      case "VideoEmbed":
        meta.primaryText = extractProp(block, "title") ?? extractProp(block, "src");
        break;
      case "SlideshowMorph":
        meta.primaryText = extractProp(block, "morph");
        meta.secondaryText = extractProp(block, "captions");
        break;
      case "ParticleField":
        meta.primaryText = "Partiklar";
        meta.secondaryText = extractProp(block, "formations");
        break;
      case "LoadingSlide":
        meta.primaryText = extractProp(block, "title") ?? extractProp(block, "variant");
        meta.secondaryText = extractProp(block, "subtitle");
        break;
      case "Collage":
        meta.primaryText = extractProp(block, "title") ?? "Collage";
        meta.secondaryText = extractProp(block, "layout");
        break;
      case "ImageText":
        meta.primaryText = extractFirstHeading(block);
        break;
      default:
        meta.primaryText = extractProp(block, "title");
    }

    metas.push(meta);
  }

  return metas;
}

/**
 * Extrahera ett prop-värde från en komponent-block.
 * Hanterar: propName="value", propName="value med space"
 */
function extractProp(block: string, propName: string): string | undefined {
  // Dubbel-citattecken (hanterar även escapade citattecken inuti)
  const dblQuote = new RegExp(`${propName}="((?:[^"\\\\]|\\\\.)*)"`, "s");
  const dblMatch = dblQuote.exec(block);
  if (dblMatch) return cleanText(dblMatch[1]);

  // Enkla citattecken
  const singleQuote = new RegExp(`${propName}='((?:[^'\\\\]|\\\\.)*)'`, "s");
  const singleMatch = singleQuote.exec(block);
  if (singleMatch) return cleanText(singleMatch[1]);

  // JSX expression {...} - försök läsa ut string literals
  const jsxExpr = new RegExp(`${propName}=\\{"([^"]*)"\\}`);
  const jsxMatch = jsxExpr.exec(block);
  if (jsxMatch) return cleanText(jsxMatch[1]);

  return undefined;
}

/**
 * Extrahera första h1/h2 heading eller textinnehåll inuti en komponent.
 */
function extractFirstHeading(block: string): string | undefined {
  const h1 = /^#\s+(.+)$/m.exec(block);
  if (h1) return cleanText(h1[1]);
  const h2 = /^##\s+(.+)$/m.exec(block);
  if (h2) return cleanText(h2[1]);
  return undefined;
}

/**
 * Extrahera text mellan <Tag>...</Tag>. Första raden av icke-whitespace.
 */
function extractInnerText(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = re.exec(block);
  if (!match) return undefined;
  const inner = match[1];
  // Ta bort prop-rader som står före innehållet (self-closing tags, attribut över flera rader)
  const firstNonEmpty = inner
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("-"))[0];
  return firstNonEmpty ? cleanText(firstNonEmpty) : undefined;
}

function cleanText(s: string): string {
  return s
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
