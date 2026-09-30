/**
 * @license
 * Copyright 2024 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import '../internal/elevation/elevation.js'
import { html, isServer, LitElement, nothing, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

/**
 * Material 3 Bottom Sheet component.
 *
 * Bottom sheets show secondary content anchored to the bottom of the screen.
 * Supports modal bottom sheets (with scrim backdrop) and standard bottom sheets (coplanar).
 *
 * @fires open {Event} Dispatched when the bottom sheet begins opening before animations.
 * @fires opened {Event} Dispatched when the bottom sheet has fully opened.
 * @fires close {Event} Dispatched when the bottom sheet begins closing before animations.
 * @fires closed {Event} Dispatched when the bottom sheet has fully closed.
 * @fires cancel {Event} Dispatched when the bottom sheet is canceled via scrim click, swipe-down gesture, or Escape.
 */
export class BottomSheet extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    type: { type: String, reflect: true },
    modal: {
      type: Boolean,
      reflect: true,
      converter: {
        fromAttribute: (value) => (value === null ? true : value !== 'false'),
        toAttribute: (value) => (value ? '' : 'false'),
      },
    },
    hasDragHandle: {
      type: Boolean,
      attribute: 'has-drag-handle',
      reflect: true,
      converter: {
        fromAttribute: (value) => (value === null ? true : value !== 'false'),
        toAttribute: (value) => (value ? '' : 'false'),
      },
    },
    quick: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, attribute: 'full-width', reflect: true },
    headline: { type: String, reflect: true },
  }

  get isModal() {
    return this.type !== 'standard' && this.modal !== false
  }

  get open() {
    return this.isOpen
  }

  set open(value) {
    const boolValue = Boolean(value)
    if (boolValue === this.isOpen) {
      return
    }
    if (boolValue) {
      this.show()
    } else {
      this.close()
    }
  }

  constructor() {
    super()
    this.isOpen = false
    this.isOpening = false
    this.isClosing = false
    this.modal = true
    this.hasDragHandle = true
    this.quick = false
    this.fullWidth = false
    this.headline = ''
    this.hasHeadlineSlot = false
    this.hasActionsSlot = false

    this.prevActiveElement = null
    this.prevBodyOverflow = null

    // Gesture tracking state
    this.isDragging = false
    this.dragStartY = 0
    this.dragCurrentY = 0
    this.dragStartTime = 0

    this.handleKeydown = this.handleKeydown.bind(this)
    this.handlePointerDown = this.handlePointerDown.bind(this)
    this.handlePointerMove = this.handlePointerMove.bind(this)
    this.handlePointerUp = this.handlePointerUp.bind(this)
  }

  get sheet() {
    return this.renderRoot.querySelector('.sheet')
  }

  get scrim() {
    return this.renderRoot.querySelector('.scrim')
  }

  get scroller() {
    return this.renderRoot.querySelector('.content-scroller')
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.hasAttribute('open') && !this.isOpen) {
      this.show()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanupListeners()
  }

  /**
   * Opens the bottom sheet and fires a cancelable `open` event.
   * After the slide-up animation, an `opened` event is fired.
   *
   * @return A Promise that resolves after the animation finishes and `opened` is fired.
   */
  async show() {
    if (this.isOpening || this.isOpen) return
    this.isOpening = true
    this.isClosing = false

    await this.updateComplete
    if (!this.isOpening) return

    const preventOpen = !this.dispatchEvent(new Event('open', { cancelable: true }))
    if (preventOpen) {
      this.isOpening = false
      this.open = false
      return
    }

    this.isOpen = true
    this.setAttribute('open', '')

    if (this.isModal) {
      this.prevActiveElement = !isServer ? document.activeElement : null
      if (!isServer && document.body) {
        this.prevBodyOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      }
      window.removeEventListener('keydown', this.handleKeydown)
      window.addEventListener('keydown', this.handleKeydown)
    }

    if (this.scroller) {
      this.scroller.scrollTop = 0
    }

    const sheet = this.sheet
    const scrim = this.scrim

    if (this.quick || !sheet) {
      this.dispatchEvent(new Event('opened'))
      this.isOpening = false
      this.focusContent()
      return
    }

    // Prepare start state
    sheet.style.transition = 'none'
    sheet.style.transform = 'translateY(100%)'
    if (scrim) {
      scrim.style.transition = 'none'
      scrim.style.opacity = '0'
    }

    // Force reflow
    void sheet.offsetHeight

    // Animate to open state
    const duration = 300
    const easing = 'cubic-bezier(0.2, 0, 0, 1)'

    sheet.style.transition = `transform ${duration}ms ${easing}`
    sheet.style.transform = 'translateY(0)'

    if (scrim) {
      scrim.style.transition = `opacity ${duration}ms linear`
      scrim.style.opacity = ''
    }

    await new Promise((resolve) => {
      const onEnd = (e) => {
        if (e.target === sheet && e.propertyName === 'transform') {
          sheet.removeEventListener('transitionend', onEnd)
          resolve()
        }
      }
      sheet.addEventListener('transitionend', onEnd)
      // Safety timeout in case transitionend does not fire
      setTimeout(resolve, duration + 50)
    })

    sheet.style.transition = ''
    sheet.style.transform = ''
    if (scrim) {
      scrim.style.transition = ''
    }

    this.isOpening = false
    this.dispatchEvent(new Event('opened'))
    this.focusContent()
  }

  /**
   * Closes the bottom sheet and fires a cancelable `close` event.
   * After the slide-down animation, a `closed` event is fired.
   *
   * @param returnValue Optional return value or reason for closing.
   * @return A Promise that resolves after the animation finishes and `closed` is fired.
   */
  async close(returnValue) {
    if (this.isClosing || !this.isOpen) return
    this.isClosing = true
    this.isOpening = false

    const closeEvent = new CustomEvent('close', {
      cancelable: true,
      detail: { returnValue },
    })
    const preventClose = !this.dispatchEvent(closeEvent)
    if (preventClose) {
      this.isClosing = false
      return
    }

    const sheet = this.sheet
    const scrim = this.scrim

    if (!this.quick && sheet) {
      const duration = 200
      const easing = 'cubic-bezier(0.3, 0, 1, 1)'

      sheet.style.transition = `transform ${duration}ms ${easing}`
      sheet.style.transform = 'translateY(100%)'

      if (scrim) {
        scrim.style.transition = `opacity ${duration}ms linear`
        scrim.style.opacity = '0'
      }

      await new Promise((resolve) => {
        const onEnd = (e) => {
          if (e.target === sheet && e.propertyName === 'transform') {
            sheet.removeEventListener('transitionend', onEnd)
            resolve()
          }
        }
        sheet.addEventListener('transitionend', onEnd)
        setTimeout(resolve, duration + 50)
      })

      sheet.style.transition = ''
      sheet.style.transform = ''
      if (scrim) {
        scrim.style.transition = ''
        scrim.style.opacity = ''
      }
    }

    this.isOpen = false
    this.removeAttribute('open')
    this.cleanupListeners()

    if (this.prevActiveElement && typeof this.prevActiveElement.focus === 'function') {
      try {
        this.prevActiveElement.focus()
      } catch {}
      this.prevActiveElement = null
    }

    this.isClosing = false
    this.dispatchEvent(
      new CustomEvent('closed', {
        detail: { returnValue },
      }),
    )
  }

  cleanupListeners() {
    window.removeEventListener('keydown', this.handleKeydown)
    if (!isServer && document.body && this.prevBodyOverflow !== null) {
      document.body.style.overflow = this.prevBodyOverflow
      this.prevBodyOverflow = null
    }
  }

  focusContent() {
    const autofocusEl = this.querySelector('[autofocus]')
    if (autofocusEl) {
      autofocusEl.focus()
      return
    }
    const focusable = this.renderRoot.querySelector('.sheet')
    if (focusable) {
      focusable.focus()
    }
  }

  handleKeydown(e) {
    if (e.defaultPrevented) return
    if (e.key === 'Escape') {
      const cancelEvent = new Event('cancel', { cancelable: true })
      this.dispatchEvent(cancelEvent)
      if (!cancelEvent.defaultPrevented) {
        this.close('escape')
      }
    }
  }

  handleScrimClick(e) {
    if (e.target !== this.scrim) return
    const cancelEvent = new Event('cancel', { cancelable: true })
    this.dispatchEvent(cancelEvent)
    if (!cancelEvent.defaultPrevented) {
      this.close('scrim')
    }
  }

  // Pointer drag gestures
  handlePointerDown(e) {
    // Only respond to primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const sheet = this.sheet
    if (!sheet) return

    this.isDragging = true
    this.dragStartY = e.clientY
    this.dragCurrentY = e.clientY
    this.dragStartTime = performance.now()

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}

    sheet.style.transition = 'none'
    if (this.scrim) {
      this.scrim.style.transition = 'none'
    }

    e.currentTarget.addEventListener('pointermove', this.handlePointerMove)
    e.currentTarget.addEventListener('pointerup', this.handlePointerUp)
    e.currentTarget.addEventListener('pointercancel', this.handlePointerUp)
  }

  handlePointerMove(e) {
    if (!this.isDragging) return
    const sheet = this.sheet
    if (!sheet) return

    this.dragCurrentY = e.clientY
    const dy = Math.max(0, this.dragCurrentY - this.dragStartY)

    sheet.style.transform = `translateY(${dy}px)`

    if (this.scrim) {
      const height = sheet.offsetHeight || 300
      const ratio = Math.max(0, 1 - dy / height)
      this.scrim.style.opacity = (0.32 * ratio).toFixed(3)
    }
  }

  async handlePointerUp(e) {
    if (!this.isDragging) return
    this.isDragging = false

    const handle = e.currentTarget
    handle.removeEventListener('pointermove', this.handlePointerMove)
    handle.removeEventListener('pointerup', this.handlePointerUp)
    handle.removeEventListener('pointercancel', this.handlePointerUp)

    try {
      handle.releasePointerCapture(e.pointerId)
    } catch {}

    const sheet = this.sheet
    if (!sheet) return

    const dy = Math.max(0, this.dragCurrentY - this.dragStartY)
    const dt = performance.now() - this.dragStartTime
    const velocity = dt > 0 ? dy / dt : 0

    // Threshold: dragged down > 96px or flicked down with velocity > 0.4 px/ms
    if (dy > 96 || (velocity > 0.4 && dy > 20)) {
      const cancelEvent = new Event('cancel', { cancelable: true })
      this.dispatchEvent(cancelEvent)
      if (!cancelEvent.defaultPrevented) {
        await this.close('drag')
        return
      }
    }

    // Spring back up
    sheet.style.transition = 'transform 200ms cubic-bezier(0.2, 0, 0, 1)'
    sheet.style.transform = 'translateY(0)'

    if (this.scrim) {
      this.scrim.style.transition = 'opacity 200ms linear'
      this.scrim.style.opacity = ''
    }

    setTimeout(() => {
      if (this.sheet) {
        this.sheet.style.transition = ''
        this.sheet.style.transform = ''
      }
      if (this.scrim) {
        this.scrim.style.transition = ''
      }
    }, 220)
  }

  handleHeadlineChange(e) {
    const slot = e.target
    this.hasHeadlineSlot = slot.assignedNodes({ flatten: true }).length > 0
    this.requestUpdate()
  }

  handleActionsChange(e) {
    const slot = e.target
    this.hasActionsSlot = slot.assignedNodes({ flatten: true }).length > 0
    this.requestUpdate()
  }

  render() {
    const hasHeader = this.headline || this.hasHeadlineSlot
    const sheetClasses = {
      sheet: true,
      'has-headline': hasHeader,
      'has-actions': this.hasActionsSlot,
    }

    return html`
      ${this.isModal ? html`<div class="scrim" @click=${this.handleScrimClick} aria-hidden="true"></div>` : nothing}
      <div
        class=${classMap(sheetClasses)}
        role=${this.isModal ? 'dialog' : 'region'}
        aria-modal=${this.isModal ? 'true' : nothing}
        aria-label=${this.headline || this.getAttribute('aria-label') || nothing}
        tabindex="-1">
        <md-elevation></md-elevation>
        ${
          this.hasDragHandle
            ? html`
                <div class="drag-handle-container" @pointerdown=${this.handlePointerDown} aria-hidden="true">
                  <slot name="drag-handle">
                    <div class="drag-handle"></div>
                  </slot>
                </div>
              `
            : nothing
        }
        ${
          hasHeader
            ? html`
                <div class="headline">
                  <slot name="headline" @slotchange=${this.handleHeadlineChange}> ${this.headline} </slot>
                </div>
              `
            : nothing
        }
        <div class="content-scroller">
          <div class="content">
            <slot></slot>
          </div>
        </div>
        <div class="actions">
          <slot name="actions" @slotchange=${this.handleActionsChange}></slot>
        </div>
      </div>
    `
  }

  static styles = css`
    :host {
      display: none;
      position: fixed;
      inset: 0;
      z-index: var(--md-bottom-sheet-z-index, 1000);
      pointer-events: none;
      box-sizing: border-box;
      align-items: flex-end;
      justify-content: center;
    }

    :host([open]) {
      display: flex;
    }

    :host([type='standard']),
    :host([modal='false']) {
      inset: auto 0 0 0;
      pointer-events: none;
    }

    .scrim {
      position: fixed;
      inset: 0;
      background-color: var(--md-bottom-sheet-scrim-color, var(--md-sys-color-scrim, #000));
      opacity: 0.32;
      z-index: 1;
      pointer-events: auto;
    }

    .sheet {
      position: relative;
      z-index: 2;
      pointer-events: auto;
      box-sizing: border-box;
      width: 100%;
      max-width: var(--md-bottom-sheet-max-width, 640px);
      max-height: var(--md-bottom-sheet-max-height, calc(100vh - 72px));
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      background-color: var(--md-bottom-sheet-container-color, var(--md-sys-color-surface-container-low, #f7f2fa));
      color: var(--md-bottom-sheet-content-color, var(--md-sys-color-on-surface, #1d1b20));
      border-top-left-radius: var(--md-bottom-sheet-container-shape-top, var(--md-sys-shape-corner-extra-large, 28px));
      border-top-right-radius: var(--md-bottom-sheet-container-shape-top, var(--md-sys-shape-corner-extra-large, 28px));
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      outline: none;
      overflow: hidden;
      --md-elevation-level: 1;
    }

    :host([full-width]) .sheet {
      max-width: 100%;
      margin: 0;
    }

    md-elevation {
      border-radius: inherit;
    }

    .drag-handle-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 48px;
      min-height: 48px;
      cursor: grab;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }

    .drag-handle-container:active {
      cursor: grabbing;
    }

    .drag-handle {
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background-color: var(--md-bottom-sheet-drag-handle-color, var(--md-sys-color-on-surface-variant, #49454f));
      opacity: 0.4;
    }

    .headline {
      font-family: var(
        --md-bottom-sheet-headline-font,
        var(--md-sys-typescale-title-large-font, var(--md-ref-typeface-brand, Roboto))
      );
      font-size: var(--md-bottom-sheet-headline-size, var(--md-sys-typescale-title-large-size, 1.375rem));
      line-height: var(
        --md-bottom-sheet-headline-line-height,
        var(--md-sys-typescale-title-large-line-height, 1.75rem)
      );
      font-weight: var(--md-bottom-sheet-headline-weight, var(--md-sys-typescale-title-large-weight, 400));
      color: var(--md-bottom-sheet-headline-color, var(--md-sys-color-on-surface, #1d1b20));
      padding: 0 24px 16px 24px;
      box-sizing: border-box;
    }

    :host([has-drag-handle='false']) .headline {
      padding-top: 24px;
    }

    :host([has-drag-handle='false']) .sheet:not(.has-headline) .content-scroller {
      padding-top: 24px;
    }

    .content-scroller {
      flex: 1 1 auto;
      overflow-y: auto;
      overscroll-behavior: contain;
      box-sizing: border-box;
      padding: 0 24px 16px 24px;
    }

    .content {
      font-family: var(
        --md-bottom-sheet-content-font,
        var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto))
      );
      font-size: var(--md-bottom-sheet-content-size, var(--md-sys-typescale-body-medium-size, 0.875rem));
      line-height: var(--md-bottom-sheet-content-line-height, var(--md-sys-typescale-body-medium-line-height, 1.25rem));
      font-weight: var(--md-bottom-sheet-content-weight, var(--md-sys-typescale-body-medium-weight, 400));
      color: var(--md-bottom-sheet-content-color, var(--md-sys-color-on-surface, #1d1b20));
    }

    ::slotted(md-list) {
      --md-list-container-color: transparent;
      background: transparent;
      margin: 0 -24px;
    }

    .actions {
      display: none;
      position: relative;
    }

    .sheet.has-actions .actions {
      display: block;
    }

    slot[name='actions']::slotted(*) {
      box-sizing: border-box;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 16px 24px 24px 24px;
    }
  `
}

customElements.define('md-bottom-sheet', BottomSheet)
