import '../internal/elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { html, LitElement, nothing, css } from 'lit'
import { literal, html as staticHtml } from 'lit/static-html.js'
import { classMap } from 'lit/directives/class-map.js'

/**
 * @summary Floating action buttons (FABs) help people take primary actions.
 * They’re used to represent the most important action on a screen, such as
 * Create or Reply.
 *
 * @description
 * __Emphasis:__ High emphasis – For the primary, most important, or most common
 * action on a screen
 *
 * __Rationale:__ The FAB remains the default component for a screen’s primary
 * action. It comes in three sizes: small FAB, FAB, and large FAB. The extended
 * FAB’s wider format and text label give it more visual prominence than a  FAB.
 * It’s often used on larger screens where a FAB would seem too small.
 *
 * __Example usages:__
 * - FAB
 *   - Create
 *   - Compose
 * - Extended FAB
 *   - Create
 *   - Compose
 *   - New Thread
 *   - New File
 *
 * @final
 * @suppress {visibility}
 */

export class Fab extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    label: { type: String },
    lowered: { type: Boolean },
    href: { type: String },
    target: { type: String },
    extended: { type: Boolean },
    variant: { type: String, reflect: true },
  }

  constructor() {
    super(...arguments)
    /**
     * The size of the FAB.
     */
    this.size = 'medium'
    /**
     * The text to display on the FAB.
     */
    this.label = ''
    /**
     * Lowers the FAB's elevation.
     */
    this.lowered = false
    /**
     * Sets the underlying `HTMLAnchorElement`'s `href` resource attribute.
     */
    this.href = ''

    /**
     * Sets targer if href is set.
     */
    this.target = ''

    /**
     * This will allow the fab to expand and use the label
     */
    this.extended = false

    /**
     * The FAB color variant to render.
     */
    this.variant = 'surface'
  }
  render() {
    // Needed for closure conformance
    const { ariaLabel } = this
    const tag = this.href ? literal`div` : literal`button`
    return staticHtml`
      <${tag}
        class="fab ${classMap(this.label ? this.getRenderClassesExtended() : this.getRenderClassesRegular())}"
        aria-label=${ariaLabel || nothing}>
        <md-elevation part="elevation"></md-elevation>
        <md-focus-ring part="focus-ring" 
        for=${this.href ? 'link' : 'button'}></md-focus-ring>
        <md-ripple class="ripple" for=${this.href ? 'link' : nothing}
        ?disabled="${!this.href && this.disabled}"></md-ripple>
        ${this.renderTouchTarget()} ${this.renderIcon()} ${this.renderLabel()}
        ${this.href && this.renderLink()}
      </${tag}>
    `
  }
  getRenderClassesExtended() {
    return {
      ...this.getRenderClasses(),
      primary: false,
      secondary: false,
      tertiary: false,
      small: false,
    }
  }
  getRenderClassesRegular() {
    return {
      ...this.getRenderClasses(),
      primary: this.variant === 'primary',
      secondary: this.variant === 'secondary',
      tertiary: this.variant === 'tertiary',
    }
  }
  getRenderClasses() {
    const isExtended = this.label && this.extended
    return {
      lowered: this.lowered,
      small: this.size === 'small',
      medium: this.size == 'medium',
      large: this.size === 'large',
      extended: isExtended,
    }
  }
  renderTouchTarget() {
    return html`<div class="touch-target"></div>`
  }
  renderLabel() {
    return this.extended && this.label ? html`<span class="label">${this.label}</span>` : ''
  }
  renderIcon() {
    const { ariaLabel } = this
    return html`<span class="icon">
      <slot name="icon" aria-hidden=${ariaLabel || this.label ? 'true' : nothing}>
        <span></span>
      </slot>
    </span>`
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

  static styles = [
    // shared
    css`
      :host {
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
        display: inline-flex;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      }

      :host([size='medium'][touch-target='wrapper']) {
        margin: max(0px, 48px - var(--_container-height));
      }

      :host([size='large'][touch-target='wrapper']) {
        margin: max(0px, 48px - var(--_large-container-height));
      }

      .fab,
      .icon,
      .icon ::slotted(*) {
        display: flex;
      }

      .fab {
        align-items: center;
        justify-content: center;
        vertical-align: middle;
        padding: 0;
        position: relative;
        height: var(--_container-height);
        transition-property: background-color;
        border-width: 0px;
        outline: none;
        z-index: 0;
        text-transform: inherit;
        --md-elevation-level: var(--_container-elevation);
        --md-elevation-shadow-color: var(--_container-shadow-color);
        background-color: var(--_container-color);
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
      }

      .fab.extended {
        width: inherit;
        box-sizing: border-box;
        padding-inline-start: 16px;
        padding-inline-end: 20px;
      }

      .fab:not(.extended) {
        width: var(--_container-width);
      }

      .fab.medium {
        height: 80px;
      }

      .fab.medium:not(.extended) {
        width: 80px;
      }

      .fab.medium .label {
        font-size: 22px;
        line-height: 28px;
        font-weight: 400;
      }

      .fab.large .label {
        font-size: 24px;
        line-height: 32px;
        font-weight: 400;
      }

      .fab.large {
        height: var(--_large-container-height);
      }

      .fab.large:not(.extended) {
        width: var(--_large-container-width);
      }
      .fab.large.extended {
      }

      .fab.large .icon ::slotted(*) {
        width: var(--_large-icon-size);
        height: var(--_large-icon-size);
        font-size: var(--_large-icon-size);
      }

      .fab.large,
      .fab.large .ripple {
        border-start-start-radius: var(--_large-container-shape-start-start);
        border-start-end-radius: var(--_large-container-shape-start-end);
        border-end-start-radius: var(--_large-container-shape-end-start);
        border-end-end-radius: var(--_large-container-shape-end-end);
      }

      .fab.large md-focus-ring {
        --md-focus-ring-shape-start-start: var(--_large-container-shape-start-start);
        --md-focus-ring-shape-start-end: var(--_large-container-shape-start-end);
        --md-focus-ring-shape-end-end: var(--_large-container-shape-end-end);
        --md-focus-ring-shape-end-start: var(--_large-container-shape-end-start);
      }

      .fab:focus {
        --md-elevation-level: var(--_focus-container-elevation);
      }

      .fab:hover {
        --md-elevation-level: var(--_hover-container-elevation);
      }

      .fab:active {
        --md-elevation-level: var(--_pressed-container-elevation);
      }

      .fab.lowered {
        background-color: var(--_lowered-container-color);
        --md-elevation-level: var(--_lowered-container-elevation);
      }

      .fab.lowered:focus {
        --md-elevation-level: var(--_lowered-focus-container-elevation);
      }

      .fab.lowered:hover {
        --md-elevation-level: var(--_lowered-hover-container-elevation);
      }

      .fab.lowered:active {
        --md-elevation-level: var(--_lowered-pressed-container-elevation);
      }

      .fab .label {
        color: var(--_label-text-color);
      }

      .fab:hover .fab .label {
        color: var(--_hover-label-text-color);
      }

      .fab:focus .fab .label {
        color: var(--_focus-label-text-color);
      }

      .fab:active .fab .label {
        color: var(--_pressed-label-text-color);
      }

      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--_label-text-font);
        font-size: var(--_label-text-size);
        line-height: var(--_label-text-line-height);
        font-weight: var(--_label-text-weight);
      }

      .fab.extended .icon ::slotted(*) {
        margin-inline-end: 12px;
      }

      .ripple {
        overflow: hidden;
      }

      .ripple,
      md-elevation {
        z-index: -1;
      }

      .touch-target {
        position: absolute;
        top: 50%;
        height: 48px;
        left: 50%;
        width: 48px;
        transform: translate(-50%, -50%);
      }

      :host([touch-target='none']) .touch-target {
        display: none;
      }

      md-elevation,
      .fab {
        transition-duration: 280ms;
        transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
      }

      .fab,
      .ripple {
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
      }

      md-focus-ring {
        --md-focus-ring-shape-start-start: var(--_container-shape-start-start);
        --md-focus-ring-shape-start-end: var(--_container-shape-start-end);
        --md-focus-ring-shape-end-end: var(--_container-shape-end-end);
        --md-focus-ring-shape-end-start: var(--_container-shape-end-start);
      }

      .icon ::slotted(*) {
        width: var(--_icon-size);
        height: var(--_icon-size);
        font-size: var(--_icon-size);
      }

      .link {
        height: 100%;
        outline: none;
        position: absolute;
        width: 100%;
      }
    `,
    // regular
    css`
      :host {
        --_container-color: var(--md-fab-container-color, var(--md-sys-color-surface-container-high, #ece6f0));
        --_container-elevation: var(--md-fab-container-elevation, 3);
        --_container-height: var(--md-fab-container-height, 56px);
        --_container-shadow-color: var(--md-fab-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_container-width: var(--md-fab-container-width, 56px);
        --_focus-container-elevation: var(--md-fab-focus-container-elevation, 3);
        --_focus-icon-color: var(--md-fab-focus-icon-color, var(--md-sys-color-primary, #6750a4));
        --_hover-container-elevation: var(--md-fab-hover-container-elevation, 4);
        --_hover-icon-color: var(--md-fab-hover-icon-color, var(--md-sys-color-primary, #6750a4));
        --_hover-state-layer-color: var(--md-fab-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));
        --_hover-state-layer-opacity: var(--md-fab-hover-state-layer-opacity, 0.08);
        --_icon-color: var(--md-fab-icon-color, var(--md-sys-color-primary, #6750a4));
        --_icon-size: var(--md-fab-icon-size, 24px);
        --_lowered-container-color: var(
          --md-fab-lowered-container-color,
          var(--md-sys-color-surface-container-low, #f7f2fa)
        );
        --_lowered-container-elevation: var(--md-fab-lowered-container-elevation, 1);
        --_lowered-focus-container-elevation: var(--md-fab-lowered-focus-container-elevation, 1);
        --_lowered-hover-container-elevation: var(--md-fab-lowered-hover-container-elevation, 2);
        --_lowered-pressed-container-elevation: var(--md-fab-lowered-pressed-container-elevation, 1);
        --_pressed-container-elevation: var(--md-fab-pressed-container-elevation, 3);
        --_pressed-icon-color: var(--md-fab-pressed-icon-color, var(--md-sys-color-primary, #6750a4));
        --_pressed-state-layer-color: var(--md-fab-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));
        --_pressed-state-layer-opacity: var(--md-fab-pressed-state-layer-opacity, 0.12);
        --_focus-label-text-color: var(--md-fab-focus-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_hover-label-text-color: var(--md-fab-hover-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_label-text-color: var(--md-fab-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_label-text-font: var(
          --md-fab-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-fab-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(--md-fab-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
        --_label-text-weight: var(
          --md-fab-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_large-container-height: var(--md-fab-large-container-height, 96px);
        --_large-container-width: var(--md-fab-large-container-width, 96px);
        --_large-icon-size: var(--md-fab-large-icon-size, 36px);
        --_pressed-label-text-color: var(--md-fab-pressed-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_primary-container-color: var(
          --md-fab-primary-container-color,
          var(--md-sys-color-primary-container, #eaddff)
        );
        --_primary-focus-icon-color: var(
          --md-fab-primary-focus-icon-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_primary-focus-label-text-color: var(
          --md-fab-primary-focus-label-text-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_primary-hover-icon-color: var(
          --md-fab-primary-hover-icon-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_primary-hover-label-text-color: var(
          --md-fab-primary-hover-label-text-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_primary-hover-state-layer-color: var(
          --md-fab-primary-hover-state-layer-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_primary-icon-color: var(--md-fab-primary-icon-color, var(--md-sys-color-on-primary-container, #21005d));
        --_primary-label-text-color: var(
          --md-fab-primary-label-text-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_primary-pressed-icon-color: var(
          --md-fab-primary-pressed-icon-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_primary-pressed-label-text-color: var(
          --md-fab-primary-pressed-label-text-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_primary-pressed-state-layer-color: var(
          --md-fab-primary-pressed-state-layer-color,
          var(--md-sys-color-on-primary-container, #21005d)
        );
        --_secondary-container-color: var(
          --md-fab-secondary-container-color,
          var(--md-sys-color-secondary-container, #e8def8)
        );
        --_secondary-focus-icon-color: var(
          --md-fab-secondary-focus-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-focus-label-text-color: var(
          --md-fab-secondary-focus-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-hover-icon-color: var(
          --md-fab-secondary-hover-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-hover-label-text-color: var(
          --md-fab-secondary-hover-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-hover-state-layer-color: var(
          --md-fab-secondary-hover-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-icon-color: var(
          --md-fab-secondary-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-label-text-color: var(
          --md-fab-secondary-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-pressed-icon-color: var(
          --md-fab-secondary-pressed-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-pressed-label-text-color: var(
          --md-fab-secondary-pressed-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_secondary-pressed-state-layer-color: var(
          --md-fab-secondary-pressed-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_small-container-height: var(--md-fab-small-container-height, 40px);
        --_small-container-width: var(--md-fab-small-container-width, 40px);
        --_small-icon-size: var(--md-fab-small-icon-size, 24px);
        --_tertiary-container-color: var(
          --md-fab-tertiary-container-color,
          var(--md-sys-color-tertiary-container, #ffd8e4)
        );
        --_tertiary-focus-icon-color: var(
          --md-fab-tertiary-focus-icon-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_tertiary-focus-label-text-color: var(
          --md-fab-tertiary-focus-label-text-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_tertiary-hover-icon-color: var(
          --md-fab-tertiary-hover-icon-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_tertiary-hover-label-text-color: var(
          --md-fab-tertiary-hover-label-text-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_tertiary-hover-state-layer-color: var(
          --md-fab-tertiary-hover-state-layer-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_tertiary-icon-color: var(--md-fab-tertiary-icon-color, var(--md-sys-color-on-tertiary-container, #31111d));
        --_tertiary-label-text-color: var(
          --md-fab-tertiary-label-text-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_tertiary-pressed-icon-color: var(
          --md-fab-tertiary-pressed-icon-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_tertiary-pressed-label-text-color: var(
          --md-fab-tertiary-pressed-label-text-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_tertiary-pressed-state-layer-color: var(
          --md-fab-tertiary-pressed-state-layer-color,
          var(--md-sys-color-on-tertiary-container, #31111d)
        );
        --_container-shape-start-start: var(
          --md-fab-container-shape-start-start,
          var(--md-fab-container-shape, var(--md-sys-shape-corner-large, 16px))
        );
        --_container-shape-start-end: var(
          --md-fab-container-shape-start-end,
          var(--md-fab-container-shape, var(--md-sys-shape-corner-large, 16px))
        );
        --_container-shape-end-end: var(
          --md-fab-container-shape-end-end,
          var(--md-fab-container-shape, var(--md-sys-shape-corner-large, 16px))
        );
        --_container-shape-end-start: var(
          --md-fab-container-shape-end-start,
          var(--md-fab-container-shape, var(--md-sys-shape-corner-large, 16px))
        );
        --_large-container-shape-start-start: var(
          --md-fab-large-container-shape-start-start,
          var(--md-fab-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        --_large-container-shape-start-end: var(
          --md-fab-large-container-shape-start-end,
          var(--md-fab-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        --_large-container-shape-end-end: var(
          --md-fab-large-container-shape-end-end,
          var(--md-fab-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        --_large-container-shape-end-start: var(
          --md-fab-large-container-shape-end-start,
          var(--md-fab-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        --_small-container-shape-start-start: var(
          --md-fab-small-container-shape-start-start,
          var(--md-fab-small-container-shape, var(--md-sys-shape-corner-medium, 12px))
        );
        --_small-container-shape-start-end: var(
          --md-fab-small-container-shape-start-end,
          var(--md-fab-small-container-shape, var(--md-sys-shape-corner-medium, 12px))
        );
        --_small-container-shape-end-end: var(
          --md-fab-small-container-shape-end-end,
          var(--md-fab-small-container-shape, var(--md-sys-shape-corner-medium, 12px))
        );
        --_small-container-shape-end-start: var(
          --md-fab-small-container-shape-end-start,
          var(--md-fab-small-container-shape, var(--md-sys-shape-corner-medium, 12px))
        );
        cursor: pointer;
      }
      :host([size='small'][touch-target='wrapper']) {
        margin: max(0px, 48px - var(--_small-container-height));
      }
      .fab {
        cursor: inherit;
      }
      .fab .icon ::slotted(*) {
        color: var(--_icon-color);
      }
      .fab:focus {
        color: var(--_focus-icon-color);
      }
      .fab:hover {
        color: var(--_hover-icon-color);
      }
      .fab:active {
        color: var(--_pressed-icon-color);
      }
      .fab.primary {
        background-color: var(--_primary-container-color);
        --md-ripple-hover-color: var(--_primary-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_primary-pressed-state-layer-color);
      }
      .fab.primary .icon ::slotted(*) {
        color: var(--_primary-icon-color);
      }
      .fab.primary:focus {
        color: var(--_primary-focus-icon-color);
      }
      .fab.primary:hover {
        color: var(--_primary-hover-icon-color);
      }
      .fab.primary:active {
        color: var(--_primary-pressed-icon-color);
      }
      .fab.primary .label {
        color: var(--_primary-label-text-color);
      }
      .fab:hover .fab.primary .label {
        color: var(--_primary-hover-label-text-color);
      }
      .fab:focus .fab.primary .label {
        color: var(--_primary-focus-label-text-color);
      }
      .fab:active .fab.primary .label {
        color: var(--_primary-pressed-label-text-color);
      }
      .fab.secondary {
        background-color: var(--_secondary-container-color);
        --md-ripple-hover-color: var(--_secondary-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_secondary-pressed-state-layer-color);
      }
      .fab.secondary .icon ::slotted(*) {
        color: var(--_secondary-icon-color);
      }
      .fab.secondary:focus {
        color: var(--_secondary-focus-icon-color);
      }
      .fab.secondary:hover {
        color: var(--_secondary-hover-icon-color);
      }
      .fab.secondary:active {
        color: var(--_secondary-pressed-icon-color);
      }
      .fab.secondary .label {
        color: var(--_secondary-label-text-color);
      }
      .fab:hover .fab.secondary .label {
        color: var(--_secondary-hover-label-text-color);
      }
      .fab:focus .fab.secondary .label {
        color: var(--_secondary-focus-label-text-color);
      }
      .fab:active .fab.secondary .label {
        color: var(--_secondary-pressed-label-text-color);
      }
      .fab.tertiary {
        background-color: var(--_tertiary-container-color);
        --md-ripple-hover-color: var(--_tertiary-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_tertiary-pressed-state-layer-color);
      }
      .fab.tertiary .icon ::slotted(*) {
        color: var(--_tertiary-icon-color);
      }
      .fab.tertiary:focus {
        color: var(--_tertiary-focus-icon-color);
      }
      .fab.tertiary:hover {
        color: var(--_tertiary-hover-icon-color);
      }
      .fab.tertiary:active {
        color: var(--_tertiary-pressed-icon-color);
      }
      .fab.tertiary .label {
        color: var(--_tertiary-label-text-color);
      }
      .fab:hover .fab.tertiary .label {
        color: var(--_tertiary-hover-label-text-color);
      }
      .fab:focus .fab.tertiary .label {
        color: var(--_tertiary-focus-label-text-color);
      }
      .fab:active .fab.tertiary .label {
        color: var(--_tertiary-pressed-label-text-color);
      }
      .fab.extended slot span {
        padding-inline-start: 4px;
      }
      .fab.small {
        width: var(--_small-container-width);
        height: var(--_small-container-height);
      }
      .fab.small .icon ::slotted(*) {
        width: var(--_small-icon-size);
        height: var(--_small-icon-size);
        font-size: var(--_small-icon-size);
      }
      .fab.small,
      .fab.small .ripple {
        border-start-start-radius: var(--_small-container-shape-start-start);
        border-start-end-radius: var(--_small-container-shape-start-end);
        border-end-start-radius: var(--_small-container-shape-end-start);
        border-end-end-radius: var(--_small-container-shape-end-end);
      }
      .fab.small md-focus-ring {
        --md-focus-ring-shape-start-start: var(--_small-container-shape-start-start);
        --md-focus-ring-shape-start-end: var(--_small-container-shape-start-end);
        --md-focus-ring-shape-end-end: var(--_small-container-shape-end-end);
        --md-focus-ring-shape-end-start: var(--_small-container-shape-end-start);
      }
    `,
    // extended
    css`
      :host {
        --_container-color: var(--md-fab-branded-container-color, var(--md-sys-color-surface-container-high, #ece6f0));
        --_container-elevation: var(--md-fab-branded-container-elevation, 3);
        --_container-height: var(--md-fab-branded-container-height, 56px);
        --_container-shadow-color: var(--md-fab-branded-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_container-width: var(--md-fab-branded-container-width, 56px);
        --_focus-container-elevation: var(--md-fab-branded-focus-container-elevation, 3);
        --_hover-container-elevation: var(--md-fab-branded-hover-container-elevation, 4);
        --_hover-state-layer-color: var(--md-fab-branded-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));
        --_hover-state-layer-opacity: var(--md-fab-branded-hover-state-layer-opacity, 0.08);
        --_icon-size: var(--md-fab-branded-icon-size, 36px);
        --_lowered-container-color: var(
          --md-fab-branded-lowered-container-color,
          var(--md-sys-color-surface-container-low, #f7f2fa)
        );
        --_lowered-container-elevation: var(--md-fab-branded-lowered-container-elevation, 1);
        --_lowered-focus-container-elevation: var(--md-fab-branded-lowered-focus-container-elevation, 1);
        --_lowered-hover-container-elevation: var(--md-fab-branded-lowered-hover-container-elevation, 2);
        --_lowered-pressed-container-elevation: var(--md-fab-branded-lowered-pressed-container-elevation, 1);
        --_pressed-container-elevation: var(--md-fab-branded-pressed-container-elevation, 3);
        --_pressed-state-layer-color: var(
          --md-fab-branded-pressed-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_pressed-state-layer-opacity: var(--md-fab-branded-pressed-state-layer-opacity, 0.12);
        --_focus-label-text-color: var(--md-fab-branded-focus-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_hover-label-text-color: var(--md-fab-branded-hover-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_label-text-color: var(--md-fab-branded-label-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_label-text-font: var(
          --md-fab-branded-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-size: var(--md-fab-branded-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
        --_label-text-line-height: var(
          --md-fab-branded-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-weight: var(
          --md-fab-branded-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_large-container-height: var(--md-fab-branded-large-container-height, 96px);
        --_large-container-width: var(--md-fab-branded-large-container-width, 96px);
        --_large-icon-size: var(--md-fab-branded-large-icon-size, 48px);
        --_pressed-label-text-color: var(
          --md-fab-branded-pressed-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_container-shape-start-start: var(
          --md-fab-branded-container-shape-start-start,
          var(--md-fab-branded-container-shape, var(--md-sys-shape-corner-large, 16px))
        );
        --_container-shape-start-end: var(
          --md-fab-branded-container-shape-start-end,
          var(--md-fab-branded-container-shape, var(--md-sys-shape-corner-large, 16px))
        );
        --_container-shape-end-end: var(
          --md-fab-branded-container-shape-end-end,
          var(--md-fab-branded-container-shape, var(--md-sys-shape-corner-large, 16px))
        );
        --_container-shape-end-start: var(
          --md-fab-branded-container-shape-end-start,
          var(--md-fab-branded-container-shape, var(--md-sys-shape-corner-large, 16px))
        );
        --_large-container-shape-start-start: var(
          --md-fab-branded-large-container-shape-start-start,
          var(--md-fab-branded-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        --_large-container-shape-start-end: var(
          --md-fab-branded-large-container-shape-start-end,
          var(--md-fab-branded-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        --_large-container-shape-end-end: var(
          --md-fab-branded-large-container-shape-end-end,
          var(--md-fab-branded-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        --_large-container-shape-end-start: var(
          --md-fab-branded-large-container-shape-end-start,
          var(--md-fab-branded-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
      }
    `,
    css`
      @media (forced-colors: active) {
        .fab {
          border: 1px solid ButtonText;
        }
        .fab.extended {
          padding-inline-start: 15px;
          padding-inline-end: 19px;
        }
        md-focus-ring {
          --md-focus-ring-outward-offset: 3px;
        }
      }
    `,
  ]
}
// ;(() => {
//   requestUpdateOnAriaChange(SharedFab)
// })()
/** @nocollapse */
// SharedFab.shadowRootOptions = {
//   mode: 'open',
//   delegatesFocus: true,
// }

customElements.define('md-fab', Fab)
