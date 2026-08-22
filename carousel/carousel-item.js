/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { html, LitElement, nothing, css } from 'lit'
import '../internal/elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'

/**
 * An item container inside an `<md-carousel>`.
 *
 * https://m3.material.io/components/carousel/overview
 */
export class CarouselItem extends LitElement {
  static properties = {
    shape: { type: String, reflect: true },
    type: { type: String, reflect: true }, // 'filled' | 'elevated' | 'outlined'
    interactive: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    active: { type: Boolean, reflect: true },
    href: { type: String },
    target: { type: String },
    headline: { type: String },
    subhead: { type: String },
    isCarouselItem: { type: Boolean, attribute: 'md-carousel-item', reflect: true },
  }

  constructor() {
    super()
    this.isCarouselItem = true
    this.interactive = false
    this.disabled = false
    this.active = false
    this.type = ''
    this.href = ''
    this.target = ''
    this.headline = ''
    this.subhead = ''
  }

  get isInteractive() {
    return this.interactive || Boolean(this.href)
  }

  render() {
    const content = html`
      ${this.renderElevation()}
      <div class="background"></div>
      <div class="media-container">
        <slot></slot>
      </div>
      <div class="scrim">
        <slot name="scrim"></slot>
      </div>
      ${this.renderTextContent()}
      <div class="outline ${this.type}"></div>
      ${this.renderRippleAndFocus()}
    `

    if (this.href) {
      return html`
        <a
          id="link"
          class="link"
          href=${this.href}
          target=${this.target || nothing}
          aria-disabled=${this.disabled ? 'true' : nothing}
          tabindex=${this.disabled ? -1 : 0}>
          ${content}
        </a>
      `
    }

    return html`<div class="item-container" tabindex=${this.isInteractive && !this.disabled ? 0 : nothing}>
      ${content}
    </div>`
  }

  renderElevation() {
    if (this.type === 'elevated' || (this.interactive && this.type !== 'outlined')) {
      return html`<md-elevation part="elevation"></md-elevation>`
    }
    return nothing
  }

  renderRippleAndFocus() {
    if (!this.isInteractive) {
      return nothing
    }
    return html`
      <md-ripple ?disabled=${this.disabled}></md-ripple>
      <md-focus-ring part="focus-ring"></md-focus-ring>
    `
  }

  renderTextContent() {
    return html`
      <div class="content-overlay">
        <slot name="headline"> ${this.headline ? html`<div class="headline">${this.headline}</div>` : nothing} </slot>
        <slot name="subhead"> ${this.subhead ? html`<div class="subhead">${this.subhead}</div>` : nothing} </slot>
        <slot name="action"></slot>
      </div>
    `
  }

  static styles = [
    css`
      :host {
        --_item-shape: var(--md-carousel-item-shape, var(--md-sys-shape-corner-extra-large, 28px));
        --_item-color: var(--md-carousel-item-color, var(--md-sys-color-surface-container-low, #f7f2fa));
        --_item-elevation: var(--md-carousel-item-elevation, 0);
        --_item-shadow-color: var(--md-sys-color-shadow, #000);
        --_headline-color: var(--md-sys-color-on-surface, #1d1b20);
        --_subhead-color: var(--md-sys-color-on-surface-variant, #49454f);

        display: flex;
        flex-direction: column;
        position: relative;
        box-sizing: border-box;
        border-radius: var(--_item-shape);
        clip-path: inset(0 round var(--_item-shape));
        overflow: hidden;
        isolation: isolate;
        user-select: none;
        flex-shrink: 0;
        height: 100%;
        scroll-snap-align: start;
        transition:
          width 0.35s cubic-bezier(0.2, 0, 0, 1),
          min-width 0.35s cubic-bezier(0.2, 0, 0, 1),
          max-width 0.35s cubic-bezier(0.2, 0, 0, 1),
          flex-basis 0.35s cubic-bezier(0.2, 0, 0, 1),
          transform 0.25s cubic-bezier(0.2, 0, 0, 1),
          opacity 0.25s cubic-bezier(0.2, 0, 0, 1),
          filter 0.25s cubic-bezier(0.2, 0, 0, 1);
        -webkit-tap-highlight-color: transparent;
      }

      :host([data-size='small']) .content-overlay,
      :host([data-size='small']) .scrim {
        opacity: 0;
        pointer-events: none;
      }

      :host([data-size='medium']) .subhead {
        display: none;
      }

      :host([data-size='medium']) .headline {
        font-size: var(--md-carousel-item-medium-headline-size, 0.95rem);
      }

      :host([data-size='medium']) .content-overlay {
        padding: 12px;
      }

      :host([shape='small']) {
        --_item-shape: var(--md-sys-shape-corner-small, 8px);
      }
      :host([shape='medium']) {
        --_item-shape: var(--md-sys-shape-corner-medium, 12px);
      }
      :host([shape='large']) {
        --_item-shape: var(--md-sys-shape-corner-large, 16px);
      }
      :host([shape='extra-large']) {
        --_item-shape: var(--md-sys-shape-corner-extra-large, 28px);
      }
      :host([shape='full']) {
        --_item-shape: var(--md-sys-shape-corner-full, 9999px);
      }

      .item-container,
      .link {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        overflow: hidden;
        box-sizing: border-box;
        text-decoration: none;
        color: inherit;
        outline: none;
      }

      :host([interactive]) .item-container,
      .link {
        cursor: pointer;
      }

      :host([disabled]) {
        pointer-events: none;
        opacity: 0.38;
      }

      .background {
        background: var(--_item-color);
        position: absolute;
        inset: 0;
        border-radius: inherit;
        z-index: 0;
        pointer-events: none;
      }

      md-elevation {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        z-index: 0;
        pointer-events: none;
        --md-elevation-level: var(--_item-elevation);
        --md-elevation-shadow-color: var(--_item-shadow-color);
      }

      .media-container {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        border-radius: inherit;
        overflow: hidden;
      }

      ::slotted(img),
      ::slotted(video) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: inherit;
        pointer-events: none;
      }

      .scrim {
        position: absolute;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        border-radius: inherit;
      }

      .content-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 3;
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 4px;
        pointer-events: none;
      }

      .headline {
        font-family: var(--md-ref-typeface-plain, 'Google Sans Flex', 'Roboto', sans-serif);
        font-size: var(--md-carousel-item-headline-size, 1.125rem);
        font-weight: 500;
        line-height: 1.35;
        color: var(--_headline-color);
      }

      .subhead {
        font-family: var(--md-ref-typeface-plain, 'Google Sans Flex', 'Roboto', sans-serif);
        font-size: var(--md-carousel-item-subhead-size, 0.875rem);
        font-weight: 400;
        line-height: 1.25;
        color: var(--_subhead-color);
      }

      .outline {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        border: 1px solid transparent;
        z-index: 4;
      }

      .outline.outlined {
        border-color: var(--md-sys-color-outline-variant, #cac4d0);
      }

      md-focus-ring {
        z-index: 5;
        --md-focus-ring-shape: var(--_item-shape);
      }

      md-ripple {
        z-index: 5;
      }

      /* Variant Styles */
      :host([type='elevated']) {
        --_item-color: var(--md-sys-color-surface-container-low, #f7f2fa);
        --_item-elevation: 1;
        filter: drop-shadow(0px 1px 2px var(--_item-shadow-color));
      }

      :host([type='elevated']:hover) {
        --_item-elevation: 2;
      }

      :host([type='filled']) {
        --_item-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
        --_item-elevation: 0;
      }

      :host([type='outlined']) {
        --_item-color: var(--md-sys-color-surface, #fef7ff);
        --_item-elevation: 0;
      }

      /* Dark text scrim support when headline/subhead are specified on media */
      :host([headline]) .content-overlay,
      :host([subhead]) .content-overlay {
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
        --_headline-color: #ffffff;
        --_subhead-color: rgba(255, 255, 255, 0.85);
      }
    `,
  ]
}

customElements.define('md-carousel-item', CarouselItem)
