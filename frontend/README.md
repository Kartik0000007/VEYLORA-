# VEYLORA - Frontend

A fully responsive, animated, static storefront built from the eleven Veylora design mockups in `../assets`.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Men's Archive | `men.html` |
| Women's Edit | `women.html` |
| Clothing Catalogue | `clothing.html` |
| Footwear Index | `footwear.html` |
| Accessories | `accessories.html` |
| 18 Aesthetic Moods | `aesthetics.html` |
| Trending Curiosities | `trending.html` |
| The Style Edit | `style-edit.html` |
| Search Results | `search.html` |
| Empty Search | `search-empty.html` |

## Preview

Open `frontend/index.html` directly, or serve the folder locally:

```bash
cd frontend
npx serve .
```

The site uses the Tailwind CDN and Google Fonts, so an internet connection is required for styling, fonts and the editorial imagery.

## Structure

```text
frontend/
  *.html                  generated pages
  assets/css/animations.css   motion layer + responsive refinements
  assets/js/main.js           shared interactions
  assets/js/tailwind-theme.js shared Tailwind design tokens
  assets/images/              local logo + favicon
  partials/                   shared head, masthead, overlays, footer
  scripts/generate-pages.mjs  rebuilds every page from /assets sources
```

## Included interactions

- Brand preloader and page-transition curtain
- Scroll progress, back-to-top and reveal-on-scroll cards
- Split-word hero headline animation
- Sticky header, mobile navigation drawer and focus handling
- Cursor light, card sheen and magnetic primary CTAs
- Search overlay with keyboard shortcut (`/` or `Ctrl/Cmd + K`)
- Expanded search results page driven by `?q=`
- Wishlist state with local persistence and toast feedback
- Mobile filter and refinement disclosure on catalogue pages
- Editorial filters, aesthetics mood filter/sort and quiz
- Amazon.in search links for every product discovery
- Reduced-motion support and responsive layouts from 320px to 1680px

## Rebuild pages

From the project root:

```bash
node frontend/scripts/generate-pages.mjs
```
