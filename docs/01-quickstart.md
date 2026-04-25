# Quickstart

Get Slidecraft running locally in under 5 minutes.

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

Slidecraft presentations live in `content/` as `.mdx` files. Each file is one presentation; each component is one slide.

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

That's the whole loop.

## What just happened?

- The frontmatter set the title, slug, and theme.
- Each `<Component>` block became a full-screen slide.
- `BulletBuild` reveals one bullet per space press before advancing.
- The theme `default` gave you Fraunces (serif) + Inter + cyan accent.

Try changing `theme: default` to `theme: editorial` or `theme: forest` and reload. Same content, completely different aesthetic.

## Next steps

| You want to… | Read |
|--------------|------|
| Use images and videos | [02-local-media.md](02-local-media.md) |
| Present from your laptop to a remote audience | [03-cloudflare.md](03-cloudflare.md) |
| Add live polls, Q&A, audience sync | [04-supabase.md](04-supabase.md) |
| Deploy a permanent URL | [05-deploy-vercel.md](05-deploy-vercel.md) |
| See every available slide template | [TEMPLATES.md](TEMPLATES.md) |
| Generate slides from an LLM-organised knowledge base | [06-llm-integration.md](06-llm-integration.md) |
| Auto-record demo videos of your deck | [07-remotion-playwright.md](07-remotion-playwright.md) |

## Useful commands

```bash
npm run dev               # Dev server on :3000 (hot reload)
npm run build             # Production build
npm run start             # Run the production build
npm run present           # Dev server + Cloudflare quick tunnel (random URL)
npm run present:named     # Dev server + your named Cloudflare tunnel
npm run lint              # ESLint
```

## Editing in the browser

Each presentation has three views:

- **`/[slug]`** — present view (you drive with arrows / space)
- **`/[slug]/edit`** — visual editor (inline-edit MDX with structured field controls)
- **`/[slug]/presenter`** — speaker view (notes, timer, next-slide preview)

The editor writes back to the `.mdx` file in `content/` so changes are committed to git like any other code change.

## Keyboard shortcuts (in present view)

| Key | Action |
|-----|--------|
| `→` / `Space` | Next step or slide |
| `←` | Previous step or slide |
| `Home` / `End` | First / last slide |
| `Esc` | Exit to dashboard |
| `Cmd/Ctrl + K` | Open menu |
| `N` | Open notes overlay |
| `Q` | Open audience questions overlay |

Stuck? Open an issue at <https://github.com/Pluggentipsar/slidecraft/issues>.
