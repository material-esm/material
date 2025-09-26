/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../../elevation/elevation.js'
import '../../focus/focus-ring.js'
import '../../ripple/ripple.js'
import { html, LitElement, nothing } from 'lit'
import { literal, html as staticHtml } from 'lit/static-html.js'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../../internal/aria/delegate.js'
// tslint:disable-next-line:enforce-comments-on-exported-symbols
export class SharedFab extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    label: { type: String },
    lowered: { type: Boolean },
    href: { type: String },
    expanded: false,
  }
  constructor() {
    super(...arguments)
    /**
     * The size of the FAB.
     */
    this.size = 'medium'
    /**
     * The text to display on the FAB.
     */
    this.label = ''
    /**
     * Lowers the FAB's elevation.
     */
    this.lowered = false
    /**
     * Sets the underlying `HTMLAnchorElement`'s `href` resource attribute.
     */
    this.href = ''
    /**
     * This will allow the fab to expand and use the label
     */
    this.expanded = false
  }
  render() {
    // Needed for closure conformance
    const { ariaLabel } = this
    const tag = this.href ? literal`div` : literal`button`
    return staticHtml`
      <${tag}
        class="fab ${classMap(this.getRenderClasses())}"
        aria-label=${ariaLabel || nothing}>
        <md-elevation part="elevation"></md-elevation>
        <md-focus-ring part="focus-ring" 
        for=${this.href ? 'link' : 'button'}></md-focus-ring>
        <md-ripple class="ripple" for=${this.href ? 'link' : nothing}
        ?disabled="${!this.href && this.disabled}"></md-ripple>
        ${this.renderTouchTarget()} ${this.renderIcon()} ${this.renderLabel()}
        ${this.href && this.renderLink()}
      </${tag}>
    `
  }
  getRenderClasses() {
    const isExtended = this.label && this.expanded
    return {
      lowered: this.lowered,
      small: this.size === 'small' && !isExtended,
      large: this.size === 'large' && !isExtended,
      extended: isExtended,
    }
  }
  renderTouchTarget() {
    return html`<div class="touch-target"></div>`
  }
  renderLabel() {
    return this.expanded && this.label ? html`<span class="label">${this.label}</span>` : ''
  }
  renderIcon() {
    const { ariaLabel } = this
    return html`<span class="icon">
      <slot name="icon" aria-hidden=${ariaLabel || this.label ? 'true' : nothing}>
        <span></span>
      </slot>
    </span>`
  }
  renderLink() {
    // Needed for closure conformance
    const { ariaLabel } = this
    return html`
      <a
        class="link"
        id="link"
        href="${this.href}"
        target="${this.target || nothing}"
        aria-label="${ariaLabel || nothing}"
      ></a>
    `
  }
}
;(() => {
  requestUpdateOnAriaChange(SharedFab)
})()
/** @nocollapse */
SharedFab.shadowRootOptions = {
  mode: 'open',
  delegatesFocus: true,
}
