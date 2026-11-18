/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import '../internal/elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import '../icon/icon.js'
import { html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { fabMenuItemStyles } from './fab-menu-styles.js'

/**
 * Material 3 Expressive FAB Menu Item (`<md-fab-menu-item>`).
 *
 * Represents a 56dp pill-shaped speed-dial action inside `<md-fab-menu>`.
 * Renders a native `<button role="menuitem">` for actions or `<a role="menuitem">`
 * when `href` is set.
 *
 * @fires item-activate {CustomEvent<{item: FabMenuItem, index: number, value: string, label: string, keepOpen: boolean, originalEvent: Event}>}
 *   Cancelable event dispatched when the menu item is activated.
 */
export class FabMenuItem extends LitElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  }

  static styles = [fabMenuItemStyles]

  static properties = {
    label: { type: String },
    icon: { type: String },
    value: { type: String },
    href: { type: String },
    target: { type: String },
    disabled: { type: Boolean, reflect: true },
    keepOpen: { type: Boolean, attribute: 'keep-open', reflect: true },
  }

  constructor() {
    super()
    this.label = ''
    this.icon = ''
    this.value = ''
    this.href = ''
    this.target = ''
    this.disabled = false
    this.keepOpen = false
    this.hasIconSlot = false
    this.handleHostClickCapture = this.handleHostClickCapture.bind(this)
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', this.handleHostClickCapture, { capture: true })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('click', this.handleHostClickCapture, { capture: true })
  }

  get itemElement() {
    return this.renderRoot?.querySelector('#item') ?? null
  }

  get resolvedLabel() {
    if (this.label) return this.label
    const nodes = Array.from(this.childNodes || [])
    const text = nodes
      .filter((node) => {
        if (node.nodeType === 3) return true
        if (node.nodeType === 1 && !node.getAttribute?.('slot')) return true
        return false
      })
      .map((node) => node.textContent || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text
  }

  focus(options) {
    const inner = this.itemElement
    if (inner && typeof inner.focus === 'function') {
      inner.focus(options)
    } else {
      super.focus(options)
    }
  }

  click() {
    if (this.disabled) return
    const inner = this.itemElement
    if (inner && typeof inner.click === 'function') {
      inner.click()
    } else {
      super.click()
    }
  }

  handleHostClickCapture(event) {
    if (this.disabled) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  handleIconSlotChange(event) {
    const assigned = event.target?.assignedNodes?.({ flatten: true }) ?? []
    this.hasIconSlot = assigned.some(
      (node) => node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim().length > 0),
    )
    this.requestUpdate()
  }

  handleLinkKeydown(event) {
    if (event.key === ' ') {
      event.preventDefault()
    }
  }

  handleLinkKeyup(event) {
    if (event.key === ' ' && !this.disabled) {
      event.preventDefault()
      this.itemElement?.click()
    }
  }

  handleItemClick(event) {
    if (this.disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    const parentMenu = this.closest?.('md-fab-menu') ?? null
    const index = parentMenu ? parentMenu.items.indexOf(this) : -1
    const fromPointer = typeof event.detail === 'number' && event.detail > 0

    const activateEvent = new CustomEvent('item-activate', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        item: this,
        index,
        value: this.value || '',
        label: this.resolvedLabel,
        keepOpen: this.keepOpen,
        originalEvent: event,
      },
    })

    const allowed = this.dispatchEvent(activateEvent)
    if (!allowed) {
      if (this.href) {
        event.preventDefault()
      }
      return
    }

    if (!this.keepOpen && parentMenu && parentMenu.open) {
      parentMenu.close('item-select', { restoreFocus: true, fromPointer })
    }
  }

  renderContent(hasIcon) {
    return html`
      <md-elevation part="elevation"></md-elevation>
      <md-focus-ring part="focus-ring" for="item"></md-focus-ring>
      <md-ripple class="ripple" for="item" ?disabled=${this.disabled}></md-ripple>
      <span class="icon ${classMap({ empty: !hasIcon })}" part="icon" aria-hidden="true">
        <slot name="icon" @slotchange=${this.handleIconSlotChange}>
          ${this.icon ? html`<md-icon>${this.icon}</md-icon>` : nothing}
        </slot>
      </span>
      <span class="label" part="label">
        <slot>${this.label}</slot>
      </span>
    `
  }

  render() {
    const { ariaLabel } = this
    const hasIcon = this.hasIconSlot || Boolean(this.icon) || Boolean(this.querySelector?.('[slot="icon"]'))
    const classes = {
      item: true,
      disabled: this.disabled,
      'no-icon': !hasIcon,
    }

    if (this.href) {
      return html`
        <a
          id="item"
          part="button"
          class=${classMap(classes)}
          role="menuitem"
          tabindex="-1"
          href=${this.disabled ? nothing : this.href}
          target=${this.target && !this.disabled ? this.target : nothing}
          rel=${this.target === '_blank' ? 'noopener noreferrer' : nothing}
          aria-disabled=${this.disabled ? 'true' : nothing}
          aria-label=${ariaLabel || nothing}
          @keydown=${this.handleLinkKeydown}
          @keyup=${this.handleLinkKeyup}
          @click=${this.handleItemClick}>
          ${this.renderContent(hasIcon)}
        </a>
      `
    }

    return html`
      <button
        id="item"
        part="button"
        class=${classMap(classes)}
        type="button"
        role="menuitem"
        tabindex="-1"
        ?disabled=${this.disabled}
        aria-label=${ariaLabel || nothing}
        @click=${this.handleItemClick}>
        ${this.renderContent(hasIcon)}
      </button>
    `
  }
}

;(() => {
  requestUpdateOnAriaChange(FabMenuItem)
})()

if (!customElements.get('md-fab-menu-item')) {
  customElements.define('md-fab-menu-item', FabMenuItem)
}
