# Menu

Menus display a list of choices on a temporary surface. They appear when users interact with a button, action, or other control.

Supports both the Material 3 **Baseline Menu** specification and the updated **Material 3 Expressive Vertical Menu** specification.

## Basic Usage

```html
<div style="position: relative;">
  <md-button id="anchor" onclick="document.getElementById('menu').show()"> Open Menu </md-button>

  <md-menu id="menu" anchor="anchor">
    <md-menu-item href="/profile">
      <div slot="headline">Profile</div>
      <md-icon slot="start">person</md-icon>
    </md-menu-item>
    <md-menu-item href="/orgs" selected>
      <div slot="headline">My Organizations</div>
      <md-icon slot="start">storefront</md-icon>
    </md-menu-item>
    <md-divider></md-divider>
    <md-menu-item disabled>
      <div slot="headline">Sign out</div>
      <md-icon slot="start">logout</md-icon>
    </md-menu-item>
  </md-menu>
</div>
```

```javascript
// Programmatic control:
const menu = document.querySelector('md-menu')
menu.show()
menu.close()
```

---

## Variants

### Expressive Vertical Menu (Default)

The modern Material 3 Expressive vertical menu is enabled by default:

- **Item height**: 44px
- **Horizontal padding**: 16px
- **Element gap**: 12px
- **Container corner radius**: 16px (`md.sys.shape.corner.large`)
- **Item corner radius**: Inset pill with 12px outer corners (`md.sys.shape.corner.medium`) and 4px inner corners
- **Icon size**: 20px (`md.comp.menus.item.leading/trailing-icon-size`)
- **Selection style**: Inset 12px rounded pill
- **Shape morphing**: Smooth corner radius and background transitions on hover and focus

```html
<!-- Standard style (surface-container-low, default) -->
<md-menu anchor="anchor-id">
  <md-menu-item>
    <div slot="headline">Dashboard</div>
    <md-icon slot="start">dashboard</md-icon>
  </md-menu-item>
  <md-menu-item selected>
    <div slot="headline">Analytics</div>
    <md-icon slot="start">analytics</md-icon>
  </md-menu-item>
</md-menu>

<!-- Vibrant style (tertiary-container with tertiary highlight) -->
<md-menu anchor="anchor-id" color-style="vibrant">
  <md-menu-item selected>
    <div slot="headline">Favorites</div>
    <md-icon slot="start">favorite</md-icon>
  </md-menu-item>
  <md-menu-item>
    <div slot="headline">Recents</div>
    <md-icon slot="start">schedule</md-icon>
  </md-menu-item>
</md-menu>
```

### Baseline Menu (`variant="baseline"` or `baseline`)

The classic Material 3 baseline menu variant:

- **Item height**: 48px
- **Horizontal padding**: 12px
- **Element gap**: 12px
- **Container corner radius**: 4px (`md.sys.shape.corner.extra-small`)
- **Typography**: `md.sys.typescale.label-large` (14px, 500 weight, 20px line-height)
- **Selection style**: Full-width edge-to-edge container highlight

```html
<md-menu anchor="anchor-id" variant="baseline">
  <md-menu-item>
    <div slot="headline">Option 1</div>
  </md-menu-item>
  <md-menu-item selected>
    <div slot="headline">Option 2</div>
  </md-menu-item>
</md-menu>
```

---

## Submenus (`<md-sub-menu>`)

Submenus open next to their parent item without overlapping it. Submenus automatically inherit the parent menu's variant (vertical or baseline) and color style. Add `has-overflow` to the parent `<md-menu>` when embedding submenus:

```html
<md-menu id="parent-menu" anchor="anchor-btn" has-overflow>
  <md-menu-item>
    <div slot="headline">Copy</div>
    <md-icon slot="start">content_copy</md-icon>
  </md-menu-item>
  <md-sub-menu>
    <md-menu-item slot="item">
      <div slot="headline">Share</div>
      <md-icon slot="start">share</md-icon>
      <md-icon slot="end">arrow_right</md-icon>
    </md-menu-item>
    <md-menu slot="menu">
      <md-menu-item>
        <div slot="headline">Email</div>
        <md-icon slot="start">mail</md-icon>
      </md-menu-item>
      <md-menu-item selected>
        <div slot="headline">Link</div>
        <md-icon slot="start">link</md-icon>
      </md-menu-item>
    </md-menu>
  </md-sub-menu>
</md-menu>
```

---

## Properties

### `<md-menu>`

| Property       | Attribute       | Type      | Default         | Description                                                                |
| :------------- | :-------------- | :-------- | :-------------- | :------------------------------------------------------------------------- |
| `anchor`       | `anchor`        | `string`  | `''`            | ID of the element in the same root node to align to.                       |
| `open`         | `open`          | `boolean` | `false`         | Whether the menu is currently visible.                                     |
| `quick`        | `quick`         | `boolean` | `false`         | Skips open and close transitions when `true`.                              |
| `hasOverflow`  | `has-overflow`  | `boolean` | `false`         | Allows submenu content to overflow the menu container.                     |
| `positioning`  | `positioning`   | `string`  | `'absolute'`    | Positioning strategy (`'absolute'`, `'fixed'`, `'document'`, `'popover'`). |
| `variant`      | `variant`       | `string`  | `'vertical'`    | Design variant: `'vertical'` (default, Expressive) or `'baseline'`.        |
| `vertical`     | `vertical`      | `boolean` | `true`          | Shorthand boolean attribute for `variant="vertical"`.                      |
| `baseline`     | `baseline`      | `boolean` | `false`         | Shorthand boolean attribute for `variant="baseline"`.                      |
| `colorStyle`   | `color-style`   | `string`  | `'standard'`    | Vertical color mapping: `'standard'` or `'vibrant'`.                       |
| `vibrant`      | `vibrant`       | `boolean` | `false`         | Shorthand boolean attribute for `color-style="vibrant"`.                   |
| `anchorCorner` | `anchor-corner` | `string`  | `'end-start'`   | Corner of the anchor element to align to.                                  |
| `menuCorner`   | `menu-corner`   | `string`  | `'start-start'` | Corner of the menu surface to align with anchor corner.                    |
| `xOffset`      | `x-offset`      | `number`  | `0`             | Horizontal pixel offset from anchor corner.                                |
| `yOffset`      | `y-offset`      | `number`  | `0`             | Vertical pixel offset from anchor corner.                                  |

### `<md-menu-item>`

| Property   | Attribute   | Type      | Default      | Description                                                   |
| :--------- | :---------- | :-------- | :----------- | :------------------------------------------------------------ |
| `disabled` | `disabled`  | `boolean` | `false`      | Disables interaction and dims opacity.                        |
| `selected` | `selected`  | `boolean` | `false`      | Highlights the item as active/selected.                       |
| `href`     | `href`      | `string`  | `''`         | URL link when acting as an anchor.                            |
| `target`   | `target`    | `string`  | `''`         | Target window/frame for anchor navigation.                    |
| `keepOpen` | `keep-open` | `boolean` | `false`      | Prevents closing the parent menu on item selection.           |
| `type`     | `type`      | `string`  | `'menuitem'` | ARIA role: `'menuitem'`, `'option'`, `'button'`, or `'link'`. |

---

## Slots

### `<md-menu-item>`

| Slot                       | Description                                                          |
| :------------------------- | :------------------------------------------------------------------- |
| `headline`                 | Primary label text.                                                  |
| `supporting-text`          | Secondary supporting text underneath the headline.                   |
| `trailing-supporting-text` | Shortcut or status indicator text placed at the end.                 |
| `start`                    | Leading element, typically an `<md-icon>`, avatar, or checkbox.      |
| `end`                      | Trailing element, typically an `<md-icon>` (e.g. submenu indicator). |

---

## CSS Custom Properties

| Custom Property                            | Default                                                             | Description                                  |
| :----------------------------------------- | :------------------------------------------------------------------ | :------------------------------------------- |
| `--md-menu-container-shape`                | `4px` (baseline) / `16px` (vertical)                                | Menu surface corner radius                   |
| `--md-menu-container-color`                | `surface-container` (baseline) / `surface-container-low` (vertical) | Background color of menu container           |
| `--md-menu-container-max-width`            | `280px`                                                             | Maximum container width                      |
| `--md-menu-item-one-line-container-height` | `48px` (baseline) / `44px` (vertical)                               | Height of a single-line menu item            |
| `--md-menu-item-leading-space`             | `12px` (baseline) / `16px` (vertical)                               | Left/leading padding inside menu item        |
| `--md-menu-item-trailing-space`            | `12px` (baseline) / `16px` (vertical)                               | Right/trailing padding inside menu item      |
| `--md-menu-item-between-space`             | `12px`                                                              | Spacing between icons and text inside item   |
| `--md-menu-item-icon-size`                 | `24px` (baseline) / `20px` (vertical)                               | Sizing of slotted leading and trailing icons |
| `--md-menu-item-selected-container-color`  | `secondary-container` (baseline/standard) / `tertiary` (vibrant)    | Background color of selected item            |
| `--md-menu-item-selected-label-text-color` | `on-secondary-container` / `on-tertiary` (vibrant)                  | Label color of selected item                 |
