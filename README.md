# World Hopper

A cooperative family quest game — explore a new world in every chapter.

Built with React 19, Vite, Phaser, and Tailwind. Hosted for free on GitHub Pages.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/, includes a 404.html SPA fallback for GitHub Pages
npm run preview
```

## Tests

```bash
npm test          # unit tests (vitest)
npm run test:e2e  # end-to-end tests (playwright)
```

## Deployment

Pushing to `main` runs [.github/workflows/pages.yml](.github/workflows/pages.yml), which builds
the app and publishes `dist/` to GitHub Pages. Enable Pages once under
**Settings → Pages → Source: GitHub Actions**.
