# Tooltip

[Material Design 3 Tooltip](https://m3.material.io/components/tooltips/overview).

Tooltips display informative text when users hover over, focus on, or tap an element.

## Import

```js
import 'material/tooltip/tooltip.js'
```

## Usage

### Plain Tooltip

```html
<md-tooltip text="This is a plain tooltip">
  <md-button>Hover me</md-button>
</md-tooltip>
```

### Rich Tooltip

```html
<md-tooltip type="rich">
  <md-button>Hover me</md-button>
  <div slot="headline">Headline</div>
  <div slot="text">Rich tooltip provides additional context and can include actions.</div>
  <div slot="actions">
    <md-button color="text" size="extra-small">Action</md-button>
  </div>
</md-tooltip>
```
