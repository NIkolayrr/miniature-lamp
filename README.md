# INNOSTAL React Concept

A Vite + React prototype for an INNOSTAL landing page with a fullscreen image hero, Motion-powered scroll reveals, and a scroll-driven light gauge steel assembly sequence.

## Preview

Install dependencies and start the Vite dev server:

```sh
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Structure

- `index.html` contains the Vite root element.
- `src/App.jsx` contains the React component tree, Motion reveal components, and scroll state.
- `src/styles.css` contains responsive layout, visual design, and scroll transitions.
- `assets/` contains the hero, production, and roof-truss visuals.
- `construction.png` contains six stacked construction stages. The assembly view displays the matching panel as you scroll, using Motion to transition between stages.

## Reference

The content model follows the existing INNOSTAL site, with motion direction inspired by the staged, scroll-led feel of Santioni Spirits.
