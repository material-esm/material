import { html, LitElement, css } from 'lit'

/**
 * A Material Design carousel component.
 *
 * @element md-carousel
 */
export class Carousel extends LitElement {
  static properties = {
    ariaLabel: { type: String, attribute: 'aria-label' },
  }

  constructor() {
    super()
    this.ariaLabel = 'Carousel'
  }

  render() {
    return html`
      <div class="scroll-container" role="list" aria-label="${this.ariaLabel}">
        <slot></slot>
      </div>
    `
  }

  static styles = css`
    :host {
      display: block;
      /* Carousel styling based on Material Design 3 */
      /* Note: specific width/height may need to be configurable */
    }

    .scroll-container {
      display: flex;
      gap: var(--md-carousel-gap, 8px);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      overscroll-behavior-x: contain;

      /* Hide scrollbar for cleaner look, but keep functionality */
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */

      padding: var(--md-carousel-padding, 0);
    }

    .scroll-container::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
  `
}

customElements.define('md-carousel', Carousel)
