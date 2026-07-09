import { LitElement, html, css } from 'lit'

export class Carousel extends LitElement {
  constructor() {
    super()
    this.internals = this.attachInternals()
    this.internals.role = 'list'
  }

  static styles = [
    css`
      :host {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scrollbar-width: none; /* Firefox */
        gap: var(--md-carousel-gap, 8px);
        padding: var(--md-carousel-padding, 16px);
      }

      :host::-webkit-scrollbar {
        display: none; /* Safari and Chrome */
      }
    `,
  ]

  render() {
    return html`<slot></slot>`
  }
}

customElements.define('md-carousel', Carousel)
