---
name: planera
description: Plan and generate Slidecraft presentations from a brief. Picks the right templates from the catalog, creates new templates when nothing fits, and writes the resulting MDX to content/. Use when the user asks to draft a deck, design a talk, or generate slides from notes.
---

# /planera — Slidecraft presentation designer

You are designing a presentation that will be rendered by **Slidecraft** (Next.js + React + MDX). Your output is an MDX file in `content/`. Each component you place becomes one full-screen slide.

The user has a topic, an audience, and a duration. You have a catalog of 160+ slide templates (plus floating overlays — `<FloatingImage>`, `<FloatingVideo>`, `<FloatingText>`, `<FloatingChat>`, etc. — that drop on top of any other slide) and the ability to **build new templates when nothing fits**. The result should be more interesting than a deck of bullet points — because that's the entire reason we're not in PowerPoint.

## Core principle

> **Code is a slide-medium, not a layout-medium.** Anything PowerPoint can do, Slidecraft can do better — *and* Slidecraft can do things PowerPoint can't (real-time data, live polls, animated reveal logic, scroll-driven typography, particle systems, programmatic charts, embedded chat-mocks). Use that.

When deciding between a template and a custom build, ask: *"Is what I'm describing achievable with a static rectangle of text and an image? If so, use the existing template. If it requires motion, interaction, or computation — consider a new template."*

## The flow

### 1. Understand the brief

Ask the user (concisely — one short turn, not a questionnaire):

- **Topic** — what is this talk about?
- **Audience** — who's listening, what do they already know?
- **Duration** — how long? (drives slide count: ~1 slide / 60-90 sec)
- **Tone** — keynote / workshop / lecture / pitch?
- **Theme preference** — `default`, `editorial`, `forest`, `minimal`, `retro_futurism`, `sunset`, `omtnk`, `karlskrona` (or "pick for me")
- **Source material** — anywhere I should look? (existing notes, a folder of articles, a wiki, a transcript)

If the user has source material, **read it before you propose anything**. If not, ask 2-3 sharper questions to get to the spine of the talk.

### 2. Read the catalog

`docs/TEMPLATES.md` is the source of truth for available templates. **Re-read it every time** — templates get added by users (including by you in step 6) and the file is the only authoritative list.

If `docs/TEMPLATES.md` is missing or stale, fall back to listing `src/templates/` directly:

```bash
ls src/templates/*.tsx
```

…then read the headers of any unfamiliar templates.

### 3. Propose a structure

Output a *spine* of the talk — 5-12 sections, each with:
- Section name
- Approximate duration
- 1-3 candidate templates from the catalog
- Why those templates (what role they play in the section's beat)

**Don't propose individual slides yet.** Show the structure and ask the user to react. Iterate.

Use a tempo budget:
- A **stepped template** (BulletBuild, Timeline, NumberedReveal) is 2-3 minutes presented.
- A **statement** (GiantText, Manifesto) is 30-45 seconds.
- An **interactive** template (PollQuestion, Reflection) is 3-5 minutes including discussion.
- A **demo** (PromptAnimation, AiConversation, BeforeAfter) is 1-2 minutes.

### 4. Vary the rhythm

A good deck breathes. Bad decks repeat the same template 12 times. Aim for:

- ~30% **information-dense** templates (BulletBuild, Comparison, MetricGrid, Timeline)
- ~30% **statement / pause** templates (GiantText, Manifesto, Quote, SectionDivider)
- ~20% **visual / emotional** templates (HeroImage, ImageBleed, ParticleField, GiantScroll)
- ~10% **interactive** templates (PollQuestion, Reflection, HotspotImage)
- ~10% **demo / proof** templates (PromptAnimation, BeforeAfter, AiConversation, BigStat)

These are guidelines, not rules. A 10-min lightning talk might be 8 statements + 2 demos. Use judgment.

### 5. Write the MDX

When the user approves the structure:

1. Create `content/{slug}.mdx` (`slug` = kebab-case of title).
2. Frontmatter with title, slug, theme, tags, optional `deploy` mode.
3. One MDX component per slide.
4. Markdown content inside templates that accept it (use `**bold**` for accent emphasis).

```mdx
---
title: "Designing for deep learning"
slug: deep-learning-talk
theme: editorial
tags: [pedagogy, design, AI]
date: "2026-04-29"
---

<TitleSlide
  title="Designing for deep learning"
  subtitle="A workshop on AI as a tool for thinking, not a substitute"
  author="Your Name"
  event="Pedagog i Fokus"
  date="2026-04-29"
/>

<GiantText align="left" size="lg">
We've been arguing about **the wrong thing**.
</GiantText>

<SectionDivider number="01" title="The premise" duration="8 min" />

<!-- … -->

<Outro
  title="Tack"
  email="hello@example.com"
  qrUrl="https://example.com/material"
/>
```

Read templates' prop schemas in `src/lib/template-schemas.ts` (when present) for exact field names. If a schema is missing, fall back to reading the template's `.tsx` file directly.

### 6. When nothing fits — build a new template

Sometimes the brief calls for a slide that doesn't exist. Don't force it into an ill-fitting existing template. **Build a new one.**

When to build new:
- The user describes a custom interaction ("the audience drags a slider to vote on confidence") that no existing template handles.
- The content has unique structure (e.g., a Sankey diagram, a 3D rotating axis, a scrolling timeline with embedded video).
- A pedagogical model is specific to the user's domain and worth a reusable slide (a custom variation of SAMR / Bloom / TPACK / etc.).
- An existing template is *almost* right but a one-prop tweak would make it way better — and the tweak is a clean addition.

When to NOT build new:
- The user's content is just "a list of 5 things" — use `BulletBuild` or `NumberedReveal`.
- You're tempted to build because the existing template's *content* doesn't fit, not its shape — that's a content problem, not a template problem.
- The new template would only ever be used once — write it inline as raw JSX in the MDX instead.

### 7. How to add a new template (the full sequence)

You **must** complete all six steps. Skipping any step leaves the catalog inconsistent.

1. **Create** `src/templates/{Name}.tsx`. Conventions:
   - `"use client"` if the template uses hooks, animation, or browser APIs (almost always)
   - Take props as a typed interface
   - Use CSS variables (`var(--accent)`, `var(--text)`, etc.) for theming
   - Use Framer Motion for animation; respect `prefers-reduced-motion`
   - Read step state via `useSlideSteps(count)` from `src/lib/slide-steps` if the template builds content within itself
   - Wrap editable text in `<EditableText>` from `@/lib/inline-edit` so the editor can edit it inline

2. **Export** it from `src/templates/index.ts`:
   ```ts
   export { MyNewTemplate } from "./MyNewTemplate";
   ```

3. **Register** it as an MDX component in `src/components/PresentationRenderer.tsx`. Add to the `mdxComponents` map so MDX can render `<MyNewTemplate />`.

4. **Schema** in `src/lib/template-schemas.ts`. Describe each prop — name, type, required/default, label, hint. The editor uses this to render structured field controls.

   Example:
   ```ts
   MyNewTemplate: {
     name: "MyNewTemplate",
     description: "One-line summary that shows in the editor's template picker.",
     fields: [
       { name: "title", label: "Rubrik", type: "text", required: true },
       { name: "variant", label: "Variant", type: "select",
         options: ["a", "b"], default: "a", variant: "pills" },
     ],
     hasContent: true,    // if it accepts markdown children
   },
   ```

5. **Document** in `docs/TEMPLATES.md`. Add to the quick-reference table at the top. Add a per-template section with **Syfte / Props / Exempel / Undvik när**. Match the style of the existing entries.

6. **Showcase** by adding a slide to `content/showcase.mdx` (or wherever the live demo lives) so the new template can be seen in context, not just imagined from prose.

**Commit the code and the docs together.** The /planera skill — including future-you — relies on `docs/TEMPLATES.md` to know what exists. A template that exists in code but not in docs is invisible.

### 8. Quality checks before declaring done

- [ ] `npm run lint` passes (or noted any inevitable warnings).
- [ ] `npm run build` succeeds — at minimum, type-checks.
- [ ] You've actually viewed the new presentation in the dev server, not just trusted the MDX.
- [ ] Each slide does one thing well; no slide is two slides crammed together.
- [ ] The deck has rhythm — re-read step 4. Three bullet-builds in a row is a smell.
- [ ] Every external claim in the deck has a `source` or attribution where templates support it.

## Practical patterns

### Opening 3 slides

A strong opening is title → hook → frame.

```mdx
<TitleSlide title="…" subtitle="…" />

<GiantText align="left">
  The thing the audience didn't expect to hear.
</GiantText>

<Quote attribution="Someone they know" context="Year">
  A tension or claim that sets up the whole talk.
</Quote>
```

### Closing 3 slides

End with synthesis → call → contact.

```mdx
<Manifesto text="The shorter, sharper restatement." variant="display" />

<BulletBuild title="What you can do tomorrow">
- Concrete action 1
- Concrete action 2
- Concrete action 3
</BulletBuild>

<Outro title="Tack" email="…" qrUrl="…" qrCaption="All material" />
```

### Workshop sections

If the brief is *workshop* not *talk*, lean on:
- `<Reflection>` to give the room time to think
- `<PollQuestion>` to surface the room's prior beliefs
- `<HotspotImage>` for guided "look at this" walkthroughs
- `<BeforeAfter>` to anchor what good looks like

### When the audience needs a number to land

`<BigStat>` for one chock-statistic with narrative context. `<StatCompare>` for "from X to Y". `<MetricGrid>` for a dashboard of related numbers.

Don't read the number out loud; let the slide do the work and pause.

## Anti-patterns

- **Wall of bullets.** If a slide has more than 5 bullets it's two slides.
- **Same template 4 times in a row.** Switch shape every 2-3 slides.
- **Fake interactivity.** Don't write `<PollQuestion>` if you have no intention of using the live-poll feature; just use `<Comparison>` or `<BulletBuild>` to walk through the options.
- **Slides that need narration to make sense.** A slide should be readable in 5 seconds. The narration adds depth, not basic comprehension.
- **Theme misuse.** Don't pick `retro_futurism` for a healthcare talk. Themes carry tone.

## When to defer to the user

- **Naming.** Slugs and titles. Always confirm.
- **Sources.** When in doubt about a citation, ask the user to verify rather than guessing.
- **Stylistic choices.** "Should this be a Quote or a Manifesto?" — surface the trade-off, let them choose.
- **New template names.** A custom template that'll live forever in their repo deserves a name they pick.

## Output discipline

- Do not write the MDX before the user has approved the structure.
- Do not skip the catalog read just because the previous talk used the same templates.
- Do not start building new templates without first explicitly choosing to (and naming why nothing in the catalog fits).
- Do commit a one-line update to `docs/TEMPLATES.md` whenever you add a template, even if it's "just for this user's talk."
