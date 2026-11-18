/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { html, isServer, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { scrollFieldGroupStyles, scrollFieldStyles } from './scroll-field-styles.js'

const HANDLED_KEY = Symbol('handledScrollFieldKey')
const WINDOW_THRESHOLD = 240
const WINDOW_RADIUS = 100

const clampIndex = (index, count) => (count <= 0 ? 0 : Math.min(Math.max(0, index), count - 1))
const wrapIndex = (index, count) => (count <= 0 ? 0 : ((index % count) + count) % count)

function countDecimals(num) {
  if (!Number.isFinite(num)) return 0
  const str = String(num)
  if (str.includes('e-')) return Math.min(6, Number(str.split('e-')[1]) || 0)
  const dot = str.indexOf('.')
  return dot === -1 ? 0 : Math.min(6, str.length - dot - 1)
}

function parseOptionsAttribute(attrValue) {
  if (attrValue === null || attrValue === undefined || attrValue === '') return null
  try {
    const parsed = JSON.parse(attrValue)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    const parts = String(attrValue)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
    return parts.length > 0 ? parts : null
  }
}

function prefersReducedMotion() {
  return (
    !isServer &&
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  )
}

/**
 * Material 3 Expressive Scroll Field (`md-scroll-field`).
 *
 * @fires input {InputEvent} Composed, bubbling event dispatched live when the value changes from user interaction.
 * @fires change {Event} Composed, bubbling event dispatched when a scroll gesture settles or direct input commits.
 */
export class ScrollField extends LitElement {
  static formAssociated = true
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
  static styles = [scrollFieldStyles]

  static properties = {
    size: { type: String, reflect: true },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    pad: { type: Number },
    value: { type: String, noAccessor: true },
    options: { type: Array, converter: { fromAttribute: parseOptionsAttribute } },
    loop: { type: Boolean, reflect: true },
    label: { type: String },
    labelPosition: { type: String, attribute: 'label-position', reflect: true },
    suffix: { type: String },
    unit: { type: String },
    name: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readOnly: { type: Boolean, attribute: 'readonly', reflect: true },
    required: { type: Boolean, reflect: true },
    noTextInput: { type: Boolean, attribute: 'no-text-input', reflect: true },
    error: { type: Boolean, reflect: true },
    errorText: { type: String, attribute: 'error-text' },
    supportingText: { type: String, attribute: 'supporting-text' },
    _editing: { state: true },
    _editDraft: { state: true },
    _focused: { state: true },
    _dragging: { state: true },
    _windowCenterSlot: { state: true },
  }

  constructor() {
    super()
    this._internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null
    this._supportsFormInternals = Boolean(this._internals && typeof this._internals.setFormValue === 'function')
    this.size = '1-2'
    this.labelPosition = 'bottom'
    this.min = this.pad = this._windowCenterSlot = this._wheelAccumulator = 0
    this.max = 99
    this.step = 1
    this.options = this._dragPointerId = this._gestureStartValue = this._lastCompositionEndAt = null
    this.label = this.suffix = this.unit = this.name = this.errorText = this.supportingText = this._editDraft = ''
    this.loop = this.disabled = this.readOnly = this.required = this.noTextInput = this.error = false
    this._editing = this._focused = this._dragging = false
    this._onHostKeyDown = this._onHostKeyDown.bind(this)
    this._wheelListener = { handleEvent: (e) => this._onScrollerWheel(e), passive: false }
  }

  get readonly() {
    return this.readOnly
  }
  set readonly(val) {
    this.readOnly = Boolean(val)
  }
  get isDisabled() {
    return Boolean(this.disabled || this._formDisabled)
  }
  get editing() {
    return Boolean(this._editing)
  }
  get normalizedSize() {
    return this.size === '3' || this.size === '4' || this.size === 'auto' ? this.size : '1-2'
  }

  get normalizedOptions() {
    if (!Array.isArray(this.options) || this.options.length === 0) return []
    return this.options.map((entry) => {
      if (entry !== null && typeof entry === 'object') {
        const val = String(entry.value ?? entry.label ?? '')
        const lbl = String(entry.label ?? entry.value ?? '')
        return { value: val, label: lbl, ariaLabel: entry.ariaLabel ? String(entry.ariaLabel) : '' }
      }
      return { value: String(entry), label: String(entry), ariaLabel: '' }
    })
  }

  get isOptionsMode() {
    return this.normalizedOptions.length > 0
  }

  _rangeSpec() {
    const min = Number.isFinite(Number(this.min)) ? Number(this.min) : 0
    const rawMax = Number(this.max)
    const max = Number.isFinite(rawMax) ? Math.max(min, rawMax) : Math.max(min, 99)
    const rawStep = Number(this.step)
    const step = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : 1
    return { min, max, step, decimals: Math.max(countDecimals(min), countDecimals(step)) }
  }

  get itemCount() {
    if (this.isOptionsMode) return this.normalizedOptions.length
    const { min, max, step } = this._rangeSpec()
    return Math.floor((max - min) / step + 1e-9) + 1
  }

  get isLoopActive() {
    return Boolean(this.loop && this.itemCount >= 2)
  }

  get totalSlots() {
    const count = this.itemCount
    return count * (!this.isLoopActive ? 1 : count < 5 ? 5 : 3)
  }

  formatNumeric(num) {
    if (!Number.isFinite(num)) return ''
    const { decimals } = this._rangeSpec()
    const fixed = decimals > 0 ? num.toFixed(decimals) : String(num)
    const padCount = Number.isFinite(this.pad) && this.pad > 0 ? Math.floor(this.pad) : 0
    if (padCount <= 0) return fixed
    const isNeg = num < 0
    const [intPart, decPart] = (isNeg ? fixed.slice(1) : fixed).split('.')
    const padded = intPart.padStart(padCount, '0')
    return `${isNeg ? '-' : ''}${decPart !== undefined ? `${padded}.${decPart}` : padded}`
  }

  valueAtIndex(index) {
    const count = this.itemCount
    if (count <= 0) return ''
    const idx = clampIndex(index, count)
    if (this.isOptionsMode) return this.normalizedOptions[idx]?.value ?? ''
    const { min, step, decimals } = this._rangeSpec()
    return String(Number((min + idx * step).toFixed(decimals)))
  }

  labelAtIndex(index) {
    const count = this.itemCount
    if (count <= 0) return ''
    const idx = clampIndex(index, count)
    return this.isOptionsMode
      ? (this.normalizedOptions[idx]?.label ?? '')
      : this.formatNumeric(Number(this.valueAtIndex(idx)))
  }

  indexForValue(rawVal) {
    const count = this.itemCount
    if (count <= 0 || rawVal === undefined || rawVal === null || rawVal === '') return 0
    const str = String(rawVal).trim()
    if (this.isOptionsMode) {
      const opts = this.normalizedOptions
      const exactIdx = opts.findIndex((o) => o.value === str)
      if (exactIdx !== -1) return exactIdx
      const lower = str.toLowerCase()
      const ciIdx = opts.findIndex((o) => o.value.toLowerCase() === lower || o.label.toLowerCase() === lower)
      return ciIdx !== -1 ? ciIdx : 0
    }
    const num = Number(str)
    if (!Number.isFinite(num)) return 0
    const { min, max, step } = this._rangeSpec()
    return clampIndex(Math.round((Math.min(Math.max(num, min), max) - min) / step), count)
  }

  get selectedIndex() {
    return this.indexForValue(this._rawValue)
  }

  get canonicalSlot() {
    const mid = !this.isLoopActive ? 0 : this.itemCount < 5 ? 2 : 1
    return mid * this.itemCount + this.selectedIndex
  }

  get value() {
    return this._explicitEmpty ? '' : this.valueAtIndex(this.selectedIndex)
  }

  set value(val) {
    const oldVal = this.value
    this._explicitEmpty = val === '' && this.required
    this._rawValue = this._explicitEmpty ? '' : val === null || val === undefined ? undefined : String(val)
    this._syncFormState()
    this.requestUpdate('value', oldVal)
  }

  get valueAsNumber() {
    if (this.isOptionsMode) {
      const parsed = Number(this.value)
      return Number.isFinite(parsed) ? parsed : this.selectedIndex
    }
    return Number(this.value)
  }

  set valueAsNumber(num) {
    if (Number.isFinite(num)) this.value = String(num)
  }

  get formattedValue() {
    return this._explicitEmpty ? '' : this.labelAtIndex(this.selectedIndex)
  }

  get computedAriaValueText() {
    if (this.ariaValueText) return this.ariaValueText
    const formatted = this.formattedValue
    const sfx = this.suffix || this.unit || ''
    const base = this.isOptionsMode ? this.normalizedOptions[this.selectedIndex]?.ariaLabel || formatted : formatted
    return sfx ? `${base} ${sfx}` : base
  }

  get form() {
    return this._internals?.form ?? this.closest?.('form') ?? null
  }
  get labels() {
    return this._internals?.labels ?? null
  }
  get validity() {
    return this._internals?.validity ?? null
  }
  get validationMessage() {
    return this._internals?.validationMessage ?? ''
  }
  get willValidate() {
    return this._internals?.willValidate ?? !this.isDisabled
  }
  checkValidity() {
    return this._internals?.checkValidity ? this._internals.checkValidity() : !(this.required && this._explicitEmpty)
  }
  reportValidity() {
    return this._internals?.reportValidity ? this._internals.reportValidity() : this.checkValidity()
  }

  formDisabledCallback(disabled) {
    this._formDisabled = Boolean(disabled)
    if (this._formDisabled && this._editing) this.cancelEditing({ restoreFocus: false })
    this._syncFormState()
    this.requestUpdate()
  }

  formResetCallback() {
    this._explicitEmpty = false
    this._rawValue = this._initialAttrValue ?? undefined
    this._syncFormState()
    this.requestUpdate()
    if (!isServer) this.updateComplete.then(() => this._syncScrollToSlot(this.canonicalSlot, false))
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string') this.value = state
  }

  connectedCallback() {
    if (!isServer) super.connectedCallback()
    if (this._initialAttrValue === undefined) {
      this._initialAttrValue = this.getAttribute('value')
      if (this._rawValue === undefined && this._initialAttrValue !== null) this._rawValue = this._initialAttrValue
    }
    if (!isServer) this.addEventListener('keydown', this._onHostKeyDown)
    this._syncFormState()
  }

  disconnectedCallback() {
    if (!isServer) {
      super.disconnectedCallback()
      this.removeEventListener('keydown', this._onHostKeyDown)
    }
    clearTimeout(this._programmaticTimer)
    clearTimeout(this._scrollSettleTimer)
    clearTimeout(this._wheelChangeTimer)
    if (this._scrollRafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this._scrollRafId)
      this._scrollRafId = 0
    }
  }

  willUpdate(changed) {
    if (['value', 'min', 'max', 'step', 'options', 'loop'].some((k) => changed.has(k))) {
      const targetSlot = this.canonicalSlot
      if (this.totalSlots > WINDOW_THRESHOLD && Math.abs(targetSlot - this._windowCenterSlot) > WINDOW_RADIUS / 2) {
        this._windowCenterSlot = targetSlot
      } else if (this.totalSlots <= WINDOW_THRESHOLD && this._windowCenterSlot !== 0) {
        this._windowCenterSlot = 0
      }
    }
    if (['value', 'required', 'disabled', 'name', 'error', 'errorText'].some((k) => changed.has(k))) {
      this._syncFormState()
    }
  }

  firstUpdated() {
    if (isServer) return
    this._syncScrollToSlot(this.canonicalSlot, false)
    this._syncFormState()
  }

  updated(changed) {
    if (isServer) return
    if (changed.has('_editing') && this._editing) {
      const input = this.directInputElement
      if (input) {
        input.focus({ preventScroll: true })
        if (this._editSelectAll) input.select()
        else input.setSelectionRange?.(input.value.length, input.value.length)
      }
    }
    if (
      !this._dragging &&
      !this._editing &&
      !this._userScrollActive &&
      ['value', 'min', 'max', 'step', 'options', 'loop'].some((k) => changed.has(k))
    ) {
      this._syncScrollToSlot(this.canonicalSlot, false)
    }
  }

  get scrollerElement() {
    return this.renderRoot?.querySelector('.scroller') ?? null
  }
  get spinbuttonElement() {
    return this.renderRoot?.querySelector('.spinbutton') ?? null
  }
  get directInputElement() {
    return this.renderRoot?.querySelector('.direct-input') ?? null
  }

  _getItemHeight() {
    const scroller = this.scrollerElement
    if (!scroller || typeof getComputedStyle !== 'function') return 48
    const firstItem = scroller.querySelector('.wheel-item')
    if (firstItem && firstItem.offsetHeight > 0) return firstItem.offsetHeight
    const parsed = parseFloat(getComputedStyle(this).getPropertyValue('--_item-height'))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 48
  }

  _syncFormState() {
    if (!this._supportsFormInternals) return
    if (this.isDisabled) {
      this._internals.setFormValue(null)
      this._internals.setValidity({})
      return
    }
    const val = this.value
    this._internals.setFormValue(val)
    if (this.required && (this._explicitEmpty || val === '')) {
      this._internals.setValidity(
        { valueMissing: true },
        this.errorText || 'Please select a value.',
        this.spinbuttonElement || undefined,
      )
    } else {
      this._internals.setValidity({})
    }
  }

  _syncScrollToSlot(slot, smooth = false) {
    const scroller = this.scrollerElement
    if (!scroller) return
    const targetTop = Math.max(0, slot * this._getItemHeight())
    if (this.totalSlots > WINDOW_THRESHOLD && Math.abs(slot - this._windowCenterSlot) > WINDOW_RADIUS / 2) {
      this._windowCenterSlot = slot
    }
    this._programmaticScroll = true
    clearTimeout(this._programmaticTimer)

    if (smooth && !prefersReducedMotion() && typeof scroller.scrollTo === 'function') {
      scroller.scrollTo({ top: targetTop, behavior: 'smooth' })
      this._programmaticTimer = setTimeout(() => {
        this._programmaticScroll = false
        this._recenterLoopIfNeeded()
      }, 260)
    } else {
      const prevBehavior = scroller.style.scrollBehavior
      scroller.style.scrollBehavior = 'auto'
      scroller.scrollTop = targetTop
      scroller.style.scrollBehavior = prevBehavior
      this._programmaticTimer = setTimeout(() => {
        this._programmaticScroll = false
      }, 32)
    }
  }

  _recenterLoopIfNeeded() {
    if (!this.isLoopActive || this._dragging || this._editing) return
    const scroller = this.scrollerElement
    if (!scroller) return
    const itemHeight = this._getItemHeight()
    const count = this.itemCount
    if (count * itemHeight <= 0) return

    const repeats = this.totalSlots / count
    const currentSlotFloat = scroller.scrollTop / itemHeight
    if (currentSlotFloat < count * 0.5 || currentSlotFloat >= (repeats - 0.5) * count) {
      const roundedSlot = Math.round(currentSlotFloat)
      const subPixelOffset = scroller.scrollTop - roundedSlot * itemHeight
      const mid = count < 5 ? 2 : 1
      const canonical = mid * count + wrapIndex(roundedSlot, count)

      this._isRecentering = true
      if (this.totalSlots > WINDOW_THRESHOLD) this._windowCenterSlot = canonical
      const prevBehavior = scroller.style.scrollBehavior
      scroller.style.scrollBehavior = 'auto'
      scroller.scrollTop = canonical * itemHeight + subPixelOffset
      scroller.style.scrollBehavior = prevBehavior
      const clear = () => (this._isRecentering = false)
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(clear)
      else setTimeout(clear, 0)
    }
  }

  _emit(type) {
    const Ctor = type === 'input' && typeof InputEvent === 'function' ? InputEvent : Event
    this.dispatchEvent(new Ctor(type, { bubbles: true, composed: true }))
  }

  stepBy(deltaSteps, { emitEvents = false, commitChange = false, animate = true } = {}) {
    const count = this.itemCount
    if (count <= 0 || !Number.isFinite(deltaSteps) || deltaSteps === 0) return false
    const curIdx = this.selectedIndex
    const nextIdx = this.isLoopActive ? wrapIndex(curIdx + deltaSteps, count) : clampIndex(curIdx + deltaSteps, count)
    if (nextIdx === curIdx && !this._explicitEmpty) return false

    const baseSlot = this.canonicalSlot
    const visualSlot =
      this.isLoopActive && Math.abs(deltaSteps) <= count ? baseSlot + deltaSteps : baseSlot - curIdx + nextIdx

    this._explicitEmpty = false
    this._rawValue = this.valueAtIndex(nextIdx)
    this._syncFormState()
    this.requestUpdate()
    this._syncScrollToSlot(visualSlot, animate)
    if (emitEvents) {
      this._emit('input')
      if (commitChange) this._emit('change')
    }
    return true
  }

  stepUp(n = 1) {
    this.stepBy(Number.isFinite(Number(n)) ? Math.trunc(Number(n)) : 1, { animate: false })
  }
  stepDown(n = 1) {
    this.stepBy(-(Number.isFinite(Number(n)) ? Math.trunc(Number(n)) : 1), { animate: false })
  }

  startEditing(initialText = null) {
    if (this.isDisabled || this.readOnly || this.noTextInput || this.itemCount <= 0) return false
    if (this._editing) return true
    this._editCancel = false
    this._editCommitting = false
    this._editDraft = initialText !== null && initialText !== undefined ? String(initialText) : this.formattedValue
    this._editSelectAll = initialText === null || initialText === undefined
    this._editing = true
    return true
  }

  commitEditing({ restoreFocus = false } = {}) {
    if (!this._editing || this._editCommitting) return false
    this._editCommitting = true
    const raw = String(this._editDraft ?? '').trim()
    const prevValue = this.value
    const prevEmpty = this._explicitEmpty
    let nextIdx = null

    if (raw !== '') {
      if (this.isOptionsMode) {
        const opts = this.normalizedOptions
        const lower = raw.toLowerCase()
        let match = opts.findIndex((o) => o.label.toLowerCase() === lower || o.value.toLowerCase() === lower)
        if (match === -1) {
          match = opts.findIndex(
            (o) => o.label.toLowerCase().startsWith(lower) || o.value.toLowerCase().startsWith(lower),
          )
        }
        if (match !== -1) nextIdx = match
      } else if (Number.isFinite(Number(raw))) {
        const { min, max, step } = this._rangeSpec()
        nextIdx = clampIndex(Math.round((Math.min(Math.max(Number(raw), min), max) - min) / step), this.itemCount)
      }
    }

    this._editing = false
    this._editCommitting = false
    let changed = false
    if (nextIdx !== null) {
      this._explicitEmpty = false
      this._rawValue = this.valueAtIndex(nextIdx)
      changed = prevEmpty || this._rawValue !== prevValue
      this._syncFormState()
      this._syncScrollToSlot(this.canonicalSlot, false)
    }
    if (restoreFocus && !isServer)
      this.updateComplete.then(() => this.spinbuttonElement?.focus({ preventScroll: true }))
    if (changed) {
      this._emit('input')
      this._emit('change')
    }
    return changed
  }

  cancelEditing({ restoreFocus = false } = {}) {
    if (!this._editing) return
    this._editCancel = true
    this._editing = false
    this._editDraft = this.formattedValue
    if (restoreFocus && !isServer)
      this.updateComplete.then(() => this.spinbuttonElement?.focus({ preventScroll: true }))
  }

  _applySlotFromUserScroll(slot, settled = false) {
    if (this.itemCount <= 0 || this.isDisabled || this.readOnly) return
    const nextIdx = this.isLoopActive ? wrapIndex(slot, this.itemCount) : clampIndex(slot, this.itemCount)
    const nextVal = this.valueAtIndex(nextIdx)
    if (this._gestureStartValue === null) this._gestureStartValue = this.value

    if (this._explicitEmpty || nextVal !== this.value) {
      this._explicitEmpty = false
      this._rawValue = nextVal
      this._syncFormState()
      this.requestUpdate()
      this._emit('input')
    }
    if (this.totalSlots > WINDOW_THRESHOLD && Math.abs(slot - this._windowCenterSlot) > WINDOW_RADIUS / 2) {
      this._windowCenterSlot = slot
    }
    if (settled) {
      const startVal = this._gestureStartValue
      this._gestureStartValue = null
      this._userScrollActive = false
      this._recenterLoopIfNeeded()
      if (startVal !== null && startVal !== this.value) this._emit('change')
    }
  }

  _closestSlot() {
    const scroller = this.scrollerElement
    return scroller
      ? clampIndex(Math.round(scroller.scrollTop / this._getItemHeight()), this.totalSlots)
      : this.canonicalSlot
  }

  _onSnapEvent(event, settled) {
    if (this._programmaticScroll || this._isRecentering || this._editing) return
    if (this.isDisabled || this.readOnly) {
      if (settled) this._syncScrollToSlot(this.canonicalSlot, false)
      return
    }
    const slot = Number(event.snapTargetBlock?.dataset?.slot)
    if (Number.isFinite(slot)) {
      if (settled) clearTimeout(this._scrollSettleTimer)
      else this._userScrollActive = true
      this._applySlotFromUserScroll(slot, settled)
    }
  }

  _onScrollerScroll() {
    if (this._programmaticScroll || this._isRecentering || this._editing) return
    if (this.isDisabled || this.readOnly) return this._syncScrollToSlot(this.canonicalSlot, false)
    this._userScrollActive = true
    const updateFromScroll = () => {
      this._scrollRafId = 0
      if (this._programmaticScroll || this._isRecentering || this._editing) return
      if (!this._dragging) this._recenterLoopIfNeeded()
      this._applySlotFromUserScroll(this._closestSlot(), false)
    }
    if (typeof requestAnimationFrame === 'function') {
      if (!this._scrollRafId) this._scrollRafId = requestAnimationFrame(updateFromScroll)
    } else {
      updateFromScroll()
    }
    if (!this._dragging) {
      clearTimeout(this._scrollSettleTimer)
      this._scrollSettleTimer = setTimeout(() => this._applySlotFromUserScroll(this._closestSlot(), true), 120)
    }
  }

  _onScrollEnd() {
    if (this._programmaticScroll || this._isRecentering || this._editing || this._dragging) return
    clearTimeout(this._scrollSettleTimer)
    this._applySlotFromUserScroll(this._closestSlot(), true)
  }

  _onScrollerWheel(event) {
    if (this.isDisabled || this.readOnly || this._editing || this.itemCount <= 0) return
    const itemHeight = this._getItemHeight()
    const deltaPx = event.deltaY * (event.deltaMode === 1 ? itemHeight : event.deltaMode === 2 ? itemHeight * 3 : 1)
    if (deltaPx === 0) return
    if (event.cancelable) event.preventDefault()

    let steps = 0
    if (event.isTrusted === false) {
      steps = Math.sign(deltaPx) * Math.max(1, Math.round(Math.abs(deltaPx) / itemHeight))
    } else {
      this._wheelAccumulator += deltaPx
      if (Math.abs(this._wheelAccumulator) >= 28) {
        steps = Math.trunc(this._wheelAccumulator / 28)
        this._wheelAccumulator -= steps * 28
      }
    }

    if (steps !== 0 && this.stepBy(steps, { emitEvents: true, commitChange: false, animate: true })) {
      clearTimeout(this._wheelChangeTimer)
      if (event.isTrusted === false) this._emit('change')
      else {
        this._wheelChangeTimer = setTimeout(() => {
          this._wheelAccumulator = 0
          this._emit('change')
        }, 180)
      }
    }
  }

  _onPointerDown(event) {
    if (this.isDisabled || this.readOnly || this._editing) return
    this._dragMoved = false
    this._dragStartY = event.clientY
    const scroller = this.scrollerElement
    if (event.pointerType !== 'mouse' || event.button !== 0 || !scroller) return
    this._dragPointerId = event.pointerId
    this._dragStartScrollTop = scroller.scrollTop
    this._gestureStartValue = this.value
  }

  _onPointerMove(event) {
    if (this._dragPointerId === null || event.pointerId !== this._dragPointerId) return
    const scroller = this.scrollerElement
    if (!scroller) return
    const dy = event.clientY - this._dragStartY
    if (!this._dragMoved && Math.abs(dy) > 5) {
      this._dragMoved = true
      this._dragging = true
      scroller.setPointerCapture?.(event.pointerId)
    }
    if (!this._dragging) return

    let nextTop = this._dragStartScrollTop - dy
    if (this.isLoopActive) {
      const cyclePx = this.itemCount * this._getItemHeight()
      const repeats = this.totalSlots / this.itemCount
      if (nextTop < cyclePx * 0.5) {
        nextTop += cyclePx
        this._dragStartScrollTop += cyclePx
      } else if (nextTop >= cyclePx * (repeats - 0.5)) {
        nextTop -= cyclePx
        this._dragStartScrollTop -= cyclePx
      }
    }
    scroller.scrollTop = Math.max(0, nextTop)
    this._applySlotFromUserScroll(this._closestSlot(), false)
  }

  _onPointerUp(event) {
    if (this._dragPointerId === null || event.pointerId !== this._dragPointerId) return
    const scroller = this.scrollerElement
    const wasDragging = this._dragging
    if (scroller && wasDragging) scroller.releasePointerCapture?.(event.pointerId)
    this._dragPointerId = null
    this._dragging = false
    if (wasDragging) {
      const slot = this._closestSlot()
      this._syncScrollToSlot(slot, true)
      this._applySlotFromUserScroll(slot, true)
      setTimeout(() => (this._dragMoved = false), 0)
    }
  }

  _onItemClick(event, slot, itemIndex) {
    if (this.isDisabled || this._editing) return
    if (this._dragMoved) {
      this._dragMoved = false
      return
    }
    const curSlot = this.canonicalSlot
    const curIdx = this.selectedIndex
    if (slot === curSlot || itemIndex === curIdx) {
      if (!this.readOnly && !this.noTextInput) {
        event.stopPropagation()
        this.startEditing(null)
      }
      return
    }
    if (this.readOnly) return
    const delta = slot - curSlot
    this.stepBy(delta !== 0 && Math.abs(delta) <= this.itemCount ? delta : itemIndex - curIdx, {
      emitEvents: true,
      commitChange: true,
      animate: true,
    })
  }

  _jumpToIndex(idx) {
    if (idx === this.selectedIndex && !this._explicitEmpty) return
    this._explicitEmpty = false
    this._rawValue = this.valueAtIndex(idx)
    this._syncFormState()
    this.requestUpdate()
    this._syncScrollToSlot(this.canonicalSlot, true)
    this._emit('input')
    this._emit('change')
  }

  _onHostKeyDown(event) {
    if (event[HANDLED_KEY] || this.isDisabled || this._editing) return
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [event.target]
    if (path.some((node) => node?.classList?.contains?.('direct-input'))) return
    event[HANDLED_KEY] = true
    if (this.readOnly) return

    const keySteps = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }
    if (event.key in keySteps) {
      event.preventDefault()
      return void this.stepBy(keySteps[event.key], { emitEvents: true, commitChange: true, animate: true })
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      return void this._jumpToIndex(event.key === 'Home' ? 0 : Math.max(0, this.itemCount - 1))
    }
    if (event.key === 'Enter' || event.key === 'F2') {
      if (!this.noTextInput) {
        event.preventDefault()
        this.startEditing(null)
      }
      return
    }
    if (!this.noTextInput && !event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
      if (/^[0-9.-]$/.test(event.key) || (this.isOptionsMode && /^\S$/.test(event.key))) {
        event.preventDefault()
        this.startEditing(event.key)
      }
    }
  }

  _onDirectInput(event) {
    this._editDraft = event.target.value
  }
  _onDirectBlur() {
    if (this._editing && !this._editCancel && !this._editCommitting) this.commitEditing({ restoreFocus: false })
  }

  _onDirectKeyDown(event) {
    event.stopPropagation()
    if (event.key === 'Enter') {
      event.preventDefault()
      if (event.isComposing || event.keyCode === 229) return
      if (this._lastCompositionEndAt !== null && Math.abs(event.timeStamp - this._lastCompositionEndAt) < 50) return
      this.commitEditing({ restoreFocus: true })
    } else if (event.key === 'Escape') {
      event.preventDefault()
      this.cancelEditing({ restoreFocus: true })
    }
  }

  _windowBounds() {
    const total = this.totalSlots
    if (total <= WINDOW_THRESHOLD) return { useWindow: false, winStart: 0, winEnd: Math.max(0, total - 1), total }
    return {
      useWindow: true,
      winStart: Math.max(0, this._windowCenterSlot - WINDOW_RADIUS),
      winEnd: Math.min(total - 1, this._windowCenterSlot + WINDOW_RADIUS),
      total,
    }
  }

  _renderWheelItems(bounds = this._windowBounds()) {
    const count = this.itemCount
    if (count <= 0) return nothing
    const { winStart, winEnd } = bounds
    const selectedIdx = this.selectedIndex
    const sfx = this.suffix || this.unit || ''
    const items = []
    for (let slot = winStart; slot <= winEnd; slot++) {
      const idx = slot % count
      const isSelected = !this._explicitEmpty && idx === selectedIdx
      items.push(html`
        <div
          class="wheel-item ${isSelected ? 'selected' : ''}"
          part="item ${isSelected ? 'selected-item' : ''}"
          data-slot="${slot}"
          data-index="${idx}"
          aria-hidden="true"
          @click=${(e) => this._onItemClick(e, slot, idx)}>
          <span class="item-text">${this.labelAtIndex(idx)}</span>
          ${sfx ? html`<span class="item-suffix">${sfx}</span>` : nothing}
        </div>
      `)
    }
    return items
  }

  render() {
    const bounds = this._windowBounds()
    const scrollerStyles = bounds.useWindow
      ? {
          paddingTop: `calc(var(--_item-height) * ${1 + bounds.winStart})`,
          paddingBottom: `calc(var(--_item-height) * ${1 + Math.max(0, bounds.total - 1 - bounds.winEnd)})`,
        }
      : {}
    const rootClasses = {
      focused: Boolean(this._focused),
      editing: Boolean(this._editing),
      disabled: this.isDisabled,
      readonly: this.readOnly,
      error: this.error,
    }
    const { min, max, decimals } = this._rangeSpec()
    const ariaNow = this.isOptionsMode ? this.selectedIndex : this.valueAsNumber
    const ariaLabel = this.ariaLabel || this.label || 'Scroll field'
    const sfx = this.suffix || this.unit || ''
    const captionText = this.error && this.errorText ? this.errorText : this.label || this.supportingText
    const captionEl = captionText ? html`<div class="caption" part="label">${captionText}</div>` : nothing
    const labelTop = this.labelPosition === 'top'
    const inputMode = this.isOptionsMode ? 'text' : decimals > 0 ? 'decimal' : 'numeric'
    const editorEl = this._editing
      ? html`<div class="editor-overlay" part="editor">
          <input
            class="direct-input"
            part="input"
            type="text"
            inputmode="${inputMode}"
            aria-label="Edit ${ariaLabel}"
            .value=${this._editDraft}
            @input=${this._onDirectInput}
            @compositionend=${(e) => (this._lastCompositionEndAt = e.timeStamp)}
            @keydown=${this._onDirectKeyDown}
            @blur=${this._onDirectBlur} />
          ${sfx ? html`<span class="editor-suffix">${sfx}</span>` : nothing}
        </div>`
      : nothing

    return html`
      <div
        class="root ${classMap(rootClasses)}"
        @focusin=${() => (this._focused = true)}
        @focusout=${(e) => {
          if (!e.relatedTarget || !this.renderRoot?.contains?.(e.relatedTarget)) this._focused = false
        }}>
        ${labelTop ? captionEl : nothing}
        <div
          id="spinbutton"
          class="spinbutton"
          part="spinbutton"
          role="spinbutton"
          tabindex="${this.isDisabled || this._editing ? -1 : 0}"
          aria-label="${ariaLabel}"
          aria-valuenow="${String(Number.isFinite(ariaNow) ? ariaNow : 0)}"
          aria-valuemin="${String(this.isOptionsMode ? 0 : min)}"
          aria-valuemax="${String(this.isOptionsMode ? Math.max(0, this.itemCount - 1) : max)}"
          aria-valuetext="${this.computedAriaValueText}"
          aria-disabled="${this.isDisabled ? 'true' : 'false'}"
          aria-readonly="${this.readOnly ? 'true' : 'false'}"
          aria-invalid=${this.error ? 'true' : this.ariaInvalid || nothing}
          aria-required=${this.required ? 'true' : nothing}>
          <div class="selection-indicator" part="indicator"></div>
          <div
            class="scroller ${this._dragging ? 'dragging' : ''}"
            part="scroller"
            style=${styleMap(scrollerStyles)}
            @wheel=${this._wheelListener}
            @scroll=${this._onScrollerScroll}
            @scrollend=${this._onScrollEnd}
            @scrollsnapchanging=${(e) => this._onSnapEvent(e, false)}
            @scrollsnapchange=${(e) => this._onSnapEvent(e, true)}
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._onPointerUp}
            @pointercancel=${this._onPointerUp}>
            ${this._renderWheelItems(bounds)}
          </div>
          ${editorEl}
        </div>
        ${!labelTop ? captionEl : nothing}
        ${
          !this._supportsFormInternals && this.name && !this.isDisabled
            ? html`<input
                class="fallback-input"
                tabindex="-1"
                aria-hidden="true"
                name="${this.name}"
                .value=${this.value} />`
            : nothing
        }
      </div>
    `
  }
}

export class ScrollFieldGroup extends LitElement {
  static styles = [scrollFieldGroupStyles]
  static properties = {
    label: { type: String },
    plain: { type: Boolean, reflect: true },
  }

  constructor() {
    super()
    this.label = ''
    this.plain = false
  }

  render() {
    const ariaLabel = this.ariaLabel || this.label || nothing
    return html`
      ${this.label ? html`<div class="group-header" part="header">${this.label}</div>` : nothing}
      <div class="group-row" part="group" role="group" aria-label=${ariaLabel}>
        <slot></slot>
      </div>
    `
  }
}

;(() => {
  requestUpdateOnAriaChange(ScrollField)
  requestUpdateOnAriaChange(ScrollFieldGroup)
})()

if (!customElements.get('md-scroll-field')) customElements.define('md-scroll-field', ScrollField)
if (!customElements.get('md-scroll-field-group')) customElements.define('md-scroll-field-group', ScrollFieldGroup)
