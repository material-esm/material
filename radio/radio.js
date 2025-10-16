var _a
import '../focus/focus-ring.js'
import '../ripple/ripple.js'
import { html, isServer, LitElement, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { isActivationClick } from '../internal/events/form-label-activation.js'
import {
  createValidator,
  getValidityAnchor,
  mixinConstraintValidation,
} from '../labs/behaviors/constraint-validation.js'
import { internals, mixinElementInternals } from '../labs/behaviors/element-internals.js'
import { getFormState, getFormValue, mixinFormAssociated } from '../labs/behaviors/form-associated.js'
import { RadioValidator } from '../labs/behaviors/validators/radio-validator.js'
const CHECKED = Symbol('checked')
let maskId = 0
// Separate variable needed for closure.
const radioBaseClass = mixinConstraintValidation(mixinFormAssociated(mixinElementInternals(LitElement)))
/**
 * A radio component.
 *
 * @fires input {InputEvent} Dispatched when the value changes from user
 * interaction. --bubbles
 * @fires change {Event} Dispatched when the value changes from user
 * interaction. --bubbles --composed
 */
export class Radio extends radioBaseClass {
  static properties = {
    checked: { type: Boolean, reflect: true },
    required: { type: Boolean },
    value: { type: String },
  }
  /**
   * Whether or not the radio is selected.
   */
  get checked() {
    return this[CHECKED]
  }
  set checked(checked) {
    const wasChecked = this.checked
    if (wasChecked === checked) {
      return
    }
    this[CHECKED] = checked
    this.requestUpdate('checked', wasChecked)
    this.selectionController.handleCheckedChange()
  }
  constructor() {
    super()
    // Unique maskId is required because of a Safari bug that fail to persist
    // reference to the mask. This should be removed once the bug is fixed.
    this.maskId = `cutout${++maskId}`
    this[_a] = false
    /**
     * Whether or not the radio is required. If any radio is required in a group,
     * all radios are implicitly required.
     */
    this.required = false
    /**
     * The element value to use in form submission when checked.
     */
    this.value = 'on'
    this.selectionController = new SingleSelectionController(this)
    this.addController(this.selectionController)
    if (!isServer) {
      this[internals].role = 'radio'
      this.addEventListener('click', this.handleClick.bind(this))
      this.addEventListener('keydown', this.handleKeydown.bind(this))
    }
  }
  render() {
    const classes = { checked: this.checked }
    return html`
      <div class="container ${classMap(classes)}" aria-hidden="true">
        <md-ripple part="ripple" .control=${this} ?disabled=${this.disabled}></md-ripple>
        <md-focus-ring part="focus-ring" .control=${this}></md-focus-ring>
        <svg class="icon" viewBox="0 0 20 20">
          <mask id="${this.maskId}">
            <rect width="100%" height="100%" fill="white" />
            <circle cx="10" cy="10" r="8" fill="black" />
          </mask>
          <circle class="outer circle" cx="10" cy="10" r="10" mask="url(#${this.maskId})" />
          <circle class="inner circle" cx="10" cy="10" r="5" />
        </svg>

        <input
          id="input"
          type="radio"
          tabindex="-1"
          .checked=${this.checked}
          .value=${this.value}
          ?disabled=${this.disabled}
        />
      </div>
    `
  }
  updated() {
    this[internals].ariaChecked = String(this.checked)
  }
  async handleClick(event) {
    if (this.disabled) {
      return
    }
    // allow event to propagate to user code after a microtask.
    await 0
    if (event.defaultPrevented) {
      return
    }
    if (isActivationClick(event)) {
      this.focus()
    }
    // Per spec, clicking on a radio input always selects it.
    this.checked = true
    this.dispatchEvent(new Event('change', { bubbles: true }))
    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
  }
  async handleKeydown(event) {
    // allow event to propagate to user code after a microtask.
    await 0
    if (event.key !== ' ' || event.defaultPrevented) {
      return
    }
    this.click()
  }
  [((_a = CHECKED), getFormValue)]() {
    return this.checked ? this.value : null
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
    return new RadioValidator(() => {
      if (!this.selectionController) {
        // Validation runs on superclass construction, so selection controller
        // might not actually be ready until this class constructs.
        return [this]
      }
      return this.selectionController.controls
    })
  }
  [getValidityAnchor]() {
    return this.container
  }
  static styles = [
    css`
      @layer {
        :host {
          display: inline-flex;
          height: var(--md-radio-icon-size, 20px);
          outline: none;
          position: relative;
          vertical-align: top;
          width: var(--md-radio-icon-size, 20px);
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          cursor: pointer;
          --md-ripple-hover-color: var(--md-radio-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));
          --md-ripple-hover-opacity: var(--md-radio-hover-state-layer-opacity, 0.08);
          --md-ripple-pressed-color: var(--md-radio-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));
          --md-ripple-pressed-opacity: var(--md-radio-pressed-state-layer-opacity, 0.12);
        }
        :host([disabled]) {
          cursor: default;
        }
        :host([touch-target='wrapper']) {
          margin: max(0px, (48px - var(--md-radio-icon-size, 20px))/2);
        }
        .container {
          display: flex;
          height: 100%;
          place-content: center;
          place-items: center;
          width: 100%;
        }
        md-focus-ring {
          height: 44px;
          inset: unset;
          width: 44px;
        }
        .checked {
          --md-ripple-hover-color: var(
            --md-radio-selected-hover-state-layer-color,
            var(--md-sys-color-primary, #6750a4)
          );
          --md-ripple-hover-opacity: var(--md-radio-selected-hover-state-layer-opacity, 0.08);
          --md-ripple-pressed-color: var(
            --md-radio-selected-pressed-state-layer-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --md-ripple-pressed-opacity: var(--md-radio-selected-pressed-state-layer-opacity, 0.12);
        }
        input {
          appearance: none;
          height: 48px;
          margin: 0;
          position: absolute;
          width: 48px;
          cursor: inherit;
        }
        :host([touch-target='none']) input {
          width: 100%;
          height: 100%;
        }
        md-ripple {
          border-radius: 50%;
          height: var(--md-radio-state-layer-size, 40px);
          inset: unset;
          width: var(--md-radio-state-layer-size, 40px);
        }
        .icon {
          fill: var(--md-radio-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
          inset: 0;
          position: absolute;
        }
        .outer.circle {
          transition: fill 50ms linear;
        }
        .inner.circle {
          opacity: 0;
          transform-origin: center;
          transition: opacity 50ms linear;
        }
        .checked .icon {
          fill: var(--md-radio-selected-icon-color, var(--md-sys-color-primary, #6750a4));
        }
        .checked .inner.circle {
          animation: inner-circle-grow 300ms cubic-bezier(0.05, 0.7, 0.1, 1);
          opacity: 1;
        }
        @keyframes inner-circle-grow {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        :host([disabled]) .circle {
          animation-duration: 0s;
          transition-duration: 0s;
        }
        :host(:hover) .icon {
          fill: var(--md-radio-hover-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        }
        :host(:focus-within) .icon {
          fill: var(--md-radio-focus-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        }
        :host(:active) .icon {
          fill: var(--md-radio-pressed-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        }
        :host([disabled]) .icon {
          fill: var(--md-radio-disabled-unselected-icon-color, var(--md-sys-color-on-surface, #1d1b20));
          opacity: var(--md-radio-disabled-unselected-icon-opacity, 0.38);
        }
        :host(:hover) .checked .icon {
          fill: var(--md-radio-selected-hover-icon-color, var(--md-sys-color-primary, #6750a4));
        }
        :host(:focus-within) .checked .icon {
          fill: var(--md-radio-selected-focus-icon-color, var(--md-sys-color-primary, #6750a4));
        }
        :host(:active) .checked .icon {
          fill: var(--md-radio-selected-pressed-icon-color, var(--md-sys-color-primary, #6750a4));
        }
        :host([disabled]) .checked .icon {
          fill: var(--md-radio-disabled-selected-icon-color, var(--md-sys-color-on-surface, #1d1b20));
          opacity: var(--md-radio-disabled-selected-icon-opacity, 0.38);
        }
      }
      @layer hcm {
        @media (forced-colors: active) {
          .icon {
            fill: CanvasText;
          }
          :host([disabled]) .icon {
            fill: GrayText;
            opacity: 1;
          }
        }
      }
    `,
  ]
}
customElements.define('md-radio', Radio)
/**
 * A `ReactiveController` that provides root node-scoped single selection for
 * elements, similar to native `<input type="radio">` selection.
 *
 * To use, elements should add the controller and call
 * `selectionController.handleCheckedChange()` in a getter/setter. This must
 * be synchronous to match native behavior.
 *
 * @example
 * const CHECKED = Symbol('checked');
 *
 * class MyToggle extends LitElement {
 *   get checked() { return this[CHECKED]; }
 *   set checked(checked: boolean) {
 *     const oldValue = this.checked;
 *     if (oldValue === checked) {
 *       return;
 *     }
 *
 *     this[CHECKED] = checked;
 *     this.selectionController.handleCheckedChange();
 *     this.requestUpdate('checked', oldValue);
 *   }
 *
 *   [CHECKED] = false;
 *
 *   private selectionController = new SingleSelectionController(this);
 *
 *   constructor() {
 *     super();
 *     this.addController(this.selectionController);
 *   }
 * }
 */
export class SingleSelectionController {
  /**
   * All single selection elements in the host element's root with the same
   * `name` attribute, including the host element.
   */
  get controls() {
    const name = this.host.getAttribute('name')
    if (!name || !this.root || !this.host.isConnected) {
      return [this.host]
    }
    // Cast as unknown since there is not enough information for typescript to
    // know that there is always at least one element (the host).
    return Array.from(this.root.querySelectorAll(`[name="${name}"]`))
  }
  constructor(host) {
    this.host = host
    this.focused = false
    this.root = null
    this.handleFocusIn = () => {
      this.focused = true
      this.updateTabIndices()
    }
    this.handleFocusOut = () => {
      this.focused = false
      this.updateTabIndices()
    }
    /**
     * Handles arrow key events from the host. Using the arrow keys will
     * select and check the next or previous sibling with the host's
     * `name` attribute.
     */
    this.handleKeyDown = (event) => {
      const isDown = event.key === 'ArrowDown'
      const isUp = event.key === 'ArrowUp'
      const isLeft = event.key === 'ArrowLeft'
      const isRight = event.key === 'ArrowRight'
      // Ignore non-arrow keys
      if (!isLeft && !isRight && !isDown && !isUp) {
        return
      }
      // Don't try to select another sibling if there aren't any.
      const siblings = this.controls
      if (!siblings.length) {
        return
      }
      // Prevent default interactions on the element for arrow keys,
      // since this controller will introduce new behavior.
      event.preventDefault()
      // Check if moving forwards or backwards
      const isRtl = getComputedStyle(this.host).direction === 'rtl'
      const forwards = isRtl ? isLeft || isDown : isRight || isDown
      const hostIndex = siblings.indexOf(this.host)
      let nextIndex = forwards ? hostIndex + 1 : hostIndex - 1
      // Search for the next sibling that is not disabled to select.
      // If we return to the host index, there is nothing to select.
      while (nextIndex !== hostIndex) {
        if (nextIndex >= siblings.length) {
          // Return to start if moving past the last item.
          nextIndex = 0
        } else if (nextIndex < 0) {
          // Go to end if moving before the first item.
          nextIndex = siblings.length - 1
        }
        // Check if the next sibling is disabled. If so,
        // move the index and continue searching.
        const nextSibling = siblings[nextIndex]
        if (nextSibling.hasAttribute('disabled')) {
          if (forwards) {
            nextIndex++
          } else {
            nextIndex--
          }
          continue
        }
        // Uncheck and remove focusability from other siblings.
        for (const sibling of siblings) {
          if (sibling !== nextSibling) {
            sibling.checked = false
            sibling.tabIndex = -1
            sibling.blur()
          }
        }
        // The next sibling should be checked, focused and dispatch a change event
        nextSibling.checked = true
        nextSibling.tabIndex = 0
        nextSibling.focus()
        // Fire a change event since the change is triggered by a user action.
        // This matches native <input type="radio"> behavior.
        nextSibling.dispatchEvent(new Event('change', { bubbles: true }))
        break
      }
    }
  }
  hostConnected() {
    this.root = this.host.getRootNode()
    this.host.addEventListener('keydown', this.handleKeyDown)
    this.host.addEventListener('focusin', this.handleFocusIn)
    this.host.addEventListener('focusout', this.handleFocusOut)
    if (this.host.checked) {
      // Uncheck other siblings when attached if already checked. This mimics
      // native <input type="radio"> behavior.
      this.uncheckSiblings()
    }
    // Update for the newly added host.
    this.updateTabIndices()
  }
  hostDisconnected() {
    this.host.removeEventListener('keydown', this.handleKeyDown)
    this.host.removeEventListener('focusin', this.handleFocusIn)
    this.host.removeEventListener('focusout', this.handleFocusOut)
    // Update for siblings that are still connected.
    this.updateTabIndices()
    this.root = null
  }
  /**
   * Should be called whenever the host's `checked` property changes
   * synchronously.
   */
  handleCheckedChange() {
    if (!this.host.checked) {
      return
    }
    this.uncheckSiblings()
    this.updateTabIndices()
  }
  uncheckSiblings() {
    for (const sibling of this.controls) {
      if (sibling !== this.host) {
        sibling.checked = false
      }
    }
  }
  /**
   * Updates the `tabindex` of the host and its siblings.
   */
  updateTabIndices() {
    // There are three tabindex states for a group of elements:
    // 1. If any are checked, that element is focusable.
    const siblings = this.controls
    const checkedSibling = siblings.find((sibling) => sibling.checked)
    // 2. If an element is focused, the others are no longer focusable.
    if (checkedSibling || this.focused) {
      const focusable = checkedSibling || this.host
      focusable.tabIndex = 0
      for (const sibling of siblings) {
        if (sibling !== focusable) {
          sibling.tabIndex = -1
        }
      }
      return
    }
    // 3. If none are checked or focused, all are focusable.
    for (const sibling of siblings) {
      sibling.tabIndex = 0
    }
  }
}
