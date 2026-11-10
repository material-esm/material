# Tabs

[Material Design 3 Tabs](https://m3.material.io/components/tabs/overview) organize content across different screens, data sets, and views.

## Import

```js
import 'material/tabs/tabs.js'
import 'material/tabs/tab.js'
```

## Usage

### Primary Tabs

```html
<md-tabs @change="${this.tabChanged}" id="tabs">
  <md-tab type="primary" id="photos-tab" aria-controls="photos-panel" badge-value="3">
    <md-icon slot="icon">photo</md-icon>
    Photos
  </md-tab>
  <md-tab type="primary" id="videos-tab" aria-controls="videos-panel" show-badge>
    <md-icon slot="icon">videocam</md-icon>
    Videos
  </md-tab>
  <md-tab type="primary" id="music-tab" aria-controls="music-panel">
    <md-icon slot="icon">music_note</md-icon>
    Music
  </md-tab>
</md-tabs>
```

Add `inline-icon` on `<md-tab type="primary">` to render the icon inline beside the label (`48px` height) instead of stacked (`64px` height).

### Secondary Tabs

```html
<md-tabs>
  <md-tab type="secondary">Overview</md-tab>
  <md-tab type="secondary" badge-value="12">Specifications</md-tab>
  <md-tab type="secondary">Guidelines</md-tab>
</md-tabs>
```

### Scrollable Tabs

Add `scrollable` on `<md-tabs>` for content-sized tabs with M3's `52px` leading edge offset (customizable via `--md-tabs-scrollable-offset`):

```html
<md-tabs scrollable>
  <md-tab type="primary">For you</md-tab>
  <md-tab type="primary">Top charts</md-tab>
  <md-tab type="primary">Children</md-tab>
  <md-tab type="primary">Categories</md-tab>
  <md-tab type="primary">Editors' choice</md-tab>
</md-tabs>
```
