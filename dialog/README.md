# Dialog

Dialogs provide important prompts in a user flow. They can require an action, communicate information, or help users accomplish a task.

`<md-dialog>` is fully compliant with the [Material Design 3 Dialogs Specification](https://m3.material.io/components/dialogs/overview), supporting Level 3 elevation, standard 28dp rounded containers, M3 motion curves, scroll-dependent dividers, stacked actions, and alert/modal workflows.

## Import

```javascript
import 'material/dialog/dialog.js'
// or import the Dialog class:
import { Dialog } from 'material/dialog/dialog.js'
```

---

## Usage

### Basic Confirmation Dialog

```html
<md-dialog id="confirm-dialog">
  <div slot="headline">Delete item?</div>
  <div slot="content">This will permanently remove the selected file. This action cannot be undone.</div>
  <div slot="actions">
    <md-button color="text" onclick="document.getElementById('confirm-dialog').close('cancel')">Cancel</md-button>
    <md-button color="filled" onclick="document.getElementById('confirm-dialog').close('delete')">Delete</md-button>
  </div>
</md-dialog>

<md-button color="filled" onclick="document.getElementById('confirm-dialog').show()">Open Dialog</md-button>
```

### Programmatic Control

```javascript
const dialog = document.querySelector('md-dialog')

// Open the dialog (returns Promise resolving when open animation finishes)
await dialog.show()

// Close the dialog with an optional return value
await dialog.close('confirm')
console.log(dialog.returnValue) // 'confirm'
```

---

## Variants & Features

### 1. Alert Dialog (`type="alert"`)

Alert dialogs interrupt users with urgent, critical information. Following M3 guidelines, alert dialogs render with `role="alertdialog"` and **cannot be dismissed by tapping outside on the scrim**; the user must make an explicit choice.

```html
<md-dialog id="alert-dialog" type="alert">
  <md-icon slot="icon">warning</md-icon>
  <div slot="headline">Discard unsaved changes?</div>
  <div slot="content">You have unsaved changes in your document. Leaving now will cause them to be lost.</div>
  <div slot="actions">
    <md-button color="text" onclick="document.getElementById('alert-dialog').close('cancel')">Keep Editing</md-button>
    <md-button color="filled" onclick="document.getElementById('alert-dialog').close('discard')">Discard</md-button>
  </div>
</md-dialog>
```

> **Tip:** You can also use `prevent-scrim-close` on standard dialogs to prevent backdrop clicks from dismissing the dialog without changing its ARIA role to `alertdialog`.

### 2. Dialog with Header Icon

When an icon is placed in the `icon` slot, the dialog automatically centers the icon and title according to the M3 specification.

```html
<md-dialog id="icon-dialog">
  <md-icon slot="icon">delete</md-icon>
  <div slot="headline">Permanently delete?</div>
  <div slot="content">All associated data will be erased from our servers immediately.</div>
  <div slot="actions">
    <md-button color="text" onclick="document.getElementById('icon-dialog').close('cancel')">Cancel</md-button>
    <md-button color="filled" onclick="document.getElementById('icon-dialog').close('delete')">Delete</md-button>
  </div>
</md-dialog>
```

### 3. Stacked Actions (`stacked`)

When action buttons have longer labels that cannot comfortably fit side-by-side, add the `stacked` attribute. Following Material 3 guidelines, stacked actions arrange buttons vertically, placing the **confirming action on top** and the **dismissive action below**.

```html
<md-dialog id="stacked-dialog" stacked>
  <div slot="headline">Turn on backup?</div>
  <div slot="content">Photos and videos will be saved automatically to your cloud storage account.</div>
  <div slot="actions">
    <md-button color="text" onclick="document.getElementById('stacked-dialog').close('cancel')"
      >Don't Back Up</md-button
    >
    <md-button color="filled" onclick="document.getElementById('stacked-dialog').close('backup')"
      >Turn On Cloud Backup</md-button
    >
  </div>
</md-dialog>
```

### 4. Full-Screen Dialog (`fullscreen`)

For complex tasks on compact or mobile viewports, the `fullscreen` attribute scales the dialog to fill 100% of the screen with 0dp corner radius and Level 0 elevation.

```html
<md-dialog id="fullscreen-dialog" fullscreen>
  <div slot="headline">Create Event</div>
  <div slot="content">
    <form>
      <!-- Complex form inputs -->
    </form>
  </div>
  <div slot="actions">
    <md-button color="text" onclick="document.getElementById('fullscreen-dialog').close('discard')">Discard</md-button>
    <md-button color="filled" onclick="document.getElementById('fullscreen-dialog').close('save')">Save</md-button>
  </div>
</md-dialog>
```

### 5. Scrollable Content & Dynamic Dividers

When content overflows the available height, `<md-dialog>` automatically scrolls vertically and displays 1dp dividers:

- A divider beneath the headline when content is scrolled down past the top.
- A divider above the actions when content extends beneath the viewport bottom.

### 6. HTML Form Integration (`method="dialog"`)

Buttons with a `value` attribute inside a `<form method="dialog">` automatically close the dialog and set `returnValue`:

```html
<md-dialog id="form-dialog">
  <div slot="headline">Reset settings?</div>
  <form slot="content" id="reset-form" method="dialog">
    <p>All customized preferences will be restored to their initial defaults.</p>
  </form>
  <div slot="actions">
    <md-button form="reset-form" value="cancel" color="text">Cancel</md-button>
    <md-button form="reset-form" value="reset" color="filled">Reset</md-button>
  </div>
</md-dialog>

<script>
  const dialog = document.querySelector('#form-dialog')
  dialog.addEventListener('close', () => {
    console.log('User selected:', dialog.returnValue) // 'cancel' or 'reset'
  })
</script>
```

---

## API Reference

### Properties & Attributes

| Property            | Attribute             | Type      | Default | Description                                                                           |
| :------------------ | :-------------------- | :-------- | :------ | :------------------------------------------------------------------------------------ |
| `open`              | `open`                | `boolean` | `false` | Opens or closes the dialog. Reflects to attribute.                                    |
| `quick`             | `quick`               | `boolean` | `false` | Skips opening and closing animations when `true`.                                     |
| `returnValue`       | `return-value`        | `string`  | `''`    | Gets or sets the return value for the dialog.                                         |
| `type`              | `type`                | `string`  | `''`    | Set to `'alert'` to enable `role="alertdialog"` and prevent dismissal on scrim click. |
| `stacked`           | `stacked`             | `boolean` | `false` | Stacks action buttons vertically with confirming action on top.                       |
| `preventScrimClose` | `prevent-scrim-close` | `boolean` | `false` | Prevents clicking the backdrop scrim from closing the dialog.                         |
| `fullscreen`        | `fullscreen`          | `boolean` | `false` | Displays the dialog in full-screen mode (100% viewport, 0 radius).                    |

### Methods

| Method    | Parameters             | Return Type     | Description                                                                     |
| :-------- | :--------------------- | :-------------- | :------------------------------------------------------------------------------ |
| `show()`  | none                   | `Promise<void>` | Opens the dialog and resolves after the entry animation finishes.               |
| `close()` | `returnValue?: string` | `Promise<void>` | Closes the dialog with optional return value and resolves after exit animation. |

### Events

| Event    | Bubble | Composed | Description                                                           |
| :------- | :----: | :------: | :-------------------------------------------------------------------- |
| `open`   |  Yes   |    No    | Dispatched before opening animations begin. Cancelable.               |
| `opened` |  Yes   |    No    | Dispatched after the dialog has fully opened and animations complete. |
| `close`  |  Yes   |    No    | Dispatched before closing animations begin. Cancelable.               |
| `closed` |  Yes   |    No    | Dispatched after the dialog has fully closed and animations complete. |
| `cancel` |  Yes   |    No    | Dispatched when canceled via Escape key or scrim click. Cancelable.   |

### Slots

| Name       | Description                                                                        |
| :--------- | :--------------------------------------------------------------------------------- |
| `headline` | The title / headline of the dialog (uses M3 Headline Small typography).            |
| `content`  | The body content (uses M3 Body Medium typography and supports vertical scrolling). |
| `actions`  | Action buttons (typically `<md-button>` in text, filled, or tonal styles).         |
| `icon`     | Optional header icon displayed above the headline.                                 |

---

## Design Tokens (CSS Custom Properties)

| Token                                     | Default Value                                         | Description                                              |
| :---------------------------------------- | :---------------------------------------------------- | :------------------------------------------------------- |
| `--md-dialog-container-color`             | `var(--md-sys-color-surface-container-high, #ece6f0)` | Background color of the container.                       |
| `--md-dialog-container-elevation`         | `3`                                                   | M3 elevation level (Level 3 for standard modal dialogs). |
| `--md-dialog-container-shadow-color`      | `var(--md-sys-color-shadow, #000)`                    | Shadow color for elevation.                              |
| `--md-dialog-container-shape`             | `var(--md-sys-shape-corner-extra-large, 28px)`        | Corner radius of the container.                          |
| `--md-dialog-container-max-width`         | `min(560px, calc(100% - 48px))`                       | Maximum container width.                                 |
| `--md-dialog-container-max-height`        | `min(560px, calc(100% - 48px))`                       | Maximum container height.                                |
| `--md-dialog-container-min-width`         | `280px`                                               | Minimum container width.                                 |
| `--md-dialog-container-min-height`        | `140px`                                               | Minimum container height.                                |
| `--md-dialog-headline-color`              | `var(--md-sys-color-on-surface, #1d1b20)`             | Text color of the headline.                              |
| `--md-dialog-headline-font`               | `var(--md-sys-typescale-headline-small-font)`         | Font family of the headline.                             |
| `--md-dialog-headline-size`               | `1.5rem` (`24px`)                                     | Font size of the headline.                               |
| `--md-dialog-headline-line-height`        | `2rem` (`32px`)                                       | Line height of the headline.                             |
| `--md-dialog-headline-weight`             | `400`                                                 | Font weight of the headline.                             |
| `--md-dialog-supporting-text-color`       | `var(--md-sys-color-on-surface-variant, #49454f)`     | Text color of the content body.                          |
| `--md-dialog-supporting-text-font`        | `var(--md-sys-typescale-body-medium-font)`            | Font family of the content body.                         |
| `--md-dialog-supporting-text-size`        | `0.875rem` (`14px`)                                   | Font size of the content body.                           |
| `--md-dialog-supporting-text-line-height` | `1.25rem` (`20px`)                                    | Line height of the content body.                         |
| `--md-dialog-supporting-text-weight`      | `400`                                                 | Font weight of the content body.                         |
| `--md-dialog-icon-color`                  | `var(--md-sys-color-secondary, #625b71)`              | Icon color in header.                                    |
| `--md-dialog-icon-size`                   | `24px`                                                | Icon dimensions.                                         |
| `--md-dialog-scrim-color`                 | `var(--md-sys-color-scrim, #000)`                     | Background color of backdrop scrim.                      |
| `--md-dialog-scrim-opacity`               | `32%`                                                 | Opacity of backdrop scrim.                               |
