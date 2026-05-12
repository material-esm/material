import { html, LitElement, css } from 'lit';

/**
 * A Material 3 Carousel component.
 *
 * @element md-carousel
 */
export class Carousel extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 8px;
          padding: 16px;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }

        :host::-webkit-scrollbar {
          display: none; /* Chrome/Safari/Opera */
        }

        ::slotted(*) {
          scroll-snap-align: start;
          flex: 0 0 auto;
        }
      `
    ];
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.internals.role = 'list';
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('md-carousel', Carousel);
