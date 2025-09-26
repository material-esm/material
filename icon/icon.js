/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { html, LitElement, css } from 'lit'

export class Icon extends LitElement {
  render() {
    return html`<slot></slot>`
  }
  connectedCallback() {
    super.connectedCallback()
    const ariaHidden = this.getAttribute('aria-hidden')
    if (ariaHidden === 'false') {
      // Allow the user to set `aria-hidden="false"` to create an icon that is
      // announced by screenreaders.
      this.removeAttribute('aria-hidden')
      return
    }
    // Needed for VoiceOver, which will create a "group" if the element is a
    // sibling to other content.
    this.setAttribute('aria-hidden', 'true')
  }
  static styles = [
    css`
      :host {
        font-size: var(--md-icon-size, 24px);
        width: var(--md-icon-size, 24px);
        height: var(--md-icon-size, 24px);
        color: inherit;
        font-variation-settings: inherit;
        font-weight: 400;
        font-family: var(--md-icon-font, Material Symbols Outlined);
        display: inline-flex;
        font-style: normal;
        place-items: center;
        place-content: center;
        line-height: 1;
        overflow: hidden;
        letter-spacing: normal;
        text-transform: none;
        user-select: none;
        white-space: nowrap;
        word-wrap: normal;
        flex-shrink: 0;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        -moz-osx-font-smoothing: grayscale;
      }

      ::slotted(svg) {
        fill: currentColor;
      }

      ::slotted(*) {
        height: 100%;
        width: 100%;
      }
    `,
  ]
}
customElements.define('md-icon', Icon)
