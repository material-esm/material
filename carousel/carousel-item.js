import { LitElement, html, css } from 'lit'

export class CarouselItem extends LitElement {
  constructor() {
    super()
    this.internals = this.attachInternals()
    this.internals.role = 'listitem'
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex-shrink: 0;
        scroll-snap-align: start;
        border-radius: var(--md-carousel-item-shape, 28px);
        overflow: hidden;
      }
    `,
  ]

  render() {
    return html`<slot></slot>`
  }
}

customElements.define('md-carousel-item', CarouselItem)
