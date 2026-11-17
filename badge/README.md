# Badge

[Material Design 3 Badges](https://m3.material.io/components/badges/overview).

Badges show notifications, counts, or status information on icon buttons, tabs, and navigation items.

## Import

```js
import 'material/badge/badge.js'
```

## Usage with Components (`slot="badge"`)

`<md-icon-button>`, `<md-tab>`, and `<md-nav-item>` all expose a `badge` slot so `<md-badge>` anchors automatically without wrapper elements:

```html
<!-- Icon buttons -->
<md-icon-button aria-label="5 unread notifications">
  <md-icon>notifications</md-icon>
  <md-badge slot="badge" value="5"></md-badge>
</md-icon-button>

<md-icon-button aria-label="Unread mail">
  <md-icon>mail</md-icon>
  <md-badge slot="badge"></md-badge>
</md-icon-button>

<!-- Tabs -->
<md-tab type="primary">
  <md-icon slot="icon">photo</md-icon>
  Photos
  <md-badge slot="badge" value="3"></md-badge>
</md-tab>

<!-- Navigation items -->
<md-nav-item label="Cart">
  <md-icon slot="active-icon">shopping_cart</md-icon>
  <md-icon slot="inactive-icon">shopping_cart</md-icon>
  <md-badge slot="badge" value="99+"></md-badge>
</md-nav-item>
```

## Standalone Usage

By default (`:not([inline])`), `<md-badge>` is `position: absolute` with `pointer-events: none` and M3 `50%` center-anchored offsets tuned for a centered `24px` icon (`6dp × 6dp` overlap for small dot badges, `14dp × 12dp` overlap for large count badges):

```html
<!-- Small dot badge on a standalone icon -->
<span style="position: relative; display: inline-flex;">
  <md-icon>notifications</md-icon>
  <md-badge></md-badge>
</span>

<!-- Large badge (max 4 characters recommended, e.g. "999+") -->
<span style="position: relative; display: inline-flex;">
  <md-icon>shopping_cart</md-icon>
  <md-badge value="3"></md-badge>
</span>

<!-- Inline badge (flows naturally in text/flex layouts) -->
<md-badge inline value="12"></md-badge>
```

## Properties

| Property | Attribute | Type      | Default | Description                                                         |
| -------- | --------- | --------- | ------- | ------------------------------------------------------------------- |
| `value`  | `value`   | `string`  | `''`    | Label text for a large badge (omit or empty for a `6px` dot badge). |
| `inline` | `inline`  | `boolean` | `false` | Renders `position: static` in normal inline/flex flow when `true`.  |

## CSS Custom Properties

| Token                                     | Default                                           | Description                                   |
| ----------------------------------------- | ------------------------------------------------- | --------------------------------------------- |
| `--md-badge-color`                        | `var(--md-sys-color-error, #b3261e)`              | Small dot badge container color.              |
| `--md-badge-size`                         | `6px`                                             | Small dot badge diameter.                     |
| `--md-badge-shape`                        | `var(--md-sys-shape-corner-full, 9999px)`         | Small dot badge corner radius.                |
| `--md-badge-large-color`                  | `var(--md-sys-color-error, #b3261e)`              | Large badge container color.                  |
| `--md-badge-large-size`                   | `16px`                                            | Large badge height and minimum width.         |
| `--md-badge-large-shape`                  | `var(--md-sys-shape-corner-full, 9999px)`         | Large badge corner radius.                    |
| `--md-badge-large-label-text-color`       | `var(--md-sys-color-on-error, #fff)`              | Large badge label text color.                 |
| `--md-badge-large-label-text-font`        | `var(--md-sys-typescale-label-small-font)`        | Large badge font family.                      |
| `--md-badge-large-label-text-size`        | `var(--md-sys-typescale-label-small-size)`        | Large badge font size (`0.6875rem` / `11px`). |
| `--md-badge-large-label-text-line-height` | `var(--md-sys-typescale-label-small-line-height)` | Large badge line height (`1rem` / `16px`).    |
| `--md-badge-large-label-text-tracking`    | `var(--md-sys-typescale-label-small-tracking)`    | Large badge letter spacing (`0.03125rem`).    |
| `--md-badge-large-label-text-weight`      | `var(--md-sys-typescale-label-small-weight)`      | Large badge font weight (`500`).              |
| `--md-badge-anchor-size`                  | `24px`                                            | Size of the centered anchor icon for offsets. |
