# Indicators

This directory contains progress and loading indicator components implementing the Material Design 3 specifications, including the M3 Expressive shape and physics extensions.

- [Progress Indicators (`md-progress`)](#progress-indicators-md-progress)
- [Loading Indicator (`md-loading-indicator`)](#loading-indicator-md-loading-indicator)

---

## Progress Indicators (`md-progress`)

The `md-progress` component displays activity or loading status. It supports linear and circular shapes, determinate and indeterminate behaviors, and the M3 Expressive wavy track extension.

### Import

```javascript
import 'material/indicators/progress.js'
```

### Usage

#### Circular Progress

```html
<!-- Indeterminate spinner -->
<md-progress type="circular" indeterminate></md-progress>

<!-- Determinate circle (0.0 to 1.0) -->
<md-progress type="circular" value="0.7"></md-progress>
```

#### Linear Progress

```html
<!-- Indeterminate linear progress -->
<md-progress type="linear" indeterminate></md-progress>

<!-- Determinate linear progress (0.0 to 1.0) -->
<md-progress type="linear" value="0.5"></md-progress>
```

#### Wavy M3 Expressive Extension

Add the `wavy` attribute to enable the M3 Expressive waveform style:

*   **Wavy Circular**: Animates the active track as a circular wave with smooth phase propagation.
*   **Wavy Linear**: Replaces the active bar with a smooth sine wave. Features a `12px` expanded track height, a centered `4px` straight inactive track, and a stop indicator dot at the end (for determinate mode).

```html
<!-- Circular determinate wavy -->
<md-progress type="circular" value="0.7" wavy></md-progress>

<!-- Circular indeterminate wavy -->
<md-progress type="circular" indeterminate wavy></md-progress>

<!-- Linear determinate wavy -->
<md-progress type="linear" value="0.5" wavy></md-progress>

<!-- Linear indeterminate wavy -->
<md-progress type="linear" indeterminate wavy></md-progress>
```

---

## Loading Indicator (`md-loading-indicator`)

The `md-loading-indicator` is an expressive M3 component that uses a spring physics engine to morph between 7 different geometric shapes (soft burst, cookie, pentagon, rounded diamond/pill, sunny, oval, etc.) with a rotating canvas animation.

### Import

```javascript
import 'material/indicators/loading-indicator.js'
```

### Usage

```html
<!-- Default Loading Indicator (48px) -->
<md-loading-indicator></md-loading-indicator>

<!-- Contained Indicator (adds a circular themed background container) -->
<md-loading-indicator contained></md-loading-indicator>

<!-- Custom sized & themed contained indicator -->
<md-loading-indicator size="64" contained></md-loading-indicator>
```

### Properties and Attributes

| Property | Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `size` | `size` | `number` | `48` | The bounding box size of the indicator in pixels. |
| `color` | `color` | `string` | `'var(--md-sys-color-primary, #6750a4)'` | The color of the morphing indicator shape. |
| `contained` | `contained` | `boolean` | `false` | If true, renders a circular background container behind the indicator. |
| `containerColor` | `container-color`| `string` | `'var(--md-sys-color-surface-container-high, rgba(0, 0, 0, 0.08))'` | The color of the background container (when `contained` is true). |
| `speed` | `speed` | `number` | `1` | Animation speed multiplier. |
| `paused` | `paused` | `boolean` | `false` | If true, pauses the physics engine and animation loop. |
| `sizeRatio` | `size-ratio` | `number` | `0.79` | The ratio of the indicator shape size relative to the host container `size`. |

### Styling

You can customize the size of the loading indicator using the CSS custom property:

```css
md-loading-indicator {
  --md-loading-indicator-size: 64px;
}
```
