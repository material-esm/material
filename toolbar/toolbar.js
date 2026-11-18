/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import '../internal/elevation/elevation.js'
import { html, isServer, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { isRtl } from '../internal/controller/is-rtl.js'
import { styles } from './toolbar-styles.js'

export { styles as toolbarStyles } from './toolbar-styles.js'

const FOCUSABLE_TAGS = new Set([
  'MD-ICON-BUTTON',
  'MD-BUTTON',
  'MD-FAB',
  'MD-CHIP',
  'MD-FILTER-CHIP',
  'MD-INPUT-CHIP',
  'MD-ASSIST-CHIP',
  'MD-SUGGESTION-CHIP',
  'MD-SWITCH',
  'MD-CHECKBOX',
  'MD-RADIO',
  'BUTTON',
  'INPUT',
  'SELECT',
  'TEXTAREA',
])

const FOCUSABLE_ROLES = new Set([
  'button',
  'checkbox',
  'radio',
  'switch',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'tab',
  'combobox',
  'spinbutton',
  'slider',
])

/**
 * Material Design 3 Expressive Toolbar component (`<md-toolbar>`).
 *
 * Implements the Material 3 Expressive Toolbars specification:
 * https://m3.material.io/components/toolbars/overview
 *
 * Supports:
 * - **Floating Toolbar** (`type="floating"`, default): `64px` pill-shaped container (`elevation 3`)
 *   supporting `horizontal` and `vertical` orientations and `16px` screen-edge offsets.
 * - **Docked Toolbar** (`type="docked"`): full-width bottom-anchored `64px` bar (`elevation 2`)
 *   replacing legacy M3 Bottom App Bars with flexible item distribution and safe-area padding.
 * - **Color Schemes** (`color="standard" | "vibrant"`): cascades M3 Expressive surface or vibrant
 *   `primary-container` tokens to slotted `<md-icon-button>` and `<md-button>` controls.
 * - **Paired Adjacent FAB** (`slot="fab"`): places a FAB outside the toolbar pill with an `8px` gap.
 * - **Scroll Behavior** (`scroll-behavior="none" | "hide" | "collapse"`): hides or collapses on
 *   scroll down and reveals on scroll up.
 * - **Accessibility**: `role="toolbar"`, `aria-orientation`, `aria-label`, and WAI-ARIA roving
 *   `tabindex` keyboard navigation (`ArrowRight`/`ArrowLeft` with RTL support, `ArrowDown`/`ArrowUp`,
 *   `Home`/`End`).
 *
 * @fires scroll-state-change {CustomEvent<{hiddenBar: boolean, collapsed: boolean, scrollTop: number}>}
 * Dispatched when scroll behavior changes `hiddenBar` or `collapsed`.
 */
export class Toolbar extends LitElement {
  static styles = [styles]

  static properties = {
    /** Toolbar layout type: 'floating' (default) | 'docked' */
    type: { type: String, reflect: true },
    /** Optional alias for `type` ('floating' | 'docked') or `color` ('standard' | 'vibrant') */
    variant: { type: String },
    /** Toolbar axis: 'horizontal' (default) | 'vertical' (docked toolbars are always horizontal) */
    orientation: { type: String, reflect: true },
    /** M3 Expressive color mapping: 'standard' (default) | 'vibrant' */
    color: { type: String, reflect: true },
    /** Screen-edge anchor placement: 'static' (default) | 'bottom' | 'top' | 'start' | 'end' */
    position: { type: String, reflect: true },
    /** Placement of paired `slot="fab"` relative to toolbar: 'end' (default) | 'start' */
    fabPosition: { type: String, attribute: 'fab-position', reflect: true },
    /** Anchors positioned toolbars inside a relative parent (`position: absolute`) instead of viewport */
    contained: { type: Boolean, reflect: true },
    /** Fallback accessible label when `aria-label` is not provided */
    label: { type: String },
    /** Automatic scroll response: 'none' (default) | 'hide' | 'collapse' */
    scrollBehavior: { type: String, attribute: 'scroll-behavior', reflect: true },
    /** CSS selector of scroll container or 'window' (default) */
    scrollTarget: { type: String, attribute: 'scroll-target' },
    /** Minimum scroll delta in pixels before toggling hide/collapse state */
    scrollThreshold: { type: Number, attribute: 'scroll-threshold' },
    /** Whether the toolbar is hidden off-screen (set automatically when `scroll-behavior="hide"`) */
    hiddenBar: { type: Boolean, attribute: 'hidden-bar', reflect: true },
    /** Whether the toolbar is collapsed (set automatically when `scroll-behavior="collapse"`) */
    collapsed: { type: Boolean, reflect: true },
    _hasLeading: { state: true },
    _hasTrailing: { state: true },
    _hasFab: { state: true },
  }

  constructor() {
    super()
    this.type = 'floating'
    this.variant = ''
    this.orientation = 'horizontal'
    this.color = 'standard'
    this.position = 'static'
    this.fabPosition = 'end'
    this.contained = false
    this.label = ''
    this.scrollBehavior = 'none'
    this.scrollTarget = 'window'
    this.scrollThreshold = 8
    this.hiddenBar = false
    this.collapsed = false

    this._hasLeading = false
    this._hasTrailing = false
    this._hasFab = false
    this._activeIndex = 0
    this._lastScrollTop = 0
    this._currentScrollTarget = null

    this._onScroll = this._handleScroll.bind(this)
    this._handleKeydown = this._handleKeydown.bind(this)
    this._handleFocusIn = this._handleFocusIn.bind(this)
  }

  /**
   * Effective toolbar variant ('floating' | 'docked').
   */
  get _effectiveType() {
    const v = (this.variant || '').trim().toLowerCase()
    if (v === 'docked' || v === 'floating') {
      return v
    }
    const t = (this.type || 'floating').trim().toLowerCase()
    return t === 'docked' ? 'docked' : 'floating'
  }

  /**
   * Effective toolbar orientation ('horizontal' | 'vertical').
   * Per M3 Expressive spec, docked toolbars are always horizontal.
   */
  get _effectiveOrientation() {
    if (this._effectiveType === 'docked') {
      return 'horizontal'
    }
    return (this.orientation || '').trim().toLowerCase() === 'vertical' ? 'vertical' : 'horizontal'
  }

  /**
   * Effective M3 Expressive color scheme ('standard' | 'vibrant').
   */
  get _effectiveColor() {
    const c = (this.color || '').trim().toLowerCase()
    const v = (this.variant || '').trim().toLowerCase()
    if (c === 'vibrant' || v === 'vibrant') {
      return 'vibrant'
    }
    return 'standard'
  }

  connectedCallback() {
    super.connectedCallback()
    if (!isServer) {
      this._attachScrollListener()
      this._syncSlotStates()
      this._syncRovingTabindex()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._detachScrollListener()
  }

  firstUpdated(changedProperties) {
    super.firstUpdated?.(changedProperties)
    this._syncSlotStates()
    this._syncRovingTabindex()
  }

  updated(changedProperties) {
    super.updated(changedProperties)
    if (!isServer && (changedProperties.has('scrollBehavior') || changedProperties.has('scrollTarget'))) {
      this._detachScrollListener()
      this._attachScrollListener()
    }
    if (changedProperties.has('orientation') || changedProperties.has('type') || changedProperties.has('variant')) {
      this._syncRovingTabindex()
    }
  }

  /**
   * Reveals the toolbar if hidden or collapsed.
   */
  show() {
    this.hiddenBar = false
    this.collapsed = false
  }

  /**
   * Hides the toolbar off-screen.
   */
  hide() {
    this.hiddenBar = true
  }

  /**
   * Collapses the toolbar (leaving a paired `slot="fab"` visible if present).
   */
  collapse() {
    this.collapsed = true
  }

  /**
   * Expands a collapsed toolbar.
   */
  expand() {
    this.collapsed = false
  }

  /**
   * Returns ordered focusable controls participating in the toolbar's roving tabindex
   * across `leading`, default, and `trailing` slots (excluding `slot="fab"`).
   */
  getToolbarItems() {
    const items = []
    const leadingSlot = this.renderRoot?.querySelector?.('slot[name="leading"]')
    const defaultSlot = this.renderRoot?.querySelector?.('slot:not([name])')
    const trailingSlot = this.renderRoot?.querySelector?.('slot[name="trailing"]')

    if (leadingSlot || defaultSlot || trailingSlot) {
      for (const slot of [leadingSlot, defaultSlot, trailingSlot]) {
        const assigned = slot?.assignedElements?.({ flatten: true }) || []
        for (const el of assigned) {
          this._collectFocusableItems(el, items)
        }
      }
      return items
    }

    // Fallback for non-browser / SSR test environments without live slot distribution
    const lightChildren = Array.from(this.children || [])
    const leading = lightChildren.filter((el) => el.getAttribute?.('slot') === 'leading')
    const main = lightChildren.filter((el) => !el.getAttribute?.('slot'))
    const trailing = lightChildren.filter((el) => el.getAttribute?.('slot') === 'trailing')
    for (const el of [...leading, ...main, ...trailing]) {
      this._collectFocusableItems(el, items)
    }
    return items
  }

  _collectFocusableItems(node, result) {
    if (!node || (node.nodeType !== undefined && node.nodeType !== 1)) {
      return
    }
    if (node.hidden || node.hasAttribute?.('hidden')) {
      return
    }
    if (node.disabled === true || node.hasAttribute?.('disabled')) {
      return
    }

    const tagName = (node.tagName || '').toUpperCase()
    const role = (node.getAttribute?.('role') || '').toLowerCase()
    if (role === 'separator' || tagName === 'MD-DIVIDER' || tagName === 'HR') {
      return
    }

    const isAnchorLink = tagName === 'A' && Boolean(node.hasAttribute?.('href') || node.href)
    const hasExplicitTabIndex =
      node.hasAttribute?.('tabindex') &&
      role !== 'group' &&
      role !== 'toolbar' &&
      role !== 'presentation' &&
      role !== 'none'

    if (FOCUSABLE_TAGS.has(tagName) || isAnchorLink || FOCUSABLE_ROLES.has(role) || hasExplicitTabIndex) {
      result.push(node)
      return
    }

    for (const child of Array.from(node.children || [])) {
      this._collectFocusableItems(child, result)
    }
  }

  _isItemFocused(item) {
    if (!item) return false
    if (!isServer && typeof document !== 'undefined') {
      if (document.activeElement === item) return true
    }
    if (typeof item.matches === 'function') {
      try {
        if (item.matches(':focus') || item.matches(':focus-within')) {
          return true
        }
      } catch {
        // Ignore unsupported pseudo-class selectors in non-browser shims
      }
    }
    return false
  }

  _syncRovingTabindex(preferredIndex) {
    const items = this.getToolbarItems()
    if (items.length === 0) {
      this._activeIndex = 0
      return
    }

    if (typeof preferredIndex === 'number' && preferredIndex >= 0 && preferredIndex < items.length) {
      this._activeIndex = preferredIndex
    } else {
      const focusedIndex = items.findIndex((item) => this._isItemFocused(item))
      if (focusedIndex >= 0) {
        this._activeIndex = focusedIndex
      } else if (this._activeIndex < 0 || this._activeIndex >= items.length) {
        this._activeIndex = 0
      }
    }

    for (let i = 0; i < items.length; i++) {
      const value = i === this._activeIndex ? 0 : -1
      items[i].tabIndex = value
      items[i].setAttribute?.('tabindex', String(value))
    }
  }

  _checkRtl() {
    if (!isServer && typeof getComputedStyle === 'function') {
      try {
        return isRtl(this)
      } catch {
        // Fallback below
      }
    }
    return (this.getAttribute?.('dir') || this.dir || '').toLowerCase() === 'rtl'
  }

  _handleFocusIn(event) {
    const items = this.getToolbarItems()
    if (items.length === 0) return

    const path = typeof event?.composedPath === 'function' ? event.composedPath() : [event?.target]
    const index = items.findIndex(
      (item) => path.includes(item) || item === event?.target || item.contains?.(event?.target),
    )
    if (index >= 0) {
      this._syncRovingTabindex(index)
    }
  }

  _handleKeydown(event) {
    if (!event || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    const items = this.getToolbarItems()
    if (items.length === 0) return

    const path = typeof event.composedPath === 'function' ? event.composedPath() : [event.target]
    const targetIdx = items.findIndex(
      (item) =>
        path.includes(item) || item === event.target || item.contains?.(event.target) || this._isItemFocused(item),
    )
    const currentIndex = targetIdx >= 0 ? targetIdx : Math.max(0, Math.min(this._activeIndex, items.length - 1))

    // Read orientation and direction at event time so runtime changes are honored
    const vertical = this._effectiveOrientation === 'vertical'
    // Only horizontal toolbars flip arrow direction in RTL; vertical Up/Down never flips
    const rtl = !vertical && this._checkRtl()

    const key = event.key
    let nextIndex = -1

    if (key === 'Home') {
      nextIndex = 0
    } else if (key === 'End') {
      nextIndex = items.length - 1
    } else if (vertical) {
      if (key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % items.length
      } else if (key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + items.length) % items.length
      }
    } else {
      if (key === 'ArrowRight') {
        const step = rtl ? -1 : 1
        nextIndex = (currentIndex + step + items.length) % items.length
      } else if (key === 'ArrowLeft') {
        const step = rtl ? 1 : -1
        nextIndex = (currentIndex + step + items.length) % items.length
      }
    }

    if (nextIndex < 0) {
      return
    }

    event.preventDefault?.()
    this._syncRovingTabindex(nextIndex)
    items[nextIndex]?.focus?.()
  }

  _hasAssignedElements(slot) {
    if (!slot || typeof slot.assignedElements !== 'function') {
      return false
    }
    return slot.assignedElements({ flatten: true }).length > 0
  }

  _syncSlotStates() {
    const leadingSlot = this.renderRoot?.querySelector?.('slot[name="leading"]')
    const trailingSlot = this.renderRoot?.querySelector?.('slot[name="trailing"]')
    const fabSlot = this.renderRoot?.querySelector?.('slot[name="fab"]')

    if (leadingSlot || trailingSlot || fabSlot) {
      this._hasLeading = this._hasAssignedElements(leadingSlot)
      this._hasTrailing = this._hasAssignedElements(trailingSlot)
      this._hasFab = this._hasAssignedElements(fabSlot)
      return
    }

    const children = Array.from(this.children || [])
    this._hasLeading = children.some((el) => el.getAttribute?.('slot') === 'leading')
    this._hasTrailing = children.some((el) => el.getAttribute?.('slot') === 'trailing')
    this._hasFab = children.some((el) => el.getAttribute?.('slot') === 'fab')
  }

  _handleSlotChange() {
    this._syncSlotStates()
    this._syncRovingTabindex()
  }

  _getScrollTargetElement() {
    if (isServer || typeof window === 'undefined') {
      return null
    }
    if (!this.scrollTarget || this.scrollTarget === 'window') {
      return window
    }
    const root = this.getRootNode?.()
    if (root && typeof root.querySelector === 'function') {
      const el = root.querySelector(this.scrollTarget)
      if (el) return el
    }
    if (typeof document !== 'undefined') {
      const docEl = document.querySelector(this.scrollTarget)
      if (docEl) return docEl
    }
    return window
  }

  _attachScrollListener() {
    if (isServer || !this.scrollBehavior || this.scrollBehavior === 'none') {
      return
    }
    const target = this._getScrollTargetElement()
    if (target && typeof target.addEventListener === 'function') {
      target.addEventListener('scroll', this._onScroll, { passive: true })
      this._currentScrollTarget = target
      this._lastScrollTop = this._readScrollTop(target)
    }
  }

  _detachScrollListener() {
    if (this._currentScrollTarget && typeof this._currentScrollTarget.removeEventListener === 'function') {
      this._currentScrollTarget.removeEventListener('scroll', this._onScroll)
      this._currentScrollTarget = null
    }
  }

  _readScrollTop(target) {
    if (!target) return 0
    if (typeof window !== 'undefined' && target === window) {
      return Math.max(0, window.scrollY ?? window.pageYOffset ?? 0)
    }
    return Math.max(0, target.scrollTop ?? 0)
  }

  _handleScroll(event) {
    if (!this.scrollBehavior || this.scrollBehavior === 'none') {
      return
    }
    const target = this._currentScrollTarget || event?.currentTarget || event?.target || this._getScrollTargetElement()
    const currentScroll = this._readScrollTop(target)
    const threshold = Math.max(1, Number(this.scrollThreshold) || 8)

    const prevHidden = this.hiddenBar
    const prevCollapsed = this.collapsed

    if (currentScroll <= 4) {
      this.hiddenBar = false
      this.collapsed = false
      this._lastScrollTop = currentScroll
    } else {
      const delta = currentScroll - this._lastScrollTop
      if (Math.abs(delta) >= threshold) {
        const scrollingDown = delta > 0
        if (this.scrollBehavior === 'hide') {
          this.hiddenBar = scrollingDown
        } else if (this.scrollBehavior === 'collapse') {
          this.collapsed = scrollingDown
        }
        this._lastScrollTop = currentScroll
      }
    }

    if (this.hiddenBar !== prevHidden || this.collapsed !== prevCollapsed) {
      this.dispatchEvent(
        new CustomEvent('scroll-state-change', {
          detail: {
            hiddenBar: this.hiddenBar,
            collapsed: this.collapsed,
            scrollTop: currentScroll,
          },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  render() {
    const { ariaLabel } = this
    const effectiveType = this._effectiveType
    const effectiveOrientation = this._effectiveOrientation
    const effectiveColor = this._effectiveColor
    const isDocked = effectiveType === 'docked'
    const isVertical = effectiveOrientation === 'vertical'
    const fabAtStart = (this.fabPosition || '').trim().toLowerCase() === 'start'

    const wrapperClasses = {
      'toolbar-wrapper': true,
      'toolbar-wrapper--docked': isDocked,
      'toolbar-wrapper--floating': !isDocked,
      'toolbar-wrapper--vertical': isVertical,
      'toolbar-wrapper--horizontal': !isVertical,
      'toolbar-wrapper--fab-start': fabAtStart,
      'has-fab': this._hasFab,
    }

    const toolbarClasses = {
      toolbar: true,
      [`toolbar--${effectiveType}`]: true,
      [`toolbar--${effectiveOrientation}`]: true,
      [`toolbar--${effectiveColor}`]: true,
      'has-edge-slots': this._hasLeading || this._hasTrailing,
    }

    const accessibleLabel = ariaLabel || this.label || 'Toolbar'
    const wrapperInert = this.hiddenBar || (this.collapsed && !this._hasFab)
    const barInert = this.hiddenBar || this.collapsed

    return html`
      <div class="${classMap(wrapperClasses)}" ?inert=${wrapperInert}>
        <div
          class="${classMap(toolbarClasses)}"
          part="container"
          role="toolbar"
          aria-orientation="${effectiveOrientation}"
          aria-label="${accessibleLabel || nothing}"
          ?inert=${barInert}
          @keydown=${this._handleKeydown}
          @focusin=${this._handleFocusIn}>
          <md-elevation part="elevation"></md-elevation>
          <div class="toolbar__section toolbar__leading" part="leading" ?hidden=${!this._hasLeading}>
            <slot name="leading" @slotchange=${this._handleSlotChange}></slot>
          </div>
          <div class="toolbar__section toolbar__items" part="items">
            <slot @slotchange=${this._handleSlotChange}></slot>
          </div>
          <div class="toolbar__section toolbar__trailing" part="trailing" ?hidden=${!this._hasTrailing}>
            <slot name="trailing" @slotchange=${this._handleSlotChange}></slot>
          </div>
        </div>
        <div class="fab-container" part="fab" ?hidden=${!this._hasFab}>
          <slot name="fab" @slotchange=${this._handleSlotChange}></slot>
        </div>
      </div>
    `
  }
}

;(() => {
  requestUpdateOnAriaChange(Toolbar)
})()

if (!customElements.get('md-toolbar')) {
  customElements.define('md-toolbar', Toolbar)
}
