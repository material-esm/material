# App Bar

A Material 3 top app bar component implementing the [Material Design 3 App Bar specification](https://m3.material.io/components/app-bars/overview).

Top app bars display information and actions related to the current screen, supporting:

- **Small App Bar**: Standard 64px height with left-aligned headline.
- **Center-Aligned App Bar**: 64px height with centered headline.
- **Medium Flexible App Bar**: Two-row flexible layout (112px–136px) that collapses to 64px on scroll.
- **Large Flexible App Bar**: Prominent two-row flexible layout (120px–152px) that collapses to 64px on scroll.
- **Search App Bar**: Top bar with integrated search input field and actions.

## Import

```html
<script type="module">
  import 'material/app/bar.js'
  import 'material/buttons/icon-button.js'
  import 'material/icon/icon.js'
</script>
```

Or in JavaScript:

```js
import 'material/app/bar.js'
import 'material/buttons/icon-button.js'
import 'material/icon/icon.js'
```

## Usage

### 1. Small App Bar (Default)

```html
<md-app-bar headline="Page Title" subtitle="Optional subtitle">
  <md-icon-button slot="navigation-icon">
    <md-icon>menu</md-icon>
  </md-icon-button>
  <div slot="action-items">
    <md-icon-button><md-icon>search</md-icon></md-icon-button>
    <md-icon-button><md-icon>more_vert</md-icon></md-icon-button>
  </div>
</md-app-bar>
```

### 2. Center-Aligned App Bar

```html
<md-app-bar type="center-aligned" headline="Center Aligned">
  <md-icon-button slot="navigation-icon">
    <md-icon>arrow_back</md-icon>
  </md-icon-button>
  <div slot="action-items">
    <md-icon-button><md-icon>attach_file</md-icon></md-icon-button>
  </div>
</md-app-bar>
```

### 3. Medium & Large Flexible App Bars

Flexible app bars support prominent headings and can automatically collapse to 64px when scrolled:

```html
<md-app-bar
  type="medium-flexible"
  headline="Medium Title"
  subtitle="Descriptive subtitle"
  scroll-behavior="collapse"
  scroll-target="window">
  <md-icon-button slot="navigation-icon">
    <md-icon>menu</md-icon>
  </md-icon-button>
  <div slot="action-items">
    <md-icon-button><md-icon>filter_list</md-icon></md-icon-button>
  </div>
</md-app-bar>
```

For Large Flexible, use `type="large-flexible"`.

### 4. Search App Bar

```html
<md-app-bar type="search" placeholder="Search...">
  <md-icon-button slot="navigation-icon">
    <md-icon>menu</md-icon>
  </md-icon-button>
  <div slot="action-items">
    <md-icon-button><md-icon>mic</md-icon></md-icon-button>
  </div>
</md-app-bar>
```

## Properties and Attributes

| Property         | Attribute         | Type      | Default    | Description                                                                                     |
| ---------------- | ----------------- | --------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `type`           | `type`            | `string`  | `'small'`  | Variant: `'small'`, `'center-aligned'`, `'medium-flexible'`, `'large-flexible'`, or `'search'`. |
| `variant`        | `variant`         | `string`  | `''`       | Alias for `type`.                                                                               |
| `headline`       | `headline`        | `string`  | `''`       | Main headline / title text.                                                                     |
| `title`          | `title`           | `string`  | `''`       | Alias for `headline`.                                                                           |
| `subtitle`       | `subtitle`        | `string`  | `''`       | Optional subtitle text.                                                                         |
| `centerAligned`  | `center-aligned`  | `boolean` | `false`    | Shorthand boolean to center-align the headline.                                                 |
| `scrolled`       | `scrolled`        | `boolean` | `false`    | Reflects whether container color / elevation is in the scrolled state.                          |
| `collapsed`      | `collapsed`       | `boolean` | `false`    | Whether a medium or large flexible bar is collapsed down to 64px.                               |
| `scrollBehavior` | `scroll-behavior` | `string`  | `'none'`   | Auto-scroll mode: `'none'`, `'scroll'` (elevates on scroll), or `'collapse'` (also collapses).  |
| `scrollTarget`   | `scroll-target`   | `string`  | `'window'` | CSS selector of the scroll container element, or `'window'`.                                    |
| `placeholder`    | `placeholder`     | `string`  | `'Search'` | Placeholder for the search variant input field.                                                 |
| `value`          | `value`           | `string`  | `''`       | Current text in the search input field.                                                         |

## Slots

| Slot                       | Description                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `navigation-icon`          | Leading navigation button (e.g. hamburger menu icon or back arrow). Alias: `leading-icon`. |
| `headline`                 | Custom HTML or component for the headline. Alias: `title`.                                 |
| `subtitle`                 | Custom HTML or component for the subtitle.                                                 |
| `action-items`             | Trailing action icon buttons or user avatar. Alias: `trailing-icon`.                       |
| `search-field`             | Custom search input field override for the `search` variant.                               |
| `leading-icon-text-field`  | Icon inside the search input field.                                                        |
| `trailing-icon-text-field` | Clear or trailing icon inside the search input field.                                      |
| `(default)`                | Additional under-bar content (such as tabs or divider).                                    |

## CSS Custom Properties

| Custom Property                         | Default Value                            | Description                           |
| --------------------------------------- | ---------------------------------------- | ------------------------------------- |
| `--md-app-bar-container-color`          | `var(--md-sys-color-surface)`            | Background color when unscrolled.     |
| `--md-app-bar-scrolled-container-color` | `var(--md-sys-color-surface-container)`  | Background color when scrolled.       |
| `--md-app-bar-headline-color`           | `var(--md-sys-color-on-surface)`         | Text color of the headline.           |
| `--md-app-bar-subtitle-color`           | `var(--md-sys-color-on-surface-variant)` | Text color of the subtitle.           |
| `--md-app-bar-leading-icon-color`       | `var(--md-sys-color-on-surface)`         | Color of the leading navigation icon. |
| `--md-app-bar-trailing-icon-color`      | `var(--md-sys-color-on-surface-variant)` | Color of the trailing action icons.   |
