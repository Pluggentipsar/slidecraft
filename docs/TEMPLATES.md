# Templates - komplett referens

Denna fil är referens för både dig och `/planera`-skillen. Varje template dokumenteras med:
- **Syfte** - när template är rätt val
- **Props** - alla tillgängliga parametrar
- **Exempel** - färdig MDX att kopiera
- **Undvik när** - när en annan template passar bättre

**27 templates** grupperade efter användningsområde.

## Quick reference

| Kategori | Templates |
|----------|-----------|
| **Layouts** (4) | TitleSlide, GiantText, Quote, ImageText |
| **Listor med steg** (5) | BulletBuild, SideScrollList, NumberedReveal, Timeline, Reflection |
| **Data** (4) | Comparison, StatCounter, CodeReveal, PromptAnimation |
| **Bilder** (5) | HeroImage, LayeredText, ImageBleed, Collage, PictureQuote |
| **Video** (2) | VideoEmbed, VideoBackground |
| **Morf och animation** (3) | SlideshowMorph, GiantScroll, ParticleField |
| **Interaktivitet** (1) | PollQuestion |
| **Struktur** (3) | SectionDivider, Callout, LoadingSlide |

## Stegsystem (viktigt att förstå)

**Vissa templates har inbyggd stegnavigering.** När användaren trycker pil höger eller space:

1. Först försöker SlideViewer ta ett step INUTI aktuell slide
2. Om alla steg är tagna → går till nästa slide

Templates med stegsystem (markerade nedan): `BulletBuild`, `SideScrollList`, `NumberedReveal`, `Timeline`, `Reflection`, `PollQuestion`, `ParticleField`, `SlideshowMorph`.

**För /planera-skillen:** När du väljer en stepbar template, tänk på att den "tar flera klick" att presentera. En SideScrollList med 3 punkter = 4 klick (3 + sammanfattning) innan nästa slide.

---

## Layouts

### `<TitleSlide>`

**Syfte:** Stor titel. Använd för: start av presentationen, avslutning, enkla avsnittsrubriker.

**Props:**
- `title` (krävs) - string
- `subtitle` - string
- `author` - string
- `event` - string
- `date` - string
- `children` - valfritt extra innehåll

**Exempel:**
```mdx
<TitleSlide
  title="The session title"
  subtitle="A short subtitle that frames the talk"
  author="Your Name"
  event="Conference Name"
  date="2026-04-29"
/>
```

**Undvik när:** Du vill ha en mer grafisk avsnittsövergång - använd `SectionDivider` istället.

---

### `<GiantText>`

**Syfte:** Enstaka slagkraftigt uttalande. En mening, tydligt, ingen utläggning. `**bold**` i text blir accent-färgad.

**Props:**
- `align` - "left" (default) | "center"
- `children` - text (markdown stöds)

**Exempel:**
```mdx
<GiantText>
  Lärande måste få vara **ansträngande**.
</GiantText>
```

**Undvik när:** Texten är lång eller behöver attribution - använd `Quote` istället.

---

### `<Quote>`

**Syfte:** Citat från en person. Vertikal accent-linje, attribution under.

**Props:**
- `children` (krävs) - citattext
- `attribution` - vem som sa det
- `context` - UPPERCASE tag under namnet (datum, roll, etc)

**Exempel:**
```mdx
<Quote
  attribution="William, gymnasieelev"
  context="Mars 2023, efter första mötet med ChatGPT"
>
  Det här förändrar ju fan allting.
</Quote>
```

**Undvik när:** Du har en bild av personen - använd `PictureQuote` istället.

---

### `<ImageText>`

**Syfte:** Bild + text i split-layout. För när bilden och texten är lika viktiga.

**Props:**
- `image` (krävs) - path eller URL
- `alt` - alt-text
- `layout` - "left" (default) | "right"

**Exempel:**
```mdx
<ImageText image="/bilder/william.jpg" layout="left">
  ## William
  Första mötet med ChatGPT var mars 2023. Han är den brötigaste av bröt-elever.
</ImageText>
```

**Undvik när:** Du vill att bilden dominerar - använd `HeroImage` eller `LayeredText`.

---

## Listor med stegsystem

### `<BulletBuild>`

**Syfte:** Grundläggande punktlista där punkterna byggs in en i taget. Enkel och ren.

**Props:**
- `title` - rubrik ovan listan
- `children` (krävs) - markdown-lista (`- punkt`)

**Stegsystem:** Ja. Antal steg = antal punkter.

**Exempel:**
```mdx
<BulletBuild title="Tre principer">
- Lärande måste få vara ansträngande
- AI är språket för lärandet
- Aldrig AI för AI:s skull
</BulletBuild>
```

**Undvik när:** Punkterna är så viktiga att de behöver stor visuell vikt - använd `SideScrollList`.

---

### `<SideScrollList>`

**Syfte:** Stor rund blobb med siffra + text. Maximal dramatik per punkt. Scrollar in från höger. Sista steget visar sammanfattning med alla punkter små.

**Props:**
- `title` - rubrik
- `children` (krävs) - markdown-lista
- `blobColor` - CSS-färg (default: accent)

**Stegsystem:** Ja. Antal steg = antal punkter + 1 (sammanfattning).

**Exempel:**
```mdx
<SideScrollList title="Tre principer för AI i klassrummet">
- Lärande måste få vara ansträngande, men vi ska inte bedöma ansträngningen
- AI är språket med vilket du definierar vilket lärande som ska ske
- Aldrig AI för AI:s skull - alltid med ett pedagogiskt syfte
</SideScrollList>
```

**När välja den:** När varje punkt förtjänar fokus. 2-5 punkter fungerar bäst. 6+ blir trögt.

---

### `<NumberedReveal>`

**Syfte:** Numrerad lista uppifrån. Aktiv punkt får en pil-animation och accent-färg. Känns som en "steg-för-steg"-guide.

**Props:**
- `title` - rubrik
- `children` (krävs) - markdown-lista

**Stegsystem:** Ja. Antal steg = antal punkter.

**Exempel:**
```mdx
<NumberedReveal title="Så här börjar du">
- Välj en uppgift du redan gör
- Identifiera var friktionen ska ligga
- Skriv en tydlig spelplan för eleverna
</NumberedReveal>
```

**När välja den:** När ordningen spelar roll. "Först gör du X, sen Y, sen Z."

---

### `<Timeline>` + `<TimelineEvent>`

**Syfte:** Tidslinje med datum + händelser. Animerad linje + noder.

**Props (Timeline):**
- `title` - rubrik
- `orientation` - "horizontal" (default) | "vertical"

**Props (TimelineEvent):**
- `date` (krävs) - UPPERCASE datum/period-tag
- `title` - händelsens namn
- `children` - beskrivning

**Stegsystem:** Ja. Antal steg = antal TimelineEvent.

**Exempel:**
```mdx
<Timeline title="AI i skolan" orientation="horizontal">
  <TimelineEvent date="Nov 2022" title="ChatGPT">
    Generativ AI når allmänheten.
  </TimelineEvent>
  <TimelineEvent date="Apr 2023" title="My AI">
    Snapchat rullar ut till 750M.
  </TimelineEvent>
  <TimelineEvent date="2026" title="Nationell strategi">
    Sverige får AI-plan för skolan.
  </TimelineEvent>
</Timeline>
```

**När välja horisontell:** 3-5 events, korta beskrivningar. Kronologisk översikt.
**När välja vertikal:** 4-8 events, längre beskrivningar per event.

---

### `<Reflection>`

**Syfte:** Reflektionsfrågor för publiken. En fråga i taget animeras fram. Bra för samtalsrundor, parsnack, enskild reflektion.

**Props:**
- `title` - huvudfrågan
- `tag` - kategori-tag (default: "Reflektion")
- `duration` - tex "5 min i par"
- `children` (krävs) - markdown-lista med frågor

**Stegsystem:** Ja. Antal steg = antal frågor.

**Exempel:**
```mdx
<Reflection tag="Reflektion" title="Hur använder ni AI idag?" duration="5 min i par">
- Vad funkar?
- Vad skaver?
- Vad skulle ni vilja ändra?
- Vad behöver ni för att ta nästa steg?
</Reflection>
```

**När välja den:** Workshop-moment, när du vill bjuda in publiken att tänka själva.

---

## Data och innehåll

### `<Comparison>` + `<ComparisonColumn>`

**Syfte:** Två kolumner sida vid sida. Före/efter, utan AI/med AI, två perspektiv.

**Props (Comparison):**
- `title` - rubrik
- `accentSide` - "left" | "right" (default: "right") | "none"

**Props (ComparisonColumn):**
- `title` (krävs) - kolumnens rubrik
- `children` - markdown-lista

**Exempel:**
```mdx
<Comparison title="Före / Efter" accentSide="right">
  <ComparisonColumn title="Utan AI">
    - Samma material till alla
    - Statiskt innehåll
    - Begränsat av lärarens tid
  </ComparisonColumn>
  <ComparisonColumn title="Med AI">
    - Individanpassat på sekunder
    - Dynamiskt och interaktivt
    - Möjliggör det som var omöjligt
  </ComparisonColumn>
</Comparison>
```

**När välja den:** För att tydligt kontrastera två tillstånd.

---

### `<StatCounter>`

**Syfte:** Animerad siffra som räknar upp. En stor, slagkraftig statistikpunkt.

**Props:**
- `value` (krävs) - siffran att räkna upp till (string eller number)
- `suffix` - tex "%"
- `prefix` - tex "$"
- `label` - förklarande text under
- `source` - källa (visas UPPERCASE småtext)
- `decimals` - antal decimaler
- `duration` - animationstid i sekunder (default 1.6)

**Exempel:**
```mdx
<StatCounter
  value="77"
  suffix="%"
  label="av alla gymnasieelever använder AI."
  source="Internetstiftelsen, 2026"
/>
```

**När välja den:** En enstaka siffra som ska stanna i publikens minne.

---

### `<CodeReveal>`

**Syfte:** Kod eller prompt som skrivs ut tecken för tecken (typewriter).

**Props:**
- `code` - kort kod som string, ELLER
- `children` - längre kod i markdown code fence
- `language` - "javascript" | "python" | "prompt" | etc (visas som tag)
- `title` - rubrik ovan
- `caption` - text under
- `speed` - ms per tecken (default 15)
- `mode` - "typewriter" (default) | "instant"

**Exempel:**
```mdx
<CodeReveal language="prompt" caption="Så här kan en pedagogisk prompt se ut">
Skapa ett Jeopardy-spel om Sveriges historia.
5 kategorier, 5 frågor per kategori.
Svårighetsgrad ökar per rad.
</CodeReveal>
```

**När välja den:** Visa en prompt eller kod-snippet, gärna med dramatik.

---

### `<PromptAnimation>`

**Syfte:** Signatur-slide för AI-prompt-demos. Prompt typas → genereras → landar i en meningsfull text bredvid.

**Props:**
- `promptText` (krävs) - prompten som ska typas
- `resultText` - texten som visas bredvid (din huvudpoäng)
- `codeSnippet` - valfri kod att visa som resultat
- `layout` - "left" | "right" (default)
- `typeSpeed` - ms per tecken (default 25)

**Exempel:**
```mdx
<PromptAnimation
  promptText="Agera som en extremt pedagogisk lärare i historia. Ge ledtrådar istället för svar."
  resultText="Kodspråket är ytterligare ett sätt att realisera dina pedagogiska tankar."
/>
```

**När välja den:** Demonstrera vad en prompt kan göra, samtidigt som du landar i en pedagogisk insikt.

---

## Bildbaserade

### `<HeroImage>`

**Syfte:** Fullbredd bild med text-overlay. Emotionella öppningar, dramatiska visuella.

**Props:**
- `src` (krävs) - bildpath eller URL
- `alt` - alt-text
- `align` - "top-left" | "top-right" | "center" | "bottom-left" (default) | "bottom-right"
- `gradient` - "top" | "bottom" (default) | "left" | "right" | "none"
- `overlay` - 0-1 (mörker-opacity, default 0.35)
- `blur` - boolean (gör bilden suddig för att texten sticker ut)

**Exempel:**
```mdx
<HeroImage
  src="/bilder/bakgrunder/klassrum.jpg"
  align="bottom-left"
  gradient="bottom"
>
  # En vanlig tisdag
  Det här är där berättelsen börjar.
</HeroImage>
```

**När välja den:** Du har en kraftfull bild som ska dominera, och kort text som ramar in.

---

### `<LayeredText>`

**Syfte:** Text i lager med ett urklippt subjekt (PNG med transparent bakgrund).

**Props:**
- `image` (krävs) - PNG-path (transparent bakgrund funkar bäst)
- `alt` - alt-text
- `imagePosition` - "left" | "right" (default) | "center"
- `imageSize` - procent av slide-höjd (default 85)
- `background` - CSS-färg för bakgrunden
- `textColor` - CSS-färg för texten (om bakgrunden kräver det)
- `textInFront` - text framför bilden istället för bakom (default false)

**Exempel:**
```mdx
<LayeredText
  image="/bilder/subjekt/hund-transparent.png"
  imagePosition="right"
  background="#fde68a"
  textColor="#1a1a1a"
>
  # En ny sele
  ## för lille Lucky!
</LayeredText>
```

**När välja den:** Redaktionell cover-känsla (tidskrifts-stil) där ett subjekt "hänger framför" texten. **Kräver transparent PNG** för full effekt.

---

### `<ImageBleed>`

**Syfte:** Bild som spiller ut i ett hörn med rotation. Dynamisk, bryter mot ramen.

**Props:**
- `image` (krävs) - bildpath
- `corner` - "top-right" (default) | "bottom-right" | "top-left" | "bottom-left"
- `size` - procent av slidebredden (default 55)
- `rotate` - grader rotation (default 0)
- `children` - text i motsatt hörn

**Exempel:**
```mdx
<ImageBleed
  image="/bilder/bakgrunder/skog.jpg"
  corner="top-right"
  size="60"
  rotate="-3"
>
  # Dynamiskt hörn
  Bilden spiller ut ur ramen.
</ImageBleed>
```

**När välja den:** När du vill ha en bild och text men samtidigt energi/rörelse.

---

### `<Collage>`

**Syfte:** Flera bilder i rutnät. Bredd, variation, många exempel samtidigt.

**Props:**
- `images` (krävs) - comma-separerad string med URL:er eller array
- `layout` - "grid-2" | "grid-3" | "grid-4" | "grid-5-hero" | "auto"
- `title` - rubrik
- `children` - valfri intro-text

**Exempel:**
```mdx
<Collage
  layout="grid-4"
  title="Fyra vägar in"
  images="img1.jpg, img2.jpg, img3.jpg, img4.jpg"
/>
```

**När välja den:** Showcase, före/efter-exempel, portfölj, variationer.

---

### `<PictureQuote>`

**Syfte:** Citat med porträtt av personen. Ger vikt och personlighet.

**Props:**
- `image` (krävs) - porträttbild
- `attribution` (krävs) - namn
- `context` - UPPERCASE tag (roll, datum, etc)
- `imagePosition` - "left" (default) | "right"
- `children` (krävs) - citattext

**Exempel:**
```mdx
<PictureQuote
  image="/bilder/subjekt/william.jpg"
  attribution="William"
  context="Gymnasieelev, mars 2023"
>
  Det här förändrar ju fan allting.
</PictureQuote>
```

**När välja den:** När personen som sa citatet är viktig. Elevcitat, expert-uttalanden.

---

## Video

### `<VideoEmbed>`

**Syfte:** Inbäddad video (YouTube/Vimeo/lokal) i slide.

**Props:**
- `src` (krävs) - URL eller path
- `title` - rubrik
- `caption` - undertext
- `autoplay` - boolean
- `loop` - boolean
- `muted` - boolean
- `aspectRatio` - "16/9" (default) | "4/3" | "1/1" | "9/16"

**Exempel:**
```mdx
<VideoEmbed src="/videos/demo.mp4" title="Se vad som händer när..." />
<VideoEmbed src="https://youtu.be/xxx" autoplay loop muted />
```

---

### `<VideoBackground>`

**Syfte:** Video som bakgrund, text-overlay.

**Props:**
- `src` (krävs) - lokal .mp4-path
- `align` - positionering av text (samma som HeroImage)
- `overlay`, `gradient`, `blur` - samma som HeroImage
- `paused` - boolean

**Exempel:**
```mdx
<VideoBackground src="/videos/abstrakt.mp4" align="bottom-left">
  # Rubrik
  Undertext.
</VideoBackground>
```

**När välja den:** Abstrakta, atmosfäriska bakgrundsvideor. **Inte** bra för innehållsvideor (använd VideoEmbed).

---

## Morfning och animation

### `<SlideshowMorph>`

**Syfte:** Flera bilder som morfar mellan varandra. Bildberättande.

**Props:**
- `images` (krävs) - comma-separerad string
- `captions` - comma-separerad string (en per bild)
- `morph` - "crossfade" (default) | "scale" | "slide" | "zoom-blur"
- `showCounter` - boolean (default true)

**Stegsystem:** Ja. Antal steg = antal bilder.

**Exempel:**
```mdx
<SlideshowMorph
  morph="zoom-blur"
  images="bild1.jpg, bild2.jpg, bild3.jpg"
  captions="Först, Sedan, Slutligen"
/>
```

**När välja den:** En berättelse i bilder. Visuell progression.

---

### `<GiantScroll>`

**Syfte:** Gigantisk text som rullar över skärmen i loop. Extra vikt till ett budskap.

**Props:**
- `text` (krävs) - texten som rullar
- `direction` - "left" (default) | "right"
- `secondsPerInstance` - hur länge en text-instans ska ta att passera skärmen (default 30, meditativt)
- `heightRatio` - 0-1 (andel av skärmhöjd, default 0.66)
- `loop` - boolean (default true)
- `color` - CSS-färg
- `outline` - boolean (stroke istället för fylld)

**Exempel:**
```mdx
<GiantScroll text="LÄRANDE MÅSTE FÅ VARA ANSTRÄNGANDE" secondsPerInstance="60" />
<GiantScroll text="Agens > intelligens" outline heightRatio="0.55" secondsPerInstance="45" />
```

**När välja den:** Avsnittsbyte med emotionell vikt, ett ord eller en mening som ska bränna sig fast. Låt publiken sitta med det.

**Hastighet:** 40-60 är lugnt. Under 20 blir stressigt. Över 90 är nästan stillastående.

---

### `<ParticleField>`

**Syfte:** Canvas-baserat partikelsystem. Partiklar morfar mellan formationer. Visuellt spektakulärt.

**Props:**
- `count` - antal partiklar (default 600)
- `formations` - comma-separerad lista (scatter, circle, square, cross, heart, wave, spiral)
- `color` - CSS-färg
- `size` - pixel-storlek per partikel

**Stegsystem:** Ja. Antal steg = antal formationer.

**Exempel:**
```mdx
<ParticleField
  count="700"
  formations="scatter, circle, square, spiral, heart, scatter"
/>
```

**När välja den:** Eye candy för öppning/avslutning, visualisering av idéer som "samlas ihop".

---

## Interaktivitet

### `<PollQuestion>`

**Syfte:** Interaktiv flervalsfråga med animerade resultat. Aktivera publiken.

**Props:**
- `question` (krävs) - frågan
- `options` (krävs) - comma-separerade alternativ
- `results` - comma-separerade procenttal (matchar options)
- `correct` - index (0-baserat) för rätt svar
- `reveal` - text som visas sist som förklaring

**Stegsystem:** Ja. 4 steg: fråga → alternativ → resultat → reveal.

**Exempel:**
```mdx
<PollQuestion
  question="Vilken procent av gymnasieelever använder AI?"
  options="under 30%, 30-60%, 60-80%, över 80%"
  results="5, 15, 55, 25"
  correct="2"
  reveal="Närmare 77% enligt Internetstiftelsen 2026."
/>
```

**När välja den:** Fråga publiken. Utan `results`/`correct` blir det en ren diskussionsfråga.

---

## Struktur och uppmärksamhet

### `<SectionDivider>`

**Syfte:** Avsnittsövergång mellan delar i en lång presentation.

**Props:**
- `title` (krävs) - avsnittets namn
- `number` - tex "01", "Del 2"
- `subtitle` - beskrivning
- `duration` - tidsavgift ("30 min")
- `variant` - "centered" (default) | "left" | "hero"

**Exempel:**
```mdx
<SectionDivider
  number="02"
  title="Möjligheterna"
  subtitle="Vad kan AI faktiskt göra i klassrummet?"
  duration="30 min"
  variant="hero"
/>
```

**Varianter:**
- `hero` - Gigantiskt nummer med glow, titel under. Bäst för större avsnittsbyten.
- `left` - Följer TitleSlide-estetiken med accent-linje ovanför.
- `centered` - Symmetrisk, linjer kring numret.

**När välja den:** Mellan huvuddelar i en 60-min+ föreläsning. För kortare pres, använd TitleSlide.

---

### `<Callout>`

**Syfte:** Framträdande ruta som drar uppmärksamhet. Nyckelinsikt, varning, citat.

**Props:**
- `variant` - "info" | "insight" (default) | "warning" | "success" | "quote" | "danger"
- `title` - rubrik
- `tag` - UPPERCASE tag ovanför (tex "NYCKELINSIKT")
- `preHeading` - mindre text över titeln
- `children` - brödtext

**Färg per variant:**
- insight/info/quote: accent (cyan/temats färg)
- warning: amber
- success: grön
- danger: röd

**Exempel:**
```mdx
<Callout variant="insight" tag="Nyckelinsikt" title="Det handlar inte om verktyget">
  Det handlar om vilket lärande vi designar för.
</Callout>

<Callout variant="warning" tag="Varningssignal" title="Halvhjärtad AI är värst">
  Forskningen visar en U-formad kurva.
</Callout>
```

**När välja den:** En enskild tanke som förtjänar sin egen slide med extra vikt.

---

### `<LoadingSlide>`

**Syfte:** Loading-indikator. Transitioner, "AI tänker"-effekter, dramatiska pauser.

**Props:**
- `variant` - "spinner" (default) | "dots" | "pulse" | "progress" | "orbit"
- `title` - rubrik
- `subtitle` - undertext
- `children` - valfritt extra innehåll

**Exempel:**
```mdx
<LoadingSlide variant="pulse" title="AI tänker..." subtitle="Modellerna förutspår nästa token." />
```

**När välja den:** Visa att något händer (AI processar). Spännande övergång före en avslöjning.

---

## Speaker notes

Lägg `<Notes>`-block direkt efter en slide:

```mdx
<TitleSlide title="..." />

<Notes>
Kom ihåg att nämna William-caset först.

Flera paragrafer separeras med tomrad.
</Notes>

<GiantText>Nästa slide...</GiantText>
```

Tryck `N` under presentation för att visa notes-overlay.

## Tema

Sätts i frontmatter:

```yaml
---
theme: default  # default | sunset | editorial | forest | minimal | retro_futurism
---
```

**Temaråd:**
- `default` - Fraunces + cyan, standard. Säker och vacker.
- `sunset` - Playfair + röd. Värme, melankoli, berättelser.
- `editorial` - Instrument Serif + guld. Tidskriftskänsla, lugnt.
- `forest` - Fraunces + grön. Naturinspirerad, harmonisk.
- `minimal` - Inter, svartvitt. Disciplinerat, Dieter Rams.
- `retro_futurism` - Space Grotesk UPPERCASE + magenta. 80-tal synthwave.

## Tangentbord under presentation

| Tangent | Funktion |
|---------|----------|
| Space / ← → | Nästa/föregående step eller slide |
| Home / End | Första/sista slide |
| F | Fullscreen |
| N | Visa speaker notes |
| Escape | Stäng notes |

## Presenter mode

Klicka `PRESENTER` uppe till höger för separat fönster med notes + timer + next-slide-preview.

---

## Planeringsguide för /planera-skillen

När du ska välja templates för en presentation:

**1. Struktur**
- Börja med `TitleSlide` (intro)
- Använd `SectionDivider` mellan huvuddelar (60+ min pres)
- Avsluta med `TitleSlide` ("Tack!")

**2. Tempo**
- 45-60 min presentation: 15-25 slides är lagom
- Stepbara templates (SideScrollList, Reflection, PollQuestion) tar MER tid per slide
- Räkna: en stepbar template med 4 steg ≈ 2-3 minuter

**3. Variation**
- Alternera mellan text-templates och visuella
- Max 2-3 BulletBuild i rad innan publiken tröttnar
- Använd `Callout` för att lyfta nyckelinsikter
- GiantScroll/ParticleField som "andningsmoment" mellan täta avsnitt

**4. Emotionell resa**
- Quote + PictureQuote = personliga moment
- StatCounter = aha-moment
- GiantText = slagkraftigt summa
- Reflection = pausmoment för publiken

**5. När du inte vet vilken att välja**
- Läs innehållet högt: är det en KÄNSLA → Quote eller GiantText
- Är det DATA → StatCounter eller Comparison
- Är det en PROCESS → NumberedReveal eller Timeline
- Är det en BILD → HeroImage eller LayeredText
- Är det en FRÅGA → PollQuestion eller Reflection

---

## Fas 5: Nya templates (2026-04-17)

Nio templates tillagda efter SKR-presentationen när vi upptäckte gap:

### `<VoiceCollage>` — Röster från fältet

Grid av korta citat med organisk variation i storlek och lätt rotation. Flera röster "skriker samtidigt" istället för att komma en i taget som Reflection.

**Syfte:** När du vill visa *kakofonin* från fältet (lärare/elever/vårdnadshavare säger olika saker samtidigt). Bra för "så här låter det ute i skolorna"-moments.

**Props:** `title?`, `titleSize?`

**Children:** Markdown-lista där `**Avsändare:**` blir attribution. Format:
```mdx
<VoiceCollage title="Röster från fältet">
- **Lärare, åk 8:** Jag är så trött på det här.
- **Elev, åk 9:** ChatGPT är min bästa vän.
- **Vårdnadshavare:** Min dotter pratar bara med AI.
</VoiceCollage>
```

**Undvik när:** Citaten är långa (använd Quote). Budskapet är konvergent (använd BulletBuild).

---

### `<EmotionRow>` — Ramverk med färgade kategorier

Rad med N "pills" (ex. emoji + label + sub-label). Bra för ramverk som återkommer flera gånger i presentationen som markör.

**Syfte:** Fem-känslor-ramverk, Blooms taxonomi, värdegrundskategorier. Kan stega fram en i taget (med space).

**Props:** `title?`, `stepped?` (default false), `titleSize?`

**Children:** `- emoji Label · Sub-label`
```mdx
<EmotionRow title="De fem känslorna" stepped>
- 🟡 Rädsla · Skydda
- 🟣 Sorg · Hedra
- 🟠 Reflektion · Pausa
- 🟢 Nyfikenhet · Utforska
- 🔵 Agens · Medskapa
</EmotionRow>
```

**Undvik när:** Fler än 6 kategorier (blir trångt). Kategorier ska djupstuderas — använd Reflection eller BulletBuild.

---

### `<BeforeAfter>` — Prompt + faktiskt resultat

Prompt-text typas fram i steg 1, resultat (bild/video/text) tonas in i steg 2.

**Syfte:** Visa AI-magin explicit — "såhär gick det till". Starkare än PromptAnimation eftersom man ser det faktiska resultatet.

**Props:** `promptText` (req), `promptLabel?`, `resultImage?` | `resultVideo?` | `resultText?`, `resultLabel?`, `resultCaption?`, `typeSpeed?` (default 20), `layout?` ("row" | "column")

**Exempel:**
```mdx
<BeforeAfter
  promptText="Skapa ett spel man styr med kameran..."
  resultVideo="/videos/skr/glosspel.mp4"
  resultLabel="Resultat efter 2 minuter"
  resultCaption="Eleven styr med händerna"
/>
```

**Undvik när:** Man har ingen faktisk output att visa — fall tillbaka på PromptAnimation.

---

### `<Outro>` — Tack + kontakt + QR

Stor "Tack"-rubrik med kontaktuppgifter och en QR-kod (genereras via qrserver.com).

**Syfte:** Avslutnings-slide som ger publiken en väg framåt — inte bara "slut".

**Props:** `title?` (default "Tack"), `subtitle?`, `email?`, `web?`, `socials?`, `qrUrl?`, `qrCaption?`, `cta?`, `titleSize?`

**Exempel:**
```mdx
<Outro
  title="Tack!"
  subtitle="Hör av dig - bygg vidare."
  email="hello@example.com"
  web="example.com/material"
  socials="@pluggen_tipsar"
  qrUrl="https://example.com"
  qrCaption="Allt material"
  cta="Ta nästa steg"
/>
```

---

### `<StatCompare>` — Två siffror i relation

Två animerade siffror med pil mellan, för att visa förändring, gap eller jämförelse.

**Syfte:** Visa en förändring över tid (3% → 68%) eller ett gap (lärare vs elever). Mer berättande än enskild StatCounter.

**Props:** `from` + `to` (req numbers), `fromSuffix/Prefix/Label`, `toSuffix/Prefix/Label`, `title?`, `caption?`, `duration?`, `decimals?`

**Exempel:**
```mdx
<StatCompare
  title="Elevernas AI-användning"
  from={3} fromSuffix="%" fromLabel="2022"
  to={68} toSuffix="%" toLabel="2025"
  caption="Andel gymnasieelever som använder AI veckovis"
/>
```

---

### `<Passage>` — Långform text med highlights

Läsbar text-passage där `**fet**` blir accent-färg. Max-bredd optimerad för läsbarhet.

**Syfte:** När man vill låta publiken läsa ett stycke — inte rada upp punkter, inte stor rubrik. Ger andrum mellan visuella moment.

**Props:** `title?`, `tag?`, `align?` ("left" | "center"), `width?` ("narrow" | "wide"), `titleSize?`, `textSize?`

**Children:** Markdown med `**fet**` för accent.

```mdx
<Passage title="Det handlar inte om verktyget" tag="INSIKT">
Det är inte lätt att vara lärare just nu. **Det blir inte enklare** av
att varje dag har en ny AI-app. Men **det som verkligen spelar roll** är
om vi behåller frågan om varför i fokus.
</Passage>
```

---

### `<MapPins>` — Karta med animerade pins

Bild (karta) med pins positionerade i procent-koordinater.

**Syfte:** "Där jag har varit", geografisk spridning, platsberättelse.

**Props:** `mapImage` (req), `alt?`, `title?`, `stepped?`, `titleSize?`

**Children:** `- Label · x,y · Valfri notering` (x,y = procent 0-100)
```mdx
<MapPins title="Skolsverige jag mött" mapImage="/bilder/sverige-karta.png">
- Jönköping · 42,68 · Hemma-basen
- Lidköping · 38,62
- Göteborg · 30,72
- Stockholm · 55,58
</MapPins>
```

---

### `<VideoChapters>` — Video med tidsmarkörer

Video med klickbar sidolista av kapitel. Klick spolar till timestamp.

**Syfte:** När du vill peka ut specifika moment i en video ("0:15 - här missar Collins nyheten").

**Props:** `src` (req), `title?`, `autoPlay?`, `titleSize?`

**Children:** `- mm:ss · Titel`
```mdx
<VideoChapters src="/videos/skr/collins.mp4" title="Collins Simulator">
- 0:00 · Intro
- 0:15 · Collins missar nyheten
- 1:02 · Blackout
- 2:30 · Slutskärmen
</VideoChapters>
```

---

### `<HotspotImage>` — Bild med klickbara pekare

Bild med cirkulära hotspots som visar tooltip på hover/klick. Kan stegas fram.

**Syfte:** Peka ut detaljer i ett diagram eller bild ("titta här, detta är skiftet"). Bra för Blooms taxonomi, komplexa bilder.

**Props:** `src` (req), `alt?`, `title?`, `stepped?`, `titleSize?`

**Children:** `- x,y · Etikett · Beskrivning` (x,y = procent 0-100)
```mdx
<HotspotImage src="/bilder/blooms.png" title="Skiftet i Blooms">
- 40,25 · Skapa · AI gör det lätt att generera
- 60,55 · Analysera · Där det mänskliga jobbet ligger
- 75,80 · Minnas · Chattbotten vet redan allt
</HotspotImage>
```

---

**Totalt templates nu: 36** (27 från tidigare + 9 nya).

---

### `<AiConversation>` — Simulerad AI-dialog

Chatt-liknande konversation där meddelanden typas fram tecken-för-tecken med typing-indikator (tre pulserande prickar) innan AI:ns svar. Användarens meddelanden är högerjusterade (accent-färg), AI:ns är vänsterjusterade (neutral). Auto-scroll när nya meddelanden dyker upp.

**Syfte:** Visa hur du tänker tillsammans med en AI - autentiskt, utan att man behöver skärmdela. Särskilt användbart i kontext där AI-dialoger är själva arbetet.

**Två lägen:**
- **Auto-play** (default): hela konversationen spelas upp sekventiellt med realistiska pauser.
- **Stepped** (`stepped`): space/pil triggar nästa meddelande — du styr tempot live.

**Props:** `title?`, `tag?`, `userLabel?` (default "Du"), `aiLabel?` (default "AI"), `userSpeed?` (8), `aiSpeed?` (12), `thinkingDelay?` (700), `betweenDelay?` (500), `stepped?`, `titleSize?`

**Children:** Markdown-lista, varje rad är ett meddelande. Alternerar automatiskt user → ai → user → ai. Valfri `**Label:**` framför ger custom namn (t.ex. "ChatGPT", "Claude", "Elev"):

```mdx
<AiConversation title="Fotosyntes för sjuåringar" stepped>
- **Du:** Hur förklarar jag fotosyntes för sjuåringar?
- **ChatGPT:** Tänk dig att bladet är en kock som lagar mat av solsken,
  vatten och luft. Receptet heter "klorofyll" och är grönt.
- **Du:** Gör en uppgift av det här
- **ChatGPT:** Perfekt! Barnen kan rita "bladet som kock" och märka
  ingredienserna. Låt dem hitta på egna recept som använder sol och vatten.
</AiConversation>
```

**Undvik när:** Prompt-resultatet är visuellt (använd BeforeAfter). Det är en enda prompt utan dialog (använd PromptAnimation).

**Totalt templates nu: 37** (36 + AiConversation).

---

## Fas 6: Brand-templates (2026-04-19)

Tre templates byggda ursprungligen för en sälj-pitch (Omtnk är ett samtalsstöd för kommuner — exempel sparat som referens) — fungerar lika bra för alla brand-tunga presentationer (sidoprojekt, externa workshops, säljpitchar).

### `<BrandIntro>` — Logo-dominerande öppnings-/avslutsslide

Stor logo med tagline under, valfri eyebrow ovanför och meta-rad i botten. Tre bakgrundsstilar för olika dramatik.

**Syfte:** Öppna eller avsluta en pitch där brandet är hjälte. Bättre än `HeroImage` när logon ska andas. Använd `BrandIntro` på första OCH sista sliden så pitchen ramas in symmetriskt.

**Props:** `logo` (req), `alt?`, `logoHeight?` (vh, default 28), `tagline?`, `eyebrow?` (UPPERCASE), `meta?` (UPPERCASE bottom), `background?` ("solid" | "radial" (default) | "split"), `bgColor?`, `children?`

**Exempel:**
```mdx
<BrandIntro
  logo="/bilder/omtnk/logo.png"
  alt="Omtnk"
  logoHeight={32}
  eyebrow="OMTNK"
  tagline="Vissa samtal kan inte vänta till måndag morgon."
  meta="PITCH · APRIL 2026"
  background="radial"
/>
```

**Undvik när:** Logon är ovanlig form/proportion som gör tagline-positioneringen ful — använd `HeroImage` med text-overlay istället.

---

### `<BigStat>` — Editorial chock-siffra med rik kontext

Större och mer berättande än `StatCounter`. Plats för kontext OVANFÖR och UNDER siffran, plus eyebrow och källa. Tre layouter.

**Syfte:** En enskild siffra som ska bränna sig fast — och som behöver inramning för att landa rätt ("I Sverige idag, **240 000** barn lever under...").

**Layouter:**
- `editorial` (default): vänsterjusterat, eyebrow → kontext-ovan → siffra → kontext-under → källa
- `centered`: symmetriskt, samma uppställning men centrerat
- `frame`: siffran sitter i en accent-färgad ram med kontexten bredvid (split-vy)

**Props:** `value` (req), `suffix?`, `prefix?`, `eyebrow?` (UPPERCASE), `contextAbove?`, `contextBelow?`, `source?`, `duration?` (default 2), `decimals?`, `layout?`, `color?`

**Exempel:**
```mdx
<BigStat
  eyebrow="The number that frames everything"
  contextAbove="Globally, every year,"
  value={240000}
  contextBelow="users abandon onboarding before they ever return."
  source="Industry report, 2024"
/>

<BigStat
  layout="frame"
  value={25}
  suffix="%"
  contextBelow="Var fjärde kvinna utsätts för våld av partner."
/>
```

**Undvik när:** Du behöver två siffror i jämförelse — använd `StatCompare`. När siffran är liten/triviell — använd `StatCounter`.

---

### `<ChatPreview>` — Mockad chattwidget i faux browser-frame

Visar en webbsida-widget med riktig chat-UI: browser-dots, widget-header med online-indikator, meddelandebubblor (user höger / bot vänster), typing-indikator, input-fält. Spelas upp meddelande-för-meddelande med pause emellan.

**Syfte:** Visa en chatt-produkt i sitt faktiska sammanhang istället för att bara prata om den. Skapad för Omtnk-pitchen men funkar för alla samtals-/dialog-produkter.

**Skillnad mot `AiConversation`:** AiConversation visar din dialog med en AI (för att illustrera ett pedagogiskt arbetssätt). ChatPreview visar produkten — en widget som någon annan använder.

**Layout:** Två kolumner — text/titel ena sidan, widget-mockup andra. Bytbart med `chatPosition`.

**Props:** `title?`, `tag?` (UPPERCASE), `widgetName?` (default "Chatt"), `widgetStatus?` (default "Online nu"), `widgetAccent?` (default = tema-accent), `chatPosition?` ("left" | "right" (default)), `titleSize?`, `description?`, `autoplay?` (default true), `beat?` (ms mellan meddelanden, default 900)

**Children:** Markdown-lista. Avsändare som matchar `^(du|user|jag)` blir högerjusterade user-bubblor, allt annat blir bot-bubblor:

```mdx
<ChatPreview
  tag="LIVE-EXEMPEL"
  title="Första kontakten"
  description="Anonymt. Lågmält. Pekar mot rätt stöd."
  widgetName="Omtnk"
  widgetStatus="Online · Anonymt"
  beat={1100}
>
- **Du:** Är det här våld?
- **Omtnk:** Det du beskriver kan vara en form av psykiskt våld...
- **Du:** Jag vill inte att någon ringer mig.
- **Omtnk:** Det är okej. Du behöver inte lämna några uppgifter.
</ChatPreview>
```

**Undvik när:** Det är en presentation av AI-arbetsflöde (använd `AiConversation`) eller en single-prompt-demo (använd `PromptAnimation`/`BeforeAfter`).

---

## Brand-watermark via frontmatter

Lägg en liten persistent logo + tagline i hörnet på alla slides genom att sätta `brand` i frontmatter:

```yaml
---
title: Omtnk
theme: omtnk
brand:
  logo: /bilder/omtnk/logo.png
  tagline: Omtnk
  position: bottom-left   # bottom-left (default) | bottom-right | top-left | top-right
  size: 1.4rem            # max-höjd på logon
  opacity: 0.6            # 0-1
  hideOnFirst: true       # dölj på första sliden där logon redan dominerar
---
```

Watermarken renderas av SlideViewer ovanför slide-innehållet med `pointer-events: none`. Påverkar inga befintliga presentationer — bara opt-in via frontmatter.

---

---

### `<MetricGrid>` — Rutnät av metric-cards (dashboards / vinster / KPI:er)

N kort i ett grid med stagger-reveal. Varje kort kan ha emoji + label + värde + sub-text. Tre varianter: `card` (default), `minimal`, `dashboard` (med glow + accent-gradient).

**Syfte:** Ersätter trista BulletBuild när informationen är *kvantitativ* eller *paralleller* — fyra fördelar, sex KPI:er, åtta features. Dashboard-känsla utan att man behöver skärmdela ett verkligt verktyg.

**Props:** `title?`, `tag?` (UPPERCASE), `columns?` (auto: 2/3/4 baserat på antal items), `variant?` ("card" | "minimal" | "dashboard"), `stagger?` (ms, default 80), `titleSize?`

**Children:** Markdown-lista, format `- emoji **Etikett** · värde · sub-text` (alla efter label är valfria):

```mdx
<MetricGrid tag="MÄTBARHET" title="Så vet vi att det funkar." variant="dashboard" columns={3}>
- 💬 **Påbörjade samtal** · per månad · Volym + trend över tid
- 🤝 **Mänsklig överlämning** · andel · Hur ofta brygga aktiveras
- ⏱ **Responstid** · sekunder · Tiden från fråga till svar
- 🔐 **Delade uppgifter** · andel · Hur många kliver upp till samtycke-nivå
- 📉 **Växel-avlastning** · jmf baseline · Mejl som inte längre når personalen
- ⭐️ **Nöjdhet** · post-chat NPS · Anonym feedback efter dialog
</MetricGrid>
```

**Undvik när:** Items är texttunga och behöver berättas en i taget — använd `BulletBuild` eller `NumberedReveal`. Items är kvalitativa argument med olika vikt — använd `SideScrollList`.

---

### `<TierStack>` — Stigande accent-nivåer (samtycke / severity / Bloom)

Visar N "tiers" sida vid sida (eller staplade) med progressivt ökande accent-intensitet — första nivån mjukast, sista mest accent-tung. Numrerad, animerad reveal med stagger.

**Syfte:** När det finns en *ordning* i något — samtyckes-nivåer (NEJ → Anonym → Full identifiering), severity-skalor, säkerhetsklassificering, Bloom-stege, Maslow-pyramid horisontellt. Visualiserar hierarkin med färg, inte bara med text.

**Props:** `title?`, `tag?` (UPPERCASE), `description?`, `orientation?` ("horizontal" (default) | "vertical"), `titleSize?`

**Children:** Markdown-lista, format `- **Etikett** · sub-text · längre beskrivning`:

```mdx
<TierStack
  tag="DESIGNPRINCIP"
  title="Anonymitet är inte en feature. Det är fundamentet."
  description="Tre nivåer av delning, alltid valbart av användaren själv."
>
- **NEJ** · INGEN DATA ALLS · Användaren stannar helt anonym
- **Ja med kod** · ANONYM TRÅD · Möjlighet att återkomma utan att avslöja vem
- **Ja med personuppgifter** · FULL ÖVERLÄMNING · Mänsklig handläggare tar över
</TierStack>
```

**Undvik när:** Items har samma vikt utan ordning — använd `MetricGrid`. Det är två tillstånd (före/efter) — använd `Comparison`.

---

---

### `<SpotlightContrast>` + `<SpotlightCard>` — Två kort där det andra stjäl scenen

Stepbar template (2 steg). Steg 1: visar bara första kortet. Steg 2: andra kortet kommer in OCH växer till hjälte-storlek samtidigt som första kortet krymper, bleknar och blir desaturerat. Animerar grid-template-columns + font-size + box-shadow + border smidigt.

**Syfte:** När en jämförelse inte är *symmetrisk* — när hela poängen är att rikta uppmärksamheten åt det ena hållet. "Vanliga botar gör X — men VI gör Y" är paradigmexemplet. Ger dramatisk wow-effekt utan att behöva två separata slides.

**Stegsystem:** Ja. 2 steg.

**Skillnad mot `Comparison`:** Comparison visar två symmetriska kolumner från start. SpotlightContrast bygger upp dramatiken steg för steg och flyttar visuell vikt.

**Props (SpotlightContrast):** `title?`, `tag?` (UPPERCASE), `hero?` ("left" | "right" (default)), `intensity?` ("subtle" | "balanced" (default) | "dramatic"), `titleSize?`

**Props (SpotlightCard):** `title` (req), `tag?` (UPPERCASE)

**Children (SpotlightCard):** Markdown-lista som blir punkter i kortet.

**Exempel:**
```mdx
<SpotlightContrast
  tag="VAD MARKNADEN MISSAR"
  title="Två helt olika typer av samtal"
  hero="right"
  intensity="balanced"
>
  <SpotlightCard tag="VANLIGA KUNDTJÄNSTBOTAR" title="Svarar på...">
  - "Var hittar jag blanketten?"
  - "Vilka är öppettiderna?"
  </SpotlightCard>
  <SpotlightCard tag="OMTNK" title="Hanterar...">
  - "Jag är rädd för min partner."
  - "Är det här våld?"
  </SpotlightCard>
</SpotlightContrast>
```

**Intensitet:**
- `subtle` (1.4 : 1) — för fina nyansskillnader
- `balanced` (2 : 1) — default, hjälte är dubbelt så stor
- `dramatic` (3.5 : 1) — när du verkligen vill skrika

**Undvik när:** Båda korten är lika viktiga (använd `Comparison`). Det är fler än två kort (använd `MetricGrid`). Du behöver tre tier-nivåer i ordning (använd `TierStack`).

---

---

### `<TeamIntro>` + `<TeamMember>` — Founder/team-presentation med video-bakgrund

Fullskärms-slide med video (eller bild) som bakgrund, gradient-overlay för läsbarhet, stor UPPERCASE-titel + subtitle centrerat upptill, och glassmorphism-cards per team-medlem i botten. Accentfärgad glow högst upp ger en brand-touch. Korten kommer in i sekvens.

**Syfte:** Stå bakom produkten. Visa teamet. Perfekt för pitch-avsnittet där ni förklarar *varför just ni* bygger det. Fungerar lika bra för författarpresentationer (när en bok släpps), workshopsledare, styrelse etc.

**Props (TeamIntro):**
- `background` (req) — path till mp4 eller bild
- `backgroundType?` — `"video"` (default) | `"image"`
- `title` (req) — stor UPPERCASE-titel högst upp
- `eyebrow?` — liten tag över titeln
- `subtitle?` — kursivt undertitel under
- `gradient?` — `"both"` (default) | `"top"` | `"bottom"` | `"center"` | `"none"` — läsbarhets-gradient
- `overlay?` — 0-1, extra mörkning på bakgrunden (default 0.35)
- `columns?` — auto baserat på antal medlemmar, eller tvingad kolumnantal
- `titleSize?` — `sm` | `md` | `lg` (default) | `xl`

**Props (TeamMember):**
- `name` (req) — stort namn
- `role?` — liten accent-färgad roll under namnet
- `children` — bio/meriter. `**fet**` blir accent-färgad.

**Exempel:**
```mdx
<TeamIntro
  background="/videos/hero-bg.mp4"
  backgroundType="video"
  eyebrow="OCH DÄRFÖR FINNS VI"
  title="Acme Studio"
  subtitle="Två livskamrater som ägnat sina yrkesliv åt skola och utsatthet."
  gradient="both"
  overlay="0.4"
>
  <TeamMember name="Avery Chen" role="Founder & Designer">
  Författare till **Med AI som stöd** (Liber). **Nominerad till Årets AI-svensk 2025**.
  </TeamMember>
  <TeamMember name="Sam Patel" role="Head of Engineering">
  Snart **hederssamordnare** på Kommunal utveckling. Författare till **Skolans roll mot heder**.
  </TeamMember>
</TeamIntro>
```

**Tips:**
- Kort ambient video (5–20s loop) med subtila rörelser funkar bäst — undvik täta klipp som stjäl uppmärksamhet
- 2 medlemmar: 2 kolumner (default). 3–4: auto-anpassar. 5+: sätt `columns` manuellt
- Om bakgrunden är ljus, höj `overlay` till 0.5–0.6 eller byt gradient till `"both"`

**Undvik när:** Det är ett sälj-intro utan team (använd `BrandIntro`). Ni har 6+ personer (bygg en `Collage` istället).

---

**Totalt templates nu: 44** (37 + BrandIntro + BigStat + ChatPreview + MetricGrid + TierStack + SpotlightContrast + TeamIntro) + brand-watermark via frontmatter.

---

## Editorial-narrativa templates (Karlskrona example pack)

40 templates byggda för en editorial-narrativ presentation (utvecklad för Karlskrona-event 2026). Fokus på narrativ dramatik, kapitelmarkörer (§ III · ...), atmosfäriska bakgrunder (Midjourney-genererade) och talspråksnära ton. Många använder `· separator · ` i markdown-listor för att packa mer per rad.

### Narrativ ramning

#### `<Manifesto>` — Slagkraftigt uttalande med kapitelmarkör

Stor typografi (clamp upp till 9.5rem) för korta 3-8 ords uttalanden. Ord i `**bold**` får accent-färg, `*italic*` behåller kursivering. Kapitelmarkör uppe till höger ("§ III · Rätt fråga"). Dekorativ glyph kan visas som stor bakgrundsdetalj.

**Props:**
- `variant` — `"display"` (sans-serif bold) | `"serif"` (serif editorial) | `"condensed"` (smalare)
- `align` — `"left"` | `"center"`
- `chapter` — liten text uppe till höger
- `decoration` — symbol/siffra som stor bg-glyph (t.ex. "?", "∴", "⟟", "◇", "03")
- `background` — URL eller path
- `accent` — färg för **bold**-ord

**Exempel:**
```mdx
<Manifesto variant="serif" align="left" chapter="§ II · Rätt fråga" decoration="?" accent="#B4763A">
Fråga inte vad som går *snabbare*.

Fråga vad som **stjäl tid** från eleverna.
</Manifesto>
```

**Varning:** Håll texten KORT (< 8 ord per "rad"). Font-size är clamp(3.5rem, 8vw, 9.5rem) — långa meningar bryts mitt i ord.

#### `<HeroStatement>` — Stor headline över bakgrundsbild

Bakgrund fullskärm, stor titel centrerad med kapitelmarkör. För sektionsövergångar där du vill ge ett enda ord/stämning luft.

**Props:** `chapter`, `background`, `accent`, `children` (texten, stödjer markdown).

```mdx
<HeroStatement chapter="§ XIV · Elevperspektiv" background="..." accent="#EC7E26">
Eleverna

använder

**AI**.
</HeroStatement>
```

#### `<GrowingStatement>` — Whisper + stort uttalande

Liten kursiv "whisper"-rad ovanför ett stort uttalande. Byggt för emotionella landningar.

**Props:** `chapter`, `whisper` (kursiv prelud), `background`, `accent`, `children` (huvudtexten — håll kort pga clamp 8.5vw).

```mdx
<GrowingStatement chapter="§ XXI · Kärnan" whisper="Efter alla verktyg — kvar står detta:" accent="#EC7E26">
**Lärare** som bryr sig.
</GrowingStatement>
```

#### `<EditorialHero>` — Tidskrifts-hero med eyebrow + titel + kolofon

Editorial-stil: kicker-etikett + stor serif-titel + subtext + källhänvisning. För intellektuella ramningar.

**Props:** `kicker`, `title`, `subtitle`, `byline`, `background`, `accent`.

### AI-identitet & ramverk

#### `<AiArHero>` — Öppnings-hero för "AI är också konst"

Statisk bild + text-överlägg. Används som brygga in i AI-art-avsnitt.

```mdx
<AiArHero />
```

#### `<AiArMedia>` + `<AiArLabel>` — Enskild AI-genererad medieförevisning

Visar AI-genererad bild/ljud/video i stort format med etikett i hörn. Bra för "gissa-vad-som-är-AI"-moment.

**Props:** `src`, `alt`, `mediaType` (`"image"` | `"video"` | `"audio"`), `caption`, `children` (för AiArLabel).

#### `<RealOrFake>` — Interaktivt "riktigt eller fake"-moment

Två bilder sida vid sida. Eleverna/publiken gissar vilken är AI. Efter klick avslöjas svaret.

**Props:** `leftImage`, `rightImage`, `leftLabel`, `rightLabel`, `correctAnswer` (`"left"` | `"right"`), `reveal`.

#### `<PromptWindow>` — Fristående prompt-input-visualisering

Looks like en chatGPT-input. För att visa promptar utan AI-svar.

**Props:** `widgetName`, `placeholder`, `children` (själva promptent).

#### `<AiKanVara>` — "AI kan vara..." konceptkort

Stort konceptuellt påstående: "AI kan vara en kompis / en lärare / ett verktyg". Kort titel + underrubrik + ikon/bild.

**Props:** `title`, `subtitle`, `icon?`, `image?`, `background`, `accent`.

#### `<AiHyperobject>` — Filosofisk wide-frame om AI

För att öppna bredare perspektiv: "AI är inte ett verktyg — det är ett hyperobjekt". Stor typografi med flerradigt statement.

**Props:** `chapter`, `background`, `accent`, `children`.

### Speaker & persona

#### `<SpeakerIntro>` — Talar-intro

Porträtt vänster, namn + titel + bio + meriter höger. För "om mig"-slide.

**Props:** `name`, `role`, `portrait`, `accent`, `children` (bio).

#### `<NamedPortrait>` — Porträtt med namn och titel

Mindre porträttkort. För att visa referens-figurer (forskare, författare).

**Props:** `name`, `title?`, `portrait`, `accent`, `children?`.

#### `<FigureQuote>` — Citat tillskrivet figur

Stort citat + namn + kontext. För att väva in forskning eller externa röster.

**Props:** `attribution`, `context?`, `background`, `accent`, `children` (citatet).

#### `<ErrorSlide>` — Felmeddelande-stil slide

Styled som en krasch-skärm. Humoristisk effekt eller allvarlig varning.

```mdx
<ErrorSlide />
```

### Prompts & chat

#### `<PromptHero>` — Stor prompt som hjältefigur

Fullskärms-visning av en prompt med glow/accent. För att lyfta fram hur en specifik prompt är formulerad.

**Props:** `kicker`, `title`, `prompt`, `background`, `accent`.

#### `<ChatHero>` — Fullskärms chat-layout med dialog

Prompt-input överst, chat-dialog som animerat avslöjas. Layoutvariant med `voice`-prop för röstingång. Markdown-lista där varje rad är `- **Roll:** meddelande`.

**Props:**
- `title`, `titleSize` (`xs`/`sm`/`md`/`lg`/`xl`), `subtitle`, `kicker`, `background`, `accent`
- `aiLabel`, `userLabel`, `widgetName`
- `userPattern` — regex-string för att identifiera user-turn i lista (default `user|du|jag`)
- `beat` — ms delay mellan turer
- `voice` — boolean, visar röst-ikon i input
- `chatPosition` — `"left"` | `"right"` | `"center"`
- `stepped` — kräv space-tryck för varje turn

```mdx
<ChatHero title="Tala in" subtitle="**Återkoppling** — omformulera för eleven" voice beat={3200}>
- **Du:** Skriv en bedömning av denna elevtext.
- **ChatGPT:** Din text är på god väg...
</ChatHero>
```

#### `<ChatFullscreen>` — Sokratisk tutor / lång dialog

Större variant än ChatHero för långa dialoger (15+ turer). Auto-scrollar, stegad reveal.

**Props:** Samma som ChatHero + `aiSpeed`/`userSpeed` (ms per char för typewriter).

#### `<InputHero>` — Input-fokuserad layout

Stor prompt-input med avslöjad text, mindre "svar"-del.

**Props:** `title`, `prompt`, `result?`, `background`, `accent`.

#### `<Bollplank>` — Lärare promptar + AI svarar + elevkort

Vänster: prompt-bar + tänker-dots + strömmad AI-respons. Höger: student-kort som fade:ar in efter att AI-svaret är klart.

**Props:** `kicker`, `title`, `prompt`, `answer`, `background`, `accent`, `children` (markdown-lista med student-kort).

#### `<PromptPrinciples>` — Fem prompt-principer som kort

Grid av principer: varje kort har rubrik + kort beskrivning + "dålig prompt" vs "bra prompt"-exempel.

**Props:** `kicker`, `title`, `subtitle`, `background`, `accent`, `children` (lista med format `- **Princip** · beskrivning · dålig-prompt · bra-prompt`).

```mdx
<PromptPrinciples kicker="§ VI · Så pratar du med AI" title="Fem principer" accent="#EC7E26">
- **Kontext är kung** · Ge AI en roll... · Förklara fotosyntes. · Förklara fotosyntes för en 13-åring som älskar fotboll.
</PromptPrinciples>
```

### Video & demos

#### `<FullscreenVideo>` — Enkel fullskärms-video

Loop, muted, playsInline per default.

```mdx
<FullscreenVideo src="/path.mp4" />
```

#### `<VibeCoding>` — Prompt → vibecodad app med video

Elevens prompt som input-bar, resulterande app som video till höger. Elev-persona + ämneskontext ovanför.

**Props:** `kicker`, `subject`, `title`, `student`, `caption`, `videoSrc`, `videoAspect`, `background`, `accent`, `children` (prompten).

#### `<CodeGeneration>` — Prompt → genererad kod (typewriter) + ev. video

Två varianter: `"split"` (prompt/kod vänster, video höger) eller `"fullbg"` (kod som bg).

**Props:** `eyebrow`, `title`, `subtitle`, `prompt`, `code?`, `videoSrc?`, `videoAspect?`, `variant`, `background`, `accent`, `codeSpeed`, `children` (code fence fallback).

#### `<VoiceFeedback>` — Röstinspelning + strukturerat AI-svar

Animerad röstvågform + typewriter-transkribering av rörigt tal → grid av strukturerade feedback-kort (rubrik + beskrivning + övningar).

**Props:** `kicker`, `title`, `subtitle`, `transcript`, `background`, `accent`, `typeSpeed`, `children` (markdown-lista: `- **Rubrik** · beskrivning · övning1 | övning2`).

#### `<TranslationDemo>` — Svensk→arabisk översättningsdemo

Prompt-bar + 3 paneler: svensk text (LTR), arabisk text (RTL), begreppskort med sv/ar-par.

**Props:** `kicker`, `title`, `subtitle`, `prompt`, `swedishText`, `arabicText`, `background`, `accent`, `children` (begreppslista).

#### `<QuizDemo>` — Interaktiv quiz-mockup med auto-animation

Prompt vänster, browser-chrome med frågan + 4 knappar höger. Auto-animerar: fel svar röd → rätt svar grön + förklaring. Loopar.

**Props:** `kicker`, `title`, `subtitle`, `prompt`, `question`, `options` (array), `correctIndex`, `wrongFirstIndex`, `explanation`, `background`, `accent`.

### Struktur & pedagogik

#### `<ProcessChain>` — Kedja av steg med noder

Horisontell eller vertikal kedja. Varje nod har label + hint + typ-ikon (text/image/audio/video/code/story).

**Props:** `kicker`, `title`, `body`, `direction` (`"horizontal"` | `"vertical"`), `background`, `accent`, `children` (lista: `- **Label** · hint · kind`).

```mdx
<ProcessChain kicker="§ XX · Kartan" title="..." direction="horizontal" accent="#EC7E26">
- **08.30 · NU** · Möjligheter och sammanhang · text
- **10.30** · Workshop — eget material · text
</ProcessChain>
```

#### `<SamrLadder>` — SAMR-modellen visualiserad

Stege med 4 nivåer (Substitution → Augmentation → Modification → Redefinition) + video på sidan.

**Props:** `videoSrc?`, `background?`.

#### `<BloomComparison>` — Bloom-nivåer före/efter AI

Två kolumner: "Klassisk uppgift" vs "AI-förbättrad uppgift", med Bloom-taxonomi-nivå markerad.

**Props:** `title`, `leftTitle`, `rightTitle`, `leftLevel`, `rightLevel`, `children` (parställda exempel).

#### `<ThreeActs>` — Tre-akts-struktur för berättelse

Tre stora "akter" med nummer + rubrik + beskrivning. För att bryta ner en bågformad berättelse.

**Props:** `title`, `subtitle`, `background`, `accent`, `children` (3 `- **Akt** · beskrivning`).

#### `<ThreeUp>` — Tre kolumner med punkt-listor

Klassisk 3-kolumn-layout med rubrik per kolumn + bullets.

**Props:** `title`, `accents` (3 färger), `children` (3 rubrik-blocks).

#### `<TwoPaths>` — Två vägar / två perspektiv parställda

Två kolumner med titel + lista. Varje listrad: `- vänster · höger`. Klassisk "klokt vs oklokt" eller "möjlighet vs utmaning".

**Props:** `title`, `leftTitle`, `rightTitle`, `leftAccent`, `rightAccent`, `background?`, `children`.

```mdx
<TwoPaths title="Två tankar samtidigt." leftTitle="Möjlighet" rightTitle="Utmaning" leftAccent="#EC7E26" rightAccent="#E84D4D">
- Anpassa nivån till varje elev · Eleven slutar få kämpa
- Direktfeedback på allt hen skriver · Ingen tänker klart innan
</TwoPaths>
```

#### `<Pitfall>` — Fälla: fråga → AI-svar → rättning

Visualiserar en typisk AI-fälla (hallucination, sykofantism). Typewriter-animerad fråga + svar + röd "correction"-ruta.

**Props:** `badge`, `chapter`, `word` (stora ordet), `subtitle`, `question`, `answer`, `correction`, `tagline`, `background`, `accent`, `typeSpeed`.

### Data & exempel

#### `<StatsTriptych>` — Tre stora siffror med källa

För dramatic triptych av statistik. Varje rad: `- SIFFRA · beskrivning`.

**Props:** `kicker`, `title`, `subtitle`, `source`, `background`, `accent`, `children`.

```mdx
<StatsTriptych kicker="§ II · Samma klassrum" title="Tvärsnittet i siffror." source="Skolverket" accent="#EC7E26">
- 500 000 · elever i vuxenutbildningen per år
- Över hälften · har utländsk bakgrund
- 20-65 år · normalt åldersspann
</StatsTriptych>
```

#### `<ExampleGrid>` — Kompakt grid för många korta exempel

Grid med frostat glas-kort, numrerade 01/02/... Bra för "15 sätt att...".

**Props:** `kicker`, `title`, `subtitle`, `tagline`, `columns` (default 3), `background`, `accent`, `children` (markdown-lista, en rad = ett kort).

#### `<LixPanels>` — Prompt + tre läsnivå-paneler

Prompt-bar överst + 3 paneler med typewriter-text (Lix 30/40/50). Visar samma innehåll i tre nivåer.

**Props:** `kicker`, `title`, `subtitle`, `prompt`, `background`, `accent`, `children` (3 paneler: `- **Nivå** · text`).

#### `<AgentCatalog>` — Katalog över agenter/assistenter

Video + lista av namngivna agenter med kort beskrivning. "Här är fem assistenter jag byggt".

**Props:** `kicker`, `title`, `subtitle`, `tagline`, `videoSrc`, `videoAspect`, `background`, `accent`, `children` (`- **Namn** · beskrivning`).

#### `<StudentVoices>` — Elevcitat i grid

Grid av kort med citat + elev-identifiering ("Flicka, 11 år: ...").

**Props:** `kicker`, `title`, `background`, `accent`, `children` (`- **Identifiering:** citat`).

#### `<StarterSentences>` — Igångsättningar för prompting

Korta "så börjar du"-meningar som elev/lärare kan kopiera. Staggered reveal.

**Props:** `kicker`, `title`, `subtitle`, `background`, `accent`, `children` (lista).

### Media-utility

#### `<LayeredScroll>` — Scrollande lager med bilder

Video- eller bild-lager som scrollas förbi för animerad känsla.

**Props:** `layers` (array), `background?`.

#### `<Lightbox>` — Modal/overlay för fokus

Wrapper för att visa något i overlay. Används sällan fristående, mer som konstruktionsbit.

---

**Totalt templates Fas 1-7: 84** (44 i Fas 1-6 + 40 nya i Fas 7).

**För /planera-skillen:** När du väljer template, kolla `content/showcase.mdx` som levande exempelbank. Särskilt: Manifesto för dramatiska pauser, TwoPaths för parställda resonemang, ProcessChain för flöden, ExampleGrid för "många korta", VoiceFeedback/TranslationDemo/QuizDemo/LixPanels för konkreta AI-demos, Pitfall för fällor, GrowingStatement för emotionella landningar.

---

## Pedagogiska templates (Lära-med-AI example pack)

22 nya templates byggda för "Lära med AI"-presentationen. Många är specialiserade
för pedagogiska modeller (linser, taxonomier) men flera är generellt återanvändbara
(HookStatement, AcronymList, TwoSides, LensApplication, etc.).

**Levande exempelbank:** `content/lara-med-ai.mdx` — alla templates används där.

### Dramatiska statement-templates

#### `<HookStatement>` — Ord-för-ord-pacing av kort dramatisk fras

Splittar texten på ord och animerar in dem i sekvens. **Fet** ord får extra paus + accent-färg + scale-pop. Bra för pivotala one-liners där man vill att publiken ska *känna* varje ord landa.

**Props:** `background`, `accent`, `overlay`, `pauseAfter`, `chapter`, `children`.

**Exempel:**
```mdx
<HookStatement chapter="§ Den centrala frågan" accent="#EC7E26" pauseAfter={2400}>
Leder **verkligen** AI till lärande?
</HookStatement>
```

#### `<TriadStatement>` — Retorisk triad: två premisser → en landning

Tre paragrafer där de två första är premisser (mindre, dämpade), den sista är landningen (stor, ljus). Visuell konvergens-linje binder dem. Använd `---` mellan premisser och landning.

**Props:** `chapter`, `background`, `overlay`, `accent`, `children` (paragrafer separerade med `---`).

**Exempel:**
```mdx
<TriadStatement chapter="§ Paradox 2">
För att ställa **bra frågor** — krävs kunskap.

För att värdera **svar** — krävs kunskap.

---

AI **förstärker** det du redan har.
</TriadStatement>
```

#### `<GrowingStatement>` — Statement med whisper-intro som växer

Liten whisper-text uppe ("Risken är:") följd av stor påståendekris. Använd för dramatisk landning efter en setup.

**Props:** `chapter`, `whisper`, `background`, `accent`, `children`.

#### `<RotatingStatement>` — Roterar mellan flera fraser

Visar en fras i taget som roterar. Bra för "AI är inte X. AI är inte Y. AI är Z." Pedagogiska rörelser.

**Props:** `chapter`, `background`, `accent`, `children` (markdown-lista).

#### `<EditorialQuote>` — Typografiskt varierat citat med hierarki

Whisper / bridge / shout / landing / pause-rader med typografisk variation. Cascading animation. Bra för att inte tappa publik på lång prosa.

**Props:** `chapter`, `background`, `accent`, `children` (markdown med `## Header` för olika klasser).

### Pedagogiska modell-templates

#### `<LensIntro>` — Typografisk inledning till en lins/sektion

Stort lins-namn med dekorativt index-nummer i bakgrunden, frågan som subtitle, tagline som ramar att det är en lins (inte recept). Designad för återanvändning över alla 5 linser i akt 2.

**Props:** `number`, `total`, `name`, `subtitle`, `tagline`, `chapter`, `background`, `overlay`, `accent`.

**Exempel:**
```mdx
<LensIntro
  number="01"
  total="05"
  name="Affordans"
  subtitle="Vad inbjuder tekniken till?"
  tagline="En lins — inte ett recept."
  background="..."
  accent="#EC7E26"
/>
```

#### `<AcronymList>` — Akronym/lista med 2-6 ord + beskrivningar

Stor accent-bokstav till vänster + ord och italic beskrivning till höger. Stödjer både akronymer (`**S** · Skapa · ...`) och vanliga listor (`Skapa · ...`) — letter-kolumnen hoppas över när alla saknar bokstav. Bra för introduktion av modeller (SAMR, Bloom, ECPA).

**Props:** `chapter`, `title`, `tagline`, `background`, `overlay`, `accent`, `children`.

**Exempel:**
```mdx
<AcronymList chapter="§ Puentedura · 2006" title="SAMR" tagline="Inte fyra steg uppåt.">
- **S** · Substitution · ersätter ett verktyg
- **A** · Augmentation · förbättrar funktionellt
- **M** · Modification · omdesignar uppgiften
- **R** · Redefinition · möjliggör något nytt
</AcronymList>
```

#### `<SAMRSpectrum>` — Horisontellt spektrum, INTE hierarkisk stege

4-6 stationer i rad med letter-cirkel + namn + valfritt exempel-kort. Pulserande halos kring varje cirkel, ingen tonal värdering. "← Ersätter / Skapar nytt →"-etiketter visar att det är spektrum. Format per listpunkt: `**Bokstav** · Namn · Exempel`.

**Props:** `chapter`, `intro`, `task`, `background`, `overlay`, `accent`, `children`.

#### `<BloomPyramid>` — Pyramid med två möjliga riktningar

6 horisontella band med varierande bredd (smal topp, bred botten). En SVG-pil per sida visar antingen klassisk byggriktning eller omvänd designriktning eller båda. Alla band får samma accent-färg (ingen hierarki). `arrows`-prop: `"both" | "up" | "down" | "none"`.

**Props:** `chapter`, `intro`, `background`, `overlay`, `accent`, `arrows`, `upLabel`, `downLabel`, `children`.

#### `<JagAIJagFlow>` — Tre kognitiva faser horisontellt

JAG → AI → JAG. Tre kort med titel, italic caption, frågor som bullets. Pulserande prick rör sig kontinuerligt genom flödet via SVG. Mittenfasen lyser starkare. Avslutas med citat under en accent-linje. Bra för JAG-AI-JAG-modellen (pedagogisk modell för medveten AI-användning). Format: `**Titel** · caption · item1 · item2 · item3`.

**Props:** `chapter`, `intro`, `closing`, `background`, `overlay`, `accent`, `children`.

#### `<BeforeAfterPhases>` — Lärarens designram (Före → AI → Efter)

Tre fas-kolumner med fas-nummer, tidsmarkör, caption och frågor. Tidslinje under med pulserande prick. Sista fasen kan markeras som "→ Akt 3"-länk via `highlightLast`. Skiljer sig från JagAIJagFlow genom att betona TID/process snarare än kognition. Format: `**Fas** · tidsmarkör · caption · item1 · item2`.

**Props:** `chapter`, `intro`, `background`, `overlay`, `accent`, `highlightLast`, `children`.

### Lis-konkretisering

#### `<LensApplication>` — Konkret klassrumsexempel med linskoppling

Split-layout med media (bild eller video) på en sida, text på den andra. Stora subject-tagg + huvudtitel + mekanism-text + lens-pillar (`⊕ Affordans`). `mediaPlacement`-prop flippar layouten för visuell rytm mellan exempel.

**Props:** `chapter`, `subject`, `title`, `mekanism`, `imageUrl`, `videoUrl`, `mediaPlacement` (`"left"` | `"right"`), `lenses` (string[]), `background`, `overlay`, `accent`.

**Exempel:**
```mdx
<LensApplication
  chapter="§ Rapid fire · 1 / 3"
  subject="Svenska · Gymnasiet"
  title="Diktanalys via bildgenerering"
  mekanism="Eleverna analyserar dikten genom att skapa bild..."
  imageUrl="/bilder/lara-med-ai/diktbilder.png"
  mediaPlacement="right"
  lenses={["Affordans", "Omvänd Bloom"]}
/>
```

#### `<DualAffordance>` — Verktygens dubbla affordans

Per rad: verktyg i mitten (med glow + vertikal splittnings-linje) + positiv affordans (vänster, grön) + negativ affordans (höger, gul). Format: `**Verktyg** · positiv / negativ`. Bra för att visualisera att samma verktyg kan inbjuda till två saker samtidigt.

**Props:** `chapter`, `intro`, `background`, `overlay`, `accent`, `positiveLabel`, `negativeLabel`, `positiveColor`, `negativeColor`, `children`.

#### `<NoviceDilemma>` — Novis vs Expert med AI i mitten

Två kolumner: Novis (dämpad, single-circle output) och Expert (vibrant, branching nodes). AI i mitten med asymmetriska pilar till varje sida. Visualiserar att AI förstärker det eleven redan har — och därmed vidgar klyftan.

**Props:** `chapter`, `title`, `leftLabel`, `leftOutput`, `rightLabel`, `rightOutput`, `middleLabel`, `background`, `accent`, `overlay`.

### Datavisualisering

#### `<UCurveChart>` — Animerad U-kurva med zoner

SVG-baserad U-kurva (start 55%, dipp 25% vid x=0.3, peak 85% vid x=0.7, krasch till 20% vid x=1.0). Zoner parsade från markdown-lista (`- Label · tone · Description`) tänds i sekvens. Bra för cognitive offloading paradox och liknande.

**Props:** `chapter`, `title`, `subtitle`, `xLabel`, `yLabel`, `background`, `accent`, `overlay`, `children`.

#### `<EvidenceConstellation>` — Forskningsläget som stjärnhimmel

Varje fakta får ett kluster av stjärnor vars *densitet* visar evidensstyrkan. Vänster sida tät och lysande (vad vi vet), höger sida gles och dunkel (blindfläckar). Stjärnor har drift-loopar (rör sig i sina egna banor) och tre olika blink-mönster. Deterministisk pseudo-random för SSR-stabila positioner. Format: `**Bokstav** · Beskrivning` separerat med `---`.

**Props:** `chapter`, `intro`, `background`, `overlay`, `accent`, `leftLabel`, `leftTone`, `leftDensity`, `rightLabel`, `rightTone`, `rightDensity`, `children`.

#### `<FrictionMap>` — AI som automatiserande teknologi

SVG-animation av lärandeprocess som bana med 3 friktion-toppar (Friktion · Önskvärd svårighet · Meningsfullt motstånd). AI-vågen glider in från vänster, plattar ut terrängen. Total animation ~11 sekunder.

**Props:** `chapter`, `accent`, `background`, `overlay`, `peak1Label`, `peak2Label`, `peak3Label`, `hero`, `bridge`, `landing`.

### Kategori-visualiseringar

#### `<TwoSides>` — Två-kolumn-jämförelse med tonalitet

Två varianter: `"list"` (kompakta listor sida vid sida) och `"study"` (två stora citat-kort med huvudpåstående + caveat). Tone-prop per sida (`positive` | `warning` | `danger` | `neutral`) sätter färg och markörer. Format med `---` mellan vänster och höger.

**Props:** `chapter`, `intro`, `background`, `overlay`, `accent`, `variant`, `leftLabel`, `leftTone`, `leftMeta`, `rightLabel`, `rightTone`, `rightMeta`, `separator`, `children`.

#### `<StrategySpectrum>` — Tre strategiska val sida vid sida

Tre kort med tone-färgning (danger/warning/positive). En markerad som `recommended` får glow + "Den enda vägen"-badge + pulserande border. Format: `Titel · tone · [recommended ·] Beskrivning`.

**Props:** `chapter`, `intro`, `background`, `overlay`, `accent`, `children`.

### Listor och samlingar

#### `<RevealList>` — Ackumulerande lista med glow-pulser

Punkter dyker upp i sekvens (default 0.9s stagger), sista raden får persistent glow-pulse. Bra för retoriska uppräkningar där sista påståendet ska landa.

**Props:** `prefix`, `chapter`, `background`, `accent`, `stagger`, `overlay`, `children`.

#### `<ChatSplit>` — Tvådelad chat-vy

Två kolumner med olika chat-kontexter sida vid sida. Bra för att visa "samma fråga, olika prompt" eller "elev-bot vs lärar-bot".

**Props:** `kicker`, `title`, `background`, `accent`, `children`.

### Realtidsinteraktion

#### `<LivePoll>` — Realtidsröstning kopplad till Supabase

Skapar/hittar `interactions`-row med `[pollKey]`-prefix. Subscriberar via Supabase Realtime till `interaction_responses`. Renderar växande staplar med live-rösträkning. Falls back till "Kräver aktiv session" när localStorage saknar `presenter-session:{slug}`.

**Props:** `chapter`, `title`, `subtitle`, `pollKey` (krävs, unik nyckel), `background`, `accent`, `overlay`, `children` (`- Label · tone · Description`).

**Exempel:**
```mdx
<LivePoll chapter="§ Ni bestämmer" title="Var är ditt klassrum just nu?" pollKey="zone-check">
- Zon 1 · Ingen AI · neutral
- Zon 2 · Halvhjärtat · danger
- Zon 3 · Committed · success
</LivePoll>
```

---

**Totalt templates nu: 106** (84 från Fas 1-7 + 22 nya i Fas 8). Detaljerade exempel för
Lara-med-AI-templates finns i `content/lara-med-ai.mdx`.

**För /planera-skillen i Fas 8:** Använd HookStatement för korta dramatiska frågor,
LensIntro för sektionsintroduktioner, AcronymList för modell-presentationer (med eller
utan akronym-bokstav), TwoSides för jämförelser med tonalitet, LensApplication för
konkreta klassrumsexempel med media + linskoppling, BeforeAfterPhases för designramar
med tidsperspektiv. Jag-AI-Jag → JagAIJagFlow. Spektrum-modeller → SAMRSpectrum eller
BloomPyramid. Forskningsdata → EvidenceConstellation eller UCurveChart.

---

## Fas 9: Mönster-modell-templates (2026-04-25)

En template för pedagogiska och kliniska mönster-modeller med forskningskällor —
designad för situationer där varje mönster behöver namn, en-radig sammanfattning
och källattribution direkt på kortet, och föreläsaren går igenom dem ett i taget.

### `<InvisibleChildPatterns>` — Numrerat mönster-grid med källor

Rutnät av N mönster (testat med 7), stegad reveal — ett kort i taget tonas fram
medan övriga är dämpade. Varje kort har: stort numrerat märke (01–NN),
mönsternamn (display-typografi), en-rads sammanfattning, källattribution
(uppercase småtext längst ned).

**Syfte:** Pedagogiska/kliniska mönster-modeller där varje mönster behöver
namn + en-radig pitch + forskningskälla, och föreläsaren går igenom dem
en i taget. Bra för Bloom-varianter, ACE-symtom, trauma-symtomkategorier,
PTSD-subkluster, eller egendefinierade pedagogiska ramverk.

**Stegsystem:** Ja. Antal steg = antal mönster.

**Props:**
- `title?` — rubrik
- `tag?` — UPPERCASE tag ovanför titeln
- `titleSize?` — `sm` | `md` (default) | `lg` | `xl`
- `columns?` — antal kolumner i gridden (default 3)

**Children-format:**
```
- **Mönster-namn** · En-rads sammanfattning · Källa(n)
```

**Exempel:**
```mdx
<InvisibleChildPatterns
  tag="MODELL"
  title="Patterns där bördan döljer sig"
  columns={3}
>
- **Pattern A** · One-line summary som landar fort i salen. · Källa 2024
- **Pattern B** · Parallell struktur visar att flera mönster delar logik. · Källa 2023
- **Pattern C** · Varje kort tonas in när space trycks. · Källa 2022
- **Pattern D** · Källattributionen sitter UPPERCASE längst ned. · Källa 2021
- **Pattern E** · Sju mönster passar bra i 3-kolumners grid (3+3+1). · Källa 2020
</InvisibleChildPatterns>
```

**Undvik när:** Mönstren saknar källattribution (använd `MetricGrid` eller
`NumberedReveal`). Du har > 9 mönster (gridden blir trångt — splitta i två slides).
Mönstren ska gås igenom i strikt ordning och kräver pil-animation i en lista
(använd `NumberedReveal`).

---

## Fas 10: Floating overlays + 53 nya templates (2026-04-29)

**Stor port** av infrastruktur och templates som utvecklats i en privat
downstream-fork. Två huvudteman:

1. **Floating overlays** — `<FloatingImage>` / `<FloatingVideo>` /
   `<FloatingText>` / `<FloatingChat>` / `<FloatingPills>` /
   `<FloatingPhone>` läggs som overlays *ovanpå* en parent-slide. I
   editorn kan de dras, resizas, roteras — i presenter-läget renderas
   de statiskt på sina sparade positioner. Driven av `<SlideWithOverlays>`
   (wrapper) som `mdx-parser`'s `preprocessOverlaysForPresenter()` lägger
   in automatiskt när en slide har overlay-children.
2. **53 nya slide-templates** — statements, mönster-grids, pedagogiska
   modeller, AI-demos, process- och datavisualiseringar.

Alla entries nedan är *kondenserade* — läs själva `.tsx`-filen för full
prop-uppsättning och animation-detaljer.

### Floating overlays

#### `<FloatingImage>` — Drag-and-resize bild som overlay

Frittflyttande bild som kan placeras ovanpå en annan slide. I edit-läget
markeras den med outline + 4 corner-handles + delete-knapp. Drag i mitten
flyttar; drag i hörn resizar. I presenter-läget renderas statiskt.

**Props:** `src` (krävs), `alt?`, `x?`/`y?` (% eller px), `width?`,
`height?`, `rotation?`, `opacity?`, `zIndex?`, `layer?` (`"front"` (default)
| `"back"` — bakom template-content), `background?`, `overlay?`.

#### `<FloatingVideo>` — Drag-and-resize video som overlay

Som `FloatingImage` men för video. Stödjer lokala paths (.mp4/.webm/.mov),
direktlänkar och YouTube/Vimeo-URL:er (auto-embed). Spelar muted+looped
i presenter-läget. Server actions för uppladdning kräver
`bodySizeLimit: "500mb"` i `next.config.ts`.

**Props:** Samma som FloatingImage + `chapter?`, `accent?`, `showControls?`.

#### `<FloatingText>` — Drag-and-resize textruta som overlay

Fri text-ruta. I edit-läget kan storleken justeras via preset (xs/sm/md/lg/xl/xxl)
eller direkt cqw-värde. **bold** + *italic* stöds.

**Props:** `text?` (alternativt children), `x?`/`y?`/`width?`/`height?`,
`size?`, `color?`, `weight?` (regular/medium/bold/black eller nummer),
`align?`, `style?` (display/body/mono), `background?`, `padding?`.

#### `<FloatingChat>` — Animerad chat-widget som overlay

Mockad chat med user-/AI-bubblor som rullar in en i taget. Användbart för
att lägga ett konkret exempel bredvid en siffra eller statement.

**Format:** `- **Avsändare:** text`. Avsändare som matchar `du|user|jag`
blir user-bubbla.

**Props:** `x?`/`y?`/`width?`/`height?`, `widgetName?`, `widgetStatus?`,
`accent?`, `showWindowControls?`, `kicker?`, `autoplay?`, `beat?`.

#### `<FloatingPills>` — Små stat-chips som overlay

Pill-formade stat-chips som revealas med stagger. Använd för supporting-
statistik på en slide där huvud-siffran redan är något annat.

**Format:** `- Text · Källa`

**Props:** `x?`/`y?`/`width?`, `accent?`, `layout?` (`"wrap"` (default) | `"stack"`),
`initialDelay?`, `stagger?`.

#### `<FloatingPhone>` — Mobiltelefon-overlay med chat

Renderar en stiliserad mobiltelefon med chat på skärmen. Bra för att visa
hur en elev/användare interagerar med en chatbot på sin telefon. `:screenshot`-
prefix på meddelande triggar skärmdumps-vy.

**Props:** `x?`/`y?`/`width?`, `appName?`, `time?`, `accent?`, `autoplay?`,
`beat?`.

#### `<SlideWithOverlays>` — Wrapper för slides med overlays

Pre-processad automatiskt av MDX-parsern — du behöver inte skriva den själv.
Tillhandahåller `OverlayInstanceProvider`/`useOverlayInstance`-context.

---

### Statement & framing

#### `<BigDefinition>` — Definitionsslide

Stort begrepp i mitten, fullt namn i italic ovanför, definition under.

**Props:** `term` (krävs), `fullName?`, `definition?`, `chapter?`, `accent?`,
`source?`, `children?`.

#### `<CoreInsight>` — Build-up + punchline

Setup-text i mindre format, dramatisk paus, sen LANDAR punchlinen i stor
skala med accent-glow. **bold** i punchline = accent-färg.

**Props:** `setup?`, `punchline` (krävs), `chapter?`, `kicker?`, `accent?`.

#### `<BildningContrast>` — Två vertikala spalter med glödande mittlinje

Vänster = något AI levererar (information, fakta). Höger = något människan
står för (bildning, omdöme, mening). Stega för att tända spalterna i tur.

**Format:** `- Vänster-rad · Höger-rad`

**Props:** `chapter?`, `title?`, `leftLabel?`, `leftWord?`, `rightLabel?`,
`rightWord?`.

#### `<HumanOnlyTriad>` — Tre pelare med saker AI inte kan göra

Varje pelare har strikethrough på "AI" och "DU" i accent under. Stega för
att tända en pelare i taget.

**Format:** `- Titel · Beskrivning`

**Props:** `chapter?`, `title?`, `subtitle?`, `negatedLabel?` (default "AI:n"),
`activeLabel?` (default "Du").

#### `<NarrativeFrames>` — Fyra paralella narrativ, avslöjas en i taget

Tänkt för "Berättelsen om AI"-beatet. Prefix `★` markerar primary-narrativet
(extra glow på sista step).

**Format:** `- ★ Namn · Beskrivning`

**Props:** `chapter?`, `title?`, `subtitle?`, `accent?`, `hint?`.

#### `<Denials>` — Spektakulär lista av negationer med strikethrough

Varje fras revealas BIG, får strikethrough-animering, mattas. Avslutas med
valfri konklusion ("vad det ÄR").

**Format:** `- ett orakel`

**Props:** `prefix?` (intro), `conclusion?`, `accent?`, `beat?` (ms),
`strikeDelay?` (ms).

#### `<WeirdSummary>` — Sammanfattningsslide för ett "weird"-moment

Listar 3-5 udda observationer i kompakt grid. Bra för att summera ett
moment där du visat overraskande exempel.

**Props:** `chapter?`, `title?`, `accent?`, `children` (markdown-lista).

#### `<WeirdReveal>` — Avslöjar en "weird" sak med dramatisk uppbyggnad

Setup → reveal → konsekvens. Prosa-fokuserat med tre register.

**Props:** `chapter?`, `setup?`, `reveal`, `consequence?`, `accent?`.

#### `<TackSlide>` — Bespoke avslutnings-slide

Stort "Tack!" till vänster, hero-bild i mitten, bok-thumbnail nere, kontakt-
rader till höger med plattforms-ikoner (linkedin/instagram/gmail/spotify/web).

**Format:** `- Plattform · Etikett`

**Props:** `chapter?`, `title?` (default "Tack!"), `subtitle?`, `personImage?`,
`bookImage?`, `accent?`, `overlay?`.

#### `<ParadoxStat>` — Paradox: setup → bryggord → MASSIV siffra → källa

Räkneverket startar efter setup + bridge har landat. Numret är visuellt
hjärtat, allt annat är dimmat.

**Props:** `chapter?`, `setup?`, `bridge?` (typ "Ändå..."), `value` (krävs),
`suffix?`, `caption?`, `source?`.

---

### Pattern grids & lists

#### `<PrincipleStack>` — Lager av principer i staplad layout

Numrerade principer, varje med stort tag-ord + utveckling. Stagger-reveal.

**Format:** `- **Princip-namn** · utveckling`

**Props:** `chapter?`, `title?`, `accent?`.

#### `<PowerStack>` — Hierarki av makt-positioner

Stigande tier-stack med vikt-progression visualiserad genom typografi och
färgintensitet.

**Format:** `- **Position** · beskrivning`

**Props:** `chapter?`, `title?`, `accent?`.

#### `<SkillStack>` — Färdighetsstack från grundläggande till avancerat

Visualiserar skill progression. Liknar TierStack men mer pedagogisk-
specifik.

**Format:** `- **Färdighet** · vad det innebär`

**Props:** `chapter?`, `title?`, `accent?`.

#### `<TaskBucket>` — Buckets med tasks/aktiviteter

Tre eller fler kategori-buckets med items i varje. Bra för "vad gör vi
imorgon"-strukturer.

**Format:** Markdown-lista med `**Bucket-namn**` följt av items.

**Props:** `chapter?`, `title?`, `accent?`.

#### `<RapidFireIdeas>` — Snabb sekvens av korta idéer

Idéer slås upp en i taget i hög hastighet, lämnar visuella spår. Bra för
brainstorm-moments eller "femton sätt att..."-sekvenser.

**Props:** `chapter?`, `title?`, `beat?` (ms mellan idéer), `accent?`.

#### `<MandateMap>` — Koncentriska ringar runt en glödpunkt i centrum

Varje ring har ett räckvidd-stat (t.ex. elever/år, elever/karriär).
Stega för att tända ringarna eller låt komma med stagger.

**Format:** `- siffra · etikett`

**Props:** `chapter?`, `title?`, `subtitle?`, `centerLabel?`,
`centerSublabel?`, `accent?`.

#### `<CaseGrid>` — Rutnät av case/exempel-kort

Stödjer valfri tumnagelbild per kort — "wall of evidence"-känsla med
bilder, mer typografiskt utan. `display="carousel"` ger en peek-vy med
ett aktivt kort + dimmade.

**Format:** `- Plats · Datum · Beskrivning · /path/till/bild.jpg`

**Props:** `chapter?`, `title?`, `columns?`, `display?` (`"grid"` (default)
| `"carousel"`), `hint?`.

#### `<RoleConstellation>` — Roller klustrade i en konstellation

Visualiserar olika roller/aktörer som planeter i ett system. Klustras i
mitten, med relationer markerade.

**Format:** `- **Roll** · beskrivning`

**Props:** `chapter?`, `title?`, `centerLabel?`, `accent?`.

#### `<OccupationRadar>` — Radar/spider-chart för yrkespåverkan

Theoretical vs observed AI-påverkan över N yrkeskategorier (Anthropic
Economic Index Figure 2-style). Stega: grid → theoretical-polygon →
observed-polygon.

**Format:** `- Yrke · theoretical-värde · observed-värde`

**Props:** `chapter?`, `title?`, `theoreticalLabel?`, `observedLabel?`,
`conclusion?`.

#### `<HopeMontage>` — Hope-grid med video/bilder

Auto-detect video vs bild från filändelse. Videos spelar muted, looped
direkt vid mount.

**Format:** `- /path/till/media · Beskrivning`

**Props:** `chapter?`, `title?`, `subtitle?`, `accent?`, `overlay?`.

#### `<QuoteWall>` — Wall av citat med stagger-reveal

Grid av citat-kort. Varje kort har citat + attribution + valfri context.

**Format:** `- "Citat" · Attribution · Context`

**Props:** `chapter?`, `title?`, `accent?`, `columns?`.

#### `<BiasShowcase>` — Centerstage-mode för en serie kognitiva bias

Stega framåt för att crossfade till nästa bias. Varje bias visar bias-namn
(stort accent), beskrivning (italic), chat-bubble (AI:s claim), reaktion
(vad hjärnan gör), truth-reveal (vad som FAKTISKT är sant).

**Format:** Markdown-lista med strukturerad data per bias.

**Props:** `chapter?`, `title?`, `subtitle?`, `accent?`.

---

### Models & pedagogy

#### `<SOLOGraph>` — SOLO-taxonomi visualiserad som graf

Pre-strukturella → multi-strukturella → relationella → utvidgade abstrakta.
Stega genom nivåerna med konkret exempel-scenario per.

**Props:** `chapter?`, `title?`, `scenario?`, `accent?`.

#### `<JaggedFrontier>` — "Samma modell, olika uppgift"

Horisontell kapacitetslinje med vertikala par-staplar: dot uppåt
(excellence) + dot neråt (weakness). Visualiserar AI:s ojämna kapacitets-
profil.

**Format:** `- Excellence-uppgift · Weakness-uppgift`

**Props:** `chapter?`, `title?`, `landing?`, `accent?`.

#### `<DimensionMap>` — N-dimensionellt ramverk som karta

Renderar dimensioner som horisontell rad av numrerade kort kopplade av
topplinje. `activeIndex` markerar nuvarande position med "Här är vi"-label.

**Format:** `- Namn · Beskrivning`

**Props:** `chapter?`, `title?`, `subtitle?`, `activeIndex?`, `activeLabel?`.

#### `<ZoneShift>` — Visualiserar skifte mellan zoner

Bra för "förr-zon → AI-zon"-narrativ. Animerad övergång mellan två
visuella tillstånd.

**Props:** `chapter?`, `fromLabel?`, `toLabel?`, `accent?`.

#### `<WithAboutAgainstThrough>` — Fyra prepositionella förhållningssätt till AI

Med, Om, Mot, Genom — fyra perspektiv på AI-pedagogik. Roterar/staggar
genom dem.

**Format:** `- **Preposition** · vad det innebär`

**Props:** `chapter?`, `title?`, `accent?`.

#### `<MirrorReveal>` — Final-manifesto med spegel-effekt

Texten landar i översta halvan, en (svagt distorderad) reflektion landar
i undre. Subtil shimmer-pulse mellan dem. Tänkt som klimax i en presen-
tation där spegeln är genomgående metafor.

**Props:** `chapter?`, `kicker?`, `signature?`, `accent?`, `children`.

#### `<TimeHorizons>` — Korta/medel/långa tidshorisonter

Tre kolumner med olika tidshorisonter (t.ex. 6 mån / 5 år / 50 år) och
vad som troligen är sant i varje.

**Format:** `- **Horisont** · vad som händer`

**Props:** `chapter?`, `title?`, `accent?`.

#### `<TimelineCompression>` — Komprimerad tidslinje med exponentiell skala

Visualiserar att tidsavstånd minskar exponentiellt — gjort för att visa
hur snabbt AI-utveckling går.

**Props:** `chapter?`, `title?`, `events` (markdown-lista), `accent?`.

#### `<ParallaxTimeline>` — Tidslinje med parallax-scroll

Tidslinje där varje event har olika scroll-hastigheter för parallax-känsla.
Tänkt för långa tidsaxlar (decennier+).

**Format:** `- **År** · Händelse · Detaljer`

**Props:** `chapter?`, `title?`, `accent?`.

#### `<NextTokenDemo>` — Demonstration av next-token-prediction

Visualiserar hur AI väljer nästa token i en mening. Tokens svävar i halo
kring markören, vinnaren pulsar och materialiseras som nästa token.

**Format:** `decisions={[[['öster', 0.87], ['väster', 0.04]], ...]}` eller
`decisionsText="öster:0.87,väster:0.04 / och:0.62,över:0.18"`.

**Props:** `chapter?`, `bridge?`, `prefix` (krävs), `decisions?`,
`decisionsText?`, `closing?`, `accent?`.

---

### AI demos & interactive

#### `<BiasCode>` — Kod-fil som avslöjar bias steg för steg

Stiliserat som editor med syntax highlighting. Block separeras av
blankrader och avslöjas stegvis. Visar hur datan formar mönstret.

**Props:** `chapter?`, `title?`, `filename?` (default "bias.py"),
`autoReveal?`, `accent?`.

#### `<DesignChoices>` — Central kategorilista med chat-bubblor runtom

När du stegar revealas ett chat-citat i taget. Matchande kategori i centern
highlightas. Bra för "AI:s designval"-moment.

**Format:** `- Chat-text · Kategori`

**Props:** `chapter?`, `title?`, `categories?` (komma-separerad),
`accent?`.

#### `<DataRedaction>` — Visar VAD som ska/inte ska skickas till AI

Pedagogiskt grepp: formen ÄR innehållet. En faktisk prompt med elevdata
visas; klick → "censur-tejp" slår över riskorden. Slutligen ersätts allt
av anonymiserad version med GODKÄND-stämpel.

**Markup:** `{N:text}` i prompt = text ska redactas i kategori N.

**Props:** `chapter?`, `title?`, `prompt` (krävs, med markup), `categories?`,
`safePrompt` (krävs), `tumregel?`, `okLabel?`.

#### `<PrivacyDecree>` — Sekretess-dekret i officiellt format

Stiliserat som regerings-/myndighetsdokument. Punkter avslöjas stegvis.

**Format:** `- **Paragraf** · text`

**Props:** `chapter?`, `title?`, `seal?`, `accent?`.

#### `<PromptToImage>` — Prompt → genererad bild

Prompt typas, sen tonas en bild in som "resultatet". Bra för att visa
text-to-image-flöden.

**Props:** `chapter?`, `prompt` (krävs), `imageSrc` (krävs), `caption?`,
`accent?`.

#### `<DarkPatternsApp>` — Interaktiv app: dark patterns i AI-chatbots

Full-slide live-demo med 5 scenarier (skuld, tidsbrist, intimitet,
datainsamling, FOMO), quiz och resultatsida. Presentatören klickar igenom
under presentationen.

**Props:** `chapter?`, `background?`.

#### `<LiveEmbed>` — Embedda en URL som iframe

Bra för Claude Artifacts, Codepen, externa demos. Visar "Spela upp"-poster
tills användaren klickar.

**Props:** `url` (krävs), `title?`, `description?`, `chapter?`,
`aspectRatio?`, `autoload?`, `playLabel?`.

#### `<LiveReflection>` — Open-text-svar från publiken via Supabase

Som `LivePoll` men för fri-text. Visar svar som "wall of cards" där nya
svar dimper in. Kräver `pollKey` för att koppla till Supabase realtime.

**Props:** `chapter?`, `title?`, `subtitle?`, `pollKey` (krävs),
`maxCards?` (default 24), `accent?`.

#### `<VoiceReveal>` — Röstinmatning som avslöjar text

Animerad rösttranskribering där röstvågor visualiserar input och text
typas fram. Bra för "tal-till-text"-demos.

**Props:** `chapter?`, `transcript` (krävs), `accent?`.

---

### Process & data

#### `<InfluenceChain>` — Horisontell pipeline av N stadier

Tänkt för "kedjan av X": Skapa → Sprida → Träna → Tillit → Oss.
Glas-kort med nummer-badge, namn, mekanism, exempel. Pilar pulsar mellan
korten. Stega för att lyfta ett stadium i taget.

**Format:** `- Namn · mekanism · exempel`

**Props:** `chapter?`, `title?`, `subtitle?`, `accent?`.

#### `<ProcessLogPreview>` — Loggfil som avslöjas stegvis

Visualiserar en process-logg med tidsstämplar och meddelanden. Stega för
att avslöja rad för rad.

**Format:** `- HH:MM:SS · log-meddelande`

**Props:** `chapter?`, `title?`, `accent?`.

#### `<ContractMockup>` — Klassrumskontrakt som autentiskt dokument

Stiliserat som officiellt dokument: titel, undertitel, numrerade artiklar
(§ 1, § 2, …), signaturlinjer. Animation: dokument scale-fadar in →
artiklar tänds i sekvens → signaturer.

**Format:** Markdown-lista, varje punkt blir en artikel.

**Props:** `chapter?`, `title?` (default "KLASSRUMSKONTRAKT"),
`subtitle?`, `leftSignature?` (default "Lärare"), `rightSignature?`
(default "Klassen"), `date?`.

#### `<NegotiationStory>` — Förhandling mellan lärare och elev visualiserad

Scen från ovan: lärare till vänster, elev till höger. Klick → ord-bubblor
flyger ut, möts i mitten, materialiseras som post-it. 5 punkter.

**Format:** `- Vad AI **får** vara · samtalspartner, granskare`

**Props:** `chapter?`, `intro?`, `landing?`, `leftLabel?`, `rightLabel?`.

#### `<MediaCarousel>` — Text-kolumn + horisontell carousel av video/bild

Aktiv media i mitten, övriga peekar in från sidorna. Auto-detect video
vs bild från filändelse. Stega med pil-höger för att slidea till nästa.

**Format:** `- /path/till/media · Caption`

**Props:** `chapter?`, `title?`, `stat1?`, `stat2?`, `subtitle?`,
`orientation?` (`"landscape"` (default) | `"portrait"`).

---

**Totalt templates nu: 160** (107 från Fas 1-9 + 53 nya i Fas 10).

**För /planera-skillen i Fas 10:** Floating-overlays möjliggör manuell
media-insättning ovanpå vilken slide som helst — använd när en template
inte räcker till för att placera bild/video/text exakt där det behövs.
För definition-slides → `BigDefinition`. För "klimax-payoff" efter setup
→ `CoreInsight`. För "AI kan inte X" → `HumanOnlyTriad`. För taxonomier
→ `SOLOGraph` / `JaggedFrontier` / `DimensionMap`. För iframe-demos →
`LiveEmbed`. För publik-input → `LivePoll` (val) eller `LiveReflection`
(fri-text).
