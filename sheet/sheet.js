/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import '../internal/elevation/elevation.js'
import '../divider/divider.js'
import '../buttons/icon-button.js'
import '../icon/icon.js'
import { html, isServer, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { isRtl } from '../internal/controller/is-rtl.js'
import { styles } from './sheet-styles.js'

const SIDE_POSITIONS = new Set(['end', 'side', 'start', 'right', 'left'])

/**
 * Material 3 Sheet component supporting both Bottom Sheets and Side Sheets.
 *
 * - **Bottom sheets** (`position="bottom"`, default) anchor secondary content to the bottom of the screen.
 * - **Side sheets** (`position="end" | "start" | "right" | "left"`) anchor supplementary content to the vertical edge of the screen.
 * - Supports **modal** sheets (with a backdrop scrim) and **standard** sheets (`modal="false"`, coplanar with primary content).
 *
 * @fires open {Event} Cancelable event dispatched when the sheet begins opening before animations.
 * @fires opened {Event} Dispatched when the sheet has finished opening.
 * @fires close {CustomEvent<{returnValue: string}>} Cancelable event dispatched when the sheet begins closing.
 * @fires closed {CustomEvent<{returnValue: string}>} Dispatched when the sheet has finished closing.
 * @fires cancel {Event} Cancelable event dispatched when dismissed via scrim click, swipe gesture, or Escape.
 * @fires back {CustomEvent} Dispatched when the optional header back button is clicked.
 */
export class Sheet extends LitElement {
  static styles = [styles]

  static properties = {
    open: { type: Boolean, reflect: true, noAccessor: true },
    position: { type: String, reflect: true },
    type: { type: String, reflect: true },
    modal: {
      type: Boolean,
      reflect: true,
      converter: {
        fromAttribute: (value) => (value === null ? true : value !== 'false'),
        toAttribute: (value) => (value ? '' : 'false'),
      },
    },
    inline: { type: Boolean, reflect: true },
    detached: { type: Boolean, reflect: true },
    divider: { type: Boolean, reflect: true },
    hasDragHandle: {
      attribute: 'has-drag-handle',
      noAccessor: true,
      converter: {
        fromAttribute: (value) => (value === null ? undefined : value !== 'false'),
      },
    },
    hasCloseButton: {
      attribute: 'has-close-button',
      noAccessor: true,
      converter: {
        fromAttribute: (value) => (value === null ? undefined : value !== 'false'),
      },
    },
    hasBackButton: { type: Boolean, attribute: 'has-back-button', reflect: true },
    closeLabel: { type: String, attribute: 'close-label' },
    backLabel: { type: String, attribute: 'back-label' },
    headline: { type: String, reflect: true },
    returnValue: { type: String },
    preventScrimClose: { type: Boolean, attribute: 'prevent-scrim-close', reflect: true },
    fullWidth: { type: Boolean, attribute: 'full-width', reflect: true },
    quick: { type: Boolean, reflect: true },
  }

  get isSideSheet() {
    return SIDE_POSITIONS.has(this.position)
  }

  get isModal() {
    if (this.inline) return false
    return this.type !== 'standard' && this.modal !== false
  }

  get hasDragHandle() {
    return this._hasDragHandle ?? !this.isSideSheet
  }

  set hasDragHandle(value) {
    const oldValue = this.hasDragHandle
    this._hasDragHandle = value === undefined || value === null ? undefined : Boolean(value)
    this.requestUpdate('hasDragHandle', oldValue)
  }

  get hasCloseButton() {
    return this._hasCloseButton ?? this.isSideSheet
  }

  set hasCloseButton(value) {
    const oldValue = this.hasCloseButton
    this._hasCloseButton = value === undefined || value === null ? undefined : Boolean(value)
    this.requestUpdate('hasCloseButton', oldValue)
  }

  get open() {
    return this.isOpen
  }

  set open(value) {
    const boolValue = Boolean(value)
    if (boolValue === this.isOpen) {
      if (boolValue && !this.hasAttribute('open')) {
        this.setAttribute('open', '')
      }
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
    this.position = 'bottom'
    this.type = ''
    this.modal = true
    this.inline = false
    this.detached = false
    this.divider = false
    this._hasDragHandle = undefined
    this._hasCloseButton = undefined
    this.hasBackButton = false
    this.closeLabel = 'Close'
    this.backLabel = 'Back'
    this.headline = ''
    this.returnValue = ''
    this.preventScrimClose = false
    this.fullWidth = false
    this.quick = false

    this.hasHeadlineSlot = false
    this.hasActionsSlot = false
    this.hasBackSlot = false
    this.hasCloseSlot = false

    this.prevActiveElement = null
    this._animId = 0

    // Gesture tracking state
    this.isDragging = false
    this.dragPending = false
    this.dragStartX = 0
    this.dragStartY = 0
    this.dragCurrentX = 0
    this.dragCurrentY = 0
    this.dragStartTime = 0

    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleHandlePointerDown = this.handleHandlePointerDown.bind(this)
    this.handleHeaderPointerDown = this.handleHeaderPointerDown.bind(this)
    this.handlePointerMove = this.handlePointerMove.bind(this)
    this.handlePointerUp = this.handlePointerUp.bind(this)

    if (!isServer) {
      this.addEventListener('submit', this.handleSubmit)
    }
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

  /**
   * Resolves the physical edge ('bottom' | 'left' | 'right') accounting for RTL direction.
   */
  getResolvedSide() {
    if (!this.isSideSheet) return 'bottom'
    if (this.position === 'right') return 'right'
    if (this.position === 'left') return 'left'
    const rtl = !isServer && this.isConnected ? isRtl(this) : false
    if (this.position === 'start') {
      return rtl ? 'right' : 'left'
    }
    // 'end' or 'side'
    return rtl ? 'left' : 'right'
  }

  getClosedTransform(resolvedSide = this.getResolvedSide()) {
    if (resolvedSide === 'left') return 'translateX(-100%)'
    if (resolvedSide === 'right') return 'translateX(100%)'
    return 'translateY(100%)'
  }

  shouldSkipAnimation() {
    if (this.quick || isServer) return true
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.hasAttribute('open') && !this.isOpen && !this.isOpening) {
      this.show()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanupListeners()
  }

  /**
   * Opens the sheet and fires a cancelable `open` event.
   * After the entrance animation finishes, an `opened` event is fired.
   *
   * @return {Promise<void>}
   */
  async show() {
    if (this.isOpening || (this.isOpen && !this.isClosing)) return
    const animId = ++this._animId
    this.isOpening = true
    this.isClosing = false

    await this.updateComplete
    if (animId !== this._animId) return

    const preventOpen = !this.dispatchEvent(new Event('open', { cancelable: true }))
    if (preventOpen) {
      this.isOpening = false
      this.removeAttribute('open')
      return
    }

    this.isOpen = true
    this.setAttribute('open', '')
    await this.updateComplete
    if (animId !== this._animId) return

    if (this.isModal && !isServer) {
      this.prevActiveElement = document.activeElement
      window.removeEventListener('keydown', this.handleKeydown)
      window.addEventListener('keydown', this.handleKeydown)
    }

    if (this.scroller) {
      this.scroller.scrollTop = 0
    }

    const sheet = this.sheet
    const scrim = this.scrim

    if (this.shouldSkipAnimation() || !sheet) {
      if (sheet) {
        sheet.style.transition = ''
        sheet.style.transform = ''
      }
      if (scrim) {
        scrim.style.transition = ''
        scrim.style.opacity = ''
      }
      this.isOpening = false
      this.dispatchEvent(new Event('opened'))
      if (this.isModal) {
        this.focusContent()
      }
      return
    }

    const closedTransform = this.getClosedTransform()

    sheet.style.transition = 'none'
    sheet.style.transform = closedTransform
    if (scrim) {
      scrim.style.transition = 'none'
      scrim.style.opacity = '0'
    }

    // Force reflow before starting transition
    void sheet.offsetHeight

    const duration = 300
    const easing = 'cubic-bezier(0.2, 0, 0, 1)'

    sheet.style.transition = `transform ${duration}ms ${easing}`
    sheet.style.transform = 'translate3d(0, 0, 0)'

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
      setTimeout(() => {
        sheet.removeEventListener('transitionend', onEnd)
        resolve()
      }, duration + 50)
    })

    if (animId !== this._animId) return

    sheet.style.transition = ''
    sheet.style.transform = ''
    if (scrim) {
      scrim.style.transition = ''
    }

    this.isOpening = false
    this.dispatchEvent(new Event('opened'))
    if (this.isModal) {
      this.focusContent()
    }
  }

  /**
   * Closes the sheet and fires a cancelable `close` event.
   * After the exit animation finishes, a `closed` event is fired.
   *
   * @param {string} [returnValue] Optional return value or reason for closing.
   * @return {Promise<void>}
   */
  async close(returnValue = this.returnValue) {
    if (this.isClosing || (!this.isOpen && !this.isOpening)) return
    const resolvedReturnValue = returnValue ?? ''
    const closeEvent = new CustomEvent('close', {
      cancelable: true,
      detail: { returnValue: resolvedReturnValue },
    })
    const preventClose = !this.dispatchEvent(closeEvent)
    if (preventClose) {
      if (this.isOpen) {
        this.setAttribute('open', '')
      }
      return
    }

    const animId = ++this._animId
    this.isClosing = true
    this.isOpening = false
    this.returnValue = resolvedReturnValue

    const wasModal = this.isModal
    const sheet = this.sheet
    const scrim = this.scrim

    if (!this.shouldSkipAnimation() && sheet) {
      const duration = 200
      const easing = 'cubic-bezier(0.3, 0, 1, 1)'
      const closedTransform = this.getClosedTransform()

      sheet.style.transition = `transform ${duration}ms ${easing}`
      sheet.style.transform = closedTransform

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
        setTimeout(() => {
          sheet.removeEventListener('transitionend', onEnd)
          resolve()
        }, duration + 50)
      })

      if (animId !== this._animId) return

      sheet.style.transition = ''
      sheet.style.transform = ''
      if (scrim) {
        scrim.style.transition = ''
        scrim.style.opacity = ''
      }
    }

    this.isOpen = false
    this.isClosing = false
    this.removeAttribute('open')
    this.cleanupListeners()

    if (wasModal && this.prevActiveElement && typeof this.prevActiveElement.focus === 'function') {
      try {
        this.prevActiveElement.focus({ preventScroll: true })
      } catch {}
      this.prevActiveElement = null
    }

    this.dispatchEvent(
      new CustomEvent('closed', {
        detail: { returnValue: resolvedReturnValue },
      }),
    )
  }

  cleanupListeners() {
    if (!isServer) {
      window.removeEventListener('keydown', this.handleKeydown)
    }
  }

  focusContent() {
    const autofocusEl = this.querySelector('[autofocus]')
    if (autofocusEl && typeof autofocusEl.focus === 'function') {
      autofocusEl.focus({ preventScroll: true })
      return
    }
    const closeBtn = this.renderRoot.querySelector('.close-button-wrapper.visible md-icon-button')
    if (closeBtn && typeof closeBtn.focus === 'function') {
      closeBtn.focus({ preventScroll: true })
      return
    }
    const focusable = this.sheet
    if (focusable) {
      focusable.focus({ preventScroll: true })
    }
  }

  handleSubmit(event) {
    const form = event.target
    if (!form || form.method !== 'dialog') return
    event.preventDefault()
    const submitter = event.submitter
    this.close(submitter?.getAttribute('value') ?? this.returnValue)
  }

  handleKeydown(e) {
    if (e.defaultPrevented || !this.isOpen || !this.isModal) return
    if (e.key === 'Escape') {
      const cancelEvent = new Event('cancel', { cancelable: true })
      this.dispatchEvent(cancelEvent)
      if (!cancelEvent.defaultPrevented) {
        this.close('escape')
      }
    }
  }

  handleScrimClick(e) {
    if (e.target !== this.scrim || this.preventScrimClose) return
    const cancelEvent = new Event('cancel', { cancelable: true })
    this.dispatchEvent(cancelEvent)
    if (!cancelEvent.defaultPrevented) {
      this.close('scrim')
    }
  }

  handleCloseButtonClick() {
    this.close('close')
  }

  handleBackClick() {
    this.dispatchEvent(
      new CustomEvent('back', {
        bubbles: true,
        composed: true,
      }),
    )
  }

  // Drag handle gesture (immediate drag start)
  handleHandlePointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    this.beginPointerTracking(e, false)
  }

  // Side sheet header touch-swipe gesture (threshold-gated so buttons/selection work normally)
  handleHeaderPointerDown(e) {
    if (e.pointerType === 'mouse') return
    const target = e.target
    if (
      target instanceof Element &&
      target.closest('md-icon-button, button, a, input, [slot="close-button"], [slot="back-button"]')
    ) {
      return
    }
    this.beginPointerTracking(e, true)
  }

  beginPointerTracking(e, waitThreshold) {
    const sheet = this.sheet
    if (!sheet) return

    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
    this.dragCurrentX = e.clientX
    this.dragCurrentY = e.clientY
    this.dragStartTime = performance.now()
    this.dragPending = waitThreshold
    this.isDragging = !waitThreshold

    const target = e.currentTarget
    if (!waitThreshold) {
      try {
        target.setPointerCapture(e.pointerId)
      } catch {}
      sheet.style.transition = 'none'
      if (this.scrim) {
        this.scrim.style.transition = 'none'
      }
    }

    target.addEventListener('pointermove', this.handlePointerMove)
    target.addEventListener('pointerup', this.handlePointerUp)
    target.addEventListener('pointercancel', this.handlePointerUp)
  }

  handlePointerMove(e) {
    if (!this.isDragging && !this.dragPending) return
    const sheet = this.sheet
    if (!sheet) return

    this.dragCurrentX = e.clientX
    this.dragCurrentY = e.clientY
    const rawDx = this.dragCurrentX - this.dragStartX
    const rawDy = this.dragCurrentY - this.dragStartY
    const resolvedSide = this.getResolvedSide()

    if (this.dragPending) {
      const primaryDelta = resolvedSide === 'bottom' ? rawDy : resolvedSide === 'right' ? rawDx : -rawDx
      const crossDelta = resolvedSide === 'bottom' ? Math.abs(rawDx) : Math.abs(rawDy)
      if (crossDelta > 12 && crossDelta > primaryDelta) {
        this.cleanupPointerTarget(e.currentTarget, e.pointerId)
        return
      }
      if (primaryDelta < 8) return
      this.dragPending = false
      this.isDragging = true
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
      sheet.style.transition = 'none'
      if (this.scrim) {
        this.scrim.style.transition = 'none'
      }
    }

    if (resolvedSide === 'bottom') {
      const dy = Math.max(0, rawDy)
      sheet.style.transform = `translateY(${dy}px)`
      if (this.scrim) {
        const height = sheet.offsetHeight || 300
        const ratio = Math.max(0, 1 - dy / height)
        this.scrim.style.opacity = (0.32 * ratio).toFixed(3)
      }
    } else if (resolvedSide === 'right') {
      const dx = Math.max(0, rawDx)
      sheet.style.transform = `translateX(${dx}px)`
      if (this.scrim) {
        const width = sheet.offsetWidth || 360
        const ratio = Math.max(0, 1 - dx / width)
        this.scrim.style.opacity = (0.32 * ratio).toFixed(3)
      }
    } else {
      const dx = Math.min(0, rawDx)
      sheet.style.transform = `translateX(${dx}px)`
      if (this.scrim) {
        const width = sheet.offsetWidth || 360
        const ratio = Math.max(0, 1 - Math.abs(dx) / width)
        this.scrim.style.opacity = (0.32 * ratio).toFixed(3)
      }
    }
  }

  cleanupPointerTarget(target, pointerId) {
    this.isDragging = false
    this.dragPending = false
    target.removeEventListener('pointermove', this.handlePointerMove)
    target.removeEventListener('pointerup', this.handlePointerUp)
    target.removeEventListener('pointercancel', this.handlePointerUp)
    try {
      target.releasePointerCapture(pointerId)
    } catch {}
  }

  async handlePointerUp(e) {
    const wasDragging = this.isDragging
    this.cleanupPointerTarget(e.currentTarget, e.pointerId)
    if (!wasDragging) return

    const sheet = this.sheet
    if (!sheet) return

    const resolvedSide = this.getResolvedSide()
    const rawDx = this.dragCurrentX - this.dragStartX
    const rawDy = this.dragCurrentY - this.dragStartY
    const distance =
      resolvedSide === 'bottom'
        ? Math.max(0, rawDy)
        : resolvedSide === 'right'
          ? Math.max(0, rawDx)
          : Math.max(0, -rawDx)

    const dt = performance.now() - this.dragStartTime
    const velocity = dt > 0 ? distance / dt : 0

    if (distance > 96 || (velocity > 0.4 && distance > 20)) {
      const cancelEvent = new Event('cancel', { cancelable: true })
      this.dispatchEvent(cancelEvent)
      if (!cancelEvent.defaultPrevented) {
        await this.close('drag')
        return
      }
    }

    // Spring back to open position
    sheet.style.transition = 'transform 200ms cubic-bezier(0.2, 0, 0, 1)'
    sheet.style.transform = 'translate3d(0, 0, 0)'

    if (this.scrim) {
      this.scrim.style.transition = 'opacity 200ms linear'
      this.scrim.style.opacity = ''
    }

    setTimeout(() => {
      if (this.sheet && !this.isClosing) {
        this.sheet.style.transition = ''
        this.sheet.style.transform = ''
      }
      if (this.scrim && !this.isClosing) {
        this.scrim.style.transition = ''
      }
    }, 220)
  }

  handleHeadlineChange(e) {
    const slot = e.target
    this.hasHeadlineSlot = slot.assignedNodes().some((node) => {
      return node.nodeType === Node.ELEMENT_NODE || (node.textContent && node.textContent.trim().length > 0)
    })
    this.requestUpdate()
  }

  handleActionsChange(e) {
    const slot = e.target
    this.hasActionsSlot = slot.assignedElements().length > 0
    this.requestUpdate()
  }

  handleBackSlotChange(e) {
    const slot = e.target
    this.hasBackSlot = slot.assignedElements().length > 0
    this.requestUpdate()
  }

  handleCloseSlotChange(e) {
    const slot = e.target
    this.hasCloseSlot = slot.assignedElements().length > 0
    this.requestUpdate()
  }

  render() {
    const isSide = this.isSideSheet
    const isModal = this.isModal
    const resolvedSide = this.getResolvedSide()
    const showDragHandle = this.hasDragHandle
    const showBackButton = Boolean(this.hasBackButton || this.hasBackSlot)
    const showCloseButton = Boolean(this.hasCloseButton || this.hasCloseSlot)
    const hasHeadlineText = Boolean(this.headline || this.hasHeadlineSlot)
    const hasHeader = hasHeadlineText || showBackButton || showCloseButton

    const sheetClasses = {
      sheet: true,
      'side-sheet': isSide,
      'bottom-sheet': !isSide,
      'resolved-left': resolvedSide === 'left',
      'resolved-right': resolvedSide === 'right',
      modal: isModal,
      standard: !isModal,
      'with-drag-handle': showDragHandle,
      'with-header': hasHeader,
      'with-back': showBackButton,
      'with-close': showCloseButton,
      'with-actions': this.hasActionsSlot,
      'with-divider': this.divider,
    }

    const explicitAriaLabel = this.getAttribute('aria-label')

    return html`
      ${isModal ? html`<div class="scrim" part="scrim" @click=${this.handleScrimClick} aria-hidden="true"></div>` : nothing}
      <div
        part="sheet"
        class=${classMap(sheetClasses)}
        role=${isModal ? 'dialog' : 'region'}
        aria-modal=${isModal ? 'true' : nothing}
        aria-labelledby=${hasHeadlineText && !explicitAriaLabel ? 'headline' : nothing}
        aria-label=${explicitAriaLabel || (!hasHeadlineText ? 'Sheet' : nothing)}
        tabindex="-1">
        <md-elevation part="elevation"></md-elevation>
        ${
          showDragHandle
            ? html`
                <div
                  class="drag-handle-container"
                  part="drag-handle"
                  @pointerdown=${this.handleHandlePointerDown}
                  aria-hidden="true">
                  <slot name="drag-handle">
                    <div class="drag-handle"></div>
                  </slot>
                </div>
              `
            : nothing
        }
        <div class="header" part="header" @pointerdown=${isSide ? this.handleHeaderPointerDown : nothing}>
          <div class="back-button-wrapper ${showBackButton ? 'visible' : ''}">
            <slot name="back-button" @slotchange=${this.handleBackSlotChange}>
              ${
                this.hasBackButton
                  ? html`
                      <md-icon-button
                        class="back-btn"
                        aria-label=${this.backLabel || 'Back'}
                        @click=${this.handleBackClick}>
                        <md-icon class="back-icon">arrow_back</md-icon>
                      </md-icon-button>
                    `
                  : nothing
              }
            </slot>
          </div>
          <div class="headline" id="headline" part="headline">
            <slot name="headline" @slotchange=${this.handleHeadlineChange}>${this.headline}</slot>
          </div>
          <div class="close-button-wrapper ${showCloseButton ? 'visible' : ''}">
            <slot name="close-button" @slotchange=${this.handleCloseSlotChange}>
              ${
                this.hasCloseButton
                  ? html`
                      <md-icon-button
                        class="close-btn"
                        aria-label=${this.closeLabel || 'Close'}
                        @click=${this.handleCloseButtonClick}>
                        <md-icon>close</md-icon>
                      </md-icon-button>
                    `
                  : nothing
              }
            </slot>
          </div>
        </div>
        <md-divider class="header-divider"></md-divider>
        <div class="content-scroller" part="content">
          <div class="content">
            <slot></slot>
          </div>
        </div>
        <md-divider class="actions-divider"></md-divider>
        <div class="actions" part="actions">
          <slot name="actions" @slotchange=${this.handleActionsChange}></slot>
        </div>
      </div>
    `
  }
}

customElements.define('md-sheet', Sheet)
