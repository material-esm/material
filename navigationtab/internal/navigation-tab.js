/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../../focus/md-focus-ring.js'
import '../../ripple/ripple.js'
import '../../badge/badge.js'
import { html, LitElement, nothing } from 'lit'
import { literal, html as staticHtml } from 'lit/static-html.js'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../../internal/aria/delegate.js'
/**
 * b/265346501 - add docs
 *
 * @fires navigation-tab-rendered {Event} Dispatched when the navigation tab's
 * DOM has rendered and custom element definition has loaded. --bubbles
 * --composed
 * @fires navigation-tab-interaction {CustomEvent<{state: MdNavigationTab}>}
 * Dispatched when the navigation tab has been clicked. --bubbles --composed
 */
export class NavigationTab extends LitElement {
    static properties = {
        disabled: { type: Boolean },
        active: { type: Boolean, reflect: true },
        hideInactiveLabel: { type: Boolean, attribute: 'hide-inactive-label' },
        label: { type: String },
        badgeValue: { type: String, attribute: 'badge-value' },
        showBadge: { type: Boolean, attribute: 'show-badge' },
        href: { type: String },
    }
    constructor() {
        super(...arguments)
        this.disabled = false
        this.active = false
        this.hideInactiveLabel = false
        this.badgeValue = ''
        this.showBadge = false
        this.href = ''
    }
    render() {
        // Needed for closure conformance
        const { ariaLabel } = this
        const tag = this.href ? literal`div` : literal`button`
        return staticHtml` <${tag}
      class="md3-navigation-tab ${classMap(this.getRenderClasses())}"
      role="tab"
      aria-selected="${this.active}"
      aria-label=${ariaLabel || nothing}
      tabindex="${this.active ? 0 : -1}"
      @click="${this.handleClick}"
      >
      ${this.href && this.renderLink()}
      <md-focus-ring part="focus-ring" inward></md-focus-ring>
      <md-ripple
        ?disabled="${this.disabled}"
        class="md3-navigation-tab__ripple"></md-ripple>
      <span aria-hidden="true" class="md3-navigation-tab__icon-content">
        <span class="md3-navigation-tab__active-indicator"></span>
        <span class="md3-navigation-tab__icon">
        <slot name="inactive-icon"></slot>
        </span>
        <span class="md3-navigation-tab__icon md3-navigation-tab__icon--active">
        <slot name="active-icon"></slot>
        </span>
        ${this.renderBadge()}
      </span>
      ${this.renderLabel()}
    </${tag}>`
    }
    getRenderClasses() {
        return {
            'md3-navigation-tab--hide-inactive-label': this.hideInactiveLabel,
            'md3-navigation-tab--active': this.active,
        }
    }
    renderBadge() {
        return this.showBadge
            ? html`<md-badge .value="${this.badgeValue}"></md-badge>`
            : nothing
    }
    renderLabel() {
        // Needed for closure conformance
        const { ariaLabel } = this
        const ariaHidden = ariaLabel ? 'true' : 'false'
        return !this.label
            ? nothing
            : html` <span
          aria-hidden="${ariaHidden}"
          class="md3-navigation-tab__label-text"
          >${this.label}</span
        >`
    }
    renderLink() {
        // Needed for closure conformance
        const { ariaLabel } = this
        return html`
      <a
        style="z-index: 1000;"
        class="link"
        id="link"
        href="${this.href}"
        target="${this.target || nothing}"
        aria-label="${ariaLabel || nothing}"></a>
    `
    }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties)
        const event = new Event('navigation-tab-rendered', {
            bubbles: true,
            composed: true,
        })
        this.dispatchEvent(event)
    }
    focus() {
        const buttonElement = this.buttonElement
        if (buttonElement) {
            buttonElement.focus()
        }
    }
    blur() {
        const buttonElement = this.buttonElement
        if (buttonElement) {
            buttonElement.blur()
        }
    }
    handleClick() {
        // b/269772145 - connect to ripple
        this.dispatchEvent(new CustomEvent('navigation-tab-interaction', {
            detail: { state: this },
            bubbles: true,
            composed: true,
        }))
    }
}
(() => {
    requestUpdateOnAriaChange(NavigationTab)
})()