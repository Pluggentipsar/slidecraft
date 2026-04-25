# Notes for AI agents working in this repo

## This is NOT vanilla Next.js

Slidecraft runs on **Next.js 16.2 + React 19 + Turbopack + Tailwind 4**. APIs, file conventions, and config differ from older Next.js versions you may have seen in training data. Before touching framework-level code (config, layouts, server actions, dynamic routes), read the relevant page in `node_modules/next/dist/docs/` first. Heed deprecation notices.

## Mental model

A **presentation** is one MDX file in `content/`. Frontmatter sets metadata (title, slug, theme, deploy mode). The MDX body is a sequence of slide-templates from `src/templates/` — each a React component that renders a full-screen slide.

Three runtimes share the same MDX:
- **Presenter view** (`/[slug]`) — the speaker drives slides with arrow keys / space.
- **Audience view** (`/audience/[code]`) — phones connect by 6-digit code; sees current slide + can ask questions / vote in polls.
- **Editor** (`/[slug]/edit`) — inline-edit MDX with structured field controls per template.

Audience-sync runs over **Supabase Realtime** (sessions + audience_questions + interactions tables). Presenter ↔ Presenter-view ↔ Audience-view sync uses **BroadcastChannel** within one device and **Supabase** across devices.

## Where things live

- `content/*.mdx` — the actual presentations
- `src/templates/*.tsx` — slide templates (one component per file, exported from `src/templates/index.ts`)
- `src/lib/template-schemas.ts` — structured prop schema per template (powers the editor's field controls)
- `src/themes/index.ts` — theme tokens (color, font, motion). MDX frontmatter `theme: forest` selects one.
- `src/lib/mdx.ts` — MDX → presentation parsing
- `src/components/PresentationRenderer.tsx` — wires templates as MDX components
- `src/lib/presenter-sync.ts` — BroadcastChannel sync
- `src/lib/use-audience-*.ts` — Supabase realtime hooks
- `supabase/migrations/*.sql` — schema (run in Supabase SQL editor)
- `docs/` — user-facing setup guides

## Adding a new template

1. Create `src/templates/MyTemplate.tsx` — a React component, `"use client"` if it uses hooks/animation
2. Export it from `src/templates/index.ts`
3. Register it in `src/components/PresentationRenderer.tsx` so MDX knows the tag
4. Add a schema to `src/lib/template-schemas.ts` (powers the editor)
5. Document it in `docs/TEMPLATES.md` (catalog)
6. Add a slide that uses it to `content/showcase.mdx` (live demo)

The `/planera` skill expects all six steps. Don't ship a template the catalog doesn't know about.

## Stepped reveal

Templates that build content inside the slide (BulletBuild, NumberedReveal, Timeline, …) use `useSlideSteps(count)` to register their step count and read the current step. Space / right-arrow advances the step inside the slide before moving to the next slide.

## What NOT to do

- Don't `npm run build` and commit `.next/` artifacts.
- Don't add new env vars without updating `.env.example` and the relevant doc.
- Don't introduce a new framework-level dependency without a clear reason — slides should be expressible with the existing stack.
- Don't write to `node_modules/`.
