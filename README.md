# Dead Artist Studio

An independent apparel label website — dark, editorial, built with intent.

Live: **https://meenakshisarkar2692.github.io/dead-artist-studio/**

## Features

- **Hero** — Full-viewport parallax room with mouse/gyroscope look-around effect
- **Model carousel** — 8 model cutouts (P1–P8) overlaid as picture-in-picture; navigate by clicking the 8 vertical pip indicators at the bottom centre, or by scrolling/swiping on the hero
- **Helmet overlay** — Clickable helmet image sits over the hero room and links out to the Champions '26 Collection on Behance; shows a `[VIEW COLLECTION]` label on hover
- **Hold-to-scroll** — Ring indicator at bottom-right; hold for 1.2s to scroll to the footer. Normal page scroll is blocked on the hero — scroll instead cycles through model photos
- **Custom skull cursor** — Desktop only (`pointer:fine` devices); scales on hover
- **Locker Room** — Full-screen popup with three labelled lockers (T-Shirts, Shirts, Hoodies). Click "Open the Lockers" or "Collection" to open
- **Flying cards** — Opening a locker bursts 8 draggable cream cards across the screen; cards can be picked up and moved around
- **Locker reveal** — Door-swing animation reveals the category clothing photo (4:3 crop, object-fit cover, per-locker positioning)
- **About** — Full-screen slide-in panel with identity block, bio, stats, and links
- **Contact / Footer** — Slide-in panel with Email, Phone, Instagram, LinkedIn, Behance

## Stack

- Pure HTML / CSS / JavaScript — no frameworks, no build step
- Google Fonts: Anton, Azeret Mono, IBM Plex Mono, Oswald
- Impact (system font) for brand name
- SVG favicon (skull icon)
- GitHub Pages for hosting

## File structure

```
/
├── index.html
├── favicon.svg
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js
│   └── img/
│       ├── studio/
│       │   ├── studio-room.png          # Hero background
│       │   ├── lockers-wall.png         # Locker room popup background
│       │   ├── locker-archive.webp      # T-Shirts reveal photo
│       │   ├── locker-shirts.webp       # Shirts reveal photo
│       │   └── locker-hoodies.webp      # Hoodies reveal photo
│       └── models/
│           ├── P1.webp – P8.webp        # Model cutout WebPs (transparent)
│           └── HELMET.png               # Helmet overlay for hero section
```

## Running locally

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Branches

- `master` — production branch (GitHub Pages serves from here)
- `deadlydhuti` — feature branch; scroll model navigation + helmet overlay
- `dhuti` — kept in sync with master
