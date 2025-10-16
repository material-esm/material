# Slider

```html
<md-slider @change="${this.changed}" labeled></md-slider>
<md-slider @change="${this.changed}" ticks value="50"></md-slider>
<md-slider @change="${this.changed}" range value-start="25" value-end="75"></md-slider>
>
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
