# LLM-knowledge-base integration

Slidecraft works perfectly fine on its own — you write MDX, components render slides. But if you've already invested in a personal knowledge management system (notes, articles, research, personal wiki), you probably don't want to rewrite all that material into slide form by hand.

This guide describes how to wire **[llm-knowledge-base](https://github.com/Pluggentipsar/llm-knowledge-base)** to Slidecraft so a planning skill can pull material from your knowledge graph into freshly-generated decks.

> **You don't need this** to use Slidecraft. Skip if you're not already using llm-knowledge-base or a similar AI-organised wiki.

## What llm-knowledge-base does

It's a sister project that turns "rough material → organised wiki" automatically:

- You drop URLs, PDFs, articles, voice notes, screenshots into an inbox.
- A capture skill ingests them, summarises, tags, and files into the right wiki article.
- A research skill cross-references against external sources (OpenAlex, Semantic Scholar, etc.).
- The result is a directory of clean Markdown wiki articles, each with sources, key claims, and your own thinking.

**Practical result:** by the time you sit down to write a talk, you already have well-organised material to draw from.

## How it integrates with Slidecraft

The integration is **read-only**: Slidecraft (or its `/planera` skill) reads from the wiki, writes to `content/*.mdx`. The wiki itself never gets edited from Slidecraft.

```
llm-knowledge-base/                 slidecraft/
├── wiki/                           ├── content/
│   └── ai-and-pedagogy.md   ─►    │     └── new-talk.mdx
│   └── source-criticism.md         │
├── teman/                          ├── .claude/skills/planera/
│   └── ai-grundkurs/               │     └── reads upstream wiki, writes mdx
└── raw/                            └── docs/TEMPLATES.md
```

## Setup

### Option 1 — Side-by-side checkouts (simplest)

```bash
~/Code/
  slidecraft/
  llm-knowledge-base/
```

In `slidecraft/.claude/skills/planera/SKILL.md`, add a `KNOWLEDGE_BASE_PATH` variable:

```yaml
---
name: planera
description: Plan and generate presentations from existing material
---

# Knowledge sources
- Local wiki: `../llm-knowledge-base/wiki/`
- Local themes / lecture material: `../llm-knowledge-base/teman/`
```

The skill now reads from the parallel checkout when generating presentations.

### Option 2 — Single monorepo

If you want everything under one git repo:

```
my-presentations/
  ├── slidecraft/        ← git submodule of slidecraft
  ├── wiki/              ← your knowledge base
  ├── teman/             ← lecture-theme folders
  └── .claude/
        └── skills/      ← skills that read wiki + write to slidecraft/content/
```

Slidecraft's `/planera` skill in this layout points at `../wiki/` and writes to `slidecraft/content/`.

### Option 3 — Remote wiki via API

If your knowledge base is hosted (e.g., as a static site or Notion/Obsidian-on-server), expose a JSON API for it and have the skill fetch articles by topic.

This is more work but lets multiple presenters share one knowledge source.

## Workflow

A typical session with the integration:

1. **Capture** material as you go (`/capture` in llm-knowledge-base) — articles you read, talks you attended, ideas while showering.
2. The wiki organises it overnight.
3. **Plan a talk:** "I'm doing 30 min on AI in education for high school teachers next month." Open Slidecraft, run `/planera`.
4. The skill reads relevant wiki articles, picks templates, drafts a deck structure, asks you to refine.
5. You iterate. Skill writes `content/the-talk.mdx`.
6. Open <http://localhost:3000/the-talk>, walk through, polish the slides that need attention.

## What the planning skill should look for in the wiki

- **Frontmatter tags** that match the talk's topic
- **Quotes / statistics** with source citations (great for `<Quote>` and `<BigStat>` templates)
- **Pre-organised "lecture themes"** in `teman/{topic}/` if you keep them
- **Recently-updated articles** (likely to have something fresh you want to use)

The default `/planera` skill (in `.claude/skills/planera/SKILL.md`) has a structured search/select/generate flow. Adapt it to your knowledge layout.

## Caveats

- **Don't write back to the wiki from Slidecraft.** The wiki has its own organisation logic. Slidecraft pulls; doesn't push.
- **Sources matter.** When the planning skill quotes a number, it should also pull the source citation from the wiki and put it in the slide's `source` prop.
- **LLMs hallucinate.** Run a quick fact-check pass on any draft deck before presenting.

## Alternatives

You don't have to use llm-knowledge-base specifically. Any of these can play the same role:

- An Obsidian vault — point the skill at the vault folder.
- A Notion database — have the skill fetch via Notion API.
- Plain Markdown notes in Dropbox — easiest of all.
- A Zettelkasten — same as Obsidian.

The contract is just: **a folder of well-tagged Markdown the planning skill can grep.**

## See also

- The `.claude/skills/planera/SKILL.md` shipped in this repo — already structured to read external knowledge sources.
- [docs/TEMPLATES.md](TEMPLATES.md) — the catalog the skill picks from.
