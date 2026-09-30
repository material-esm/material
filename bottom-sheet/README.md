# Bottom Sheet

Bottom sheets show secondary content anchored to the bottom of the screen. They can be modal (with a backdrop scrim) or standard (coplanar with the page).

## Import

```js
import 'material/bottom-sheet/bottom-sheet.js'
```

## Usage

### Modal Bottom Sheet

```html
<md-bottom-sheet id="sheet" headline="Share Sheet">
  <p>Select an option to share this content with friends.</p>
  <div slot="actions">
    <md-button color="text" onclick="document.querySelector('#sheet').close()">Cancel</md-button>
    <md-button color="filled" id="share-btn">Share</md-button>
  </div>
</md-bottom-sheet>

<md-button color="filled" onclick="document.querySelector('#sheet').show()"> Open Bottom Sheet </md-button>
```

Or within a Lit component:

```js
render() {
  return html`
    <md-bottom-sheet id="sheet" headline="Share Sheet">
      <p>Select an option to share this content with friends.</p>
      <div slot="actions">
        <md-button color="text" @click=${() => this.renderRoot.querySelector('#sheet').close()}>Cancel</md-button>
        <md-button color="filled" @click=${this.onShare}>Share</md-button>
      </div>
    </md-bottom-sheet>

    <md-button color="filled" @click=${() => this.renderRoot.querySelector('#sheet').show()}>
      Open Bottom Sheet
    </md-button>
  `
}
```

### Standard (Non-Modal) Bottom Sheet

Standard bottom sheets sit coplanar with the primary page content without a scrim, allowing users to interact with both the sheet and the underlying screen:

```html
<md-bottom-sheet id="standard-sheet" modal="false" headline="Now Playing">
  <p>Music player controls and playlist details.</p>
</md-bottom-sheet>
```

### Drag Handle & Swipe-to-Dismiss

Bottom sheets include a Material 3 drag handle indicator by default and support interactive swipe-down gestures on touch and mouse pointers. Dragging past the threshold or flicking downward smoothly closes the sheet.

To hide the drag handle:

```html
<md-bottom-sheet has-drag-handle="false">
  <p>Content without top drag handle.</p>
</md-bottom-sheet>
```

---

## API Reference

### Properties & Attributes

| Property        | Attribute         | Type      | Default | Description                                                                                             |
| --------------- | ----------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `open`          | `open`            | `boolean` | `false` | Whether the bottom sheet is currently open.                                                             |
| `modal`         | `modal`           | `boolean` | `true`  | When `true`, presents as a modal sheet with backdrop scrim. When `false`, presents as a standard sheet. |
| `hasDragHandle` | `has-drag-handle` | `boolean` | `true`  | Whether to show the top drag handle indicator.                                                          |
| `headline`      | `headline`        | `string`  | `''`    | Text displayed in the header title area.                                                                |
| `fullWidth`     | `full-width`      | `boolean` | `false` | When `true`, spans 100% width on all screen sizes (bypasses 640px max width).                           |
| `quick`         | `quick`           | `boolean` | `false` | Disables open and close animations.                                                                     |

### Methods

| Method                | Returns         | Description                                                                               |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `show()`              | `Promise<void>` | Opens the bottom sheet. Resolves after the opening animation completes (`opened` event).  |
| `close(returnValue?)` | `Promise<void>` | Closes the bottom sheet. Resolves after the closing animation completes (`closed` event). |

### Events

| Event    | Cancelable | Description                                                                         |
| -------- | ---------- | ----------------------------------------------------------------------------------- |
| `open`   | Yes        | Dispatched when the bottom sheet starts opening.                                    |
| `opened` | No         | Dispatched when the bottom sheet finishes opening.                                  |
| `close`  | Yes        | Dispatched when the bottom sheet starts closing.                                    |
| `closed` | No         | Dispatched when the bottom sheet finishes closing.                                  |
| `cancel` | Yes        | Dispatched when dismissed by the user (scrim click, swipe-down gesture, or Escape). |

### Slots

| Slot          | Description                                      |
| ------------- | ------------------------------------------------ |
| _(default)_   | The primary scrollable content inside the sheet. |
| `headline`    | Custom header/title markup.                      |
| `actions`     | Action buttons at the bottom of the sheet.       |
| `drag-handle` | Custom drag handle replacement.                  |

### CSS Custom Properties

| Custom Property                         | Default                                              | Description                           |
| --------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| `--md-bottom-sheet-container-color`     | `var(--md-sys-color-surface-container-low, #f7f2fa)` | Sheet background container color      |
| `--md-bottom-sheet-container-shape-top` | `var(--md-sys-shape-corner-extra-large, 28px)`       | Top corner radii                      |
| `--md-bottom-sheet-max-width`           | `640px`                                              | Maximum sheet width on wide viewports |
| `--md-bottom-sheet-max-height`          | `calc(100vh - 72px)`                                 | Maximum sheet height before scrolling |
| `--md-bottom-sheet-drag-handle-color`   | `var(--md-sys-color-on-surface-variant, #49454f)`    | Color of the drag handle pill         |
| `--md-bottom-sheet-scrim-color`         | `var(--md-sys-color-scrim, #000)`                    | Backdrop scrim color (modal only)     |
| `--md-bottom-sheet-z-index`             | `1000`                                               | Stacking order z-index                |
