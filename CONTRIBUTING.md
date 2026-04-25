# Contributing to Slidecraft

Thanks for considering a contribution. The goal of this project is to make code-based presentations actually fun to build, so the bar for accepting PRs is **"does this make the experience better for someone other than the author?"**.

## What we welcome

- New slide **templates** — especially ones that solve a real problem you ran into.
- New **themes** — especially ones that aren't just "the default but a different colour".
- **Bug fixes** with a reproducer.
- **Documentation improvements** — typos, missing examples, confusing sections.
- **Accessibility improvements** — keyboard navigation, screen-reader support, reduced-motion respect.
- **Performance improvements** with a measurement.

## What we're hesitant about

- New framework-level dependencies (open an issue first).
- Wholesale rewrites of existing systems (open an issue first).
- Templates that only work for one very specific use-case — consider whether it generalises.
- "Cleanup" PRs that touch many files — they're hard to review and often regress something.

## Setup

```bash
git clone https://github.com/Pluggentipsar/slidecraft.git
cd slidecraft
npm install
npm run dev
```

Open <http://localhost:3000>. Demo decks should render. If they don't, you've found a bug — that's a great first contribution.

## Adding a template

Six things must happen in the same PR:

1. **Create** `src/templates/MyTemplate.tsx`.
2. **Export** from `src/templates/index.ts`.
3. **Register** in `src/components/PresentationRenderer.tsx` (the `mdxComponents` map).
4. **Schema** in `src/lib/template-schemas.ts` (typed prop schema for the editor).
5. **Document** in `docs/TEMPLATES.md` (quick-reference table + per-template section).
6. **Demo** in `content/showcase.mdx` so reviewers can see it without imagining it.

Skip any of those and the catalog is inconsistent — the editor and the `/planera` skill will think the template doesn't exist.

### Template conventions

- `"use client"` if the component uses hooks, animation, or browser APIs (almost always).
- Take props as a typed `interface`, not a loose object.
- Use **CSS variables** for color and font (`var(--accent)`, `var(--text)`, `var(--font-display)`) so themes work.
- Use **Framer Motion** for animation. Respect `prefers-reduced-motion: reduce`.
- Wrap user-editable text in `<EditableText>` from `@/lib/inline-edit` so the editor can edit in place.
- For step-revealed content, read state from `useSlideSteps(count)` (in `@/lib/slide-steps`).
- Children can be: `null`, raw markdown text, a `- list`, or a specific sub-component (like `<TimelineEvent>`). Document which.

### What makes a good template

- **Solves a real problem you've actually had** when building a deck.
- **Composable** — works with multiple themes, not just one.
- **One thing, well.** A template that needs 18 props is two templates.
- **Resilient to bad input** — a missing prop shouldn't crash the slide.

## Adding a theme

Themes live in `src/themes/index.ts`. Add a new entry to the `themes` record. **All token fields must be filled** — there's no fallback.

A good theme is:
- Coherent — typography, colour, motion, geometry all telling the same story.
- Tested against at least 5 different templates (test in the editor / showcase).
- Useful for a category of presentations, not one specific deck.

Add a JSDoc comment above the theme explaining when to use it.

## Code style

We use ESLint + Next.js's default config. `npm run lint` is the gate.

- TypeScript everywhere. No `any`.
- Function components, hooks. No class components.
- No CSS-in-JS libraries — use Tailwind + CSS variables. Inline styles are fine for one-off computed values.
- Keep components under ~250 lines; split when they get bigger.

## Testing

There's no formal test suite yet. Until that exists:

- Verify your change in the dev server (`npm run dev`).
- Run `npm run build` — production builds catch types and lint issues.
- Test with at least two different themes if you touched anything visual.
- Test with `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature) if you added animation.

## PR checklist

- [ ] One feature / fix per PR. Bundle related changes; don't bundle unrelated ones.
- [ ] `npm run build` succeeds.
- [ ] `npm run lint` is clean (or warnings explained in the PR).
- [ ] If you added a template, all six steps above are done.
- [ ] If you added a theme, you tested with multiple template types.
- [ ] Description includes a screenshot or short clip if the change is visual.
- [ ] Linked to an issue if one exists.

## Discussions vs. issues

- **Issue** — bug report, concrete feature request, doc gap.
- **Discussion** — open-ended question, design proposal, "is this a good idea?".

When unsure, start with a discussion.

## Code of conduct

Be kind. Assume good faith. We're all just trying to make slides less terrible.

## License

By contributing you agree your work is licensed under the [MIT License](LICENSE).
