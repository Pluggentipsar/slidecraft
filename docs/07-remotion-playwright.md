# Remotion-Playwright integration (auto-recorded videos)

Once you have a presentation in Slidecraft, you might want a polished **MP4 video** of it: for marketing, for asynchronous sharing, for documentation, for social clips. Doing this by hand (screen-record, edit, publish) is tedious. Doing it by code is fast, repeatable, and looks consistent.

**[remotion-playwright](https://github.com/Pluggentipsar/remotion-playwright)** is a sister project that automates this:

1. **Playwright** drives a real browser through your presentation step by step.
2. **Remotion** post-processes the recording — adds cursor highlights, step indicators, zoom-pans, title cards, audio.
3. Result: an MP4 (or WebM, GIF) you can ship.

> You don't need this to use Slidecraft. Skip if you don't need automated video output.

## What you can do with it

- Record a **demo video** of your deck for the website / readme.
- Generate **social clips** (vertical 9:16 from a horizontal deck — Remotion can transform).
- Produce **tutorial videos** that show "click this, then this, then this" with synthesized voice-over.
- Build **comparison reels** (same talk, three themes, side by side) for design exploration.

## How it integrates with Slidecraft

```
slidecraft/                             remotion-playwright/
├── content/                            ├── recording-script.json
│   └── my-talk.mdx                     │     ├── url: localhost:3000/my-talk
│                                       │     ├── steps: ["space", "wait 2s", "space", ...]
│                                       │     └── output: out/my-talk.mp4
└── npm run dev                         └── npm run record
       │                                       │
       └── browser ◄── Playwright drives ──────┘
```

Playwright opens your dev server (or a deployed URL), follows the script, captures frames. Remotion then composites the result.

## Setup

### Step 1 — Install remotion-playwright

```bash
git clone https://github.com/Pluggentipsar/remotion-playwright.git
cd remotion-playwright
npm install
npx playwright install chromium
```

### Step 2 — Make sure Slidecraft is running

In a separate terminal:

```bash
cd ../slidecraft
npm run dev
```

Confirm <http://localhost:3000/your-talk> renders.

### Step 3 — Write a recording script

Create `recording-script.json` in remotion-playwright:

```json
{
  "url": "http://localhost:3000/my-talk",
  "viewport": { "width": 1920, "height": 1080 },
  "steps": [
    { "action": "wait", "ms": 1500, "comment": "Let initial slide settle" },
    { "action": "key", "key": "Space", "comment": "Reveal step 1" },
    { "action": "wait", "ms": 1200 },
    { "action": "key", "key": "Space" },
    { "action": "wait", "ms": 1200 },
    { "action": "key", "key": "ArrowRight", "comment": "Next slide" },
    { "action": "wait", "ms": 2000 }
  ],
  "output": {
    "path": "out/my-talk.mp4",
    "fps": 30,
    "format": "mp4"
  }
}
```

### Step 4 — Record

```bash
npm run record -- recording-script.json
```

A headless Chromium runs through your deck. Output appears in `out/my-talk.mp4`.

### Step 5 — Polish in Remotion

Remotion lets you composite the raw recording with overlays:

- **Title card** before slide 1
- **Section breaks** with chapter names
- **Cursor highlights** when you interact
- **Voice-over** synced to slide changes
- **Auto-zoom** to focus areas

See remotion-playwright's `templates/` for ready-made compositions.

## Recipes

### "Quick demo" — no narration, just slides

Skip Remotion's polish step. The raw Playwright recording is fine for a 30-second auto-play loop on your homepage.

### "Tutorial" — voice-over + cursor highlights

Write a narration script, generate audio (ElevenLabs / OpenAI TTS), have Remotion sync slide-changes to audio markers.

### "Conference recap" — multi-slide social clips

Record once, then split into 9:16 vertical clips of 30 seconds each — Remotion handles the cropping and re-pacing.

### "Translated decks" — same deck, different languages

If you maintain multilingual MDX (`my-talk.en.mdx`, `my-talk.sv.mdx`), record both with the same script. Saves manual re-recording.

## Tips

- **Run against the deployed URL** for production-quality recordings — your dev server has hot-reload artifacts that can leak into frames.
- **Set theme explicitly** in the URL via a query param if you want to record multiple theme variants from the same MDX.
- **Disable animations** if you need pixel-perfect frames (set `prefers-reduced-motion: reduce` in the Playwright context).
- **Slow down on stepped templates** — `BulletBuild` reveals are timed by space-presses, not auto-play. Add `wait` actions accordingly.

## Caveats

- **Playwright recordings are ~30 fps.** That's fine for slide content. If you have heavy 60 fps animations (`<ParticleField>`), they'll be downsampled.
- **Audio doesn't auto-record.** Slidecraft has audio templates (`<VoiceCollage>`, `<VoiceFeedback>`) but Playwright records video only. Add audio as a separate Remotion track.
- **Long decks = long renders.** A 30-minute deck with full Remotion compositing can take 30-60 minutes to render on a laptop. Run on a beefier machine or cloud renderer for production.

## Alternatives

If remotion-playwright feels heavy, simpler options:

- **Vercel OG Image** — generate static slide previews from MDX, stitch with ffmpeg.
- **OBS Studio** — manual screen recording, low setup, no automation.
- **Loom / Veed.io** — record manually, use their editor for polish.
- **Cleanshot X** — high-quality screen recording for one-off needs.

remotion-playwright pays off when you want **the same kind of video, repeatedly**, with consistent style.

## See also

- [remotion-playwright README](https://github.com/Pluggentipsar/remotion-playwright)
- [Remotion docs](https://www.remotion.dev/)
- [Playwright docs](https://playwright.dev/)
