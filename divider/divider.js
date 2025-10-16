/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, css } from 'lit'
/**
 * A divider component.
 */
export class Divider extends LitElement {
  static properties = {
    inset: { type: Boolean, reflect: true },
    insetStart: { type: Boolean, reflect: true, attribute: 'inset-start' },
    insetEnd: { type: Boolean, reflect: true, attribute: 'inset-end' },
  }
  constructor() {
    super(...arguments)
    /**
     * Indents the divider with equal padding on both sides.
     */
    this.inset = false
    /**
     * Indents the divider with padding on the leading side.
     */
    this.insetStart = false
    /**
     * Indents the divider with padding on the trailing side.
     */
    this.insetEnd = false
  }
  static styles = [
    css`
      :host {
        box-sizing: border-box;
        color: var(--md-divider-color, var(--md-sys-color-outline-variant, #cac4d0));
        display: flex;
        height: var(--md-divider-thickness, 1px);
        width: 100%;
      }
      :host([inset]),
      :host([inset-start]) {
        padding-inline-start: 16px;
      }
      :host([inset]),
      :host([inset-end]) {
        padding-inline-end: 16px;
      }
      :host::before {
        background: currentColor;
        content: '';
        height: 100%;
        width: 100%;
      }
      @media (forced-colors: active) {
        :host::before {
          background: CanvasText;
        }
      }
    `,
  ]
}
customElements.define('md-divider', Divider)
