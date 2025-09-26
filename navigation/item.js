/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../focus/focus-ring.js'
import '../ripple/ripple.js'
import '../badge/badge.js'
import { css, html, LitElement, nothing } from 'lit'
import { literal, html as staticHtml } from 'lit/static-html.js'
import { classMap } from 'lit/directives/class-map.js'
import { sharedStyles } from '../shared/shared.css.js'
import '../buttons/button.js'

/**
 * Used with nav bar and nav rail.
 */
export class NavigationItem extends LitElement {
  static properties = {
    disabled: { type: Boolean },
    active: { type: Boolean, reflect: true },
    hideInactiveLabel: { type: Boolean, attribute: 'hide-inactive-label' },
    label: { type: String },
    badgeValue: { type: String, attribute: 'badge-value' },
    showBadge: { type: Boolean, attribute: 'show-badge' },
    href: { type: String },
    /**
     * This will the label horizontally instead of vertically.
     */
    expanded: { type: Boolean },
  }
  constructor() {
    super()
    this.disabled = false
    this.active = false
    this.hideInactiveLabel = false
    this.label = ''
    this.badgeValue = ''
    this.showBadge = false
    this.href = ''
    this.expanded = false
  }
  render() {
    // Needed for closure conformance

    const { ariaLabel } = this
    // const tag = this.href ? literal`div` : literal`button`
    return staticHtml` <div
      class="md3-navigation-tab flex col g12 ${classMap(this.getRenderClasses())}"
      role="tab"
      aria-selected="${this.active}"
      aria-label=${ariaLabel || nothing}
      tabindex="${this.active ? 0 : -1}"
      @click="${this.handleClick}"
      >
      ${this.href && this.renderLink()}
      ${this.expanded ? this.renderButton() : this.renderTab()}
    </div>`
  }
  getRenderClasses() {
    return {
      wrapper: true,
      expanded: this.expanded,
      'md3-navigation-tab--hide-inactive-label': this.hideInactiveLabel,
      'md3-navigation-tab--active': this.active,
    }
  }

  renderTab() {
    let flexDir = this.expanded ? 'expanded row aic jcc' : 'col'
    return html` <md-focus-ring part="focus-ring" inward></md-focus-ring>
      <md-ripple ?disabled="${this.disabled}" class="md3-navigation-tab__ripple"></md-ripple>
      <div class="flex ${flexDir} g8 aic jcc">
        <div aria-hidden="true" class="md3-navigation-tab__icon-content">
          <span class="md3-navigation-tab__active-indicator"></span>
          <span class="md3-navigation-tab__icon">
            <slot name="inactive-icon"></slot>
          </span>
          <span class="md3-navigation-tab__icon md3-navigation-tab__icon--active">
            <slot name="active-icon"></slot>
          </span>
          ${this.renderBadge()}
        </div>
        <div>${this.renderLabel()}</div>
      </div>`
  }

  renderButton() {
    // let button = document.createElement('md-button')
    // button.color = 'tonal'
    // button.size = 'medium'
    // button.innerHTML = this.label
    let color = this.active ? 'tonal' : 'text'
    let style = this.active
      ? '--md-button-label-text-color: var(--md-sys-color-secondary);'
      : '--md-button-label-text-color: var(--md-sys-color-on-surface-variant);'
    // todo: deal with active and inactive icons
    return html`
      <md-button color="${color}" size="medium" style="${style}">
        <slot name="active-icon" slot="icon"></slot>
        ${this.label}
      </md-button>
    `
  }

  renderBadge() {
    return this.showBadge ? html`<md-badge .value="${this.badgeValue}"></md-badge>` : nothing
  }
  renderLabel() {
    // Needed for closure conformance
    const { ariaLabel } = this
    const ariaHidden = ariaLabel ? 'true' : 'false'
    return !this.label
      ? nothing
      : html` <span aria-hidden="${ariaHidden}" class="md3-navigation-tab__label-text">${this.label}</span>`
  }
  renderLink() {
    // Needed for closure conformance
    const { ariaLabel } = this
    return html`
      <a
        style="z-index: 1000;"
        class="link"
        id="link"
        href="${this.href}"
        target="${this.target || nothing}"
        aria-label="${ariaLabel || nothing}"
      ></a>
    `
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties)
    const event = new Event('navigation-tab-rendered', {
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }
  focus() {
    const buttonElement = this.buttonElement
    if (buttonElement) {
      buttonElement.focus()
    }
  }
  blur() {
    const buttonElement = this.buttonElement
    if (buttonElement) {
      buttonElement.blur()
    }
  }
  handleClick() {
    // b/269772145 - connect to ripple
    this.dispatchEvent(
      new CustomEvent('navigation-tab-interaction', {
        detail: { state: this },
        bubbles: true,
        composed: true,
      }),
    )
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        --_active-indicator-color: var(
          --md-navigation-bar-active-indicator-color,
          var(--md-sys-color-secondary-container, #e8def8)
        );
        --_active-indicator-height: var(--md-navigation-bar-active-indicator-height, 32px);
        --_active-indicator-shape: var(
          --md-navigation-bar-active-indicator-shape,
          var(--md-sys-shape-corner-full, 9999px)
        );
        --_active-indicator-width: var(--md-navigation-bar-active-indicator-width, 64px);
        --_active-focus-icon-color: var(
          --md-navigation-bar-active-focus-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_active-focus-label-text-color: var(
          --md-navigation-bar-active-focus-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-focus-state-layer-color: var(
          --md-navigation-bar-active-focus-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-hover-icon-color: var(
          --md-navigation-bar-active-hover-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_active-hover-label-text-color: var(
          --md-navigation-bar-active-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-hover-state-layer-color: var(
          --md-navigation-bar-active-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-icon-color: var(
          --md-navigation-bar-active-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_active-label-text-color: var(
          --md-navigation-bar-active-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-label-text-weight: var(
          --md-navigation-bar-active-label-text-weight,
          var(--md-sys-typescale-label-medium-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
        );
        --_active-pressed-icon-color: var(
          --md-navigation-bar-active-pressed-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_active-pressed-label-text-color: var(
          --md-navigation-bar-active-pressed-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-pressed-state-layer-color: var(
          --md-navigation-bar-active-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_container-color: var(--md-navigation-bar-container-color, var(--md-sys-color-surface-container, #f3edf7));
        --_container-elevation: var(--md-navigation-bar-container-elevation, 2);
        --_container-height: var(--md-navigation-bar-container-height, 64px);
        --_container-shape: var(--md-navigation-bar-container-shape, var(--md-sys-shape-corner-none, 0px));
        --_focus-state-layer-opacity: var(--md-navigation-bar-focus-state-layer-opacity, 0.12);
        --_hover-state-layer-opacity: var(--md-navigation-bar-hover-state-layer-opacity, 0.08);
        --_icon-size: var(--md-navigation-bar-icon-size, 24px);
        --_inactive-focus-icon-color: var(
          --md-navigation-bar-inactive-focus-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-focus-label-text-color: var(
          --md-navigation-bar-inactive-focus-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-focus-state-layer-color: var(
          --md-navigation-bar-inactive-focus-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-hover-icon-color: var(
          --md-navigation-bar-inactive-hover-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-hover-label-text-color: var(
          --md-navigation-bar-inactive-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-hover-state-layer-color: var(
          --md-navigation-bar-inactive-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-icon-color: var(
          --md-navigation-bar-inactive-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_inactive-label-text-color: var(
          --md-navigation-bar-inactive-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_inactive-pressed-icon-color: var(
          --md-navigation-bar-inactive-pressed-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-pressed-label-text-color: var(
          --md-navigation-bar-inactive-pressed-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-pressed-state-layer-color: var(
          --md-navigation-bar-inactive-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_label-text-font: var(
          --md-navigation-bar-label-text-font,
          var(--md-sys-typescale-label-medium-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-navigation-bar-label-text-line-height,
          var(--md-sys-typescale-label-medium-line-height, 1rem)
        );
        --_label-text-size: var(--md-navigation-bar-label-text-size, var(--md-sys-typescale-label-medium-size, 12px));
        --_label-text-tracking: var(--md-navigation-bar-label-text-tracking);
        --_label-text-type: var(
          --md-navigation-bar-label-text-type,
          var(--md-sys-typescale-label-medium-weight, var(--md-ref-typeface-weight-medium, 500))
            var(--md-sys-typescale-label-medium-size, 0.75rem) / var(--md-sys-typescale-label-medium-line-height, 1rem)
            var(--md-sys-typescale-label-medium-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-weight: var(
          --md-navigation-bar-label-text-weight,
          var(--md-sys-typescale-label-medium-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-state-layer-opacity: var(--md-navigation-bar-pressed-state-layer-opacity, 0.12);
        display: flex;
        flex-grow: 1;
      }

      md-focus-ring {
        --md-focus-ring-shape: var(--md-sys-shape-corner-small, 8px);
        --md-focus-ring-inward-offset: -1px;
      }

      .md3-navigation-tab {
        appearance: none;
        background: none;
        border: none;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        min-width: 48px;
        outline: none;
        padding: 6px 0px 6px;
        position: relative;
        text-align: center;
        width: 100%;
        font-family: var(--_label-text-font);
        font-size: var(--_label-text-size);
        line-height: var(--_label-text-line-height);
        font-weight: var(--_label-text-weight);
        text-transform: inherit;
      }

      .md3-navigation-tab::-moz-focus-inner {
        border: 0;
        padding: 0;
      }

      .md3-navigation-tab__icon-content {
        align-items: center;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        position: relative;
        z-index: 1;
      }

      .md3-navigation-tab__active-indicator {
        display: flex;
        justify-content: center;
        opacity: 0;
        position: absolute;
        transition: width 100ms cubic-bezier(0.4, 0, 0.2, 1), opacity 100ms cubic-bezier(0.4, 0, 0.2, 1);
        width: 32px;
        background-color: var(--_active-indicator-color);
        border-radius: var(--_active-indicator-shape);
      }

      .md3-navigation-tab--active .md3-navigation-tab__active-indicator {
        opacity: 1;
      }

      .md3-navigation-tab__active-indicator,
      .md3-navigation-tab__icon-content {
        height: var(--_active-indicator-height);
      }

      .md3-navigation-tab--active .md3-navigation-tab__active-indicator,
      .md3-navigation-tab__icon-content {
        width: var(--_active-indicator-width);
      }

      .md3-navigation-tab__icon {
        fill: currentColor;
        align-self: center;
        display: inline-block;
        position: relative;
        width: var(--_icon-size);
        height: var(--_icon-size);
        font-size: var(--_icon-size);
      }

      .md3-navigation-tab__icon.md3-navigation-tab__icon--active {
        display: none;
      }

      .md3-navigation-tab--active .md3-navigation-tab__icon {
        display: none;
      }

      .md3-navigation-tab--active .md3-navigation-tab__icon.md3-navigation-tab__icon--active {
        display: inline-block;
      }

      .md3-navigation-tab__ripple {
        z-index: 0;
      }

      .md3-navigation-tab--active {
        --md-ripple-hover-color: var(--_active-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_active-pressed-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      .md3-navigation-tab--active .md3-navigation-tab__icon {
        color: var(--_active-icon-color);
      }

      .md3-navigation-tab--active .md3-navigation-tab__label-text {
        color: var(--_active-label-text-color);
      }

      .md3-navigation-tab--active:hover .md3-navigation-tab__icon {
        color: var(--_active-hover-icon-color);
      }

      .md3-navigation-tab--active:hover .md3-navigation-tab__label-text {
        color: var(--_active-hover-label-text-color);
      }

      .md3-navigation-tab--active:focus .md3-navigation-tab__icon {
        color: var(--_active-focus-icon-color);
      }

      .md3-navigation-tab--active:focus .md3-navigation-tab__label-text {
        color: var(--_active-focus-label-text-color);
      }

      .md3-navigation-tab--active:active .md3-navigation-tab__icon {
        color: var(--_active-pressed-icon-color);
      }

      .md3-navigation-tab--active:active .md3-navigation-tab__label-text {
        color: var(--_active-pressed-label-text-color);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active) {
        --md-ripple-hover-color: var(--_inactive-hover-state-layer-color);
        --md-ripple-pressed-color: var(--_inactive-pressed-state-layer-color);
        --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
        --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active) .md3-navigation-tab__icon {
        color: var(--_inactive-icon-color);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active) .md3-navigation-tab__label-text {
        color: var(--_inactive-label-text-color);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active):hover .md3-navigation-tab__icon {
        color: var(--_inactive-hover-icon-color);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active):hover .md3-navigation-tab__label-text {
        color: var(--_inactive-hover-label-text-color);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active):focus .md3-navigation-tab__icon {
        color: var(--_inactive-focus-icon-color);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active):focus .md3-navigation-tab__label-text {
        color: var(--_inactive-focus-label-text-color);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active):active .md3-navigation-tab__icon {
        color: var(--_inactive-pressed-icon-color);
      }

      .md3-navigation-tab:not(.md3-navigation-tab--active):active .md3-navigation-tab__label-text {
        color: var(--_inactive-pressed-label-text-color);
      }

      .wrapper.expanded {
        justify-content: start;
        align-items: start;
        padding: 0;
      }
      .link {
        height: 100%;
        outline: none;
        position: absolute;
        width: 100%;
      }
      .expanded {
        font-size: 14px;
      }
      .expanded .md3-navigation-tab__label-text {
        font-size: 14px;
      }
    `,
  ]
}
customElements.define('md-nav-item', NavigationItem)
