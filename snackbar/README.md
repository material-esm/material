# Snackbar

[Material Design 3 Snackbar Component](https://m3.material.io/components/snackbar/overview) for Web Components.

Snackbars show short updates about app processes at the bottom of the screen. In accordance with Material Design 3 guidelines:

- Non-actionable snackbars auto-dismiss after a set duration (default: 5,000ms; guideline: 4–10 seconds).
- Actionable snackbars (with action buttons or close icons) remain persistent until the user takes action.
- Only one snackbar is displayed at a time.
- Uses Level 3 elevation, `inverse-surface` container, `inverse-on-surface` supporting text, and `inverse-primary` for action buttons.
- Fully accessible via `role="status"` and `aria-live="polite"`.

## Import

```js
import 'material/snackbar/snackbar.js'
// or import the helper function:
import { snack } from 'material/snackbar/snackbar.js'
```

## Usage

### Declarative

```html
<md-snackbar message="Item deleted" open></md-snackbar>

<!-- With Action Button -->
<md-snackbar message="Message archived" open>
  <md-button color="text" slot="action">Undo</md-button>
</md-snackbar>

<!-- Stacked layout for longer actions -->
<md-snackbar message="This is a longer message that requires stacked action" stacked open>
  <md-button color="text" slot="action">Longer action label</md-button>
</md-snackbar>
```

### Programmatic

```js
const snackbar = document.querySelector('md-snackbar')
snackbar.show()
snackbar.close()
```

### Helper Function `snack()`

Simple notification (auto-dismisses after 5 seconds):

```js
snack('Changes saved')
```

Actionable notification (persistent until interacted with):

```js
snack('Email archived', {
  action: {
    label: 'Undo',
    onClick: () => {
      console.log('Undo clicked')
    },
  },
  showCloseIcon: true,
})
```

Stacked layout:

```js
snack('Two-line notification with a longer action label below', {
  stacked: true,
  action: {
    label: 'Take Action Now',
    onClick: () => {},
  },
})
```

## Events

| Event    | Description                                                  |
| :------- | :----------------------------------------------------------- |
| `open`   | Dispatched immediately before the opening transition begins. |
| `opened` | Dispatched after the opening transition has completed.       |
| `close`  | Dispatched immediately before the closing transition begins. |
| `closed` | Dispatched after the closing transition has completed.       |

## Design Tokens / CSS Custom Properties

| Custom Property                         | Description                          | Default                                           |
| :-------------------------------------- | :----------------------------------- | :------------------------------------------------ |
| `--md-snackbar-container-color`         | Container background color           | `var(--md-sys-color-inverse-surface, #313033)`    |
| `--md-snackbar-supporting-text-color`   | Supporting text color                | `var(--md-sys-color-inverse-on-surface, #f4eff4)` |
| `--md-snackbar-action-label-text-color` | Action button text color             | `var(--md-sys-color-inverse-primary, #d0bcff)`    |
| `--md-snackbar-icon-color`              | Close icon color                     | `var(--md-sys-color-inverse-on-surface, #f4eff4)` |
| `--md-snackbar-container-elevation`     | Container elevation level            | `3` (Level 3)                                     |
| `--md-snackbar-container-shape`         | Container border radius              | `var(--md-sys-shape-corner-extra-small, 4px)`     |
| `--md-snackbar-bottom`                  | Distance from the bottom of viewport | `24px`                                            |
| `--md-snackbar-min-width`               | Minimum container width              | `288px`                                           |
| `--md-snackbar-max-width`               | Maximum container width              | `min(568px, calc(100vw - 32px))`                  |
