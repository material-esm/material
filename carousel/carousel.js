import { html, LitElement, css, isServer } from 'lit'

export class Carousel extends LitElement {
  constructor() {
    super()
    this.internals = this.attachInternals()
    if (!isServer) {
      this.internals.role = 'list'
    }
  }

  render() {
    return html`
      <div class="carousel" aria-label="carousel">
        <slot></slot>
      </div>
    `
  }

  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
        overflow: hidden;
        border-radius: var(--md-carousel-border-radius, 28px);
      }
      .carousel {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* Internet Explorer 10+ */
        gap: var(--md-carousel-gap, 8px);
        padding: var(--md-carousel-padding, 0);
        height: 100%;
      }
      .carousel::-webkit-scrollbar {
        display: none; /* WebKit */
      }
      ::slotted(*) {
        flex: 0 0 auto;
        scroll-snap-align: start;

        /* M3 dynamic item sizing using CSS Scroll-driven Animations */
        animation: material-carousel-item-resize linear both;
        animation-timeline: view(inline);
      }

      @keyframes material-carousel-item-resize {
        0% {
          width: var(--md-carousel-small-width, 40px);
        }
        15% {
          width: var(--md-carousel-large-width, 240px);
        }
        85% {
          width: var(--md-carousel-large-width, 240px);
        }
        100% {
          width: var(--md-carousel-small-width, 40px);
        }
      }
    `,
  ]
}

customElements.define('md-carousel', Carousel)
