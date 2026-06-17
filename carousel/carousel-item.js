import { html, LitElement, css } from 'lit'

/**
 * A Material Design carousel item component.
 *
 * @element md-carousel-item
 */
export class CarouselItem extends LitElement {
  render() {
    return html`
      <div class="item-container" role="listitem">
        <slot></slot>
      </div>
    `
  }

  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
      scroll-snap-align: start;
      /* default size for demo, can be overridden */
      width: var(--md-carousel-item-width, 300px);
    }

    .item-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      /* Usually border radius of 28px or 24px in MD3 depending on variant */
      border-radius: var(--md-carousel-item-shape, 28px);
      overflow: hidden;
    }
  `
}

customElements.define('md-carousel-item', CarouselItem)
