# Sheet (`md-sheet`)

Sheets show secondary or supplementary content anchored to the bottom or side of the screen, implementing both the [Material Design 3 Bottom Sheets](https://m3.material.io/components/bottom-sheets/overview) and [Material Design 3 Side Sheets](https://m3.material.io/components/side-sheets/overview) specifications.

- **Bottom Sheets** (`position="bottom"`, default): Slide up from the bottom edge with a drag handle pill, `28dp` top corners, `640dp` max width, and vertical swipe-to-dismiss.
- **Side Sheets** (`position="end" | "start" | "right" | "left"`): Slide in from the trailing or leading vertical edge (`400dp` max width) with a header close (`×`) button, optional back (`←`) navigation button, optional dividers, start-aligned footer actions, and `16dp` inner corners (modal) or a `1dp` `outline-variant` border (standard).
- **Modal & Standard Variants**: Both bottom and side sheets can be **modal** (elevated above a backdrop scrim) or **standard** (`modal="false"`, coplanar with primary page content).

## Import

```js
import 'material/sheet/sheet.js'
```

## Usage

### 1. Modal Bottom Sheet (Default)

```html
<md-sheet id="share-sheet" headline="Share">
  <p>Select an option to share this content with friends.</p>
  <div slot="actions">
    <md-button color="text" onclick="document.querySelector('#share-sheet').close('cancel')">Cancel</md-button>
    <md-button color="filled" onclick="document.querySelector('#share-sheet').close('share')">Share</md-button>
  </div>
</md-sheet>

<md-button color="filled" onclick="document.querySelector('#share-sheet').show()">Open Bottom Sheet</md-button>
```

### 2. Modal Side Sheet

Side sheets anchor to the trailing edge (`end` — right in LTR, left in RTL) or leading edge (`start`). Modal side sheets include a close button by default and support optional `divider` lines separating the header and bottom actions from scrolling content:

```html
<md-sheet id="filter-sheet" position="end" headline="Filters" divider>
  <p>Refine search results by category, date, or author.</p>
  <div slot="actions">
    <md-button color="filled" onclick="document.querySelector('#filter-sheet').close('save')">Save</md-button>
    <md-button color="outlined" onclick="document.querySelector('#filter-sheet').close('reset')">Reset</md-button>
  </div>
</md-sheet>

<md-button color="tonal" onclick="document.querySelector('#filter-sheet').show()">Open Side Sheet</md-button>
```

### 3. Standard (Coplanar) Side Sheet

Standard side sheets allow simultaneous interaction with both the sheet and the primary screen content without a scrim.

Use `modal="false"` for a viewport-docked non-modal side sheet, or add `inline` inside a flex/grid layout container so the sheet sits coplanar beside `<main>` and reflows primary content:

```html
<div style="display: flex; min-height: 100vh;">
  <main style="flex: 1; padding: 24px;">
    <md-button
      color="outlined"
      onclick="
      const s = document.querySelector('#inspector-sheet');
      s.open = !s.open;
    "
      >Toggle Inspector</md-button
    >
  </main>

  <md-sheet id="inspector-sheet" position="end" modal="false" inline headline="Details" divider>
    <p>Coplanar standard side sheet alongside main content.</p>
  </md-sheet>
</div>
```

### 4. Side Sheet Navigation (`has-back-button`) & Detached Floating Sheets (`detached`)

Enable `has-back-button` for multi-level flows within a side sheet, and `detached` to float the sheet `16dp` inset from the viewport edges with rounded corners on all four sides:

```html
<md-sheet id="settings-sheet" position="end" detached has-back-button headline="Notification Settings">
  <p>Configure channel preferences.</p>
</md-sheet>

<script type="module">
  document.querySelector('#settings-sheet').addEventListener('back', () => {
    // Navigate back to previous view inside the sheet
  })
</script>
```

### 5. Responsive Bottom-to-Side Adaptation

Because bottom and side sheets share `<md-sheet>`, a single element can adapt between a bottom sheet on compact screens and a side sheet on medium/expanded screens without remounting DOM or losing state:

```js
const mq = window.matchMedia('(min-width: 600px)')
const syncPosition = () => {
  sheet.position = mq.matches ? 'end' : 'bottom'
}
mq.addEventListener('change', syncPosition)
syncPosition()
```

---

## API Reference

### Properties & Attributes

| Property            | Attribute             | Type      | Default                          | Description                                                                                                           |
| ------------------- | --------------------- | --------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `open`              | `open`                | `boolean` | `false`                          | Whether the sheet is currently open.                                                                                  |
| `position`          | `position`            | `string`  | `'bottom'`                       | Edge to anchor to: `'bottom'`, `'end'` (or `'side'`), `'start'`, `'right'`, or `'left'`.                              |
| `modal`             | `modal`               | `boolean` | `true`                           | When `true`, displays as a modal sheet with backdrop scrim. When `false`, displays as a standard sheet without scrim. |
| `type`              | `type`                | `string`  | `''`                             | Optional variant alias (`'modal'` or `'standard'`).                                                                   |
| `inline`            | `inline`              | `boolean` | `false`                          | Places a standard side sheet in-flow (`position: sticky`) inside a flex/grid container so adjacent content reflows.   |
| `detached`          | `detached`            | `boolean` | `false`                          | Detaches the sheet from viewport edges with `16px` margins and rounded corners on all four sides.                     |
| `divider`           | `divider`             | `boolean` | `false`                          | Renders `<md-divider>` separators below the header and above the bottom actions bar.                                  |
| `headline`          | `headline`            | `string`  | `''`                             | Header title text.                                                                                                    |
| `hasDragHandle`     | `has-drag-handle`     | `boolean` | `true` (bottom) / `false` (side) | Whether to render the top drag handle pill. Defaults automatically by `position` unless explicitly set.               |
| `hasCloseButton`    | `has-close-button`    | `boolean` | `true` (side) / `false` (bottom) | Whether to render the header close (`×`) icon button. Defaults automatically by `position` unless explicitly set.     |
| `hasBackButton`     | `has-back-button`     | `boolean` | `false`                          | Renders a leading back (`←`) icon button in the header that dispatches `back` when clicked.                           |
| `closeLabel`        | `close-label`         | `string`  | `'Close'`                        | Accessible `aria-label` for the built-in close icon button.                                                           |
| `backLabel`         | `back-label`          | `string`  | `'Back'`                         | Accessible `aria-label` for the built-in back icon button.                                                            |
| `returnValue`       | —                     | `string`  | `''`                             | Return value set when closing the sheet (also supports `<form method="dialog">` submitters).                          |
| `preventScrimClose` | `prevent-scrim-close` | `boolean` | `false`                          | Prevents clicking the backdrop scrim from dismissing a modal sheet.                                                   |
| `fullWidth`         | `full-width`          | `boolean` | `false`                          | Bypasses max-width constraints (`640px` bottom / `400px` side) to span 100% width.                                    |
| `quick`             | `quick`               | `boolean` | `false`                          | Skips open and close transitions.                                                                                     |

### Methods

| Method                | Returns         | Description                                                                        |
| --------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `show()`              | `Promise<void>` | Opens the sheet. Resolves after the entrance animation completes (`opened` event). |
| `close(returnValue?)` | `Promise<void>` | Closes the sheet. Resolves after the exit animation completes (`closed` event).    |

### Events

| Event    | Cancelable | Detail                    | Description                                                              |
| -------- | ---------- | ------------------------- | ------------------------------------------------------------------------ |
| `open`   | Yes        | —                         | Dispatched before the sheet starts opening.                              |
| `opened` | No         | —                         | Dispatched after the sheet finishes opening.                             |
| `close`  | Yes        | `{ returnValue: string }` | Dispatched before the sheet starts closing.                              |
| `closed` | No         | `{ returnValue: string }` | Dispatched after the sheet finishes closing.                             |
| `cancel` | Yes        | —                         | Dispatched when dismissed via scrim click, swipe gesture, or Escape key. |
| `back`   | No         | —                         | Dispatched when the built-in header back button is clicked.              |

### Slots

| Slot           | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| _(default)_    | Primary scrollable content inside the sheet.                  |
| `headline`     | Custom header title markup.                                   |
| `actions`      | Footer action buttons (buttons directly or inside a `<div>`). |
| `drag-handle`  | Custom drag handle replacement.                               |
| `back-button`  | Custom leading back navigation control in the header.         |
| `close-button` | Custom trailing close control in the header.                  |

### CSS Shadow Parts

| Part          | Description                               |
| ------------- | ----------------------------------------- |
| `scrim`       | Modal backdrop scrim element.             |
| `sheet`       | Primary sheet surface container.          |
| `drag-handle` | Top drag handle wrapper.                  |
| `header`      | Header bar containing buttons & headline. |
| `headline`    | Headline title element.                   |
| `content`     | Scrollable body container.                |
| `actions`     | Bottom actions footer container.          |

### CSS Custom Properties

| Custom Property                | Default                                                                                                    | Description                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--md-sheet-container-color`   | `var(--md-sys-color-surface-container-low)` (modal/bottom) / `var(--md-sys-color-surface)` (standard side) | Sheet background color                      |
| `--md-sheet-container-shape`   | `28px` (bottom) / `16px` (side)                                                                            | Corner radius                               |
| `--md-sheet-outline-color`     | `var(--md-sys-color-outline-variant, #cac4d0)`                                                             | Standard side sheet separation border color |
| `--md-sheet-width`             | `100%` (`360px` when `inline`)                                                                             | Sheet width                                 |
| `--md-sheet-max-width`         | `640px` (bottom) / `400px` (side)                                                                          | Maximum sheet width                         |
| `--md-sheet-max-height`        | `calc(100svh - 72px)` (bottom) / `100%` (side)                                                             | Maximum sheet height                        |
| `--md-sheet-drag-handle-color` | `var(--md-sys-color-on-surface-variant, #49454f)`                                                          | Drag handle pill color                      |
| `--md-sheet-headline-color`    | `on-surface` (bottom) / `on-surface-variant` (side)                                                        | Header headline text color                  |
| `--md-sheet-icon-color`        | `var(--md-sys-color-on-surface-variant, #49454f)`                                                          | Header icon button color                    |
| `--md-sheet-actions-justify`   | `flex-end` (bottom) / `flex-start` (side)                                                                  | Horizontal alignment of footer actions      |
| `--md-sheet-scrim-color`       | `var(--md-sys-color-scrim, #000)`                                                                          | Modal backdrop scrim color                  |
| `--md-sheet-scrim-opacity`     | `0.32`                                                                                                     | Modal backdrop scrim opacity                |
| `--md-sheet-z-index`           | `1000`                                                                                                     | Stacking order z-index                      |
