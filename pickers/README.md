# Date & Time Pickers

[Material 3 Date Pickers](https://m3.material.io/components/date-pickers/overview) and [Material 3 Time Pickers](https://m3.material.io/components/time-pickers/overview).

Date and time pickers let users select dates, times, or date-time combinations via interactive calendar views, clock dials, modal dialogs, or integrated text fields.

## Import

```js
// Individual components
import 'material/pickers/date-picker.js'
import 'material/pickers/time-picker.js'
import 'material/pickers/datetime-picker-dialog.js'

// Or use via text-field (automatically includes the datetime picker dialog)
import 'material/text/text-field.js'
```

## Usage

### Embedded Date Picker

Use `<md-date-picker>` for an inline calendar view:

```html
<md-date-picker id="date-picker" value="2026-09-15"></md-date-picker>

<script>
  const picker = document.getElementById('date-picker')
  picker.addEventListener('change', (e) => {
    console.log('Selected date:', e.target.value) // YYYY-MM-DD
  })
</script>
```

To hide the top headline/subhead header:

```html
<md-date-picker hide-header></md-date-picker>
```

### Date Picker Dialog

Use `<md-datetime-picker-dialog type="date">` to present a modal date selection dialog:

```html
<md-button id="open-btn" color="filled">Select Date</md-button>
<md-datetime-picker-dialog id="date-dialog" type="date"></md-datetime-picker-dialog>

<script>
  const btn = document.getElementById('open-btn')
  const dialog = document.getElementById('date-dialog')

  btn.addEventListener('click', () => {
    dialog.show()
  })

  dialog.addEventListener('confirm', () => {
    console.log('Confirmed date:', dialog.value)
  })
</script>
```

### Embedded Time Picker

Use `<md-time-picker>` for an interactive analog clock dial with hour and minute selection:

```html
<md-time-picker id="time-picker" value="14:30" format="12"></md-time-picker>

<script>
  const picker = document.getElementById('time-picker')
  picker.addEventListener('change', (e) => {
    console.log('Selected time:', e.target.value) // HH:MM (24h format)
  })
</script>
```

### Time Picker Dialog

Use `<md-datetime-picker-dialog type="time">` for a modal time selection dialog:

```html
<md-button id="open-time-btn" color="filled">Select Time</md-button>
<md-datetime-picker-dialog id="time-dialog" type="time"></md-datetime-picker-dialog>

<script>
  const btn = document.getElementById('open-time-btn')
  const dialog = document.getElementById('time-dialog')

  btn.addEventListener('click', () => {
    dialog.show()
  })

  dialog.addEventListener('confirm', () => {
    console.log('Confirmed time:', dialog.value)
  })
</script>
```

### Combined Date & Time Picker Dialog

Use `<md-datetime-picker-dialog type="datetime-local">` to allow selecting both date and time in a single dialog:

```html
<md-button id="open-dt-btn" color="filled">Select Date & Time</md-button>
<md-datetime-picker-dialog id="dt-dialog" type="datetime-local"></md-datetime-picker-dialog>

<script>
  const btn = document.getElementById('open-dt-btn')
  const dialog = document.getElementById('dt-dialog')

  btn.addEventListener('click', () => {
    dialog.show()
  })

  dialog.addEventListener('confirm', () => {
    console.log('Confirmed datetime:', dialog.value) // YYYY-MM-DDTHH:MM
  })
</script>
```

### Pickers via Text Field

`<md-text-field>` has built-in integration with picker dialogs. Setting `type="date"`, `type="time"`, or `type="datetime-local"` automatically adds the appropriate interactive icon button (calendar or clock) that opens the picker dialog and updates the field's value on confirmation:

```html
<!-- Date input with calendar picker -->
<md-text-field label="Birthday" type="date" color="outlined"></md-text-field>

<!-- Time input with clock picker -->
<md-text-field label="Meeting Time" type="time" color="outlined"></md-text-field>

<!-- Date and time input with combined picker -->
<md-text-field label="Appointment" type="datetime-local" color="outlined"></md-text-field>
```

## API Reference

### `<md-date-picker>`

#### Properties & Attributes

| Property     | Attribute     | Type      | Default     | Description                                               |
| ------------ | ------------- | --------- | ----------- | --------------------------------------------------------- |
| `value`      | `value`       | `string`  | `''`        | Selected date in `YYYY-MM-DD` format.                     |
| `min`        | `min`         | `string`  | `undefined` | Earliest selectable date (`YYYY-MM-DD`).                  |
| `max`        | `max`         | `string`  | `undefined` | Latest selectable date (`YYYY-MM-DD`).                    |
| `hideHeader` | `hide-header` | `boolean` | `false`     | When true, hides the top title and selected date display. |

#### Events

| Event    | Description                                                  |
| -------- | ------------------------------------------------------------ |
| `change` | Dispatched when a date is selected. Bubbles and is composed. |
| `input`  | Dispatched on user interaction with the date selection.      |

---

### `<md-time-picker>`

#### Properties & Attributes

| Property | Attribute | Type     | Default   | Description                                |
| -------- | --------- | -------- | --------- | ------------------------------------------ |
| `value`  | `value`   | `string` | `'00:00'` | Selected time in 24-hour `HH:MM` format.   |
| `format` | `format`  | `number` | `12`      | Time format display: `12` (AM/PM) or `24`. |

#### Events

| Event    | Description                                               |
| -------- | --------------------------------------------------------- |
| `change` | Dispatched when time is updated. Bubbles and is composed. |
| `input`  | Dispatched as the clock dial is dragged or clicked.       |

---

### `<md-datetime-picker-dialog>`

#### Properties & Attributes

| Property | Attribute | Type      | Default  | Description                                                   |
| -------- | --------- | --------- | -------- | ------------------------------------------------------------- |
| `open`   | `open`    | `boolean` | `false`  | Whether the dialog is open.                                   |
| `type`   | `type`    | `string`  | `'date'` | Picker type: `'date'`, `'time'`, or `'datetime-local'`.       |
| `value`  | `value`   | `string`  | `''`     | Current value (`YYYY-MM-DD`, `HH:MM`, or `YYYY-MM-DDTHH:MM`). |
| `min`    | `min`     | `string`  | `''`     | Minimum date constraint.                                      |
| `max`    | `max`     | `string`  | `''`     | Maximum date constraint.                                      |
| `format` | `format`  | `number`  | `12`     | Time format (`12` or `24`) for time view.                     |

#### Methods

| Method    | Parameters | Description        |
| --------- | ---------- | ------------------ |
| `show()`  | None       | Opens the dialog.  |
| `close()` | None       | Closes the dialog. |

#### Events

| Event     | Description                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| `confirm` | Dispatched when the user clicks OK. The confirmed value is on `dialog.value`. |
| `cancel`  | Dispatched when the user clicks Cancel.                                       |
| `close`   | Dispatched when the dialog is closed.                                         |
| `change`  | Dispatched when the confirmed value updates.                                  |

## Demos

- [Date Picker Demo](https://material-esm.github.io/material/demo/date-picker-demo.html)
- [Time Picker Demo](https://material-esm.github.io/material/demo/time-picker-demo.html)
- [Material 3 Main Demo (Text Field Pickers)](https://material-esm.github.io/material/demo/)
