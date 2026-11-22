import { html, LitElement, nothing } from 'lit'
import { dispatchActivationClick, isActivationClick } from '../internal/events/form-label-activation.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { setupFormSubmitter } from '../internal/controller/form-submitter.js'
import { internals, mixinElementInternals } from '../labs/behaviors/element-internals.js'
import '../internal/elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { styles } from './button-styles.js'

export { styles as buttonStyles } from './button-styles.js'

const MINIMUM_PRESS_MS = 150
const buttonBaseClass = mixinElementInternals(LitElement)

/**
 * A material 3 expressive button component.
 *
 * https://m3.material.io/components/buttons/overview
 */
export class Button extends buttonBaseClass {
  static formAssociated = true
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }

  renderElevationOrOutline() {
    if (this.color === 'elevated') {
      return html`<md-elevation></md-elevation>`
    }
    if (this.color === 'outlined') {
      return html`<div class="outlined"></div>`
    }
  }

  static properties = {
    size: { type: String, reflect: true },
    shape: { type: String, reflect: true },
    color: { type: String, reflect: true }, // this is elevated, filled, etc. Not an actual color.
    pressed: { type: Boolean, reflect: true },
    disabled: { type: Boolean, noAccessor: true },
    href: { type: String },
    target: { type: String },
    trailingIcon: { type: Boolean, attribute: 'trailing-icon', reflect: true },
    hasIcon: { type: Boolean, attribute: 'has-icon', reflect: true },
    type: { type: String },
    value: { type: String },
    selected: { type: Boolean, reflect: true },
    toggle: { type: Boolean, reflect: true },
    checkmark: { type: Boolean, reflect: true },
  }

  get name() {
    return this.getAttribute('name') ?? ''
  }
  set name(name) {
    this.setAttribute('name', name)
  }

  get form() {
    return this[internals].form
  }

  get labels() {
    return this[internals].labels
  }

  #formDisabled = false
  #pressStartTime = 0
  #releaseTimer = 0
  #activePointerId = null

  get disabled() {
    return this.hasAttribute('disabled') || this.#formDisabled
  }
  set disabled(disabled) {
    const oldValue = this.disabled
    this.toggleAttribute('disabled', Boolean(disabled))
    if (this.disabled) {
      this.#clearPressImmediately()
    }
    this.requestUpdate('disabled', oldValue)
  }

  formDisabledCallback(disabled) {
    const oldValue = this.disabled
    this.#formDisabled = disabled
    if (this.disabled) {
      this.#clearPressImmediately()
    }
    this.requestUpdate('disabled', oldValue)
  }

  attributeChangedCallback(name, old, value) {
    if (name === 'disabled') {
      const oldValue = old !== null
      if (value !== null) {
        this.#clearPressImmediately()
      }
      this.requestUpdate(name, oldValue)
      return
    }
    super.attributeChangedCallback(name, old, value)
  }

  get buttonElement() {
    return this.shadowRoot.querySelector('#button') || this.shadowRoot.querySelector('#link')
  }

  constructor() {
    super()

    /**
     * Accepted values are 'small' (default), 'extra-small', 'medium', 'large', 'extra-large'.
     */
    this.size = 'small'
    /**
     * Accepted values are 'round' (default), 'square'.
     */
    this.shape = 'round'
    /**
     * Accepted values are 'outlined', 'filled' (default), 'elevated', 'tonal', 'text'
     */
    this.color = 'filled'

    this.pressed = false

    /**
     * The URL that the link button points to.
     */
    this.href = ''
    /**
     * Where to display the linked `href` URL for a link button. Common options
     * include `_blank` to open in a new tab.
     */
    this.target = ''
    /**
     * Whether to render the icon at the inline end of the label rather than the
     * inline start.
     *
     * _Note:_ Link buttons cannot have trailing icons.
     */
    this.trailingIcon = false
    /**
     * Whether to display the icon or not.
     */
    this.hasIcon = false
    /**
     * The default behavior of the button. May be "text", "reset", or "submit"
     * (default).
     */
    this.type = 'submit'
    /**
     * The value added to a form with the button's name when the button submits a
     * form.
     */
    this.value = ''

    /**
     * Whether or not the toggle button is selected.
     */
    this.selected = false
    /**
     * Set to turn this into a toggle button.
     */
    this.toggle = false
    /**
     * Whether to show a checkmark icon when selected.
     */
    this.checkmark = false

    this.handlePress = this.handlePress.bind(this)
    this.handleRelease = this.handleRelease.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleActivationClick = (event) => {
      if (!isActivationClick(event) || !this.buttonElement) {
        return
      }
      this.focus()
      dispatchActivationClick(this.buttonElement)
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('pointerdown', this.handlePress)
    this.addEventListener('pointerup', this.handleRelease)
    this.addEventListener('pointercancel', this.#onPointerCancel)
    this.addEventListener('pointerleave', this.#onPointerCancel)
    this.addEventListener('click', this.handleClick)
    this.addEventListener('keydown', this.handleActivationClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.#clearPressImmediately()
    this.removeEventListener('pointerdown', this.handlePress)
    this.removeEventListener('pointerup', this.handleRelease)
    this.removeEventListener('pointercancel', this.#onPointerCancel)
    this.removeEventListener('pointerleave', this.#onPointerCancel)
    this.removeEventListener('click', this.handleClick)
    this.removeEventListener('keydown', this.handleActivationClick)
  }

  focus() {
    this.buttonElement?.focus()
  }
  blur() {
    this.buttonElement?.blur()
  }
  get classes() {
    return {
      pressed: this.pressed,
      disabled: this.disabled,
    }
  }
  render() {
    // Link buttons may not be disabled
    const isDisabled = this.disabled && !this.href
    const buttonOrLink = this.href ? this.renderLink() : this.renderButton()
    // TODO(b/310046938): due to a limitation in focus ring/ripple, we can't use
    // the same ID for different elements, so we change the ID instead.
    const buttonId = this.href ? 'link' : 'button'

    return html`
      <div class="background"></div>
      <md-focus-ring part="focus-ring" for=${buttonId}></md-focus-ring>
      <md-ripple for=${buttonId} ?disabled="${isDisabled}"></md-ripple>
      ${this.renderElevationOrOutline()} ${buttonOrLink}
    `
  }

  #clearPressImmediately() {
    if (this.#releaseTimer) {
      clearTimeout(this.#releaseTimer)
      this.#releaseTimer = 0
    }
    this.#activePointerId = null
    this.#pressStartTime = 0
    if (this.pressed) {
      this.pressed = false
    }
  }

  #onPointerCancel = (event) => {
    if (event && this.#activePointerId !== null && event.pointerId !== this.#activePointerId) {
      return
    }
    this.#clearPressImmediately()
  }

  handlePress(event) {
    if (this.disabled && !this.href) {
      return
    }
    if (event) {
      if (event.isPrimary === false) return
      if (event.pointerType === 'mouse' && event.buttons !== undefined && event.buttons !== 1) return
      this.#activePointerId = event.pointerId ?? null
    }
    if (this.#releaseTimer) {
      clearTimeout(this.#releaseTimer)
      this.#releaseTimer = 0
    }
    this.#pressStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.pressed = true
  }

  handleRelease(event) {
    if (
      event &&
      this.#activePointerId !== null &&
      event.pointerId !== undefined &&
      event.pointerId !== this.#activePointerId
    ) {
      return
    }
    this.#activePointerId = null
    if (!this.pressed) {
      return
    }
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const elapsed = this.#pressStartTime > 0 ? now - this.#pressStartTime : MINIMUM_PRESS_MS
    if (elapsed >= MINIMUM_PRESS_MS) {
      this.pressed = false
      return
    }
    if (this.#releaseTimer) {
      clearTimeout(this.#releaseTimer)
    }
    this.#releaseTimer = setTimeout(() => {
      this.#releaseTimer = 0
      this.pressed = false
    }, MINIMUM_PRESS_MS - elapsed)
  }

  handleClick() {
    if (this.disabled || !this.toggle) {
      return
    }

    this.selected = !this.selected
    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
    this.dispatchEvent(new Event('change', { bubbles: true }))
  }
  renderButton() {
    // Needed for closure conformance
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this
    return html`<button
      id="button"
      class="button"
      ?disabled=${this.disabled}
      aria-label="${ariaLabel || nothing}"
      aria-haspopup="${ariaHasPopup || nothing}"
      aria-expanded="${ariaExpanded || nothing}"
      aria-pressed="${this.toggle ? this.selected : nothing}">
      ${this.renderContent()}
    </button>`
  }
  renderLink() {
    // Needed for closure conformance
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this
    return html`<a
      id="link"
      class="button"
      aria-label="${ariaLabel || nothing}"
      aria-haspopup="${ariaHasPopup || nothing}"
      aria-expanded="${ariaExpanded || nothing}"
      aria-pressed="${this.toggle ? this.selected : nothing}"
      href=${this.href}
      target=${this.target || nothing}
      >${this.renderContent()}
    </a>`
  }
  renderContent() {
    const icon = html`<slot name="icon" @slotchange="${this.handleSlotChange}"></slot>`
    const checkmark =
      this.checkmark && this.selected
        ? html`<svg class="checkmark" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M6.75 12.127L3.623 9l-1.06 1.057L6.75 14.25l9-9-1.057-1.06z"></path>
          </svg>`
        : null // null is required here because Lit's nothing is a truthy Symbol that breaks checkmark || icon
    return html`
      <span class="touch"></span>
      ${this.trailingIcon ? nothing : checkmark || icon}
      <span class="label"><slot></slot></span>
      ${this.trailingIcon ? icon : nothing}
    `
  }
  handleSlotChange() {
    const slot = this.renderRoot?.querySelector('slot[name="icon"]')
    if (slot) {
      this.hasIcon = slot.assignedElements({ flatten: true }).length > 0
    }
  }
  static styles = styles
}
;(() => {
  requestUpdateOnAriaChange(Button)
  setupFormSubmitter(Button)
})()

customElements.define('md-button', Button)
