# CardShare — Your cards. Your circle.

A 44-second portrait product film using the actual app screenshots supplied in `WhatsApp Unknown 2026-11-03 at 2.57.33 AM.zip`. The original film is preserved under `reference/previous-*`.

## Watch

Open `output/CardShare — One Connection.html` directly in Chrome. Everything is embedded, including the screenshots and soundtrack. Press **Play** and **Sound off** to enable sound. No backend, login or internet connection is needed.

For development, in the VS Code terminal:

```text
cd C:\Users\29235\CardShare\promo
npm.cmd start
```

Open http://127.0.0.1:4173. Keep the terminal running. Space plays/pauses, arrow keys seek by half a second, and M toggles sound. If dependencies are missing on another machine, run `npm.cmd ci` first.

## Actual app artwork

All app imagery is copied byte-for-byte from the ZIP into `assets/app/01.jpg` through `16.jpg`. `assets/app/manifest.json` maps the original filenames to these files and records their SHA-256 hashes. `scripts/audit-sources.py` verifies the copies against the ZIP without changing them.

- Logo: exact crop from screenshot 01, placed on an extruded Three.js surface.
- Cardholder dashboard: 03 + 04, stitched at matching content positions.
- Requester dashboard: 05 + 06, stitched at matching content positions.
- Sidebar: original left-hand panel from 10 over the current dashboard.
- History: 13; the Daraz row opens the matching details from 16.
- Chat: 15, shown as a separate feature vignette. Its messages are not presented as newly sent or as part of the Daraz transaction.
- Savings and earnings: exact component crops from 13 and 14.
- Ending CTA: exact Get started button from 01.

The supplied files are screenshots, not an interactive app recording. Scrolling, tap indicators and transitions are choreographed from those existing pixels. No missing checkout screens, discount marketplace, transaction data, payment processing or message sending are invented. The Paid status and figures shown already appear in the supplied screenshots.

The files are 720×1600 compressed JPEGs. Full-HD export improves delivery resolution, but cannot recover detail absent from those sources. The film enlarges important UI areas and holds them steady. Source UI colors and text are preserved; brighter emerald lighting is applied to the surrounding composition.

## Edit structure

| Time | Scene | Motion |
|---|---|---|
| 0–4s | Original logo + splash-screen message | Lit 3D mark, masked line typography |
| 4–10s | Cardholder dashboard | Forward camera move; continuous content scroll |
| 10–16s | Requester dashboard | Tap role selector, scroll to shared card, subtle push-in |
| 16–20s | Menu → History | Taps on actual controls, sliding navigation |
| 20–27s | Daraz order | Tap matching history row, scroll proof and breakdown |
| 27–32s | Chat | Restrained camera turn into a separate feature vignette |
| 32–38s | Savings + earnings | Real history components lift out into the composition |
| 38–44s | Original logo + Get started | Surfaces converge, musical signature, steady final hold |

`src/main.js` owns the single GSAP clock and transport. `src/screens.js` composites source screenshot regions. `src/world.js` renders the original logo in 3D. `styles.css` controls the film frame and preview player. All motion uses the same explicit time; the film has no independent CSS animation clocks.

```text
npm.cmd run audio
npm.cmd run build
npm.cmd run check
npm.cmd run export -- --fps 60
```

See `EXPORT.md` for video settings and `SOUND.md` for the original score. Browser QA creates `output/qa/report.json`, keyframes and a contact sheet. `scripts/check-standalone.mjs` checks the embedded HTML offline, including sound playback. The frontend and backend are not modified by the promo.
