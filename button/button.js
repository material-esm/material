import { html, LitElement, nothing, css } from 'lit'
import { dispatchActivationClick, isActivationClick } from '../internal/events/form-label-activation.js'
import '../elevation/elevation.js'
import '../focus/md-focus-ring.js'
import '../ripple/ripple.js'

/**
 * A material 3 expressive button component.
 *
 * https://m3.material.io/components/buttons/overview
 */
export class Button extends LitElement {
  renderElevationOrOutline() {
    if (this.color === 'elevated') {
      return html`<md-elevation></md-elevation>`
    }
    if (this.color === 'outlined') {
      return html`<div class="outline"></div>`
    }
  }

  static properties = {
    toggle: { type: Boolean, reflect: true },
    size: { type: String },
    shape: { type: String },
    color: { type: String }, // this is elevated, filled, etc. Not an actual color.
    disabled: { type: Boolean, reflect: true },
    href: { type: String },
    target: { type: String },
    trailingIcon: { type: Boolean, attribute: 'trailing-icon', reflect: true },
    hasIcon: { type: Boolean, attribute: 'has-icon', reflect: true },
    type: { type: String },
  }

  get name() {
    return this.getAttribute('name') ?? ''
  }
  set name(name) {
    this.setAttribute('name', name)
  }
  constructor() {
    super()

    this.toggle = false
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

    /**
     * Whether or not the button is disabled.
     */
    this.disabled = false
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
    this.handleActivationClick = (event) => {
      if (!isActivationClick(event) || !this.buttonElement) {
        return
      }
      this.focus()
      dispatchActivationClick(this.buttonElement)
    }
  }
  focus() {
    this.buttonElement?.focus()
  }
  blur() {
    this.buttonElement?.blur()
  }
  render() {
    // Link buttons may not be disabled
    const isDisabled = this.disabled && !this.href
    const buttonOrLink = this.href ? this.renderLink() : this.renderButton()
    // TODO(b/310046938): due to a limitation in focus ring/ripple, we can't use
    // the same ID for different elements, so we change the ID instead.
    const buttonId = this.href ? 'link' : 'button'
    return html`
      <div class="wrapper ${this.color} ${this.size} ${this.shape} ">
        <div class="background"></div>
        <md-focus-ring part="focus-ring" for=${buttonId}></md-focus-ring>
        <md-ripple for=${buttonId} ?disabled="${isDisabled}"></md-ripple>
        ${buttonOrLink}
      </div>
    `
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
    >
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
      href=${this.href}
      target=${this.target || nothing}
      >${this.renderContent()}
    </a>`
  }
  renderContent() {
    const icon = html`<slot name="icon" @slotchange="${this.handleSlotChange}"></slot>`
    return html`
      <span class="touch"></span>
      ${this.trailingIcon ? nothing : icon}
      <span class="label"><slot></slot></span>
      ${this.trailingIcon ? icon : nothing}
    `
  }
  handleSlotChange() {
    return
    // errors, no assignedIcons?
    this.hasIcon = this.assignedIcons.length > 0
  }
  static styles = [
    css`
      .wrapper.filled {
        --_container-color: var(--md-filled-button-container-color, var(--md-sys-color-primary, #6750a4));
        --_container-elevation: var(--md-filled-button-container-elevation, 0);
        /* --_container-height: var(--_container-height, var(--md-filled-button-container-height, 40px)); */
        --_container-shadow-color: var(--md-filled-button-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_disabled-container-color: var(
          --md-filled-button-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-container-elevation: var(--md-filled-button-disabled-container-elevation, 0);
        --_disabled-container-opacity: var(--md-filled-button-disabled-container-opacity, 0.12);
        --_disabled-label-text-color: var(
          --md-filled-button-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-filled-button-disabled-label-text-opacity, 0.38);
        --_focus-container-elevation: var(--md-filled-button-focus-container-elevation, 0);
        --_focus-label-text-color: var(--md-filled-button-focus-label-text-color, var(--md-sys-color-on-primary, #fff));
        --_hover-container-elevation: var(--md-filled-button-hover-container-elevation, 1);
        --_hover-label-text-color: var(--md-filled-button-hover-label-text-color, var(--md-sys-color-on-primary, #fff));
        --_hover-state-layer-color: var(
          --md-filled-button-hover-state-layer-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_hover-state-layer-opacity: var(--md-filled-button-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(--md-filled-button-label-text-color, var(--md-sys-color-on-primary, #fff));
        --_label-text-font: var(
          --md-filled-button-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-filled-button-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(--md-filled-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
        --_label-text-weight: var(
          --md-filled-button-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-container-elevation: var(--md-filled-button-pressed-container-elevation, 0);
        --_pressed-label-text-color: var(
          --md-filled-button-pressed-label-text-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_pressed-state-layer-color: var(
          --md-filled-button-pressed-state-layer-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_pressed-state-layer-opacity: var(--md-filled-button-pressed-state-layer-opacity, 0.12);
        --_disabled-icon-color: var(--md-filled-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-filled-button-disabled-icon-opacity, 0.38);
        --_focus-icon-color: var(--md-filled-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));
        --_hover-icon-color: var(--md-filled-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));
        --_icon-color: var(--md-filled-button-icon-color, var(--md-sys-color-on-primary, #fff));
        --_icon-size: var(--md-filled-button-icon-size, 18px);
        --_pressed-icon-color: var(--md-filled-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));
        --_container-shape-start-start: var(
          --md-filled-button-container-shape-start-start,
          var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-start-end: var(
          --md-filled-button-container-shape-start-end,
          var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-end: var(
          --md-filled-button-container-shape-end-end,
          var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-start: var(
          --md-filled-button-container-shape-end-start,
          var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_leading-space: var(--md-filled-button-leading-space, 16px);
        --_trailing-space: var(--md-filled-button-trailing-space, 16px);
        --_with-leading-icon-leading-space: var(--md-filled-button-with-leading-icon-leading-space, 16px);
        --_with-leading-icon-trailing-space: var(--md-filled-button-with-leading-icon-trailing-space, 24px);
        --_with-trailing-icon-leading-space: var(--md-filled-button-with-trailing-icon-leading-space, 24px);
        --_with-trailing-icon-trailing-space: var(--md-filled-button-with-trailing-icon-trailing-space, 16px);
      }
    `,
    css`
      .wrapper.tonal {
        --_container-color: var(
          --md-filled-tonal-button-container-color,
          var(--md-sys-color-secondary-container, #e8def8)
        );
        --_container-elevation: var(--md-filled-tonal-button-container-elevation, 0);
        --_container-shadow-color: var(
          --md-filled-tonal-button-container-shadow-color,
          var(--md-sys-color-shadow, #000)
        );
        --_disabled-container-color: var(
          --md-filled-tonal-button-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-container-elevation: var(--md-filled-tonal-button-disabled-container-elevation, 0);
        --_disabled-container-opacity: var(--md-filled-tonal-button-disabled-container-opacity, 0.12);
        --_disabled-label-text-color: var(
          --md-filled-tonal-button-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-filled-tonal-button-disabled-label-text-opacity, 0.38);
        --_focus-container-elevation: var(--md-filled-tonal-button-focus-container-elevation, 0);
        --_focus-label-text-color: var(
          --md-filled-tonal-button-focus-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_hover-container-elevation: var(--md-filled-tonal-button-hover-container-elevation, 1);
        --_hover-label-text-color: var(
          --md-filled-tonal-button-hover-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_hover-state-layer-color: var(
          --md-filled-tonal-button-hover-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_hover-state-layer-opacity: var(--md-filled-tonal-button-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(
          --md-filled-tonal-button-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_label-text-font: var(
          --md-filled-tonal-button-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-filled-tonal-button-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(
          --md-filled-tonal-button-label-text-size,
          var(--md-sys-typescale-label-large-size, 0.875rem)
        );
        --_label-text-weight: var(
          --md-filled-tonal-button-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-container-elevation: var(--md-filled-tonal-button-pressed-container-elevation, 0);
        --_pressed-label-text-color: var(
          --md-filled-tonal-button-pressed-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_pressed-state-layer-color: var(
          --md-filled-tonal-button-pressed-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_pressed-state-layer-opacity: var(--md-filled-tonal-button-pressed-state-layer-opacity, 0.12);
        --_disabled-icon-color: var(
          --md-filled-tonal-button-disabled-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-icon-opacity: var(--md-filled-tonal-button-disabled-icon-opacity, 0.38);
        --_focus-icon-color: var(
          --md-filled-tonal-button-focus-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_hover-icon-color: var(
          --md-filled-tonal-button-hover-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_icon-color: var(--md-filled-tonal-button-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));
        --_icon-size: var(--md-filled-tonal-button-icon-size, 18px);
        --_pressed-icon-color: var(
          --md-filled-tonal-button-pressed-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_container-shape-start-start: var(
          --md-filled-tonal-button-container-shape-start-start,
          var(--md-filled-tonal-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-start-end: var(
          --md-filled-tonal-button-container-shape-start-end,
          var(--md-filled-tonal-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-end: var(
          --md-filled-tonal-button-container-shape-end-end,
          var(--md-filled-tonal-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-start: var(
          --md-filled-tonal-button-container-shape-end-start,
          var(--md-filled-tonal-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_leading-space: var(--md-filled-tonal-button-leading-space, 24px);
        --_trailing-space: var(--md-filled-tonal-button-trailing-space, 24px);
        --_with-leading-icon-leading-space: var(--md-filled-tonal-button-with-leading-icon-leading-space, 16px);
        --_with-leading-icon-trailing-space: var(--md-filled-tonal-button-with-leading-icon-trailing-space, 24px);
        --_with-trailing-icon-leading-space: var(--md-filled-tonal-button-with-trailing-icon-leading-space, 24px);
        --_with-trailing-icon-trailing-space: var(--md-filled-tonal-button-with-trailing-icon-trailing-space, 16px);
      }
    `,
    // elevated
    css`
      .wrapper.elevated {
        --_container-color: var(
          --md-elevated-button-container-color,
          var(--md-sys-color-surface-container-low, #f7f2fa)
        );
        --_container-elevation: var(--md-elevated-button-container-elevation, 1);
        --_container-shadow-color: var(--md-elevated-button-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_disabled-container-color: var(
          --md-elevated-button-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-container-elevation: var(--md-elevated-button-disabled-container-elevation, 0);
        --_disabled-container-opacity: var(--md-elevated-button-disabled-container-opacity, 0.12);
        --_disabled-label-text-color: var(
          --md-elevated-button-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-elevated-button-disabled-label-text-opacity, 0.38);
        --_focus-container-elevation: var(--md-elevated-button-focus-container-elevation, 1);
        --_focus-label-text-color: var(
          --md-elevated-button-focus-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-container-elevation: var(--md-elevated-button-hover-container-elevation, 2);
        --_hover-label-text-color: var(
          --md-elevated-button-hover-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-state-layer-color: var(
          --md-elevated-button-hover-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-state-layer-opacity: var(--md-elevated-button-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(--md-elevated-button-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_label-text-font: var(
          --md-elevated-button-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-elevated-button-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(
          --md-elevated-button-label-text-size,
          var(--md-sys-typescale-label-large-size, 0.875rem)
        );
        --_label-text-weight: var(
          --md-elevated-button-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-container-elevation: var(--md-elevated-button-pressed-container-elevation, 1);
        --_pressed-label-text-color: var(
          --md-elevated-button-pressed-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_pressed-state-layer-color: var(
          --md-elevated-button-pressed-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_pressed-state-layer-opacity: var(--md-elevated-button-pressed-state-layer-opacity, 0.12);
        --_disabled-icon-color: var(--md-elevated-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-elevated-button-disabled-icon-opacity, 0.38);
        --_focus-icon-color: var(--md-elevated-button-focus-icon-color, var(--md-sys-color-primary, #6750a4));
        --_hover-icon-color: var(--md-elevated-button-hover-icon-color, var(--md-sys-color-primary, #6750a4));
        --_icon-color: var(--md-elevated-button-icon-color, var(--md-sys-color-primary, #6750a4));
        --_icon-size: var(--md-elevated-button-icon-size, 18px);
        --_pressed-icon-color: var(--md-elevated-button-pressed-icon-color, var(--md-sys-color-primary, #6750a4));
        --_container-shape-start-start: var(
          --md-elevated-button-container-shape-start-start,
          var(--md-elevated-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-start-end: var(
          --md-elevated-button-container-shape-start-end,
          var(--md-elevated-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-end: var(
          --md-elevated-button-container-shape-end-end,
          var(--md-elevated-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-start: var(
          --md-elevated-button-container-shape-end-start,
          var(--md-elevated-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_leading-space: var(--md-elevated-button-leading-space, 24px);
        --_trailing-space: var(--md-elevated-button-trailing-space, 24px);
        --_with-leading-icon-leading-space: var(--md-elevated-button-with-leading-icon-leading-space, 16px);
        --_with-leading-icon-trailing-space: var(--md-elevated-button-with-leading-icon-trailing-space, 24px);
        --_with-trailing-icon-leading-space: var(--md-elevated-button-with-trailing-icon-leading-space, 24px);
        --_with-trailing-icon-trailing-space: var(--md-elevated-button-with-trailing-icon-trailing-space, 16px);
      }

      md-elevation {
        transition-duration: 280ms;
      }

      .wrapper([disabled]) md-elevation {
        transition: none;
      }

      md-elevation {
        --md-elevation-level: var(--_container-elevation);
        --md-elevation-shadow-color: var(--_container-shadow-color);
      }

      .wrapper(:focus-within) md-elevation {
        --md-elevation-level: var(--_focus-container-elevation);
      }

      .wrapper(:hover) md-elevation {
        --md-elevation-level: var(--_hover-container-elevation);
      }

      .wrapper(:active) md-elevation {
        --md-elevation-level: var(--_pressed-container-elevation);
      }

      .wrapper([disabled]) md-elevation {
        --md-elevation-level: var(--_disabled-container-elevation);
      }
    `,
    css`
      .wrapper.text {
        --_disabled-label-text-color: var(
          --md-text-button-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-text-button-disabled-label-text-opacity, 0.38);
        --_focus-label-text-color: var(--md-text-button-focus-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_hover-label-text-color: var(--md-text-button-hover-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_hover-state-layer-color: var(--md-text-button-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));
        --_hover-state-layer-opacity: var(--md-text-button-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(--md-text-button-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_label-text-font: var(
          --md-text-button-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-text-button-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(--md-text-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
        --_label-text-weight: var(
          --md-text-button-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-label-text-color: var(
          --md-text-button-pressed-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_pressed-state-layer-color: var(
          --md-text-button-pressed-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_pressed-state-layer-opacity: var(--md-text-button-pressed-state-layer-opacity, 0.12);
        --_disabled-icon-color: var(--md-text-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-text-button-disabled-icon-opacity, 0.38);
        --_focus-icon-color: var(--md-text-button-focus-icon-color, var(--md-sys-color-primary, #6750a4));
        --_hover-icon-color: var(--md-text-button-hover-icon-color, var(--md-sys-color-primary, #6750a4));
        --_icon-color: var(--md-text-button-icon-color, var(--md-sys-color-primary, #6750a4));
        --_icon-size: var(--md-text-button-icon-size, 18px);
        --_pressed-icon-color: var(--md-text-button-pressed-icon-color, var(--md-sys-color-primary, #6750a4));
        --_container-shape-start-start: var(
          --md-text-button-container-shape-start-start,
          var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-start-end: var(
          --md-text-button-container-shape-start-end,
          var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-end: var(
          --md-text-button-container-shape-end-end,
          var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-start: var(
          --md-text-button-container-shape-end-start,
          var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_leading-space: var(--md-text-button-leading-space, 12px);
        --_trailing-space: var(--md-text-button-trailing-space, 12px);
        --_with-leading-icon-leading-space: var(--md-text-button-with-leading-icon-leading-space, 12px);
        --_with-leading-icon-trailing-space: var(--md-text-button-with-leading-icon-trailing-space, 16px);
        --_with-trailing-icon-leading-space: var(--md-text-button-with-trailing-icon-leading-space, 16px);
        --_with-trailing-icon-trailing-space: var(--md-text-button-with-trailing-icon-trailing-space, 12px);
        --_container-color: none;
        --_disabled-container-color: none;
        --_disabled-container-opacity: 0;
      }
    `,
    css`
      .wrapper.outlined {
        --_disabled-label-text-color: var(
          --md-outlined-button-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-outlined-button-disabled-label-text-opacity, 0.38);
        --_disabled-outline-color: var(
          --md-outlined-button-disabled-outline-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-outline-opacity: var(--md-outlined-button-disabled-outline-opacity, 0.12);
        --_focus-label-text-color: var(
          --md-outlined-button-focus-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-label-text-color: var(
          --md-outlined-button-hover-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-state-layer-color: var(
          --md-outlined-button-hover-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-state-layer-opacity: var(--md-outlined-button-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(--md-outlined-button-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_label-text-font: var(
          --md-outlined-button-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-outlined-button-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(
          --md-outlined-button-label-text-size,
          var(--md-sys-typescale-label-large-size, 0.875rem)
        );
        --_label-text-weight: var(
          --md-outlined-button-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_outline-color: var(--md-outlined-button-outline-color, var(--md-sys-color-outline, #79747e));
        --_outline-width: var(--md-outlined-button-outline-width, 1px);
        --_pressed-label-text-color: var(
          --md-outlined-button-pressed-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_pressed-outline-color: var(--md-outlined-button-pressed-outline-color, var(--md-sys-color-outline, #79747e));
        --_pressed-state-layer-color: var(
          --md-outlined-button-pressed-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_pressed-state-layer-opacity: var(--md-outlined-button-pressed-state-layer-opacity, 0.12);
        --_disabled-icon-color: var(--md-outlined-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-icon-opacity: var(--md-outlined-button-disabled-icon-opacity, 0.38);
        --_focus-icon-color: var(--md-outlined-button-focus-icon-color, var(--md-sys-color-primary, #6750a4));
        --_hover-icon-color: var(--md-outlined-button-hover-icon-color, var(--md-sys-color-primary, #6750a4));
        --_icon-color: var(--md-outlined-button-icon-color, var(--md-sys-color-primary, #6750a4));
        --_icon-size: var(--md-outlined-button-icon-size, 18px);
        --_pressed-icon-color: var(--md-outlined-button-pressed-icon-color, var(--md-sys-color-primary, #6750a4));
        --_container-shape-start-start: var(
          --md-outlined-button-container-shape-start-start,
          var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-start-end: var(
          --md-outlined-button-container-shape-start-end,
          var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-end: var(
          --md-outlined-button-container-shape-end-end,
          var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_container-shape-end-start: var(
          --md-outlined-button-container-shape-end-start,
          var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, 9999px))
        );
        --_leading-space: var(--md-outlined-button-leading-space, 24px);
        --_trailing-space: var(--md-outlined-button-trailing-space, 24px);
        --_with-leading-icon-leading-space: var(--md-outlined-button-with-leading-icon-leading-space, 16px);
        --_with-leading-icon-trailing-space: var(--md-outlined-button-with-leading-icon-trailing-space, 24px);
        --_with-trailing-icon-leading-space: var(--md-outlined-button-with-trailing-icon-leading-space, 24px);
        --_with-trailing-icon-trailing-space: var(--md-outlined-button-with-trailing-icon-trailing-space, 16px);
        --_container-color: none;
        --_disabled-container-color: none;
        --_disabled-container-opacity: 0;
      }

      .outlined {
        inset: 0;
        border-style: solid;
        position: absolute;
        box-sizing: border-box;
        border-color: var(--_outline-color);
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
      }

      .wrapper(:active) .outlined {
        border-color: var(--_pressed-outline-color);
      }

      .wrapper([disabled]) .outlined {
        border-color: var(--_disabled-outline-color);
        opacity: var(--_disabled-outline-opacity);
      }

      @media (forced-colors: active) {
        .wrapper([disabled]) .background {
          border-color: GrayText;
        }

        .wrapper([disabled]) .outlined {
          opacity: 1;
        }
      }

      .outlined,
      md-ripple {
        border-width: var(--_outline-width);
      }

      md-ripple {
        inline-size: calc(100% - 2 * var(--_outline-width));
        block-size: calc(100% - 2 * var(--_outline-width));
        border-style: solid;
        border-color: rgba(0, 0, 0, 0);
      }
    `,
    css`
      .wrapper {
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
        box-sizing: border-box;
        cursor: pointer;
        display: inline-flex;
        gap: 8px;
        align-items: center;
        outline: none;
        place-content: center;
        place-items: center;
        position: relative;
        font-family: var(--_label-text-font);
        line-height: var(--_label-text-line-height);
        text-overflow: ellipsis;
        text-wrap: nowrap;
        user-select: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        vertical-align: top;
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      md-focus-ring {
        --md-focus-ring-shape-start-start: var(--_container-shape-start-start);
        --md-focus-ring-shape-start-end: var(--_container-shape-start-end);
        --md-focus-ring-shape-end-end: var(--_container-shape-end-end);
        --md-focus-ring-shape-end-start: var(--_container-shape-end-start);
      }

      .wrapper([disabled]) {
        cursor: default;
        pointer-events: none;
      }

      .button {
        border-radius: inherit;
        cursor: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        outline: none;
        -webkit-appearance: none;
        vertical-align: middle;
        background: rgba(0, 0, 0, 0);
        text-decoration: none;
        min-width: calc(64px - var(--_leading-space) - var(--_trailing-space));
        width: 100%;
        z-index: 0;
        height: 100%;
        font: inherit;
        color: var(--_label-text-color);
        padding: 0;
        gap: inherit;
        text-transform: inherit;
      }

      .button::-moz-focus-inner {
        padding: 0;
        border: 0;
      }

      .wrapper(:hover) .button {
        color: var(--_hover-label-text-color);
      }

      .wrapper(:focus-within) .button {
        color: var(--_focus-label-text-color);
      }

      .wrapper(:active) .button {
        color: var(--_pressed-label-text-color);
      }

      .background {
        background-color: var(--_container-color);
        border-radius: inherit;
        inset: 0;
        position: absolute;
      }

      .label {
        overflow: hidden;
      }

      :is(.button, .label, .label slot),
      .label ::slotted(*) {
        text-overflow: inherit;
      }

      .wrapper([disabled]) .label {
        color: var(--_disabled-label-text-color);
        opacity: var(--_disabled-label-text-opacity);
      }

      .wrapper([disabled]) .background {
        background-color: var(--_disabled-container-color);
        opacity: var(--_disabled-container-opacity);
      }

      @media (forced-colors: active) {
        .background {
          border: 1px solid CanvasText;
        }

        .wrapper([disabled]) {
          --_disabled-icon-color: GrayText;
          --_disabled-icon-opacity: 1;
          --_disabled-container-opacity: 1;
          --_disabled-label-text-color: GrayText;
          --_disabled-label-text-opacity: 1;
        }
      }

      .wrapper([has-icon]:not([trailing-icon])) {
        padding-inline-start: var(--_with-leading-icon-leading-space);
        padding-inline-end: var(--_with-leading-icon-trailing-space);
      }

      .wrapper([has-icon][trailing-icon]) {
        padding-inline-start: var(--_with-trailing-icon-leading-space);
        padding-inline-end: var(--_with-trailing-icon-trailing-space);
      }

      ::slotted([slot='icon']) {
        display: inline-flex;
        position: relative;
        writing-mode: horizontal-tb;
        fill: currentColor;
        flex-shrink: 0;
        color: var(--_icon-color);
        font-size: var(--_icon-size);
        inline-size: var(--_icon-size);
        block-size: var(--_icon-size);
      }

      .wrapper(:hover) ::slotted([slot='icon']) {
        color: var(--_hover-icon-color);
      }

      .wrapper(:focus-within) ::slotted([slot='icon']) {
        color: var(--_focus-icon-color);
      }

      .wrapper(:active) ::slotted([slot='icon']) {
        color: var(--_pressed-icon-color);
      }

      .wrapper([disabled]) ::slotted([slot='icon']) {
        color: var(--_disabled-icon-color);
        opacity: var(--_disabled-icon-opacity);
      }

      .touch {
        position: absolute;
        top: 50%;
        height: 48px;
        left: 0;
        right: 0;
        transform: translateY(-50%);
      }

      .wrapper([touch-target='wrapper']) {
        margin: max(0px, (48px - var(--_container-height))/2) 0;
      }

      .wrapper([touch-target='none']) .touch {
        display: none;
      }
    `,
    // sizes
    css`
      .extra-small {
        height: 32px;
        padding-left: 12px;
        padding-right: 12px;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        border-width: 1px;
      }
      .small {
        height: 40px;
        padding-left: 16px;
        padding-right: 16px;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        border-width: 1px;
      }
      .medium {
        height: 56px;
        padding-left: 24px;
        padding-right: 24px;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        border-width: 1px;
      }
      .large {
        height: 96px;
        padding-left: 48px;
        padding-right: 48px;
        font-weight: 400;
        font-size: 24px;
        line-height: 32px;
        border-width: 2px;
      }
      .extra-large {
        height: 136px;
        padding-left: 64px;
        padding-right: 64px;
        font-weight: 400;
        font-size: 32px;
        line-height: 40px;
        border-width: 3px;
      }
    `,
  ]
}
customElements.define('md-button', Button)
