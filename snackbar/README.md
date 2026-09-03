# Snackbar

This is a Material 3 snackbar component.

## Import

```js
import 'material/snackbar/snackbar.js'
// or import the helper function:
import { snack } from 'material/snackbar/snackbar.js'
```

## Usage

```html
<md-snackbar message="Hello World!" open></md-snackbar>
```

Show it programmatically:

```js
snackbar.show()
```

There is also a helper method that will create the HTML element and show it:

```js
snack('Hello World!')
```

Or with more features:

```js
snack('Hello world!', {
  action: {
    label: 'Undo',
    onClick: () => {
      console.log('Undo clicked')
    },
  },
  showCloseIcon: true,
})
```

See demo for full example.
