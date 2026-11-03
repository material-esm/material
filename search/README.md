# Search

A Material 3 search bar component implementing the [Material Design 3 Search specification](https://m3.material.io/components/search/overview).

## Import

```js
import 'material/search/search.js'
```

## Usage

### Basic Search Bar

```html
<md-search placeholder="Search..."></md-search>
```

### With Trailing Action & Avatar

```html
<md-search placeholder="Search mail">
  <md-icon-button slot="leading-icon" aria-label="Menu">
    <md-icon>menu</md-icon>
  </md-icon-button>
  <md-icon-button slot="trailing-icon" aria-label="Voice search">
    <md-icon>mic</md-icon>
  </md-icon-button>
  <img slot="avatar" src="/images/avatar.png" alt="User profile" />
</md-search>
```

### With Adaptive Search Suggestions (Docked & Full-Screen Search View)

Slotting items into `<md-search>` (or `slot="suggestions"`) automatically renders an adaptive **Search View**:
- **Medium & Expanded windows (`>= 600px`)**: Displays a **docked** menu surface directly beneath the search bar.
- **Compact windows (`< 600px`)**: Expands into a **full-screen** search view with a leading back button (`<`).

```html
<md-search placeholder="Search your library">
  <md-list-item type="button">
    <md-icon slot="start">animation</md-icon>
    <div slot="headline">Animations</div>
  </md-list-item>
  <md-list-item type="button">
    <md-icon slot="start">location_on</md-icon>
    <div slot="headline">Munich</div>
  </md-list-item>
</md-search>
```

### Properties and Attributes

| Property        | Attribute        | Type      | Default    | Description                                                                                      |
| --------------- | ---------------- | --------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `value`         | `value`          | `string`  | `''`       | Current search query value.                                                                      |
| `placeholder`   | `placeholder`    | `string`  | `'Search'` | Supporting / hint text displayed when the input is empty.                                        |
| `label`         | `label`          | `string`  | `'Search'` | Accessible `aria-label` for the search input.                                                    |
| `name`          | `name`           | `string`  | `''`       | Input name attribute for form submission.                                                        |
| `disabled`      | `disabled`       | `boolean` | `false`    | Whether the search bar is disabled.                                                              |
| `centerAligned` | `center-aligned` | `boolean` | `false`    | Center-aligns the supporting / hint text when unfocused/empty.                                   |
| `elevated`      | `elevated`       | `boolean` | `false`    | Applies resting elevation (level 3) to the search container.                                     |
| `noClear`       | `no-clear`       | `boolean` | `false`    | Hides the automatic clear (`close`) button when text is typed.                                   |
| `open`          | `open`           | `boolean` | `false`    | Whether the search suggestions/results view is open.                                             |
| `view`          | `view`           | `string`  | `'auto'`   | Search view mode: `'auto'` (fullscreen `< 600px`, docked `>= 600px`), `'docked'`, or `'fullscreen'`. |

### Slots

| Slot            | Description                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| `(default)`     | Search suggestions or result items (e.g. `<md-list-item>`) shown in the Search View.         |
| `suggestions`   | Named slot alias for search suggestions or result items.                                     |
| `leading-icon`  | Element placed at the start (defaults to `<md-icon>search</md-icon>`, or back button when open). |
| `trailing-icon` | Persistent action icon(s) placed at the end (e.g. voice search `<md-icon-button>`).          |
| `avatar`        | Optional `30px` circular avatar image or element placed at the trailing edge.                |

### Events

| Event    | Type                            | Description                                         |
| -------- | ------------------------------- | --------------------------------------------------- |
| `input`  | `InputEvent`                    | Dispatched when the search input value changes.     |
| `change` | `Event`                         | Dispatched when the search input value is committed.|
| `search` | `CustomEvent<{ value: string }>`| Dispatched when the user presses `Enter`.           |
| `clear`  | `CustomEvent`                   | Dispatched when the clear button is clicked.        |
| `open`   | `CustomEvent`                   | Dispatched when the search suggestions view opens.  |
| `close`  | `CustomEvent`                   | Dispatched when the search suggestions view closes. |

### CSS Custom Properties

| Custom Property                        | Default Value                               | Description                            |
| -------------------------------------- | ------------------------------------------- | -------------------------------------- |
| `--md-search-container-color`          | `var(--md-sys-color-surface-container-high)`| Container fill color.                  |
| `--md-search-container-height`         | `56px`                                      | Container height.                      |
| `--md-search-container-shape`          | `var(--md-sys-shape-corner-full, 9999px)`   | Container corner shape radius.         |
| `--md-search-container-elevation`      | `0` (`3` when `elevated` is set)            | Container elevation level.             |
| `--md-search-min-width`                | `min(360px, 100%)`                          | Minimum width of the search bar.       |
| `--md-search-max-width`                | `720px`                                     | Maximum width of the search bar.       |
| `--md-search-leading-icon-color`       | `var(--md-sys-color-on-surface)`            | Leading icon color.                    |
| `--md-search-trailing-icon-color`      | `var(--md-sys-color-on-surface-variant)`    | Trailing icon color.                   |
| `--md-search-supporting-text-color`    | `var(--md-sys-color-on-surface-variant)`    | Placeholder / supporting text color.   |
| `--md-search-input-text-color`         | `var(--md-sys-color-on-surface)`            | Typed input text color.                |
| `--md-search-avatar-size`              | `30px`                                      | Trailing avatar width and height.      |
| `--md-search-avatar-shape`             | `var(--md-sys-shape-corner-full, 9999px)`   | Trailing avatar border radius.         |
