# App Bar

A Material 3 top app bar component with an integrated search field.

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

```html
<md-app-bar id="appBar" label="Search">
  <md-icon-button slot="leading-icon">
    <md-icon>menu</md-icon>
  </md-icon-button>
  <div slot="trailing-icon">
    <md-icon-button>
      <md-icon>more_vert</md-icon>
    </md-icon-button>
  </div>
</md-app-bar>
```

### Properties and Attributes

| Property      | Attribute     | Type     | Default    | Description                                           |
| ------------- | ------------- | -------- | ---------- | ----------------------------------------------------- |
| `label`       | `label`       | `string` | `'Search'` | The label for the inner search text field.            |
| `placeholder` | `placeholder` | `string` | `'Search'` | The placeholder text for the inner search text field. |
| `type`        | `type`        | `string` | `'search'` | Input type for the inner search text field.           |

### Slots

- `leading-icon`: Element placed before the search bar (e.g. navigation drawer menu button).
- `trailing-icon`: Element placed after the search bar (e.g. profile avatar, action buttons).
- `leading-icon-text-field`: Leading icon inside the search text field.
- `trailing-icon-text-field`: Trailing icon inside the search text field.
