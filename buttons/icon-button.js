import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { setupFormSubmitter } from '../internal/controller/form-submitter.js'
import { isRtl } from '../internal/controller/is-rtl.js'
import { internals, mixinElementInternals } from '../labs/behaviors/element-internals.js'
import { styles } from './icon-button-styles.js'

export { styles as iconButtonStyles } from './icon-button-styles.js'

const MINIMUM_PRESS_MS = 150
const iconButtonBaseClass = mixinElementInternals(LitElement)

/**
 * A button for rendering icons.
 *
 * @fires input {InputEvent} Dispatched when a toggle button toggles --bubbles
 * --composed
 * @fires change {Event} Dispatched when a toggle button toggles --bubbles
 */
export class IconButton extends iconButtonBaseClass {
  static properties = {
    disabled: { type: Boolean, noAccessor: true },
    flipIconInRtl: { type: Boolean, attribute: 'flip-icon-in-rtl' },
    href: { type: String },
    target: { type: String },
    ariaLabelSelected: { type: String, attribute: 'aria-label-selected' },
    toggle: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    pressed: { type: Boolean, reflect: true },
    shape: { type: String, reflect: true },
    type: { type: String },
    value: { type: String },
    flipIcon: { type: Boolean },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
  }

  constructor() {
    super()

    /**
     * Flips the icon if it is in an RTL context at startup.
     */
    this.flipIconInRtl = false
    /**
     * Sets the underlying `HTMLAnchorElement`'s `href` resource attribute.
     */
    this.href = ''
    /**
     * Sets the underlying `HTMLAnchorElement`'s `target` attribute.
     */
    this.target = ''
    /**
     * The `aria-label` of the button when the button is toggleable and selected.
     */
    this.ariaLabelSelected = ''
    /**
     * When true, the button will toggle between selected and unselected
     * states
     */
    this.toggle = false
    /**
     * Sets the selected state. When false, displays the default icon. When true,
     * displays the selected icon, or the default icon If no `slot="selected"`
     * icon is provided.
     */
    this.selected = false
    this.pressed = false
    /**
     * Accepted values are 'round' (default), 'square'.
     */
    this.shape = 'round'
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
    this.flipIcon = isRtl(this, this.flipIconInRtl)
    /**
     * filled, tonal, outlined, standard
     */
    this.color = 'standard'
    /**
     * extra-small, small, medium, large, extra-large
     */
    this.size = 'small'

    this.handlePress = this.handlePress.bind(this)
    this.handleRelease = this.handleRelease.bind(this)
    this.handleClick = this.handleClick.bind(this)
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

  willUpdate() {
    if (this.href) {
      this.disabled = false
    }
  }

  connectedCallback() {
    this.flipIcon = isRtl(this, this.flipIconInRtl)
    super.connectedCallback()
    this.addEventListener('pointerdown', this.handlePress)
    this.addEventListener('pointerup', this.handleRelease)
    this.addEventListener('pointercancel', this.#onPointerCancel)
    this.addEventListener('pointerleave', this.#onPointerCancel)
    this.addEventListener('click', this.handleClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.#clearPressImmediately()
    this.removeEventListener('pointerdown', this.handlePress)
    this.removeEventListener('pointerup', this.handleRelease)
    this.removeEventListener('pointercancel', this.#onPointerCancel)
    this.removeEventListener('pointerleave', this.#onPointerCancel)
    this.removeEventListener('click', this.handleClick)
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
    if (!this.pressed || this.#releaseTimer) {
      return
    }
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

  render() {
    // Needed for closure conformance
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this
    const hasToggledAriaLabel = ariaLabel && this.ariaLabelSelected
    const ariaPressedValue = !this.toggle ? nothing : this.selected
    let ariaLabelValue = nothing
    if (!this.href) {
      ariaLabelValue = hasToggledAriaLabel && this.selected ? this.ariaLabelSelected : ariaLabel
    }

    const buttonOrLink = this.href ? this.renderLink() : this.renderButton(ariaLabelValue, ariaPressedValue)
    const buttonId = this.href ? 'link' : 'button'

    return html`
      <div class="background"></div>
      <md-focus-ring part="focus-ring" for=${buttonId}></md-focus-ring>
      <md-ripple for=${buttonId} ?disabled="${!this.href && this.disabled}"></md-ripple>
      ${this.renderOutline()} ${buttonOrLink}
      <slot name="badge"></slot>
    `
  }

  renderOutline() {
    if (this.color === 'outlined') {
      return html`<div class="outlined"></div>`
    }
    return nothing
  }

  renderButton(ariaLabelValue, ariaPressedValue) {
    return html`<button
      class="icon-button ${classMap(this.getRenderClasses())}"
      id="button"
      aria-label="${ariaLabelValue || nothing}"
      aria-haspopup="${this.ariaHasPopup || nothing}"
      aria-expanded="${this.ariaExpanded || nothing}"
      aria-pressed="${ariaPressedValue}"
      ?disabled="${this.disabled}">
      ${this.selected ? this.renderSelectedIcon() : this.renderIcon()} ${this.renderTouchTarget()}
    </button>`
  }

  renderLink() {
    return html`<a
      class="icon-button ${classMap(this.getRenderClasses())}"
      id="link"
      href="${this.href}"
      target="${this.target || nothing}"
      aria-label="${this.ariaLabel || nothing}">
      ${this.selected ? this.renderSelectedIcon() : this.renderIcon()} ${this.renderTouchTarget()}
    </a>`
  }

  getRenderClasses() {
    return {
      'flip-icon': this.flipIcon,
    }
  }

  renderIcon() {
    return html`<span class="icon"><slot></slot></span>`
  }

  renderSelectedIcon() {
    return html`<span class="icon icon--selected"
      ><slot name="selected"><slot></slot></slot
    ></span>`
  }

  renderTouchTarget() {
    return nothing
  }

  async handleClick(event) {
    // Allow the event to propagate
    await 0
    if (!this.toggle || this.disabled || event.defaultPrevented) {
      return
    }
    this.selected = !this.selected
    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
    this.dispatchEvent(new Event('change', { bubbles: true }))
  }

  static styles = styles
}
;(() => {
  requestUpdateOnAriaChange(IconButton)
  setupFormSubmitter(IconButton)
})()
/** @nocollapse */
IconButton.formAssociated = true
/** @nocollapse */
IconButton.shadowRootOptions = {
  mode: 'open',
  delegatesFocus: true,
}

customElements.define('md-icon-button', IconButton)
