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
