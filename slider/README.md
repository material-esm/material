# Slider

See demo for how these look in real life.

```html
<md-slider @change="${this.changed}" labeled></md-slider>
<!-- stepped values -->
<md-slider @change="${this.changed}" min="0" max="50" step="10" ticks value="10"></md-slider>
<!-- range - two knobs -->
<md-slider @change="${this.changed}" range value-start="25" value-end="75"></md-slider>
```

```js
changed(e){
    console.log(
    'Slider changed',
    e.target.value,
    e.target.valueStart,
    e.target.valueEnd)
}
```
