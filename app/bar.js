/**
 * @license
 * Copyright 2024 Google LLC / Material ESM Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css, nothing } from 'lit'
import '../text/text-field.js'
import '../icon/icon.js'
import '../internal/elevation/elevation.js'

/**
 * Material Design 3 Top App Bar component.
 *
 * Implements the Material Design 3 App Bar specification:
 * https://m3.material.io/components/app-bars/overview
 *
 * Variants supported:
 * - `small`: Standard 64px single-row top app bar with left-aligned title.
 * - `center-aligned`: 64px single-row top app bar with centered title.
 * - `medium-flexible`: 112px–136px two-row flexible bar, collapses to 64px on scroll.
 * - `large-flexible`: 120px–152px two-row flexible bar, collapses to 64px on scroll.
 * - `search`: 64px search bar with embedded search text field.
 *
 * @fires search {CustomEvent<{value: string}>} Dispatched when search is submitted.
 * @fires input {Event} Dispatched when search input value changes.
 * @fires change {Event} Dispatched when search input commits value.
 */
export class AppBar extends LitElement {
  static properties = {
    /** App bar variant: 'small' | 'center-aligned' | 'medium-flexible' | 'large-flexible' | 'search' */
    type: { type: String, reflect: true },
    /** Alias for `type` */
    variant: { type: String },
    /** Main headline / title text */
    headline: { type: String },
    /** Alias for `headline` */
    title: { type: String },
    /** Backwards-compatible label property (used as title or search field label) */
    label: { type: String },
    /** Optional subtitle text */
    subtitle: { type: String },
    /** Shorthand boolean attribute to center-align the headline */
    centerAligned: { type: Boolean, attribute: 'center-aligned', reflect: true },
    /** Whether the app bar has elevation and surface-container color applied from scrolling */
    scrolled: { type: Boolean, reflect: true },
    /** Whether a flexible (medium/large) app bar is collapsed down to 64px */
    collapsed: { type: Boolean, reflect: true },
    /** Automatic scroll response: 'none' | 'scroll' | 'collapse' */
    scrollBehavior: { type: String, attribute: 'scroll-behavior' },
    /** CSS selector of scroll target or 'window' */
    scrollTarget: { type: String, attribute: 'scroll-target' },
    /** Placeholder for search variant text field */
    placeholder: { type: String },
    /** Value for search variant text field */
    value: { type: String },
    /** Internal state indicating whether search field has text */
    _hasSearchValue: { state: true },
  }

  constructor() {
    super()
    this.type = 'small'
    this.variant = ''
    this.headline = ''
    this.title = ''
    this.label = ''
    this.subtitle = ''
    this.centerAligned = false
    this.scrolled = false
    this.collapsed = false
    this.scrollBehavior = 'none'
    this.scrollTarget = 'window'
    this.placeholder = 'Search'
    this.value = ''
    this._hasSearchValue = false

    this._onScroll = this._handleScroll.bind(this)
    this._currentTarget = null
  }

  connectedCallback() {
    super.connectedCallback()
    this._attachScrollListener()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._detachScrollListener()
  }

  updated(changedProperties) {
    super.updated(changedProperties)
    if (changedProperties.has('scrollBehavior') || changedProperties.has('scrollTarget')) {
      this._detachScrollListener()
      this._attachScrollListener()
    }
    if (changedProperties.has('value')) {
      this._hasSearchValue = Boolean(this.value)
    }
  }

  /**
   * Returns current effective variant type.
   */
  get _effectiveType() {
    const v = (this.variant || this.type || 'small').toLowerCase()
    if (this.centerAligned || v === 'center-aligned' || v === 'center') {
      return 'center-aligned'
    }
    if (v === 'medium' || v === 'medium-flexible') {
      return 'medium-flexible'
    }
    if (v === 'large' || v === 'large-flexible') {
      return 'large-flexible'
    }
    if (v === 'search') {
      return 'search'
    }
    return 'small'
  }

  get _isSearch() {
    return this._effectiveType === 'search'
  }

  get _isFlexible() {
    const t = this._effectiveType
    return t === 'medium-flexible' || t === 'large-flexible'
  }

  get _isCenterAligned() {
    return this._effectiveType === 'center-aligned'
  }

  get _headlineText() {
    return this.headline || this.title || (!this._isSearch ? this.label : '') || ''
  }

  get _hasSubtitle() {
    return Boolean(this.subtitle)
  }

  _getScrollTargetElement() {
    if (!this.scrollTarget || this.scrollTarget === 'window') {
      return window
    }
    const root = this.getRootNode()
    if (root && typeof root.querySelector === 'function') {
      const el = root.querySelector(this.scrollTarget)
      if (el) return el
    }
    return document.querySelector(this.scrollTarget) || window
  }

  _attachScrollListener() {
    if (!this.scrollBehavior || this.scrollBehavior === 'none') {
      return
    }
    const target = this._getScrollTargetElement()
    if (target) {
      target.addEventListener('scroll', this._onScroll, { passive: true })
      this._currentTarget = target
      // Check initial scroll offset
      this._handleScroll()
    }
  }

  _detachScrollListener() {
    if (this._currentTarget) {
      this._currentTarget.removeEventListener('scroll', this._onScroll)
      this._currentTarget = null
    }
  }

  _handleScroll() {
    const target = this._currentTarget || this._getScrollTargetElement()
    const scrollTop = target === window ? window.scrollY : target.scrollTop
    const isScrolled = scrollTop > 4

    if (this.scrolled !== isScrolled) {
      this.scrolled = isScrolled
    }

    if (this.scrollBehavior === 'collapse' && this._isFlexible) {
      const collapseThreshold = this._effectiveType === 'large-flexible' ? 56 : 40
      const isCollapsed = scrollTop > collapseThreshold
      if (this.collapsed !== isCollapsed) {
        this.collapsed = isCollapsed
      }
    }
  }

  _handleSearchInput(e) {
    const input = e.target
    this.value = input.value
    this._hasSearchValue = Boolean(input.value)
  }

  _handleSearchChange(e) {
    const input = e.target
    this.value = input.value
  }

  _handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      this.dispatchEvent(
        new CustomEvent('search', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  _clearSearch() {
    this.value = ''
    this._hasSearchValue = false
    const input = this.renderRoot?.querySelector('#search-input')
    if (input) {
      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    }
  }

  render() {
    if (this._isSearch) {
      return this._renderSearchAppBar()
    }

    const type = this._effectiveType
    const isFlexible = this._isFlexible
    const isCollapsed = isFlexible && this.collapsed
    const isCenterAligned = this._isCenterAligned

    return html`
      <header
        class="md3-app-bar md3-app-bar--${type} ${this.scrolled ? 'scrolled' : ''} ${isCollapsed ? 'collapsed' : ''} ${this._hasSubtitle ? 'has-subtitle' : ''}"
        role="banner">
        <md-elevation part="elevation"></md-elevation>

        <!-- Top row: Navigation icon, title (for small/center, or collapsed flexible), and action items -->
        <div class="md3-app-bar__row md3-app-bar__top-row">
          <!-- Leading / Navigation icon -->
          <div class="md3-app-bar__leading">
            <slot name="navigation-icon">
              <slot name="leading-icon"></slot>
            </slot>
          </div>

          <!-- Top headline container -->
          <div
            class="md3-app-bar__headline-container ${isCenterAligned ? 'center-aligned' : ''} ${isFlexible ? 'flexible-top-headline' : ''}">
            <div class="md3-app-bar__headline" part="headline">
              ${
                !isFlexible || isCollapsed
                  ? html`<slot name="headline"><slot name="title">${this._headlineText}</slot></slot>`
                  : this._headlineText
              }
            </div>
            ${
              !isFlexible && this._hasSubtitle
                ? html`
                    <div class="md3-app-bar__subtitle" part="subtitle">
                      <slot name="subtitle">${this.subtitle}</slot>
                    </div>
                  `
                : nothing
            }
          </div>

          <!-- Trailing action items -->
          <div class="md3-app-bar__trailing">
            <slot name="action-items">
              <slot name="trailing-icon"></slot>
            </slot>
          </div>
        </div>

        <!-- Lower row: Expanded headline & subtitle for medium/large flexible variants -->
        ${
          isFlexible
            ? html`
                <div class="md3-app-bar__flexible-row" part="flexible-container">
                  <div class="md3-app-bar__flexible-headline" part="headline">
                    ${
                      !isCollapsed
                        ? html`<slot name="headline"><slot name="title">${this._headlineText}</slot></slot>`
                        : this._headlineText
                    }
                  </div>
                  ${
                    this._hasSubtitle
                      ? html`
                          <div class="md3-app-bar__subtitle" part="subtitle">
                            <slot name="subtitle">${this.subtitle}</slot>
                          </div>
                        `
                      : nothing
                  }
                </div>
              `
            : nothing
        }

        <!-- Bottom extension / tabs / divider slot -->
        <slot></slot>
      </header>
    `
  }

  _renderSearchAppBar() {
    return html`
      <header class="md3-app-bar md3-app-bar--search ${this.scrolled ? 'scrolled' : ''}" role="banner">
        <md-elevation part="elevation"></md-elevation>

        <div class="md3-app-bar__row md3-app-bar__search-row">
          <div class="md3-app-bar__leading">
            <slot name="navigation-icon">
              <slot name="leading-icon"></slot>
            </slot>
          </div>

          <div class="md3-app-bar__search-field-container">
            <slot name="search-field">
              <md-text-field
                color="outlined"
                id="search-input"
                class="md3-app-bar__search-input"
                type="search"
                .value=${this.value}
                label="${this.label || this.placeholder || ''}"
                placeholder="${this.placeholder || ''}"
                @input=${this._handleSearchInput}
                @change=${this._handleSearchChange}
                @keydown=${this._handleSearchKeyDown}>
                <slot name="leading-icon-text-field" slot="leading-icon">
                  <md-icon>search</md-icon>
                </slot>
                ${
                  this._hasSearchValue
                    ? html`
                        <slot name="trailing-icon-text-field" slot="trailing-icon" @click=${this._clearSearch}>
                          <md-icon class="md3-app-bar__clear-icon">close</md-icon>
                        </slot>
                      `
                    : html`<slot name="trailing-icon-text-field" slot="trailing-icon"></slot>`
                }
              </md-text-field>
            </slot>
          </div>

          <div class="md3-app-bar__trailing">
            <slot name="action-items">
              <slot name="trailing-icon"></slot>
            </slot>
          </div>
        </div>

        <slot></slot>
      </header>
    `
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
      --_container-color: var(--md-app-bar-container-color, var(--md-sys-color-surface, #fff));
      --_scrolled-container-color: var(
        --md-app-bar-scrolled-container-color,
        var(--md-sys-color-surface-container, #efedf4)
      );
      --_on-container-color: var(--md-app-bar-headline-color, var(--md-sys-color-on-surface, #1a1b21));
      --_subtitle-color: var(--md-app-bar-subtitle-color, var(--md-sys-color-on-surface-variant, #45464f));
      --_leading-icon-color: var(--md-app-bar-leading-icon-color, var(--md-sys-color-on-surface, #1a1b21));
      --_trailing-icon-color: var(--md-app-bar-trailing-icon-color, var(--md-sys-color-on-surface-variant, #45464f));
      --md-elevation-level: 0;
    }

    :host([scrolled]) {
      --md-elevation-level: 2;
    }

    .md3-app-bar {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      background-color: var(--_container-color);
      color: var(--_on-container-color);
      transition:
        background-color 200ms cubic-bezier(0.2, 0, 0, 1),
        box-shadow 200ms cubic-bezier(0.2, 0, 0, 1),
        min-height 250ms cubic-bezier(0.2, 0, 0, 1),
        height 250ms cubic-bezier(0.2, 0, 0, 1);
      user-select: none;
    }

    .md3-app-bar.scrolled {
      background-color: var(--_scrolled-container-color);
    }

    /* Elevations */
    md-elevation {
      border-radius: 0;
      transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    /* Top row standard 64px */
    .md3-app-bar__row {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 64px;
      padding: 0 4px;
      position: relative;
    }

    .md3-app-bar__leading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      color: var(--_leading-icon-color);
      flex-shrink: 0;
    }

    .md3-app-bar__trailing {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 48px;
      margin-left: auto;
      gap: 4px;
      padding-right: 4px;
      color: var(--_trailing-icon-color);
      flex-shrink: 0;
    }

    /* Headline containers */
    .md3-app-bar__headline-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      padding-left: 12px;
      padding-right: 12px;
      min-width: 0;
      overflow: hidden;
    }

    .md3-app-bar__headline {
      font-family: var(--md-ref-typeface-brand, inherit);
      font-size: var(--md-app-bar-headline-size, 22px);
      line-height: 28px;
      font-weight: 500;
      color: var(--_on-container-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    .md3-app-bar__subtitle {
      font-family: var(--md-ref-typeface-plain, inherit);
      font-size: 14px;
      line-height: 20px;
      font-weight: 400;
      color: var(--_subtitle-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    /* Center-aligned variant */
    .md3-app-bar--center-aligned .md3-app-bar__headline-container.center-aligned {
      align-items: center;
      text-align: center;
      padding-left: 0;
      padding-right: 0;
    }

    /* Medium & Large Flexible App Bars */
    .md3-app-bar--medium-flexible {
      min-height: 112px;
    }

    .md3-app-bar--medium-flexible.has-subtitle {
      min-height: 136px;
    }

    .md3-app-bar--large-flexible {
      min-height: 120px;
    }

    .md3-app-bar--large-flexible.has-subtitle {
      min-height: 152px;
    }

    .md3-app-bar__flexible-row {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0 16px 20px 16px;
      box-sizing: border-box;
      transition:
        opacity 200ms cubic-bezier(0.2, 0, 0, 1),
        max-height 250ms cubic-bezier(0.2, 0, 0, 1),
        padding 250ms cubic-bezier(0.2, 0, 0, 1);
      max-height: 120px;
      overflow: hidden;
    }

    .md3-app-bar--medium-flexible .md3-app-bar__flexible-headline {
      font-family: var(--md-ref-typeface-brand, inherit);
      font-size: 24px;
      line-height: 32px;
      font-weight: 400;
      color: var(--_on-container-color);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .md3-app-bar--large-flexible .md3-app-bar__flexible-headline {
      font-family: var(--md-ref-typeface-brand, inherit);
      font-size: 28px;
      line-height: 36px;
      font-weight: 400;
      color: var(--_on-container-color);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* When flexible is expanded, the top row headline is hidden */
    .md3-app-bar .flexible-top-headline {
      opacity: 0;
      pointer-events: none;
      transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    /* When flexible is collapsed */
    .md3-app-bar.collapsed {
      min-height: 64px;
      height: 64px;
    }

    .md3-app-bar.collapsed .flexible-top-headline {
      opacity: 1;
      pointer-events: auto;
    }

    .md3-app-bar.collapsed .md3-app-bar__flexible-row {
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      opacity: 0;
      pointer-events: none;
    }

    /* Search variant */
    .md3-app-bar--search .md3-app-bar__search-row {
      height: 64px;
      padding: 0 8px;
      gap: 8px;
    }

    .md3-app-bar__search-field-container {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
    }

    .md3-app-bar__search-input {
      width: 100%;
      --md-text-field-container-shape: 28px;
    }

    .md3-app-bar__clear-icon {
      cursor: pointer;
    }
  `
}

customElements.define('md-app-bar', AppBar)
