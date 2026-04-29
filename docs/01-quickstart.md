# Quickstart

Get Slidecraft running locally in under 5 minutes — and then a tour of what you can actually do with it.

## Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node) or **pnpm** / **bun**
- A modern browser (Chrome, Firefox, Safari, Edge)

That's it. No database needed for the basic flow — Supabase is only required when you want **audience mode** (live polls, Q&A, sync). See [04-supabase.md](04-supabase.md) for that.

## Install

```bash
git clone https://github.com/Pluggentipsar/slidecraft.git
cd slidecraft
npm install
```

## First run

```bash
npm run dev
```

Open <http://localhost:3000>. You'll see the home dashboard with the demo presentations that ship with Slidecraft.

Click any presentation card → arrow keys / space to navigate. Press `Escape` to return to the dashboard.

## Build your first presentation

Slidecraft presentations live in `content/` as `.mdx` files. **Each file is one presentation; each component is one slide.**

Create `content/hello.mdx`:

```mdx
---
title: My first slidecraft deck
slug: hello
theme: default
---

<TitleSlide
  title="Hello, slidecraft"
  subtitle="Slides as code. Built with React."
/>

<GiantText align="center">
  Press **space** to advance.
</GiantText>

<BulletBuild title="Why code-based slides?">
- Reusable components, not copy-paste boxes
- Real animations, not click-to-fly-in
- Version-controlled like the rest of your work
- Live audience interaction baked in
</BulletBuild>

<Outro
  title="Tack"
  email="hello@example.com"
/>
```

Save the file. The dashboard at <http://localhost:3000> now lists "My first slidecraft deck". Click it. Press space.

That's the whole loop. **No build step. No deploy. Edit MDX → reload → it's there.**

### What just happened?

- The frontmatter set the title, slug, and theme.
- Each `<Component>` block became a full-screen slide.
- `BulletBuild` reveals one bullet per space press before advancing — that's **stepped reveal**, a slidecraft signature.
- The theme `default` gave you Fraunces (serif) + Inter + cyan accent.

Try changing `theme: default` to `theme: editorial`, `theme: forest`, or `theme: minimal` and reload. Same content, completely different aesthetic.

---

## Edit visually in the browser

You don't have to write MDX to edit a deck. Open `http://localhost:3000/hello/edit`:

- **Click any text on the slide** → edit it inline. Press Enter to save.
- **Field panel on the right** → structured form controls per template. Sliders, dropdowns, color pickers, image pickers. All typed.
- **Slide list on the left** → reorder with drag, duplicate, delete. **Add a new slide** from a typed template picker.
- **Save indicator** in the corner. Edits write back to the `.mdx` file in `content/` so they're git-tracked like any other code change.

You can switch between editor and present view freely. Your slide position syncs across both.

### Add an image — drag, resize, place anywhere

Inside the editor, hit **+ → Add Image**. Pick a file from your computer (uploads to `public/local/` automatically) or paste an external URL. The image appears as a `<FloatingImage>` overlay you can:

- **Drag** to position
- **Resize** by dragging a corner
- **Rotate** with the rotate handle
- Send to back/front with the layer toggle

The image renders statically when you present — exactly where you placed it. Same flow for **videos**, **chat mockups**, **text overlays**, **pill-stats**, and **phone mockups** (`<FloatingVideo>`, `<FloatingChat>`, `<FloatingText>`, `<FloatingPills>`, `<FloatingPhone>`).

This is how slidecraft handles "I want this *here* on this slide" without you writing a custom layout.

---

## Browse the template catalog

Slidecraft ships with **160 templates**. The full catalog with props, examples and "don't use when" guidance is in [TEMPLATES.md](TEMPLATES.md).

Categories:

- **Statements & openers** — `TitleSlide`, `GiantText`, `Manifesto`, `HeroStatement`, `HookStatement`, `EditorialQuote`, `TriadStatement`, `Quote`, …
- **Stepped reveals** — `BulletBuild`, `NumberedReveal`, `SideScrollList`, `RevealList`, `Timeline`, `AcronymList`, …
- **Comparisons & two-state** — `Comparison`, `TwoPaths`, `TwoSides`, `SpotlightContrast`, `BloomComparison`, `NoviceDilemma`, `BildningContrast`, `HumanOnlyTriad`, …
- **Statistics** — `BigStat`, `StatCounter`, `StatCompare`, `StatsTriptych`, `MetricGrid`, `ParadoxStat`, …
- **AI demos** — `PromptAnimation`, `BeforeAfter`, `AiConversation`, `ChatHero`, `ChatPreview`, `ChatFullscreen`, `BiasCode`, `DataRedaction`, `NextTokenDemo`, `PromptToImage`, `DarkPatternsApp`, `LiveEmbed`, …
- **Pedagogical models** — `SAMRSpectrum`, `BloomPyramid`, `JagAIJagFlow`, `SOLOGraph`, `JaggedFrontier`, `DimensionMap`, `BeforeAfterPhases`, `LensIntro`, `LensApplication`, …
- **Visual / image** — `HeroImage`, `ImageBleed`, `ImageText`, `LayeredText`, `Collage`, `SlideshowMorph`, `MapPins`, `HotspotImage`, `HopeMontage`, `MediaCarousel`, …
- **Quotes & voices** — `EditorialQuote`, `FigureQuote`, `PictureQuote`, `StudentVoices`, `VoiceCollage`, `QuoteWall`, …
- **Dramatic typography** — `GiantScroll`, `ParticleField`, `MirrorReveal`, `RotatingStatement`, `WeirdReveal`, …
- **Floating overlays** — `FloatingImage`, `FloatingVideo`, `FloatingChat`, `FloatingText`, `FloatingPills`, `FloatingPhone`
- **Audience interaction** — `LivePoll`, `LiveReflection`, `Reflection`, `PollQuestion`
- **Outro & contact** — `Outro`, `TackSlide`, `BrandIntro`

Open `/showcase` while the dev server runs for a guided tour deck (`content/showcase.mdx` — 110+ slides showing most templates).

---

## Present from your laptop

```bash
npm run dev    # for local
npm run present  # for sharing via Cloudflare tunnel — see 03-cloudflare.md
```

Open `/hello`. Press **F** for fullscreen.

### Keyboard shortcuts (present view)

| Key | Action |
|-----|--------|
| `→` / `Space` | Next step or slide |
| `←` | Previous step or slide |
| `Home` / `End` | First / last slide |
| `F` | Toggle fullscreen |
| `N` | Open speaker notes overlay |
| `M` | Open menu (jump to slide, theme info, exports) |
| `S` | Start audience session (Supabase required) |
| `Q` | Open audience questions overlay (during session) |
| `Esc` | Exit overlay or fullscreen |
| `Cmd/Ctrl + K` | Open menu |

### Speaker view

Open `/hello/presenter` in a separate window before you go on stage:

- Speaker notes (any `<Notes>` block in your MDX)
- Talk timer
- Next-slide preview
- Step counter for stepped templates

It syncs with the present view via `BroadcastChannel` (same device) or Supabase (different devices).

### Speaker notes

Add `<Notes>` blocks anywhere in your MDX. They're attached to the slide that comes right before:

```mdx
<TitleSlide title="Hello, slidecraft" />

<Notes>
Open lecture lighter than usual. Wait for laughter.
Mention William → ChatGPT story before pressing space.
</Notes>

<GiantText>Slides are code.</GiantText>
```

Press **N** during the present view to see them.

---

## Engage your audience live

(Optional — requires [Supabase setup](04-supabase.md))

Once Supabase is wired up, press **S** during a presentation to start an audience session. You get a 6-digit code + QR. Audience scans/enters the code at `/join` and lands on a phone-friendly companion view that:

- **Follows your slides** in real-time
- **Lets them ask questions** that you see in an overlay (press Q)
- **Collects votes** for any `<LivePoll>` template you've placed in your MDX
- **Collects open-text reflections** for any `<LiveReflection>` template
- **Shows reactions** that float across the screen

Example poll in your MDX:

```mdx
<LivePoll
  pollKey="zone-check"
  title="Which AI zone is your classroom in?"
>
- Zone 1 · No AI · neutral
- Zone 2 · Half-hearted · danger
- Zone 3 · Committed · success
</LivePoll>
```

`pollKey` is a unique identifier so the same poll persists across sessions. Reveal results when you choose by pressing space.

Free-text reflections work the same way:

```mdx
<LiveReflection
  pollKey="missa-inte"
  title="What do you not want me to miss today?"
  subtitle="Scan the QR, write your answer — I'll tick them off as I cover them."
/>
```

Submitted answers appear as a growing wall of cards on stage. Tap one to feature it.

---

## Share your deck

### Option 1: Permanent URL (deploy)

Push to a Vercel/Cloudflare Pages-connected repo and your deck is live at `slides.yourdomain.com`. See [05-deploy-vercel.md](05-deploy-vercel.md).

### Option 2: Live tunnel from your laptop

```bash
npm run present
```

Spawns a Cloudflare quick tunnel. Audience hits a public URL pointing at your laptop. No deploy. Heavy demo media works (it's served from your machine). See [03-cloudflare.md](03-cloudflare.md).

### Option 3: Hybrid

Audience view at the deployed URL; presenter at localhost; both share state via Supabase. Set `deploy: local-only` in frontmatter if you have media too big to commit. See [02-local-media.md](02-local-media.md).

---

## Export to PDF

Press **M** (or **Cmd/Ctrl+K**) → **Export PDF**. The full deck renders to a single PDF via `modern-screenshot`. Useful for handouts, async sharing, or pre-talk distribution.

For polished MP4s with full animations, see [07-remotion-playwright.md](07-remotion-playwright.md).

---

## Useful commands

```bash
npm run dev               # Dev server on :3000 (hot reload, Turbopack)
npm run build             # Production build
npm run start             # Run the production build
npm run present           # Dev server + Cloudflare quick tunnel (random URL)
npm run present:named     # Dev server + your named Cloudflare tunnel
npm run lint              # ESLint
```

---

## Use AI to plan your decks

This repo includes a [Claude Code skill](../.claude/skills/planera/SKILL.md) (`/planera`) that drafts presentations from a brief. Give it a topic, audience, duration, tone, and theme preference — it picks templates from the catalog, builds new ones when nothing fits, writes your MDX, and follows the six-step template-creation ritual.

Other AI assistants can do the same — point them at:
1. `docs/TEMPLATES.md` — the catalog
2. `src/lib/template-schemas.ts` — typed prop schemas
3. `content/showcase.mdx` — example usage of most templates

That's enough context for the model to draft good decks.

---

## Where to next

| You want to… | Read |
|--------------|------|
| Use images and videos | [02-local-media.md](02-local-media.md) |
| Present from your laptop to a remote audience | [03-cloudflare.md](03-cloudflare.md) |
| Add live polls, Q&A, audience sync | [04-supabase.md](04-supabase.md) |
| Deploy a permanent URL | [05-deploy-vercel.md](05-deploy-vercel.md) |
| See every available slide template | [TEMPLATES.md](TEMPLATES.md) |
| Generate slides from an LLM-organised knowledge base | [06-llm-integration.md](06-llm-integration.md) |
| Auto-record demo videos of your deck | [07-remotion-playwright.md](07-remotion-playwright.md) |
| Add a new template | [../CONTRIBUTING.md](../CONTRIBUTING.md) |

Stuck? Open an issue at <https://github.com/Pluggentipsar/slidecraft/issues>.
