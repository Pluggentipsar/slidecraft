/**
 * Extraherar <Notes>...</Notes>-block från MDX-källkod och returnerar:
 * 1. Rensad MDX utan Notes-block
 * 2. Notes-array med mapping till slide-index (slide = top-level JSX-element som inte är <Notes>)
 *
 * En <Notes> associeras med slide som kommer DIREKT före (samma logik som tidigare),
 * så vi måste hålla koll på slide-index när vi itererar genom dokumentet.
 */
export function extractNotes(source: string): { content: string; notes: (string | null)[] } {
  // Räkna slides genom att gå igenom top-level JSX-element sekventiellt
  // och behålla ordningen mellan slides och <Notes>-block.
  const notesBySlideIndex: (string | null)[] = [];

  // Steg 1: Hitta alla <Notes>...</Notes>-block och spara deras position.
  const notesRegex = /<Notes>([\s\S]*?)<\/Notes>/g;
  type Block = { start: number; end: number; content: string };
  const blocks: Block[] = [];
  let match: RegExpExecArray | null;
  while ((match = notesRegex.exec(source)) !== null) {
    blocks.push({ start: match.index, end: match.index + match[0].length, content: match[1].trim() });
  }

  // Steg 2: Räkna slides före varje Notes-block genom att kolla
  // hur många top-level JSX-komponent-element som syns före positionen.
  // Vi approximerar "top-level JSX" genom att leta efter rader som börjar med <Tag.
  const lines = source.split("\n");
  const linePositions: number[] = [];
  let pos = 0;
  for (const line of lines) {
    linePositions.push(pos);
    pos += line.length + 1;
  }

  function slidesBefore(charPos: number): number {
    let count = 0;
    let insideNotes = false;
    for (let i = 0; i < lines.length; i++) {
      const lineStart = linePositions[i];
      if (lineStart >= charPos) break;
      const line = lines[i];
      // Endast top-level-element räknas (kolumn 0, ingen indent)
      const tagMatch = /^<([A-Z][A-Za-z0-9]*)/.exec(line);
      if (tagMatch) {
        const tag = tagMatch[1];
        if (tag === "Notes") {
          insideNotes = true;
          continue;
        }
        if (!insideNotes) {
          count++;
        }
      }
      if (/<\/Notes>/.test(line)) {
        insideNotes = false;
      }
    }
    return count;
  }

  for (const block of blocks) {
    const slideIdx = slidesBefore(block.start) - 1; // -1 eftersom räkningen är 1-baserad
    if (slideIdx >= 0) {
      notesBySlideIndex[slideIdx] = block.content;
    }
  }

  // Steg 3: Rensa MDX från Notes-block.
  const content = source.replace(notesRegex, "").replace(/\n{3,}/g, "\n\n");

  return { content, notes: notesBySlideIndex };
}
