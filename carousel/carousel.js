import { LitElement, html, css } from 'lit';

/**
 * A Material Design carousel component.
 */
export class Carousel extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        overflow-x: auto;
        overscroll-behavior-x: contain;
        scroll-snap-type: x mandatory;
        scrollbar-width: none; /* Firefox */
      }

      :host::-webkit-scrollbar {
        display: none; /* Safari and Chrome */
      }

      .container {
        display: flex;
        gap: 8px; /* Default gap */
      }

      ::slotted(*) {
        scroll-snap-align: start;
        flex: 0 0 auto;
      }
    `;
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.internals.role = 'list';
    this.internals.ariaLabel = 'Carousel';
  }

  render() {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('md-carousel', Carousel);
