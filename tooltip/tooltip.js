import { html, LitElement, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

export class Tooltip extends LitElement {
  static properties = {
    type: { type: String }, // 'plain' or 'rich'
    headline: { type: String },
    text: { type: String },
    open: { type: Boolean, reflect: true },
  }

  constructor() {
    super()
    this.headline = ''
    this.text = ''
    this.type = 'plain'
    this.open = false
    this.showTimeout = null
    this.hideTimeout = null
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('mouseenter', this.handleMouseEnter)
    this.addEventListener('mouseleave', this.handleMouseLeave)
    this.addEventListener('focus', this.handleFocus, true)
    this.addEventListener('blur', this.handleBlur, true)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('mouseenter', this.handleMouseEnter)
    this.removeEventListener('mouseleave', this.handleMouseLeave)
    this.removeEventListener('focus', this.handleFocus, true)
    this.removeEventListener('blur', this.handleBlur, true)
    this.clearTimeouts()
  }

  handleMouseEnter = () => {
    this.clearTimeouts()
    this.showTimeout = setTimeout(() => {
      this.open = true
    }, 500)
  }

  handleMouseLeave = () => {
    this.clearTimeouts()
    this.hideTimeout = setTimeout(() => {
      this.open = false
    }, 500) // Increased delay to allow interaction with rich tooltips
  }

  handleFocus = () => {
    this.clearTimeouts()
    this.open = true
  }

  handleBlur = () => {
    this.clearTimeouts()
    this.open = false
  }

  clearTimeouts() {
    if (this.showTimeout) clearTimeout(this.showTimeout)
    if (this.hideTimeout) clearTimeout(this.hideTimeout)
  }

  render() {
    const classes = {
      'md-tooltip': true,
      'md-tooltip--rich': this.type === 'rich',
    }

    return html`
      <div class="target">
        <slot></slot>
      </div>
      <div class=${classMap(classes)} role="tooltip" aria-hidden=${!this.open}>
        <div class="content">
          ${this.type === 'rich' ? html`<div class="headline">${this.headline}<slot name="headline"></slot></div>` : ''}
          ${this.text}<slot name="text"></slot>
        </div>
        ${this.type === 'rich' ? html`<div class="actions"><slot name="actions"></slot></div>` : ''}
      </div>
    `
  }

  static styles = [
    css`
      :host {
        display: inline-block;
        position: relative;
        --_container-color: var(--md-sys-color-inverse-surface, #313033);
        --_text-color: var(--md-sys-color-inverse-on-surface, #f4eff4);
        --_rich-container-color: var(--md-sys-color-surface-container, #f3edf7);
        --_rich-text-color: var(--md-sys-color-on-surface-variant, #49454f);
      }

      .md-tooltip {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 4px;
        background-color: var(--_container-color);
        color: var(--_text-color);
        border-radius: 4px;
        padding: 4px 8px;
        font-family: var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto));
        font-size: var(--md-sys-typescale-body-small-size, 12px);
        line-height: var(--md-sys-typescale-body-small-line-height, 16px);
        font-weight: var(--md-sys-typescale-body-small-weight, 400);
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 0.2s,
          visibility 0.2s;
        z-index: 100;
        pointer-events: none;
        white-space: nowrap;
        box-sizing: border-box;
      }

      :host([open]) .md-tooltip {
        opacity: 1;
        visibility: visible;
      }

      .headline {
        font-weight: 500;
      }

      .md-tooltip.md-tooltip--rich {
        background-color: var(--_rich-container-color);
        color: var(--_rich-text-color);
        border-radius: 12px;
        padding: 12px 16px;
        font-family: var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto));
        font-size: var(--md-sys-typescale-body-medium-size, 14px);
        line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
        box-shadow:
          0px 4px 8px 3px rgba(0, 0, 0, 0.15),
          0px 1px 3px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        white-space: normal;
        min-width: 200px;
        max-width: 320px;
      }

      .actions {
        margin-top: 8px;
        display: flex;
        gap: 8px;
      }
    `,
  ]
}

customElements.define('md-tooltip', Tooltip)
