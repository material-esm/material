/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { html, isServer, LitElement, nothing, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { when } from 'lit/directives/when.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { dispatchActivationClick, isActivationClick } from '../internal/events/form-label-activation.js'
import { redispatchEvent } from '../internal/events/redispatch-event.js'
import { mixinElementInternals } from '../labs/behaviors/element-internals.js'
import { getFormValue, mixinFormAssociated } from '../labs/behaviors/form-associated.js'
// Disable warning for classMap with destructuring
// tslint:disable:no-implicit-dictionary-conversion
// Separate variable needed for closure.
const sliderBaseClass = mixinFormAssociated(mixinElementInternals(LitElement))
/**
 * Slider component.
 *
 *
 * @fires change {Event} The native `change` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)
 * --bubbles
 * @fires input {InputEvent} The native `input` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event)
 * --bubbles --composed
 */
export class Slider extends sliderBaseClass {
  static properties = {
    /**
     * The slider minimum value
     */
    min: { type: Number },
    /**
     * The slider maximum value
     */
    max: { type: Number },
    value: { type: Number },
    valueStart: { type: Number, attribute: 'value-start' },
    valueEnd: { type: Number, attribute: 'value-end' },
    valueLabel: { type: String, attribute: 'value-label' },
    valueLabelStart: { type: String, attribute: 'value-label-start' },
    valueLabelEnd: { type: String, attribute: 'value-label-end' },
    ariaLabelStart: { type: String, attribute: 'aria-label-start' },
    ariaValueTextStart: { type: String, attribute: 'aria-valuetext-start' },
    ariaLabelEnd: { type: String, attribute: 'aria-label-end' },
    ariaValueTextEnd: { type: String, attribute: 'aria-valuetext-end' },
    step: { type: Number },
    ticks: { type: Boolean },
    labeled: { type: Boolean },
    range: { type: Boolean },
  }
  /**
   * The HTML name to use in form submission for a range slider's starting
   * value. Use `name` instead if both the start and end values should use the
   * same name.
   */
  get nameStart() {
    return this.getAttribute('name-start') ?? this.name
  }
  set nameStart(name) {
    this.setAttribute('name-start', name)
  }
  /**
   * The HTML name to use in form submission for a range slider's ending value.
   * Use `name` instead if both the start and end values should use the same
   * name.
   */
  get nameEnd() {
    return this.getAttribute('name-end') ?? this.nameStart
  }
  set nameEnd(name) {
    this.setAttribute('name-end', name)
  }

  get inputStart() {
    return this.renderRoot?.querySelector('input.start')
  }
  get handleStart() {
    return this.renderRoot?.querySelector('.handle.start')
  }
  get inputEnd() {
    return this.renderRoot?.querySelector('input.end')
  }
  get handleEnd() {
    return this.renderRoot?.querySelector('.handle.end')
  }
  get rippleStart() {
    return queryAsync(this, 'md-ripple.start')
  }
  get rippleEnd() {
    return queryAsync(this, 'md-ripple.end')
  }

  // Note: start aria-* properties are only applied when range=true, which is
  // why they do not need to handle both cases.
  get renderAriaLabelStart() {
    // Needed for closure conformance
    const { ariaLabel } = this
    return this.ariaLabelStart || (ariaLabel && `${ariaLabel} start`) || this.valueLabelStart || String(this.valueStart)
  }
  get renderAriaValueTextStart() {
    return this.ariaValueTextStart || this.valueLabelStart || String(this.valueStart)
  }
  // Note: end aria-* properties are applied for single and range sliders, which
  // is why it needs to handle `this.range` (while start aria-* properties do
  // not).
  get renderAriaLabelEnd() {
    // Needed for closure conformance
    const { ariaLabel } = this
    if (this.range) {
      return this.ariaLabelEnd || (ariaLabel && `${ariaLabel} end`) || this.valueLabelEnd || String(this.valueEnd)
    }
    return ariaLabel || this.valueLabel || String(this.value)
  }
  get renderAriaValueTextEnd() {
    if (this.range) {
      return this.ariaValueTextEnd || this.valueLabelEnd || String(this.valueEnd)
    }
    // Needed for conformance
    const { ariaValueText } = this
    return ariaValueText || this.valueLabel || String(this.value)
  }
  constructor() {
    super()
    /**
     * The slider minimum value
     */
    this.min = 0
    /**
     * The slider maximum value
     */
    this.max = 100
    /**
     * An optional label for the slider's value displayed when range is
     * false; if not set, the label is the value itself.
     */
    this.valueLabel = ''
    /**
     * An optional label for the slider's start value displayed when
     * range is true; if not set, the label is the valueStart itself.
     */
    this.valueLabelStart = ''
    /**
     * An optional label for the slider's end value displayed when
     * range is true; if not set, the label is the valueEnd itself.
     */
    this.valueLabelEnd = ''
    /**
     * Aria label for the slider's start handle displayed when
     * range is true.
     */
    this.ariaLabelStart = ''
    /**
     * Aria value text for the slider's start value displayed when
     * range is true.
     */
    this.ariaValueTextStart = ''
    /**
     * Aria label for the slider's end handle displayed when
     * range is true.
     */
    this.ariaLabelEnd = ''
    /**
     * Aria value text for the slider's end value displayed when
     * range is true.
     */
    this.ariaValueTextEnd = ''
    /**
     * The step between values.
     */
    this.step = 1
    /**
     * Whether or not to show tick marks.
     */
    this.ticks = false
    /**
     * Whether or not to show a value label when activated.
     */
    this.labeled = false
    /**
     * Whether or not to show a value range. When false, the slider displays
     * a slideable handle for the value property; when true, it displays
     * slideable handles for the valueStart and valueEnd properties.
     */
    this.range = false
    // handle hover/pressed states are set manually since the handle
    // does not receive pointer events so that the native inputs are
    // interaction targets.
    this.handleStartHover = false
    this.handleEndHover = false
    this.startOnTop = false
    this.handlesOverlapping = false
    // used in synthetic events generated to control ripple hover state.
    this.ripplePointerId = 1
    // flag to prevent processing of re-dispatched input event.
    this.isRedispatchingEvent = false
    if (!isServer) {
      this.addEventListener('click', (event) => {
        if (!isActivationClick(event) || !this.inputEnd) {
          return
        }
        this.focus()
        dispatchActivationClick(this.inputEnd)
      })
    }
  }
  focus() {
    this.inputEnd?.focus()
  }
  willUpdate(changed) {
    this.renderValueStart = changed.has('valueStart') ? this.valueStart : this.inputStart?.valueAsNumber
    const endValueChanged = (changed.has('valueEnd') && this.range) || changed.has('value')
    this.renderValueEnd = endValueChanged ? (this.range ? this.valueEnd : this.value) : this.inputEnd?.valueAsNumber
    // manually handle ripple hover state since the handle is pointer events
    // none.
    if (changed.get('handleStartHover') !== undefined) {
      this.toggleRippleHover(this.rippleStart, this.handleStartHover)
    } else if (changed.get('handleEndHover') !== undefined) {
      this.toggleRippleHover(this.rippleEnd, this.handleEndHover)
    }
  }
  updated(changed) {
    // Validate input rendered value and re-render if necessary. This ensures
    // the rendred handle stays in sync with the input thumb which is used for
    // interaction. These can get out of sync if a supplied value does not
    // map to an exactly stepped value between min and max.
    if (this.range) {
      this.renderValueStart = this.inputStart.valueAsNumber
    }
    this.renderValueEnd = this.inputEnd.valueAsNumber
    // update values if they are unset
    // when using a range, default to equi-distant between
    // min - valueStart - valueEnd - max
    if (this.range) {
      const segment = (this.max - this.min) / 3
      if (this.valueStart === undefined) {
        this.inputStart.valueAsNumber = this.min + segment
        // read actual value from input
        const v = this.inputStart.valueAsNumber
        this.valueStart = this.renderValueStart = v
      }
      if (this.valueEnd === undefined) {
        this.inputEnd.valueAsNumber = this.min + 2 * segment
        // read actual value from input
        const v = this.inputEnd.valueAsNumber
        this.valueEnd = this.renderValueEnd = v
      }
    } else {
      this.value ?? (this.value = this.renderValueEnd)
    }
    if (
      changed.has('range') ||
      changed.has('renderValueStart') ||
      changed.has('renderValueEnd') ||
      this.isUpdatePending
    ) {
      // Only check if the handle nubs are overlapping, as the ripple touch
      // target extends subtantially beyond the boundary of the handle nub.
      const startNub = this.handleStart?.querySelector('.handleNub')
      const endNub = this.handleEnd?.querySelector('.handleNub')
      this.handlesOverlapping = isOverlapping(startNub, endNub)
    }
    // called to finish the update imediately;
    // note, this is a no-op unless an update is scheduled
    this.performUpdate()
  }
  render() {
    const step = this.step === 0 ? 1 : this.step
    const range = Math.max(this.max - this.min, step)
    const startFraction = this.range ? ((this.renderValueStart ?? this.min) - this.min) / range : 0
    const endFraction = ((this.renderValueEnd ?? this.min) - this.min) / range
    const containerStyles = {
      // for clipping inputs and active track.
      '--_start-fraction': String(startFraction),
      '--_end-fraction': String(endFraction),
      // for generating tick marks
      '--_tick-count': String(range / step),
    }
    const containerClasses = { ranged: this.range }
    // optional label values to show in place of the value.
    const labelStart = this.valueLabelStart || String(this.renderValueStart)
    const labelEnd = (this.range ? this.valueLabelEnd : this.valueLabel) || String(this.renderValueEnd)
    const inputStartProps = {
      start: true,
      value: this.renderValueStart,
      ariaLabel: this.renderAriaLabelStart,
      ariaValueText: this.renderAriaValueTextStart,
      ariaMin: this.min,
      ariaMax: this.valueEnd ?? this.max,
    }
    const inputEndProps = {
      start: false,
      value: this.renderValueEnd,
      ariaLabel: this.renderAriaLabelEnd,
      ariaValueText: this.renderAriaValueTextEnd,
      ariaMin: this.range ? (this.valueStart ?? this.min) : this.min,
      ariaMax: this.max,
    }
    const handleStartProps = {
      start: true,
      hover: this.handleStartHover,
      label: labelStart,
    }
    const handleEndProps = {
      start: false,
      hover: this.handleEndHover,
      label: labelEnd,
    }
    const handleContainerClasses = {
      hover: this.handleStartHover || this.handleEndHover,
    }
    return html` <div class="container ${classMap(containerClasses)}" style=${styleMap(containerStyles)}>
      ${when(this.range, () => this.renderInput(inputStartProps))} ${this.renderInput(inputEndProps)}
      ${this.renderTrack()}
      <div class="handleContainerPadded">
        <div class="handleContainerBlock">
          <div class="handleContainer ${classMap(handleContainerClasses)}">
            ${when(this.range, () => this.renderHandle(handleStartProps))} ${this.renderHandle(handleEndProps)}
          </div>
        </div>
      </div>
    </div>`
  }
  renderTrack() {
    return html`
      <div class="track"></div>
      ${this.ticks ? html`<div class="tickmarks"></div>` : nothing}
    `
  }
  renderLabel(value) {
    return html`<div class="label" aria-hidden="true">
      <span class="labelContent" part="label">${value}</span>
    </div>`
  }
  renderHandle({ start, hover, label }) {
    const onTop = !this.disabled && start === this.startOnTop
    const isOverlapping = !this.disabled && this.handlesOverlapping
    const name = start ? 'start' : 'end'
    return html`<div
      class="handle ${classMap({
        [name]: true,
        hover,
        onTop,
        isOverlapping,
      })}">
      <md-focus-ring part="focus-ring" for=${name}></md-focus-ring>
      <md-ripple for=${name} class=${name} ?disabled=${this.disabled}></md-ripple>
      <div class="handleNub">
        <md-elevation part="elevation"></md-elevation>
      </div>
      ${when(this.labeled, () => this.renderLabel(label))}
    </div>`
  }
  renderInput({ start, value, ariaLabel, ariaValueText, ariaMin, ariaMax }) {
    // Slider requires min/max set to the overall min/max for both inputs.
    // This is reported to screen readers, which is why we need aria-valuemin
    // and aria-valuemax.
    const name = start ? `start` : `end`
    return html`<input
      type="range"
      class="${classMap({
        start,
        end: !start,
      })}"
      @focus=${this.handleFocus}
      @pointerdown=${this.handleDown}
      @pointerup=${this.handleUp}
      @pointerenter=${this.handleEnter}
      @pointermove=${this.handleMove}
      @pointerleave=${this.handleLeave}
      @keydown=${this.handleKeydown}
      @keyup=${this.handleKeyup}
      @input=${this.handleInput}
      @change=${this.handleChange}
      id=${name}
      .disabled=${this.disabled}
      .min=${String(this.min)}
      aria-valuemin=${ariaMin}
      .max=${String(this.max)}
      aria-valuemax=${ariaMax}
      .step=${String(this.step)}
      .value=${String(value)}
      .tabIndex=${start ? 1 : 0}
      aria-label=${ariaLabel || nothing}
      aria-valuetext=${ariaValueText} />`
  }
  async toggleRippleHover(ripple, hovering) {
    const rippleEl = await ripple
    if (!rippleEl) {
      return
    }
    // TODO(b/269799771): improve slider ripple connection
    if (hovering) {
      rippleEl.handlePointerenter(
        new PointerEvent('pointerenter', {
          isPrimary: true,
          pointerId: this.ripplePointerId,
        }),
      )
    } else {
      rippleEl.handlePointerleave(
        new PointerEvent('pointerleave', {
          isPrimary: true,
          pointerId: this.ripplePointerId,
        }),
      )
    }
  }
  handleFocus(event) {
    this.updateOnTop(event.target)
  }
  startAction(event) {
    const target = event.target
    const fixed = target === this.inputStart ? this.inputEnd : this.inputStart
    this.action = {
      canFlip: event.type === 'pointerdown',
      flipped: false,
      target,
      fixed,
      values: new Map([
        [target, target.valueAsNumber],
        [fixed, fixed?.valueAsNumber],
      ]),
    }
  }
  finishAction(event) {
    this.action = undefined
  }
  handleKeydown(event) {
    this.startAction(event)
  }
  handleKeyup(event) {
    this.finishAction(event)
  }
  handleDown(event) {
    this.startAction(event)
    this.ripplePointerId = event.pointerId
    const isStart = event.target === this.inputStart
    // Since handle moves to pointer on down and there may not be a move,
    // it needs to be considered hovered..
    this.handleStartHover = !this.disabled && isStart && Boolean(this.handleStart)
    this.handleEndHover = !this.disabled && !isStart && Boolean(this.handleEnd)
  }
  async handleUp(event) {
    if (!this.action) {
      return
    }
    const { target, values, flipped } = this.action
    //  Async here for Firefox because input can be after pointerup
    //  when value is calmped.
    await new Promise(requestAnimationFrame)
    if (target !== undefined) {
      // Ensure Safari focuses input so label renders.
      // Ensure any flipped input is focused so the tab order is right.
      target.focus()
      // When action is flipped, change must be fired manually since the
      // real event target did not change.
      if (flipped && target.valueAsNumber !== values.get(target)) {
        target.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
    this.finishAction(event)
  }
  /**
   * The move handler tracks handle hovering to facilitate proper ripple
   * behavior on the slider handle. This is needed because user interaction with
   * the native input is leveraged to position the handle. Because the separate
   * displayed handle element has pointer events disabled (to allow interaction
   * with the input) and the input's handle is a pseudo-element, neither can be
   * the ripple's interactive element. Therefore the input is the ripple's
   * interactive element and has a `ripple` directive; however the ripple
   * is gated on the handle being hovered. In addition, because the ripple
   * hover state is being specially handled, it must be triggered independent
   * of the directive. This is done based on the hover state when the
   * slider is updated.
   */
  handleMove(event) {
    this.handleStartHover = !this.disabled && inBounds(event, this.handleStart)
    this.handleEndHover = !this.disabled && inBounds(event, this.handleEnd)
  }
  handleEnter(event) {
    this.handleMove(event)
  }
  handleLeave() {
    this.handleStartHover = false
    this.handleEndHover = false
  }
  updateOnTop(input) {
    this.startOnTop = input.classList.contains('start')
  }
  needsClamping() {
    if (!this.action) {
      return false
    }
    const { target, fixed } = this.action
    const isStart = target === this.inputStart
    return isStart ? target.valueAsNumber > fixed.valueAsNumber : target.valueAsNumber < fixed.valueAsNumber
  }
  // if start/end start coincident and the first drag input would e.g. move
  // start > end, avoid clamping and "flip" to use the other input
  // as the action target.
  isActionFlipped() {
    const { action } = this
    if (!action) {
      return false
    }
    const { target, fixed, values } = action
    if (action.canFlip) {
      const coincident = values.get(target) === values.get(fixed)
      if (coincident && this.needsClamping()) {
        action.canFlip = false
        action.flipped = true
        action.target = fixed
        action.fixed = target
      }
    }
    return action.flipped
  }
  // when flipped, apply the drag input to the flipped target and reset
  // the actual target.
  flipAction() {
    if (!this.action) {
      return false
    }
    const { target, fixed, values } = this.action
    const changed = target.valueAsNumber !== fixed.valueAsNumber
    target.valueAsNumber = fixed.valueAsNumber
    fixed.valueAsNumber = values.get(fixed)
    return changed
  }
  // clamp such that start does not move beyond end and visa versa.
  clampAction() {
    if (!this.needsClamping() || !this.action) {
      return false
    }
    const { target, fixed } = this.action
    target.valueAsNumber = fixed.valueAsNumber
    return true
  }
  handleInput(event) {
    // avoid processing a re-dispatched event
    if (this.isRedispatchingEvent) {
      return
    }
    let stopPropagation = false
    let redispatch = false
    if (this.range) {
      if (this.isActionFlipped()) {
        stopPropagation = true
        redispatch = this.flipAction()
      }
      if (this.clampAction()) {
        stopPropagation = true
        redispatch = false
      }
    }
    const target = event.target
    this.updateOnTop(target)
    // update value only on interaction
    if (this.range) {
      this.valueStart = this.inputStart.valueAsNumber
      this.valueEnd = this.inputEnd.valueAsNumber
    } else {
      this.value = this.inputEnd.valueAsNumber
    }
    // control external visibility of input event
    if (stopPropagation) {
      event.stopPropagation()
    }
    // ensure event path is correct when flipped.
    if (redispatch) {
      this.isRedispatchingEvent = true
      redispatchEvent(target, event)
      this.isRedispatchingEvent = false
    }
  }
  handleChange(event) {
    // prevent keyboard triggered changes from dispatching for
    // clamped values; note, this only occurs for keyboard
    const changeTarget = event.target
    const { target, values } = this.action ?? {}
    const squelch = target && target.valueAsNumber === values.get(changeTarget)
    if (!squelch) {
      redispatchEvent(this, event)
    }
    // ensure keyboard triggered change clears action.
    this.finishAction(event)
  }
  [getFormValue]() {
    if (this.range) {
      const data = new FormData()
      data.append(this.nameStart, String(this.valueStart))
      data.append(this.nameEnd, String(this.valueEnd))
      return data
    }
    return String(this.value)
  }
  formResetCallback() {
    if (this.range) {
      const valueStart = this.getAttribute('value-start')
      this.valueStart = valueStart !== null ? Number(valueStart) : undefined
      const valueEnd = this.getAttribute('value-end')
      this.valueEnd = valueEnd !== null ? Number(valueEnd) : undefined
      return
    }
    const value = this.getAttribute('value')
    this.value = value !== null ? Number(value) : undefined
  }
  formStateRestoreCallback(state) {
    if (Array.isArray(state)) {
      const [[, valueStart], [, valueEnd]] = state
      this.valueStart = Number(valueStart)
      this.valueEnd = Number(valueEnd)
      this.range = true
      return
    }
    this.value = Number(state)
    this.range = false
  }
  static styles = [
    css`
      :host {
        --_active-track-color: var(--md-slider-active-track-color, var(--md-sys-color-primary, #6750a4));
        --_active-track-height: var(--md-slider-active-track-height, 4px);
        --_active-track-shape: var(--md-slider-active-track-shape, var(--md-sys-shape-corner-full, 9999px));
        --_disabled-active-track-color: var(
          --md-slider-disabled-active-track-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-active-track-opacity: var(--md-slider-disabled-active-track-opacity, 0.38);
        --_disabled-handle-color: var(--md-slider-disabled-handle-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-handle-elevation: var(--md-slider-disabled-handle-elevation, 0);
        --_disabled-inactive-track-color: var(
          --md-slider-disabled-inactive-track-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-inactive-track-opacity: var(--md-slider-disabled-inactive-track-opacity, 0.12);
        --_focus-handle-color: var(--md-slider-focus-handle-color, var(--md-sys-color-primary, #6750a4));
        --_handle-color: var(--md-slider-handle-color, var(--md-sys-color-primary, #6750a4));
        --_handle-elevation: var(--md-slider-handle-elevation, 1);
        --_handle-height: var(--md-slider-handle-height, 20px);
        --_handle-shadow-color: var(--md-slider-handle-shadow-color, var(--md-sys-color-shadow, #000));
        --_handle-shape: var(--md-slider-handle-shape, var(--md-sys-shape-corner-full, 9999px));
        --_handle-width: var(--md-slider-handle-width, 20px);
        --_hover-handle-color: var(--md-slider-hover-handle-color, var(--md-sys-color-primary, #6750a4));
        --_hover-state-layer-color: var(--md-slider-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));
        --_hover-state-layer-opacity: var(--md-slider-hover-state-layer-opacity, 0.08);
        --_inactive-track-color: var(
          --md-slider-inactive-track-color,
          var(--md-sys-color-surface-container-highest, #e6e0e9)
        );
        --_inactive-track-height: var(--md-slider-inactive-track-height, 4px);
        --_inactive-track-shape: var(--md-slider-inactive-track-shape, var(--md-sys-shape-corner-full, 9999px));
        --_label-container-color: var(--md-slider-label-container-color, var(--md-sys-color-primary, #6750a4));
        --_label-container-height: var(--md-slider-label-container-height, 28px);
        --_pressed-handle-color: var(--md-slider-pressed-handle-color, var(--md-sys-color-primary, #6750a4));
        --_pressed-state-layer-color: var(--md-slider-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));
        --_pressed-state-layer-opacity: var(--md-slider-pressed-state-layer-opacity, 0.12);
        --_state-layer-size: var(--md-slider-state-layer-size, 40px);
        --_with-overlap-handle-outline-color: var(
          --md-slider-with-overlap-handle-outline-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_with-overlap-handle-outline-width: var(--md-slider-with-overlap-handle-outline-width, 1px);
        --_with-tick-marks-active-container-color: var(
          --md-slider-with-tick-marks-active-container-color,
          var(--md-sys-color-on-primary, #fff)
        );
        --_with-tick-marks-container-size: var(--md-slider-with-tick-marks-container-size, 2px);
        --_with-tick-marks-disabled-container-color: var(
          --md-slider-with-tick-marks-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_with-tick-marks-inactive-container-color: var(
          --md-slider-with-tick-marks-inactive-container-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_label-text-color: var(--md-slider-label-text-color, var(--md-sys-color-on-primary, #fff));
        --_label-text-font: var(
          --md-slider-label-text-font,
          var(--md-sys-typescale-label-medium-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-slider-label-text-line-height,
          var(--md-sys-typescale-label-medium-line-height, 1rem)
        );
        --_label-text-size: var(--md-slider-label-text-size, var(--md-sys-typescale-label-medium-size, 0.75rem));
        --_label-text-weight: var(
          --md-slider-label-text-weight,
          var(--md-sys-typescale-label-medium-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_start-fraction: 0;
        --_end-fraction: 0;
        --_tick-count: 0;
        display: inline-flex;
        vertical-align: middle;
        min-inline-size: 200px;
        --md-elevation-level: var(--_handle-elevation);
        --md-elevation-shadow-color: var(--_handle-shadow-color);
      }
      md-focus-ring {
        height: 48px;
        inset: unset;
        width: 48px;
      }
      md-elevation {
        transition-duration: 250ms;
      }
      @media (prefers-reduced-motion) {
        .label {
          transition-duration: 0;
        }
      }
      :host([disabled]) {
        opacity: var(--_disabled-active-track-opacity);
        --md-elevation-level: var(--_disabled-handle-elevation);
      }
      .container {
        flex: 1;
        display: flex;
        align-items: center;
        position: relative;
        block-size: var(--_state-layer-size);
        pointer-events: none;
        touch-action: none;
      }
      .track,
      .tickmarks {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
      }
      .track::before,
      .tickmarks::before,
      .track::after,
      .tickmarks::after {
        position: absolute;
        content: '';
        inset-inline-start: calc(var(--_state-layer-size) / 2 - var(--_with-tick-marks-container-size));
        inset-inline-end: calc(var(--_state-layer-size) / 2 - var(--_with-tick-marks-container-size));
        background-size: calc((100% - var(--_with-tick-marks-container-size) * 2) / var(--_tick-count)) 100%;
      }
      .track::before,
      .tickmarks::before {
        block-size: var(--_inactive-track-height);
        border-radius: var(--_inactive-track-shape);
      }
      .track::before {
        background: var(--_inactive-track-color);
      }
      .tickmarks::before {
        background-image: radial-gradient(
          circle at var(--_with-tick-marks-container-size) center,
          var(--_with-tick-marks-inactive-container-color) 0,
          var(--_with-tick-marks-inactive-container-color) calc(var(--_with-tick-marks-container-size) / 2),
          transparent calc(var(--_with-tick-marks-container-size) / 2)
        );
      }
      :host([disabled]) .track::before {
        opacity: calc(1 / var(--_disabled-active-track-opacity) * var(--_disabled-inactive-track-opacity));
        background: var(--_disabled-inactive-track-color);
      }
      .track::after,
      .tickmarks::after {
        block-size: var(--_active-track-height);
        border-radius: var(--_active-track-shape);
        clip-path: inset(
          0
            calc(
              var(--_with-tick-marks-container-size) * min((1 - var(--_end-fraction)) * 1000000000, 1) +
                (100% - var(--_with-tick-marks-container-size) * 2) * (1 - var(--_end-fraction))
            )
            0
            calc(
              var(--_with-tick-marks-container-size) * min(var(--_start-fraction) * 1000000000, 1) +
                (100% - var(--_with-tick-marks-container-size) * 2) * var(--_start-fraction)
            )
        );
      }
      .track::after {
        background: var(--_active-track-color);
      }
      .tickmarks::after {
        background-image: radial-gradient(
          circle at var(--_with-tick-marks-container-size) center,
          var(--_with-tick-marks-active-container-color) 0,
          var(--_with-tick-marks-active-container-color) calc(var(--_with-tick-marks-container-size) / 2),
          transparent calc(var(--_with-tick-marks-container-size) / 2)
        );
      }
      .track:dir(rtl)::after {
        clip-path: inset(
          0
            calc(
              var(--_with-tick-marks-container-size) * min(var(--_start-fraction) * 1000000000, 1) +
                (100% - var(--_with-tick-marks-container-size) * 2) * var(--_start-fraction)
            )
            0
            calc(
              var(--_with-tick-marks-container-size) * min((1 - var(--_end-fraction)) * 1000000000, 1) +
                (100% - var(--_with-tick-marks-container-size) * 2) * (1 - var(--_end-fraction))
            )
        );
      }
      .tickmarks:dir(rtl)::after {
        clip-path: inset(
          0
            calc(
              var(--_with-tick-marks-container-size) * min(var(--_start-fraction) * 1000000000, 1) +
                (100% - var(--_with-tick-marks-container-size) * 2) * var(--_start-fraction)
            )
            0
            calc(
              var(--_with-tick-marks-container-size) * min((1 - var(--_end-fraction)) * 1000000000, 1) +
                (100% - var(--_with-tick-marks-container-size) * 2) * (1 - var(--_end-fraction))
            )
        );
      }
      :host([disabled]) .track::after {
        background: var(--_disabled-active-track-color);
      }
      :host([disabled]) .tickmarks::before {
        background-image: radial-gradient(
          circle at var(--_with-tick-marks-container-size) center,
          var(--_with-tick-marks-disabled-container-color) 0,
          var(--_with-tick-marks-disabled-container-color) calc(var(--_with-tick-marks-container-size) / 2),
          transparent calc(var(--_with-tick-marks-container-size) / 2)
        );
      }
      .handleContainerPadded {
        position: relative;
        block-size: 100%;
        inline-size: 100%;
        padding-inline: calc(var(--_state-layer-size) / 2);
      }
      .handleContainerBlock {
        position: relative;
        block-size: 100%;
        inline-size: 100%;
      }
      .handleContainer {
        position: absolute;
        inset-block-start: 0;
        inset-block-end: 0;
        inset-inline-start: calc(100% * var(--_start-fraction));
        inline-size: calc(100% * (var(--_end-fraction) - var(--_start-fraction)));
      }
      .handle {
        position: absolute;
        block-size: var(--_state-layer-size);
        inline-size: var(--_state-layer-size);
        border-radius: var(--_handle-shape);
        display: flex;
        place-content: center;
        place-items: center;
      }
      .handleNub {
        position: absolute;
        height: var(--_handle-height);
        width: var(--_handle-width);
        border-radius: var(--_handle-shape);
        background: var(--_handle-color);
      }
      :host([disabled]) .handleNub {
        background: var(--_disabled-handle-color);
      }
      input.end:focus ~ .handleContainerPadded .handle.end > .handleNub,
      input.start:focus ~ .handleContainerPadded .handle.start > .handleNub {
        background: var(--_focus-handle-color);
      }
      .container > .handleContainerPadded .handle.hover > .handleNub {
        background: var(--_hover-handle-color);
      }
      :host(:not([disabled])) input.end:active ~ .handleContainerPadded .handle.end > .handleNub,
      :host(:not([disabled])) input.start:active ~ .handleContainerPadded .handle.start > .handleNub {
        background: var(--_pressed-handle-color);
      }
      .onTop.isOverlapping .label,
      .onTop.isOverlapping .label::before {
        outline: var(--_with-overlap-handle-outline-color) solid var(--_with-overlap-handle-outline-width);
      }
      .onTop.isOverlapping .handleNub {
        border: var(--_with-overlap-handle-outline-color) solid var(--_with-overlap-handle-outline-width);
      }
      .handle.start {
        inset-inline-start: calc(0px - var(--_state-layer-size) / 2);
      }
      .handle.end {
        inset-inline-end: calc(0px - var(--_state-layer-size) / 2);
      }
      .label {
        position: absolute;
        box-sizing: border-box;
        display: flex;
        padding: 4px;
        place-content: center;
        place-items: center;
        border-radius: var(--md-sys-shape-corner-full, 9999px);
        color: var(--_label-text-color);
        font-family: var(--_label-text-font);
        font-size: var(--_label-text-size);
        line-height: var(--_label-text-line-height);
        font-weight: var(--_label-text-weight);
        inset-block-end: 100%;
        min-inline-size: var(--_label-container-height);
        min-block-size: var(--_label-container-height);
        background: var(--_label-container-color);
        transition: transform 100ms cubic-bezier(0.2, 0, 0, 1);
        transform-origin: center bottom;
        transform: scale(0);
      }
      :host(:focus-within) .label,
      .handleContainer.hover .label,
      :where(:has(input:active)) .label {
        transform: scale(1);
      }
      .label::before,
      .label::after {
        position: absolute;
        display: block;
        content: '';
        background: inherit;
      }
      .label::before {
        inline-size: calc(var(--_label-container-height) / 2);
        block-size: calc(var(--_label-container-height) / 2);
        bottom: calc(var(--_label-container-height) / -10);
        transform: rotate(45deg);
      }
      .label::after {
        inset: 0px;
        border-radius: inherit;
      }
      .labelContent {
        z-index: 1;
      }
      input[type='range'] {
        opacity: 0;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        position: absolute;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        margin: 0;
        background: rgba(0, 0, 0, 0);
        cursor: pointer;
        pointer-events: auto;
        appearance: none;
      }
      input[type='range']:focus {
        outline: none;
      }
      ::-webkit-slider-runnable-track {
        -webkit-appearance: none;
      }
      ::-moz-range-track {
        appearance: none;
      }
      ::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        block-size: var(--_handle-height);
        inline-size: var(--_handle-width);
        opacity: 0;
        z-index: 2;
      }
      input.end::-webkit-slider-thumb {
        --_track-and-knob-padding: calc((var(--_state-layer-size) - var(--_handle-width)) / 2);
        --_x-translate: calc(
          var(--_track-and-knob-padding) - 2 * var(--_end-fraction) * var(--_track-and-knob-padding)
        );
        transform: translateX(var(--_x-translate));
      }
      input.end:dir(rtl)::-webkit-slider-thumb {
        transform: translateX(calc(-1 * var(--_x-translate)));
      }
      input.start::-webkit-slider-thumb {
        --_track-and-knob-padding: calc((var(--_state-layer-size) - var(--_handle-width)) / 2);
        --_x-translate: calc(
          var(--_track-and-knob-padding) - 2 * var(--_start-fraction) * var(--_track-and-knob-padding)
        );
        transform: translateX(var(--_x-translate));
      }
      input.start:dir(rtl)::-webkit-slider-thumb {
        transform: translateX(calc(-1 * var(--_x-translate)));
      }
      ::-moz-range-thumb {
        appearance: none;
        block-size: var(--_state-layer-size);
        inline-size: var(--_state-layer-size);
        transform: scaleX(0);
        opacity: 0;
        z-index: 2;
      }
      .ranged input.start {
        clip-path: inset(
          0
            calc(
              100% -
                (
                  var(--_state-layer-size) / 2 + (100% - var(--_state-layer-size)) *
                    (var(--_start-fraction) + (var(--_end-fraction) - var(--_start-fraction)) / 2)
                )
            )
            0 0
        );
      }
      .ranged input.start:dir(rtl) {
        clip-path: inset(
          0 0 0
            calc(
              100% -
                (
                  var(--_state-layer-size) / 2 + (100% - var(--_state-layer-size)) *
                    (var(--_start-fraction) + (var(--_end-fraction) - var(--_start-fraction)) / 2)
                )
            )
        );
      }
      .ranged input.end {
        clip-path: inset(
          0 0 0
            calc(
              var(--_state-layer-size) / 2 + (100% - var(--_state-layer-size)) *
                (var(--_start-fraction) + (var(--_end-fraction) - var(--_start-fraction)) / 2)
            )
        );
      }
      .ranged input.end:dir(rtl) {
        clip-path: inset(
          0
            calc(
              var(--_state-layer-size) / 2 + (100% - var(--_state-layer-size)) *
                (var(--_start-fraction) + (var(--_end-fraction) - var(--_start-fraction)) / 2)
            )
            0 0
        );
      }
      .onTop {
        z-index: 1;
      }
      .handle {
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }
      md-ripple {
        border-radius: 50%;
        height: var(--_state-layer-size);
        width: var(--_state-layer-size);
      }
    `,
    css`
      @media (forced-colors: active) {
        :host {
          --md-slider-active-track-color: CanvasText;
          --md-slider-disabled-active-track-color: GrayText;
          --md-slider-disabled-active-track-opacity: 1;
          --md-slider-disabled-handle-color: GrayText;
          --md-slider-disabled-inactive-track-color: GrayText;
          --md-slider-disabled-inactive-track-opacity: 1;
          --md-slider-focus-handle-color: CanvasText;
          --md-slider-handle-color: CanvasText;
          --md-slider-handle-shadow-color: Canvas;
          --md-slider-hover-handle-color: CanvasText;
          --md-slider-hover-state-layer-color: Canvas;
          --md-slider-hover-state-layer-opacity: 1;
          --md-slider-inactive-track-color: Canvas;
          --md-slider-label-container-color: Canvas;
          --md-slider-label-text-color: CanvasText;
          --md-slider-pressed-handle-color: CanvasText;
          --md-slider-pressed-state-layer-color: Canvas;
          --md-slider-pressed-state-layer-opacity: 1;
          --md-slider-with-overlap-handle-outline-color: CanvasText;
        }
        .label,
        .label::before {
          border: var(--_with-overlap-handle-outline-color) solid var(--_with-overlap-handle-outline-width);
        }
        :host(:not([disabled])) .track::before {
          border: 1px solid var(--_active-track-color);
        }
        .tickmarks::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='CanvasText'%3E%3Ccircle cx='2' cy='2'  r='1'/%3E%3C/svg%3E");
        }
        .tickmarks::after {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='Canvas'%3E%3Ccircle cx='2' cy='2' r='1'/%3E%3C/svg%3E");
        }
        :host([disabled]) .tickmarks::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='Canvas'%3E%3Ccircle cx='2' cy='2'  r='1'/%3E%3C/svg%3E");
        }
      }
    `,
  ]
}
;(() => {
  requestUpdateOnAriaChange(Slider)
})()
/** @nocollapse */
Slider.shadowRootOptions = {
  ...LitElement.shadowRootOptions,
  delegatesFocus: true,
}
function inBounds({ x, y }, element) {
  if (!element) {
    return false
  }
  const { top, left, bottom, right } = element.getBoundingClientRect()
  return x >= left && x <= right && y >= top && y <= bottom
}
function isOverlapping(elA, elB) {
  if (!(elA && elB)) {
    return false
  }
  const a = elA.getBoundingClientRect()
  const b = elB.getBoundingClientRect()
  return !(a.top > b.bottom || a.right < b.left || a.bottom < b.top || a.left > b.right)
}

customElements.define('md-slider', Slider)
