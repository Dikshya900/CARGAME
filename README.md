# Neo Highway Rush

A high-graphics, smooth browser car game built with **React** and **Three.js** on the client side only (no backend, no database).

## What was built

- 3D neon highway scene rendered with Three.js
- Smooth lane-switching car controls
- Animated starfield and lighting for high visual quality
- Procedural obstacle traffic with collision detection
- Live score + best score tracking
- Restart loop on crash

## Controls

- `←` / `→`
- `A` / `D`
- `Space` to restart after crash

## Run locally

Because this app uses browser ES modules, run a static server from the repository root:

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

## Test

```bash
node --test tests/gameLogic.test.mjs
```

## Deploy

Deployment is configured via GitHub Actions (`.github/workflows/deploy.yml`) for **GitHub Pages**.

1. Push the repo to GitHub
2. In **Settings → Pages**, set source to **GitHub Actions**
3. Push to `main`
