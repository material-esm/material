# Buttons

## Regular Buttons

[Material 3 expressive buttons](https://m3.material.io/components/buttons/overview).

Changes from previous version:

- All buttons are a single component now with different attributes.

```html
<div class="flex g12 aic">
  <md-button>Default</md-button>
  <md-button size="extra-small">Extra small</md-button>
  <md-button size="small">Small</md-button>
  <md-button size="medium">Medium</md-button>
  <md-button size="large">Large</md-button>
  <md-button size="extra-large">Extra large</md-button>
</div>
<div class="flex g12 aic">
  <md-button color="elevated">
    <md-icon slot="icon">edit</md-icon>
    Elevated
  </md-button>
  <md-button color="outlined">Outlined</md-button>
  <md-button color="filled">
    <md-icon slot="icon">edit</md-icon>
    Filled
  </md-button>
  <md-button color="tonal">Tonal</md-button>
  <md-button color="text">Text</md-button>
</div>
```

## Button Groups

[Material 3 Button Groups](https://m3.material.io/components/button-groups/overview)

Standard Button Group:

```html
<md-button-group>
  <md-button>One</md-button>
  <md-button>Two</md-button>
  <md-button>Three</md-button>
</md-button-group>
```

Connected Button Group:

```html
<!-- Single-select connected button group (Material 3 Expressive) -->
<md-button-group connected aria-label="Folders">
  <md-button color="tonal" selected>My files</md-button>
  <md-button color="tonal">Shared</md-button>
  <md-button color="tonal">Computers</md-button>
</md-button-group>

<!-- Connected button group with checkmark on selected button -->
<md-button-group connected checkmark aria-label="Select size">
  <md-button color="tonal" selected>8oz</md-button>
  <md-button color="tonal">12oz</md-button>
  <md-button color="tonal">16oz</md-button>
</md-button-group>
```

> **Material 3 Expressive Specification**: Connected button groups replace the baseline segmented button. They feature 2px gap, fully round outer corners, and inner corner radii (8px for small/medium, 4px for XS, 16px for L, 20px for XL), with single-select or multi-select toggle coordination. Provide an `aria-label` attribute on `<md-button-group>` for accessibility.

## Floating Action Button - FAB

[Material 3 Floating Action Button](https://m3.material.io/components/floating-action-button/overview)]

```html
<md-fab class="fabBottom" variant="primary" href="#">
  <md-icon slot="icon">add</md-icon>
</md-fab>
```

Extended FAB

[Extended](https://m3.material.io/components/extended-fab/overview)

```html
<md-fab class="fabBottom" variant="primary" href="#" label="Extended FAB" extended>
  <md-icon slot="icon">add</md-icon>
</md-fab>
```

## FAB Menu

[Material 3 Expressive FAB Menu](https://m3.material.io/components/fab-menu/overview)

The M3 Expressive FAB Menu replaces custom speed dials with a standardized, accessible menu expanding `2–6` pill-shaped actions (`56px` height, `9999px` pill radius, `4px` gap) while morphing the trigger FAB into a circular `56px` close (`×`) toggle button (`8px` gap to nearest item).

```html
<md-fab-menu variant="primary" aria-label="Create new item">
  <md-icon slot="icon">add</md-icon>
  <md-fab-menu-item value="doc" label="Document">
    <md-icon slot="icon">description</md-icon>
  </md-fab-menu-item>
  <md-fab-menu-item value="folder" label="Folder">
    <md-icon slot="icon">folder</md-icon>
  </md-fab-menu-item>
  <md-fab-menu-item value="upload" label="Upload file">
    <md-icon slot="icon">upload</md-icon>
  </md-fab-menu-item>
</md-fab-menu>
```

### Color Schemes, Sizes, Alignment & Scrim

```html
<!-- Secondary & Tertiary M3 Expressive tonal sets -->
<md-fab-menu variant="secondary" aria-label="Share options">
  <md-icon slot="icon">share</md-icon>
  <md-fab-menu-item icon="link" label="Copy link" keep-open></md-fab-menu-item>
  <md-fab-menu-item icon="mail" label="Email" href="mailto:team@example.com"></md-fab-menu-item>
</md-fab-menu>

<!-- Large (96px -> 56px close button), leading alignment, downward opening, backdrop scrim -->
<md-fab-menu variant="tertiary" size="large" align="start" direction="down" scrim aria-label="Compose">
  <md-icon slot="icon">edit</md-icon>
  <md-fab-menu-item icon="chat" label="New message"></md-fab-menu-item>
  <md-fab-menu-item icon="videocam" label="Video call"></md-fab-menu-item>
</md-fab-menu>
```

### `<md-fab-menu>` API

| Property / Attribute | Type                                                  | Default        | Description                                                                           |
| -------------------- | ----------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `open`               | `boolean`                                             | `false`        | Reflected open state of the menu.                                                     |
| `variant` / `color`  | `'primary' \| 'secondary' \| 'tertiary' \| 'surface'` | `'primary'`    | M3 Expressive tonal color pairing for trigger, close button, and items.               |
| `size`               | `'small' \| 'medium' \| 'large'`                      | `'medium'`     | Collapsed FAB size (`40px`, `56px`, or `96px`); morphs to circular `56px` when open.  |
| `label`              | `string`                                              | `''`           | Label text (used as accessible fallback label, and displayed when `extended` is set). |
| `extended`           | `boolean`                                             | `false`        | Expands the collapsed trigger into an extended FAB showing `label`.                   |
| `icon`               | `string`                                              | `''`           | Optional Material icon name for the collapsed trigger (or pass `slot="icon"`).        |
| `close-icon`         | `string`                                              | `''`           | Optional Material icon name for the expanded close button (or `slot="close-icon"`).   |
| `align`              | `'end' \| 'start'`                                    | `'end'`        | Inline alignment of the menu items relative to the trigger (RTL-aware).               |
| `direction`          | `'up' \| 'down'`                                      | `'up'`         | Vertical opening direction from the trigger.                                          |
| `scrim`              | `boolean`                                             | `false`        | Renders a light-dismiss backdrop scrim behind the menu when open.                     |
| `close-label`        | `string`                                              | `'Close menu'` | Accessible `aria-label` applied to the trigger button while open.                     |
| `lowered`            | `boolean`                                             | `false`        | Lowers collapsed trigger elevation from level 3 to level 1.                           |
| `disabled`           | `boolean`                                             | `false`        | Disables opening the menu.                                                            |
| `quick`              | `boolean`                                             | `false`        | Skips open/close transitions.                                                         |

- **Methods**: `show()`, `close(reason?)`, `toggle()`
- **Events**: `open` (cancelable), `opened`, `close` (cancelable), `closed`, `item-activate` (cancelable, bubbles from `<md-fab-menu-item>`)
- **Keyboard & Accessibility**: Trigger exposes `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`; menu uses `role="menu"` and items use `role="menuitem"`. Supports `ArrowUp`, `ArrowDown`, `Home`, `End`, `Escape` (restores focus to trigger), `Tab` (closes without trapping focus), and outside-click light-dismiss.
- **CSS Custom Properties**: `--md-fab-menu-container-color`, `--md-fab-menu-icon-color`, `--md-fab-menu-close-button-container-color`, `--md-fab-menu-close-button-icon-color`, `--md-fab-menu-close-button-size`, `--md-fab-menu-item-container-color`, `--md-fab-menu-item-content-color`, `--md-fab-menu-item-height`, `--md-fab-menu-item-shape`, `--md-fab-menu-item-gap`, `--md-fab-menu-button-gap`, `--md-fab-menu-scrim-color`, `--md-fab-menu-scrim-opacity`.

### `<md-fab-menu-item>` API

| Property / Attribute | Type      | Default | Description                                                        |
| -------------------- | --------- | ------- | ------------------------------------------------------------------ |
| `label`              | `string`  | `''`    | Action label text (can also be supplied via default slot).         |
| `icon`               | `string`  | `''`    | Optional Material icon name (or pass `<md-icon slot="icon">`).     |
| `value`              | `string`  | `''`    | Identifier included in `item-activate` event `detail.value`.       |
| `href` / `target`    | `string`  | `''`    | Renders a semantic `<a role="menuitem">` link item.                |
| `keep-open`          | `boolean` | `false` | Keeps `<md-fab-menu>` open after activating this item.             |
| `disabled`           | `boolean` | `false` | Disables activation and skips the item during keyboard navigation. |

## Split Buttons

```html
<md-split-button color="filled">
  Send
  <div slot="menu">
    <!-- define your menu here -->
    <md-menu-item>Schedule send</md-menu-item>
    <md-menu-item>Save template</md-menu-item>
  </div>
</md-split-button>
```

## Icon Buttons

```html
<md-icon-button aria-label="Search">
  <md-icon>search</md-icon>
</md-icon-button>

<!-- With M3 notification badges -->
<md-icon-button aria-label="5 unread notifications">
  <md-icon>notifications</md-icon>
  <md-badge slot="badge" value="5"></md-badge>
</md-icon-button>

<md-icon-button aria-label="Unread mail">
  <md-icon>mail</md-icon>
  <md-badge slot="badge"></md-badge>
</md-icon-button>
```
