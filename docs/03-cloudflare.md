# Presentationsläge — lokal + tunnel

Två sätt att exponera din lokala dev-server utåt så publiken kan ansluta,
även när du inte har deployat presentationen eller när media är för tung
för deploy.

## TL;DR

**Snabbt & enkelt (random URL varje gång):**

```
npm run present
```

Ger dig en URL som `https://rough-banana-7823.trycloudflare.com` som
publiken kan gå till. Bra för engångsevenemang.

**Stabilt (samma URL varje gång):**

```
npm run present:named
```

Kräver engångs-setup av en namngiven tunnel — se nedan. Ger dig en
URL som du äger, t.ex. `https://present.example.com`.

---

## Installation (engångs)

### 1. Installera cloudflared

**Windows (PowerShell som admin):**
```powershell
winget install --id Cloudflare.cloudflared
```

**macOS:**
```bash
brew install cloudflared
```

**Linux:**
```bash
# Se https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

Verifiera: `cloudflared --version`

### 2. Om du vill ha en stabil URL (named tunnel)

```bash
# Logga in med ditt Cloudflare-konto
cloudflared tunnel login

# Skapa tunnel (en gång — den lever tills du deletar den)
cloudflared tunnel create slidecraft

# Lägg till DNS-route (kräver att du äger domänen i Cloudflare)
cloudflared tunnel route dns slidecraft present.example.com

# Skapa config-fil: ~/.cloudflared/config.yml
# Byt UUID mot det som visades när du skapade tunneln
```

Innehåll i `~/.cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: C:\Users\YOUR_USERNAME\.cloudflared\<TUNNEL-UUID>.json  # macOS: ~/.cloudflared/

ingress:
  - hostname: present.example.com
    service: http://localhost:3000
  - service: http_status:404
```

Verifiera: `cloudflared tunnel list` ska visa `slidecraft`.

## Användning

### Vanligt scenario: quick tunnel

```
npm run present
```

Terminal visar något liknande:

```
dev      | ▲ Next.js 16.2.4
dev      | - Local:        http://localhost:3000
dev      | - Network:      http://192.168.1.42:3000
tunnel   | +-------------------------------------------------+
tunnel   | |  Your quick Tunnel has been created! Visit it:  |
tunnel   | |  https://rough-banana-7823.trycloudflare.com   |
tunnel   | +-------------------------------------------------+
```

Dela tunnel-URL:en med publiken. Skapa session i presenter-vyn — publiken
använder `https://rough-banana-7823.trycloudflare.com/join` + sessionkod.

När du trycker Ctrl+C stängs både dev-servern och tunneln.

### Stabilt scenario: named tunnel

```
npm run present:named
```

Samma sak, men URL:en är alltid `https://present.example.com` (eller
vad du nu satte i DNS-route:n).

## Vad gör scriptet?

`concurrently` kör två processer parallellt:
1. `next dev` — din vanliga dev-server på port 3000
2. `cloudflared tunnel ...` — öppnar tunnel mot Cloudflare som routar
   trafik från publik URL → localhost:3000

All trafik går via Cloudflares nätverk. Media, MDX, Supabase-sessions,
realtime-sync — allt fungerar som om du presenterade från en deployad
server, men hela presentationens state bor på din laptop.

## Viktigt att veta

- **Din laptop måste vara på under hela presentationen.** Stänger du
  locket tappar tunneln anslutning.
- **Batteri.** Plugga in laddaren — både dev-server och tunnel drar CPU.
- **Internet.** Tunneln behöver stabil internetuppkoppling. På mobil-
  hotspot funkar det, men latens kan bli märkbar.
- **Sessions synkas via Supabase (molnet).** Även om media går via
  tunneln så går Q&A, quiz, reactions via Supabase direkt — de är
  oberoende av tunneln och fungerar även om tunneln skulle få hick.

## Troubleshooting

**"cloudflared: command not found"** → installera enligt ovan, starta
om terminalen så `PATH` uppdateras.

**"Tunnel not found: slidecraft"** vid `npm run present:named` → kör
`cloudflared tunnel list` — om inte `slidecraft` finns, skapa den
(se setup ovan).

**Publiken får 502/503** → dev-servern kraschade antagligen. Kolla
terminalen, starta om med `npm run present`.

**Första anslutningen tar tid** → Cloudflare warmup, kör tunneln
30 sek innan publiken ansluter.
