/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import '../internal/elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import '../icon/icon.js'
import './fab-menu-item.js'
import { html, isServer, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { isRtl } from '../internal/controller/is-rtl.js'
import { fabMenuStyles } from './fab-menu-styles.js'

export { FabMenuItem } from './fab-menu-item.js'
export { fabMenuStyles, fabMenuItemStyles } from './fab-menu-styles.js'

let supportsDisplayTransition

function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition
  if (
    isServer ||
    typeof document === 'undefined' ||
    !globalThis.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
    !document.body
  ) {
    return false
  }
  const probe = document.createElement('div')
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;'
  document.body.appendChild(probe)
  void getComputedStyle(probe).display
  probe.style.display = 'none'
  supportsDisplayTransition = getComputedStyle(probe).display === 'block'
  probe.remove()
  return supportsDisplayTransition
}

/**
 * Material 3 Expressive FAB Menu (`<md-fab-menu>`).
 *
 * Expands from a Floating Action Button into 2–6 related pill-shaped action
 * items (`<md-fab-menu-item>`), morphing the trigger into a circular 56dp
 * close (`×`) toggle button.
 *
 * @fires open {Event} Cancelable event dispatched before the menu opens.
 * @fires opened {Event} Dispatched after the opening transition completes.
 * @fires close {CustomEvent<{reason: string}>} Cancelable event dispatched before the menu closes.
 * @fires closed {CustomEvent<{reason: string}>} Dispatched after the closing transition completes.
 * @fires item-activate {CustomEvent<{item: import('./fab-menu-item.js').FabMenuItem, index: number, value: string, label: string, keepOpen: boolean, originalEvent: Event}>}
 *   Cancelable event bubbling from an activated `<md-fab-menu-item>`.
 */
export class FabMenu extends LitElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  }

  static styles = [fabMenuStyles]

  static properties = {
    open: { type: Boolean, reflect: true, noAccessor: true },
    variant: { type: String, reflect: true },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
    align: { type: String, reflect: true },
    direction: { type: String, reflect: true },
    label: { type: String },
    extended: { type: Boolean, reflect: true },
    icon: { type: String },
    closeIcon: { type: String, attribute: 'close-icon' },
    closeLabel: { type: String, attribute: 'close-label' },
    scrim: { type: Boolean, reflect: true },
    lowered: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    quick: { type: Boolean, reflect: true },
  }

  constructor() {
    super()
    this._isOpen = false
    this._isClosing = false
    this._menuHidden = true
    this._syncingAttr = false
    this._animId = 0

    this.variant = 'primary'
    this.color = undefined
    this.size = 'medium'
    this.align = 'end'
    this.direction = 'up'
    this.label = ''
    this.extended = false
    this.icon = ''
    this.closeIcon = ''
    this.closeLabel = 'Close menu'
    this.scrim = false
    this.lowered = false
    this.disabled = false
    this.quick = false

    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
    this.handleDocumentFocusIn = this.handleDocumentFocusIn.bind(this)
  }

  get open() {
    return this._isOpen
  }

  set open(value) {
    if (value) {
      this.show()
    } else {
      this.close('property')
    }
  }

  /**
   * Returns the resolved tonal color scheme ('primary' | 'secondary' | 'tertiary' | 'surface').
   */
  get resolvedVariant() {
    return this.color || this.variant || 'primary'
  }

  /**
   * Returns all non-hidden `<md-fab-menu-item>` children.
   *
   * @return {Array<import('./fab-menu-item.js').FabMenuItem>}
   */
  get items() {
    return Array.from(this.querySelectorAll?.('md-fab-menu-item') ?? []).filter((item) => !item.hidden)
  }

  /**
   * Returns all enabled `<md-fab-menu-item>` children.
   *
   * @return {Array<import('./fab-menu-item.js').FabMenuItem>}
   */
  get enabledItems() {
    return this.items.filter((item) => !item.disabled)
  }

  get triggerElement() {
    return this.renderRoot?.querySelector('#trigger') ?? null
  }

  get menuElement() {
    return this.renderRoot?.querySelector('#menu') ?? null
  }

  get scrimElement() {
    return this.renderRoot?.querySelector('.scrim') ?? null
  }

  attributeChangedCallback(name, old, value) {
    if (name === 'open') {
      if (!this._syncingAttr) {
        const hasAttr = value !== null
        if (hasAttr && !this._isOpen) {
          this.show()
        } else if (!hasAttr && this._isOpen) {
          this.close('attribute')
        }
      }
      return
    }
    super.attributeChangedCallback(name, old, value)
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('keydown', this.handleKeydown)
    if (this.hasAttribute('open') && !this._isOpen) {
      this.show()
    } else if (this._isOpen) {
      this.attachGlobalListeners()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('keydown', this.handleKeydown)
    this.detachGlobalListeners()
  }

  updated(changed) {
    if (changed.has('direction') || changed.has('align')) {
      this.syncStaggerIndices()
    }
  }

  focus(options) {
    const trigger = this.triggerElement
    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus(options)
    } else {
      super.focus(options)
    }
  }

  shouldSkipAnimation() {
    if (this.quick || isServer) return true
    return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
  }

  attachGlobalListeners() {
    if (isServer || typeof document === 'undefined') return
    this.detachGlobalListeners()
    document.addEventListener('click', this.handleDocumentClick, true)
    document.addEventListener('focusin', this.handleDocumentFocusIn)
  }

  detachGlobalListeners() {
    if (isServer || typeof document === 'undefined') return
    document.removeEventListener('click', this.handleDocumentClick, true)
    document.removeEventListener('focusin', this.handleDocumentFocusIn)
  }

  syncStaggerIndices() {
    const items = this.items
    const count = items.length
    const rtl = !isServer && this.isConnected ? isRtl(this) : false
    const alignStart = this.align === 'start'
    const originX = (alignStart && !rtl) || (!alignStart && rtl) ? 'left' : 'right'

    items.forEach((item, index) => {
      const openStagger = this.direction === 'down' ? index : count - 1 - index
      const closeStagger = this.direction === 'down' ? count - 1 - index : index
      item.style?.setProperty?.('--_stagger-index', String(Math.max(0, openStagger)))
      item.style?.setProperty?.('--_close-stagger-index', String(Math.max(0, closeStagger)))
      item.style?.setProperty?.('--_item-origin-x', originX)
    })
  }

  restoreTriggerFocus({ restoreFocus, fromPointer = false } = {}) {
    if (isServer || typeof document === 'undefined' || restoreFocus === false) return
    const root = this.getRootNode?.()
    const active = (root && 'activeElement' in root ? root.activeElement : null) ?? document.activeElement
    const focusInsideMenu =
      Boolean(active) && (active === this || this.contains?.(active) || Boolean(this.renderRoot?.activeElement))

    if (!restoreFocus && !focusInsideMenu) return
    const trigger = this.triggerElement
    if (!trigger || typeof trigger.focus !== 'function') return

    if (fromPointer) {
      try {
        trigger.focus({ focusVisible: false, preventScroll: true })
      } catch {
        trigger.focus({ preventScroll: true })
      }
    } else {
      trigger.focus({ preventScroll: true })
    }
  }

  async waitForAnimations(elements, timeoutMs = 320) {
    if (this.shouldSkipAnimation()) return
    const animations = []
    for (const el of elements) {
      if (el && typeof el.getAnimations === 'function') {
        animations.push(...el.getAnimations())
      }
    }
    if (animations.length === 0) return
    await Promise.race([
      Promise.allSettled(animations.map((anim) => anim.finished)),
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ])
  }

  /**
   * Opens the FAB menu, dispatching a cancelable `open` event before opening
   * and an `opened` event once transitions finish.
   *
   * @return {Promise<boolean>} Whether the menu opened.
   */
  async show() {
    if (this.disabled) {
      this._syncingAttr = true
      this.removeAttribute('open')
      this._syncingAttr = false
      return false
    }
    if (this._isOpen && !this._isClosing) {
      return false
    }

    const allowed = this.dispatchEvent(new Event('open', { cancelable: true }))
    if (!allowed) {
      this._isOpen = false
      this._syncingAttr = true
      this.removeAttribute('open')
      this._syncingAttr = false
      return false
    }

    const animId = ++this._animId
    this._isOpen = true
    this._isClosing = false
    this._menuHidden = false
    this.removeAttribute('data-closing')
    this._syncingAttr = true
    this.setAttribute('open', '')
    this._syncingAttr = false
    this.syncStaggerIndices()
    this.attachGlobalListeners()
    this.requestUpdate('open', false)

    await this.updateComplete
    if (animId !== this._animId) return false

    await this.waitForAnimations([this.menuElement, this.scrimElement, ...this.items], 400)
    if (animId !== this._animId) return false

    this.dispatchEvent(new Event('opened'))
    return true
  }

  /**
   * Closes the FAB menu, dispatching a cancelable `close` event before closing
   * and a `closed` event once exit transitions complete.
   *
   * @param {string} [reason=''] Optional reason for closing.
   * @param {{restoreFocus?: boolean, fromPointer?: boolean}} [options]
   * @return {Promise<boolean>} Whether the menu closed.
   */
  async close(reason = '', options = {}) {
    if (!this._isOpen) {
      this.removeAttribute('data-closing')
      this._syncingAttr = true
      this.removeAttribute('open')
      this._syncingAttr = false
      return false
    }

    const closeEvent = new CustomEvent('close', {
      cancelable: true,
      detail: { reason },
    })
    const allowed = this.dispatchEvent(closeEvent)
    if (!allowed) {
      this._syncingAttr = true
      this.setAttribute('open', '')
      this._syncingAttr = false
      return false
    }

    const animId = ++this._animId
    this._isOpen = false
    this.detachGlobalListeners()
    this.restoreTriggerFocus(options)

    this._syncingAttr = true
    this.removeAttribute('open')
    this._syncingAttr = false

    if (this.shouldSkipAnimation()) {
      this.removeAttribute('data-closing')
      this._isClosing = false
      this._menuHidden = true
      this.requestUpdate('open', true)
      await this.updateComplete
      if (animId !== this._animId) return false
      this.dispatchEvent(new CustomEvent('closed', { detail: { reason } }))
      return true
    }

    this.setAttribute('data-closing', '')

    if (canTransitionDisplay()) {
      this._isClosing = false
      this._menuHidden = true
      this.syncStaggerIndices()
      this.requestUpdate('open', true)

      await this.updateComplete
      if (animId !== this._animId) return false

      await this.waitForAnimations([this.menuElement, this.scrimElement, ...this.items], 320)
      if (animId !== this._animId) return false

      this.removeAttribute('data-closing')
      this.dispatchEvent(new CustomEvent('closed', { detail: { reason } }))
      return true
    }

    this._isClosing = true
    this._menuHidden = false
    this.syncStaggerIndices()
    this.requestUpdate('open', true)

    await this.updateComplete
    if (animId !== this._animId) return false

    await this.waitForAnimations([this.menuElement, this.scrimElement, ...this.items], 320)
    if (animId !== this._animId) return false

    this.removeAttribute('data-closing')
    this._isClosing = false
    this._menuHidden = true
    this.requestUpdate()
    await this.updateComplete
    if (animId !== this._animId) return false

    this.dispatchEvent(new CustomEvent('closed', { detail: { reason } }))
    return true
  }

  /**
   * Toggles the open state of the FAB menu.
   *
   * @return {Promise<boolean>}
   */
  toggle() {
    return this.open ? this.close('toggle') : this.show()
  }

  handleTriggerClick(event) {
    event.stopPropagation()
    if (this.disabled) return
    const fromPointer = typeof event.detail === 'number' && event.detail > 0
    if (this.open) {
      this.close('toggle', { restoreFocus: true, fromPointer })
    } else {
      this.show()
    }
  }

  handleScrimClick(event) {
    event.stopPropagation()
    this.close('scrim', { restoreFocus: true, fromPointer: true })
  }

  handleDocumentClick(event) {
    if (!this._isOpen) return
    const path = typeof event.composedPath === 'function' ? event.composedPath() : []
    if (path.includes(this) || (event.target && this.contains?.(event.target))) {
      return
    }
    this.close('outside-click', { restoreFocus: false })
  }

  handleDocumentFocusIn(event) {
    if (!this._isOpen) return
    const path = typeof event.composedPath === 'function' ? event.composedPath() : []
    if (path.includes(this) || (event.target && this.contains?.(event.target))) {
      return
    }
    this.close('focus-out', { restoreFocus: false })
  }

  async handleKeydown(event) {
    if (this.disabled || event.defaultPrevented) return

    const { key } = event
    if (key === 'Escape') {
      if (this.open) {
        event.preventDefault()
        event.stopPropagation()
        await this.close('escape', { restoreFocus: true, fromPointer: false })
      }
      return
    }

    if (key === 'Tab') {
      if (this.open) {
        this.close('tab', { restoreFocus: false })
      }
      return
    }

    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') {
      return
    }

    const enabled = this.enabledItems
    if (!this.open) {
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault()
        const opened = await this.show()
        const nextEnabled = this.enabledItems
        if (opened && nextEnabled.length > 0) {
          const target = key === 'ArrowUp' ? nextEnabled[nextEnabled.length - 1] : nextEnabled[0]
          target.focus()
        }
      }
      return
    }

    if (enabled.length === 0) return

    event.preventDefault()
    event.stopPropagation()

    const path = typeof event.composedPath === 'function' ? event.composedPath() : []
    const root = this.getRootNode?.()
    const active =
      (root && 'activeElement' in root ? root.activeElement : null) ??
      (typeof document !== 'undefined' ? document.activeElement : null)
    const currentIndex = enabled.findIndex((item) => item === active || item.contains?.(active) || path.includes(item))

    if (key === 'Home') {
      enabled[0].focus()
      return
    }

    if (key === 'End') {
      enabled[enabled.length - 1].focus()
      return
    }

    if (currentIndex < 0) {
      const entryItem = key === 'ArrowUp' ? enabled[enabled.length - 1] : enabled[0]
      entryItem.focus()
      return
    }

    const delta = key === 'ArrowUp' ? -1 : 1
    const nextIndex = (currentIndex + delta + enabled.length) % enabled.length
    enabled[nextIndex].focus()
  }

  handleMenuSlotChange() {
    this.syncStaggerIndices()
  }

  renderDefaultAddSvg() {
    return html`
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    `
  }

  renderDefaultCloseSvg() {
    return html`
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    `
  }

  render() {
    const isExtended = Boolean(this.label && this.extended)
    const collapsedLabel = this.ariaLabel || this.label || 'Open menu'
    const triggerAriaLabel = this._isOpen ? this.closeLabel || 'Close menu' : collapsedLabel
    const showOverlay = this._isOpen || this._isClosing
    const isMenuHidden = this._menuHidden && !showOverlay

    const triggerClasses = {
      trigger: true,
      extended: isExtended,
      lowered: this.lowered,
    }

    return html`
      ${
        this.scrim
          ? html`
              <div
                class="scrim"
                part="scrim"
                ?hidden=${isMenuHidden}
                ?data-closing=${this._isClosing}
                aria-hidden="true"
                @click=${this.handleScrimClick}></div>
            `
          : nothing
      }
      <button
        id="trigger"
        part="trigger"
        class=${classMap(triggerClasses)}
        type="button"
        ?disabled=${this.disabled}
        aria-haspopup="menu"
        aria-expanded=${this._isOpen ? 'true' : 'false'}
        aria-controls="menu"
        aria-label=${triggerAriaLabel}
        @click=${this.handleTriggerClick}>
        <md-elevation part="elevation"></md-elevation>
        <md-focus-ring part="focus-ring" for="trigger"></md-focus-ring>
        <md-ripple class="ripple" for="trigger" ?disabled=${this.disabled}></md-ripple>
        <span class="touch-target" aria-hidden="true"></span>
        <span class="icon-stack" aria-hidden="true">
          <span class="trigger-icon" part="icon">
            <slot name="icon"> ${this.icon ? html`<md-icon>${this.icon}</md-icon>` : this.renderDefaultAddSvg()} </slot>
          </span>
          <span class="close-icon" part="close-icon">
            <slot name="close-icon">
              ${this.closeIcon ? html`<md-icon>${this.closeIcon}</md-icon>` : this.renderDefaultCloseSvg()}
            </slot>
          </span>
        </span>
        ${isExtended ? html`<span class="trigger-label" part="label">${this.label}</span>` : nothing}
      </button>
      <div
        id="menu"
        part="menu"
        class="menu"
        role="menu"
        aria-label=${collapsedLabel}
        ?hidden=${isMenuHidden}
        ?data-closing=${this._isClosing}>
        <slot @slotchange=${this.handleMenuSlotChange}></slot>
      </div>
    `
  }
}

;(() => {
  requestUpdateOnAriaChange(FabMenu)
})()

if (!customElements.get('md-fab-menu')) {
  customElements.define('md-fab-menu', FabMenu)
}
