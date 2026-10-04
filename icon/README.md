# Icon

[Material Design 3 Icons](https://m3.material.io/styles/icons/overview).

Icons display symbols from Google Material Symbols or slotted SVGs.

## Import

```js
import 'material/icon/icon.js'
```

Ensure you include the Material Symbols font in your HTML:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
```

## Usage

```html
<!-- Using Material Symbols name -->
<md-icon>search</md-icon>
<md-icon>home</md-icon>
<md-icon>settings</md-icon>

<!-- Custom SVG icon -->
<md-icon>
  <svg viewBox="0 0 24 24">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
</md-icon>
```
