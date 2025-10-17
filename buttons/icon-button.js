import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { css, html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { literal, html as staticHtml } from 'lit/static-html.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { setupFormSubmitter } from '../internal/controller/form-submitter.js'
import { isRtl } from '../internal/controller/is-rtl.js'
import { internals, mixinElementInternals } from '../labs/behaviors/element-internals.js'
// Separate variable needed for closure.
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
    toggle: { type: Boolean },
    selected: { type: Boolean, reflect: true },
    type: { type: String },
    value: { type: String },
    flipIcon: { type: Boolean },
    color: { type: String },
  }
  constructor() {
    super(...arguments)
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
  }
  get name() {
    return this.getAttribute('name') ?? ''
  }
  set name(name) {
    this.setAttribute('name', name)
  }
  /**
   * The associated form element with which this element's value will submit.
   */
  get form() {
    return this[internals].form
  }
  /**
   * The labels this element is associated with.
   */
  get labels() {
    return this[internals].labels
  }
  /**
   * Link buttons cannot be disabled.
   */
  willUpdate() {
    if (this.href) {
      this.disabled = false
    }
  }
  render() {
    const tag = this.href ? literal`div` : literal`button`
    // Needed for closure conformance
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this
    const hasToggledAriaLabel = ariaLabel && this.ariaLabelSelected
    const ariaPressedValue = !this.toggle ? nothing : this.selected
    let ariaLabelValue = nothing
    if (!this.href) {
      ariaLabelValue = hasToggledAriaLabel && this.selected ? this.ariaLabelSelected : ariaLabel
    }
    return staticHtml`
    <div class="wrapper ${this.color}">
    <${tag}
        class="icon-button ${classMap(this.getRenderClasses())}"
        id="button"
        aria-label="${ariaLabelValue || nothing}"
        aria-haspopup="${(!this.href && ariaHasPopup) || nothing}"
        aria-expanded="${(!this.href && ariaExpanded) || nothing}"
        aria-pressed="${ariaPressedValue}"
        ?disabled="${!this.href && this.disabled}"
        @click="${this.handleClick}">
        ${this.renderFocusRing()}
        ${this.renderRipple()}
        ${!this.selected ? this.renderIcon() : nothing}
        ${this.selected ? this.renderSelectedIcon() : nothing}
        ${this.renderTouchTarget()}
        ${this.href && this.renderLink()}
  </${tag}>
  </div>
  `
  }
  renderLink() {
    // Needed for closure conformance
    const { ariaLabel } = this
    return html`
      <a
        class="link"
        id="link"
        href="${this.href}"
        target="${this.target || nothing}"
        aria-label="${ariaLabel || nothing}"></a>
    `
  }
  getRenderClasses() {
    let r = {
      'flip-icon': this.flipIcon,
      selected: this.toggle && this.selected,
    }
    // if (this.color == 'filled') {
    //   r = { ...r, ...{ filled: true, 'toggle-filled': this.toggle } }
    // } else if (this.color == 'tonal') {
    //   r = { ...r, ...{ 'filled-tonal': true, tonal: true, 'toggle-filled-tonal': this.toggle } }
    // } else if (this.color == 'outlined') {
    //   r = {
    //     ...r,
    //     ...{
    //       outlined: true,
    //     },
    //   }
    // }
    return r
  }
  renderIcon() {
    return html`<span class="icon"><slot></slot></span>`
  }
  renderSelectedIcon() {
    // Use default slot as fallback to not require specifying multiple icons
    return html`<span class="icon icon--selected"
      ><slot name="selected"><slot></slot></slot
    ></span>`
  }
  renderTouchTarget() {
    return html`<span class="touch"></span>`
  }
  renderFocusRing() {
    // TODO(b/310046938): use the same id for both elements
    return html`<md-focus-ring part="focus-ring" for=${this.href ? 'link' : 'button'}></md-focus-ring>`
  }
  renderRipple() {
    // TODO(b/310046938): use the same id for both elements
    return html`<md-ripple for=${this.href ? 'link' : nothing} ?disabled="${!this.href && this.disabled}"></md-ripple>`
  }
  connectedCallback() {
    this.flipIcon = isRtl(this, this.flipIconInRtl)
    super.connectedCallback()
  }
  async handleClick(event) {
    // Allow the event to propagate
    await 0
    if (!this.toggle || this.disabled || event.defaultPrevented) {
      return
    }
    this.selected = !this.selected
    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
    // Bubbles but does not compose to mimic native browser <input> & <select>
    // Additionally, native change event is not an InputEvent.
    this.dispatchEvent(new Event('change', { bubbles: true }))
  }

  static styles = [
    css`
      .wrapper {
        display: inline-flex;
        outline: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        height: var(--_container-height);
        width: var(--_container-width);
        justify-content: center;
      }

      .wrapper([touch-target='wrapper']) {
        margin: max(0px, (48px - var(--_container-height))/2) max(0px, (48px - var(--_container-width))/2);
      }

      md-focus-ring {
        --md-focus-ring-shape-start-start: var(--_container-shape-start-start);
        --md-focus-ring-shape-start-end: var(--_container-shape-start-end);
        --md-focus-ring-shape-end-end: var(--_container-shape-end-end);
        --md-focus-ring-shape-end-start: var(--_container-shape-end-start);
      }

      .wrapper([disabled]) {
        pointer-events: none;
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
        flex: 1;
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
      }

      .icon ::slotted(*) {
        font-size: var(--_icon-size);
        height: var(--_icon-size);
        width: var(--_icon-size);
        font-weight: inherit;
      }

      md-ripple {
        z-index: -1;
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
      }

      .flip-icon .icon {
        transform: scaleX(-1);
      }

      .icon {
        display: inline-flex;
      }

      .link {
        height: 100%;
        outline: none;
        position: absolute;
        width: 100%;
      }

      .touch {
        position: absolute;
        height: max(48px, 100%);
        width: max(48px, 100%);
      }

      :host([touch-target='none']) .touch {
        display: none;
      }

      @media (forced-colors: active) {
        :host([disabled]) {
          --_disabled-icon-opacity: 1;
        }
      }
    `,
    // standard
    css`
      .wrapper.standard {
        --_container-height: var(--md-icon-button-container-height, 40px);
        --_container-width: var(--md-icon-button-container-width, 40px);

        --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
        --_icon-size: var(--md-icon-button-icon-size, 24px);
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
        --_state-layer-height: var(--md-icon-button-state-layer-height, 40px);
        --_state-layer-shape: var(--md-icon-button-state-layer-shape, var(--md-sys-shape-corner-full, 9999px));
        --_state-layer-width: var(--md-icon-button-state-layer-width, 40px);
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
        --_container-shape-start-start: 0;
        --_container-shape-start-end: 0;
        --_container-shape-end-end: 0;
        --_container-shape-end-start: 0;
        /* height: var(--_state-layer-height);
  width: var(--_state-layer-width) */
      }

      :host([touch-target='wrapper']) {
        margin: max(0px, (48px - var(--_state-layer-height))/2) max(0px, (48px - var(--_state-layer-width))/2);
      }

      md-focus-ring {
        --md-focus-ring-shape-start-start: var(--_state-layer-shape);
        --md-focus-ring-shape-start-end: var(--_state-layer-shape);
        --md-focus-ring-shape-end-end: var(--_state-layer-shape);
        --md-focus-ring-shape-end-start: var(--_state-layer-shape);
      }

      .standard {
        background-color: rgba(0, 0, 0, 0);
        color: var(--_icon-color);
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      .standard:hover {
        color: var(--_hover-icon-color);
      }

      .standard:focus {
        color: var(--_focus-icon-color);
      }

      .standard:active {
        color: var(--_pressed-icon-color);
      }

      .standard:disabled {
        color: var(--_disabled-icon-color);
      }

      md-ripple {
        border-radius: var(--_state-layer-shape);
      }

      .standard:disabled .icon {
        opacity: var(--_disabled-icon-opacity);
      }

      .selected {
        --md-ripple-hover-color: var(--_selected-hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_selected-hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_selected-pressed-state-layer-opacity);
      }

      .selected:not(:disabled) {
        color: var(--_selected-icon-color);
      }

      .selected:not(:disabled):hover {
        color: var(--_selected-hover-icon-color);
      }

      .selected:not(:disabled):focus {
        color: var(--_selected-focus-icon-color);
      }

      .selected:not(:disabled):active {
        color: var(--_selected-pressed-icon-color);
      }
    `,
    css`
      .wrapper.outlined {
        --_container-height: var(--md-icon-button-container-height, 40px);
        --_container-width: var(--md-icon-button-container-width, 40px);
        --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
        --_disabled-selected-container-color: var(
          --md-icon-button-disabled-selected-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-selected-container-opacity: var(--md-icon-button-disabled-selected-container-opacity, 0.12);
        --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
        --_icon-size: var(--md-icon-button-icon-size, 24px);
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
      }

      .outlined {
        background-color: rgba(0, 0, 0, 0);
        color: var(--_icon-color);
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      .outlined::before {
        border-color: var(--_outline-color);
        border-width: var(--_outline-width);
      }

      .outlined:hover {
        color: var(--_hover-icon-color);
      }

      .outlined:focus {
        color: var(--_focus-icon-color);
      }

      .outlined:active {
        color: var(--_pressed-icon-color);
      }

      .outlined:disabled {
        color: var(--_disabled-icon-color);
      }

      .outlined:disabled::before {
        border-color: var(--_disabled-outline-color);
        opacity: var(--_disabled-outline-opacity);
      }

      .outlined:disabled .icon {
        opacity: var(--_disabled-icon-opacity);
      }

      .outlined::before {
        block-size: 100%;
        border-style: solid;
        border-radius: inherit;
        box-sizing: border-box;
        content: '';
        inline-size: 100%;
        inset: 0;
        pointer-events: none;
        position: absolute;
        z-index: -1;
      }

      .outlined.selected::before {
        border-width: 0;
      }

      .selected {
        --md-ripple-hover-color: var(--_selected-hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      .selected:not(:disabled) {
        color: var(--_selected-icon-color);
      }

      .selected:not(:disabled):hover {
        color: var(--_selected-hover-icon-color);
      }

      .selected:not(:disabled):focus {
        color: var(--_selected-focus-icon-color);
      }

      .selected:not(:disabled):active {
        color: var(--_selected-pressed-icon-color);
      }

      .selected:not(:disabled)::before {
        background-color: var(--_selected-container-color);
      }

      .selected:disabled::before {
        background-color: var(--_disabled-selected-container-color);
        opacity: var(--_disabled-selected-container-opacity);
      }

      @media (forced-colors: active) {
        :host([disabled]) {
          --_disabled-outline-opacity: 1;
        }

        .selected::before {
          border-color: CanvasText;
          border-width: var(--_outline-width);
        }

        .selected:disabled::before {
          border-color: GrayText;
          opacity: 1;
        }
      }
    `,
    css`
      .wrapper.tonal {
        --_container-color: var(--md-icon-button-container-color, var(--md-sys-color-secondary-container, #e8def8));
        --_container-height: var(--md-icon-button-container-height, 40px);
        --_container-width: var(--md-icon-button-container-width, 40px);
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
        --_icon-size: var(--md-icon-button-icon-size, 24px);
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
      }

      .icon-button {
        color: var(--_icon-color);
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      .icon-button:hover {
        color: var(--_hover-icon-color);
      }

      .icon-button:focus {
        color: var(--_focus-icon-color);
      }

      .icon-button:active {
        color: var(--_pressed-icon-color);
      }

      .icon-button:disabled {
        color: var(--_disabled-icon-color);
      }

      .icon-button::before {
        background-color: var(--_container-color);
        border-radius: inherit;
        content: '';
        inset: 0;
        position: absolute;
        z-index: -1;
      }

      .icon-button:disabled::before {
        background-color: var(--_disabled-container-color);
        opacity: var(--_disabled-container-opacity);
      }

      .icon-button:disabled .icon {
        opacity: var(--_disabled-icon-opacity);
      }

      .toggle-filled-tonal {
        --md-ripple-hover-color: var(--_toggle-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_toggle-pressed-state-layer-color);
      }

      .toggle-filled-tonal:not(:disabled) {
        color: var(--_toggle-icon-color);
      }

      .toggle-filled-tonal:not(:disabled):hover {
        color: var(--_toggle-hover-icon-color);
      }

      .toggle-filled-tonal:not(:disabled):focus {
        color: var(--_toggle-focus-icon-color);
      }

      .toggle-filled-tonal:not(:disabled):active {
        color: var(--_toggle-pressed-icon-color);
      }

      .toggle-filled-tonal:not(:disabled)::before {
        background-color: var(--_unselected-container-color);
      }

      .selected {
        --md-ripple-hover-color: var(--_toggle-selected-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_toggle-selected-pressed-state-layer-color);
      }

      .selected:not(:disabled) {
        color: var(--_toggle-selected-icon-color);
      }

      .selected:not(:disabled):hover {
        color: var(--_toggle-selected-hover-icon-color);
      }

      .selected:not(:disabled):focus {
        color: var(--_toggle-selected-focus-icon-color);
      }

      .selected:not(:disabled):active {
        color: var(--_toggle-selected-pressed-icon-color);
      }

      .selected:not(:disabled)::before {
        background-color: var(--_selected-container-color);
      }
    `,
    css`
      .wrapper.filled {
        --_container-color: var(--md-icon-button-container-color, var(--md-sys-color-primary, #6750a4));
        --_container-height: var(--md-icon-button-container-height, 40px);
        --_container-width: var(--md-icon-button-container-width, 40px);
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
        --_icon-size: var(--md-icon-button-icon-size, 24px);
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
      }

      .icon-button {
        color: var(--_icon-color);
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      .icon-button:hover {
        color: var(--_hover-icon-color);
      }

      .icon-button:focus {
        color: var(--_focus-icon-color);
      }

      .icon-button:active {
        color: var(--_pressed-icon-color);
      }

      .icon-button:disabled {
        color: var(--_disabled-icon-color);
      }

      .icon-button::before {
        background-color: var(--_container-color);
        border-radius: inherit;
        content: '';
        inset: 0;
        position: absolute;
        z-index: -1;
      }

      .icon-button:disabled::before {
        background-color: var(--_disabled-container-color);
        opacity: var(--_disabled-container-opacity);
      }

      .icon-button:disabled .icon {
        opacity: var(--_disabled-icon-opacity);
      }

      .toggle-filled {
        --md-ripple-hover-color: var(--_toggle-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_toggle-pressed-state-layer-color);
      }

      .toggle-filled:not(:disabled) {
        color: var(--_toggle-icon-color);
      }

      .toggle-filled:not(:disabled):hover {
        color: var(--_toggle-hover-icon-color);
      }

      .toggle-filled:not(:disabled):focus {
        color: var(--_toggle-focus-icon-color);
      }

      .toggle-filled:not(:disabled):active {
        color: var(--_toggle-pressed-icon-color);
      }

      .toggle-filled:not(:disabled)::before {
        background-color: var(--_unselected-container-color);
      }

      .selected {
        --md-ripple-hover-color: var(--_toggle-selected-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_toggle-selected-pressed-state-layer-color);
      }

      .selected:not(:disabled) {
        color: var(--_toggle-selected-icon-color);
      }

      .selected:not(:disabled):hover {
        color: var(--_toggle-selected-hover-icon-color);
      }

      .selected:not(:disabled):focus {
        color: var(--_toggle-selected-focus-icon-color);
      }

      .selected:not(:disabled):active {
        color: var(--_toggle-selected-pressed-icon-color);
      }

      .selected:not(:disabled)::before {
        background-color: var(--_selected-container-color);
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
