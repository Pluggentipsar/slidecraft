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
- 100+ purpose-built slide templates (with new ones easy to add)
- Live polls, Q&A, slide sync to phones in the room
- Themes that actually feel like themes — typography, motion, ornament
- Cloudflare Tunnel preset for "share my laptop's deck right now"
- Your slides are version-controlled, diff-able, AI-editable
</BulletBuild>
```

That MDX is a real, working 3-slide deck.

## What it is

- **Code-based slides** — every slide is a React component. You compose decks in MDX. Real animations, real interaction, real data.
- **~100 templates** out of the box — title slides, hero statements, comparisons, statistics, AI conversation mocks, particle systems, polls, reflections, and many more.
- **8 themes** — `default`, `editorial`, `forest`, `minimal`, `retro_futurism`, `sunset`, plus two example brand themes (`omtnk`, `karlskrona`).
- **Audience mode** (Supabase) — 6-digit session code, phones join, live slide sync, anonymous Q&A, real-time polls and reflections.
- **Cloudflare Tunnel built in** — `npm run present` gives you a public URL pointing at your laptop, no deploy required.
- **An editor** — visual editing with structured field controls per template. Edits write back to MDX so everything stays git-tracked.
- **A planning skill** for Claude Code (`.claude/skills/planera/`) that drafts decks from a brief, picks the right templates, and creates new ones when nothing fits.

## What it isn't

- **Not WYSIWYG.** You build slides by composing components. The editor helps, but you'll touch MDX. That's a feature.
- **Not a SaaS.** You self-host. Your slides are yours.
- **Not a one-click PowerPoint replacement.** It's slower to start than Keynote and faster to iterate than Keynote. Pick accordingly.

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

Full quickstart in [docs/01-quickstart.md](docs/01-quickstart.md).

## Documentation

| Doc | What's in it |
|-----|--------------|
| [01-quickstart.md](docs/01-quickstart.md) | Install, first deck, key shortcuts |
| [02-local-media.md](docs/02-local-media.md) | Where to put images / video, three deploy strategies |
| [03-cloudflare.md](docs/03-cloudflare.md) | `npm run present` — share your laptop with the world via Cloudflare Tunnel |
| [04-supabase.md](docs/04-supabase.md) | Set up audience mode (live polls, Q&A, slide sync) |
| [05-deploy-vercel.md](docs/05-deploy-vercel.md) | Deploy to Vercel, Cloudflare Pages, or self-host |
| [06-llm-integration.md](docs/06-llm-integration.md) | Wire to [llm-knowledge-base](https://github.com/Pluggentipsar/llm-knowledge-base) for AI-organised source material |
| [07-remotion-playwright.md](docs/07-remotion-playwright.md) | Auto-record polished MP4 videos of your decks via [remotion-playwright](https://github.com/Pluggentipsar/remotion-playwright) |
| [TEMPLATES.md](docs/TEMPLATES.md) | The full catalog — every slide template with props, examples, and "don't use when" |

## How presenting works

Three views, one MDX file:

```
content/my-talk.mdx
       │
       ├── /my-talk             — present view (you drive with arrows)
       ├── /my-talk/edit        — visual editor (writes back to MDX)
       └── /my-talk/presenter   — speaker view (notes, timer, next-slide preview)
```

Plus:
- `/audience/[code]` — phones join here when you start an audience session.
- `/join` — public landing where the audience enters the 6-digit code.

## Three modes for sharing your deck

| Mode | Best for | Setup |
|------|----------|-------|
| **Self-contained** | Evergreen reference decks | `git push` → Vercel auto-deploys at `slides.yourdomain.com`. Done. |
| **Laptop-as-server** | Live talks, heavy demo media | `npm run present` opens a Cloudflare Tunnel. Audience hits a public URL pointing at your laptop. |
| **Hybrid** | Audience needs a permanent URL but you have huge media | Audience view at deployed URL; presenter at localhost; both share state via Supabase. |

## Templates ≠ HTML, but neither do they have to be

Slidecraft slides are **just React components**. Every existing template is in `src/templates/`. They:

- Accept typed props
- Use CSS variables for theming (`var(--accent)`, `var(--bg)`, etc.)
- Use Framer Motion for animation
- Use `useSlideSteps()` for in-slide step-reveal (space advances within slide before moving on)
- Wrap editable text in `<EditableText>` so the editor can do inline edits

Adding a new template is a six-step ritual (write component, register, schema, doc, demo, commit). The `/planera` skill walks the user through it. See [.claude/skills/planera/SKILL.md](.claude/skills/planera/SKILL.md).

## Themes

Themes set tokens, not just colors:

```ts
{
  bg, bgSurface, text, textMuted, accent, accentGlow, accentDim,    // color
  fontDisplay, fontBody, fontMono, headingWeight, headingTracking,   // typography
  radius, borderWidth, slideMaxWidth,                                // geometry
  motionEase, motionDuration, entranceStyle,                         // motion
  ornamentStyle, ornamentColor, backgroundTexture                    // ornament
}
```

Switch themes in frontmatter:

```yaml
---
theme: forest
---
```

Same content, different aesthetic. Eight themes ship; `omtnk` and `karlskrona` are example brand-themes you can copy as a starting point.

## Stepped reveal

Templates that build content inside the slide (BulletBuild, NumberedReveal, Timeline, PollQuestion, ParticleField morphs, …) advance one *step* at a time before moving to the next slide. Space goes forward, left-arrow back. Audience sees the same step you're on.

Add stepping to your own templates by reading `useSlideSteps(count)` and rendering up to `currentStep`.

## Working with Claude Code (or other agentic tools)

The repo includes [`.claude/skills/planera/SKILL.md`](.claude/skills/planera/SKILL.md) — a structured prompt for Claude Code to plan presentations from a brief, pick the right templates, build new templates when nothing fits, and commit them properly.

Adapt for other AI assistants by reading `docs/TEMPLATES.md` (the catalog) plus `src/lib/template-schemas.ts` (the typed schemas) plus a sample MDX. That's enough context to draft good decks.

## Contributing

PRs welcome. New templates, new themes, bug fixes, doc improvements — all good. See [CONTRIBUTING.md](CONTRIBUTING.md).

A few non-obvious rules:
- Templates added to `src/templates/` must also land in `docs/TEMPLATES.md` and `src/lib/template-schemas.ts` in the same PR.
- Themes added to `src/themes/index.ts` should include a `description` comment that explains the use-case.
- Don't add framework-level dependencies without an issue first — the stack is intentionally tight.

## Stack

- **Next.js 16.2** + **React 19** + **Turbopack**
- **Tailwind CSS 4** + custom CSS variables for themes
- **Framer Motion 12** for animations
- **MDX** + `next-mdx-remote` for content
- **Supabase** (Postgres + Realtime) for audience mode
- **Cloudflare Tunnel** + `concurrently` for the `npm run present` flow
- **TypeScript** throughout

## License

[MIT](LICENSE) — do anything you want, just don't blame us.

## Credits

Slidecraft started as the in-house presentation system for Joel Rangsjö's lectures on AI in education. Open-sourced because every interesting presentation system that came before stopped being interesting. Maintained as a side project; PRs and issues read regularly.

Sister projects worth knowing about:

- **[llm-knowledge-base](https://github.com/Pluggentipsar/llm-knowledge-base)** — AI-organised personal wiki. Wire it to slidecraft and you can plan decks straight from your knowledge graph.
- **[remotion-playwright](https://github.com/Pluggentipsar/remotion-playwright)** — record polished MP4s of any slidecraft deck programmatically.
