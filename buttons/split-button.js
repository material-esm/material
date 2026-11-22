import { html, LitElement, css } from 'lit'
import '../buttons/button.js'
import '../buttons/icon-button.js'
import '../menu/menu.js'
import '../menu/menu-item.js'

export class SplitButton extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      flex-direction: row;
      vertical-align: middle;
      position: relative;
    }

    :host([disabled]) {
      cursor: default;
    }

    /* Start button styling */
    .leading-button {
      /* Generic shape flattening for Start Button (Right side flat) */
      --md-button-container-shape-start-end: 0px;
      --md-button-container-shape-end-end: 0px;

      /* Variant specific shapes */
      --md-filled-tonal-button-container-shape-start-end: 0px;
      --md-filled-tonal-button-container-shape-end-end: 0px;
      --md-elevated-button-container-shape-start-end: 0px;
      --md-elevated-button-container-shape-end-end: 0px;
      --md-outlined-button-container-shape-start-end: 0px;
      --md-outlined-button-container-shape-end-end: 0px;

      /* Explicit border radius as fallback */
      border-start-end-radius: 0px;
      border-end-end-radius: 0px;

      margin-inline-end: 0;
    }

    /* End button styling */
    slot[name='end']::slotted(md-button),
    .trailing-button {
      /* Generic shape flattening for End Button (Left side flat) */
      --md-button-container-shape-start-start: 0px;
      --md-button-container-shape-end-start: 0px;
      --md-icon-button-container-shape-start-start: 0px;
      --md-icon-button-container-shape-end-start: 0px;

      /* Variant specific shapes */
      --md-filled-tonal-button-container-shape-start-start: 0px;
      --md-filled-tonal-button-container-shape-end-start: 0px;
      --md-elevated-button-container-shape-start-start: 0px;
      --md-elevated-button-container-shape-end-start: 0px;
      --md-outlined-button-container-shape-start-start: 0px;
      --md-outlined-button-container-shape-end-start: 0px;

      /* Explicit border radius as fallback */
      border-start-start-radius: 0px;
      border-end-start-radius: 0px;

      margin-inline-start: 0;
    }

    .trailing-button md-icon {
      transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
      @media (prefers-reduced-motion: reduce) {
        transition-duration: 0s;
      }
    }

    .trailing-button:is(:hover, :active) md-icon {
      transform: rotate(180deg);
    }

    /* Z-index management */
    ::slotted(md-button:hover),
    ::slotted(md-button:focus-within),
    ::slotted(md-button:active) {
      z-index: 1;
      position: relative;
    }

    /* Separator element styling */
    #separator {
      width: 2px;
      margin-inline-start: -1px;
      z-index: 2;
      pointer-events: none;
      background-color: var(--_separator-color, transparent);
      opacity: 0.3;
      align-self: stretch;
    }
  `

  static properties = {
    separatorType: { type: String, reflect: true, attribute: 'separator-type' },
    color: { type: String },
    size: { type: String },
    disabled: { type: Boolean, reflect: true },
  }

  constructor() {
    super()
    this.separatorType = 'filled'
    this.color = 'filled'
    this.size = 'small'
    this.disabled = false
    this.handleEvent = this.handleEvent.bind(this)
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', this.handleEvent, { capture: true })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('click', this.handleEvent, { capture: true })
  }

  handleEvent(event) {
    if (this.disabled) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  render() {
    return html`
      <md-button class="leading-button" color=${this.color} size=${this.size} ?disabled=${this.disabled}>
        <slot></slot>
      </md-button>
      <div id="separator"></div>
      <md-icon-button
        class="trailing-button"
        id="split-anchor"
        type="button"
        color=${this.color}
        size=${this.size}
        ?disabled=${this.disabled}
        @click=${this.toggleMenu}>
        <md-icon>keyboard_arrow_down</md-icon>
      </md-icon-button>
      <md-menu id="menu" anchor="split-anchor" positioning="popover" @click=${(e) => e.stopPropagation()}>
        <slot name="menu"></slot>
      </md-menu>
    `
  }

  toggleMenu(e) {
    e.stopPropagation()
    const menu = this.renderRoot.querySelector('#menu')
    menu.open = !menu.open
  }
}

customElements.define('md-split-button', SplitButton)
