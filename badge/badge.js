/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { html, LitElement, css } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
/**
 * b/265340196 - add docs
 */
export class Badge extends LitElement {
  static properties = {
    value: { type: String },
  }

  constructor() {
    super(...arguments)
    this.value = ''
  }
  render() {
    const classes = { 'md3-badge--large': this.value }
    return html`<div class="md3-badge ${classMap(classes)}">
      <p class="md3-badge__value">${this.value}</p>
    </div>`
  }
  static styles = [
    css`
      :host {
        --_color: var(--md-badge-color, var(--md-sys-color-error, #b3261e));
        --_large-color: var(--md-badge-large-color, var(--md-sys-color-error, #b3261e));
        --_large-label-text-color: var(--md-badge-large-label-text-color, var(--md-sys-color-on-error, #fff));
        --_large-label-text-font: var(
          --md-badge-large-label-text-font,
          var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_large-label-text-line-height: var(
          --md-badge-large-label-text-line-height,
          var(--md-sys-typescale-label-small-line-height, 1rem)
        );
        --_large-label-text-size: var(
          --md-badge-large-label-text-size,
          var(--md-sys-typescale-label-small-size, 0.6875rem)
        );
        --_large-label-text-weight: var(
          --md-badge-large-label-text-weight,
          var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_large-shape: var(--md-badge-large-shape, var(--md-sys-shape-corner-full, 9999px));
        --_large-size: var(--md-badge-large-size, 16px);
        --_shape: var(--md-badge-shape, var(--md-sys-shape-corner-full, 9999px));
        --_size: var(--md-badge-size, 6px);
      }
      .md3-badge {
        inset-inline-start: 50%;
        margin-inline-start: 6px;
        margin-block-start: 4px;
        position: absolute;
        inset-block-start: 0px;
        background-color: var(--_color);
        border-radius: var(--_shape);
        height: var(--_size);
      }
      .md3-badge:not(.md3-badge--large) {
        width: var(--_size);
      }
      .md3-badge.md3-badge--large {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-inline-start: 2px;
        margin-block-start: 1px;
        background-color: var(--_large-color);
        border-radius: var(--_large-shape);
        height: var(--_large-size);
        min-width: var(--_large-size);
        color: var(--_large-label-text-color);
      }
      .md3-badge.md3-badge--large .md3-badge__value {
        padding: 0px 4px;
        text-align: center;
      }
      .md3-badge__value {
        font-family: var(--_large-label-text-font);
        font-size: var(--_large-label-text-size);
        line-height: var(--_large-label-text-line-height);
        font-weight: var(--_large-label-text-weight);
      }
    `,
  ]
}
customElements.define('md-badge', Badge)
