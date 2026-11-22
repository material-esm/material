# Indicators

Material Design 3 progress and loading indicator components, including **M3 Expressive** waveforms, track gaps, rounded shapes, stop indicators, and spring-physics morphing loaders.

- [Progress Indicators (`md-progress`)](#progress-indicators-md-progress)
- [Loading Component (`md-loading`)](#loading-component-md-loading)

---

## Progress Indicators (`md-progress`)

The `md-progress` component displays the status of an ongoing process, aligned with the [Material 3 Progress Indicators specification](https://m3.material.io/components/progress-indicators/overview):

- **Rounded stroke caps & pill corners** (`CornerFull`) on both active indicators and inactive tracks
- **`4px` active-to-track gap** separating active progress from remaining track segments in both linear and circular modes
- **`4px` stop indicator** at the trailing end of determinate linear tracks for non-text contrast accessibility
- **M3 system color roles**: `primary` active indicator and `secondary-container` track (plus optional `four-color` indeterminate cycling)
- **M3 Expressive waveforms** (`shape="wavy"`) with undistorted `40px` determinate / `20px` indeterminate linear wavelengths (`10px` wave height) and smooth polar circular waves

### Import

```javascript
import 'material/indicators/progress.js'
```

### Usage

#### Circular Progress

```html
<!-- Determinate circular (0.0 to 1.0) -->
<md-progress type="circular" value="0.7" aria-label="Upload progress"></md-progress>

<!-- Indeterminate circular -->
<md-progress type="circular" indeterminate aria-label="Loading"></md-progress>

<!-- Four-color indeterminate circular -->
<md-progress type="circular" indeterminate four-color aria-label="Loading"></md-progress>
```

#### Linear Progress

```html
<!-- Determinate linear (0.0 to 1.0) -->
<md-progress type="linear" value="0.5" aria-label="Download progress"></md-progress>

<!-- Indeterminate linear -->
<md-progress type="linear" indeterminate aria-label="Syncing"></md-progress>

<!-- Thick (8px) determinate linear -->
<md-progress
  type="linear"
  value="0.65"
  style="--md-progress-active-indicator-thickness: 8px; --md-progress-track-thickness: 8px"
  aria-label="Installing"></md-progress>
```

#### Wavy M3 Expressive Variant (`shape="wavy"`)

```html
<!-- Circular determinate & indeterminate wavy -->
<md-progress type="circular" value="0.7" shape="wavy" aria-label="Audio progress"></md-progress>
<md-progress type="circular" indeterminate shape="wavy" aria-label="Processing"></md-progress>

<!-- Linear determinate & indeterminate wavy -->
<md-progress type="linear" value="0.5" shape="wavy" aria-label="Playback progress"></md-progress>
<md-progress type="linear" indeterminate shape="wavy" aria-label="Buffering"></md-progress>
```

### Properties and Attributes

| Property        | Attribute       | Type                     | Default      | Description                                                          |
| :-------------- | :-------------- | :----------------------- | :----------- | :------------------------------------------------------------------- |
| `type`          | `type`          | `'circular' \| 'linear'` | `'circular'` | Indicator layout variant.                                            |
| `shape`         | `shape`         | `'flat' \| 'wavy'`       | `'flat'`     | Standard flat stroke or M3 Expressive sinusoidal waveform.           |
| `value`         | `value`         | `number`                 | `0`          | Current progress between `0` and `max`.                              |
| `max`           | `max`           | `number`                 | `1`          | Maximum progress value.                                              |
| `indeterminate` | `indeterminate` | `boolean`                | `false`      | Displays continuous indeterminate progress when duration is unknown. |
| `fourColor`     | `four-color`    | `boolean`                | `false`      | Cycles through 4 M3 primary/tertiary tokens in indeterminate mode.   |
| `buffer`        | `buffer`        | `number`                 | `0`          | Optional linear buffer value between `0` and `max`.                  |

### CSS Custom Properties

| Custom Property                            | Default                                            | Description                                                                                                                                                                                                         |
| :----------------------------------------- | :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--md-progress-active-indicator-color`     | `var(--md-sys-color-primary, #6750a4)`             | Active bar/arc color (also `--md-linear-progress-active-indicator-color` / `--md-circular-progress-active-indicator-color`).                                                                                        |
| `--md-progress-track-color`                | `var(--md-sys-color-secondary-container, #e8def8)` | Inactive track color (also `--md-linear-progress-track-color` / `--md-circular-progress-track-color`; set `transparent` to hide).                                                                                   |
| `--md-progress-track-gap`                  | `4px`                                              | Gap between active indicator and inactive track (`--md-linear-progress-track-gap` / `--md-circular-progress-track-gap`).                                                                                            |
| `--md-progress-active-indicator-thickness` | `4px`                                              | Stroke/bar thickness (`--md-linear-progress-active-indicator-height` / `--md-circular-progress-track-thickness`).                                                                                                   |
| `--md-progress-track-thickness`            | `4px`                                              | Track thickness (`--md-linear-progress-track-height`).                                                                                                                                                              |
| `--md-circular-progress-size`              | `48px`                                             | Outer container box size (`24px`–`240px` recommended).                                                                                                                                                              |
| `--md-linear-progress-stop-indicator-size` | `4px`                                              | Stop indicator diameter at the end of determinate linear tracks.                                                                                                                                                    |
| `--md-linear-progress-wave-height`         | `10px`                                             | Container height for wavy linear indicators (`4px` stroke + `2 × 3px` amplitude).                                                                                                                                   |
| `--md-linear-progress-wavelength`          | `40px` (`20px` indeterminate)                      | Wavelength of wavy linear indicators (`--md-linear-progress-indeterminate-wavelength` overrides indeterminate only).                                                                                                |
| `--md-progress-wave-duration`              | `1.5s` circular / `2s` linear (`1.5s` indet.)      | Duration per wave cycle across wavy indicators (`0s` renders a static wave; also `--md-circular-progress-wave-duration`, `--md-linear-progress-wave-duration`, `--md-linear-progress-indeterminate-wave-duration`). |

---

## Loading Component (`md-loading`)

The `md-loading` component is an M3 Expressive morphing indicator that uses spring physics to transition smoothly through 7 Material shapes (`48px` container, `38px` active shape at `0.79` ratio).

### Import

```javascript
import 'material/indicators/loading.js'
```

### Usage

```html
<!-- Uncontained (primary indicator) -->
<md-loading aria-label="Loading"></md-loading>

<!-- Contained (on-primary-container indicator on primary-container circle) -->
<md-loading contained aria-label="Loading"></md-loading>

<!-- Custom sized contained loader -->
<md-loading size="64" contained aria-label="Loading"></md-loading>
```

### Properties and Attributes

| Property         | Attribute         | Type      | Default | Description                                                                                 |
| :--------------- | :---------------- | :-------- | :------ | :------------------------------------------------------------------------------------------ |
| `size`           | `size`            | `number`  | `48`    | Bounding box size in pixels (falls back to `--md-loading-size`).                            |
| `contained`      | `contained`       | `boolean` | `false` | Renders a circular themed background container (`primary-container`).                       |
| `color`          | `color`           | `string`  | `''`    | Custom indicator color (defaults to `primary`, or `on-primary-container` when `contained`). |
| `containerColor` | `container-color` | `string`  | `''`    | Custom container color when `contained` is true (defaults to `primary-container`).          |
| `speed`          | `speed`           | `number`  | `1`     | Animation speed multiplier (automatically softened under `prefers-reduced-motion`).         |
| `paused`         | `paused`          | `boolean` | `false` | Pauses the spring physics and animation loop.                                               |
| `sizeRatio`      | `size-ratio`      | `number`  | `0.79`  | Active morphing shape ratio (`38dp / 48dp`).                                                |

### Styling

```css
md-loading {
  --md-loading-size: 64px;
  --md-loading-indicator-color: var(--md-sys-color-primary);
  --md-loading-contained-indicator-color: var(--md-sys-color-on-primary-container);
  --md-loading-container-color: var(--md-sys-color-primary-container);
}
```
