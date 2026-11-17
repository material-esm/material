/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { html, isServer, LitElement, nothing, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

const stringValueConverter = {
  fromAttribute(value) {
    return value ?? ''
  },
  toAttribute(value) {
    return value !== null && value !== undefined && String(value) !== '' ? String(value) : null
  },
}

/**
 * Material Design 3 Badge (`<md-badge>`).
 */
export class Badge extends LitElement {
  static properties = {
    value: { type: String, reflect: true, converter: stringValueConverter },
    inline: { type: Boolean, reflect: true },
  }

  #internals = null

  constructor() {
    super(...arguments)
    this.value = ''
    this.inline = false
    if (!isServer && typeof this.attachInternals === 'function') {
      this.#internals = this.attachInternals()
    }
  }

  willUpdate() {
    const hasValue = this.value !== null && this.value !== undefined && String(this.value) !== ''
    if (this.#internals?.states) {
      if (hasValue) {
        this.#internals.states.add('large')
      } else {
        this.#internals.states.delete('large')
      }
    }
  }

  render() {
    const hasValue = this.value !== null && this.value !== undefined && String(this.value) !== ''
    const classes = { 'md3-badge--large': hasValue }
    return html`<div class="md3-badge ${classMap(classes)}">
      ${hasValue ? html`<p class="md3-badge__value">${this.value}</p>` : nothing}
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
        --_large-label-text-tracking: var(
          --md-badge-large-label-text-tracking,
          var(--md-sys-typescale-label-small-tracking, 0.03125rem)
        );
        --_large-label-text-weight: var(
          --md-badge-large-label-text-weight,
          var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_large-shape: var(--md-badge-large-shape, var(--md-sys-shape-corner-full, 9999px));
        --_large-size: var(--md-badge-large-size, 16px);
        --_shape: var(--md-badge-shape, var(--md-sys-shape-corner-full, 9999px));
        --_size: var(--md-badge-size, 6px);
        --_anchor-offset: calc(var(--md-badge-anchor-size, 24px) / 2);
        pointer-events: none;
      }
      :host(:not([inline])) {
        display: inline-flex;
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        margin-block-start: calc(0px - var(--_anchor-offset));
        margin-inline-start: calc(var(--_anchor-offset) - var(--_size));
      }
      :host(:not([inline])[value]:not([value=''])),
      :host(:not([inline]):state(large)) {
        margin-block-start: calc(14px - var(--_anchor-offset) - var(--_large-size));
        margin-inline-start: calc(var(--_anchor-offset) - 12px);
      }
      :host([inline]) {
        display: inline-flex;
        position: static;
        align-items: center;
        vertical-align: middle;
      }
      .md3-badge {
        position: static;
        box-sizing: border-box;
        background-color: var(--_color);
        border-radius: var(--_shape);
        height: var(--_size);
      }
      .md3-badge:not(.md3-badge--large) {
        width: var(--_size);
      }
      .md3-badge.md3-badge--large {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--_large-color);
        border-radius: var(--_large-shape);
        height: var(--_large-size);
        min-width: var(--_large-size);
        padding-inline: 4px;
        color: var(--_large-label-text-color);
      }
      .md3-badge__value {
        margin: 0;
        text-align: center;
        white-space: nowrap;
        font-family: var(--_large-label-text-font);
        font-size: var(--_large-label-text-size);
        line-height: var(--_large-label-text-line-height);
        letter-spacing: var(--_large-label-text-tracking);
        font-weight: var(--_large-label-text-weight);
      }
    `,
  ]
}
customElements.define('md-badge', Badge)
