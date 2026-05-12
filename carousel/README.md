# Carousel

Carousels display a set of items, such as images or cards, that can be scrolled horizontally.

## Example Usage

```html
<script type="module">
  import 'material/carousel/carousel.js'
  import 'material/carousel/carousel-item.js'
  import 'material/card/card.js'
</script>

<md-carousel>
  <md-carousel-item>
    <md-card>Card 1</md-card>
  </md-carousel-item>
  <md-carousel-item>
    <md-card>Card 2</md-card>
  </md-carousel-item>
  <md-carousel-item>
    <md-card>Card 3</md-card>
  </md-carousel-item>
</md-carousel>
```

## CSS Variables

### `<md-carousel>`
* `--md-carousel-gap`: Gap between carousel items (default: `8px`)
* `--md-carousel-padding`: Padding around the carousel scroll container (default: `0`)

### `<md-carousel-item>`
* `--md-carousel-item-width`: Width of the carousel item (default: `300px`)
* `--md-carousel-item-shape`: Border radius of the carousel item (default: `28px`)
