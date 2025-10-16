import '../focus/focus-ring.js'
import '../ripple/ripple.js'
import { html, isServer, LitElement, nothing, css } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { dispatchActivationClick, isActivationClick } from '../internal/events/form-label-activation.js'
import { redispatchEvent } from '../internal/events/redispatch-event.js'
import {
  createValidator,
  getValidityAnchor,
  mixinConstraintValidation,
} from '../labs/behaviors/constraint-validation.js'
import { mixinElementInternals } from '../labs/behaviors/element-internals.js'
import { getFormState, getFormValue, mixinFormAssociated } from '../labs/behaviors/form-associated.js'
import { CheckboxValidator } from '../labs/behaviors/validators/checkbox-validator.js'
// Separate variable needed for closure.
const checkboxBaseClass = mixinConstraintValidation(mixinFormAssociated(mixinElementInternals(LitElement)))
/**
 * A checkbox component.
 *
 *
 * @fires change {Event} The native `change` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)
 * --bubbles
 * @fires input {InputEvent} The native `input` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event)
 * --bubbles --composed
 */
export class Checkbox extends checkboxBaseClass {
  static properties = {
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    value: { type: String },
    prevChecked: { type: Boolean },
    prevDisabled: { type: Boolean },
    prevIndeterminate: { type: Boolean },
  }
  constructor() {
    super()
    /**
     * Whether or not the checkbox is selected.
     */
    this.checked = false
    /**
     * Whether or not the checkbox is indeterminate.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#indeterminate_state_checkboxes
     */
    this.indeterminate = false
    /**
     * When true, require the checkbox to be selected when participating in
     * form submission.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#validation
     */
    this.required = false
    /**
     * The value of the checkbox that is submitted with a form when selected.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value
     */
    this.value = 'on'
    this.prevChecked = false
    this.prevDisabled = false
    this.prevIndeterminate = false
    if (!isServer) {
      this.addEventListener('click', (event) => {
        if (!isActivationClick(event) || !this.input) {
          return
        }
        this.focus()
        dispatchActivationClick(this.input)
      })
    }
  }
  update(changed) {
    if (changed.has('checked') || changed.has('disabled') || changed.has('indeterminate')) {
      this.prevChecked = changed.get('checked') ?? this.checked
      this.prevDisabled = changed.get('disabled') ?? this.disabled
      this.prevIndeterminate = changed.get('indeterminate') ?? this.indeterminate
    }
    super.update(changed)
  }
  render() {
    const prevNone = !this.prevChecked && !this.prevIndeterminate
    const prevChecked = this.prevChecked && !this.prevIndeterminate
    const prevIndeterminate = this.prevIndeterminate
    const isChecked = this.checked && !this.indeterminate
    const isIndeterminate = this.indeterminate
    const containerClasses = classMap({
      disabled: this.disabled,
      selected: isChecked || isIndeterminate,
      unselected: !isChecked && !isIndeterminate,
      checked: isChecked,
      indeterminate: isIndeterminate,
      'prev-unselected': prevNone,
      'prev-checked': prevChecked,
      'prev-indeterminate': prevIndeterminate,
      'prev-disabled': this.prevDisabled,
    })
    // Needed for closure conformance
    const { ariaLabel, ariaInvalid } = this
    // Note: <input> needs to be rendered before the <svg> for
    // form.reportValidity() to work in Chrome.
    return html`
      <div class="container ${containerClasses}">
        <input
          type="checkbox"
          id="input"
          aria-checked=${isIndeterminate ? 'mixed' : nothing}
          aria-label=${ariaLabel || nothing}
          aria-invalid=${ariaInvalid || nothing}
          ?disabled=${this.disabled}
          ?required=${this.required}
          .indeterminate=${this.indeterminate}
          .checked=${this.checked}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />

        <div class="outline"></div>
        <div class="background"></div>
        <md-focus-ring part="focus-ring" for="input"></md-focus-ring>
        <md-ripple for="input" ?disabled=${this.disabled}></md-ripple>
        <svg class="icon" viewBox="0 0 18 18" aria-hidden="true">
          <rect class="mark short" />
          <rect class="mark long" />
        </svg>
      </div>
    `
  }
  handleInput(event) {
    const target = event.target
    this.checked = target.checked
    this.indeterminate = target.indeterminate
    // <input> 'input' event bubbles and is composed, don't re-dispatch it.
  }
  handleChange(event) {
    // <input> 'change' event is not composed, re-dispatch it.
    redispatchEvent(this, event)
  }
  [getFormValue]() {
    if (!this.checked || this.indeterminate) {
      return null
    }
    return this.value
  }
  [getFormState]() {
    return String(this.checked)
  }
  formResetCallback() {
    // The checked property does not reflect, so the original attribute set by
    // the user is used to determine the default value.
    this.checked = this.hasAttribute('checked')
  }
  formStateRestoreCallback(state) {
    this.checked = state === 'true'
  }
  [createValidator]() {
    return new CheckboxValidator(() => this)
  }
  [getValidityAnchor]() {
    return this.input
  }
  static styles = [
    css`
      :host {
        border-start-start-radius: var(
          --md-checkbox-container-shape-start-start,
          var(--md-checkbox-container-shape, 2px)
        );
        border-start-end-radius: var(--md-checkbox-container-shape-start-end, var(--md-checkbox-container-shape, 2px));
        border-end-end-radius: var(--md-checkbox-container-shape-end-end, var(--md-checkbox-container-shape, 2px));
        border-end-start-radius: var(--md-checkbox-container-shape-end-start, var(--md-checkbox-container-shape, 2px));
        display: inline-flex;
        height: var(--md-checkbox-container-size, 18px);
        position: relative;
        vertical-align: top;
        width: var(--md-checkbox-container-size, 18px);
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        cursor: pointer;
      }
      :host([disabled]) {
        cursor: default;
      }
      :host([touch-target='wrapper']) {
        margin: max(0px, (48px - var(--md-checkbox-container-size, 18px))/2);
      }
      md-focus-ring {
        height: 44px;
        inset: unset;
        width: 44px;
      }
      input {
        appearance: none;
        height: 48px;
        margin: 0;
        opacity: 0;
        outline: none;
        position: absolute;
        width: 48px;
        z-index: 1;
        cursor: inherit;
      }
      :host([touch-target='none']) input {
        height: 100%;
        width: 100%;
      }
      .container {
        border-radius: inherit;
        display: flex;
        height: 100%;
        place-content: center;
        place-items: center;
        position: relative;
        width: 100%;
      }
      .outline,
      .background,
      .icon {
        inset: 0;
        position: absolute;
      }
      .outline,
      .background {
        border-radius: inherit;
      }
      .outline {
        border-color: var(--md-checkbox-outline-color, var(--md-sys-color-on-surface-variant, #49454f));
        border-style: solid;
        border-width: var(--md-checkbox-outline-width, 2px);
        box-sizing: border-box;
      }
      .background {
        background-color: var(--md-checkbox-selected-container-color, var(--md-sys-color-primary, #6750a4));
      }
      .background,
      .icon {
        opacity: 0;
        transition-duration: 150ms, 50ms;
        transition-property: transform, opacity;
        transition-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15), linear;
        transform: scale(0.6);
      }
      :where(.selected) :is(.background, .icon) {
        opacity: 1;
        transition-duration: 350ms, 50ms;
        transition-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1), linear;
        transform: scale(1);
      }
      md-ripple {
        border-radius: var(--md-checkbox-state-layer-shape, var(--md-sys-shape-corner-full, 9999px));
        height: var(--md-checkbox-state-layer-size, 40px);
        inset: unset;
        width: var(--md-checkbox-state-layer-size, 40px);
        --md-ripple-hover-color: var(--md-checkbox-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));
        --md-ripple-hover-opacity: var(--md-checkbox-hover-state-layer-opacity, 0.08);
        --md-ripple-pressed-color: var(--md-checkbox-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));
        --md-ripple-pressed-opacity: var(--md-checkbox-pressed-state-layer-opacity, 0.12);
      }
      .selected md-ripple {
        --md-ripple-hover-color: var(
          --md-checkbox-selected-hover-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --md-ripple-hover-opacity: var(--md-checkbox-selected-hover-state-layer-opacity, 0.08);
        --md-ripple-pressed-color: var(
          --md-checkbox-selected-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --md-ripple-pressed-opacity: var(--md-checkbox-selected-pressed-state-layer-opacity, 0.12);
      }
      .icon {
        fill: var(--md-checkbox-selected-icon-color, var(--md-sys-color-on-primary, #fff));
        height: var(--md-checkbox-icon-size, 18px);
        width: var(--md-checkbox-icon-size, 18px);
      }
      .mark.short {
        height: 2px;
        transition-property: transform, height;
        width: 2px;
      }
      .mark.long {
        height: 2px;
        transition-property: transform, width;
        width: 10px;
      }
      .mark {
        animation-duration: 150ms;
        animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
        transition-duration: 150ms;
        transition-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
      }
      .selected .mark {
        animation-duration: 350ms;
        animation-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1);
        transition-duration: 350ms;
        transition-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1);
      }
      .checked .mark,
      .prev-checked.unselected .mark {
        transform: scaleY(-1) translate(7px, -14px) rotate(45deg);
      }
      .checked .mark.short,
      .prev-checked.unselected .mark.short {
        height: 5.6568542495px;
      }
      .checked .mark.long,
      .prev-checked.unselected .mark.long {
        width: 11.313708499px;
      }
      .indeterminate .mark,
      .prev-indeterminate.unselected .mark {
        transform: scaleY(-1) translate(4px, -10px) rotate(0deg);
      }
      .prev-unselected .mark {
        transition-property: none;
      }
      .prev-unselected.checked .mark.long {
        animation-name: prev-unselected-to-checked;
      }
      @keyframes prev-unselected-to-checked {
        from {
          width: 0;
        }
      }
      :where(:hover) .outline {
        border-color: var(--md-checkbox-hover-outline-color, var(--md-sys-color-on-surface, #1d1b20));
        border-width: var(--md-checkbox-hover-outline-width, 2px);
      }
      :where(:hover) .background {
        background: var(--md-checkbox-selected-hover-container-color, var(--md-sys-color-primary, #6750a4));
      }
      :where(:hover) .icon {
        fill: var(--md-checkbox-selected-hover-icon-color, var(--md-sys-color-on-primary, #fff));
      }
      :where(:focus-within) .outline {
        border-color: var(--md-checkbox-focus-outline-color, var(--md-sys-color-on-surface, #1d1b20));
        border-width: var(--md-checkbox-focus-outline-width, 2px);
      }
      :where(:focus-within) .background {
        background: var(--md-checkbox-selected-focus-container-color, var(--md-sys-color-primary, #6750a4));
      }
      :where(:focus-within) .icon {
        fill: var(--md-checkbox-selected-focus-icon-color, var(--md-sys-color-on-primary, #fff));
      }
      :where(:active) .outline {
        border-color: var(--md-checkbox-pressed-outline-color, var(--md-sys-color-on-surface, #1d1b20));
        border-width: var(--md-checkbox-pressed-outline-width, 2px);
      }
      :where(:active) .background {
        background: var(--md-checkbox-selected-pressed-container-color, var(--md-sys-color-primary, #6750a4));
      }
      :where(:active) .icon {
        fill: var(--md-checkbox-selected-pressed-icon-color, var(--md-sys-color-on-primary, #fff));
      }
      :where(.disabled, .prev-disabled) :is(.background, .icon, .mark) {
        animation-duration: 0s;
        transition-duration: 0s;
      }
      :where(.disabled) .outline {
        border-color: var(--md-checkbox-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));
        border-width: var(--md-checkbox-disabled-outline-width, 2px);
        opacity: var(--md-checkbox-disabled-container-opacity, 0.38);
      }
      :where(.selected.disabled) .outline {
        visibility: hidden;
      }
      :where(.selected.disabled) .background {
        background: var(--md-checkbox-selected-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));
        opacity: var(--md-checkbox-selected-disabled-container-opacity, 0.38);
      }
      :where(.disabled) .icon {
        fill: var(--md-checkbox-selected-disabled-icon-color, var(--md-sys-color-surface, #fef7ff));
      }
      @media (forced-colors: active) {
        .background {
          background-color: CanvasText;
        }
        .selected.disabled .background {
          background-color: GrayText;
          opacity: 1;
        }
        .outline {
          border-color: CanvasText;
        }
        .disabled .outline {
          border-color: GrayText;
          opacity: 1;
        }
        .icon {
          fill: Canvas;
        }
      }
    `,
  ]
}
;(() => {
  requestUpdateOnAriaChange(Checkbox)
})()
/** @nocollapse */
Checkbox.shadowRootOptions = {
  ...LitElement.shadowRootOptions,
  delegatesFocus: true,
}
customElements.define('md-checkbox', Checkbox)
