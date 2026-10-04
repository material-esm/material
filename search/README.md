# Search

Material 3 search component built with `<md-text-field>` and `<md-icon>`.

## Import

```js
import 'material/search/search.js'
```

## Usage

```html
<md-search label="Search" placeholder="Search..."></md-search>
```

### Properties and Attributes

| Property      | Attribute     | Type     | Default    | Description                     |
| ------------- | ------------- | -------- | ---------- | ------------------------------- |
| `label`       | `label`       | `string` | `'Search'` | The label for the search input. |
| `placeholder` | `placeholder` | `string` | `'Search'` | Placeholder text for the input. |
| `value`       | `value`       | `string` | `''`       | Current search value.           |

### Slots

- `leading-icon`: Element placed at start (defaults to `<md-icon>search</md-icon>`).
- `trailing-icon`: Element placed at end when a value is present (defaults to a clear button with `<md-icon>close</md-icon>`).
