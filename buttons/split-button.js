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

    /* Start button styling */
    slot[name='start']::slotted(md-button),
    .leading-button {
      /* Generic shape flattening for Start Button (Right side flat) */
      --md-button-container-shape-start-end: 0;
      --md-button-container-shape-end-end: 0;

      /* Variant specific shapes */
      --md-filled-tonal-button-container-shape-start-end: 0;
      --md-filled-tonal-button-container-shape-end-end: 0;
      --md-elevated-button-container-shape-start-end: 0;
      --md-elevated-button-container-shape-end-end: 0;
      --md-outlined-button-container-shape-start-end: 0;
      --md-outlined-button-container-shape-end-end: 0;

      /* Force internal variables to ensure override (fix for Outlined variant) */
      --_container-shape-start-end: 0;
      --_container-shape-end-end: 0;

      /* Explicit border radius as fallback */
      border-start-end-radius: 0;
      border-end-end-radius: 0;

      margin-inline-end: 0;
    }

    /* End button styling */
    slot[name='end']::slotted(md-button),
    .trailing-button {
      /* Generic shape flattening for End Button (Left side flat) */
      --md-button-container-shape-start-start: 0;
      --md-button-container-shape-end-start: 0;

      /* Variant specific shapes */
      --md-filled-tonal-button-container-shape-start-start: 0;
      --md-filled-tonal-button-container-shape-end-start: 0;
      --md-elevated-button-container-shape-start-start: 0;
      --md-elevated-button-container-shape-end-start: 0;
      --md-outlined-button-container-shape-start-start: 0;
      --md-outlined-button-container-shape-end-start: 0;

      /* Force internal variables */
      --_container-shape-start-start: 0;
      --_container-shape-end-start: 0;

      /* Explicit border radius as fallback */
      border-start-start-radius: 0;
      border-end-start-radius: 0;

      margin-inline-start: 0;
    }

    .trailing-button md-icon {
      transition: transform 0.2s ease-in-out;
    }

    .trailing-button:is(:hover, :active) md-icon {
      transform: rotate(180deg);
    }

    /* Outlined overlap */
    slot[name='end']::slotted(md-button[color='outlined']) {
      margin-inline-start: -1px;
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

    /* Mapping separator colors based on inferred type set in JS */
    :host([separator-type='filled']) {
      --_separator-color: var(--md-sys-color-on-primary, #fff);
    }
    :host([separator-type='tonal']) {
      --_separator-color: var(--md-sys-color-on-secondary-container, #1d192b);
    }
    :host([separator-type='elevated']) {
      --_separator-color: var(--md-sys-color-primary, #6750a4);
    }
  `

  static properties = {
    separatorType: { type: String, reflect: true, attribute: 'separator-type' },
    color: { type: String },
    size: { type: String },
  }

  constructor() {
    super()
    this.separatorType = 'filled'
    this.color = 'filled'
    this.size = 'medium'
  }

  get startSlot() {
    return this.shadowRoot.querySelector('slot[name="start"]')
  }

  // Use arrow function to bind 'this'
  handleSlotChange = () => {
    const nodes = this.startSlot.assignedElements({ flatten: true })
    const btn = nodes.find((n) => n.tagName === 'MD-BUTTON')
    if (btn) {
      const color = btn.getAttribute('color') || 'filled'
      this.separatorType = color
    }
  }

  render() {
    return html`
      <md-button class="leading-button" color=${this.color} size=${this.size}>
        <slot></slot>
      </md-button>
      <div id="separator"></div>
      <md-icon-button
        class="trailing-button"
        id="split-anchor"
        color=${this.color}
        size=${this.size}
        @click=${this.toggleMenu}>
        <md-icon>keyboard_arrow_down</md-icon>
      </md-icon-button>
      <md-menu id="menu" anchor="split-anchor" positioning="popover">
        <slot name="menu"></slot>
      </md-menu>
    `
  }

  toggleMenu() {
    console.log('toggleMenu')
    const menu = this.renderRoot.querySelector('#menu')
    menu.open = !menu.open
  }
}
customElements.define('md-split-button', SplitButton)
