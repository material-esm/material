# Buttons

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
