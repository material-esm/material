/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { html, LitElement, css, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { redispatchEvent } from '../internal/events/redispatch-event.js'
/**
 * A chip component.
 *
 * @fires update-focus {Event} Dispatched when `disabled` is toggled. --bubbles
 */
export class Chip extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    alwaysFocusable: { type: Boolean, attribute: 'always-focusable' },
    label: { type: String },
    hasIcon: { type: Boolean, reflect: true },
    type: { type: String },

    elevated: { type: Boolean },
    href: { type: String },
    target: { type: String },

    removable: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    hasSelectedIcon: { type: Boolean, reflect: true, attribute: 'has-selected-icon' },
    value: { type: String },

    avatar: { type: Boolean },
    removeOnly: { type: Boolean, attribute: 'remove-only' },
  }

  constructor() {
    super(...arguments)
    /**
     * Whether or not the chip is disabled.
     *
     * Disabled chips are not focusable, unless `always-focusable` is set.
     */
    this.disabled = false
    /**
     * When true, allow disabled chips to be focused with arrow keys.
     *
     * Add this when a chip needs increased visibility when disabled. See
     * https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls
     * for more guidance on when this is needed.
     */
    this.alwaysFocusable = false
    /**
     * The label of the chip.
     */
    this.label = ''
    /**
     * Only needed for SSR.
     *
     * Add this attribute when a chip has a `slot="icon"` to avoid a Flash Of
     * Unstyled Content.
     */
    this.hasIcon = false

    /**
     * The type of chip.
     *
     * assist, filter, input, suggestion
     */
    this.type = 'assist'

    this.elevated = false
    this.href = ''
    this.target = ''

    this.removable = false
    this.selected = false
    /**
     * Only needed for SSR.
     *
     * Add this attribute when a filter chip has a `slot="selected-icon"` to avoid
     * a Flash Of Unstyled Content.
     */
    this.hasSelectedIcon = false
    this.value = ''

    this.avatar = false
    this.removeOnly = false

    this.handleTrailingActionFocus = this.handleTrailingActionFocus.bind(this)
    this.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.type == 'input') {
      this.removable = true
    }
  }

  render() {
    return html`<div class="wrapper ${this.type}">
      <div class="container ${classMap(this.getContainerClasses())}">${this.renderContainerContent()}</div>
    </div>`
  }
  updated(changed) {
    if (changed.has('disabled') && changed.get('disabled') !== undefined) {
      this.dispatchEvent(new Event('update-focus', { bubbles: true }))
    }
  }
  getContainerClasses() {
    let cc = {
      disabled: this.disabled,
      'has-icon': this.hasIcon,
      avatar: this.avatar,
    }
    if (this.type == 'assist' || this.type == 'suggestion') {
      cc = {
        ...this.getContainerClassesAssist(),
        ...cc,
      }
    } else if (this.type == 'filter') {
      cc = {
        ...this.getContainerClassesFilter(),
        ...cc,
      }
    } else if (this.type == 'input') {
      cc = {
        ...this.getContainerClassesInput(),
        ...cc,
      }
    }
    return cc
  }

  renderPrimaryContent() {
    return html`
      <span class="leading icon" aria-hidden="true"> ${this.renderLeadingIcon()} </span>
      <span class="label">${this.label}</span>
      <span class="touch"></span>
    `
  }
  handleIconChange(event) {
    const slot = event.target
    this.hasIcon = slot.assignedElements({ flatten: true }).length > 0
  }

  // ASSIST

  /**
   * Whether or not the primary ripple is disabled (defaults to `disabled`).
   * Some chip actions such as links cannot be disabled.
   */
  get rippleDisabled() {
    // Link chips cannot be disabled
    return !this.href && this.disabled
  }
  getContainerClassesAssist() {
    return {
      // Link chips cannot be disabled
      disabled: !this.href && this.disabled,
      elevated: this.elevated,
      link: !!this.href,
    }
  }

  renderOutline() {
    if (this.elevated) {
      return html`<md-elevation part="elevation"></md-elevation>`
    }
    return html`<span class="outline"></span>`
  }

  // FILTER
  getContainerClassesFilter() {
    return {
      elevated: this.elevated,
      selected: this.selected,
      'has-trailing': this.removable,
      'has-icon': this.hasIcon || this.selected,
    }
  }

  renderLeadingIcon() {
    console.log('renderLeadingIcon, selected?', this.selected)
    if (!this.selected) {
      return html`<slot name="icon" @slotchange=${this.handleIconChange}></slot>`
    }
    return html`
      <slot name="selected-icon">
        <svg class="checkmark" viewBox="0 0 18 18" aria-hidden="true">
          <path
            d="M6.75012 12.1274L3.62262 8.99988L2.55762 10.0574L6.75012 14.2499L15.7501 5.24988L14.6926 4.19238L6.75012 12.1274Z" />
        </svg>
      </slot>
    `
  }

  renderTrailingAction(focusListener) {
    if (this.removable) {
      return renderRemoveButton({
        focusListener,
        ariaLabel: this.ariaLabelRemove,
        disabled: this.disabled,
        tabbable: this.removeOnly,
      })
    }
    return nothing
  }

  handleClick(event) {
    if (this.disabled) {
      return
    }
    if (!(this.type == 'filter')) {
      return
    }
    // Store prevValue to revert in case `chip.selected` is changed during an
    // event listener.
    const prevValue = this.selected
    this.selected = !this.selected
    const preventDefault = !redispatchEvent(this, event)
    if (preventDefault) {
      // We should not do `this.selected = !this.selected`, since a client
      // click listener could change its value. Instead, always revert to the
      // original value.
      this.selected = prevValue
      return
    }
  }

  get ariaLabelRemove() {
    if (this.hasAttribute(ARIA_LABEL_REMOVE)) {
      return this.getAttribute(ARIA_LABEL_REMOVE)
    }
    const { ariaLabel } = this
    return `Remove ${ariaLabel || this.label}`
  }
  set ariaLabelRemove(ariaLabel) {
    const prev = this.ariaLabelRemove
    if (ariaLabel === prev) {
      return
    }
    if (ariaLabel === null) {
      this.removeAttribute(ARIA_LABEL_REMOVE)
    } else {
      this.setAttribute(ARIA_LABEL_REMOVE, ariaLabel)
    }
    this.requestUpdate()
  }
  focus(options) {
    if (this.disabled && !this.alwaysFocusable) {
      return
    }
    const isFocusable = this.alwaysFocusable || !this.disabled
    if (isFocusable && options?.trailing && this.trailingAction) {
      this.trailingAction.focus(options)
      return
    }
    super.focus(options)
  }

  renderContainerContent() {
    let h = html`
      ${this.renderOutline()}
      <md-focus-ring part="focus-ring" for=${this.primaryId}></md-focus-ring>
      <md-ripple for=${this.primaryId} ?disabled=${this.rippleDisabled}></md-ripple>
      ${this.renderPrimaryAction(this.renderPrimaryContent())}
    `
    return html` ${h} ${this.renderTrailingAction(this.handleTrailingActionFocus)} `
  }
  handleKeyDown(event) {
    const isLeft = event.key === 'ArrowLeft'
    const isRight = event.key === 'ArrowRight'
    // Ignore non-navigation keys.
    if (!isLeft && !isRight) {
      return
    }
    if (!this.primaryAction || !this.trailingAction) {
      // Does not have multiple actions.
      return
    }
    // Check if moving forwards or backwards
    const isRtl = getComputedStyle(this).direction === 'rtl'
    const forwards = isRtl ? isLeft : isRight
    const isPrimaryFocused = this.primaryAction?.matches(':focus-within')
    const isTrailingFocused = this.trailingAction?.matches(':focus-within')
    if ((forwards && isTrailingFocused) || (!forwards && isPrimaryFocused)) {
      // Moving outside of the chip, it will be handled by the chip set.
      return
    }
    // Prevent default interactions, such as scrolling.
    event.preventDefault()
    // Don't let the chip set handle this navigation event.
    event.stopPropagation()
    const actionToFocus = forwards ? this.trailingAction : this.primaryAction
    actionToFocus.focus()
  }
  handleTrailingActionFocus() {
    const { primaryAction, trailingAction } = this
    if (!primaryAction || !trailingAction) {
      return
    }
    // Temporarily turn off the primary action's focusability. This allows
    // shift+tab from the trailing action to move to the previous chip rather
    // than the primary action in the same chip.
    primaryAction.tabIndex = -1
    trailingAction.addEventListener(
      'focusout',
      () => {
        primaryAction.tabIndex = 0
      },
      { once: true },
    )
  }

  get primaryId() {
    if (this.href) {
      return 'link'
    }
    if (this.removeOnly) {
      return ''
    }
    return 'button'
  }
  get primaryAction() {
    // Don't use @query() since a remove-only input chip still has a span that
    // has "primary action" classes.
    if (this.removeOnly) {
      return null
    }
    return this.renderRoot.querySelector('.primary.action')
  }
  getContainerClassesInput() {
    return {
      // Link chips cannot be disabled
      disabled: !this.href && this.disabled,
      link: !!this.href,
      selected: this.selected,
      'has-trailing': true,
    }
  }

  renderPrimaryAction(content) {
    const { ariaLabel } = this
    if (this.href) {
      return html`
        <a
          class="primary action"
          id="link"
          aria-label=${ariaLabel || nothing}
          href=${this.href}
          target=${this.target || nothing}
          >${content}</a
        >
      `
    }
    if (this.removeOnly) {
      return html` <span class="primary action" aria-label=${ariaLabel || nothing}> ${content} </span> `
    }
    return html`
      <button
        class="primary action"
        id="button"
        aria-label=${ariaLabel || nothing}
        aria-pressed=${this.selected}
        ?disabled=${this.disabled && !this.alwaysFocusable}
        type="button"
        @click=${this.handleClick}>
        ${content}
      </button>
    `
  }

  static styles = [
    css`
      .wrapper {
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
        display: inline-flex;
        height: var(--_container-height);
        cursor: pointer;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
        --_avatar-shape: var(--md-input-chip-avatar-shape, var(--md-sys-shape-corner-full, 9999px));
        --_avatar-size: var(--md-input-chip-avatar-size, 24px);
        --_disabled-avatar-opacity: var(--md-input-chip-disabled-avatar-opacity, 0.38);
      }
      .wrapper([avatar]) {
        --_container-shape-start-start: var(
          --md-input-chip-container-shape-start-start,
          var(--md-input-chip-container-shape, calc(var(--_container-height) / 2))
        );
        --_container-shape-start-end: var(
          --md-input-chip-container-shape-start-end,
          var(--md-input-chip-container-shape, calc(var(--_container-height) / 2))
        );
        --_container-shape-end-end: var(
          --md-input-chip-container-shape-end-end,
          var(--md-input-chip-container-shape, calc(var(--_container-height) / 2))
        );
        --_container-shape-end-start: var(
          --md-input-chip-container-shape-end-start,
          var(--md-input-chip-container-shape, calc(var(--_container-height) / 2))
        );
      }
      .avatar .primary.action {
        padding-inline-start: 4px;
      }
      .avatar .leading.icon ::slotted(:first-child) {
        border-radius: var(--_avatar-shape);
        height: var(--_avatar-size);
        width: var(--_avatar-size);
      }
      .disabled.avatar .leading.icon {
        opacity: var(--_disabled-avatar-opacity);
      }
      @media (forced-colors: active) {
        .link .outline {
          border-color: ActiveText;
        }
        .disabled.avatar .leading.icon {
          opacity: 1;
        }
      }
      .wrapper([disabled]) {
        pointer-events: none;
      }
      .wrapper([touch-target='wrapper']) {
        margin: max(0px, (48px - var(--_container-height))/2) 0;
      }
      md-focus-ring {
        --md-focus-ring-shape-start-start: var(--_container-shape-start-start);
        --md-focus-ring-shape-start-end: var(--_container-shape-start-end);
        --md-focus-ring-shape-end-end: var(--_container-shape-end-end);
        --md-focus-ring-shape-end-start: var(--_container-shape-end-start);
      }
      .container {
        border-radius: inherit;
        box-sizing: border-box;
        display: flex;
        height: 100%;
        position: relative;
        width: 100%;
      }
      .container::before {
        border-radius: inherit;
        content: '';
        inset: 0;
        pointer-events: none;
        position: absolute;
      }
      .container:not(.disabled) {
        cursor: pointer;
      }
      .container.disabled {
        pointer-events: none;
      }
      .cell {
        display: flex;
      }
      .action {
        align-items: baseline;
        appearance: none;
        background: none;
        border: none;
        border-radius: inherit;
        display: flex;
        outline: none;
        padding: 0;
        position: relative;
        text-decoration: none;
      }
      .primary.action {
        padding-inline-start: var(--_leading-space);
        padding-inline-end: var(--_trailing-space);
      }
      .has-icon .primary.action {
        padding-inline-start: var(--_with-leading-icon-leading-space);
      }
      .touch {
        height: 48px;
        inset: 50% 0 0;
        position: absolute;
        transform: translateY(-50%);
        width: 100%;
      }
      .wrapper([touch-target='none']) .touch {
        display: none;
      }
      .outline {
        border: var(--_outline-width) solid var(--_outline-color);
        border-radius: inherit;
        inset: 0;
        pointer-events: none;
        position: absolute;
      }
      :where(:focus) .outline {
        border-color: var(--_focus-outline-color);
      }
      :where(.disabled) .outline {
        border-color: var(--_disabled-outline-color);
        opacity: var(--_disabled-outline-opacity);
      }
      md-ripple {
        border-radius: inherit;
      }
      .label,
      .icon,
      .touch {
        z-index: 1;
      }
      .label {
        align-items: center;
        color: var(--_label-text-color);
        display: flex;
        font-family: var(--_label-text-font);
        font-size: var(--_label-text-size);
        line-height: var(--_label-text-line-height);
        font-weight: var(--_label-text-weight);
        height: 100%;
        text-overflow: ellipsis;
        user-select: none;
        white-space: nowrap;
      }
      :where(:hover) .label {
        color: var(--_hover-label-text-color);
      }
      :where(:focus) .label {
        color: var(--_focus-label-text-color);
      }
      :where(:active) .label {
        color: var(--_pressed-label-text-color);
      }
      :where(.disabled) .label {
        color: var(--_disabled-label-text-color);
        opacity: var(--_disabled-label-text-opacity);
      }
      .icon {
        align-self: center;
        display: flex;
        fill: currentColor;
        position: relative;
      }
      .icon ::slotted(:first-child) {
        font-size: var(--_icon-size);
        height: var(--_icon-size);
        width: var(--_icon-size);
      }
      .leading.icon {
        color: var(--_leading-icon-color);
      }
      .leading.icon ::slotted(*),
      .leading.icon svg {
        margin-inline-end: var(--_icon-label-space);
      }
      :where(:hover) .leading.icon {
        color: var(--_hover-leading-icon-color);
      }
      :where(:focus) .leading.icon {
        color: var(--_focus-leading-icon-color);
      }
      :where(:active) .leading.icon {
        color: var(--_pressed-leading-icon-color);
      }
      :where(.disabled) .leading.icon {
        color: var(--_disabled-leading-icon-color);
        opacity: var(--_disabled-leading-icon-opacity);
      }
      @media (forced-colors: active) {
        :where(.disabled) :is(.label, .outline, .leading.icon) {
          color: GrayText;
          opacity: 1;
        }
      }
      a,
      button {
        text-transform: inherit;
      }
      a,
      button:not(:disabled) {
        cursor: inherit;
      }
    `,
    css`
      .elevated {
        --md-elevation-level: var(--_elevated-container-elevation);
        --md-elevation-shadow-color: var(--_elevated-container-shadow-color);
      }
      .elevated::before {
        background: var(--_elevated-container-color);
      }
      .elevated:hover {
        --md-elevation-level: var(--_elevated-hover-container-elevation);
      }
      .elevated:focus-within {
        --md-elevation-level: var(--_elevated-focus-container-elevation);
      }
      .elevated:active {
        --md-elevation-level: var(--_elevated-pressed-container-elevation);
      }
      .elevated.disabled {
        --md-elevation-level: var(--_elevated-disabled-container-elevation);
      }
      .elevated.disabled::before {
        background: var(--_elevated-disabled-container-color);
        opacity: var(--_elevated-disabled-container-opacity);
      }
      @media (forced-colors: active) {
        .elevated md-elevation {
          border: 1px solid CanvasText;
        }
        .elevated.disabled md-elevation {
          border-color: GrayText;
        }
      }
    `,
    css`
      .wrapper.assist {
        --_container-height: var(--md-assist-chip-container-height, 32px);
        --_disabled-label-text-color: var(
          --md-assist-chip-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-assist-chip-disabled-label-text-opacity, 0.38);
        --_elevated-container-color: var(
          --md-assist-chip-elevated-container-color,
          var(--md-sys-color-surface-container-low, #f7f2fa)
        );
        --_elevated-container-elevation: var(--md-assist-chip-elevated-container-elevation, 1);
        --_elevated-container-shadow-color: var(
          --md-assist-chip-elevated-container-shadow-color,
          var(--md-sys-color-shadow, #000)
        );
        --_elevated-disabled-container-color: var(
          --md-assist-chip-elevated-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_elevated-disabled-container-elevation: var(--md-assist-chip-elevated-disabled-container-elevation, 0);
        --_elevated-disabled-container-opacity: var(--md-assist-chip-elevated-disabled-container-opacity, 0.12);
        --_elevated-focus-container-elevation: var(--md-assist-chip-elevated-focus-container-elevation, 1);
        --_elevated-hover-container-elevation: var(--md-assist-chip-elevated-hover-container-elevation, 2);
        --_elevated-pressed-container-elevation: var(--md-assist-chip-elevated-pressed-container-elevation, 1);
        --_focus-label-text-color: var(
          --md-assist-chip-focus-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-label-text-color: var(
          --md-assist-chip-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-state-layer-color: var(
          --md-assist-chip-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-state-layer-opacity: var(--md-assist-chip-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(--md-assist-chip-label-text-color, var(--md-sys-color-on-surface, #1d1b20));
        --_label-text-font: var(
          --md-assist-chip-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-assist-chip-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(--md-assist-chip-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
        --_label-text-weight: var(
          --md-assist-chip-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-label-text-color: var(
          --md-assist-chip-pressed-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_pressed-state-layer-color: var(
          --md-assist-chip-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_pressed-state-layer-opacity: var(--md-assist-chip-pressed-state-layer-opacity, 0.12);
        --_disabled-outline-color: var(
          --md-assist-chip-disabled-outline-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-outline-opacity: var(--md-assist-chip-disabled-outline-opacity, 0.12);
        --_focus-outline-color: var(--md-assist-chip-focus-outline-color, var(--md-sys-color-on-surface, #1d1b20));
        --_outline-color: var(--md-assist-chip-outline-color, var(--md-sys-color-outline, #79747e));
        --_outline-width: var(--md-assist-chip-outline-width, 1px);
        --_disabled-leading-icon-color: var(
          --md-assist-chip-disabled-leading-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-leading-icon-opacity: var(--md-assist-chip-disabled-leading-icon-opacity, 0.38);
        --_focus-leading-icon-color: var(
          --md-assist-chip-focus-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-leading-icon-color: var(
          --md-assist-chip-hover-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_leading-icon-color: var(--md-assist-chip-leading-icon-color, var(--md-sys-color-primary, #6750a4));
        --_icon-size: var(--md-assist-chip-icon-size, 18px);
        --_pressed-leading-icon-color: var(
          --md-assist-chip-pressed-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_container-shape-start-start: var(
          --md-assist-chip-container-shape-start-start,
          var(--md-assist-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-start-end: var(
          --md-assist-chip-container-shape-start-end,
          var(--md-assist-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-end-end: var(
          --md-assist-chip-container-shape-end-end,
          var(--md-assist-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-end-start: var(
          --md-assist-chip-container-shape-end-start,
          var(--md-assist-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_leading-space: var(--md-assist-chip-leading-space, 16px);
        --_trailing-space: var(--md-assist-chip-trailing-space, 16px);
        --_icon-label-space: var(--md-assist-chip-icon-label-space, 8px);
        --_with-leading-icon-leading-space: var(--md-assist-chip-with-leading-icon-leading-space, 8px);
      }
      @media (forced-colors: active) {
        .link .outline {
          border-color: ActiveText;
        }
      }
    `,
    css`
      .wrapper.suggestion {
        --_container-height: var(--md-suggestion-chip-container-height, 32px);
        --_disabled-label-text-color: var(
          --md-suggestion-chip-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-suggestion-chip-disabled-label-text-opacity, 0.38);
        --_elevated-container-color: var(
          --md-suggestion-chip-elevated-container-color,
          var(--md-sys-color-surface-container-low, #f7f2fa)
        );
        --_elevated-container-elevation: var(--md-suggestion-chip-elevated-container-elevation, 1);
        --_elevated-container-shadow-color: var(
          --md-suggestion-chip-elevated-container-shadow-color,
          var(--md-sys-color-shadow, #000)
        );
        --_elevated-disabled-container-color: var(
          --md-suggestion-chip-elevated-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_elevated-disabled-container-elevation: var(--md-suggestion-chip-elevated-disabled-container-elevation, 0);
        --_elevated-disabled-container-opacity: var(--md-suggestion-chip-elevated-disabled-container-opacity, 0.12);
        --_elevated-focus-container-elevation: var(--md-suggestion-chip-elevated-focus-container-elevation, 1);
        --_elevated-hover-container-elevation: var(--md-suggestion-chip-elevated-hover-container-elevation, 2);
        --_elevated-pressed-container-elevation: var(--md-suggestion-chip-elevated-pressed-container-elevation, 1);
        --_focus-label-text-color: var(
          --md-suggestion-chip-focus-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-label-text-color: var(
          --md-suggestion-chip-hover-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-state-layer-color: var(
          --md-suggestion-chip-hover-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-state-layer-opacity: var(--md-suggestion-chip-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(
          --md-suggestion-chip-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_label-text-font: var(
          --md-suggestion-chip-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-suggestion-chip-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(
          --md-suggestion-chip-label-text-size,
          var(--md-sys-typescale-label-large-size, 0.875rem)
        );
        --_label-text-weight: var(
          --md-suggestion-chip-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-label-text-color: var(
          --md-suggestion-chip-pressed-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-state-layer-color: var(
          --md-suggestion-chip-pressed-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-state-layer-opacity: var(--md-suggestion-chip-pressed-state-layer-opacity, 0.12);
        --_disabled-outline-color: var(
          --md-suggestion-chip-disabled-outline-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-outline-opacity: var(--md-suggestion-chip-disabled-outline-opacity, 0.12);
        --_focus-outline-color: var(
          --md-suggestion-chip-focus-outline-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_outline-color: var(--md-suggestion-chip-outline-color, var(--md-sys-color-outline, #79747e));
        --_outline-width: var(--md-suggestion-chip-outline-width, 1px);
        --_disabled-leading-icon-color: var(
          --md-suggestion-chip-disabled-leading-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-leading-icon-opacity: var(--md-suggestion-chip-disabled-leading-icon-opacity, 0.38);
        --_focus-leading-icon-color: var(
          --md-suggestion-chip-focus-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-leading-icon-color: var(
          --md-suggestion-chip-hover-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_leading-icon-color: var(--md-suggestion-chip-leading-icon-color, var(--md-sys-color-primary, #6750a4));
        --_pressed-leading-icon-color: var(
          --md-suggestion-chip-pressed-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_icon-size: var(--md-suggestion-chip-icon-size, 18px);
        --_container-shape-start-start: var(
          --md-suggestion-chip-container-shape-start-start,
          var(--md-suggestion-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-start-end: var(
          --md-suggestion-chip-container-shape-start-end,
          var(--md-suggestion-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-end-end: var(
          --md-suggestion-chip-container-shape-end-end,
          var(--md-suggestion-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-end-start: var(
          --md-suggestion-chip-container-shape-end-start,
          var(--md-suggestion-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_leading-space: var(--md-suggestion-chip-leading-space, 16px);
        --_trailing-space: var(--md-suggestion-chip-trailing-space, 16px);
        --_icon-label-space: var(--md-suggestion-chip-icon-label-space, 8px);
        --_with-leading-icon-leading-space: var(--md-suggestion-chip-with-leading-icon-leading-space, 8px);
      }
      @media (forced-colors: active) {
        .link .outline {
          border-color: ActiveText;
        }
      }
    `,
    css`
      .wrapper.filter {
        --_container-height: var(--md-filter-chip-container-height, 32px);
        --_disabled-label-text-color: var(
          --md-filter-chip-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-filter-chip-disabled-label-text-opacity, 0.38);
        --_elevated-container-elevation: var(--md-filter-chip-elevated-container-elevation, 1);
        --_elevated-container-shadow-color: var(
          --md-filter-chip-elevated-container-shadow-color,
          var(--md-sys-color-shadow, #000)
        );
        --_elevated-disabled-container-color: var(
          --md-filter-chip-elevated-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_elevated-disabled-container-elevation: var(--md-filter-chip-elevated-disabled-container-elevation, 0);
        --_elevated-disabled-container-opacity: var(--md-filter-chip-elevated-disabled-container-opacity, 0.12);
        --_elevated-focus-container-elevation: var(--md-filter-chip-elevated-focus-container-elevation, 1);
        --_elevated-hover-container-elevation: var(--md-filter-chip-elevated-hover-container-elevation, 2);
        --_elevated-pressed-container-elevation: var(--md-filter-chip-elevated-pressed-container-elevation, 1);
        --_elevated-selected-container-color: var(
          --md-filter-chip-elevated-selected-container-color,
          var(--md-sys-color-secondary-container, #e8def8)
        );
        --_label-text-font: var(
          --md-filter-chip-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-filter-chip-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(--md-filter-chip-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
        --_label-text-weight: var(
          --md-filter-chip-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_selected-focus-label-text-color: var(
          --md-filter-chip-selected-focus-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-label-text-color: var(
          --md-filter-chip-selected-hover-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-state-layer-color: var(
          --md-filter-chip-selected-hover-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-state-layer-opacity: var(--md-filter-chip-selected-hover-state-layer-opacity, 0.08);
        --_selected-label-text-color: var(
          --md-filter-chip-selected-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-pressed-label-text-color: var(
          --md-filter-chip-selected-pressed-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-pressed-state-layer-color: var(
          --md-filter-chip-selected-pressed-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_selected-pressed-state-layer-opacity: var(--md-filter-chip-selected-pressed-state-layer-opacity, 0.12);
        --_elevated-container-color: var(
          --md-filter-chip-elevated-container-color,
          var(--md-sys-color-surface-container-low, #f7f2fa)
        );
        --_disabled-outline-color: var(
          --md-filter-chip-disabled-outline-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-outline-opacity: var(--md-filter-chip-disabled-outline-opacity, 0.12);
        --_disabled-selected-container-color: var(
          --md-filter-chip-disabled-selected-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-selected-container-opacity: var(--md-filter-chip-disabled-selected-container-opacity, 0.12);
        --_focus-outline-color: var(
          --md-filter-chip-focus-outline-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_outline-color: var(--md-filter-chip-outline-color, var(--md-sys-color-outline, #79747e));
        --_outline-width: var(--md-filter-chip-outline-width, 1px);
        --_selected-container-color: var(
          --md-filter-chip-selected-container-color,
          var(--md-sys-color-secondary-container, #e8def8)
        );
        --_selected-outline-width: var(--md-filter-chip-selected-outline-width, 0px);
        --_focus-label-text-color: var(
          --md-filter-chip-focus-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-label-text-color: var(
          --md-filter-chip-hover-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-state-layer-color: var(
          --md-filter-chip-hover-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-state-layer-opacity: var(--md-filter-chip-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(--md-filter-chip-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_pressed-label-text-color: var(
          --md-filter-chip-pressed-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-state-layer-color: var(
          --md-filter-chip-pressed-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_pressed-state-layer-opacity: var(--md-filter-chip-pressed-state-layer-opacity, 0.12);
        --_icon-size: var(--md-filter-chip-icon-size, 18px);
        --_disabled-leading-icon-color: var(
          --md-filter-chip-disabled-leading-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-leading-icon-opacity: var(--md-filter-chip-disabled-leading-icon-opacity, 0.38);
        --_selected-focus-leading-icon-color: var(
          --md-filter-chip-selected-focus-leading-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-leading-icon-color: var(
          --md-filter-chip-selected-hover-leading-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-leading-icon-color: var(
          --md-filter-chip-selected-leading-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-pressed-leading-icon-color: var(
          --md-filter-chip-selected-pressed-leading-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_focus-leading-icon-color: var(
          --md-filter-chip-focus-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-leading-icon-color: var(
          --md-filter-chip-hover-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_leading-icon-color: var(--md-filter-chip-leading-icon-color, var(--md-sys-color-primary, #6750a4));
        --_pressed-leading-icon-color: var(
          --md-filter-chip-pressed-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_disabled-trailing-icon-color: var(
          --md-filter-chip-disabled-trailing-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-trailing-icon-opacity: var(--md-filter-chip-disabled-trailing-icon-opacity, 0.38);
        --_selected-focus-trailing-icon-color: var(
          --md-filter-chip-selected-focus-trailing-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-trailing-icon-color: var(
          --md-filter-chip-selected-hover-trailing-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-pressed-trailing-icon-color: var(
          --md-filter-chip-selected-pressed-trailing-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-trailing-icon-color: var(
          --md-filter-chip-selected-trailing-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_focus-trailing-icon-color: var(
          --md-filter-chip-focus-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-trailing-icon-color: var(
          --md-filter-chip-hover-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-trailing-icon-color: var(
          --md-filter-chip-pressed-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_trailing-icon-color: var(
          --md-filter-chip-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_container-shape-start-start: var(
          --md-filter-chip-container-shape-start-start,
          var(--md-filter-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-start-end: var(
          --md-filter-chip-container-shape-start-end,
          var(--md-filter-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-end-end: var(
          --md-filter-chip-container-shape-end-end,
          var(--md-filter-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-end-start: var(
          --md-filter-chip-container-shape-end-start,
          var(--md-filter-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_leading-space: var(--md-filter-chip-leading-space, 16px);
        --_trailing-space: var(--md-filter-chip-trailing-space, 16px);
        --_icon-label-space: var(--md-filter-chip-icon-label-space, 8px);
        --_with-leading-icon-leading-space: var(--md-filter-chip-with-leading-icon-leading-space, 8px);
        --_with-trailing-icon-trailing-space: var(--md-filter-chip-with-trailing-icon-trailing-space, 8px);
      }
      .selected.elevated::before {
        background: var(--_elevated-selected-container-color);
      }
      .checkmark {
        height: var(--_icon-size);
        width: var(--_icon-size);
      }
      .disabled .checkmark {
        opacity: var(--_disabled-leading-icon-opacity);
      }
      @media (forced-colors: active) {
        .disabled .checkmark {
          opacity: 1;
        }
      }
    `,
    css`
      .trailing.action {
        align-items: center;
        justify-content: center;
        padding-inline-start: var(--_icon-label-space);
        padding-inline-end: var(--_with-trailing-icon-trailing-space);
      }
      .trailing.action :is(md-ripple, md-focus-ring) {
        border-radius: 50%;
        height: calc(1.3333333333 * var(--_icon-size));
        width: calc(1.3333333333 * var(--_icon-size));
      }
      .trailing.action md-focus-ring {
        inset: unset;
      }
      .has-trailing .primary.action {
        padding-inline-end: 0;
      }
      .trailing.icon {
        color: var(--_trailing-icon-color);
        height: var(--_icon-size);
        width: var(--_icon-size);
      }
      :where(:hover) .trailing.icon {
        color: var(--_hover-trailing-icon-color);
      }
      :where(:focus) .trailing.icon {
        color: var(--_focus-trailing-icon-color);
      }
      :where(:active) .trailing.icon {
        color: var(--_pressed-trailing-icon-color);
      }
      :where(.disabled) .trailing.icon {
        color: var(--_disabled-trailing-icon-color);
        opacity: var(--_disabled-trailing-icon-opacity);
      }
      :where(.selected) .trailing.icon {
        color: var(--_selected-trailing-icon-color);
      }
      :where(.selected:hover) .trailing.icon {
        color: var(--_selected-hover-trailing-icon-color);
      }
      :where(.selected:focus) .trailing.icon {
        color: var(--_selected-focus-trailing-icon-color);
      }
      :where(.selected:active) .trailing.icon {
        color: var(--_selected-pressed-trailing-icon-color);
      }
      @media (forced-colors: active) {
        .trailing.icon {
          color: ButtonText;
        }
        :where(.disabled) .trailing.icon {
          color: GrayText;
          opacity: 1;
        }
      }
    `,
    css`
      .selected {
        --md-ripple-hover-color: var(--_selected-hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_selected-hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_selected-pressed-state-layer-opacity);
      }
      :where(.selected)::before {
        background: var(--_selected-container-color);
      }
      :where(.selected) .outline {
        border-width: var(--_selected-outline-width);
      }
      :where(.selected.disabled)::before {
        background: var(--_disabled-selected-container-color);
        opacity: var(--_disabled-selected-container-opacity);
      }
      :where(.selected) .label {
        color: var(--_selected-label-text-color);
      }
      :where(.selected:hover) .label {
        color: var(--_selected-hover-label-text-color);
      }
      :where(.selected:focus) .label {
        color: var(--_selected-focus-label-text-color);
      }
      :where(.selected:active) .label {
        color: var(--_selected-pressed-label-text-color);
      }
      :where(.selected) .leading.icon {
        color: var(--_selected-leading-icon-color);
      }
      :where(.selected:hover) .leading.icon {
        color: var(--_selected-hover-leading-icon-color);
      }
      :where(.selected:focus) .leading.icon {
        color: var(--_selected-focus-leading-icon-color);
      }
      :where(.selected:active) .leading.icon {
        color: var(--_selected-pressed-leading-icon-color);
      }
      @media (forced-colors: active) {
        :where(.selected:not(.elevated))::before {
          border: 1px solid CanvasText;
        }
        :where(.selected) .outline {
          border-width: 1px;
        }
      }
    `,
    css`
      .wrapper.input {
        --_container-height: var(--md-input-chip-container-height, 32px);
        --_disabled-label-text-color: var(
          --md-input-chip-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-label-text-opacity: var(--md-input-chip-disabled-label-text-opacity, 0.38);
        --_disabled-selected-container-color: var(
          --md-input-chip-disabled-selected-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-selected-container-opacity: var(--md-input-chip-disabled-selected-container-opacity, 0.12);
        --_label-text-font: var(
          --md-input-chip-label-text-font,
          var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-input-chip-label-text-line-height,
          var(--md-sys-typescale-label-large-line-height, 1.25rem)
        );
        --_label-text-size: var(--md-input-chip-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
        --_label-text-weight: var(
          --md-input-chip-label-text-weight,
          var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_selected-container-color: var(
          --md-input-chip-selected-container-color,
          var(--md-sys-color-secondary-container, #e8def8)
        );
        --_selected-focus-label-text-color: var(
          --md-input-chip-selected-focus-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-label-text-color: var(
          --md-input-chip-selected-hover-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-state-layer-color: var(
          --md-input-chip-selected-hover-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-state-layer-opacity: var(--md-input-chip-selected-hover-state-layer-opacity, 0.08);
        --_selected-label-text-color: var(
          --md-input-chip-selected-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-outline-width: var(--md-input-chip-selected-outline-width, 0px);
        --_selected-pressed-label-text-color: var(
          --md-input-chip-selected-pressed-label-text-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-pressed-state-layer-color: var(
          --md-input-chip-selected-pressed-state-layer-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-pressed-state-layer-opacity: var(--md-input-chip-selected-pressed-state-layer-opacity, 0.12);
        --_disabled-outline-color: var(--md-input-chip-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-outline-opacity: var(--md-input-chip-disabled-outline-opacity, 0.12);
        --_focus-label-text-color: var(
          --md-input-chip-focus-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_focus-outline-color: var(
          --md-input-chip-focus-outline-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-label-text-color: var(
          --md-input-chip-hover-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-state-layer-color: var(
          --md-input-chip-hover-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-state-layer-opacity: var(--md-input-chip-hover-state-layer-opacity, 0.08);
        --_label-text-color: var(--md-input-chip-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_outline-color: var(--md-input-chip-outline-color, var(--md-sys-color-outline, #79747e));
        --_outline-width: var(--md-input-chip-outline-width, 1px);
        --_pressed-label-text-color: var(
          --md-input-chip-pressed-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-state-layer-color: var(
          --md-input-chip-pressed-state-layer-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-state-layer-opacity: var(--md-input-chip-pressed-state-layer-opacity, 0.12);

        --_disabled-leading-icon-color: var(
          --md-input-chip-disabled-leading-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-leading-icon-opacity: var(--md-input-chip-disabled-leading-icon-opacity, 0.38);
        --_icon-size: var(--md-input-chip-icon-size, 18px);
        --_selected-focus-leading-icon-color: var(
          --md-input-chip-selected-focus-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_selected-hover-leading-icon-color: var(
          --md-input-chip-selected-hover-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_selected-leading-icon-color: var(
          --md-input-chip-selected-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_selected-pressed-leading-icon-color: var(
          --md-input-chip-selected-pressed-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_focus-leading-icon-color: var(
          --md-input-chip-focus-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_hover-leading-icon-color: var(
          --md-input-chip-hover-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_leading-icon-color: var(--md-input-chip-leading-icon-color, var(--md-sys-color-primary, #6750a4));
        --_pressed-leading-icon-color: var(
          --md-input-chip-pressed-leading-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_disabled-trailing-icon-color: var(
          --md-input-chip-disabled-trailing-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_disabled-trailing-icon-opacity: var(--md-input-chip-disabled-trailing-icon-opacity, 0.38);
        --_selected-focus-trailing-icon-color: var(
          --md-input-chip-selected-focus-trailing-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-hover-trailing-icon-color: var(
          --md-input-chip-selected-hover-trailing-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-pressed-trailing-icon-color: var(
          --md-input-chip-selected-pressed-trailing-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_selected-trailing-icon-color: var(
          --md-input-chip-selected-trailing-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_focus-trailing-icon-color: var(
          --md-input-chip-focus-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_hover-trailing-icon-color: var(
          --md-input-chip-hover-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_pressed-trailing-icon-color: var(
          --md-input-chip-pressed-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_trailing-icon-color: var(
          --md-input-chip-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_container-shape-start-start: var(
          --md-input-chip-container-shape-start-start,
          var(--md-input-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-start-end: var(
          --md-input-chip-container-shape-start-end,
          var(--md-input-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-end-end: var(
          --md-input-chip-container-shape-end-end,
          var(--md-input-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_container-shape-end-start: var(
          --md-input-chip-container-shape-end-start,
          var(--md-input-chip-container-shape, var(--md-sys-shape-corner-small, 8px))
        );
        --_leading-space: var(--md-input-chip-leading-space, 16px);
        --_trailing-space: var(--md-input-chip-trailing-space, 16px);
        --_icon-label-space: var(--md-input-chip-icon-label-space, 8px);
        --_with-leading-icon-leading-space: var(--md-input-chip-with-leading-icon-leading-space, 8px);
        --_with-trailing-icon-trailing-space: var(--md-input-chip-with-trailing-icon-trailing-space, 8px);
      }
    `,
  ]
}
;(() => {
  requestUpdateOnAriaChange(Chip)
})()
/** @nocollapse */
Chip.shadowRootOptions = {
  ...LitElement.shadowRootOptions,
  delegatesFocus: true,
}
const ARIA_LABEL_REMOVE = 'aria-label-remove'

export function renderRemoveButton({ ariaLabel, disabled, focusListener, tabbable = false }) {
  return html`
    <button
      class="trailing action"
      aria-label=${ariaLabel}
      tabindex=${!tabbable ? -1 : nothing}
      @click=${handleRemoveClick}
      @focus=${focusListener}>
      <md-focus-ring part="trailing-focus-ring"></md-focus-ring>
      <md-ripple ?disabled=${disabled}></md-ripple>
      <span class="trailing icon" aria-hidden="true">
        <slot name="remove-trailing-icon">
          <svg viewBox="0 96 960 960">
            <path
              d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" />
          </svg>
        </slot>
      </span>
      <span class="touch"></span>
    </button>
  `
}
function handleRemoveClick(event) {
  if (this.disabled) {
    return
  }
  event.stopPropagation()
  const preventDefault = !this.dispatchEvent(new Event('remove', { cancelable: true }))
  if (preventDefault) {
    return
  }
  this.remove()
}

customElements.define('md-chip', Chip)
