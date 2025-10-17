/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
var _a
import '../internal/elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { html, isServer, LitElement, nothing, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { EASING } from '../internal/motion/animation.js'
import { queryAssignedNodes } from '../utils/query.js'
/**
 * Symbol for tabs to use to animate their indicators based off another tab's
 * indicator.
 */
const INDICATOR = Symbol('indicator')
/**
 * Symbol used by the tab bar to request a tab to animate its indicator from a
 * previously selected tab.
 */
export const ANIMATE_INDICATOR = Symbol('animateIndicator')

/**
 * Tab component.
 */
export class Tab extends LitElement {
  static properties = {
    type: { type: String },
    isTab: { type: Boolean, reflect: true, attribute: 'md-tab' },
    active: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    hasIcon: { type: Boolean, attribute: 'has-icon' },
    iconOnly: { type: Boolean, attribute: 'icon-only' },
    inlineIcon: { type: Boolean, attribute: 'inline-icon' },
  }

  /**
   * @deprecated use `active`
   */
  get selected() {
    return this.active
  }
  set selected(active) {
    this.active = active
  }
  constructor() {
    super()
    this.type = 'secondary'
    /**
     * The attribute `md-tab` indicates that the element is a tab for the parent
     * element, `<md-tabs>`. Make sure if you're implementing your own `md-tab`
     * component that you have an `md-tab` attribute set.
     */
    this.isTab = true
    /**
     * Whether or not the tab is selected.
     **/
    this.active = false
    /**
     * In SSR, set this to true when an icon is present.
     */
    this.hasIcon = false
    /**
     * In SSR, set this to true when there is no label and only an icon.
     */
    this.iconOnly = false
    /**
     * Whether or not the icon renders inline with label or stacked vertically.
     */
    this.inlineIcon = false
    this.fullWidthIndicator = false
    this.internals =
      // Cast needed for closure
      this.attachInternals()
    if (!isServer) {
      this.internals.role = 'tab'
      this.addEventListener('keydown', this.handleKeydown.bind(this))
    }
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.type == 'secondary') {
      this.fullWidthIndicator = true
    }
  }

  render() {
    const indicator = html`<div class="indicator"></div>`
    return html` <div class="wrapper ${this.type}">
      <div class="button" role="presentation" @click=${this.handleContentClick}>
        <md-focus-ring part="focus-ring" inward .control=${this}></md-focus-ring>
        <md-elevation part="elevation"></md-elevation>
        <md-ripple .control=${this}></md-ripple>
        <div class="content ${classMap(this.getContentClasses())}" role="presentation">
          <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
          <slot @slotchange=${this.handleSlotChange}></slot>
          ${this.fullWidthIndicator ? nothing : indicator}
        </div>
        ${this.fullWidthIndicator ? indicator : nothing}
      </div>
    </div>`
  }
  getContentClasses() {
    let cc = {
      'has-icon': this.hasIcon,
      'has-label': !this.iconOnly,
    }
    if (this.type == 'primary') {
      cc = {
        ...this.getContentClassesPrimary(),
        ...cc,
      }
    }
    return cc
  }

  getContentClassesPrimary() {
    return {
      stacked: !this.inlineIcon,
    }
  }

  updated() {
    this.internals.ariaSelected = String(this.active)
  }
  async handleKeydown(event) {
    // Allow event to bubble.
    await 0
    if (event.defaultPrevented) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      // Prevent default behavior such as scrolling when pressing spacebar.
      event.preventDefault()
      this.click()
    }
  }
  handleContentClick(event) {
    // Ensure the "click" target is always the tab, and not content, by stopping
    // propagation of content clicks and re-clicking the host.
    event.stopPropagation()
    this.click()
  }
  [((_a = INDICATOR), ANIMATE_INDICATOR)](previousTab) {
    if (!this[INDICATOR]) {
      return
    }
    this[INDICATOR].getAnimations().forEach((a) => {
      a.cancel()
    })
    const frames = this.getKeyframes(previousTab)
    if (frames !== null) {
      this[INDICATOR].animate(frames, {
        duration: 250,
        easing: EASING.EMPHASIZED,
      })
    }
  }
  getKeyframes(previousTab) {
    const reduceMotion = shouldReduceMotion()
    if (!this.active) {
      return reduceMotion ? [{ opacity: 1 }, { transform: 'none' }] : null
    }
    const from = {}
    const fromRect = previousTab[INDICATOR]?.getBoundingClientRect() ?? {}
    const fromPos = fromRect.left
    const fromExtent = fromRect.width
    const toRect = this[INDICATOR].getBoundingClientRect()
    const toPos = toRect.left
    const toExtent = toRect.width
    const scale = fromExtent / toExtent
    if (!reduceMotion && fromPos !== undefined && toPos !== undefined && !isNaN(scale)) {
      from['transform'] = `translateX(${(fromPos - toPos).toFixed(4)}px) scaleX(${scale.toFixed(4)})`
    } else {
      from['opacity'] = 0
    }
    // note, including `transform: none` avoids quirky Safari behavior
    // that can hide the animation.
    return [from, { transform: 'none' }]
  }
  handleSlotChange() {
    this.iconOnly = false
    // Check if there's any label text or elements. If not, then there is only
    // an icon.
    for (const node of this.assignedDefaultNodes) {
      const hasTextContent = node.nodeType === Node.TEXT_NODE && !!node.wholeText.match(/\S/)
      if (node.nodeType === Node.ELEMENT_NODE || hasTextContent) {
        return
      }
    }
    this.iconOnly = true
  }
  handleIconSlotChange() {
    // this.hasIcon = this.assignedIcons.length > 0
  }

  get assignedDefaultNodes() {
    let r = queryAssignedNodes(this, { flatten: true })
    // console.log("AR:", r)
    return r
  }

  static styles = [
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        outline: none;
        padding: 0 16px;
        position: relative;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        vertical-align: middle;
        user-select: none;
        font-family: var(--_label-text-font);
        font-size: var(--_label-text-size);
        line-height: var(--_label-text-line-height);
        font-weight: var(--_label-text-weight);
        color: var(--_label-text-color);
        z-index: 0;
        --md-ripple-hover-color: var(--_hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
        --md-elevation-level: var(--_container-elevation);
      }
      md-focus-ring {
        --md-focus-ring-shape: 8px;
      }
      :host([active]) md-focus-ring {
        margin-bottom: calc(var(--_active-indicator-height) + 1px);
      }
      .button::before {
        background: var(--_container-color);
        content: '';
        inset: 0;
        position: absolute;
        z-index: -1;
      }
      .button::before,
      md-ripple,
      md-elevation {
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-end-radius: var(--_container-shape-end-end);
        border-end-start-radius: var(--_container-shape-end-start);
      }
      .content {
        position: relative;
        box-sizing: border-box;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        height: var(--_container-height);
        gap: 8px;
      }
      .indicator {
        position: absolute;
        box-sizing: border-box;
        z-index: -1;
        transform-origin: bottom left;
        background: var(--_active-indicator-color);
        border-radius: var(--_active-indicator-shape);
        height: var(--_active-indicator-height);
        inset: auto 0 0 0;
        opacity: 0;
      }
      ::slotted([slot='icon']) {
        display: inline-flex;
        position: relative;
        writing-mode: horizontal-tb;
        fill: currentColor;
        color: var(--_icon-color);
        font-size: var(--_icon-size);
        width: var(--_icon-size);
        height: var(--_icon-size);
      }
      :host(:hover) {
        color: var(--_hover-label-text-color);
        cursor: pointer;
      }
      :host(:hover) ::slotted([slot='icon']) {
        color: var(--_hover-icon-color);
      }
      :host(:focus) {
        color: var(--_focus-label-text-color);
      }
      :host(:focus) ::slotted([slot='icon']) {
        color: var(--_focus-icon-color);
      }
      :host(:active) {
        color: var(--_pressed-label-text-color);
      }
      :host(:active) ::slotted([slot='icon']) {
        color: var(--_pressed-icon-color);
      }
      :host([active]) .indicator {
        opacity: 1;
      }
      :host([active]) {
        color: var(--_active-label-text-color);
        --md-ripple-hover-color: var(--_active-hover-state-layer-color);
        --md-ripple-hover-opacity: var(--_active-hover-state-layer-opacity);
        --md-ripple-pressed-color: var(--_active-pressed-state-layer-color);
        --md-ripple-pressed-opacity: var(--_active-pressed-state-layer-opacity);
      }
      :host([active]) ::slotted([slot='icon']) {
        color: var(--_active-icon-color);
      }
      :host([active]:hover) {
        color: var(--_active-hover-label-text-color);
      }
      :host([active]:hover) ::slotted([slot='icon']) {
        color: var(--_active-hover-icon-color);
      }
      :host([active]:focus) {
        color: var(--_active-focus-label-text-color);
      }
      :host([active]:focus) ::slotted([slot='icon']) {
        color: var(--_active-focus-icon-color);
      }
      :host([active]:active) {
        color: var(--_active-pressed-label-text-color);
      }
      :host([active]:active) ::slotted([slot='icon']) {
        color: var(--_active-pressed-icon-color);
      }
      :host,
      ::slotted(*) {
        white-space: nowrap;
      }
      @media (forced-colors: active) {
        .indicator {
          background: CanvasText;
        }
      }
    `,
    css`
      .wrapper.primary {
        --_active-indicator-color: var(--md-primary-tab-active-indicator-color, var(--md-sys-color-primary, #6750a4));
        --_active-indicator-height: var(--md-primary-tab-active-indicator-height, 3px);
        --_active-indicator-shape: var(--md-primary-tab-active-indicator-shape, 3px 3px 0px 0px);
        --_active-hover-state-layer-color: var(
          --md-primary-tab-active-hover-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_active-hover-state-layer-opacity: var(--md-primary-tab-active-hover-state-layer-opacity, 0.08);
        --_active-pressed-state-layer-color: var(
          --md-primary-tab-active-pressed-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_active-pressed-state-layer-opacity: var(--md-primary-tab-active-pressed-state-layer-opacity, 0.12);
        --_container-color: var(--md-primary-tab-container-color, var(--md-sys-color-surface, #fef7ff));
        --_container-elevation: var(--md-primary-tab-container-elevation, 0);
        --_container-height: var(--md-primary-tab-container-height, 48px);
        --_with-icon-and-label-text-container-height: var(
          --md-primary-tab-with-icon-and-label-text-container-height,
          64px
        );
        --_hover-state-layer-color: var(
          --md-primary-tab-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-state-layer-opacity: var(--md-primary-tab-hover-state-layer-opacity, 0.08);
        --_pressed-state-layer-color: var(
          --md-primary-tab-pressed-state-layer-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_pressed-state-layer-opacity: var(--md-primary-tab-pressed-state-layer-opacity, 0.12);
        --_active-focus-icon-color: var(--md-primary-tab-active-focus-icon-color, var(--md-sys-color-primary, #6750a4));
        --_active-hover-icon-color: var(--md-primary-tab-active-hover-icon-color, var(--md-sys-color-primary, #6750a4));
        --_active-icon-color: var(--md-primary-tab-active-icon-color, var(--md-sys-color-primary, #6750a4));
        --_active-pressed-icon-color: var(
          --md-primary-tab-active-pressed-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_icon-size: var(--md-primary-tab-icon-size, 24px);
        --_focus-icon-color: var(--md-primary-tab-focus-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_hover-icon-color: var(--md-primary-tab-hover-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_icon-color: var(--md-primary-tab-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_pressed-icon-color: var(--md-primary-tab-pressed-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_label-text-font: var(
          --md-primary-tab-label-text-font,
          var(--md-sys-typescale-title-small-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-primary-tab-label-text-line-height,
          var(--md-sys-typescale-title-small-line-height, 1.25rem)
        );
        --_label-text-size: var(--md-primary-tab-label-text-size, var(--md-sys-typescale-title-small-size, 0.875rem));
        --_label-text-weight: var(
          --md-primary-tab-label-text-weight,
          var(--md-sys-typescale-title-small-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_active-focus-label-text-color: var(
          --md-primary-tab-active-focus-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_active-hover-label-text-color: var(
          --md-primary-tab-active-hover-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_active-label-text-color: var(--md-primary-tab-active-label-text-color, var(--md-sys-color-primary, #6750a4));
        --_active-pressed-label-text-color: var(
          --md-primary-tab-active-pressed-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_focus-label-text-color: var(
          --md-primary-tab-focus-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-label-text-color: var(
          --md-primary-tab-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_label-text-color: var(--md-primary-tab-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_pressed-label-text-color: var(
          --md-primary-tab-pressed-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_container-shape-start-start: var(
          --md-primary-tab-container-shape-start-start,
          var(--md-primary-tab-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_container-shape-start-end: var(
          --md-primary-tab-container-shape-start-end,
          var(--md-primary-tab-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_container-shape-end-end: var(
          --md-primary-tab-container-shape-end-end,
          var(--md-primary-tab-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_container-shape-end-start: var(
          --md-primary-tab-container-shape-end-start,
          var(--md-primary-tab-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
      }
      .content.stacked {
        flex-direction: column;
        gap: 2px;
      }
      .content.stacked.has-icon.has-label {
        height: var(--_with-icon-and-label-text-container-height);
      }
    `,
    css`
      .wrapper.secondary {
        --_active-indicator-color: var(--md-secondary-tab-active-indicator-color, var(--md-sys-color-primary, #6750a4));
        --_active-indicator-height: var(--md-secondary-tab-active-indicator-height, 2px);
        --_active-label-text-color: var(
          --md-secondary-tab-active-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_container-color: var(--md-secondary-tab-container-color, var(--md-sys-color-surface, #fef7ff));
        --_container-elevation: var(--md-secondary-tab-container-elevation, 0);
        --_container-height: var(--md-secondary-tab-container-height, 48px);
        --_focus-label-text-color: var(
          --md-secondary-tab-focus-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-label-text-color: var(
          --md-secondary-tab-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-state-layer-color: var(
          --md-secondary-tab-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_hover-state-layer-opacity: var(--md-secondary-tab-hover-state-layer-opacity, 0.08);
        --_label-text-font: var(
          --md-secondary-tab-label-text-font,
          var(--md-sys-typescale-title-small-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-secondary-tab-label-text-line-height,
          var(--md-sys-typescale-title-small-line-height, 1.25rem)
        );
        --_label-text-size: var(--md-secondary-tab-label-text-size, var(--md-sys-typescale-title-small-size, 0.875rem));
        --_label-text-weight: var(
          --md-secondary-tab-label-text-weight,
          var(--md-sys-typescale-title-small-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-label-text-color: var(
          --md-secondary-tab-pressed-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_pressed-state-layer-color: var(
          --md-secondary-tab-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_pressed-state-layer-opacity: var(--md-secondary-tab-pressed-state-layer-opacity, 0.12);
        --_active-focus-icon-color: var(--md-secondary-tab-active-focus-icon-color,);
        --_active-focus-label-text-color: var(
          --md-secondary-tab-active-focus-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-hover-icon-color: var(--md-secondary-tab-active-hover-icon-color,);
        --_active-hover-label-text-color: var(
          --md-secondary-tab-active-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-hover-state-layer-color: var(
          --md-secondary-tab-active-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-hover-state-layer-opacity: var(--md-secondary-tab-active-hover-state-layer-opacity, 0.08);
        --_active-icon-color: var(--md-secondary-tab-active-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_active-indicator-shape: var(--md-secondary-tab-active-indicator-shape, 0);
        --_active-pressed-icon-color: var(--md-secondary-tab-active-pressed-icon-color,);
        --_active-pressed-label-text-color: var(
          --md-secondary-tab-active-pressed-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-pressed-state-layer-color: var(
          --md-secondary-tab-active-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-pressed-state-layer-opacity: var(--md-secondary-tab-active-pressed-state-layer-opacity, 0.12);
        --_label-text-color: var(--md-secondary-tab-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_focus-icon-color: var(--md-secondary-tab-focus-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_hover-icon-color: var(--md-secondary-tab-hover-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_icon-size: var(--md-secondary-tab-icon-size, 24px);
        --_icon-color: var(--md-secondary-tab-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
        --_pressed-icon-color: var(--md-secondary-tab-pressed-icon-color, var(--md-sys-color-on-surface, #1d1b20));
        --_container-shape-start-start: var(
          --md-secondary-tab-container-shape-start-start,
          var(--md-secondary-tab-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_container-shape-start-end: var(
          --md-secondary-tab-container-shape-start-end,
          var(--md-secondary-tab-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_container-shape-end-end: var(
          --md-secondary-tab-container-shape-end-end,
          var(--md-secondary-tab-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_container-shape-end-start: var(
          --md-secondary-tab-container-shape-end-start,
          var(--md-secondary-tab-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
      }
    `,
  ]
}

function shouldReduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

customElements.define('md-tab', Tab)
