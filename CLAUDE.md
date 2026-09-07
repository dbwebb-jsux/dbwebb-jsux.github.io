# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at localhost:4321
npm run build        # Build production site to ./dist/
npm run preview      # Preview production build locally
npm run astro check  # Type-check Astro files
```

## Architecture

This is an **Astro + Starlight** documentation site for the university course *JSUX (UX-design med JavaScript)* at BTH, published to GitHub Pages via the workflow in `.github/workflows/deploy.yml` on every push to `main`.

All content lives in `src/content/docs/` as `.mdx` files. Starlight routes files by path, so `src/content/docs/kmom/kmom01.mdx` is served at `/kmom/kmom01`. The sidebar order is hardcoded in `astro.config.mjs`.

Content is organized into three subdirectories:
- `kmom/` — the weekly course moments (kmom01–kmom06, kmom10), each embedding YouTube lectures via `astro-embed`
- `kunskap/` — knowledge articles (tutorials and guides referenced from course moments)
- `uppgifter/` — assignment specifications

The `<YouTube id="..." posterQuality="max" />` component (from `astro-embed`) is the standard way to embed videos. Import it at the top of any `.mdx` file: `import { YouTube } from 'astro-embed';`

Starlight components (`LinkCard`, `CardGrid`) are imported from `@astrojs/starlight/components` and used in `index.mdx` for the course overview grid.

Custom global styles go in `src/styles/custom.css`, referenced in `astro.config.mjs`. Static assets (images, favicons) go in `public/` or `src/assets/` — prefer `src/assets/` for images used inside Markdown so Astro can optimize them.

The content schema is defined in `src/content.config.ts` using Starlight's built-in `docsSchema`. Frontmatter for each page requires at minimum `title` and optionally `description`.

The course is taught in Swedish; all content files are written in Swedish.
