# List

[Material Design 3 Lists](https://m3.material.io/components/lists/overview).

Lists are continuous, vertical indexes of text and images.

## Import

```js
import 'material/list/list.js'
import 'material/list/list-item.js'
```

## Usage

```html
<md-list>
  <!-- Basic item -->
  <md-list-item type="button">
    <div slot="headline">One-line item</div>
  </md-list-item>

  <!-- Item with leading icon -->
  <md-list-item type="button">
    <md-icon slot="start">star</md-icon>
    <div slot="headline">Item with start icon</div>
  </md-list-item>

  <!-- Two-line item with avatar and trailing icon -->
  <md-list-item type="button">
    <img slot="start" src="./avatar.png" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%;" />
    <div slot="headline">Two-line item</div>
    <div slot="supporting-text">Supporting text goes here</div>
    <md-icon slot="end">more_vert</md-icon>
  </md-list-item>

  <!-- Link item -->
  <md-list-item type="link" href="https://example.com" target="_blank">
    <md-icon slot="start">link</md-icon>
    <div slot="headline">Link item</div>
    <md-icon slot="end">open_in_new</md-icon>
  </md-list-item>

  <!-- Disabled item -->
  <md-list-item disabled>
    <md-icon slot="start">block</md-icon>
    <div slot="headline">Disabled item</div>
  </md-list-item>
</md-list>
```
