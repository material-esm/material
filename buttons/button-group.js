import { html, LitElement, css } from 'lit'

export class ButtonGroup extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      flex-direction: row;
      vertical-align: middle;
    }

    /* Standard group adds gap between buttons */
    :host(:not([connected])) {
      gap: 8px; /* M3 standard button group gap */
    }

    /* Target all buttons except the first one */
    :host([connected]) ::slotted(*:not(:first-child)) {
      /* Make flat on the left side */
      --_container-shape-start-start: 0;
      --_container-shape-end-start: 0;

      /* Target variant-specific variables explicitly */
      --md-button-container-shape-start-start: 0;
      --md-button-container-shape-end-start: 0;
      --md-filled-tonal-button-container-shape-start-start: 0;
      --md-filled-tonal-button-container-shape-end-start: 0;
      --md-elevated-button-container-shape-start-start: 0;
      --md-elevated-button-container-shape-end-start: 0;
      --md-outlined-button-container-shape-start-start: 0;
      --md-outlined-button-container-shape-end-start: 0;
      --md-icon-button-container-shape-start-start: 0;
      --md-icon-button-container-shape-end-start: 0;

      /* Explicit border radius as fallback */
      border-start-start-radius: 0;
      border-end-start-radius: 0;

      /* Overlap borders */
      margin-inline-start: -1px;
    }

    /* Target all buttons except the last one */
    :host([connected]) ::slotted(*:not(:last-child)) {
      /* Make flat on the right side */
      --_container-shape-start-end: 0;
      --_container-shape-end-end: 0;

      /* Target variant-specific variables explicitly */
      --md-button-container-shape-start-end: 0;
      --md-button-container-shape-end-end: 0;
      --md-filled-tonal-button-container-shape-start-end: 0;
      --md-filled-tonal-button-container-shape-end-end: 0;
      --md-elevated-button-container-shape-start-end: 0;
      --md-elevated-button-container-shape-end-end: 0;
      --md-outlined-button-container-shape-start-end: 0;
      --md-outlined-button-container-shape-end-end: 0;
      --md-icon-button-container-shape-start-end: 0;
      --md-icon-button-container-shape-end-end: 0;

      /* Explicit border radius as fallback */
      border-start-end-radius: 0;
      border-end-end-radius: 0;
    }

    /* Ensure the active/hovered/focused button is on top to show full border */
    :host([connected]) ::slotted(*:hover),
    :host([connected]) ::slotted(*:focus-within),
    :host([connected]) ::slotted(*:active) {
      z-index: 1;
      position: relative;
    }

    /* Selected state needs to be above unselected for connected groups */
    :host([connected]) ::slotted([selected]) {
      z-index: 1;
      position: relative;
    }
  `

  static properties = {
    connected: { type: Boolean, reflect: true }
  }

  constructor() {
    super()
    this.connected = false
  }

  render() {
    return html`<slot></slot>`
  }
}

customElements.define('md-button-group', ButtonGroup)
