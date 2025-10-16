/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { html, LitElement, nothing, render, css } from 'lit'
import { queryAssignedElements, queryAssignedNodes } from '../utils/query.js'
import { classMap } from 'lit/directives/class-map.js'
import { EASING } from '../internal/motion/animation.js'
/**
 * A field component.
 */
export class Field extends LitElement {
  static properties = {
    color: { type: String },
    disabled: { type: Boolean, reflect: true },
    error: { type: Boolean, reflect: true },
    focused: { type: Boolean, reflect: true },
    label: { type: String },
    populated: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    resizable: { type: Boolean, reflect: true },
    supportingText: { type: String, attribute: 'supporting-text' },
    errorText: { type: String, attribute: 'error-text' },
    count: { type: Number },
    max: { type: Number },
    hasStart: { type: Boolean, attribute: 'has-start', reflect: true },
    hasEnd: { type: Boolean, attribute: 'has-end', reflect: true },
    isAnimating: { type: Boolean },
    refreshErrorAlert: { type: Boolean },
    disableTransitions: { type: Boolean },
  }
  constructor() {
    super(...arguments)
    this.color = 'outlined'
    this.disabled = false
    this.error = false
    this.focused = false
    this.label = ''
    this.populated = false
    this.required = false
    this.resizable = false
    this.supportingText = ''
    this.errorText = ''
    this.count = -1
    this.max = -1
    /**
     * Whether or not the field has leading content.
     */
    this.hasStart = false
    /**
     * Whether or not the field has trailing content.
     */
    this.hasEnd = false
    this.isAnimating = false
    /**
     * When set to true, the error text's `role="alert"` will be removed, then
     * re-added after an animation frame. This will re-announce an error message
     * to screen readers.
     */
    this.refreshErrorAlert = false
    this.disableTransitions = false
  }
  get counterText() {
    // Count and max are typed as number, but can be set to null when Lit removes
    // their attributes. These getters coerce back to a number for calculations.
    const countAsNumber = this.count ?? -1
    const maxAsNumber = this.max ?? -1
    // Counter does not show if count is negative, or max is negative or 0.
    if (countAsNumber < 0 || maxAsNumber <= 0) {
      return ''
    }
    return `${countAsNumber} / ${maxAsNumber}`
  }
  get supportingOrErrorText() {
    return this.error && this.errorText ? this.errorText : this.supportingText
  }
  /**
   * Re-announces the field's error supporting text to screen readers.
   *
   * Error text announces to screen readers anytime it is visible and changes.
   * Use the method to re-announce the message when the text has not changed,
   * but announcement is still needed (such as for `reportValidity()`).
   */
  reannounceError() {
    this.refreshErrorAlert = true
  }
  update(props) {
    // Client-side property updates
    const isDisabledChanging = props.has('disabled') && props.get('disabled') !== undefined
    if (isDisabledChanging) {
      this.disableTransitions = true
    }
    // When disabling, remove focus styles if focused.
    if (this.disabled && this.focused) {
      props.set('focused', true)
      this.focused = false
    }
    // Animate if focused or populated change.
    this.animateLabelIfNeeded({
      wasFocused: props.get('focused'),
      wasPopulated: props.get('populated'),
    })
    super.update(props)
  }
  render() {
    const floatingLabel = this.renderLabel(/*isFloating*/ true)
    const restingLabel = this.renderLabel(/*isFloating*/ false)
    const outline =
      this.color == 'outlined'
        ? this.renderOutline(floatingLabel)
        : html`${this.renderBackground()} ${this.renderIndicator()}`
    const classes = {
      disabled: this.disabled,
      'disable-transitions': this.disableTransitions,
      error: this.error && !this.disabled,
      focused: this.focused,
      'with-start': this.hasStart,
      'with-end': this.hasEnd,
      populated: this.populated,
      resizable: this.resizable,
      required: this.required,
      'no-label': !this.label,
    }
    return html`
      <div class="wrapper ${this.color}">
        <div class="field ${classMap(classes)}">
          <div class="container-overflow">
            ${outline}
            <div class="container">
              <div class="start">
                <slot name="start"></slot>
              </div>
              <div class="middle">
                <div class="label-wrapper">${restingLabel} ${this.color == 'outlined' ? nothing : floatingLabel}</div>
                <div class="content">
                  <slot></slot>
                </div>
              </div>
              <div class="end">
                <slot name="end"></slot>
              </div>
            </div>
          </div>
          ${this.renderSupportingText()}
        </div>
      </div>
    `
  }

  renderOutline(floatingLabel) {
    return html`
      <div class="outline">
        <div class="outline-start"></div>
        <div class="outline-notch">
          <div class="outline-panel-inactive"></div>
          <div class="outline-panel-active"></div>
          <div class="outline-label">${floatingLabel}</div>
        </div>
        <div class="outline-end"></div>
      </div>
    `
  }

  // for filled
  renderBackground() {
    return html`
      <div class="background"></div>
      <div class="state-layer"></div>
    `
  }

  // for filled
  renderIndicator() {
    return html`<div class="active-indicator"></div>`
  }

  updated(changed) {
    if (changed.has('supportingText') || changed.has('errorText') || changed.has('count') || changed.has('max')) {
      this.updateSlottedAriaDescribedBy()
    }
    if (this.refreshErrorAlert) {
      // The past render cycle removed the role="alert" from the error message.
      // Re-add it after an animation frame to re-announce the error.
      requestAnimationFrame(() => {
        this.refreshErrorAlert = false
      })
    }
    if (this.disableTransitions) {
      requestAnimationFrame(() => {
        this.disableTransitions = false
      })
    }
  }
  renderSupportingText() {
    const { supportingOrErrorText, counterText } = this
    if (!supportingOrErrorText && !counterText) {
      return nothing
    }
    // Always render the supporting text span so that our `space-around`
    // container puts the counter at the end.
    const start = html`<span>${supportingOrErrorText}</span>`
    // Conditionally render counter so we don't render the extra `gap`.
    // TODO(b/244473435): add aria-label and announcements
    const end = counterText ? html`<span class="counter">${counterText}</span>` : nothing
    // Announce if there is an error and error text visible.
    // If refreshErrorAlert is true, do not announce. This will remove the
    // role="alert" attribute. Another render cycle will happen after an
    // animation frame to re-add the role.
    const shouldErrorAnnounce = this.error && this.errorText && !this.refreshErrorAlert
    const role = shouldErrorAnnounce ? 'alert' : nothing
    return html`
      <div class="supporting-text" role=${role}>${start}${end}</div>
      <slot name="aria-describedby" @slotchange=${this.updateSlottedAriaDescribedBy}></slot>
    `
  }
  updateSlottedAriaDescribedBy() {
    for (const element of this.slottedAriaDescribedBy) {
      render(html`${this.supportingOrErrorText} ${this.counterText}`, element)
      element.setAttribute('hidden', '')
    }
  }
  renderLabel(isFloating) {
    if (!this.label) {
      return nothing
    }
    let visible
    if (isFloating) {
      // Floating label is visible when focused/populated or when animating.
      visible = this.focused || this.populated || this.isAnimating
    } else {
      // Resting label is visible when unfocused. It is never visible while
      // animating.
      visible = !this.focused && !this.populated && !this.isAnimating
    }
    const classes = {
      hidden: !visible,
      floating: isFloating,
      resting: !isFloating,
    }
    // Add '*' if a label is present and the field is required
    const labelText = `${this.label}${this.required ? '*' : ''}`
    // console.log("label:", labelText, isFloating, visible, "focused?", this.focused, "populated?:", this.populated, "animating?", this.isAnimating)
    return html` <span class="label ${classMap(classes)}" aria-hidden=${!visible}>${labelText}</span> `
  }
  animateLabelIfNeeded({ wasFocused, wasPopulated }) {
    if (!this.label) {
      return
    }
    wasFocused ?? (wasFocused = this.focused)
    wasPopulated ?? (wasPopulated = this.populated)
    const wasFloating = wasFocused || wasPopulated
    const shouldBeFloating = this.focused || this.populated
    if (wasFloating === shouldBeFloating) {
      return
    }
    this.isAnimating = true
    // console.log("animating started")
    this.labelAnimation?.cancel()
    // Only one label is visible at a time for clearer text rendering.
    // The floating label is visible and used during animation. At the end of
    // the animation, it will either remain visible (if floating) or hide and
    // the resting label will be shown.
    //
    // We don't use forward filling because if the dimensions of the text field
    // change (leading icon removed, density changes, etc), then the animation
    // will be inaccurate.
    //
    // Re-calculating the animation each time will prevent any visual glitches
    // from appearing.
    // TODO(b/241113345): use animation tokens
    this.labelAnimation = this.floatingLabelEl?.animate(this.getLabelKeyframes(), {
      duration: 150,
      easing: EASING.STANDARD,
    })
    this.labelAnimation?.addEventListener('finish', () => {
      // At the end of the animation, update the visible label.
      // console.log("animation finish")
      this.isAnimating = false
    })
  }
  getLabelKeyframes() {
    const { floatingLabelEl, restingLabelEl } = this
    if (!floatingLabelEl || !restingLabelEl) {
      return []
    }
    const { x: floatingX, y: floatingY, height: floatingHeight } = floatingLabelEl.getBoundingClientRect()
    const { x: restingX, y: restingY, height: restingHeight } = restingLabelEl.getBoundingClientRect()
    const floatingScrollWidth = floatingLabelEl.scrollWidth
    const restingScrollWidth = restingLabelEl.scrollWidth
    // Scale by width ratio instead of font size since letter-spacing will scale
    // incorrectly. Using the width we can better approximate the adjusted
    // scale and compensate for tracking and overflow.
    // (use scrollWidth instead of width to account for clipped labels)
    const scale = restingScrollWidth / floatingScrollWidth
    const xDelta = restingX - floatingX
    // The line-height of the resting and floating label are different. When
    // we move the floating label down to the resting label's position, it won't
    // exactly match because of this. We need to adjust by half of what the
    // final scaled floating label's height will be.
    const yDelta = restingY - floatingY + Math.round((restingHeight - floatingHeight * scale) / 2)
    // Create the two transforms: floating to resting (using the calculations
    // above), and resting to floating (re-setting the transform to initial
    // values).
    const restTransform = `translateX(${xDelta}px) translateY(${yDelta}px) scale(${scale})`
    const floatTransform = `translateX(0) translateY(0) scale(1)`
    // Constrain the floating labels width to a scaled percentage of the
    // resting label's width. This will prevent long clipped labels from
    // overflowing the container.
    const restingClientWidth = restingLabelEl.clientWidth
    const isRestingClipped = restingScrollWidth > restingClientWidth
    const width = isRestingClipped ? `${restingClientWidth / scale}px` : ''
    if (this.focused || this.populated) {
      return [
        { transform: restTransform, width },
        { transform: floatTransform, width },
      ]
    }
    return [
      { transform: floatTransform, width },
      { transform: restTransform, width },
    ]
  }
  getSurfacePositionClientRect() {
    return this.containerEl.getBoundingClientRect()
  }

  /*
  __decorate([
  queryAssignedElements({ slot: 'aria-describedby' })
], Field.prototype, "slottedAriaDescribedBy", void 0);
*/
  get slottedAriaDescribedBy() {
    return queryAssignedElements(this, { slot: 'aria-describedby' })
  }

  get floatingLabelEl() {
    return this.renderRoot?.querySelector('.label.floating')
  }

  get restingLabelEl() {
    return this.renderRoot?.querySelector('.label.resting')
  }
  get containerEl() {
    return this.renderRoot?.querySelector('.container')
  }

  static styles = [
    css`
      .wrapper {
        display: inline-flex;
        resize: both;
        max-width: 100%;
        width: 100%;
      }

      .field {
        display: flex;
        flex: 1;
        flex-direction: column;
        writing-mode: horizontal-tb;
        max-width: 100%;
      }

      .container-overflow {
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-end-radius: var(--_container-shape-end-end);
        border-end-start-radius: var(--_container-shape-end-start);
        display: flex;
        height: 100%;
        position: relative;
      }

      .container {
        align-items: center;
        border-radius: inherit;
        display: flex;
        flex: 1;
        max-height: 100%;
        min-height: 100%;
        min-width: min-content;
        position: relative;
      }

      .field,
      .container-overflow {
        resize: inherit;
      }

      .resizable:not(.disabled) .container {
        resize: inherit;
        overflow: hidden;
      }

      .disabled {
        pointer-events: none;
      }

      @layer styles {
        .start,
        .middle,
        .end {
          display: flex;
          box-sizing: border-box;
          height: 100%;
          position: relative;
        }

        .start {
          color: var(--_leading-content-color);
        }

        .end {
          color: var(--_trailing-content-color);
        }

        .start,
        .end {
          align-items: center;
          justify-content: center;
        }

        .with-start .start,
        .with-end .end {
          min-width: 48px;
        }

        .with-start .start {
          margin-inline-end: 4px;
        }

        .with-end .end {
          margin-inline-start: 4px;
        }

        .middle {
          align-items: stretch;
          align-self: baseline;
          flex: 1;
        }

        .content {
          color: var(--_content-color);
          display: flex;
          flex: 1;
          opacity: 0;
          transition: opacity 83ms cubic-bezier(0.2, 0, 0, 1);
        }

        .no-label .content,
        .focused .content,
        .populated .content {
          opacity: 1;
          transition-delay: 67ms;
        }

        :is(.disabled, .disable-transitions) .content {
          transition: none;
        }

        .content ::slotted(*) {
          all: unset;
          color: currentColor;
          font-family: var(--_content-font);
          font-size: var(--_content-size);
          line-height: var(--_content-line-height);
          font-weight: var(--_content-weight);
          width: 100%;
          overflow-wrap: revert;
          white-space: revert;
        }

        .content ::slotted(:not(textarea)) {
          padding-top: var(--_top-space);
          padding-bottom: var(--_bottom-space);
        }

        .content ::slotted(textarea) {
          margin-top: var(--_top-space);
          margin-bottom: var(--_bottom-space);
        }

        :hover .content {
          color: var(--_hover-content-color);
        }

        :hover .start {
          color: var(--_hover-leading-content-color);
        }

        :hover .end {
          color: var(--_hover-trailing-content-color);
        }

        .focused .content {
          color: var(--_focus-content-color);
        }

        .focused .start {
          color: var(--_focus-leading-content-color);
        }

        .focused .end {
          color: var(--_focus-trailing-content-color);
        }

        .disabled .content {
          color: var(--_disabled-content-color);
        }

        .disabled.no-label .content,
        .disabled.focused .content,
        .disabled.populated .content {
          opacity: var(--_disabled-content-opacity);
        }

        .disabled .start {
          color: var(--_disabled-leading-content-color);
          opacity: var(--_disabled-leading-content-opacity);
        }

        .disabled .end {
          color: var(--_disabled-trailing-content-color);
          opacity: var(--_disabled-trailing-content-opacity);
        }

        .error .content {
          color: var(--_error-content-color);
        }

        .error .start {
          color: var(--_error-leading-content-color);
        }

        .error .end {
          color: var(--_error-trailing-content-color);
        }

        .error:hover .content {
          color: var(--_error-hover-content-color);
        }

        .error:hover .start {
          color: var(--_error-hover-leading-content-color);
        }

        .error:hover .end {
          color: var(--_error-hover-trailing-content-color);
        }

        .error.focused .content {
          color: var(--_error-focus-content-color);
        }

        .error.focused .start {
          color: var(--_error-focus-leading-content-color);
        }

        .error.focused .end {
          color: var(--_error-focus-trailing-content-color);
        }
      }

      @layer hcm {
        @media (forced-colors: active) {
          .disabled :is(.start, .content, .end) {
            color: GrayText;
            opacity: 1;
          }
        }
      }

      @layer styles {
        .label {
          box-sizing: border-box;
          color: var(--_label-text-color);
          overflow: hidden;
          max-width: 100%;
          text-overflow: ellipsis;
          white-space: nowrap;
          z-index: 1;
          font-family: var(--_label-text-font);
          font-size: var(--_label-text-size);
          line-height: var(--_label-text-line-height);
          font-weight: var(--_label-text-weight);
          width: min-content;
        }

        .label-wrapper {
          inset: 0;
          pointer-events: none;
          position: absolute;
        }

        .label.resting {
          position: absolute;
          top: var(--_top-space);
        }

        .label.floating {
          font-size: var(--_label-text-populated-size);
          line-height: var(--_label-text-populated-line-height);
          transform-origin: top left;
        }

        .label.hidden {
          opacity: 0;
        }

        .no-label .label {
          display: none;
        }

        .label-wrapper {
          inset: 0;
          position: absolute;
          text-align: initial;
        }

        :hover .label {
          color: var(--_hover-label-text-color);
        }

        .focused .label {
          color: var(--_focus-label-text-color);
        }

        .disabled .label {
          color: var(--_disabled-label-text-color);
        }

        .disabled .label:not(.hidden) {
          opacity: var(--_disabled-label-text-opacity);
        }

        .error .label {
          color: var(--_error-label-text-color);
        }

        .error:hover .label {
          color: var(--_error-hover-label-text-color);
        }

        .error.focused .label {
          color: var(--_error-focus-label-text-color);
        }
      }

      @layer hcm {
        @media (forced-colors: active) {
          .disabled .label:not(.hidden) {
            color: GrayText;
            opacity: 1;
          }
        }
      }

      @layer styles {
        .supporting-text {
          color: var(--_supporting-text-color);
          display: flex;
          font-family: var(--_supporting-text-font);
          font-size: var(--_supporting-text-size);
          line-height: var(--_supporting-text-line-height);
          font-weight: var(--_supporting-text-weight);
          gap: 16px;
          justify-content: space-between;
          padding-inline-start: var(--_supporting-text-leading-space);
          padding-inline-end: var(--_supporting-text-trailing-space);
          padding-top: var(--_supporting-text-top-space);
        }

        .supporting-text :nth-child(2) {
          flex-shrink: 0;
        }

        :hover .supporting-text {
          color: var(--_hover-supporting-text-color);
        }

        .focus .supporting-text {
          color: var(--_focus-supporting-text-color);
        }

        .disabled .supporting-text {
          color: var(--_disabled-supporting-text-color);
          opacity: var(--_disabled-supporting-text-opacity);
        }

        .error .supporting-text {
          color: var(--_error-supporting-text-color);
        }

        .error:hover .supporting-text {
          color: var(--_error-hover-supporting-text-color);
        }

        .error.focus .supporting-text {
          color: var(--_error-focus-supporting-text-color);
        }
      }

      @layer hcm {
        @media (forced-colors: active) {
          .disabled .supporting-text {
            color: GrayText;
            opacity: 1;
          }
        }
      }
    `,
    css`
      @layer styles {
        .wrapper.outlined {
          --_bottom-space: var(--md-outlined-field-bottom-space, 16px);
          --_content-color: var(--md-outlined-field-content-color, var(--md-sys-color-on-surface, #1d1b20));
          --_content-font: var(
            --md-outlined-field-content-font,
            var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
          );
          --_content-line-height: var(
            --md-outlined-field-content-line-height,
            var(--md-sys-typescale-body-large-line-height, 1.5rem)
          );
          --_content-size: var(--md-outlined-field-content-size, var(--md-sys-typescale-body-large-size, 1rem));
          --_content-weight: var(
            --md-outlined-field-content-weight,
            var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
          );
          --_disabled-content-color: var(
            --md-outlined-field-disabled-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-content-opacity: var(--md-outlined-field-disabled-content-opacity, 0.38);
          --_disabled-label-text-color: var(
            --md-outlined-field-disabled-label-text-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-label-text-opacity: var(--md-outlined-field-disabled-label-text-opacity, 0.38);
          --_disabled-leading-content-color: var(
            --md-outlined-field-disabled-leading-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-leading-content-opacity: var(--md-outlined-field-disabled-leading-content-opacity, 0.38);
          --_disabled-outline-color: var(
            --md-outlined-field-disabled-outline-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-outline-opacity: var(--md-outlined-field-disabled-outline-opacity, 0.12);
          --_disabled-outline-width: var(--md-outlined-field-disabled-outline-width, 1px);
          --_disabled-supporting-text-color: var(
            --md-outlined-field-disabled-supporting-text-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-supporting-text-opacity: var(--md-outlined-field-disabled-supporting-text-opacity, 0.38);
          --_disabled-trailing-content-color: var(
            --md-outlined-field-disabled-trailing-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-trailing-content-opacity: var(--md-outlined-field-disabled-trailing-content-opacity, 0.38);
          --_error-content-color: var(--md-outlined-field-error-content-color, var(--md-sys-color-on-surface, #1d1b20));
          --_error-focus-content-color: var(
            --md-outlined-field-error-focus-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_error-focus-label-text-color: var(
            --md-outlined-field-error-focus-label-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-focus-leading-content-color: var(
            --md-outlined-field-error-focus-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_error-focus-outline-color: var(
            --md-outlined-field-error-focus-outline-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-focus-supporting-text-color: var(
            --md-outlined-field-error-focus-supporting-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-focus-trailing-content-color: var(
            --md-outlined-field-error-focus-trailing-content-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-hover-content-color: var(
            --md-outlined-field-error-hover-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_error-hover-label-text-color: var(
            --md-outlined-field-error-hover-label-text-color,
            var(--md-sys-color-on-error-container, #410e0b)
          );
          --_error-hover-leading-content-color: var(
            --md-outlined-field-error-hover-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_error-hover-outline-color: var(
            --md-outlined-field-error-hover-outline-color,
            var(--md-sys-color-on-error-container, #410e0b)
          );
          --_error-hover-supporting-text-color: var(
            --md-outlined-field-error-hover-supporting-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-hover-trailing-content-color: var(
            --md-outlined-field-error-hover-trailing-content-color,
            var(--md-sys-color-on-error-container, #410e0b)
          );
          --_error-label-text-color: var(
            --md-outlined-field-error-label-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-leading-content-color: var(
            --md-outlined-field-error-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_error-outline-color: var(--md-outlined-field-error-outline-color, var(--md-sys-color-error, #b3261e));
          --_error-supporting-text-color: var(
            --md-outlined-field-error-supporting-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-trailing-content-color: var(
            --md-outlined-field-error-trailing-content-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_focus-content-color: var(--md-outlined-field-focus-content-color, var(--md-sys-color-on-surface, #1d1b20));
          --_focus-label-text-color: var(
            --md-outlined-field-focus-label-text-color,
            var(--md-sys-color-primary, #6750a4)
          );
          --_focus-leading-content-color: var(
            --md-outlined-field-focus-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_focus-outline-color: var(--md-outlined-field-focus-outline-color, var(--md-sys-color-primary, #6750a4));
          --_focus-outline-width: var(--md-outlined-field-focus-outline-width, 3px);
          --_focus-supporting-text-color: var(
            --md-outlined-field-focus-supporting-text-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_focus-trailing-content-color: var(
            --md-outlined-field-focus-trailing-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_hover-content-color: var(--md-outlined-field-hover-content-color, var(--md-sys-color-on-surface, #1d1b20));
          --_hover-label-text-color: var(
            --md-outlined-field-hover-label-text-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_hover-leading-content-color: var(
            --md-outlined-field-hover-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_hover-outline-color: var(--md-outlined-field-hover-outline-color, var(--md-sys-color-on-surface, #1d1b20));
          --_hover-outline-width: var(--md-outlined-field-hover-outline-width, 1px);
          --_hover-supporting-text-color: var(
            --md-outlined-field-hover-supporting-text-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_hover-trailing-content-color: var(
            --md-outlined-field-hover-trailing-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_label-text-color: var(
            --md-outlined-field-label-text-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_label-text-font: var(
            --md-outlined-field-label-text-font,
            var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
          );
          --_label-text-line-height: var(
            --md-outlined-field-label-text-line-height,
            var(--md-sys-typescale-body-large-line-height, 1.5rem)
          );
          --_label-text-padding-bottom: var(--md-outlined-field-label-text-padding-bottom, 8px);
          --_label-text-populated-line-height: var(
            --md-outlined-field-label-text-populated-line-height,
            var(--md-sys-typescale-body-small-line-height, 1rem)
          );
          --_label-text-populated-size: var(
            --md-outlined-field-label-text-populated-size,
            var(--md-sys-typescale-body-small-size, 0.75rem)
          );
          --_label-text-size: var(--md-outlined-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));
          --_label-text-weight: var(
            --md-outlined-field-label-text-weight,
            var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
          );
          --_leading-content-color: var(
            --md-outlined-field-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_leading-space: var(--md-outlined-field-leading-space, 16px);
          --_outline-color: var(--md-outlined-field-outline-color, var(--md-sys-color-outline, #79747e));
          --_outline-label-padding: var(--md-outlined-field-outline-label-padding, 4px);
          --_outline-width: var(--md-outlined-field-outline-width, 1px);
          --_supporting-text-color: var(
            --md-outlined-field-supporting-text-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_supporting-text-font: var(
            --md-outlined-field-supporting-text-font,
            var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto))
          );
          --_supporting-text-leading-space: var(--md-outlined-field-supporting-text-leading-space, 16px);
          --_supporting-text-line-height: var(
            --md-outlined-field-supporting-text-line-height,
            var(--md-sys-typescale-body-small-line-height, 1rem)
          );
          --_supporting-text-size: var(
            --md-outlined-field-supporting-text-size,
            var(--md-sys-typescale-body-small-size, 0.75rem)
          );
          --_supporting-text-top-space: var(--md-outlined-field-supporting-text-top-space, 4px);
          --_supporting-text-trailing-space: var(--md-outlined-field-supporting-text-trailing-space, 16px);
          --_supporting-text-weight: var(
            --md-outlined-field-supporting-text-weight,
            var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400))
          );
          --_top-space: var(--md-outlined-field-top-space, 16px);
          --_trailing-content-color: var(
            --md-outlined-field-trailing-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_trailing-space: var(--md-outlined-field-trailing-space, 16px);
          --_container-shape-start-start: var(
            --md-outlined-field-container-shape-start-start,
            var(--md-outlined-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
          );
          --_container-shape-start-end: var(
            --md-outlined-field-container-shape-start-end,
            var(--md-outlined-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
          );
          --_container-shape-end-end: var(
            --md-outlined-field-container-shape-end-end,
            var(--md-outlined-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
          );
          --_container-shape-end-start: var(
            --md-outlined-field-container-shape-end-start,
            var(--md-outlined-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
          );
        }

        .outlined .outline {
          border-color: var(--_outline-color);
          border-radius: inherit;
          display: flex;
          pointer-events: none;
          height: 100%;
          position: absolute;
          width: 100%;
          z-index: 1;
        }

        .outlined .outline-start::before,
        .outlined .outline-start::after,
        .outlined .outline-panel-inactive::before,
        .outlined .outline-panel-inactive::after,
        .outlined .outline-panel-active::before,
        .outlined .outline-panel-active::after,
        .outlined .outline-end::before,
        .outlined .outline-end::after {
          border: inherit;
          content: '';
          inset: 0;
          position: absolute;
        }

        .outlined .outline-start,
        .outlined .outline-end {
          border: inherit;
          border-radius: inherit;
          box-sizing: border-box;
          position: relative;
        }

        .outlined .outline-start::before,
        .outlined .outline-start::after,
        .outlined .outline-end::before,
        .outlined .outline-end::after {
          border-bottom-style: solid;
          border-top-style: solid;
        }

        .outlined .outline-start::after,
        .outlined .outline-end::after {
          opacity: 0;
          transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        .outlined .focused .outline-start::after,
        .outlined .focused .outline-end::after {
          opacity: 1;
        }

        .outlined .outline-start::before,
        .outlined .outline-start::after {
          border-inline-start-style: solid;
          border-inline-end-style: none;
          border-start-start-radius: inherit;
          border-start-end-radius: 0;
          border-end-start-radius: inherit;
          border-end-end-radius: 0;
          margin-inline-end: var(--_outline-label-padding);
        }

        .outlined .outline-end {
          flex-grow: 1;
          margin-inline-start: calc(-1 * var(--_outline-label-padding));
        }

        .outlined .outline-end::before,
        .outlined .outline-end::after {
          border-inline-start-style: none;
          border-inline-end-style: solid;
          border-start-start-radius: 0;
          border-start-end-radius: inherit;
          border-end-start-radius: 0;
          border-end-end-radius: inherit;
        }

        .outlined .outline-notch {
          align-items: flex-start;
          border: inherit;
          display: flex;
          margin-inline-start: calc(-1 * var(--_outline-label-padding));
          margin-inline-end: var(--_outline-label-padding);
          max-width: calc(100% - var(--_leading-space) - var(--_trailing-space));
          padding: 0 var(--_outline-label-padding);
          position: relative;
        }

        .outlined .no-label .outline-notch {
          display: none;
        }

        .outlined .outline-panel-inactive,
        .outlined .outline-panel-active {
          border: inherit;
          border-bottom-style: solid;
          inset: 0;
          position: absolute;
        }

        .outlined .outline-panel-inactive::before,
        .outlined .outline-panel-inactive::after,
        .outlined .outline-panel-active::before,
        .outlined .outline-panel-active::after {
          border-top-style: solid;
          border-bottom: none;
          bottom: auto;
          transform: scaleX(1);
          transition: transform 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        .outlined .outline-panel-inactive::before,
        .outlined .outline-panel-active::before {
          right: 50%;
          transform-origin: top left;
        }

        .outlined .outline-panel-inactive::after,
        .outlined .outline-panel-active::after {
          left: 50%;
          transform-origin: top right;
        }

        .outlined .populated .outline-panel-inactive::before,
        .outlined .populated .outline-panel-inactive::after,
        .outlined .populated .outline-panel-active::before,
        .outlined .populated .outline-panel-active::after,
        .outlined .focused .outline-panel-inactive::before,
        .outlined .focused .outline-panel-inactive::after,
        .outlined .focused .outline-panel-active::before,
        .outlined .focused .outline-panel-active::after {
          transform: scaleX(0);
        }

        .outlined .outline-panel-active {
          opacity: 0;
          transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        .outlined .focused .outline-panel-active {
          opacity: 1;
        }

        .outlined .outline-label {
          display: flex;
          max-width: 100%;
          transform: translateY(calc(-100% + var(--_label-text-padding-bottom)));
        }

        .outlined .outline-start,
        .outlined .field:not(.with-start) .content ::slotted(*) {
          padding-inline-start: max(
            var(--_leading-space),
            max(var(--_container-shape-start-start), var(--_container-shape-end-start)) + var(--_outline-label-padding)
          );
        }

        .outlined .field:not(.with-start) .label-wrapper {
          margin-inline-start: max(
            var(--_leading-space),
            max(var(--_container-shape-start-start), var(--_container-shape-end-start)) + var(--_outline-label-padding)
          );
        }

        .outlined .field:not(.with-end) .content ::slotted(*) {
          padding-inline-end: max(
            var(--_trailing-space),
            max(var(--_container-shape-start-end), var(--_container-shape-end-end))
          );
        }

        .outlined .field:not(.with-end) .label-wrapper {
          margin-inline-end: max(
            var(--_trailing-space),
            max(var(--_container-shape-start-end), var(--_container-shape-end-end))
          );
        }

        .outlined .outline-start::before,
        .outlined .outline-end::before,
        .outlined .outline-panel-inactive,
        .outlined .outline-panel-inactive::before,
        .outlined .outline-panel-inactive::after {
          border-width: var(--_outline-width);
        }

        :hover .outline {
          border-color: var(--_hover-outline-color);
          color: var(--_hover-outline-color);
        }

        :hover .outline-start::before,
        :hover .outline-end::before,
        :hover .outline-panel-inactive,
        :hover .outline-panel-inactive::before,
        :hover .outline-panel-inactive::after {
          border-width: var(--_hover-outline-width);
        }

        .outlined .focused .outline {
          border-color: var(--_focus-outline-color);
          color: var(--_focus-outline-color);
        }

        .outlined .outline-start::after,
        .outlined .outline-end::after,
        .outlined .outline-panel-active,
        .outlined .outline-panel-active::before,
        .outlined .outline-panel-active::after {
          border-width: var(--_focus-outline-width);
        }

        .outlined .disabled .outline {
          border-color: var(--_disabled-outline-color);
          color: var(--_disabled-outline-color);
        }

        .outlined .disabled .outline-start,
        .outlined .disabled .outline-end,
        .outlined .disabled .outline-panel-inactive {
          opacity: var(--_disabled-outline-opacity);
        }

        .outlined .disabled .outline-start::before,
        .outlined .disabled .outline-end::before,
        .outlined .disabled .outline-panel-inactive,
        .outlined .disabled .outline-panel-inactive::before,
        .outlined .disabled .outline-panel-inactive::after {
          border-width: var(--_disabled-outline-width);
        }

        .outlined .error .outline {
          border-color: var(--_error-outline-color);
          color: var(--_error-outline-color);
        }

        .outlined .error:hover .outline {
          border-color: var(--_error-hover-outline-color);
          color: var(--_error-hover-outline-color);
        }

        .outlined .error.focused .outline {
          border-color: var(--_error-focus-outline-color);
          color: var(--_error-focus-outline-color);
        }

        .outlined .resizable .container {
          bottom: var(--_focus-outline-width);
          inset-inline-end: var(--_focus-outline-width);
          clip-path: inset(var(--_focus-outline-width) 0 0 var(--_focus-outline-width));
        }

        .outlined .resizable .container > * {
          top: var(--_focus-outline-width);
          inset-inline-start: var(--_focus-outline-width);
        }

        .outlined .resizable .container:dir(rtl) {
          clip-path: inset(var(--_focus-outline-width) var(--_focus-outline-width) 0 0);
        }
      }

      @layer hcm {
        @media (forced-colors: active) {
          .outlined .disabled .outline {
            border-color: GrayText;
            color: GrayText;
          }

          .outlined .disabled :is(.outline-start, .outline-end, .outline-panel-inactive) {
            opacity: 1;
          }
        }
      }
    `,
    css`
      @layer styles {
        .wrapper.filled {
          --_active-indicator-color: var(
            --md-filled-field-active-indicator-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_active-indicator-height: var(--md-filled-field-active-indicator-height, 1px);
          --_bottom-space: var(--md-filled-field-bottom-space, 16px);
          --_container-color: var(
            --md-filled-field-container-color,
            var(--md-sys-color-surface-container-highest, #e6e0e9)
          );
          --_content-color: var(--md-filled-field-content-color, var(--md-sys-color-on-surface, #1d1b20));
          --_content-font: var(
            --md-filled-field-content-font,
            var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
          );
          --_content-line-height: var(
            --md-filled-field-content-line-height,
            var(--md-sys-typescale-body-large-line-height, 1.5rem)
          );
          --_content-size: var(--md-filled-field-content-size, var(--md-sys-typescale-body-large-size, 1rem));
          --_content-weight: var(
            --md-filled-field-content-weight,
            var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
          );
          --_disabled-active-indicator-color: var(
            --md-filled-field-disabled-active-indicator-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-active-indicator-height: var(--md-filled-field-disabled-active-indicator-height, 1px);
          --_disabled-active-indicator-opacity: var(--md-filled-field-disabled-active-indicator-opacity, 0.38);
          --_disabled-container-color: var(
            --md-filled-field-disabled-container-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-container-opacity: var(--md-filled-field-disabled-container-opacity, 0.04);
          --_disabled-content-color: var(
            --md-filled-field-disabled-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-content-opacity: var(--md-filled-field-disabled-content-opacity, 0.38);
          --_disabled-label-text-color: var(
            --md-filled-field-disabled-label-text-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-label-text-opacity: var(--md-filled-field-disabled-label-text-opacity, 0.38);
          --_disabled-leading-content-color: var(
            --md-filled-field-disabled-leading-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-leading-content-opacity: var(--md-filled-field-disabled-leading-content-opacity, 0.38);
          --_disabled-supporting-text-color: var(
            --md-filled-field-disabled-supporting-text-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-supporting-text-opacity: var(--md-filled-field-disabled-supporting-text-opacity, 0.38);
          --_disabled-trailing-content-color: var(
            --md-filled-field-disabled-trailing-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_disabled-trailing-content-opacity: var(--md-filled-field-disabled-trailing-content-opacity, 0.38);
          --_error-active-indicator-color: var(
            --md-filled-field-error-active-indicator-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-content-color: var(--md-filled-field-error-content-color, var(--md-sys-color-on-surface, #1d1b20));
          --_error-focus-active-indicator-color: var(
            --md-filled-field-error-focus-active-indicator-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-focus-content-color: var(
            --md-filled-field-error-focus-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_error-focus-label-text-color: var(
            --md-filled-field-error-focus-label-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-focus-leading-content-color: var(
            --md-filled-field-error-focus-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_error-focus-supporting-text-color: var(
            --md-filled-field-error-focus-supporting-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-focus-trailing-content-color: var(
            --md-filled-field-error-focus-trailing-content-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-hover-active-indicator-color: var(
            --md-filled-field-error-hover-active-indicator-color,
            var(--md-sys-color-on-error-container, #410e0b)
          );
          --_error-hover-content-color: var(
            --md-filled-field-error-hover-content-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_error-hover-label-text-color: var(
            --md-filled-field-error-hover-label-text-color,
            var(--md-sys-color-on-error-container, #410e0b)
          );
          --_error-hover-leading-content-color: var(
            --md-filled-field-error-hover-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_error-hover-state-layer-color: var(
            --md-filled-field-error-hover-state-layer-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_error-hover-state-layer-opacity: var(--md-filled-field-error-hover-state-layer-opacity, 0.08);
          --_error-hover-supporting-text-color: var(
            --md-filled-field-error-hover-supporting-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-hover-trailing-content-color: var(
            --md-filled-field-error-hover-trailing-content-color,
            var(--md-sys-color-on-error-container, #410e0b)
          );
          --_error-label-text-color: var(--md-filled-field-error-label-text-color, var(--md-sys-color-error, #b3261e));
          --_error-leading-content-color: var(
            --md-filled-field-error-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_error-supporting-text-color: var(
            --md-filled-field-error-supporting-text-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_error-trailing-content-color: var(
            --md-filled-field-error-trailing-content-color,
            var(--md-sys-color-error, #b3261e)
          );
          --_focus-active-indicator-color: var(
            --md-filled-field-focus-active-indicator-color,
            var(--md-sys-color-primary, #6750a4)
          );
          --_focus-active-indicator-height: var(--md-filled-field-focus-active-indicator-height, 3px);
          --_focus-content-color: var(--md-filled-field-focus-content-color, var(--md-sys-color-on-surface, #1d1b20));
          --_focus-label-text-color: var(
            --md-filled-field-focus-label-text-color,
            var(--md-sys-color-primary, #6750a4)
          );
          --_focus-leading-content-color: var(
            --md-filled-field-focus-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_focus-supporting-text-color: var(
            --md-filled-field-focus-supporting-text-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_focus-trailing-content-color: var(
            --md-filled-field-focus-trailing-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_hover-active-indicator-color: var(
            --md-filled-field-hover-active-indicator-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_hover-active-indicator-height: var(--md-filled-field-hover-active-indicator-height, 1px);
          --_hover-content-color: var(--md-filled-field-hover-content-color, var(--md-sys-color-on-surface, #1d1b20));
          --_hover-label-text-color: var(
            --md-filled-field-hover-label-text-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_hover-leading-content-color: var(
            --md-filled-field-hover-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_hover-state-layer-color: var(
            --md-filled-field-hover-state-layer-color,
            var(--md-sys-color-on-surface, #1d1b20)
          );
          --_hover-state-layer-opacity: var(--md-filled-field-hover-state-layer-opacity, 0.08);
          --_hover-supporting-text-color: var(
            --md-filled-field-hover-supporting-text-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_hover-trailing-content-color: var(
            --md-filled-field-hover-trailing-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_label-text-color: var(--md-filled-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));
          --_label-text-font: var(
            --md-filled-field-label-text-font,
            var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
          );
          --_label-text-line-height: var(
            --md-filled-field-label-text-line-height,
            var(--md-sys-typescale-body-large-line-height, 1.5rem)
          );
          --_label-text-populated-line-height: var(
            --md-filled-field-label-text-populated-line-height,
            var(--md-sys-typescale-body-small-line-height, 1rem)
          );
          --_label-text-populated-size: var(
            --md-filled-field-label-text-populated-size,
            var(--md-sys-typescale-body-small-size, 0.75rem)
          );
          --_label-text-size: var(--md-filled-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));
          --_label-text-weight: var(
            --md-filled-field-label-text-weight,
            var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
          );
          --_leading-content-color: var(
            --md-filled-field-leading-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_leading-space: var(--md-filled-field-leading-space, 16px);
          --_supporting-text-color: var(
            --md-filled-field-supporting-text-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_supporting-text-font: var(
            --md-filled-field-supporting-text-font,
            var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto))
          );
          --_supporting-text-leading-space: var(--md-filled-field-supporting-text-leading-space, 16px);
          --_supporting-text-line-height: var(
            --md-filled-field-supporting-text-line-height,
            var(--md-sys-typescale-body-small-line-height, 1rem)
          );
          --_supporting-text-size: var(
            --md-filled-field-supporting-text-size,
            var(--md-sys-typescale-body-small-size, 0.75rem)
          );
          --_supporting-text-top-space: var(--md-filled-field-supporting-text-top-space, 4px);
          --_supporting-text-trailing-space: var(--md-filled-field-supporting-text-trailing-space, 16px);
          --_supporting-text-weight: var(
            --md-filled-field-supporting-text-weight,
            var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400))
          );
          --_top-space: var(--md-filled-field-top-space, 16px);
          --_trailing-content-color: var(
            --md-filled-field-trailing-content-color,
            var(--md-sys-color-on-surface-variant, #49454f)
          );
          --_trailing-space: var(--md-filled-field-trailing-space, 16px);
          --_with-label-bottom-space: var(--md-filled-field-with-label-bottom-space, 8px);
          --_with-label-top-space: var(--md-filled-field-with-label-top-space, 8px);
          --_container-shape-start-start: var(
            --md-filled-field-container-shape-start-start,
            var(--md-filled-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
          );
          --_container-shape-start-end: var(
            --md-filled-field-container-shape-start-end,
            var(--md-filled-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
          );
          --_container-shape-end-end: var(
            --md-filled-field-container-shape-end-end,
            var(--md-filled-field-container-shape, var(--md-sys-shape-corner-none, 0px))
          );
          --_container-shape-end-start: var(
            --md-filled-field-container-shape-end-start,
            var(--md-filled-field-container-shape, var(--md-sys-shape-corner-none, 0px))
          );
        }

        .filled .background,
        .filled .state-layer {
          border-radius: inherit;
          inset: 0;
          pointer-events: none;
          position: absolute;
        }

        .filled .background {
          background: var(--_container-color);
        }

        .filled .state-layer {
          visibility: hidden;
        }

        .field:not(.disabled):hover .state-layer {
          visibility: visible;
        }

        .filled .label.floating {
          position: absolute;
          top: var(--_with-label-top-space);
        }

        .filled .field:not(.with-start) .label-wrapper {
          margin-inline-start: var(--_leading-space);
        }

        .filled .field:not(.with-end) .label-wrapper {
          margin-inline-end: var(--_trailing-space);
        }

        .filled .active-indicator {
          inset: auto 0 0 0;
          pointer-events: none;
          position: absolute;
          width: 100%;
          z-index: 1;
        }

        .filled .active-indicator::before,
        .filled .active-indicator::after {
          border-bottom: var(--_active-indicator-height) solid var(--_active-indicator-color);
          inset: auto 0 0 0;
          content: '';
          position: absolute;
          width: 100%;
        }

        .filled .active-indicator::after {
          opacity: 0;
          transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        .filled .focused .active-indicator::after {
          opacity: 1;
        }

        .filled .field:not(.with-start) .content ::slotted(*) {
          padding-inline-start: var(--_leading-space);
        }

        .filled .field:not(.with-end) .content ::slotted(*) {
          padding-inline-end: var(--_trailing-space);
        }

        .filled .field:not(.no-label) .content ::slotted(:not(textarea)) {
          padding-bottom: var(--_with-label-bottom-space);
          padding-top: calc(var(--_with-label-top-space) + var(--_label-text-populated-line-height));
        }

        .filled .field:not(.no-label) .content ::slotted(textarea) {
          margin-bottom: var(--_with-label-bottom-space);
          margin-top: calc(var(--_with-label-top-space) + var(--_label-text-populated-line-height));
        }

        :hover .filled .active-indicator::before {
          border-bottom-color: var(--_hover-active-indicator-color);
          border-bottom-width: var(--_hover-active-indicator-height);
        }

        .filled .active-indicator::after {
          border-bottom-color: var(--_focus-active-indicator-color);
          border-bottom-width: var(--_focus-active-indicator-height);
        }

        :hover .state-layer {
          background: var(--_hover-state-layer-color);
          opacity: var(--_hover-state-layer-opacity);
        }

        .filled .disabled .active-indicator::before {
          border-bottom-color: var(--_disabled-active-indicator-color);
          border-bottom-width: var(--_disabled-active-indicator-height);
          opacity: var(--_disabled-active-indicator-opacity);
        }

        .filled .disabled .background {
          background: var(--_disabled-container-color);
          opacity: var(--_disabled-container-opacity);
        }

        .filled .error .active-indicator::before {
          border-bottom-color: var(--_error-active-indicator-color);
        }

        .filled .error:hover .active-indicator::before {
          border-bottom-color: var(--_error-hover-active-indicator-color);
        }

        .filled .error:hover .state-layer {
          background: var(--_error-hover-state-layer-color);
          opacity: var(--_error-hover-state-layer-opacity);
        }

        .filled .error .active-indicator::after {
          border-bottom-color: var(--_error-focus-active-indicator-color);
        }

        .filled .resizable .container {
          bottom: var(--_focus-active-indicator-height);
          clip-path: inset(var(--_focus-active-indicator-height) 0 0 0);
        }

        .filled .resizable .container > * {
          top: var(--_focus-active-indicator-height);
        }
      }

      @layer hcm {
        @media (forced-colors: active) {
          .filled .disabled .active-indicator::before {
            border-color: GrayText;
            opacity: 1;
          }
        }
      }
    `,
  ]
}
customElements.define('md-field', Field)
