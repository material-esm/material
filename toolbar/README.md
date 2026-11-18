# Toolbars (`md-toolbar`)

Toolbars display frequently used, contextual actions relevant to the current page, implementing the [Material Design 3 Expressive Toolbars specification](https://m3.material.io/components/toolbars/overview) (officially replacing legacy M3 Bottom App Bars).

- **Floating Toolbar** (`type="floating"`, default): Pill-shaped (`9999px` radius) `64px` container with `elevation 3`, `4px` item gap, `8px`–`12px` inline/block padding, and `16px` screen-edge offsets when anchored (`position="bottom" | "top" | "start" | "end"`). Supports **horizontal** (`64px` tall) and **vertical** (`64px` wide) orientations.
- **Docked Toolbar** (`type="docked"`): Full-width bottom-anchored `64px` bar (`+ env(safe-area-inset-bottom)`) with `0px` corner radius, `16px` inline padding, flexible `8px`–`32px` item distribution, and `elevation 2` / `surface-container` styling. Docked toolbars are always horizontal.
- **Standard & Vibrant Color Schemes** (`color="standard" | "vibrant"`): Cascades M3 Expressive surface or `primary-container` tokens to slotted `<md-icon-button>` and `<md-button>` controls automatically.
- **Paired Adjacent FAB** (`slot="fab"`): Places a primary `<md-fab>` outside the floating toolbar pill with an `8px` gap (`end` in horizontal, `bottom` in vertical).
- **Scroll Hide & Collapse** (`scroll-behavior="none" | "hide" | "collapse"`): Automatically hides or collapses the toolbar on scroll down and reveals it on scroll up.
- **Accessible Roving Tabindex**: Exposes `role="toolbar"`, `aria-orientation`, `aria-label`, and WAI-ARIA single-tab-stop arrow-key navigation (`ArrowRight`/`ArrowLeft` flipping automatically in RTL, `ArrowDown`/`ArrowUp` when vertical, `Home`/`End`).

## Import

```js
import 'material/toolbar/toolbar.js'
// Or via app convenience alias:
import 'material/app/toolbar.js'
```

## Usage

### 1. Floating Horizontal Toolbar (Standard & Vibrant)

```html
<!-- Standard Floating Toolbar -->
<md-toolbar aria-label="Text formatting">
  <md-icon-button toggle selected aria-label="Bold"><md-icon>format_bold</md-icon></md-icon-button>
  <md-icon-button toggle aria-label="Italic"><md-icon>format_italic</md-icon></md-icon-button>
  <md-icon-button toggle aria-label="Underline"><md-icon>format_underlined</md-icon></md-icon-button>
  <span role="separator" aria-orientation="vertical"></span>
  <md-icon-button aria-label="Link"><md-icon>link</md-icon></md-icon-button>
  <md-icon-button aria-label="More formatting"><md-icon>more_vert</md-icon></md-icon-button>
</md-toolbar>

<!-- Vibrant Floating Toolbar -->
<md-toolbar color="vibrant" aria-label="Media actions">
  <md-icon-button aria-label="Edit"><md-icon>edit</md-icon></md-icon-button>
  <md-icon-button toggle selected aria-label="Favorite"><md-icon>favorite</md-icon></md-icon-button>
  <md-icon-button aria-label="Share"><md-icon>share</md-icon></md-icon-button>
  <md-button color="filled"><md-icon slot="icon">send</md-icon>Send</md-button>
</md-toolbar>
```

### 2. Floating Vertical Toolbar

```html
<md-toolbar orientation="vertical" aria-label="Canvas tools">
  <md-icon-button toggle selected aria-label="Select"><md-icon>near_me</md-icon></md-icon-button>
  <md-icon-button toggle aria-label="Brush"><md-icon>brush</md-icon></md-icon-button>
  <md-icon-button toggle aria-label="Shapes"><md-icon>category</md-icon></md-icon-button>
  <md-icon-button aria-label="Undo"><md-icon>undo</md-icon></md-icon-button>
</md-toolbar>
```

### 3. Floating Toolbar Paired with Adjacent FAB (`slot="fab"`)

Per M3 Expressive guidelines, pair a floating toolbar with a standard or medium `<md-fab>` (avoid pairing with an Extended FAB) to emphasize the single highest-priority screen action alongside contextual controls:

```html
<md-toolbar color="vibrant" aria-label="Document actions">
  <md-icon-button aria-label="Undo"><md-icon>undo</md-icon></md-icon-button>
  <md-icon-button aria-label="Redo"><md-icon>redo</md-icon></md-icon-button>
  <md-icon-button aria-label="Comment"><md-icon>comment</md-icon></md-icon-button>
  <md-icon-button aria-label="Share"><md-icon>share</md-icon></md-icon-button>
  <md-fab slot="fab" variant="primary" aria-label="Compose">
    <md-icon slot="icon">add</md-icon>
  </md-fab>
</md-toolbar>
```

### 4. Docked Toolbar (Replaces Bottom App Bar)

```html
<md-toolbar type="docked" position="bottom" aria-label="Page actions">
  <md-icon-button aria-label="Back"><md-icon>arrow_back</md-icon></md-icon-button>
  <md-icon-button aria-label="Bookmark" toggle><md-icon>bookmark</md-icon></md-icon-button>
  <md-icon-button aria-label="Share"><md-icon>share</md-icon></md-icon-button>
  <md-button color="filled"><md-icon slot="icon">add</md-icon>Create</md-button>
</md-toolbar>
```

### 5. Scroll Hide & Collapse Behavior

Attach `scroll-behavior="hide"` (slides off-screen on scroll down) or `scroll-behavior="collapse"` (collapses the floating pill into its paired `slot="fab"` on scroll down and expands on scroll up):

```html
<div id="feed-scroller" style="height: 400px; overflow-y: auto; position: relative;">
  <div style="height: 1200px;">Scrollable content...</div>

  <md-toolbar
    position="bottom"
    contained
    scroll-behavior="collapse"
    scroll-target="#feed-scroller"
    aria-label="Feed actions">
    <md-icon-button aria-label="Filter"><md-icon>filter_list</md-icon></md-icon-button>
    <md-icon-button aria-label="Search"><md-icon>search</md-icon></md-icon-button>
    <md-icon-button aria-label="Sort"><md-icon>sort</md-icon></md-icon-button>
    <md-fab slot="fab" variant="primary" aria-label="New post">
      <md-icon slot="icon">edit</md-icon>
    </md-fab>
  </md-toolbar>
</div>
```

---

## API Reference

### Properties & Attributes

| Property          | Attribute          | Type      | Default        | Description                                                                                                |
| ----------------- | ------------------ | --------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| `type`            | `type`             | `string`  | `'floating'`   | Toolbar layout variant: `'floating'` or `'docked'`.                                                        |
| `variant`         | `variant`          | `string`  | `''`           | Optional alias for `type` (`'floating'`, `'docked'`) or `color` (`'standard'`, `'vibrant'`).               |
| `orientation`     | `orientation`      | `string`  | `'horizontal'` | Layout axis: `'horizontal'` or `'vertical'`. Docked toolbars are always `'horizontal'`.                    |
| `color`           | `color`            | `string`  | `'standard'`   | M3 Expressive color mapping: `'standard'` or `'vibrant'`.                                                  |
| `position`        | `position`         | `string`  | `'static'`     | Screen-edge anchor: `'static'` (in-flow), `'bottom'`, `'top'`, `'start'`, or `'end'`.                      |
| `fabPosition`     | `fab-position`     | `string`  | `'end'`        | Placement of `slot="fab"` relative to the toolbar: `'end'` (trailing/bottom) or `'start'` (leading/top).   |
| `contained`       | `contained`        | `boolean` | `false`        | Uses `position: absolute` instead of `position: fixed` when anchored inside a relative container.          |
| `label`           | `label`            | `string`  | `''`           | Fallback accessible label for the inner `role="toolbar"` when `aria-label` is not set on `<md-toolbar>`.   |
| `scrollBehavior`  | `scroll-behavior`  | `string`  | `'none'`       | Scroll response: `'none'`, `'hide'` (slides off-screen), or `'collapse'` (collapses pill into paired FAB). |
| `scrollTarget`    | `scroll-target`    | `string`  | `'window'`     | `'window'` or CSS selector for the scrollable element to observe.                                          |
| `scrollThreshold` | `scroll-threshold` | `number`  | `8`            | Minimum scroll delta in pixels required before toggling `hiddenBar` or `collapsed`.                        |
| `hiddenBar`       | `hidden-bar`       | `boolean` | `false`        | Reflected boolean indicating whether the toolbar is currently hidden off-screen.                           |
| `collapsed`       | `collapsed`        | `boolean` | `false`        | Reflected boolean indicating whether the toolbar is currently collapsed.                                   |

### Methods

| Method              | Returns         | Description                                                                               |
| ------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `show()`            | `void`          | Reveals the toolbar (`hiddenBar = false`, `collapsed = false`).                           |
| `hide()`            | `void`          | Hides the toolbar off-screen (`hiddenBar = true`).                                        |
| `collapse()`        | `void`          | Collapses the toolbar (`collapsed = true`), leaving any paired `slot="fab"` visible.      |
| `expand()`          | `void`          | Expands a collapsed toolbar (`collapsed = false`).                                        |
| `getToolbarItems()` | `HTMLElement[]` | Returns ordered focusable toolbar controls participating in roving `tabindex` navigation. |

### Events

| Event                 | Detail                                                          | Description                                                          |
| --------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| `scroll-state-change` | `{ hiddenBar: boolean, collapsed: boolean, scrollTop: number }` | Dispatched whenever scroll behavior toggles `hiddenBar`/`collapsed`. |

### Slots

| Slot        | Description                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| _(default)_ | Primary contextual action controls (`<md-icon-button>`, `<md-button>`, `<span role="separator">`). |
| `leading`   | Optional leading action(s) placed at the start of the toolbar.                                     |
| `trailing`  | Optional trailing action(s) placed at the end of the toolbar.                                      |
| `fab`       | Adjacent `<md-fab>` rendered outside the toolbar pill with an `8px` gap.                           |

### CSS Shadow Parts

| Part        | Description                               |
| ----------- | ----------------------------------------- |
| `container` | Inner `role="toolbar"` surface element.   |
| `elevation` | Internal `<md-elevation>` shadow element. |
| `leading`   | Wrapper around `slot="leading"`.          |
| `items`     | Wrapper around the default items slot.    |
| `trailing`  | Wrapper around `slot="trailing"`.         |
| `fab`       | Wrapper around the adjacent `slot="fab"`. |

### CSS Custom Properties

| Property                              | Default                                                              | Description                                                                      |
| ------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `--md-toolbar-container-color`        | `surface-container-high` / `surface-container` / `primary-container` | Background color of the toolbar container.                                       |
| `--md-toolbar-container-height`       | `64px`                                                               | Height of horizontal floating and docked toolbars.                               |
| `--md-toolbar-container-width`        | `64px`                                                               | Width of vertical floating toolbars.                                             |
| `--md-toolbar-container-shape`        | `9999px` (floating) / `0px` (docked)                                 | Border radius of the toolbar surface.                                            |
| `--md-toolbar-container-elevation`    | `3` (floating) / `2` (docked)                                        | Material elevation level (`0`–`5`).                                              |
| `--md-toolbar-icon-color`             | `on-surface-variant` / `on-primary-container`                        | Unselected icon and text color cascaded to slotted controls.                     |
| `--md-toolbar-active-container-color` | `secondary-container` / `primary`                                    | Background color of selected/active toggle controls.                             |
| `--md-toolbar-active-icon-color`      | `on-secondary-container` / `on-primary`                              | Icon/text color of selected/active toggle controls.                              |
| `--md-toolbar-inline-padding`         | `12px` (floating) / `16px` (docked)                                  | Inline start/end padding of the toolbar surface.                                 |
| `--md-toolbar-block-padding`          | `8px` (horizontal) / `12px` (vertical) / `0px` (docked)              | Block top/bottom padding of the toolbar surface.                                 |
| `--md-toolbar-item-gap`               | `4px` (floating) / `clamp(8px, 3vw, 32px)` (docked)                  | Spacing between toolbar items.                                                   |
| `--md-toolbar-fab-gap`                | `8px`                                                                | Gap between the toolbar and a paired `slot="fab"`.                               |
| `--md-toolbar-edge-offset`            | `16px`                                                               | Screen-edge offset margin for positioned floating toolbars.                      |
| `--md-toolbar-z-index`                | `100`                                                                | `z-index` applied when `position` is `'bottom'`, `'top'`, `'start'`, or `'end'`. |
| `--md-toolbar-positioning`            | `fixed` (`absolute` when `contained`)                                | CSS `position` mode for anchored toolbars.                                       |
