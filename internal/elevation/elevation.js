import { html, LitElement, css } from 'lit'
/**
 * A component for elevation.
 */
export class Elevation extends LitElement {
  connectedCallback() {
    super.connectedCallback()
    // Needed for VoiceOver, which will create a "group" if the element is a
    // sibling to other content.
    this.setAttribute('aria-hidden', 'true')
  }
  render() {
    return html`<span class="shadow"></span>`
  }

  static styles = [
    css`
      :host,
      .shadow,
      .shadow::before,
      .shadow::after {
        border-radius: inherit;
        inset: 0;
        position: absolute;
        transition-duration: inherit;
        transition-property: inherit;
        transition-timing-function: inherit;
      }
      :host {
        display: flex;
        pointer-events: none;
        transition-property:
          box-shadow, opacity, border-radius, border-start-start-radius, border-start-end-radius,
          border-end-start-radius, border-end-end-radius;
      }
      .shadow::before,
      .shadow::after {
        content: '';
        transition-property:
          box-shadow, opacity, border-radius, border-start-start-radius, border-start-end-radius,
          border-end-start-radius, border-end-end-radius;
        --_level: var(--md-elevation-level, 0);
        --_shadow-color: var(--md-elevation-shadow-color, var(--md-sys-color-shadow, #000));
      }
      .shadow::before {
        box-shadow: 0px
          calc(1px * (clamp(0, var(--_level), 1) + clamp(0, var(--_level) - 3, 1) + 2 * clamp(0, var(--_level) - 4, 1)))
          calc(1px * (2 * clamp(0, var(--_level), 1) + clamp(0, var(--_level) - 2, 1) + clamp(0, var(--_level) - 4, 1)))
          0px var(--_shadow-color);
        opacity: 0.3;
      }
      .shadow::after {
        box-shadow: 0px
          calc(1px * (clamp(0, var(--_level), 1) + clamp(0, var(--_level) - 1, 1) + 2 * clamp(0, var(--_level) - 2, 3)))
          calc(1px * (3 * clamp(0, var(--_level), 2) + 2 * clamp(0, var(--_level) - 2, 3)))
          calc(1px * (clamp(0, var(--_level), 4) + 2 * clamp(0, var(--_level) - 4, 1))) var(--_shadow-color);
        opacity: 0.15;
      }
    `,
  ]
}

customElements.define('md-elevation', Elevation)
