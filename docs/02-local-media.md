# Working with media (images, video, audio)

Where to put images and videos, how to reference them, and how to choose between three deploy strategies depending on file size.

## Where files go

Anything inside `public/` is served at the root URL. So:

```
public/
  bilder/
    klassrum.jpg          →  available at /bilder/klassrum.jpg
  videos/
    intro.mp4             →  available at /videos/intro.mp4
  logos/
    company.png           →  available at /logos/company.png
```

Reference these in MDX with **absolute paths starting with `/`**:

```mdx
<HeroImage src="/bilder/klassrum.jpg" />
<VideoBackground src="/videos/intro.mp4" />
```

Don't use relative paths (`./bilder/...`) or `import` statements — Slidecraft uses standard `<img>` and `<video>` elements that read straight from the public URL.

## Recommended folder structure

Pick a structure that matches *your* mental model. Some patterns that work:

```
public/
  bilder/                 ← images by category
    bakgrunder/
    porträtt/
    diagram/
  videos/                 ← video clips
  logos/                  ← brand marks
  audio/                  ← voice-over, sound clips
```

The repo ships with a clean `public/` (just framework SVGs). Add what you need.

## File-size limits

| Limit | Source |
|-------|--------|
| 100 MB per file | GitHub blocks single files larger than 100 MB |
| ~1 GB per repo | GitHub recommends staying under 1 GB total |
| Build size | Vercel free tier: 250 MB; paid: higher |

If you have a 200 MB demo video, you can't commit it. Use the **`local-only`** or **`cloud-media`** strategies below.

## Three deploy strategies

Set per-presentation in frontmatter:

```yaml
---
title: My deck
slug: my-deck
deploy: full | cloud-media | local-only   # default: "full"
---
```

### `deploy: full` (default)

Everything — MDX + bilder + video + ljud — committas och deployas tillsammans. Audience visit your deployed URL and see the whole thing.

**Use when:**
- Total media is under ~50 MB for the deck
- You want the deck reachable from any device after the talk
- Audience should be able to revisit the slides later

**Limits:** GitHub 100 MB/file, slower deploys with large media.

### `deploy: cloud-media`

MDX deployas, but heavy media lives on external storage (Supabase Storage, Cloudflare R2, S3, your own CDN). Reference absolute URLs in MDX.

```mdx
<VideoBackground src="https://cdn.example.com/videos/demo.mp4" />
```

**Use when:**
- You have reusable media shared across decks
- You want audience access without your laptop running

**Setup:**
1. Create a bucket (Supabase Storage, R2, S3, etc.)
2. Upload media once
3. Reference by full URL

The `deploy: cloud-media` flag is mostly a *documentation marker* — the app behaves the same, but readers/editors know absolute URLs are intentional.

### `deploy: local-only`

MDX deploys so audience can connect via session code, but media stays on your laptop. The audience view shows placeholders ("📷 Image shown on presenter's screen") instead of broken images.

**Use when:**
- You have *gigabytes* of demo video
- The audience is in the same room and sees your physical screen anyway
- You want Q&A + polls without committing huge media

**How to run:**

```bash
# Option A: Audience joins via deployed audience URL.
npm run dev
# You present from localhost. Audience sees placeholders for media,
# but session sync (slide index, Q&A, polls) goes via Supabase.

# Option B: Audience joins via tunnel to your laptop (full media).
npm run present
# Audience sees full presentation, including media, via Cloudflare Tunnel.
# See 03-cloudflare.md.
```

**Folder convention** for local-only media:

```
public/local/
  giant-demo.mp4       ← committed to .gitignore, never deployed
```

`.gitignore` already includes `public/local/`. Reference like any other file:

```mdx
<VideoBackground src="/local/giant-demo.mp4" />
```

On your laptop: file exists. On Vercel: file is missing, audience view shows the placeholder.

## Comparison table

| Scenario | `full` | `cloud-media` | `local-only` |
|----------|--------|---------------|--------------|
| Media in git | ✓ | ✗ | ✗ |
| Size limit | 100 MB/file | unlimited | unlimited |
| Audience sees media in audience view | ✓ | ✓ | ✗ (placeholder) |
| Requires laptop running | ✗ | ✗ | ✓ (for media) |
| Deploy time | long with big media | fast | fast |
| Requires Supabase | ✗ (audience-only feature) | ✗ | ✓ (for sessions) |
| Requires Cloudflare Tunnel | ✗ | ✗ | optional |

## Recipes

**Evergreen reference deck (always reachable):** `deploy: full`

**Workshop with heavy demo videos, in-person audience with phones:** `deploy: local-only`, run `npm run dev`, audience sees placeholders but watches your screen + uses phones for Q&A.

**Digital webinar with big videos:** `deploy: cloud-media`, upload to storage once.

**Test a deck before it's done:** `deploy: local-only` + `npm run present` — audience reaches your laptop via Cloudflare Tunnel including media.

## Tips

- **Use video for video, not GIF.** A 30 MB GIF becomes a 2 MB MP4 with the same visual.
- **Compress before committing.** [Squoosh](https://squoosh.app/) for images, [HandBrake](https://handbrake.fr/) for video.
- **PNG with transparency** works best for `LayeredText`, `LayeredScroll`, and other "subject in front" templates.
- **Aspect ratios** for `<HeroImage>`: prefer 16:9 to match the slide canvas.

## Troubleshooting

**Image works locally but is missing in deployed audience view** → it's probably in `public/local/`. Move to `public/` proper, or accept the placeholder.

**404 on `/bilder/foo.jpg`** → check the file is actually inside `public/`, with that exact path and case (case-sensitive on Linux/Vercel even if Windows tolerates it).

**Build fails because of a large file** → GitHub rejected the push. Use Git LFS, move to `public/local/`, or use `cloud-media`.
