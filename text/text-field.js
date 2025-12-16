/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, css, html, nothing } from 'lit'
import '../internal/field/field.js'
import '../icon/icon.js'
import '../buttons/icon-button.js'
import { literal } from 'lit/static-html.js'
import { classMap } from 'lit/directives/class-map.js'
import { live } from 'lit/directives/live.js'
import { styleMap } from 'lit/directives/style-map.js'
import { html as staticHtml } from 'lit/static-html.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { stringConverter } from '../internal/controller/string-converter.js'
import { redispatchEvent } from '../internal/events/redispatch-event.js'
import {
  createValidator,
  getValidityAnchor,
  mixinConstraintValidation,
} from '../labs/behaviors/constraint-validation.js'
import { mixinElementInternals } from '../labs/behaviors/element-internals.js'
import { getFormValue, mixinFormAssociated } from '../labs/behaviors/form-associated.js'
import { mixinOnReportValidity, onReportValidity } from '../labs/behaviors/on-report-validity.js'
import { TextFieldValidator } from '../labs/behaviors/validators/text-field-validator.js'
// Separate variable needed for closure.
const textFieldBaseClass = mixinOnReportValidity(
  mixinConstraintValidation(mixinFormAssociated(mixinElementInternals(LitElement))),
)
/**
 * A text field component.
 *
 * @fires select {Event} The native `select` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select_event)
 * --bubbles
 * @fires change {Event} The native `change` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)
 * --bubbles
 * @fires input {InputEvent} The native `input` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event)
 * --bubbles --composed
 */
export class TextField extends textFieldBaseClass {
  static properties = {
    error: { type: Boolean },
    errorText: { type: String, attribute: 'error-text' },
    label: { type: String },
    required: { type: Boolean },
    value: { type: String },
    prefixText: { type: String, attribute: 'prefix-text' },
    suffixText: { type: String, attribute: 'suffix-text' },
    hasLeadingIcon: { type: Boolean, attribute: 'hast-leading-icon' },
    hasTrailingIcon: { type: Boolean, attribute: 'hast-trailing-icon' },
    supportingText: { type: String, attribute: 'supporting-text' },
    textDirection: { type: String, attribute: 'text-direction' },
    rows: { type: Number },
    cols: { type: Number },
    inputMode: { type: String },
    max: { type: String },
    maxLength: { type: Number },
    min: { type: String },
    minLength: { type: Number },
    noSpinner: { type: Boolean, attribute: 'no-spinner' },
    pattern: { type: String },
    placeholder: { type: String, reflect: true },
    readOnly: { type: Boolean, reflect: true },
    multiple: { type: Boolean, reflect: true },
    step: { type: String },
    type: { type: String, reflect: true },
    autocomplete: { type: String, reflect: true },
    focused: { type: Boolean, reflect: true },
    nativeError: { type: Boolean, attribute: 'native-error' },
    nativeErrorText: { type: String, attribute: 'native-error-text' },
    dirty: { type: Boolean },
    color: { type: String },
  }
  constructor() {
    super(...arguments)
    /**
     * Gets or sets whether or not the text field is in a visually invalid state.
     *
     * This error state overrides the error state controlled by
     * `reportValidity()`.
     */
    this.error = false
    /**
     * The error message that replaces supporting text when `error` is true. If
     * `errorText` is an empty string, then the supporting text will continue to
     * show.
     *
     * This error message overrides the error message displayed by
     * `reportValidity()`.
     */
    this.errorText = ''
    /**
     * The floating Material label of the textfield component. It informs the user
     * about what information is requested for a text field. It is aligned with
     * the input text, is always visible, and it floats when focused or when text
     * is entered into the textfield. This label also sets accessibilty labels,
     * but the accessible label is overriden by `aria-label`.
     *
     * Learn more about floating labels from the Material Design guidelines:
     * https://m3.material.io/components/text-fields/guidelines
     */
    this.label = ''
    /**
     * Indicates that the user must specify a value for the input before the
     * owning form can be submitted and will render an error state when
     * `reportValidity()` is invoked when value is empty. Additionally the
     * floating label will render an asterisk `"*"` when true.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required
     */
    this.required = false
    /**
     * The current value of the text field. It is always a string.
     */
    this.value = ''
    /**
     * An optional prefix to display before the input value.
     */
    this.prefixText = ''
    /**
     * An optional suffix to display after the input value.
     */
    this.suffixText = ''
    /**
     * Whether or not the text field has a leading icon. Used for SSR.
     */
    this.hasLeadingIcon = false
    /**
     * Whether or not the text field has a trailing icon. Used for SSR.
     */
    this.hasTrailingIcon = false
    /**
     * Conveys additional information below the text field, such as how it should
     * be used.
     */
    this.supportingText = ''
    /**
     * Override the input text CSS `direction`. Useful for RTL languages that use
     * LTR notation for fractions.
     */
    this.textDirection = ''
    /**
     * The number of rows to display for a `color="text"area"` text field.
     * Defaults to 2.
     */
    this.rows = 2
    /**
     * The number of cols to display for a `color="text"area"` text field.
     * Defaults to 20.
     */
    this.cols = 20
    // <input> properties
    this.inputMode = ''
    /**
     * Defines the greatest value in the range of permitted values.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#max
     */
    this.max = ''
    /**
     * The maximum number of characters a user can enter into the text field. Set
     * to -1 for none.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#maxlength
     */
    this.maxLength = -1
    /**
     * Defines the most negative value in the range of permitted values.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#min
     */
    this.min = ''
    /**
     * The minimum number of characters a user can enter into the text field. Set
     * to -1 for none.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#minlength
     */
    this.minLength = -1
    /**
     * When true, hide the spinner for `type="number"` text fields.
     */
    this.noSpinner = false
    /**
     * A regular expression that the text field's value must match to pass
     * constraint validation.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#pattern
     */
    this.pattern = ''
    /**
     * Defines the text displayed in the textfield when it has no value. Provides
     * a brief hint to the user as to the expected type of data that should be
     * entered into the control. Unlike `label`, the placeholder is not visible
     * and does not float when the textfield has a value.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/placeholder
     */
    this.placeholder = ''
    /**
     * Indicates whether or not a user should be able to edit the text field's
     * value.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#readonly
     */
    this.readOnly = false
    /**
     * Indicates that input accepts multiple email addresses.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#multiple
     */
    this.multiple = false
    /**
     * Returns or sets the element's step attribute, which works with min and max
     * to limit the increments at which a numeric or date-time value can be set.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#step
     */
    this.step = ''
    /**
     * The `<input>` type to use, defaults to "text". The type greatly changes how
     * the text field behaves.
     *
     * Text fields support a limited number of `<input>` types:
     *
     * - text
     * - textarea
     * - email
     * - number
     * - password
     * - search
     * - tel
     * - url
     *
     * See
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types
     * for more details on each input type.
     */
    this.type = 'text'
    /**
     * Describes what, if any, type of autocomplete functionality the input
     * should provide.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
     */
    this.autocomplete = ''
    /**
     * Returns true when the text field has been interacted with. Native
     * validation errors only display in response to user interactions.
     */
    this.dirty = false
    this.focused = false
    /**
     * Whether or not a native error has been reported via `reportValidity()`.
     */
    this.nativeError = false
    /**
     * The validation message displayed from a native error via
     * `reportValidity()`.
     */
    this.nativeErrorText = ''

    this.color = 'outlined'
  }
  /**
   * Gets or sets the direction in which selection occurred.
   */
  get selectionDirection() {
    return this.getInputOrTextarea().selectionDirection
  }
  set selectionDirection(value) {
    this.getInputOrTextarea().selectionDirection = value
  }
  /**
   * Gets or sets the end position or offset of a text selection.
   */
  get selectionEnd() {
    return this.getInputOrTextarea().selectionEnd
  }
  set selectionEnd(value) {
    this.getInputOrTextarea().selectionEnd = value
  }
  /**
   * Gets or sets the starting position or offset of a text selection.
   */
  get selectionStart() {
    return this.getInputOrTextarea().selectionStart
  }
  set selectionStart(value) {
    this.getInputOrTextarea().selectionStart = value
  }
  /**
   * The text field's value as a number.
   */
  get valueAsNumber() {
    const input = this.getInput()
    if (!input) {
      return NaN
    }
    return input.valueAsNumber
  }
  set valueAsNumber(value) {
    const input = this.getInput()
    if (!input) {
      return
    }
    input.valueAsNumber = value
    this.value = input.value
  }
  /**
   * The text field's value as a Date.
   */
  get valueAsDate() {
    const input = this.getInput()
    if (!input) {
      return null
    }
    return input.valueAsDate
  }
  set valueAsDate(value) {
    const input = this.getInput()
    if (!input) {
      return
    }
    input.valueAsDate = value
    this.value = input.value
  }
  get hasError() {
    return this.error || this.nativeError
  }
  /**
   * Selects all the text in the text field.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select
   */
  select() {
    this.getInputOrTextarea().select()
  }
  setRangeText(...args) {
    // Calling setRangeText with 1 vs 3-4 arguments has different behavior.
    // Use spread syntax and type casting to ensure correct usage.
    this.getInputOrTextarea().setRangeText(...args)
    this.value = this.getInputOrTextarea().value
  }
  /**
   * Sets the start and end positions of a selection in the text field.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
   *
   * @param start The offset into the text field for the start of the selection.
   * @param end The offset into the text field for the end of the selection.
   * @param direction The direction in which the selection is performed.
   */
  setSelectionRange(start, end, direction) {
    this.getInputOrTextarea().setSelectionRange(start, end, direction)
  }
  /**
   * Decrements the value of a numeric type text field by `step` or `n` `step`
   * number of times.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/stepDown
   *
   * @param stepDecrement The number of steps to decrement, defaults to 1.
   */
  stepDown(stepDecrement) {
    const input = this.getInput()
    if (!input) {
      return
    }
    input.stepDown(stepDecrement)
    this.value = input.value
  }
  /**
   * Increments the value of a numeric type text field by `step` or `n` `step`
   * number of times.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/stepUp
   *
   * @param stepIncrement The number of steps to increment, defaults to 1.
   */
  stepUp(stepIncrement) {
    const input = this.getInput()
    if (!input) {
      return
    }
    input.stepUp(stepIncrement)
    this.value = input.value
  }
  /**
   * Reset the text field to its default value.
   */
  reset() {
    this.dirty = false
    this.value = this.getAttribute('value') ?? ''
    this.nativeError = false
    this.nativeErrorText = ''
  }
  attributeChangedCallback(attribute, newValue, oldValue) {
    if (attribute === 'value' && this.dirty) {
      // After user input, changing the value attribute no longer updates the
      // text field's value (until reset). This matches native <input> behavior.
      return
    }
    super.attributeChangedCallback(attribute, newValue, oldValue)
  }
  render() {
    const classes = {
      disabled: this.disabled,
      error: !this.disabled && this.hasError,
      textarea: this.type === 'textarea',
      'no-spinner': this.noSpinner,
      // filled: this.color == 'filled',
      // outlined: this.color == 'outlined',
    }
    return html`
      <div class="wrapper ${this.color}">
        <span class="text-field ${classMap(classes)}"> ${this.renderField()} </span>
      </div>
    `
  }
  updated(changedProperties) {
    // Keep changedProperties arg so that subclasses may call it
    // If a property such as `type` changes and causes the internal <input>
    // value to change without dispatching an event, re-sync it.
    const value = this.getInputOrTextarea().value
    if (this.value !== value) {
      // Note this is typically inefficient in updated() since it schedules
      // another update. However, it is needed for the <input> to fully render
      // before checking its value.
      this.value = value
    }
    if (changedProperties.has('type')) {
      this.handleIconChange()
    }
  }
  renderField() {
    return staticHtml`<md-field
      color=${this.color}
      class="field"
      count=${this.value.length}
      ?disabled=${this.disabled}
      ?error=${this.hasError}
      error-text=${this.getErrorText()}
      ?focused=${this.focused}
      ?has-end=${this.hasTrailingIcon}
      ?has-start=${this.hasLeadingIcon}
      label=${this.label}
      max=${this.maxLength}
      ?populated=${!!this.value}
      ?required=${this.required}
      ?resizable=${this.type === 'textarea'}
      supporting-text=${this.supportingText}
    >
      ${this.renderLeadingIcon()}
      ${this.renderInputOrTextarea()}
      ${this.renderTrailingIcon()}
      <div id="description" slot="aria-describedby"></div>
    </md-field>`
  }
  renderLeadingIcon() {
    return html`
      <span class="icon leading" slot="start">
        <slot name="leading-icon" @slotchange=${this.handleIconChange}></slot>
      </span>
    `
  }
  renderTrailingIcon() {
    return html`
      <span class="icon trailing" slot="end">
        <slot name="trailing-icon" @slotchange=${this.handleIconChange}>
          ${this.type === 'date' ? this.renderDefaultDateIcon() : nothing}
        </slot>
      </span>
    `
  }
  renderDefaultDateIcon() {
    return html`<md-icon-button
      type="button"
      @click=${this.handleDatePickerRequest}
      ><md-icon>calendar_today</md-icon></md-icon-button
    >`
  }
  handleDatePickerRequest(e) {
    this.dispatchEvent(new Event('request-date-picker', { bubbles: true, composed: true }))
  }
  renderInputOrTextarea() {
    const style = { direction: this.textDirection }
    const ariaLabel = this.ariaLabel || this.label || nothing
    // lit-anaylzer `autocomplete` types are too strict
    // tslint:disable-next-line:no-any
    const autocomplete = this.autocomplete
    // These properties may be set to null if the attribute is removed, and
    // `null > -1` is incorrectly `true`.
    const hasMaxLength = (this.maxLength ?? -1) > -1
    const hasMinLength = (this.minLength ?? -1) > -1
    if (this.type === 'textarea') {
      return html`
        <textarea
          class="input"
          style=${styleMap(style)}
          aria-describedby="description"
          aria-invalid=${this.hasError}
          aria-label=${ariaLabel}
          ?disabled=${this.disabled}
          maxlength=${hasMaxLength ? this.maxLength : nothing}
          minlength=${hasMinLength ? this.minLength : nothing}
          placeholder=${this.placeholder || nothing}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          rows=${this.rows}
          cols=${this.cols}
          .value=${live(this.value)}
          @change=${this.redispatchEvent}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          @input=${this.handleInput}
          @select=${this.redispatchEvent}
          autocomplete=${autocomplete || nothing}></textarea>
      `
    }
    const prefix = this.renderPrefix()
    const suffix = this.renderSuffix()
    // TODO(b/243805848): remove `as unknown as number` and `as any` once lit
    // analyzer is fixed
    // tslint:disable-next-line:no-any
    const inputMode = this.inputMode
    return html`
      <div class="input-wrapper">
        ${prefix}
        <input
          class="input"
          style=${styleMap(style)}
          aria-describedby="description"
          aria-invalid=${this.hasError}
          aria-label=${ariaLabel}
          ?disabled=${this.disabled}
          inputmode=${inputMode || nothing}
          max=${this.max || nothing}
          maxlength=${hasMaxLength ? this.maxLength : nothing}
          min=${this.min || nothing}
          minlength=${hasMinLength ? this.minLength : nothing}
          pattern=${this.pattern || nothing}
          placeholder=${this.placeholder || nothing}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          ?multiple=${this.multiple}
          step=${this.step || nothing}
          type=${this.type}
          .value=${live(this.value)}
          @change=${this.redispatchEvent}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          @input=${this.handleInput}
          @select=${this.redispatchEvent}
          autocomplete=${autocomplete || nothing} />
        ${suffix}
      </div>
    `
  }
  renderPrefix() {
    return this.renderAffix(this.prefixText, /* isSuffix */ false)
  }
  renderSuffix() {
    return this.renderAffix(this.suffixText, /* isSuffix */ true)
  }
  renderAffix(text, isSuffix) {
    if (!text) {
      return nothing
    }
    const classes = {
      suffix: isSuffix,
      prefix: !isSuffix,
    }
    return html`<span class="${classMap(classes)}">${text}</span>`
  }
  getErrorText() {
    return this.error ? this.errorText : this.nativeErrorText
  }
  handleFocusChange() {
    // When calling focus() or reportValidity() during change, it's possible
    // for blur to be called after the new focus event. Rather than set
    // `this.focused` to true/false on focus/blur, we always set it to whether
    // or not the input itself is focused.
    this.focused = this.inputOrTextarea?.matches(':focus') ?? false
  }
  handleInput(event) {
    this.dirty = true
    this.value = event.target.value
  }
  redispatchEvent(event) {
    redispatchEvent(this, event)
  }
  getInputOrTextarea() {
    if (!this.inputOrTextarea) {
      // If the input is not yet defined, synchronously render.
      // e.g.
      // const textField = document.createElement('md-text-field');
      // document.body.appendChild(textField);
      // textField.focus(); // synchronously render
      this.connectedCallback()
      this.scheduleUpdate()
    }
    if (this.isUpdatePending) {
      // If there are pending updates, synchronously perform them. This ensures
      // that constraint validation properties (like `required`) are synced
      // before interacting with input APIs that depend on them.
      this.scheduleUpdate()
    }
    return this.inputOrTextarea
  }
  getInput() {
    if (this.type === 'textarea') {
      return null
    }
    return this.getInputOrTextarea()
  }
  handleIconChange() {
    this.hasLeadingIcon = this.leadingIcons.length > 0
    this.hasTrailingIcon = this.trailingIcons.length > 0 || this.type === 'date'
  }
  [getFormValue]() {
    return this.value
  }
  formResetCallback() {
    this.reset()
  }
  formStateRestoreCallback(state) {
    this.value = state
  }
  focus() {
    // Required for the case that the user slots a focusable element into the
    // leading icon slot such as an iconbutton due to how delegatesFocus works.
    this.getInputOrTextarea().focus()
  }
  [createValidator]() {
    return new TextFieldValidator(() => ({
      state: this,
      renderedControl: this.inputOrTextarea,
    }))
  }
  [getValidityAnchor]() {
    return this.inputOrTextarea
  }
  [onReportValidity](invalidEvent) {
    // Prevent default pop-up behavior.
    invalidEvent?.preventDefault()
    const prevMessage = this.getErrorText()
    this.nativeError = !!invalidEvent
    this.nativeErrorText = this.validationMessage
    if (prevMessage === this.getErrorText()) {
      this.field?.reannounceError()
    }
  }

  /*
    __decorate([
    query('.input')
], TextField.prototype, "inputOrTextarea", void 0);
__decorate([
    query('.field')
], TextField.prototype, "field", void 0);
__decorate([
    queryAssignedElements({ slot: 'leading-icon' })
], TextField.prototype, "leadingIcons", void 0);
__decorate([
    queryAssignedElements({ slot: 'trailing-icon' })
], TextField.prototype, "trailingIcons", void 0);
*/
  get inputOrTextarea() {
    return this.renderRoot?.querySelector('.input')
  }
  get field() {
    return this.renderRoot?.querySelector('.field')
  }
  get leadingIcons() {
    let slots = this.renderRoot?.querySelector("slot[name='leading-icon']")
    if (!slots) return []
    return slots.assignedElements()
    // let slots = this.renderRoot.querySelector(".aria-describedby")
    // return slots.assignedElements()
    // return this.renderRoot.querySelectorAll('.leading')
  }
  get trailingIcons() {
    let slots = this.renderRoot?.querySelector("slot[name='trailing-icon']")
    if (!slots) return []
    return slots.assignedElements()
  }

  static styles = [
    css`
      :host {
        width: inherit;
      }

      .wrapper {
        display: inline-flex;
        outline: none;
        resize: both;
        text-align: start;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        width: 100%;
      }

      .text-field,
      .field {
        width: 100%;
      }

      .text-field {
        display: inline-flex;
      }

      .field {
        cursor: text;
      }

      .disabled .field {
        cursor: default;
      }

      .text-field,
      .textarea .field {
        resize: inherit;
      }

      .icon {
        color: currentColor;
        display: flex;
        fill: currentColor;
      }

      .icon ::slotted(*) {
        display: flex;
      }

      [hasstart] .icon.leading {
        font-size: var(--_leading-icon-size);
        height: var(--_leading-icon-size);
        width: var(--_leading-icon-size);
      }

      [hasend] .icon.trailing {
        font-size: var(--_trailing-icon-size);
        height: var(--_trailing-icon-size);
        width: var(--_trailing-icon-size);
      }

      .input-wrapper {
        display: flex;
      }

      .input-wrapper > * {
        all: inherit;
        padding: 0;
      }

      .input {
        caret-color: var(--_caret-color);
        overflow-x: hidden;
        text-align: inherit;
      }

      .input::placeholder {
        color: currentColor;
        opacity: 1;
      }

      .input::-webkit-calendar-picker-indicator {
        display: none;
      }

      .input::-webkit-search-decoration,
      .input::-webkit-search-cancel-button {
        display: none;
      }

      @media (forced-colors: active) {
        .input {
          background: none;
        }
      }

      .no-spinner .input::-webkit-inner-spin-button,
      .no-spinner .input::-webkit-outer-spin-button {
        display: none;
      }

      .no-spinner .input[type='number'] {
        -moz-appearance: textfield;
      }

      :focus-within .input {
        caret-color: var(--_focus-caret-color);
      }

      .error:focus-within .input {
        caret-color: var(--_error-focus-caret-color);
      }

      .text-field:not(.disabled) .prefix {
        color: var(--_input-text-prefix-color);
      }

      .text-field:not(.disabled) .suffix {
        color: var(--_input-text-suffix-color);
      }

      .text-field:not(.disabled) .input::placeholder {
        color: var(--_input-text-placeholder-color);
      }

      .prefix,
      .suffix {
        text-wrap: nowrap;
        width: min-content;
      }

      .prefix {
        padding-inline-end: var(--_input-text-prefix-trailing-space);
      }

      .suffix {
        padding-inline-start: var(--_input-text-suffix-leading-space);
      }
    `,
    css`
      .wrapper.outlined {
        --_caret-color: var(--md-text-field-caret-color, var(--md-sys-color-primary, #6750a4));
        --_disabled-input-text-color: var(
          --md-text-field-disabled-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-input-text-opacity: var(--md-text-field-disabled-input-text-opacity, 0.38);
        --_disabled-label-text-color: var(
          --md-text-field-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-text-field-disabled-label-text-opacity, 0.38);
        --_disabled-leading-icon-color: var(
          --md-text-field-disabled-leading-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-leading-icon-opacity: var(--md-text-field-disabled-leading-icon-opacity, 0.38);
        --_disabled-outline-color: var(--md-text-field-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-outline-opacity: var(--md-text-field-disabled-outline-opacity, 0.12);
        --_disabled-outline-width: var(--md-text-field-disabled-outline-width, 1px);
        --_disabled-supporting-text-color: var(
          --md-text-field-disabled-supporting-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-supporting-text-opacity: var(--md-text-field-disabled-supporting-text-opacity, 0.38);
        --_disabled-trailing-icon-color: var(
          --md-text-field-disabled-trailing-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-trailing-icon-opacity: var(--md-text-field-disabled-trailing-icon-opacity, 0.38);
        --_error-focus-caret-color: var(--md-text-field-error-focus-caret-color, var(--md-sys-color-error, #b3261e));
        --_error-focus-input-text-color: var(
          --md-text-field-error-focus-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_error-focus-label-text-color: var(
          --md-text-field-error-focus-label-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-focus-leading-icon-color: var(
          --md-text-field-error-focus-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_error-focus-outline-color: var(
          --md-text-field-error-focus-outline-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-focus-supporting-text-color: var(
          --md-text-field-error-focus-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-focus-trailing-icon-color: var(
          --md-text-field-error-focus-trailing-icon-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-hover-input-text-color: var(
          --md-text-field-error-hover-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_error-hover-label-text-color: var(
          --md-text-field-error-hover-label-text-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_error-hover-leading-icon-color: var(
          --md-text-field-error-hover-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_error-hover-outline-color: var(
          --md-text-field-error-hover-outline-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_error-hover-supporting-text-color: var(
          --md-text-field-error-hover-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-hover-trailing-icon-color: var(
          --md-text-field-error-hover-trailing-icon-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_error-input-text-color: var(--md-text-field-error-input-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_error-label-text-color: var(--md-text-field-error-label-text-color, var(--md-sys-color-error, #b3261e));
        --_error-leading-icon-color: var(
          --md-text-field-error-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_error-outline-color: var(--md-text-field-error-outline-color, var(--md-sys-color-error, #b3261e));
        --_error-supporting-text-color: var(
          --md-text-field-error-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-trailing-icon-color: var(
          --md-text-field-error-trailing-icon-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_focus-input-text-color: var(--md-text-field-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_focus-label-text-color: var(--md-text-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_focus-leading-icon-color: var(
          --md-text-field-focus-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_focus-outline-color: var(--md-text-field-focus-outline-color, var(--md-sys-color-primary, #6750a4));
        --_focus-outline-width: var(--md-text-field-focus-outline-width, 3px);
        --_focus-supporting-text-color: var(
          --md-text-field-focus-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_focus-trailing-icon-color: var(
          --md-text-field-focus-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-input-text-color: var(--md-text-field-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_hover-label-text-color: var(--md-text-field-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_hover-leading-icon-color: var(
          --md-text-field-hover-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-outline-color: var(--md-text-field-hover-outline-color, var(--md-sys-color-on-surface, #1d1b20));
        --_hover-outline-width: var(--md-text-field-hover-outline-width, 1px);
        --_hover-supporting-text-color: var(
          --md-text-field-hover-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-trailing-icon-color: var(
          --md-text-field-hover-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_input-text-color: var(--md-text-field-input-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_input-text-font: var(
          --md-text-field-input-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_input-text-line-height: var(
          --md-text-field-input-text-line-height,
          var(--md-sys-typescale-body-large-line-height, 1.5rem)
        );
        --_input-text-placeholder-color: var(
          --md-text-field-input-text-placeholder-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_input-text-prefix-color: var(
          --md-text-field-input-text-prefix-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_input-text-size: var(--md-text-field-input-text-size, var(--md-sys-typescale-body-large-size, 1rem));
        --_input-text-suffix-color: var(
          --md-text-field-input-text-suffix-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_input-text-weight: var(
          --md-text-field-input-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_label-text-color: var(--md-text-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_label-text-font: var(
          --md-text-field-label-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-text-field-label-text-line-height,
          var(--md-sys-typescale-body-large-line-height, 1.5rem)
        );
        --_label-text-populated-line-height: var(
          --md-text-field-label-text-populated-line-height,
          var(--md-sys-typescale-body-small-line-height, 1rem)
        );
        --_label-text-populated-size: var(
          --md-text-field-label-text-populated-size,
          var(--md-sys-typescale-body-small-size, 0.75rem)
        );
        --_label-text-size: var(--md-text-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));
        --_label-text-weight: var(
          --md-text-field-label-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_leading-icon-color: var(--md-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_leading-icon-size: var(--md-text-field-leading-icon-size, 24px);
        --_outline-color: var(--md-text-field-outline-color, var(--md-sys-color-outline, #79747e));
        --_outline-width: var(--md-text-field-outline-width, 1px);
        --_supporting-text-color: var(
          --md-text-field-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_supporting-text-font: var(
          --md-text-field-supporting-text-font,
          var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_supporting-text-line-height: var(
          --md-text-field-supporting-text-line-height,
          var(--md-sys-typescale-body-small-line-height, 1rem)
        );
        --_supporting-text-size: var(
          --md-text-field-supporting-text-size,
          var(--md-sys-typescale-body-small-size, 0.75rem)
        );
        --_supporting-text-weight: var(
          --md-text-field-supporting-text-weight,
          var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_trailing-icon-color: var(
          --md-text-field-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_trailing-icon-size: var(--md-text-field-trailing-icon-size, 24px);
        --_container-shape-start-start: var(
          --md-text-field-container-shape-start-start,
          var(--md-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_container-shape-start-end: var(
          --md-text-field-container-shape-start-end,
          var(--md-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_container-shape-end-end: var(
          --md-text-field-container-shape-end-end,
          var(--md-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_container-shape-end-start: var(
          --md-text-field-container-shape-end-start,
          var(--md-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_leading-space: var(--md-text-field-leading-space, 16px);
        --_trailing-space: var(--md-text-field-trailing-space, 16px);
        --_top-space: var(--md-text-field-top-space, 16px);
        --_bottom-space: var(--md-text-field-bottom-space, 16px);
        --_input-text-prefix-trailing-space: var(--md-text-field-input-text-prefix-trailing-space, 2px);
        --_input-text-suffix-leading-space: var(--md-text-field-input-text-suffix-leading-space, 2px);
        --_focus-caret-color: var(--md-text-field-focus-caret-color, var(--md-sys-color-primary, #6750a4));
        --md-outlined-field-bottom-space: var(--_bottom-space);
        --md-outlined-field-container-shape-end-end: var(--_container-shape-end-end);
        --md-outlined-field-container-shape-end-start: var(--_container-shape-end-start);
        --md-outlined-field-container-shape-start-end: var(--_container-shape-start-end);
        --md-outlined-field-container-shape-start-start: var(--_container-shape-start-start);
        --md-outlined-field-content-color: var(--_input-text-color);
        --md-outlined-field-content-font: var(--_input-text-font);
        --md-outlined-field-content-line-height: var(--_input-text-line-height);
        --md-outlined-field-content-size: var(--_input-text-size);
        --md-outlined-field-content-weight: var(--_input-text-weight);
        --md-outlined-field-disabled-content-color: var(--_disabled-input-text-color);
        --md-outlined-field-disabled-content-opacity: var(--_disabled-input-text-opacity);
        --md-outlined-field-disabled-label-text-color: var(--_disabled-label-text-color);
        --md-outlined-field-disabled-label-text-opacity: var(--_disabled-label-text-opacity);
        --md-outlined-field-disabled-leading-content-color: var(--_disabled-leading-icon-color);
        --md-outlined-field-disabled-leading-content-opacity: var(--_disabled-leading-icon-opacity);
        --md-outlined-field-disabled-outline-color: var(--_disabled-outline-color);
        --md-outlined-field-disabled-outline-opacity: var(--_disabled-outline-opacity);
        --md-outlined-field-disabled-outline-width: var(--_disabled-outline-width);
        --md-outlined-field-disabled-supporting-text-color: var(--_disabled-supporting-text-color);
        --md-outlined-field-disabled-supporting-text-opacity: var(--_disabled-supporting-text-opacity);
        --md-outlined-field-disabled-trailing-content-color: var(--_disabled-trailing-icon-color);
        --md-outlined-field-disabled-trailing-content-opacity: var(--_disabled-trailing-icon-opacity);
        --md-outlined-field-error-content-color: var(--_error-input-text-color);
        --md-outlined-field-error-focus-content-color: var(--_error-focus-input-text-color);
        --md-outlined-field-error-focus-label-text-color: var(--_error-focus-label-text-color);
        --md-outlined-field-error-focus-leading-content-color: var(--_error-focus-leading-icon-color);
        --md-outlined-field-error-focus-outline-color: var(--_error-focus-outline-color);
        --md-outlined-field-error-focus-supporting-text-color: var(--_error-focus-supporting-text-color);
        --md-outlined-field-error-focus-trailing-content-color: var(--_error-focus-trailing-icon-color);
        --md-outlined-field-error-hover-content-color: var(--_error-hover-input-text-color);
        --md-outlined-field-error-hover-label-text-color: var(--_error-hover-label-text-color);
        --md-outlined-field-error-hover-leading-content-color: var(--_error-hover-leading-icon-color);
        --md-outlined-field-error-hover-outline-color: var(--_error-hover-outline-color);
        --md-outlined-field-error-hover-supporting-text-color: var(--_error-hover-supporting-text-color);
        --md-outlined-field-error-hover-trailing-content-color: var(--_error-hover-trailing-icon-color);
        --md-outlined-field-error-label-text-color: var(--_error-label-text-color);
        --md-outlined-field-error-leading-content-color: var(--_error-leading-icon-color);
        --md-outlined-field-error-outline-color: var(--_error-outline-color);
        --md-outlined-field-error-supporting-text-color: var(--_error-supporting-text-color);
        --md-outlined-field-error-trailing-content-color: var(--_error-trailing-icon-color);
        --md-outlined-field-focus-content-color: var(--_focus-input-text-color);
        --md-outlined-field-focus-label-text-color: var(--_focus-label-text-color);
        --md-outlined-field-focus-leading-content-color: var(--_focus-leading-icon-color);
        --md-outlined-field-focus-outline-color: var(--_focus-outline-color);
        --md-outlined-field-focus-outline-width: var(--_focus-outline-width);
        --md-outlined-field-focus-supporting-text-color: var(--_focus-supporting-text-color);
        --md-outlined-field-focus-trailing-content-color: var(--_focus-trailing-icon-color);
        --md-outlined-field-hover-content-color: var(--_hover-input-text-color);
        --md-outlined-field-hover-label-text-color: var(--_hover-label-text-color);
        --md-outlined-field-hover-leading-content-color: var(--_hover-leading-icon-color);
        --md-outlined-field-hover-outline-color: var(--_hover-outline-color);
        --md-outlined-field-hover-outline-width: var(--_hover-outline-width);
        --md-outlined-field-hover-supporting-text-color: var(--_hover-supporting-text-color);
        --md-outlined-field-hover-trailing-content-color: var(--_hover-trailing-icon-color);
        --md-outlined-field-label-text-color: var(--_label-text-color);
        --md-outlined-field-label-text-font: var(--_label-text-font);
        --md-outlined-field-label-text-line-height: var(--_label-text-line-height);
        --md-outlined-field-label-text-populated-line-height: var(--_label-text-populated-line-height);
        --md-outlined-field-label-text-populated-size: var(--_label-text-populated-size);
        --md-outlined-field-label-text-size: var(--_label-text-size);
        --md-outlined-field-label-text-weight: var(--_label-text-weight);
        --md-outlined-field-leading-content-color: var(--_leading-icon-color);
        --md-outlined-field-leading-space: var(--_leading-space);
        --md-outlined-field-outline-color: var(--_outline-color);
        --md-outlined-field-outline-width: var(--_outline-width);
        --md-outlined-field-supporting-text-color: var(--_supporting-text-color);
        --md-outlined-field-supporting-text-font: var(--_supporting-text-font);
        --md-outlined-field-supporting-text-line-height: var(--_supporting-text-line-height);
        --md-outlined-field-supporting-text-size: var(--_supporting-text-size);
        --md-outlined-field-supporting-text-weight: var(--_supporting-text-weight);
        --md-outlined-field-top-space: var(--_top-space);
        --md-outlined-field-trailing-content-color: var(--_trailing-icon-color);
        --md-outlined-field-trailing-space: var(--_trailing-space);
      }
    `,
    css`
      .wrapper.filled {
        --_active-indicator-color: var(
          --md-text-field-active-indicator-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_active-indicator-height: var(--md-text-field-active-indicator-height, 1px);
        --_caret-color: var(--md-text-field-caret-color, var(--md-sys-color-primary, #6750a4));
        --_container-color: var(
          --md-text-field-container-color,
          var(--md-sys-color-surface-container-highest, #e6e0e9)
        );
        --_disabled-active-indicator-color: var(
          --md-text-field-disabled-active-indicator-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-active-indicator-height: var(--md-text-field-disabled-active-indicator-height, 1px);
        --_disabled-active-indicator-opacity: var(--md-text-field-disabled-active-indicator-opacity, 0.38);
        --_disabled-container-color: var(
          --md-text-field-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-container-opacity: var(--md-text-field-disabled-container-opacity, 0.04);
        --_disabled-input-text-color: var(
          --md-text-field-disabled-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-input-text-opacity: var(--md-text-field-disabled-input-text-opacity, 0.38);
        --_disabled-label-text-color: var(
          --md-text-field-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-text-field-disabled-label-text-opacity, 0.38);
        --_disabled-leading-icon-color: var(
          --md-text-field-disabled-leading-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-leading-icon-opacity: var(--md-text-field-disabled-leading-icon-opacity, 0.38);
        --_disabled-supporting-text-color: var(
          --md-text-field-disabled-supporting-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-supporting-text-opacity: var(--md-text-field-disabled-supporting-text-opacity, 0.38);
        --_disabled-trailing-icon-color: var(
          --md-text-field-disabled-trailing-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-trailing-icon-opacity: var(--md-text-field-disabled-trailing-icon-opacity, 0.38);
        --_error-active-indicator-color: var(
          --md-text-field-error-active-indicator-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-focus-active-indicator-color: var(
          --md-text-field-error-focus-active-indicator-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-focus-caret-color: var(--md-text-field-error-focus-caret-color, var(--md-sys-color-error, #b3261e));
        --_error-focus-input-text-color: var(
          --md-text-field-error-focus-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_error-focus-label-text-color: var(
          --md-text-field-error-focus-label-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-focus-leading-icon-color: var(
          --md-text-field-error-focus-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_error-focus-supporting-text-color: var(
          --md-text-field-error-focus-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-focus-trailing-icon-color: var(
          --md-text-field-error-focus-trailing-icon-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-hover-active-indicator-color: var(
          --md-text-field-error-hover-active-indicator-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_error-hover-input-text-color: var(
          --md-text-field-error-hover-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_error-hover-label-text-color: var(
          --md-text-field-error-hover-label-text-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_error-hover-leading-icon-color: var(
          --md-text-field-error-hover-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_error-hover-state-layer-color: var(
          --md-text-field-error-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_error-hover-state-layer-opacity: var(--md-text-field-error-hover-state-layer-opacity, 0.08);
        --_error-hover-supporting-text-color: var(
          --md-text-field-error-hover-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-hover-trailing-icon-color: var(
          --md-text-field-error-hover-trailing-icon-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_error-input-text-color: var(--md-text-field-error-input-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_error-label-text-color: var(--md-text-field-error-label-text-color, var(--md-sys-color-error, #b3261e));
        --_error-leading-icon-color: var(
          --md-text-field-error-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_error-supporting-text-color: var(
          --md-text-field-error-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_error-trailing-icon-color: var(
          --md-text-field-error-trailing-icon-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_focus-active-indicator-color: var(
          --md-text-field-focus-active-indicator-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_focus-active-indicator-height: var(--md-text-field-focus-active-indicator-height, 3px);
        --_focus-input-text-color: var(--md-text-field-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_focus-label-text-color: var(--md-text-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_focus-leading-icon-color: var(
          --md-text-field-focus-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_focus-supporting-text-color: var(
          --md-text-field-focus-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_focus-trailing-icon-color: var(
          --md-text-field-focus-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-active-indicator-color: var(
          --md-text-field-hover-active-indicator-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-active-indicator-height: var(--md-text-field-hover-active-indicator-height, 1px);
        --_hover-input-text-color: var(--md-text-field-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_hover-label-text-color: var(
          --md-text-field-hover-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-leading-icon-color: var(
          --md-text-field-hover-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-state-layer-color: var(
          --md-text-field-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-state-layer-opacity: var(--md-text-field-hover-state-layer-opacity, 0.08);
        --_hover-supporting-text-color: var(
          --md-text-field-hover-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-trailing-icon-color: var(
          --md-text-field-hover-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_input-text-color: var(--md-text-field-input-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_input-text-font: var(
          --md-text-field-input-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_input-text-line-height: var(
          --md-text-field-input-text-line-height,
          var(--md-sys-typescale-body-large-line-height, 1.5rem)
        );
        --_input-text-placeholder-color: var(
          --md-text-field-input-text-placeholder-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_input-text-prefix-color: var(
          --md-text-field-input-text-prefix-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_input-text-size: var(--md-text-field-input-text-size, var(--md-sys-typescale-body-large-size, 1rem));
        --_input-text-suffix-color: var(
          --md-text-field-input-text-suffix-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_input-text-weight: var(
          --md-text-field-input-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_label-text-color: var(--md-text-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_label-text-font: var(
          --md-text-field-label-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-text-field-label-text-line-height,
          var(--md-sys-typescale-body-large-line-height, 1.5rem)
        );
        --_label-text-populated-line-height: var(
          --md-text-field-label-text-populated-line-height,
          var(--md-sys-typescale-body-small-line-height, 1rem)
        );
        --_label-text-populated-size: var(
          --md-text-field-label-text-populated-size,
          var(--md-sys-typescale-body-small-size, 0.75rem)
        );
        --_label-text-size: var(--md-text-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));
        --_label-text-weight: var(
          --md-text-field-label-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_leading-icon-color: var(--md-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_leading-icon-size: var(--md-text-field-leading-icon-size, 24px);
        --_supporting-text-color: var(
          --md-text-field-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_supporting-text-font: var(
          --md-text-field-supporting-text-font,
          var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_supporting-text-line-height: var(
          --md-text-field-supporting-text-line-height,
          var(--md-sys-typescale-body-small-line-height, 1rem)
        );
        --_supporting-text-size: var(
          --md-text-field-supporting-text-size,
          var(--md-sys-typescale-body-small-size, 0.75rem)
        );
        --_supporting-text-weight: var(
          --md-text-field-supporting-text-weight,
          var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_trailing-icon-color: var(
          --md-text-field-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_trailing-icon-size: var(--md-text-field-trailing-icon-size, 24px);
        --_container-shape-start-start: var(
          --md-text-field-container-shape-start-start,
          var(--md-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_container-shape-start-end: var(
          --md-text-field-container-shape-start-end,
          var(--md-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_container-shape-end-end: var(
          --md-text-field-container-shape-end-end,
          var(--md-text-field-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_container-shape-end-start: var(
          --md-text-field-container-shape-end-start,
          var(--md-text-field-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_leading-space: var(--md-text-field-leading-space, 16px);
        --_trailing-space: var(--md-text-field-trailing-space, 16px);
        --_top-space: var(--md-text-field-top-space, 16px);
        --_bottom-space: var(--md-text-field-bottom-space, 16px);
        --_input-text-prefix-trailing-space: var(--md-text-field-input-text-prefix-trailing-space, 2px);
        --_input-text-suffix-leading-space: var(--md-text-field-input-text-suffix-leading-space, 2px);
        --_with-label-top-space: var(--md-text-field-with-label-top-space, 8px);
        --_with-label-bottom-space: var(--md-text-field-with-label-bottom-space, 8px);
        --_focus-caret-color: var(--md-text-field-focus-caret-color, var(--md-sys-color-primary, #6750a4));
        --md-filled-field-active-indicator-color: var(--_active-indicator-color);
        --md-filled-field-active-indicator-height: var(--_active-indicator-height);
        --md-filled-field-bottom-space: var(--_bottom-space);
        --md-filled-field-container-color: var(--_container-color);
        --md-filled-field-container-shape-end-end: var(--_container-shape-end-end);
        --md-filled-field-container-shape-end-start: var(--_container-shape-end-start);
        --md-filled-field-container-shape-start-end: var(--_container-shape-start-end);
        --md-filled-field-container-shape-start-start: var(--_container-shape-start-start);
        --md-filled-field-content-color: var(--_input-text-color);
        --md-filled-field-content-font: var(--_input-text-font);
        --md-filled-field-content-line-height: var(--_input-text-line-height);
        --md-filled-field-content-size: var(--_input-text-size);
        --md-filled-field-content-weight: var(--_input-text-weight);
        --md-filled-field-disabled-active-indicator-color: var(--_disabled-active-indicator-color);
        --md-filled-field-disabled-active-indicator-height: var(--_disabled-active-indicator-height);
        --md-filled-field-disabled-active-indicator-opacity: var(--_disabled-active-indicator-opacity);
        --md-filled-field-disabled-container-color: var(--_disabled-container-color);
        --md-filled-field-disabled-container-opacity: var(--_disabled-container-opacity);
        --md-filled-field-disabled-content-color: var(--_disabled-input-text-color);
        --md-filled-field-disabled-content-opacity: var(--_disabled-input-text-opacity);
        --md-filled-field-disabled-label-text-color: var(--_disabled-label-text-color);
        --md-filled-field-disabled-label-text-opacity: var(--_disabled-label-text-opacity);
        --md-filled-field-disabled-leading-content-color: var(--_disabled-leading-icon-color);
        --md-filled-field-disabled-leading-content-opacity: var(--_disabled-leading-icon-opacity);
        --md-filled-field-disabled-supporting-text-color: var(--_disabled-supporting-text-color);
        --md-filled-field-disabled-supporting-text-opacity: var(--_disabled-supporting-text-opacity);
        --md-filled-field-disabled-trailing-content-color: var(--_disabled-trailing-icon-color);
        --md-filled-field-disabled-trailing-content-opacity: var(--_disabled-trailing-icon-opacity);
        --md-filled-field-error-active-indicator-color: var(--_error-active-indicator-color);
        --md-filled-field-error-content-color: var(--_error-input-text-color);
        --md-filled-field-error-focus-active-indicator-color: var(--_error-focus-active-indicator-color);
        --md-filled-field-error-focus-content-color: var(--_error-focus-input-text-color);
        --md-filled-field-error-focus-label-text-color: var(--_error-focus-label-text-color);
        --md-filled-field-error-focus-leading-content-color: var(--_error-focus-leading-icon-color);
        --md-filled-field-error-focus-supporting-text-color: var(--_error-focus-supporting-text-color);
        --md-filled-field-error-focus-trailing-content-color: var(--_error-focus-trailing-icon-color);
        --md-filled-field-error-hover-active-indicator-color: var(--_error-hover-active-indicator-color);
        --md-filled-field-error-hover-content-color: var(--_error-hover-input-text-color);
        --md-filled-field-error-hover-label-text-color: var(--_error-hover-label-text-color);
        --md-filled-field-error-hover-leading-content-color: var(--_error-hover-leading-icon-color);
        --md-filled-field-error-hover-state-layer-color: var(--_error-hover-state-layer-color);
        --md-filled-field-error-hover-state-layer-opacity: var(--_error-hover-state-layer-opacity);
        --md-filled-field-error-hover-supporting-text-color: var(--_error-hover-supporting-text-color);
        --md-filled-field-error-hover-trailing-content-color: var(--_error-hover-trailing-icon-color);
        --md-filled-field-error-label-text-color: var(--_error-label-text-color);
        --md-filled-field-error-leading-content-color: var(--_error-leading-icon-color);
        --md-filled-field-error-supporting-text-color: var(--_error-supporting-text-color);
        --md-filled-field-error-trailing-content-color: var(--_error-trailing-icon-color);
        --md-filled-field-focus-active-indicator-color: var(--_focus-active-indicator-color);
        --md-filled-field-focus-active-indicator-height: var(--_focus-active-indicator-height);
        --md-filled-field-focus-content-color: var(--_focus-input-text-color);
        --md-filled-field-focus-label-text-color: var(--_focus-label-text-color);
        --md-filled-field-focus-leading-content-color: var(--_focus-leading-icon-color);
        --md-filled-field-focus-supporting-text-color: var(--_focus-supporting-text-color);
        --md-filled-field-focus-trailing-content-color: var(--_focus-trailing-icon-color);
        --md-filled-field-hover-active-indicator-color: var(--_hover-active-indicator-color);
        --md-filled-field-hover-active-indicator-height: var(--_hover-active-indicator-height);
        --md-filled-field-hover-content-color: var(--_hover-input-text-color);
        --md-filled-field-hover-label-text-color: var(--_hover-label-text-color);
        --md-filled-field-hover-leading-content-color: var(--_hover-leading-icon-color);
        --md-filled-field-hover-state-layer-color: var(--_hover-state-layer-color);
        --md-filled-field-hover-state-layer-opacity: var(--_hover-state-layer-opacity);
        --md-filled-field-hover-supporting-text-color: var(--_hover-supporting-text-color);
        --md-filled-field-hover-trailing-content-color: var(--_hover-trailing-icon-color);
        --md-filled-field-label-text-color: var(--_label-text-color);
        --md-filled-field-label-text-font: var(--_label-text-font);
        --md-filled-field-label-text-line-height: var(--_label-text-line-height);
        --md-filled-field-label-text-populated-line-height: var(--_label-text-populated-line-height);
        --md-filled-field-label-text-populated-size: var(--_label-text-populated-size);
        --md-filled-field-label-text-size: var(--_label-text-size);
        --md-filled-field-label-text-weight: var(--_label-text-weight);
        --md-filled-field-leading-content-color: var(--_leading-icon-color);
        --md-filled-field-leading-space: var(--_leading-space);
        --md-filled-field-supporting-text-color: var(--_supporting-text-color);
        --md-filled-field-supporting-text-font: var(--_supporting-text-font);
        --md-filled-field-supporting-text-line-height: var(--_supporting-text-line-height);
        --md-filled-field-supporting-text-size: var(--_supporting-text-size);
        --md-filled-field-supporting-text-weight: var(--_supporting-text-weight);
        --md-filled-field-top-space: var(--_top-space);
        --md-filled-field-trailing-content-color: var(--_trailing-icon-color);
        --md-filled-field-trailing-space: var(--_trailing-space);
        --md-filled-field-with-label-bottom-space: var(--_with-label-bottom-space);
        --md-filled-field-with-label-top-space: var(--_with-label-top-space);
      }
    `,
  ]
}
;(() => {
  requestUpdateOnAriaChange(TextField)
})()
/** @nocollapse */
TextField.shadowRootOptions = {
  ...LitElement.shadowRootOptions,
  delegatesFocus: true,
}

customElements.define('md-text-field', TextField)
