# Text Field & Scroll Field

## Text Field (`md-text-field`)

```html
<md-text-field label="Name" color="outlined"></md-text-field>

<md-text-field label="Email" color="filled"></md-text-field>

<md-text-field type="color" label="Theme Color" value="#6750a4"></md-text-field>
```

### Supported Types

- `text` (default)
- `textarea`
- `color`
- `date`
- `datetime-local`
- `email`
- `number`
- `password`
- `search`
- `tel`
- `time`
- `url`

---

## Scroll Field (`md-scroll-field` & `md-scroll-field-group`)

Material 3 Expressive **Scroll Fields** provide compact inline vertical wheel/drum inputs for selecting numerical ranges, time segments, durations, or discrete measurement units without opening a modal dialog.

- **Digit Sizes (`size`)**: `'1-2'` (default, 1–2 digits such as hours `00`–`23` or minutes `00`–`59`, aliases `'1'` and `'2'`), `'3'` (3 digits such as `0`–`999`, weights, degrees), `'4'` (4 digits such as years `1900`–`2100`, distances), and `'auto'` (content-sized for text options).
- **Scroll Modes**: **Finite** (`loop` omitted/`false`) stops cleanly at `min` and `max`; **Looping** (`loop`) wraps seamlessly (`... 58, 59, 00, 01 ...`) across mouse wheel, pointer drag, touch scroll, and keyboard navigation.
- **Direct Text Input**: Clicking the active center value—or typing digits/characters while focused—opens inline text editing (`Enter` or `blur` validates, clamps, and snaps to `step` or matching option; `Escape` cancels).
- **Accessible & Form-Associated**: Implements WAI-ARIA `role="spinbutton"` semantics and native `<form>` participation via `ElementInternals`.

### Import

```js
import 'material/text/scroll-field.js'
```

### Usage

#### 1. Digit Sizes (`1-2`, `3`, `4`)

```html
<md-scroll-field size="1-2" min="0" max="59" pad="2" value="5" label="Minutes"></md-scroll-field>

<md-scroll-field size="3" min="0" max="359" value="180" suffix="°" label="Heading"></md-scroll-field>

<md-scroll-field size="4" min="1900" max="2100" value="2026" label="Year"></md-scroll-field>
```

#### 2. Multi-Column Expressive Time Picker (`md-scroll-field-group`)

```html
<md-scroll-field-group label="Alarm Time">
  <md-scroll-field size="1-2" min="1" max="12" value="7" loop label="Hour"></md-scroll-field>
  <span class="separator" aria-hidden="true">:</span>
  <md-scroll-field size="1-2" min="0" max="59" pad="2" value="30" loop label="Min"></md-scroll-field>
  <md-scroll-field options='["AM", "PM"]' value="AM" label="Period"></md-scroll-field>
</md-scroll-field-group>
```

#### 3. Measurement Value + Discrete Unit Options

```html
<md-scroll-field-group label="Target Weight">
  <md-scroll-field size="3" min="30" max="250" step="0.5" value="72.5" label="Weight"></md-scroll-field>
  <md-scroll-field
    options='[{"value":"kg","label":"kg","ariaLabel":"kilograms"},{"value":"lb","label":"lb","ariaLabel":"pounds"}]'
    value="kg"
    label="Unit"></md-scroll-field>
</md-scroll-field-group>
```

#### 4. Form Participation & Validation States

```html
<form id="timer-form">
  <md-scroll-field name="minutes" min="1" max="90" value="25" unit="min" required label="Focus"></md-scroll-field>
  <md-scroll-field value="99" error error-text="Exceeds limit" label="Heart Rate"></md-scroll-field>
  <md-scroll-field value="15" disabled label="Disabled"></md-scroll-field>
  <md-scroll-field value="30" readonly label="Read-only"></md-scroll-field>
</form>
```

---

### API Reference (`md-scroll-field`)

#### Properties & Attributes

| Property         | Attribute         | Type      | Default    | Description                                                                                      |
| ---------------- | ----------------- | --------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `size`           | `size`            | `string`  | `'1-2'`    | Column width preset: `'1-2'` (aliases `'1'`, `'2'`), `'3'`, `'4'`, or `'auto'`.                  |
| `value`          | `value`           | `string`  | `'0'`      | Current canonical value (numeric string in range mode, or option `value` in options mode).       |
| `valueAsNumber`  | —                 | `number`  | `0`        | Numeric representation of `value` (or selected index for non-numeric options).                   |
| `formattedValue` | —                 | `string`  | `'0'`      | Zero-padded display string (`pad`) or active option `label` (read-only getter).                  |
| `min`            | `min`             | `number`  | `0`        | Minimum value in numeric range mode.                                                             |
| `max`            | `max`             | `number`  | `99`       | Maximum value in numeric range mode.                                                             |
| `step`           | `step`            | `number`  | `1`        | Increment step between values in numeric range mode (supports integer and decimal steps).        |
| `pad`            | `pad`             | `number`  | `0`        | Zero-padded integer digit count for display (e.g., `pad="2"` formats `5` as `'05'`).             |
| `options`        | `options`         | `Array`   | `null`     | Discrete options array (`['AM','PM']` or `[{value, label, ariaLabel}]`). JSON attribute allowed. |
| `loop`           | `loop`            | `boolean` | `false`    | Enables seamless infinite wrap-around scrolling instead of finite top/bottom stops.              |
| `label`          | `label`           | `string`  | `''`       | Caption text displayed below (or above) the scroll wheel; also serves as fallback `aria-label`.  |
| `labelPosition`  | `label-position`  | `string`  | `'bottom'` | Placement of `label`: `'bottom'` or `'top'`.                                                     |
| `suffix`         | `suffix`          | `string`  | `''`       | Unit or suffix text rendered beside the selected center value (alias: `unit`).                   |
| `unit`           | `unit`            | `string`  | `''`       | Alias for `suffix` (e.g., `'kg'`, `'°'`, `'min'`).                                               |
| `name`           | `name`            | `string`  | `''`       | Form control name submitted with an owning `<form>`.                                             |
| `disabled`       | `disabled`        | `boolean` | `false`    | Disables all user interaction and excludes the field from form submission.                       |
| `readOnly`       | `readonly`        | `boolean` | `false`    | Prevents changing the value via scrolling, keyboard stepping, or direct text input.              |
| `required`       | `required`        | `boolean` | `false`    | Marks the field as required for native form constraint validation.                               |
| `noTextInput`    | `no-text-input`   | `boolean` | `false`    | Disables inline direct text input while keeping wheel/keyboard stepping active.                  |
| `error`          | `error`           | `boolean` | `false`    | Displays error container styling and sets `aria-invalid="true"`.                                 |
| `errorText`      | `error-text`      | `string`  | `''`       | Error message that replaces `label`/`supporting-text` when `error` is `true`.                    |
| `supportingText` | `supporting-text` | `string`  | `''`       | Fallback caption text when `label` is omitted.                                                   |

#### Methods

| Method                         | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `stepBy(deltaSteps, options?)` | Steps the selection by `deltaSteps` (wraps when `loop` is `true`). |
| `stepUp(n = 1)`                | Increases the selected value by `n` steps.                         |
| `stepDown(n = 1)`              | Decreases the selected value by `n` steps.                         |
| `startEditing(initialText?)`   | Opens inline direct text editing inside the center slot.           |
| `commitEditing()`              | Validates, clamps/snaps, and commits the active text draft.        |
| `cancelEditing()`              | Cancels inline text editing and restores the previous value.       |
| `checkValidity()`              | Returns `true` if the field satisfies form constraint validation.  |
| `reportValidity()`             | Checks validity and reports validation UI to the user if invalid.  |

#### Events

| Event    | Type         | Bubbles | Composed | Description                                                                 |
| -------- | ------------ | ------- | -------- | --------------------------------------------------------------------------- |
| `input`  | `InputEvent` | Yes     | Yes      | Dispatched live as the selected value changes during scroll or user action. |
| `change` | `Event`      | Yes     | Yes      | Dispatched once a scroll gesture settles, step completes, or edit commits.  |

#### Keyboard Navigation (`role="spinbutton"`)

- `ArrowUp` / `ArrowDown`: Increment or decrement by `1 × step` (wraps when `loop` is set).
- `PageUp` / `PageDown`: Increment or decrement by `10 × step`.
- `Home` / `End`: Jump directly to `min` (first option) or `max` (last option).
- `0–9` / character keys, `Enter`, or `F2`: Enter inline direct text editing; `Enter` commits, `Escape` cancels.

#### CSS Custom Properties

| Custom Property                            | Default                                         | Description                                    |
| ------------------------------------------ | ----------------------------------------------- | ---------------------------------------------- |
| `--md-scroll-field-item-height`            | `48px`                                          | Height of each wheel row and center indicator. |
| `--md-scroll-field-width-1-2`              | `88px`                                          | Width for `size="1-2"` (`'1'`, `'2'`).         |
| `--md-scroll-field-width-3`                | `116px`                                         | Width for `size="3"`.                          |
| `--md-scroll-field-width-4`                | `144px`                                         | Width for `size="4"`.                          |
| `--md-scroll-field-container-color`        | `var(--md-sys-color-surface-container)`         | Drum background fill color.                    |
| `--md-scroll-field-container-shape`        | `16px`                                          | Outer drum corner radius.                      |
| `--md-scroll-field-indicator-color`        | `var(--md-sys-color-surface-container-highest)` | Center pill fill when resting.                 |
| `--md-scroll-field-active-indicator-color` | `var(--md-sys-color-secondary-container)`       | Center pill fill when focused or editing.      |
| `--md-scroll-field-indicator-shape`        | `14px`                                          | Center selection pill corner radius.           |
| `--md-scroll-field-selected-text-color`    | `var(--md-sys-color-on-surface)`                | Active center value text color.                |
| `--md-scroll-field-unselected-text-color`  | `var(--md-sys-color-on-surface-variant)`        | Neighboring above/below value text color.      |
| `--md-scroll-field-group-shape`            | `28px`                                          | Corner radius of `<md-scroll-field-group>`.    |
| `--md-scroll-field-group-gap`              | `8px`                                           | Spacing between grouped scroll fields.         |
