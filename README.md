# Shreya Sinha — Portfolio

Plain HTML, CSS and JavaScript — no framework, no build step. Live at
https://uxusercentereddesign-commits.github.io/portfolio/

## Structure

```
index.html                  the portfolio: garden landing screen + full portfolio
marketing-dashboard.html    case study: Unified Marketing Dashboard for Kylas CRM
                            (more case studies sit next to it, e.g. map-view.html)

css/
  fonts.css                 self-hosted fonts, shared by every page
  portfolio.css             portfolio styles (tokens at the top, then one block per component)
  case-study.css            case study styles (same warm palette as the portfolio)

js/
  portfolio/                portfolio logic, one class per file, each extending the one before:
    portfolio.js              project-row previews, side nav, After Hours carousel, copy email, artwork helper
    click-flowers.js          flowers that pop up where you click
    garden-scene.js           scene geometry, depth, "can't plant here" rules
    garden-home.js            placing, dragging and removing your home
    garden-plants.js          planting, sketching, bloom mode
    garden-life.js            sheep + kids, picnic, birds, butterflies, oranges
    app.js                    starts everything; garden buttons, time of day, scroll walk, garden ↔ portfolio switch
  case-study.js             case study: back link, carousels, before/after slider, side nav

fonts/                      Fraunces (headings), DM Sans (text), IBM Plex Mono (side nav)
images/
  portfolio/                portfolio pictures: photos, project covers, After Hours, paper grain
  marketing-dashboard/      case study screenshots
    full/                   high-res copies the zoom viewer opens
```

Class chain in `js/portfolio/` (the script tags at the bottom of `index.html` load them in this order):
`Portfolio → ClickFlowers → GardenScene → GardenHome → GardenPlants → GardenLife → Component`

## How the pages fit together
- The portfolio's project cards open a case study in a new tab. The garden panel's rows add `?from=garden`.
- A case study's "back to portfolio" link returns to where it was opened from: `index.html#garden` (the garden)
  or `index.html#work` (the portfolio at Projects), behind a soft fade.
- Markup lives in the HTML (cards, side nav, walk signs, garden artwork `<template>`s); JS only positions things
  and flips `data-*` attributes; looks and colours live in CSS.

## Run locally
Use a local server (not double-click), e.g.:

    npx live-server        or        python3 -m http.server

## Publish
Commit and push to `main`; GitHub Pages updates the live site within a minute.
