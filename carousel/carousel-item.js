import { html, LitElement, css } from 'lit';

/**
 * An item inside a Material 3 Carousel.
 *
 * @element md-carousel-item
 */
export class CarouselItem extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
          border-radius: 16px;
          overflow: hidden;
          /* Default aspect ratio, can be overridden */
          aspect-ratio: 1;
          width: 200px; /* Default width, can be overridden */
          scroll-snap-align: start;
          flex: 0 0 auto;
        }

        ::slotted(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `
    ];
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.internals.role = 'listitem';
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('md-carousel-item', CarouselItem);
