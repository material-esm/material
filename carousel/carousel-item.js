import { html, LitElement, css, isServer } from 'lit'

export class CarouselItem extends LitElement {
  constructor() {
    super()
    this.internals = this.attachInternals()
    if (!isServer) {
      this.internals.role = 'listitem'
    }
  }

  render() {
    return html`
      <div class="carousel-item">
        <slot></slot>
      </div>
    `
  }

  static styles = [
    css`
      :host {
        display: block;
        border-radius: var(--md-carousel-item-border-radius, 28px);
        overflow: hidden;
        height: 100%;
        width: var(--md-carousel-item-width, 240px); /* Multi-browse width by default */
      }
      .carousel-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      }
      ::slotted(img) {
         width: 100%;
         height: 100%;
         object-fit: cover;
      }
    `,
  ]
}

customElements.define('md-carousel-item', CarouselItem)
