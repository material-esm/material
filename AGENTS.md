# Material ESM Agent & Architecture Guidelines

This repository (`material-esm/material`) ships **unbundled native ES modules** loaded directly by browsers (e.g. via jsDelivr + `<script type="importmap">`) with no build step.

## No 1,000-Line File Limit

- **Do NOT apply a 1,000-line file size limit in this repository.**
- Because there is no bundler, splitting a component into single-consumer `*-styles.js`, `*-helpers.js`, or internal sub-modules adds extra HTTP requests and sequential ESM import waterfall hops for every browser load.
- **Co-locate** component CSS (`static styles = css\`...\``) and single-consumer helpers, animations, controllers, and validators directly in the component file, even if the file exceeds 1,000 lines.
- Only extract code into a shared module when it is genuinely reused across multiple independent components.

## Network & Runtime Performance Standards

- **Lazy-load heavy optional sub-components**: Use dynamic `import()` for heavy sub-components that are only needed for specific variants or interactions (for example, `pickers/datetime-picker-dialog.js` and `buttons/icon-button.js` in `text/text-field.js` when `type` is `date`/`time`/`datetime-local`, or `search/search.js` in `app/bar.js` when `type="search"`).
- **Minimize `lit/*` submodule imports**: Each `lit/...` subpath import is a separate CDN request. Never import `lit/decorators.js` (this repo uses plain JS `static properties` without transpiled decorators) and avoid trivial single-use directives like `lit/directives/when.js` when a ternary expression suffices.
- **No dead imports or broken sourceMap comments**: Remove unused imports and do not leave `//# sourceMappingURL=...` comments pointing to nonexistent `.js.map` files.
- **Pause off-screen animations**: Components with continuous `requestAnimationFrame` loops (such as `md-loading` and wavy `md-progress`) should pause when off-screen using `contentvisibilityautostatechange` (with an `IntersectionObserver` fallback) and avoid calling `window.matchMedia` or allocating arrays per frame inside rAF loops.
