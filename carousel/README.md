# Carousel

[Material Design 3 Carousel component](https://m3.material.io/components/carousel/overview).

Carousels show a scrollable collection of items with dynamic sizing, snapping, navigation buttons, and pagination indicators.

## Usage

```js
import 'material/carousel/carousel.js'
import 'material/carousel/carousel-item.js'
```

### Basic Multi-Browse Carousel (Default)

```html
<md-carousel>
  <md-carousel-item headline="Image 1" subhead="Subtitle description">
    <img src="photo1.jpg" alt="Photo 1" />
  </md-carousel-item>
  <md-carousel-item headline="Image 2" subhead="Subtitle description">
    <img src="photo2.jpg" alt="Photo 2" />
  </md-carousel-item>
  <md-carousel-item headline="Image 3" subhead="Subtitle description">
    <img src="photo3.jpg" alt="Photo 3" />
  </md-carousel-item>
</md-carousel>
```

### Uncontained Layout

```html
<md-carousel layout="uncontained" item-width="320px">
  <md-carousel-item>
    <md-card type="outlined" class="p16">
      <h3>Card 1</h3>
      <p>Card content</p>
    </md-card>
  </md-carousel-item>
  <md-carousel-item>
    <md-card type="outlined" class="p16">
      <h3>Card 2</h3>
      <p>Card content</p>
    </md-card>
  </md-carousel-item>
</md-carousel>
```

### Hero Layout (Start-aligned)

```html
<md-carousel layout="hero" indicators>
  <md-carousel-item headline="Featured Product" subhead="New Release">
    <img src="hero1.jpg" alt="Hero 1" />
  </md-carousel-item>
  <md-carousel-item headline="Special Offer" subhead="Limited time">
    <img src="hero2.jpg" alt="Hero 2" />
  </md-carousel-item>
</md-carousel>
```

### Centered-Hero Layout

```html
<md-carousel layout="centered-hero" indicators loop>
  <md-carousel-item headline="Movie 1">
    <img src="poster1.jpg" alt="Poster 1" />
  </md-carousel-item>
  <md-carousel-item headline="Movie 2">
    <img src="poster2.jpg" alt="Poster 2" />
  </md-carousel-item>
  <md-carousel-item headline="Movie 3">
    <img src="poster3.jpg" alt="Poster 3" />
  </md-carousel-item>
</md-carousel>
```

### Full-Screen Layout

```html
<md-carousel layout="full-screen" indicators autoplay="5000" loop style="height: 400px;">
  <md-carousel-item headline="Slide 1">
    <img src="slide1.jpg" alt="Slide 1" />
  </md-carousel-item>
  <md-carousel-item headline="Slide 2">
    <img src="slide2.jpg" alt="Slide 2" />
  </md-carousel-item>
</md-carousel>
```

---

## `<md-carousel>` Properties & Attributes

| Property / Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `layout` | `'multi-browse' \| 'uncontained' \| 'hero' \| 'centered-hero' \| 'full-screen'` | `'multi-browse'` | Carousel layout strategy. |
| `item-width` / `itemWidth` | `string` | `''` | Custom item width (e.g. `'300px'`). |
| `item-spacing` / `itemSpacing` | `number` | `8` | Spacing between items in px. |
| `navigation` | `'auto' \| 'always' \| 'none'` | `'auto'` | Controls visibility of previous/next navigation buttons. |
| `indicators` | `boolean` | `false` | When true, shows pagination indicator dots. |
| `autoplay` | `number` | `0` | Delay in milliseconds for automatic sliding (0 = disabled). |
| `loop` | `boolean` | `false` | When true, wraps navigation around when reaching edges. |
| `active-index` / `activeIndex` | `number` | `0` | 0-based index of the currently active slide. |
| `scroll-snap` / `scrollSnap` | `boolean` | `true` | Enables/disables CSS scroll-snapping. |
| `hide-scrollbar` / `hideScrollbar` | `boolean` | `true` | Hides the horizontal scrollbar. |

### Methods

- `next()`: Scrolls to the next slide.
- `previous()`: Scrolls to the previous slide.
- `scrollToIndex(index, behavior = 'smooth')`: Scrolls to a specific slide index.

### Events

- `change`: Dispatched when the active item changes. `event.detail` contains `{ index, item }`.
- `scroll`: Dispatched when the carousel is scrolled.

---

## `<md-carousel-item>` Properties & Attributes

| Property / Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `shape` | `string` | `'var(--md-sys-shape-corner-extra-large, 28px)'` | Corner radius or shape (`'small'`, `'medium'`, `'large'`, `'extra-large'`, `'full'`). |
| `type` | `'filled' \| 'elevated' \| 'outlined' \| ''` | `''` | Container card style variant. |
| `interactive` | `boolean` | `false` | Enables ripple, focus-ring, and hover elevation effects. |
| `href` | `string` | `''` | Link URL when clicking the carousel item. |
| `target` | `string` | `''` | Target window for link (`'_blank'`, etc.). |
| `headline` | `string` | `''` | Headline text overlay. |
| `subhead` | `string` | `''` | Subhead text overlay. |

### Slots

- `(default)`: Media or card content (images, custom elements).
- `headline`: Custom headline content.
- `subhead`: Custom subhead content.
- `scrim`: Custom scrim overlay.
- `action`: Action buttons or icons in the item overlay.
