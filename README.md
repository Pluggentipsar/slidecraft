# Slidecraft

> Slides as code. Real animations. Live audience interaction.

A presentation system that treats slides as React components, MDX as the file format, and your laptop as the live broadcast hub. Built for talks where rectangles of bullet points aren't enough.

```mdx
---
title: My talk
theme: editorial
---

<TitleSlide title="A real talk" subtitle="Rendered as code" />

<GiantText align="left">
  PowerPoint **wasn't built** for this.
</GiantText>

<BulletBuild title="What slidecraft gives you">
- 160+ purpose-built slide templates (with new ones easy to add)
- Floating overlays — drop images, videos, chats, text on any slide
- Live polls, Q&A, slide sync to phones in the room
- Themes that actually feel like themes — typography, motion, ornament
- Cloudflare Tunnel preset for "share my laptop's deck right now"
- Your slides are version-controlled, diff-able, AI-editable
</BulletBuild>
```

That MDX is a real, working 3-slide deck.

---

## What you can do with slidecraft

### 📝 Write a presentation in MDX

Each MDX file in `content/` is one deck. Each component you place in it becomes one slide. You compose your deck from a catalog of **160 purpose-built templates** — title slides, bullet builds, comparisons, statistics, quotes, AI chat mocks, pedagogical models (SAMR / Bloom / SOLO), data visualisations, particle systems, and a lot more. Browse the full catalog in [docs/TEMPLATES.md](docs/TEMPLATES.md).

```mdx
<BigStat
  eyebrow="From the catalog"
  contextAbove="Slidecraft ships with"
  value={160}
  contextBelow="purpose-built slide templates."
/>
```

When you save the file, the dashboard updates. No build step. No deploy.

### ✏️ Edit visually in the browser — no MDX required

Open `/my-talk/edit` and you get a structured editor. Click any text on the slide to **edit it inline**. Click the field panel to edit props with proper input controls (sliders, dropdowns, color pickers, image pickers). Switch templates from a typed picker. Add new slides from a catalog. Your edits write back to the MDX file in `content/`, so everything stays git-tracked and diff-able.

You don't have to touch MDX to edit a deck. But you can if you want to.

### 🖼️ Drop images, videos, and chat mockups anywhere on a slide

`<FloatingImage>`, `<FloatingVideo>`, `<FloatingChat>`, `<FloatingText>`, `<FloatingPills>`, and `<FloatingPhone>` are draggable overlays you can place on top of any slide. In the editor:

- **Click** to select, **drag the centre** to move, **drag a corner** to resize
- Rotate, change opacity, send to back/front
- **Upload images and videos directly** from the browser — no separate file management
- Your saved positions render statically when you present

This is how you handle "I want this image *here* on this slide" without writing a custom layout.

### 🎤 Present from your laptop

Press space to advance. Hit **F** for fullscreen, **N** for speaker notes, **M** for the slide menu, **left-arrow** to go back. Bullet templates do **stepped reveal** — each press reveals the next item; the slide doesn't advance until all items are out.

You also get:

- **Speaker view** at `/my-talk/presenter` — notes, timer, next-slide preview, in a separate window
- **`<Notes>` blocks** in your MDX become speaker notes (press N to see them)
- **Touch-swipe** support on tablets

### 📱 Engage your audience live

Set up Supabase once ([04-supabase.md](docs/04-supabase.md)) and your decks gain a phone-friendly companion view. When you press **S** to start a session you get:

- A **6-digit session code** + QR code. Audience scans or enters at `/join`.
- **Live slide sync** — when you advance a slide, every phone in the room updates instantly
- **Anonymous Q&A** — anyone can submit questions tied to the current slide. You see them in an overlay (press Q).
- **`<LivePoll>`** — multiple-choice polls with live tallies that you can reveal results for on stage
- **`<LiveReflection>`** — open-text responses that appear as a growing wall of cards
- **Audience navigation controls** — let phones scroll back through slides they missed (toggleable)
- **Reactions** that float across the screen during the talk

It's IRL audience interaction without a third-party menti-style service.

### 🌐 Share your deck three ways

| Mode | When | How |
|------|------|-----|
| **Permanent URL** | Evergreen decks, async viewing, "send the link" | `git push` → Vercel/Cloudflare Pages auto-deploys at `slides.yourdomain.com`. Done. |
| **Live tunnel** | Present from your laptop with heavy media that won't deploy | `npm run present` opens a Cloudflare Tunnel. Audience hits a public URL pointing at your laptop. No deploy, no commit. |
| **Hybrid** | Audience needs permanent URL but you've got gigabytes of media | Audience view at deployed URL; presenter at localhost; both share state via Supabase. Set `deploy: local-only` in frontmatter and demos render placeholders for absent media. |

Details and trade-offs in [docs/02-local-media.md](docs/02-local-media.md) and [docs/03-cloudflare.md](docs/03-cloudflare.md).

### 📄 Export to PDF (or video)

`Cmd/Ctrl+K` → **Export PDF** renders the entire deck as a single PDF via `modern-screenshot` — animations frozen, layout pixel-perfect. Useful for handouts, documentation, or pre-talk distribution.

For polished MP4s with full animation, wire to **[remotion-playwright](https://github.com/Pluggentipsar/remotion-playwright)**. See [docs/07-remotion-playwright.md](docs/07-remotion-playwright.md).

### 🎨 Use any of 8 themes — or define your own

```yaml
---
theme: forest   # default | sunset | editorial | minimal | retro_futurism | forest | omtnk | karlskrona
---
```

Themes are **complete token systems** — colour, typography, geometry, motion, ornament. Switch themes and the entire visual register changes; your content doesn't move. Themes can also set a `backgroundTexture` (URL or image path) which renders as a slide-wide background image; **frosted-glass content panels auto-activate** so text stays readable on busy backgrounds.

Two of the eight themes (`omtnk`, `karlskrona`) are intentional examples — copy them as a starting point for your own brand theme.

### 🤖 Plan whole decks with AI

This repo includes a [Claude Code skill](.claude/skills/planera/SKILL.md) that drafts presentations from a brief. Give it a topic, audience, duration, and tone — it picks templates from the catalog, builds new ones when nothing fits, writes your MDX, and follows the six-step template-creation ritual when it adds new components.

Works with other AI assistants too — point them at `docs/TEMPLATES.md` + `src/lib/template-schemas.ts` and they have enough context to draft good decks.

---

## What it isn't

- **Not WYSIWYG.** You can build entire decks visually in the editor, but the file format is MDX. Power users can edit MDX directly. That trade-off is intentional.
- **Not a SaaS.** You self-host. Your slides are yours. They live in your git repo.
- **Not a one-click PowerPoint replacement.** It's slower to start than Keynote (you'll need 5 minutes to install) and faster to iterate than Keynote once you're in. Pick accordingly.

---

## Quickstart

```bash
git clone https://github.com/Pluggentipsar/slidecraft.git
cd slidecraft
npm install
npm run dev
```

Open <http://localhost:3000>. Click any demo. Press space.

Then create `content/hello.mdx`:

```mdx
---
title: Hello world
slug: hello
---

<TitleSlide title="Hello, slidecraft" />

<GiantText align="center">
  This is a slide.
</GiantText>
```

Reload <http://localhost:3000>. Your deck is on the dashboard.

Full quickstart — including how to add audience mode, host your own tunnel, and deploy — in [docs/01-quickstart.md](docs/01-quickstart.md).

---

## Documentation

| Doc | What's in it |
|-----|--------------|
| [01-quickstart.md](docs/01-quickstart.md) | Install, your first deck, key shortcuts, the editor |
| [02-local-media.md](docs/02-local-media.md) | Where to put images / video, the three deploy strategies |
| [03-cloudflare.md](docs/03-cloudflare.md) | `npm run present` — share your laptop with the world via Cloudflare Tunnel |
| [04-supabase.md](docs/04-supabase.md) | Set up audience mode (live polls, Q&A, slide sync) |
| [05-deploy-vercel.md](docs/05-deploy-vercel.md) | Deploy to Vercel, Cloudflare Pages, or self-host |
| [06-llm-integration.md](docs/06-llm-integration.md) | Wire to [llm-knowledge-base](https://github.com/Pluggentipsar/llm-knowledge-base) for AI-organised source material |
| [07-remotion-playwright.md](docs/07-remotion-playwright.md) | Auto-record polished MP4 videos of your decks |
| [TEMPLATES.md](docs/TEMPLATES.md) | The full template catalog — every slide template with props, examples, and "don't use when" |

---

## Three views, one MDX file

```
content/my-talk.mdx
       │
       ├── /my-talk             — present view (you drive with arrows)
       ├── /my-talk/edit        — visual editor (writes back to MDX)
       └── /my-talk/presenter   — speaker view (notes, timer, next-slide preview)
```

Plus:
- `/audience/[code]` — phones join here when you start an audience session
- `/join` — public landing where the audience enters the 6-digit code

---

## How templates work

Slidecraft slides are **just React components**. Every existing template is in `src/templates/`. They:

- Accept typed props (so the editor can render structured form controls)
- Use CSS variables for theming (`var(--accent)`, `var(--bg)`, etc.) — every template adapts to every theme
- Use Framer Motion for animation; respect `prefers-reduced-motion: reduce`
- Use `useSlideSteps()` for in-slide step-reveal (space advances within the slide before moving on)
- Wrap editable text in `<EditableText>` so the editor can do inline edits

Adding a new template is a six-step ritual (write component, register, schema, doc, demo, commit). The `/planera` skill walks an AI assistant through it. See [.claude/skills/planera/SKILL.md](.claude/skills/planera/SKILL.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Stepped reveal

Templates that build content inside the slide (`BulletBuild`, `NumberedReveal`, `Timeline`, `PollQuestion`, `ParticleField`, the various `Floating*`, …) advance one *step* at a time before moving to the next slide. Space goes forward, left-arrow back. The audience sees the same step you're on.

Add stepping to your own templates by reading `useSlideSteps(count)` from `@/lib/slide-steps` and rendering up to `currentStep`.

---

## Contributing

PRs welcome. New templates, new themes, bug fixes, doc improvements — all good. See [CONTRIBUTING.md](CONTRIBUTING.md).

A few non-obvious rules:
- Templates added to `src/templates/` must also land in `docs/TEMPLATES.md` and `src/lib/template-schemas.ts` in the same PR.
- Themes added to `src/themes/index.ts` should include a `description` comment that explains the use-case.
- Don't add framework-level dependencies without an issue first — the stack is intentionally tight.

---

## Stack

- **Next.js 16.2** + **React 19** + **Turbopack**
- **Tailwind CSS 4** + custom CSS variables for themes
- **Framer Motion 12** for animations
- **MDX** + `next-mdx-remote` for content
- **Supabase** (Postgres + Realtime) for audience mode
- **modern-screenshot** for full-deck PDF export
- **Cloudflare Tunnel** + `concurrently` for the `npm run present` flow
- **TypeScript** throughout

---

## License

[MIT](LICENSE) — do anything you want, just don't blame us.

## Credits

Slidecraft started as the in-house presentation system for Joel Rangsjö's lectures on AI in education. Open-sourced because every interesting presentation system that came before stopped being interesting. Maintained as a side project; PRs and issues read regularly.

Sister projects worth knowing about:

- **[llm-knowledge-base](https://github.com/Pluggentipsar/llm-knowledge-base)** — AI-organised personal wiki. Wire it to slidecraft and you can plan decks straight from your knowledge graph.
- **[remotion-playwright](https://github.com/Pluggentipsar/remotion-playwright)** — record polished MP4s of any slidecraft deck programmatically.
