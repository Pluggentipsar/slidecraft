# Deploying to production

How to put Slidecraft on a permanent URL so the audience can keep visiting after the talk.

## Option A: Vercel (recommended)

Slidecraft is a stock Next.js 16 app, so Vercel deploys it with zero config.

### One-time setup

1. Push your repo to GitHub (see [Git basics](#git-basics) below if you forked Slidecraft).
2. Sign in at <https://vercel.com> with your GitHub account.
3. Click **Add New → Project** → pick your repo → **Import**.
4. Vercel auto-detects Next.js. Leave the default settings.
5. **Add environment variables** (only if you want audience mode):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**.

Two minutes later you have a URL like `https://slidecraft-yourname.vercel.app`.

### Domain

In Vercel project → **Settings → Domains**, add your custom domain. Vercel handles HTTPS automatically. Audience now joins at `slides.yourdomain.com`.

### Continuous deploy

Every `git push` to your main branch triggers a redeploy in ~90 seconds. Edits to `content/*.mdx` go live as soon as you push.

## Option B: Cloudflare Pages

Cloudflare Pages also runs Next.js 16 with the [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages) adapter. Slightly more setup but free for personal use, with no execution-minute limit.

```bash
npm install --save-dev @cloudflare/next-on-pages
```

Add to `package.json`:

```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "wrangler pages deploy .vercel/output/static"
  }
}
```

Follow [Cloudflare's Next.js guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/) to wire up the GitHub integration. The Supabase env vars go in **Pages → Settings → Environment Variables**.

## Option C: Self-host (Docker)

If you want full control, Slidecraft runs in any Node container. A minimal Dockerfile:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

Run behind nginx / Caddy / Traefik, plumb the Supabase env vars in your orchestrator.

## Option D: Hybrid (laptop-presents, deployed audience-view)

You can run the **presenter** locally (full media, fast iteration) while the **audience view** lives on a stable deployed URL. They share state via Supabase.

```
Presenter (your laptop)        Audience (deployed Vercel URL)
└── npm run dev                 └── slides.yourdomain.com
       │                                │
       └─── Supabase ◄── shared state ──┘
                                        │
                                        └── audience-only assets in git
```

This is great when you have huge demo videos that you don't want to commit, but still want a permanent audience URL for Q&A and post-event access.

Combine with [Cloudflare Tunnel](03-cloudflare.md) if you want the audience to also see the *full* presentation (with media) live during the talk.

## Git basics — forking the project

If you forked Slidecraft for your own use:

```bash
# After cloning your fork
git remote add upstream https://github.com/Pluggentipsar/slidecraft.git
git fetch upstream
git merge upstream/main          # pull updates from upstream when you want them
```

Push your changes:

```bash
git add content/my-talk.mdx
git commit -m "Add talk for ConferenceX"
git push
```

Vercel rebuilds, the new MDX file shows up on the dashboard.

## Don't deploy the editor to production

The `/[slug]/edit` route writes back to the filesystem. On Vercel/Cloudflare Pages (read-only filesystem at runtime) the **edit route doesn't actually save** — it'll appear to work but changes are lost.

Use the editor **locally only**. Commit the resulting MDX. Deploy.

If you need a deployed editor (multi-author teams, admin UI), that's a separate project — file an issue if you want to discuss.

## Pre-deploy checklist

- [ ] `.env.local` is **not** committed (it's gitignored — verify with `git status`).
- [ ] Supabase env vars are added to your hosting provider's environment settings (not just `.env.local`).
- [ ] Heavy media is either in `public/local/` (gitignored) or on cloud storage. See [02-local-media.md](02-local-media.md).
- [ ] The home dashboard at `/` lists what you expect (it auto-discovers `content/*.mdx`).
- [ ] You've test-presented at least one slide on the deployed URL before the talk.

## Cost ballpark

| Provider | Free tier | Typical paid |
|----------|-----------|--------------|
| **Vercel** | Hobby — 100 GB bandwidth/mo | Pro at $20/mo for production guarantees |
| **Cloudflare Pages** | 500 builds/mo, unlimited bandwidth | Pro at $20/mo |
| **Supabase** | 500 MB DB, 2 GB egress | Pro at $25/mo |
| **Self-host** | Whatever your VPS costs | $5-15/mo for a small VPS |

For typical use (a few talks a month, audiences <500), the free tiers everywhere are enough.
