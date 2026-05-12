import { html, LitElement, css } from 'lit'

export class CarouselItem extends LitElement {
  static properties = {}

  constructor() {
    super()
  }

  render() {
    return html`
      <div role="listitem" class="item">
        <slot></slot>
      </div>
    `
  }

  static styles = css`
    :host {
      display: block;
      scroll-snap-align: start;
      flex-shrink: 0;
    }
    .item {
      display: block;
      border-radius: var(--md-carousel-item-shape, 24px);
      overflow: hidden;
    }
  `
}

customElements.define('md-carousel-item', CarouselItem)
