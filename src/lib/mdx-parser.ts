/**
 * Parser för vårt MDX-subset.
 *
 * Vi parsar bara det vi behöver: frontmatter + top-level JSX-komponenter.
 * Varje slide är en top-level komponent. Notes är speciella block mellan slides.
 *
 * Vi använder en enkel line-baserad parser istället för en full MDX AST -
 * det räcker för vårt strukturerade format och är lättare att serialisera tillbaka.
 */

import matter from "gray-matter";

export type PropValue = string | number | boolean | null;

export interface ParsedComponent {
  tag: string;
  /** Props som key-value. Värden är strängrepresentation från MDX-källan. */
  props: Record<string, PropValue>;
  /** Råa children-strängen (mellan öppnings- och stängtaggen), eller null om self-closing */
  content: string | null;
  /** Barn-komponenter om tag är container (Timeline, Comparison) */
  children: ParsedComponent[];
  /** Notes-block som följde direkt efter denna komponent (för slides) */
  notes?: string;
}

export interface ParsedPresentation {
  frontmatter: Record<string, unknown>;
  slides: ParsedComponent[];
}

/**
 * Parse MDX source → struktur.
 */
export function parseMdx(source: string): ParsedPresentation {
  const { data: frontmatter, content } = matter(source);
  const slides = parseTopLevelComponents(content);
  return { frontmatter, slides };
}

function parseTopLevelComponents(content: string): ParsedComponent[] {
  const lines = content.split("\n");
  const components: ParsedComponent[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const startMatch = /^<([A-Z][A-Za-z0-9]*)/.exec(line);

    if (!startMatch) {
      i++;
      continue;
    }

    const tag = startMatch[1];

    // Hitta slutet på öppningstagg (kan sträcka sig över flera rader)
    let openingEnd = findOpeningTagEnd(lines, i);
    if (openingEnd === -1) {
      i++;
      continue;
    }

    // Är det self-closing?
    const openingLines = lines.slice(i, openingEnd + 1).join("\n");
    const isSelfClosing = /\/>\s*$/.test(openingLines.trim());

    let contentText: string | null = null;
    let endIndex = openingEnd;

    if (!isSelfClosing) {
      // Hitta motsvarande closing tag på top-level (kolumn 0)
      const closingRe = new RegExp(`^</${tag}>`);
      let depth = 1;
      for (let j = openingEnd + 1; j < lines.length; j++) {
        const candidate = lines[j];
        // Hoppa över nestade öppnings-/stängningstaggar av SAMMA typ
        if (new RegExp(`^<${tag}[\\s>]`).test(candidate)) depth++;
        if (closingRe.test(candidate)) {
          depth--;
          if (depth === 0) {
            contentText = lines.slice(openingEnd + 1, j).join("\n");
            endIndex = j;
            break;
          }
        }
      }
    }

    // Tolka notes-block efter komponenten
    let notesContent: string | undefined;
    let notesEndIndex = endIndex;
    const nextNonBlankIndex = findNextNonBlank(lines, endIndex + 1);
    if (nextNonBlankIndex !== -1 && /^<Notes>/.test(lines[nextNonBlankIndex])) {
      for (let j = nextNonBlankIndex + 1; j < lines.length; j++) {
        if (/^<\/Notes>/.test(lines[j])) {
          notesContent = lines
            .slice(nextNonBlankIndex + 1, j)
            .join("\n")
            .trim();
          notesEndIndex = j;
          break;
        }
      }
    }

    const props = parseProps(openingLines);
    const children = contentText != null ? parseInnerComponents(contentText) : [];

    components.push({
      tag,
      props,
      content: contentText,
      children,
      notes: notesContent,
    });

    i = notesEndIndex + 1;
  }

  return components;
}

/**
 * För nestade containers: parse komponenter INUTI en parent.
 * Letar efter rader med `<TagName` på kolumn 0 ELLER indenterat första bokstav stor.
 */
function parseInnerComponents(content: string): ParsedComponent[] {
  // För enkelhet: leta efter alla <TagName som inte är <Tag/> på en rad, och
  // försök matcha dem. Viktigt främst för Timeline → TimelineEvent,
  // Comparison → ComparisonColumn.
  const components: ParsedComponent[] = [];
  const lines = content.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const startMatch = /^<([A-Z][A-Za-z0-9]*)/.exec(trimmed);

    if (!startMatch) {
      i++;
      continue;
    }

    const tag = startMatch[1];
    const openingEnd = findOpeningTagEnd(lines, i);
    if (openingEnd === -1) {
      i++;
      continue;
    }

    const openingLines = lines.slice(i, openingEnd + 1).join("\n");
    const isSelfClosing = /\/>\s*$/.test(openingLines.trim());

    let contentText: string | null = null;
    let endIndex = openingEnd;

    if (!isSelfClosing) {
      const closingRe = new RegExp(`</${tag}>`);
      for (let j = openingEnd + 1; j < lines.length; j++) {
        if (closingRe.test(lines[j])) {
          contentText = lines.slice(openingEnd + 1, j).join("\n");
          // Om stängtaggen är på samma rad som content, ta bort den delen
          const lastLineClose = lines[j].indexOf(`</${tag}>`);
          if (lastLineClose > 0) {
            contentText += "\n" + lines[j].slice(0, lastLineClose);
          }
          endIndex = j;
          break;
        }
      }
    }

    components.push({
      tag,
      props: parseProps(openingLines),
      content: contentText,
      children: [],
    });

    i = endIndex + 1;
  }

  return components;
}

function findOpeningTagEnd(lines: string[], start: number): number {
  // Läs rader tills vi hittar `>` på top-level (inte inuti en JSX-expression eller string)
  // Enkel heuristik: räkna balansen av `{` / `}` och kolla för `>` som inte är del av `=>` eller `/>`
  let depth = 0;
  let inString: '"' | "'" | null = null;

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      const prev = c > 0 ? line[c - 1] : "";

      if (inString) {
        if (ch === inString && prev !== "\\") inString = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        inString = ch as '"' | "'";
        continue;
      }
      if (ch === "{") depth++;
      if (ch === "}") depth--;
      if (ch === ">" && depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function findNextNonBlank(lines: string[], start: number): number {
  for (let i = start; i < lines.length; i++) {
    if (lines[i].trim() !== "") return i;
  }
  return -1;
}

/**
 * Parse props från "<Tag prop1="a" prop2={5} prop3>".
 */
function parseProps(openingTag: string): Record<string, PropValue> {
  const props: Record<string, PropValue> = {};

  // Ta bort ledande < och taggnamn, och avslutande /> eller >
  const inner = openingTag
    .replace(/^<[A-Z][A-Za-z0-9]*\s*/, "")
    .replace(/\s*\/?>\s*$/, "")
    .trim();

  if (!inner) return props;

  // Regex-baserad prop-parser som hanterar:
  //   prop="value"
  //   prop='value'
  //   prop={expression}
  //   prop  (boolean, blir true)
  const propRe =
    /([A-Za-z_][A-Za-z0-9_]*)(?:=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\{(?:[^{}]|\{[^{}]*\})*\}))?/gs;

  let match;
  while ((match = propRe.exec(inner)) !== null) {
    const name = match[1];
    const rawValue = match[2];

    if (rawValue === undefined) {
      props[name] = true;
      continue;
    }

    if (rawValue.startsWith('"') || rawValue.startsWith("'")) {
      // String literal
      props[name] = rawValue.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
    } else if (rawValue.startsWith("{")) {
      // JSX expression - försök tolka som primitiv
      const expr = rawValue.slice(1, -1).trim();
      if (expr === "true") props[name] = true;
      else if (expr === "false") props[name] = false;
      else if (/^-?\d+(\.\d+)?$/.test(expr)) props[name] = parseFloat(expr);
      else if (/^"(?:[^"\\]|\\.)*"$/.test(expr))
        props[name] = expr.slice(1, -1).replace(/\\"/g, '"');
      else props[name] = expr; // behåll som string (går att skriva ut igen)
    }
  }

  return props;
}

/**
 * Serialize parsed structure tillbaka till MDX-källa.
 */
export function serializeMdx(parsed: ParsedPresentation): string {
  const frontmatter = matter.stringify("", parsed.frontmatter).replace(/\n\s*$/, "\n");
  const body = parsed.slides.map((s) => serializeComponent(s, 0)).join("\n\n");
  return `${frontmatter}\n${body}\n`;
}

function serializeComponent(comp: ParsedComponent, indent: number): string {
  const pad = "  ".repeat(indent);
  const propsStr = serializeProps(comp.props);

  const hasContent = comp.content !== null && comp.content !== undefined;
  const hasChildren = comp.children.length > 0;
  const isSelfClosing = !hasContent && !hasChildren;

  if (isSelfClosing) {
    // Enradig om props får plats, annars multi-line
    const singleLine = `${pad}<${comp.tag}${propsStr.inline} />`;
    if (singleLine.length <= 100 && !propsStr.inline.includes("\n")) {
      let result = singleLine;
      if (comp.notes) {
        result += `\n\n${pad}<Notes>\n${comp.notes}\n${pad}</Notes>`;
      }
      return result;
    }
    let result = `${pad}<${comp.tag}${propsStr.multiline}\n${pad}/>`;
    if (comp.notes) {
      result += `\n\n${pad}<Notes>\n${comp.notes}\n${pad}</Notes>`;
    }
    return result;
  }

  // Med children/content
  const openTag = propsStr.inline.length < 80 && !propsStr.inline.includes("\n")
    ? `<${comp.tag}${propsStr.inline}>`
    : `<${comp.tag}${propsStr.multiline}\n${pad}>`;

  // Prefer children när det finns — children är den strukturerade formen.
  // Content för templates som har nested JSX (Timeline, Comparison) är bara
  // råtext med samma JSX-taggar och skulle dubblera innehållet vid save.
  let body = "";
  if (hasChildren) {
    body = comp.children
      .map((child) => serializeComponent(child, indent + 1))
      .join("\n");
  } else if (hasContent) {
    body = comp.content ?? "";
  }

  let result = `${pad}${openTag}\n${body}\n${pad}</${comp.tag}>`;
  if (comp.notes) {
    result += `\n\n${pad}<Notes>\n${comp.notes}\n${pad}</Notes>`;
  }
  return result;
}

function serializeProps(props: Record<string, PropValue>): {
  inline: string;
  multiline: string;
} {
  const entries = Object.entries(props);
  if (entries.length === 0) return { inline: "", multiline: "" };

  const parts = entries.map(([k, v]) => {
    if (v === true) return k;
    if (typeof v === "string") {
      // Om stringen ser ut som en JSX-expression (array/object literal),
      // wrappa i {...}-syntax istället för "..." för att bevara
      // ursprungliga expression-formen (t.ex. options={[...]}).
      const trimmed = v.trim();
      const isArrayExpr = trimmed.startsWith("[") && trimmed.endsWith("]");
      const isObjectExpr = trimmed.startsWith("{") && trimmed.endsWith("}");
      if (isArrayExpr || isObjectExpr) {
        return `${k}={${v}}`;
      }
      return `${k}="${escapeAttr(v)}"`;
    }
    if (typeof v === "number") return `${k}={${v}}`;
    if (typeof v === "boolean") return `${k}={${v}}`;
    return `${k}="${String(v)}"`;
  });

  return {
    inline: " " + parts.join(" "),
    multiline: "\n  " + parts.join("\n  "),
  };
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '\\"');
}
