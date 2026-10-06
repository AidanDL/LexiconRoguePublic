# Lexicon Rogue — public site

Marketing site and privacy policy for **Lexicon Rogue**, the roguelike word game for Android by Little Fathom
(package `com.littlefathom.lexicon_rogue`).

- `/` — landing page: hero, how it plays (with a playable scoring demo), the 27 Glyphs, the 13 Boss Blinds, Daily Run and share card, screenshots, fair-play promises
- `/privacy/` — privacy policy (paste this URL into Google Play Console and the AdMob / UMP consent message)

Built with Vite + React + TypeScript. Both pages are pre-rendered to static HTML at build time, so the site works on any static host and the policy is readable without JavaScript. No cookies, analytics or third-party requests: fonts (Alegreya), icons, screenshots and Glyph art are all self-hosted.

## Privacy policy URL

| Hosting | Privacy URL for Play Console / AdMob |
|---|---|
| Vercel | `https://<project>.vercel.app/privacy/` |
| Custom domain, e.g. `lexiconrogue.littlefathom.com` | `https://lexiconrogue.littlefathom.com/privacy/` |

Keep the trailing slash.

## Config

Site details live in [`src/site.config.ts`](src/site.config.ts):

| Field | What it is |
|---|---|
| `developerName` | Studio shown in the footer and policy (Little Fathom) |
| `contactEmail` | Privacy contact (info@littlefathom.com); Google Play requires one |
| `playStoreUrl` | Play listing URL. While it is the placeholder, the buttons read “Coming soon to Google Play”. Set it to `https://play.google.com/store/apps/details?id=com.littlefathom.lexicon_rogue` when the listing is live |
| `siteUrl` | Optional public URL including base path (e.g. `https://aidandl.github.io/LexiconRoguePublic/`). When set, the build writes absolute `og:image`/`twitter:image`, `og:url` and canonical links, which link previews need |
| `privacyLastUpdated` | ISO date (`2026-10-06`) shown as the policy’s effective / last-updated date. Change it whenever the policy text changes |
| `androidPackage`, `gameName`, `tagline`, `copyrightYear` | As named |

`npm run build` warns while `developerName` or `contactEmail` are unset, and the policy highlights them in red.

**Keep the policy true.** It describes what the app does today (AdMob + UMP, Firebase Analytics / Crashlytics / Remote Config, Play Games sign-in, leaderboards, achievements and Saved Games, Play Billing, Play in-app updates and review, Shorebird code push, local notifications, and the manifest permissions). If the game adds an SDK, a permission or a data flow, update `src/pages/Privacy.tsx` (and the Play Data safety form) before shipping that version.

Game facts on the landing page (letter values, Glyphs, Boss Blinds, length bonuses) are mirrored in [`src/content/game.ts`](src/content/game.ts) from the game’s `lib/core/`. Keep them in sync when the game changes.

## Assets

`public/` holds copies of the game’s real art, generated from the game repo:

```bash
npm run assets                         # = python3 scripts/make-assets.py ../LexiconRogue
```

It copies the Alegreya fonts + `OFL.txt`, makes the favicon / apple-touch / header icons from `assets/icon/icon.png` and `store/icon_512.png`, uses `store/feature_graphic.png` as the social image (`og-image.png`), copies the 27 Glyph SVGs, and converts the store screenshots to AVIF + WebP (360 and 720 px wide) with a PNG fallback. Needs Python with Pillow ≥ 11.2. Re-run and commit when the game’s art changes. `src/content/demoWords.ts` (the demo’s word list, from the game’s ENABLE dictionary) is generated too; see the comment at its top.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173 and /privacy/
npm test          # Vitest + Testing Library
npm run lint      # oxlint
npm run build     # type-check, build, pre-render into dist/
npm run preview   # serve dist/ locally
```

The tests check that both pages render and pre-render, that the policy has every section (in order, with a table of contents), names every service and permission and links the contact email, that the scoring demo scores like the game, that no other games’ trademarks appear anywhere, and that nothing is loaded from another origin.

## app-ads.txt

`public/app-ads.txt` authorises Google AdMob (publisher `pub-4029439063083388`, the same account as Dig Deeper) to sell ads in the game. AdMob crawls it from the **root of the domain** set as the Developer website in the Play listing, so it only counts when this site (or another Little Fathom site with the same file) is served at a domain root, e.g. `https://littlefathom.com/app-ads.txt`. It is served at the root on Vercel, so it counts if this domain is the Developer website in the Play listing.

## Deploy

**Any static host.** Upload the contents of `dist/` (Netlify, Cloudflare Pages, S3, the studio’s web server…). Pages live at `/index.html` and `/privacy/index.html`, so no rewrite rules are needed. To serve from a sub-path, build with `BASE_PATH=/sub-path/ npm run build`.

**Vercel.** Import the repo in Vercel (framework preset **Vite**; build command `npm run build`; output directory `dist`). Pages are served at the domain root, so leave `BASE_PATH` unset. Then set `siteUrl` in `src/site.config.ts` to the final URL for rich link previews, and paste the privacy URL (above) into Play Console (**Policy → App content → Privacy policy**) and the AdMob privacy & messaging settings.

## Credits

- Alegreya by The Alegreya Project Authors (Huerta Tipográfica), SIL Open Font License 1.1 (`public/fonts/OFL.txt`)
- ENABLE word list (public domain); SCOWL common words
- List of Dirty, Naughty, Obscene, and Otherwise Bad Words by Shutterstock, CC BY 4.0 (used by the game to mask share cards)
