import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { css, html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { setupFormSubmitter } from '../internal/controller/form-submitter.js'
import { isRtl } from '../internal/controller/is-rtl.js'
import { internals, mixinElementInternals } from '../labs/behaviors/element-internals.js'

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
    disabled: { type: Boolean, reflect: true },
    flipIconInRtl: { type: Boolean, attribute: 'flip-icon-in-rtl' },
    href: { type: String },
    target: { type: String },
    ariaLabelSelected: { type: String, attribute: 'aria-label-selected' },
    toggle: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    type: { type: String },
    value: { type: String },
    flipIcon: { type: Boolean },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
  }

  constructor() {
    super()
    /**
     * Disables the icon button and makes it non-interactive.
     */
    this.disabled = false
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
    this.addEventListener('click', this.handleClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('click', this.handleClick)
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
    return html`<span class="touch"></span>`
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

  static styles = [
    css`
      :host {
        display: inline-flex;
        outline: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        vertical-align: top;
        position: relative;
        z-index: 0;
        justify-content: center;
        align-items: center;

        /* Default size (small) */
        --_size: 40px;
        height: var(--_size);
        width: var(--_size);
        --_icon-size: 24px;

        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
      }

      :host([disabled]) {
        pointer-events: none;
        cursor: default;
      }

      .icon-button {
        place-items: center;
        background: none;
        border: none;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        place-content: center;
        outline: none;
        padding: 0;
        position: relative;
        text-decoration: none;
        user-select: none;
        z-index: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        color: inherit;
      }

      .icon ::slotted(*) {
        font-size: var(--_icon-size);
        height: var(--_icon-size);
        width: var(--_icon-size);
        font-weight: inherit;
        color: currentColor;
      }

      /* Fix for slot="selected" content falling back to default slot if unassigned behavior occurs */
      .icon:not(.icon--selected) ::slotted([slot]) {
        display: none !important;
      }

      .background {
        background-color: var(--_container-color);
        border-radius: inherit;
        inset: 0;
        position: absolute;
        width: 100%;
        height: 100%;
      }

      .outlined {
        inset: 0;
        border-style: solid;
        position: absolute;
        box-sizing: border-box;
        border-color: var(--_outline-color);
        border-width: var(--_outline-width);
        border-radius: inherit;
        pointer-events: none;
      }

      md-ripple {
        border-radius: inherit;
      }

      md-focus-ring {
        --md-focus-ring-shape-start-start: var(--_container-shape-start-start);
        --md-focus-ring-shape-start-end: var(--_container-shape-start-end);
        --md-focus-ring-shape-end-end: var(--_container-shape-end-end);
        --md-focus-ring-shape-end-start: var(--_container-shape-end-start);
      }

      .flip-icon .icon {
        transform: scaleX(-1);
      }

      .icon {
        display: inline-flex;
      }

      .touch {
        position: absolute;
        height: max(48px, 100%);
        width: max(48px, 100%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      :host([touch-target='none']) .touch {
        display: none;
      }

      :host([touch-target='wrapper']) {
        margin: max(0px, (48px - var(--_size))/2);
      }

      @media (forced-colors: active) {
        :host([disabled]) {
          --_disabled-icon-opacity: 1;
        }
      }
    `,
    // Standard
    css`
      :host([color='standard']) {
        color: var(--_icon-color);
        --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
        --_selected-focus-icon-color: var(
          --md-icon-button-selected-focus-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_selected-hover-icon-color: var(
          --md-icon-button-selected-hover-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_selected-hover-state-layer-color: var(
          --md-icon-button-selected-hover-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_selected-hover-state-layer-opacity: var(--md-icon-button-selected-hover-state-layer-opacity, 0.08);
        --_selected-icon-color: var(--md-icon-button-selected-icon-color, var(--md-sys-color-primary, #6750a4));
        --_selected-pressed-icon-color: var(
          --md-icon-button-selected-pressed-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_selected-pressed-state-layer-color: var(
          --md-icon-button-selected-pressed-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_selected-pressed-state-layer-opacity: var(--md-icon-button-selected-pressed-state-layer-opacity, 0.12);

        --_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_hover-state-layer-color: var(
          --md-icon-button-hover-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
        --_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_pressed-icon-color: var(
          --md-icon-button-pressed-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-state-layer-color: var(
          --md-icon-button-pressed-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);

        --_container-shape-start-start: 9999px;
        --_container-shape-start-end: 9999px;
        --_container-shape-end-end: 9999px;
        --_container-shape-end-start: 9999px;

        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      :host([color='standard']:hover) {
        color: var(--_hover-icon-color);
      }
      :host([color='standard']:focus) {
        color: var(--_focus-icon-color);
      }
      :host([color='standard']:active) {
        color: var(--_pressed-icon-color);
      }
      :host([color='standard'][disabled]) {
        color: var(--_disabled-icon-color);
      }
      :host([color='standard'][disabled]) .icon {
        opacity: var(--_disabled-icon-opacity);
      }

      :host([color='standard'][selected]) {
        --_container-shape-start-start: var(--md-sys-shape-corner-medium, 12px);
        --_container-shape-start-end: var(--md-sys-shape-corner-medium, 12px);
        --_container-shape-end-end: var(--md-sys-shape-corner-medium, 12px);
        --_container-shape-end-start: var(--md-sys-shape-corner-medium, 12px);
        --md-ripple-hover-color: var(--_selected-hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_selected-hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_selected-pressed-state-layer-opacity);
      }
      :host([color='standard'][selected]:not([disabled])) {
        color: var(--_selected-icon-color);
      }
      :host([color='standard'][selected]:not([disabled]):hover) {
        color: var(--_selected-hover-icon-color);
      }
      :host([color='standard'][selected]:not([disabled]):focus) {
        color: var(--_selected-focus-icon-color);
      }
      :host([color='standard'][selected]:not([disabled]):active) {
        color: var(--_selected-pressed-icon-color);
      }
    `,
    // Outlined
    css`
      :host([color='outlined']) {
        color: var(--_icon-color);
        --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
        --_disabled-selected-container-color: var(
          --md-icon-button-disabled-selected-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-selected-container-opacity: var(--md-icon-button-disabled-selected-container-opacity, 0.12);
        --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
        --_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);
        --_selected-container-color: var(
          --md-icon-button-selected-container-color,
          var(--md-sys-color-inverse-surface, #322f35)
        );
        --_selected-focus-icon-color: var(
          --md-icon-button-selected-focus-icon-color,
          var(--md-sys-color-inverse-on-surface, #f5eff7)
        );
        --_selected-hover-icon-color: var(
          --md-icon-button-selected-hover-icon-color,
          var(--md-sys-color-inverse-on-surface, #f5eff7)
        );
        --_selected-hover-state-layer-color: var(
          --md-icon-button-selected-hover-state-layer-color,
          var(--md-sys-color-inverse-on-surface, #f5eff7)
        );
        --_selected-icon-color: var(
          --md-icon-button-selected-icon-color,
          var(--md-sys-color-inverse-on-surface, #f5eff7)
        );
        --_selected-pressed-icon-color: var(
          --md-icon-button-selected-pressed-icon-color,
          var(--md-sys-color-inverse-on-surface, #f5eff7)
        );
        --_selected-pressed-state-layer-color: var(
          --md-icon-button-selected-pressed-state-layer-color,
          var(--md-sys-color-inverse-on-surface, #f5eff7)
        );
        --_disabled-outline-color: var(
          --md-icon-button-disabled-outline-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-outline-opacity: var(--md-icon-button-disabled-outline-opacity, 0.12);
        --_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_hover-state-layer-color: var(
          --md-icon-button-hover-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_outline-color: var(--md-icon-button-outline-color, var(--md-sys-color-outline, #79747e));
        --_outline-width: var(--md-icon-button-outline-width, 1px);
        --_pressed-icon-color: var(--md-icon-button-pressed-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_pressed-state-layer-color: var(
          --md-icon-button-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );

        --_container-shape-start-start: var(
          --md-icon-button-container-shape-start-start,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-start-end: var(
          --md-icon-button-container-shape-start-end,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-end: var(
          --md-icon-button-container-shape-end-end,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-start: var(
          --md-icon-button-container-shape-end-start,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );

        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      :host([color='outlined']:hover) {
        color: var(--_hover-icon-color);
      }
      :host([color='outlined']:focus) {
        color: var(--_focus-icon-color);
      }
      :host([color='outlined']:active) {
        color: var(--_pressed-icon-color);
      }
      :host([color='outlined'][disabled]) {
        color: var(--_disabled-icon-color);
      }
      :host([color='outlined'][disabled]) .outlined {
        border-color: var(--_disabled-outline-color);
        opacity: var(--_disabled-outline-opacity);
      }
      :host([color='outlined'][disabled]) .icon {
        opacity: var(--_disabled-icon-opacity);
      }

      :host([color='outlined'][selected]) .outlined {
        border-width: 0;
      }

      :host([color='outlined'][selected]) {
        --md-ripple-hover-color: var(--_selected-hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      :host([color='outlined'][selected]:not([disabled])) {
        color: var(--_selected-icon-color);
      }
      :host([color='outlined'][selected]:not([disabled]):hover) {
        color: var(--_selected-hover-icon-color);
      }
      :host([color='outlined'][selected]:not([disabled]):focus) {
        color: var(--_selected-focus-icon-color);
      }
      :host([color='outlined'][selected]:not([disabled]):active) {
        color: var(--_selected-pressed-icon-color);
      }

      :host([color='outlined'][selected]:not([disabled])) .background {
        background-color: var(--_selected-container-color);
      }
      :host([color='outlined'][selected][disabled]) .background {
        background-color: var(--_disabled-selected-container-color);
        opacity: var(--_disabled-selected-container-opacity);
      }
    `,
    // Tonal
    css`
      :host([color='tonal']) {
        --_container-color: var(--md-icon-button-container-color, var(--md-sys-color-secondary-container, #e8def8));
        --_disabled-container-color: var(
          --md-icon-button-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-container-opacity: var(--md-icon-button-disabled-container-opacity, 0.12);
        --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
        --_focus-icon-color: var(
          --md-icon-button-focus-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_hover-icon-color: var(
          --md-icon-button-hover-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_hover-state-layer-color: var(
          --md-icon-button-hover-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
        --_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));
        --_pressed-icon-color: var(
          --md-icon-button-pressed-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_pressed-state-layer-color: var(
          --md-icon-button-pressed-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);
        --_selected-container-color: var(
          --md-icon-button-selected-container-color,
          var(--md-sys-color-secondary-container, #e8def8)
        );
        --_toggle-selected-focus-icon-color: var(
          --md-icon-button-toggle-selected-focus-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_toggle-selected-hover-icon-color: var(
          --md-icon-button-toggle-selected-hover-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_toggle-selected-hover-state-layer-color: var(
          --md-icon-button-toggle-selected-hover-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_toggle-selected-icon-color: var(
          --md-icon-button-toggle-selected-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_toggle-selected-pressed-icon-color: var(
          --md-icon-button-toggle-selected-pressed-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_toggle-selected-pressed-state-layer-color: var(
          --md-icon-button-toggle-selected-pressed-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_unselected-container-color: var(
          --md-icon-button-unselected-container-color,
          var(--md-sys-color-surface-container-highest, #e6e0e9)
        );
        --_toggle-focus-icon-color: var(
          --md-icon-button-toggle-focus-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_toggle-hover-icon-color: var(
          --md-icon-button-toggle-hover-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_toggle-hover-state-layer-color: var(
          --md-icon-button-toggle-hover-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_toggle-icon-color: var(--md-icon-button-toggle-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_toggle-pressed-icon-color: var(
          --md-icon-button-toggle-pressed-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_toggle-pressed-state-layer-color: var(
          --md-icon-button-toggle-pressed-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );

        --_container-shape-start-start: var(
          --md-icon-button-container-shape-start-start,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-start-end: var(
          --md-icon-button-container-shape-start-end,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-end: var(
          --md-icon-button-container-shape-end-end,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-start: var(
          --md-icon-button-container-shape-end-start,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );

        color: var(--_icon-color);
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      :host([color='tonal']:hover) {
        color: var(--_hover-icon-color);
      }
      :host([color='tonal']:focus) {
        color: var(--_focus-icon-color);
      }
      :host([color='tonal']:active) {
        color: var(--_pressed-icon-color);
      }
      :host([color='tonal'][disabled]) {
        color: var(--_disabled-icon-color);
      }
      :host([color='tonal'][disabled]) .background {
        background-color: var(--_disabled-container-color);
        opacity: var(--_disabled-container-opacity);
      }
      :host([color='tonal'][disabled]) .icon {
        opacity: var(--_disabled-icon-opacity);
      }

      /* Toggle logic for tonal */
      :host([color='tonal'][toggle]) {
        --md-ripple-hover-color: var(--_toggle-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_toggle-pressed-state-layer-color);
      }
      :host([color='tonal'][toggle]:not([disabled])) {
        color: var(--_toggle-icon-color);
      }
      :host([color='tonal'][toggle]:not([disabled]):hover) {
        color: var(--_toggle-hover-icon-color);
      }
      :host([color='tonal'][toggle]:not([disabled]):focus) {
        color: var(--_toggle-focus-icon-color);
      }
      :host([color='tonal'][toggle]:not([disabled]):active) {
        color: var(--_toggle-pressed-icon-color);
      }
      :host([color='tonal'][toggle]:not([disabled])) .background {
        background-color: var(--_unselected-container-color);
      }

      /* Selected (Tonal) */
      :host([color='tonal'][selected]) {
        --md-ripple-hover-color: var(--_toggle-selected-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_toggle-selected-pressed-state-layer-color);
      }
      :host([color='tonal'][selected]:not([disabled])) {
        color: var(--_toggle-selected-icon-color);
      }
      :host([color='tonal'][selected]:not([disabled]):hover) {
        color: var(--_toggle-selected-hover-icon-color);
      }
      :host([color='tonal'][selected]:not([disabled]):focus) {
        color: var(--_toggle-selected-focus-icon-color);
      }
      :host([color='tonal'][selected]:not([disabled]):active) {
        color: var(--_toggle-selected-pressed-icon-color);
      }
      :host([color='tonal'][selected]:not([disabled])) .background {
        background-color: var(--_selected-container-color);
      }
    `,
    // Filled
    css`
      :host([color='filled']) {
        --_container-color: var(--md-icon-button-container-color, var(--md-sys-color-primary, #6750a4));
        --_disabled-container-color: var(
          --md-icon-button-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-container-opacity: var(--md-icon-button-disabled-container-opacity, 0.12);
        --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
        --_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));
        --_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));
        --_hover-state-layer-color: var(--md-icon-button-hover-state-layer-color, var(--md-sys-color-on-primary, #fff));
        --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
        --_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-primary, #fff));
        --_pressed-icon-color: var(--md-icon-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));
        --_pressed-state-layer-color: var(
          --md-icon-button-pressed-state-layer-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);
        --_selected-container-color: var(
          --md-icon-button-selected-container-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_toggle-selected-focus-icon-color: var(
          --md-icon-button-toggle-selected-focus-icon-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_toggle-selected-hover-icon-color: var(
          --md-icon-button-toggle-selected-hover-icon-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_toggle-selected-hover-state-layer-color: var(
          --md-icon-button-toggle-selected-hover-state-layer-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_toggle-selected-icon-color: var(
          --md-icon-button-toggle-selected-icon-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_toggle-selected-pressed-icon-color: var(
          --md-icon-button-toggle-selected-pressed-icon-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_toggle-selected-pressed-state-layer-color: var(
          --md-icon-button-toggle-selected-pressed-state-layer-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_unselected-container-color: var(
          --md-icon-button-unselected-container-color,
          var(--md-sys-color-surface-container-highest, #e6e0e9)
        );
        --_toggle-focus-icon-color: var(--md-icon-button-toggle-focus-icon-color, var(--md-sys-color-primary, #6750a4));
        --_toggle-hover-icon-color: var(--md-icon-button-toggle-hover-icon-color, var(--md-sys-color-primary, #6750a4));
        --_toggle-hover-state-layer-color: var(
          --md-icon-button-toggle-hover-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_toggle-icon-color: var(--md-icon-button-toggle-icon-color, var(--md-sys-color-primary, #6750a4));
        --_toggle-pressed-icon-color: var(
          --md-icon-button-toggle-pressed-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_toggle-pressed-state-layer-color: var(
          --md-icon-button-toggle-pressed-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );

        --_container-shape-start-start: var(
          --md-icon-button-container-shape-start-start,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-start-end: var(
          --md-icon-button-container-shape-start-end,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-end: var(
          --md-icon-button-container-shape-end-end,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-start: var(
          --md-icon-button-container-shape-end-start,
          var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );

        color: var(--_icon-color);
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      :host([color='filled']:hover) {
        color: var(--_hover-icon-color);
      }
      :host([color='filled']:focus) {
        color: var(--_focus-icon-color);
      }
      :host([color='filled']:active) {
        color: var(--_pressed-icon-color);
      }
      :host([color='filled'][disabled]) {
        color: var(--_disabled-icon-color);
      }
      :host([color='filled'][disabled]) .background {
        background-color: var(--_disabled-container-color);
        opacity: var(--_disabled-container-opacity);
      }
      :host([color='filled'][disabled]) .icon {
        opacity: var(--_disabled-icon-opacity);
      }

      /* Toggle logic for filled */
      :host([color='filled'][toggle]) {
        --md-ripple-hover-color: var(--_toggle-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_toggle-pressed-state-layer-color);
      }
      :host([color='filled'][toggle]:not([disabled])) {
        color: var(--_toggle-icon-color);
      }
      :host([color='filled'][toggle]:not([disabled]):hover) {
        color: var(--_toggle-hover-icon-color);
      }
      :host([color='filled'][toggle]:not([disabled]):focus) {
        color: var(--_toggle-focus-icon-color);
      }
      :host([color='filled'][toggle]:not([disabled]):active) {
        color: var(--_toggle-pressed-icon-color);
      }
      :host([color='filled'][toggle]:not([disabled])) .background {
        background-color: var(--_unselected-container-color);
      }

      /* Selected (Filled) */
      :host([color='filled'][selected]) {
        --md-ripple-hover-color: var(--_toggle-selected-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_toggle-selected-pressed-state-layer-color);
      }
      :host([color='filled'][selected]:not([disabled])) {
        color: var(--_toggle-selected-icon-color);
      }
      :host([color='filled'][selected]:not([disabled]):hover) {
        color: var(--_toggle-selected-hover-icon-color);
      }
      :host([color='filled'][selected]:not([disabled]):focus) {
        color: var(--_toggle-selected-focus-icon-color);
      }
      :host([color='filled'][selected]:not([disabled]):active) {
        color: var(--_toggle-selected-pressed-icon-color);
      }
      :host([color='filled'][selected]:not([disabled])) .background {
        background-color: var(--_selected-container-color);
      }
    `,
    // Sizes
    css`
      :host([size='extra-small']) {
        --_size: 32px;
        --_icon-size: 20px;
      }
      :host([size='small']) {
        --_size: 40px;
        --_icon-size: 24px;
      }
      :host([size='medium']) {
        --_size: 56px;
        --_icon-size: 24px;
      }
      :host([size='large']) {
        --_size: 96px;
        --_icon-size: 32px;
      }
      :host([size='extra-large']) {
        --_size: 136px;
        --_icon-size: 40px;
      }
    `,
  ]
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
