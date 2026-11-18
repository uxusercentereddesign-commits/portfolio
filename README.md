# Shreya Sinha — Portfolio

Plain HTML, CSS and JavaScript — no framework, no build step.

## Structure
- `Portfolio.html` — portfolio page markup. The project rows and cards are written straight in the HTML (edit them there). The scroll walk (a sign, bush and grass beside each section) is written out at the top of the file; JS only positions each stop next to its section. The side nav, hover preview, cursor hint and fade screen are written out at the bottom of the file; JS only moves them, fills in text and flips `data-*` attributes. Below them, `<template>`s hold the garden artwork JS copies and animates (the house, bird, butterfly, fish, horses and picnic people); the colours that differ between copies are in `style.css`.
- `index.html` — Unified Marketing Dashboard case study
- `css/style.css` — page styles (design tokens at the top, then one block per component, BEM-lite class names). Hovers and the panel width are plain CSS; JS only flips `data-*` attributes or `hidden`.
- `css/fonts.css` + `fonts/` — self-hosted fonts: Fraunces (headings, italic notes, the garden-in-bloom button), IBM Plex Mono (the side nav) and DM Sans (everything else)
- `js/parts/` — feature logic, one class per file, each extending the one before:
  - `portfolio.js` — project-row hover previews, side nav, After Hours carousel, copy email
  - `click-flowers.js` — flowers that pop up where you click
  - `garden-scene.js` — scene geometry, depth, "can't plant here" rules
  - `garden-home.js` — placing your home
  - `garden-plants.js` — planting, sketching, lush mode
  - `garden-life.js` — sheep + kids, picnic, birds, butterflies, oranges
- `js/app.js` — starts everything (`start()`), the garden's buttons (`setupGarden()`), time of day, the scroll walk, and the garden ↔ portfolio switch
- `assets/` — images

Every button is wired the plain way: find the element with `document.querySelector`, then `addEventListener('click', …)`, then change the page directly.

Class chain (script order at the bottom of `Portfolio.html` must match):
`Portfolio → ClickFlowers → GardenScene → GardenHome → GardenPlants → GardenLife → Component`

## Run locally
Use a local server (not double-click), e.g.:
    npx serve .        or        python3 -m http.server
