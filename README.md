# Neo Highway Rush

A high-graphics, smooth browser car game built with **React** + **Three.js** on the client side only (no backend, no database).

## Live URL (GitHub Pages)

After this repo is pushed to GitHub with Pages enabled, your game URL will be:

`https://<your-github-username>.github.io/CARGAME/`

## Play controls

- `←` / `→` to change lanes
- `A` / `D` to change lanes
- `Space` to restart after crash

## Steps to make it live (one-time setup)

1. Push this repository to GitHub.
2. Open **GitHub → Repository → Settings → Pages**.
3. In **Build and deployment**, set **Source = GitHub Actions**.
4. Push to `main` (or `master`).
5. Wait for workflow **Deploy Neo Highway Rush** to pass in the **Actions** tab.
6. Open: `https://<your-github-username>.github.io/CARGAME/`

## Local run

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Tests

```bash
node --test tests/gameLogic.test.mjs
```
