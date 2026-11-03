/**
 * @license
 * Copyright 2024 Google LLC / Material ESM Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css, nothing } from 'lit'
import '../search/search.js'
import '../icon/icon.js'
import '../internal/elevation/elevation.js'
import { redispatchEvent } from '../internal/events/redispatch-event.js'

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
 * - `search`: 64px search app bar with embedded M3 search bar.
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
    /** Shorthand boolean attribute to center-align the headline or search hint text */
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
    /** Internal state indicating whether custom subtitle markup is slotted */
    _hasSlottedSubtitle: { state: true },
    /** Internal state indicating whether leading navigation icon is slotted */
    _hasLeading: { state: true },
    /** Internal state indicating whether trailing action items are slotted */
    _hasTrailing: { state: true },
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
    this._hasSlottedSubtitle = false
    this._hasLeading = false
    this._hasTrailing = false

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
    if (v === 'medium' || v === 'medium-flexible') {
      return 'medium-flexible'
    }
    if (v === 'large' || v === 'large-flexible') {
      return 'large-flexible'
    }
    if (v === 'search') {
      return 'search'
    }
    if (this.centerAligned || v === 'center-aligned' || v === 'center') {
      return 'center-aligned'
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
    return this.centerAligned || this._effectiveType === 'center-aligned'
  }

  get _headlineText() {
    return this.headline || this.title || (!this._isSearch ? this.label : '') || ''
  }

  get _hasSubtitle() {
    return Boolean(this.subtitle || this._hasSlottedSubtitle)
  }

  _hasAssignedContent(slot) {
    if (!slot) return false
    const assigned = slot.assignedNodes({ flatten: true })
    return assigned.some((n) => n.nodeType === Node.ELEMENT_NODE || (n.textContent || '').trim().length > 0)
  }

  _handleLeadingSlotChange() {
    const navSlot = this.renderRoot?.querySelector('slot[name="navigation-icon"]')
    const leadSlot = this.renderRoot?.querySelector('slot[name="leading-icon"]')
    this._hasLeading = this._hasAssignedContent(navSlot) || this._hasAssignedContent(leadSlot)
  }

  _handleTrailingSlotChange() {
    const actionSlot = this.renderRoot?.querySelector('slot[name="action-items"]')
    const trailSlot = this.renderRoot?.querySelector('slot[name="trailing-icon"]')
    this._hasTrailing = this._hasAssignedContent(actionSlot) || this._hasAssignedContent(trailSlot)
  }

  _handleSubtitleSlotChange(e) {
    this._hasSlottedSubtitle = this._hasAssignedContent(e.target)
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
    this._hasSearchValue = Boolean(input.value)
    redispatchEvent(this, e)
  }

  _handleSearchClear() {
    this.value = ''
    this._hasSearchValue = false
  }

  _clearSearch() {
    const searchEl = this.renderRoot?.querySelector('#search-input')
    if (searchEl && typeof searchEl.clear === 'function') {
      searchEl.clear()
    } else {
      this.value = ''
      this._hasSearchValue = false
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
        class="md3-app-bar md3-app-bar--${type} ${this.scrolled ? 'scrolled' : ''} ${isCollapsed ? 'collapsed' : ''} ${this._hasSubtitle ? 'has-subtitle' : ''} ${isCenterAligned ? 'center-aligned' : ''}"
        role="banner">
        <md-elevation part="elevation"></md-elevation>

        <!-- Top row: Navigation icon, title (for small/center, or collapsed flexible), and action items -->
        <div class="md3-app-bar__row md3-app-bar__top-row">
          <!-- Leading / Navigation icon -->
          <div class="md3-app-bar__leading" ?hidden=${!this._hasLeading}>
            <slot name="navigation-icon" @slotchange=${this._handleLeadingSlotChange}>
              <slot name="leading-icon" @slotchange=${this._handleLeadingSlotChange}></slot>
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
              !isFlexible
                ? html`
                    <div class="md3-app-bar__subtitle" part="subtitle" ?hidden=${!this._hasSubtitle}>
                      <slot name="subtitle" @slotchange=${this._handleSubtitleSlotChange}>${this.subtitle}</slot>
                    </div>
                  `
                : nothing
            }
          </div>

          <!-- Trailing action items -->
          <div class="md3-app-bar__trailing" ?hidden=${!this._hasTrailing}>
            <slot name="action-items" @slotchange=${this._handleTrailingSlotChange}>
              <slot name="trailing-icon" @slotchange=${this._handleTrailingSlotChange}></slot>
            </slot>
          </div>
        </div>

        <!-- Lower row: Expanded headline & subtitle for medium/large flexible variants -->
        ${
          isFlexible
            ? html`
                <div
                  class="md3-app-bar__flexible-row ${isCenterAligned ? 'center-aligned' : ''}"
                  part="flexible-container">
                  <div class="md3-app-bar__flexible-headline" part="headline">
                    ${
                      !isCollapsed
                        ? html`<slot name="headline"><slot name="title">${this._headlineText}</slot></slot>`
                        : this._headlineText
                    }
                  </div>
                  <div class="md3-app-bar__subtitle" part="subtitle" ?hidden=${!this._hasSubtitle}>
                    <slot name="subtitle" @slotchange=${this._handleSubtitleSlotChange}>${this.subtitle}</slot>
                  </div>
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
          <div class="md3-app-bar__leading" ?hidden=${!this._hasLeading}>
            <slot name="navigation-icon" @slotchange=${this._handleLeadingSlotChange}>
              <slot name="leading-icon" @slotchange=${this._handleLeadingSlotChange}></slot>
            </slot>
          </div>

          <div class="md3-app-bar__search-field-container">
            <slot name="search-field">
              <md-search
                id="search-input"
                class="md3-app-bar__search-input"
                .value=${this.value}
                label="${this.label || this.placeholder || 'Search'}"
                placeholder="${this.placeholder || ''}"
                ?center-aligned=${this._isCenterAligned}
                @input=${this._handleSearchInput}
                @change=${this._handleSearchChange}
                @clear=${this._handleSearchClear}>
                <slot name="leading-icon-text-field" slot="leading-icon">
                  <md-icon aria-hidden="true">search</md-icon>
                </slot>
                <slot name="trailing-icon-text-field" slot="trailing-icon"></slot>
              </md-search>
            </slot>
          </div>

          <div class="md3-app-bar__trailing" ?hidden=${!this._hasTrailing}>
            <slot name="action-items" @slotchange=${this._handleTrailingSlotChange}>
              <slot name="trailing-icon" @slotchange=${this._handleTrailingSlotChange}></slot>
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
      --_search-container-color: var(
        --md-app-bar-search-container-color,
        var(--md-sys-color-surface-container, #efedf4)
      );
      --_scrolled-search-container-color: var(
        --md-app-bar-scrolled-search-container-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      );
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

    .md3-app-bar__leading[hidden],
    .md3-app-bar__trailing[hidden] {
      display: none;
    }

    .md3-app-bar__trailing {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 48px;
      margin-inline-start: auto;
      gap: 4px;
      padding-inline-end: 4px;
      color: var(--_trailing-icon-color);
      flex-shrink: 0;
    }

    /* Headline containers */
    .md3-app-bar__headline-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      padding-inline: 12px;
      min-width: 0;
      overflow: hidden;
    }

    .md3-app-bar__headline {
      font-family: var(--md-sys-typescale-title-large-font, var(--md-ref-typeface-brand, inherit));
      font-size: var(--md-app-bar-headline-size, var(--md-sys-typescale-title-large-size, 22px));
      line-height: var(--md-sys-typescale-title-large-line-height, 28px);
      font-weight: var(--md-app-bar-headline-weight, var(--md-sys-typescale-title-large-weight, 400));
      color: var(--_on-container-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    .md3-app-bar__subtitle {
      font-family: var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, inherit));
      font-size: var(--md-sys-typescale-body-medium-size, 14px);
      line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
      font-weight: var(--md-sys-typescale-body-medium-weight, 400);
      color: var(--_subtitle-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    .md3-app-bar__subtitle[hidden] {
      display: none;
    }

    /* Center-aligned configuration */
    .md3-app-bar__headline-container.center-aligned {
      align-items: center;
      text-align: center;
      padding-inline: 12px;
    }

    .md3-app-bar__flexible-row.center-aligned {
      align-items: center;
      text-align: center;
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
      max-height: 160px;
      overflow: hidden;
    }

    .md3-app-bar--medium-flexible .md3-app-bar__flexible-headline {
      font-family: var(--md-sys-typescale-headline-small-font, var(--md-ref-typeface-brand, inherit));
      font-size: var(--md-sys-typescale-headline-small-size, 24px);
      line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
      font-weight: var(--md-sys-typescale-headline-small-weight, 400);
      color: var(--_on-container-color);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .md3-app-bar--large-flexible .md3-app-bar__flexible-headline {
      font-family: var(--md-sys-typescale-headline-medium-font, var(--md-ref-typeface-brand, inherit));
      font-size: var(--md-sys-typescale-headline-medium-size, 28px);
      line-height: var(--md-sys-typescale-headline-medium-line-height, 36px);
      font-weight: var(--md-sys-typescale-headline-medium-weight, 400);
      color: var(--_on-container-color);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
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
      padding: 4px 8px;
      gap: 8px;
    }

    .md3-app-bar--search .md3-app-bar__trailing {
      margin-inline-start: 0;
    }

    .md3-app-bar__search-field-container {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      min-width: 0;
    }

    .md3-app-bar__search-input {
      width: 100%;
      --md-search-max-width: 100%;
      --md-search-min-width: 0px;
      --md-search-container-height: 56px;
      --md-search-container-color: var(--_search-container-color);
    }

    .md3-app-bar--search.scrolled .md3-app-bar__search-input {
      --md-search-container-color: var(--_scrolled-search-container-color);
    }
  `
}

customElements.define('md-app-bar', AppBar)
