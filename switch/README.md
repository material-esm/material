# Switch

[Material Design 3 Switch component](https://m3.material.io/components/switch/overview).

## Import

```js
import 'material/switch/switch.js'
```

## Usage

```html
<md-switch></md-switch>

<!-- With selected state -->
<md-switch selected></md-switch>

<!-- With icons -->
<md-switch icons></md-switch>

<!-- Listening to change events -->
<md-switch id="basic-switch"></md-switch>

<script>
  document.querySelector('#basic-switch').addEventListener('change', (e) => {
    console.log(e.target.selected)
  })
</script>
```

Or in a Lit element template:

```js
html`<md-switch @change=${(e) => console.log(e.target.selected)}></md-switch>`
```
