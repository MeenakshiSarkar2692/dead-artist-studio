# Dead Artist Studio

An independent apparel label website built as a static site — dark, editorial, and built with intent.

## What's inside

- **Hero** — Full-viewport parallax room with a model carousel (P1–P8) overlaid as a picture-on-picture, with left/right navigation
- **Locker Room** — Click "Open the Lockers" or "Collection" to open a full-screen locker wall popup. Three labelled lockers (T-Shirts, Shirts, Hoodies) are marked with sticky notes. Clicking a locker reveals the category clothing photo with a door-swing animation
- **About** — Full-screen slide-in panel with identity block, bio, stats, and links
- **Contact** — Slide-in panel with Email, Phone, Instagram, LinkedIn, and Behance links
- **Footer** — Brand info and quick nav links

## Stack

- Pure HTML / CSS / JavaScript — no frameworks, no build step
- Google Fonts: Anton, Azeret Mono, IBM Plex Mono, Oswald
- Impact (system font) for brand name
- SVG favicon (skull icon)

## File structure

```
/
├── index.html        # Main page
├── styles.css        # All styles
├── script.js         # Parallax, locker modals, model carousel, about/contact
├── favicon.svg       # Skull icon
└── img/
    ├── studio-room.png       # Hero background
    ├── lockers-wall.png      # Locker room popup background
    ├── locker-shirts.png     # T-Shirts reveal photo
    ├── locker-archive.png    # Shirts reveal photo
    ├── locker-hoodies.png    # Hoodies reveal photo
    ├── P1.png – P8.png       # Model cutout PNGs (transparent)
    └── REFFERECE.png         # Design reference
```

## Running locally

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Customise

- Replace placeholder text in `index.html` (About bio, Contact links, name, location)
- Swap model images (`img/P1.png` – `img/P8.png`) with your own transparent PNGs
- Update locker category images in `img/` and adjust `data-img` attributes on the locker buttons
