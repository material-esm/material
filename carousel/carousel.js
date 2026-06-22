import { html, LitElement, css } from 'lit'

export class Carousel extends LitElement {
  static properties = {}

  constructor() {
    super()
  }

  render() {
    return html`
      <div class="carousel" role="list" aria-label="Carousel">
        <slot></slot>
      </div>
    `
  }

  static styles = css`
    :host {
      display: block;
    }
    .carousel {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
      gap: 8px; /* Optional gap */
      padding: 16px;
      scroll-behavior: smooth;
    }
    .carousel::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
    ::slotted(*) {
      scroll-snap-align: start;
    }
  `
}

customElements.define('md-carousel', Carousel)
