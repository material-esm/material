import { LitElement, html, css } from 'lit';

/**
 * A Material Design carousel item component.
 */
export class CarouselItem extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        scroll-snap-align: start;
        flex: 0 0 auto;
      }
    `;
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.internals.role = 'listitem';
  }

  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('md-carousel-item', CarouselItem);
