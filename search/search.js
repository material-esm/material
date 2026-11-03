/**
 * @license
 * Copyright 2024 Google LLC / Material ESM Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css, nothing } from 'lit'
import { live } from 'lit/directives/live.js'
import '../icon/icon.js'
import '../buttons/icon-button.js'
import '../internal/elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import { redispatchEvent } from '../internal/events/redispatch-event.js'
import { mixinElementInternals } from '../labs/behaviors/element-internals.js'
import { getFormValue, mixinFormAssociated } from '../labs/behaviors/form-associated.js'

const searchBaseClass = mixinFormAssociated(mixinElementInternals(LitElement))

/**
 * Material Design 3 Search Bar & Search View component.
 *
 * Implements the Material Design 3 Search specification:
 * https://m3.material.io/components/search/overview
 *
 * Supports adaptive Search View suggestions/results slotted into the default
 * slot (or `slot="suggestions"`):
 * - Docked vertical-menu surface below the search bar in medium/expanded windows (`>= 600px`).
 * - Full-screen modal search view in compact windows (`< 600px`).
 *
 * @fires input {InputEvent} Dispatched when the search input value changes.
 * @fires change {Event} Dispatched when the search input value is committed.
 * @fires search {CustomEvent<{value: string}>} Dispatched when Enter is pressed or a suggestion is selected.
 * @fires clear {CustomEvent} Dispatched when the clear button is activated.
 * @fires open {CustomEvent} Dispatched when the search suggestions view opens.
 * @fires close {CustomEvent} Dispatched when the search suggestions view closes.
 */
export class Search extends searchBaseClass {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  }

  static properties = {
    /** Accessible label for the search input (sets aria-label). */
    label: { type: String },
    /** Supporting / hint text shown when the search input is empty. */
    placeholder: { type: String },
    /** Current search query value. */
    value: { type: String },
    /** Center-aligns the supporting/hint text. */
    centerAligned: { type: Boolean, attribute: 'center-aligned', reflect: true },
    /** Applies resting elevation (level 3) to the search bar container. */
    elevated: { type: Boolean, reflect: true },
    /** Hides the automatic clear ('close') button when text is present. */
    noClear: { type: Boolean, attribute: 'no-clear', reflect: true },
    /** Disables automatic filtering of slotted suggestion items on input. */
    noFilter: { type: Boolean, attribute: 'no-filter', reflect: true },
    /** Whether the search suggestions/results view is open. */
    open: { type: Boolean, reflect: true },
    /** Search view layout mode: 'auto' (fullscreen <600px, docked >=600px) | 'docked' | 'fullscreen'. */
    view: { type: String, reflect: true },
    /** Internal state tracking whether custom leading content is slotted. */
    _hasSlottedLeading: { state: true },
    /** Internal state tracking whether custom trailing content is slotted. */
    _hasSlottedTrailing: { state: true },
    /** Internal state tracking whether a trailing avatar is slotted. */
    _hasSlottedAvatar: { state: true },
    /** Internal state tracking whether visible suggestions/results are slotted. */
    _hasSlottedSuggestions: { state: true },
  }

  constructor() {
    super()
    this.label = 'Search'
    this.placeholder = 'Search'
    this.value = ''
    this.centerAligned = false
    this.elevated = false
    this.noClear = false
    this.noFilter = false
    this.open = false
    this.view = 'auto'
    this._hasSlottedLeading = false
    this._hasSlottedTrailing = false
    this._hasSlottedAvatar = false
    this._hasSlottedSuggestions = false

    this._onDocumentPointerDown = this._handleDocumentPointerDown.bind(this)
  }

  connectedCallback() {
    super.connectedCallback()
    document.addEventListener('pointerdown', this._onDocumentPointerDown)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('pointerdown', this._onDocumentPointerDown)
  }

  updated(changedProperties) {
    super.updated(changedProperties)
    if (changedProperties.has('value')) {
      if (!this.noFilter) {
        this._filterSuggestions(this.value)
      }
      this._syncSuggestionsState()
    }
    if (changedProperties.has('open')) {
      this.dispatchEvent(
        new CustomEvent(this.open ? 'open' : 'close', {
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  [getFormValue]() {
    return this.value
  }

  formResetCallback() {
    this.value = this.getAttribute('value') ?? ''
  }

  formStateRestoreCallback(state) {
    this.value = state
  }

  get _hasValue() {
    return Boolean(this.value && this.value.length > 0)
  }

  /** Focuses the inner search input. */
  focus(options) {
    this.renderRoot?.querySelector('#input')?.focus(options)
  }

  /** Blurs the inner search input. */
  blur() {
    this.renderRoot?.querySelector('#input')?.blur()
  }

  /** Selects the text inside the search input. */
  select() {
    this.renderRoot?.querySelector('#input')?.select()
  }

  /** Clears the current search value and dispatches input/change/clear events. */
  clear() {
    this._clear()
  }

  /** Closes the search suggestions view. */
  close() {
    if (this.open) {
      this.open = false
    }
    this.blur()
  }

  _handleDocumentPointerDown(e) {
    if (!this.open) return
    const path = e.composedPath()
    if (!path.includes(this)) {
      this.open = false
    }
  }

  _handleFocusout(e) {
    if (!this.open) return
    const next = e.relatedTarget
    if (!next) return
    if (this.contains(next) || this.shadowRoot?.contains(next)) return
    const items = this._getSlottedSuggestionElements()
    if (items.some((item) => item === next || item.contains?.(next))) return
    this.open = false
  }

  _handleContainerClick(e) {
    if (this.disabled) return
    const input = this.renderRoot?.querySelector('#input')
    if (!input) return
    // Do not steal focus if clicking an interactive slotted element or clear/back button
    const path = e.composedPath()
    for (const node of path) {
      if (node === input) return
      if (node === this || node === this.renderRoot) break
      if (
        node instanceof HTMLElement &&
        (node.tagName === 'MD-ICON-BUTTON' ||
          node.tagName === 'MD-BUTTON' ||
          node.tagName === 'BUTTON' ||
          node.tagName === 'A' ||
          node.tagName === 'INPUT' ||
          node.hasAttribute('tabindex'))
      ) {
        return
      }
    }
    input.focus()
    this._syncSuggestionsState()
    if (this._hasSlottedSuggestions) {
      this.open = true
    }
  }

  _handleFocus() {
    if (!this.noFilter) {
      this._filterSuggestions(this.value)
    }
    this._syncSuggestionsState()
    if (this._hasSlottedSuggestions) {
      this.open = true
    }
  }

  _handleInput(e) {
    this.value = e.target.value
    if (!this.noFilter) {
      this._filterSuggestions(this.value)
    }
    this._syncSuggestionsState()
    if (this._hasSlottedSuggestions) {
      this.open = true
    }
    // Also re-sync after any external host @input handlers finish
    queueMicrotask(() => {
      this._syncSuggestionsState()
      if (this._hasSlottedSuggestions && this.shadowRoot?.activeElement) {
        this.open = true
      }
    })
  }

  _handleChange(e) {
    this.value = e.target.value
    redispatchEvent(this, e)
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape' && this.open) {
      e.stopPropagation()
      this.close()
      return
    }
    if (e.key === 'Enter') {
      const dispatched = this.dispatchEvent(
        new CustomEvent('search', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
      if (dispatched && this.open) {
        this.open = false
      }
    }
  }

  _handleBackClick(e) {
    e.stopPropagation()
    this.close()
  }

  _getItemText(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return ''
    if (el.dataset?.query) return el.dataset.query
    if (typeof el.headline === 'string' && el.headline.trim()) return el.headline.trim()
    const headlineEl = el.querySelector?.('[slot="headline"]')
    if (headlineEl && headlineEl.textContent?.trim()) return headlineEl.textContent.trim()
    if (typeof el.typeaheadText === 'string' && el.typeaheadText.trim()) return el.typeaheadText.trim()
    return (el.textContent || '').trim()
  }

  _getSlottedSuggestionElements() {
    const namedSlot = this.renderRoot?.querySelector('slot[name="suggestions"]')
    const defaultSlot = this.renderRoot?.querySelector('slot:not([name])')
    const nodes = [
      ...(namedSlot ? namedSlot.assignedElements({ flatten: true }) : []),
      ...(defaultSlot ? defaultSlot.assignedElements({ flatten: true }) : []),
    ]
    return nodes
  }

  _filterSuggestions(query) {
    const items = this._getSlottedSuggestionElements()
    if (!items.length) return
    const q = (query || '').trim().toLowerCase()
    for (const item of items) {
      const text = this._getItemText(item).toLowerCase()
      const matches = q.length === 0 || text.includes(q)
      item.hidden = !matches
    }
  }

  _updateItemPositions(visibleItems) {
    const count = visibleItems.length
    visibleItems.forEach((item, index) => {
      if (count === 1) {
        item.setAttribute('menu-position', 'single')
      } else if (index === 0) {
        item.setAttribute('menu-position', 'first')
      } else if (index === count - 1) {
        item.setAttribute('menu-position', 'last')
      } else {
        item.setAttribute('menu-position', 'middle')
      }
    })
  }

  _handleViewItemClick(e) {
    const path = e.composedPath()
    const items = this._getSlottedSuggestionElements()
    if (!items.length) return
    const clickedItem = path.find((node) => items.includes(node))
    if (!clickedItem || clickedItem.disabled) return

    const selectedText = this._getItemText(clickedItem)
    if (selectedText) {
      this.value = selectedText
      const input = this.renderRoot?.querySelector('#input')
      if (input) {
        input.value = selectedText
      }
      if (!this.noFilter) {
        this._filterSuggestions(selectedText)
      }
      this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
      this.dispatchEvent(new Event('change', { bubbles: true }))
      this.dispatchEvent(
        new CustomEvent('search', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    }
    this.close()
  }

  _handleCloseMenuEvent(e) {
    e.stopPropagation()
  }

  _hasNodes(slot) {
    if (!slot) return false
    return slot
      .assignedNodes({ flatten: true })
      .some(
        (n) =>
          (n.nodeType === Node.ELEMENT_NODE && !n.hidden) ||
          (n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0),
      )
  }

  _syncSuggestionsState() {
    const items = this._getSlottedSuggestionElements()
    const visibleItems = items.filter((el) => !el.hidden)
    this._updateItemPositions(visibleItems)
    this._hasSlottedSuggestions = visibleItems.length > 0
  }

  _handleLeadingSlotChange(e) {
    this._hasSlottedLeading = this._hasNodes(e.target)
  }

  _handleTrailingSlotChange(e) {
    this._hasSlottedTrailing = this._hasNodes(e.target)
  }

  _handleAvatarSlotChange(e) {
    this._hasSlottedAvatar = this._hasNodes(e.target)
  }

  _handleSuggestionsSlotChange() {
    if (!this.noFilter && this.value) {
      this._filterSuggestions(this.value)
    }
    this._syncSuggestionsState()
  }

  firstUpdated(changedProperties) {
    super.firstUpdated?.(changedProperties)
    const leadingSlot = this.renderRoot?.querySelector('slot[name="leading-icon"]')
    const trailingSlot = this.renderRoot?.querySelector('slot[name="trailing-icon"]')
    const avatarSlot = this.renderRoot?.querySelector('slot[name="avatar"]')
    if (leadingSlot) {
      this._hasSlottedLeading = this._hasNodes(leadingSlot)
    }
    if (trailingSlot) {
      this._hasSlottedTrailing = this._hasNodes(trailingSlot)
    }
    if (avatarSlot) {
      this._hasSlottedAvatar = this._hasNodes(avatarSlot)
    }
    if (!this.noFilter && this.value) {
      this._filterSuggestions(this.value)
    }
    this._syncSuggestionsState()
  }

  _clear(e) {
    if (e) {
      e.stopPropagation()
    }
    if (this.disabled) return
    const input = this.renderRoot?.querySelector('#input')
    this.value = ''
    if (!this.noFilter) {
      this._filterSuggestions('')
    }
    this._syncSuggestionsState()
    if (input) {
      input.value = ''
      input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      input.focus()
    } else {
      this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
      this.dispatchEvent(new Event('change', { bubbles: true }))
    }
    this.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }))
  }

  render() {
    const showClear = this._hasValue && !this.noClear
    const hasTrailing = showClear || this._hasSlottedTrailing || this._hasSlottedAvatar
    const showView = this.open && this._hasSlottedSuggestions
    const showBackButton = showView && !this._hasSlottedLeading

    return html`
      <div class="md3-search-wrapper ${showView ? 'view-open' : ''}" @focusout=${this._handleFocusout}>
        <div
          class="md3-search-bar ${hasTrailing ? 'has-trailing' : ''}"
          part="container"
          role="search"
          @click=${this._handleContainerClick}>
          <md-elevation part="elevation"></md-elevation>
          <div class="md3-search-bar__state-layer" part="state-layer"></div>
          <md-focus-ring part="focus-ring" for="input"></md-focus-ring>

          <div class="md3-search-bar__leading" part="leading">
            ${
              showBackButton
                ? html`
                    <md-icon-button
                      class="md3-search-bar__back-button"
                      part="back-button"
                      type="button"
                      aria-label="Back"
                      @click=${this._handleBackClick}>
                      <md-icon>chevron_left</md-icon>
                    </md-icon-button>
                  `
                : !this._hasSlottedLeading
                  ? html`<md-icon aria-hidden="true">search</md-icon>`
                  : nothing
            }
            <slot
              name="leading-icon"
              ?hidden=${showBackButton || !this._hasSlottedLeading}
              @slotchange=${this._handleLeadingSlotChange}></slot>
          </div>

          <input
            id="input"
            part="input"
            class="md3-search-bar__input"
            type="search"
            .value=${live(this.value ?? '')}
            name=${this.name || nothing}
            placeholder=${this.placeholder || ''}
            aria-label=${this.label || this.placeholder || 'Search'}
            aria-expanded=${this._hasSlottedSuggestions ? String(showView) : nothing}
            ?disabled=${this.disabled}
            @focus=${this._handleFocus}
            @input=${this._handleInput}
            @change=${this._handleChange}
            @keydown=${this._handleKeyDown} />

          <div class="md3-search-bar__trailing" part="trailing" ?hidden=${!hasTrailing}>
            ${
              showClear
                ? html`
                    <md-icon-button
                      class="md3-search-bar__clear-button"
                      part="clear-button"
                      type="button"
                      aria-label="Clear search"
                      ?disabled=${this.disabled}
                      @click=${this._clear}>
                      <md-icon>close</md-icon>
                    </md-icon-button>
                  `
                : nothing
            }
            <slot name="trailing-icon" @slotchange=${this._handleTrailingSlotChange}></slot>
            <div class="md3-search-bar__avatar" ?hidden=${!this._hasSlottedAvatar}>
              <slot name="avatar" @slotchange=${this._handleAvatarSlotChange}></slot>
            </div>
          </div>
        </div>

        <div
          class="md3-search-bar__view"
          part="view"
          role="menu"
          aria-label="Search suggestions"
          ?hidden=${!showView}
          @click=${this._handleViewItemClick}
          @close-menu=${this._handleCloseMenuEvent}>
          <md-elevation part="view-elevation"></md-elevation>
          <div class="md3-search-bar__view-content" part="view-content">
            <slot name="suggestions" @slotchange=${this._handleSuggestionsSlotChange}></slot>
            <slot @slotchange=${this._handleSuggestionsSlotChange}></slot>
          </div>
        </div>
      </div>
    `
  }

  static styles = css`
    :host {
      display: block;
      position: relative;
      outline: none;
      width: 100%;
      min-width: var(--md-search-min-width, var(--md-comp-search-bar-container-min-width, min(360px, 100%)));
      max-width: var(--md-search-max-width, var(--md-comp-search-bar-container-max-width, 720px));
      min-height: var(--_container-height);
      box-sizing: border-box;

      --_container-height: var(--md-search-container-height, var(--md-comp-search-bar-container-height, 56px));
      --_container-shape: var(
        --md-search-container-shape,
        var(--md-comp-search-bar-container-shape, var(--md-sys-shape-corner-full, 9999px))
      );
      --_container-color: var(
        --md-search-container-color,
        var(--md-comp-search-bar-container-color, var(--md-sys-color-surface-container-high, #ece6f0))
      );
      --_container-elevation: var(--md-search-container-elevation, var(--md-comp-search-bar-container-elevation, 0));

      /* Default M3 Expressive Vertical Menu styling for the docked Search View */
      --_view-container-color: var(
        --md-search-view-container-color,
        var(--md-menu-container-color, var(--md-sys-color-surface-container-low, #f7f2fa))
      );
      --_view-elevation: var(--md-search-view-elevation, var(--md-menu-container-elevation, 2));
      --_view-docked-shape: var(
        --md-search-view-docked-shape,
        var(--md-menu-container-shape, var(--md-sys-shape-corner-large, 16px))
      );
      --_fullscreen-surface-color: var(
        --md-search-fullscreen-surface-color,
        var(--md-sys-color-surface, #fef7ff)
      );

      /* Vertical menu item tokens */
      --md-menu-item-one-line-container-height: 48px;
      --md-menu-item-leading-space: 12px;
      --md-menu-item-trailing-space: 12px;
      --md-menu-item-top-space: 8px;
      --md-menu-item-bottom-space: 8px;
      --md-menu-item-between-space: 8px;
      --md-menu-item-icon-size: 20px;
      --md-menu-item-shape: var(--md-sys-shape-corner-extra-small, 4px);
      --md-menu-item-selected-shape: var(--md-sys-shape-corner-medium, 12px);
      --md-list-item-one-line-container-height: 48px;
      --md-list-item-leading-space: 12px;
      --md-list-item-trailing-space: 12px;
      --md-list-item-top-space: 8px;
      --md-list-item-bottom-space: 8px;

      --_leading-icon-color: var(
        --md-search-leading-icon-color,
        var(--md-comp-search-bar-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20))
      );
      --_trailing-icon-color: var(
        --md-search-trailing-icon-color,
        var(--md-comp-search-bar-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f))
      );
      --_supporting-text-color: var(
        --md-search-supporting-text-color,
        var(--md-comp-search-bar-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f))
      );
      --_input-text-color: var(
        --md-search-input-text-color,
        var(--md-comp-search-bar-input-text-color, var(--md-sys-color-on-surface, #1d1b20))
      );
      --_caret-color: var(--md-search-caret-color, var(--md-sys-color-primary, #6750a4));

      --_text-font: var(
        --md-search-input-text-font,
        var(
          --md-search-supporting-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto, sans-serif))
        )
      );
      --_text-size: var(
        --md-search-input-text-size,
        var(--md-search-supporting-text-size, var(--md-sys-typescale-body-large-size, 1rem))
      );
      --_text-line-height: var(
        --md-search-input-text-line-height,
        var(--md-search-supporting-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem))
      );
      --_text-weight: var(
        --md-search-input-text-weight,
        var(
          --md-search-supporting-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        )
      );
      --_text-tracking: var(
        --md-search-input-text-tracking,
        var(--md-search-supporting-text-tracking, var(--md-sys-typescale-body-large-tracking, 0.03125rem))
      );

      --_hover-state-layer-color: var(
        --md-search-hover-state-layer-color,
        var(--md-comp-search-bar-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20))
      );
      --_hover-state-layer-opacity: var(
        --md-search-hover-state-layer-opacity,
        var(--md-comp-search-bar-hover-state-layer-opacity, 0.08)
      );
      --_pressed-state-layer-color: var(
        --md-search-pressed-state-layer-color,
        var(--md-comp-search-bar-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20))
      );
      --_pressed-state-layer-opacity: var(
        --md-search-pressed-state-layer-opacity,
        var(--md-comp-search-bar-pressed-state-layer-opacity, 0.1)
      );

      --_avatar-size: var(--md-search-avatar-size, var(--md-comp-search-bar-avatar-size, 30px));
      --_avatar-shape: var(
        --md-search-avatar-shape,
        var(--md-comp-search-bar-avatar-shape, var(--md-sys-shape-corner-full, 9999px))
      );
    }

    :host([elevated]) {
      --_container-elevation: var(--md-search-container-elevation, var(--md-sys-elevation-level3, 3));
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.38;
    }

    .md3-search-wrapper {
      position: relative;
      width: 100%;
    }

    .md3-search-bar {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: var(--_container-height);
      min-height: var(--_container-height);
      padding-inline: var(--md-search-leading-space, 16px) var(--md-search-trailing-space, 16px);
      gap: 16px;
      box-sizing: border-box;
      border-radius: var(--_container-shape);
      background-color: var(--_container-color);
      cursor: text;
      transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    .md3-search-bar > md-elevation {
      border-radius: inherit;
      --md-elevation-level: var(--_container-elevation);
      pointer-events: none;
    }

    md-focus-ring {
      --md-focus-ring-shape: var(--_container-shape);
    }

    .md3-search-bar__state-layer {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background-color: var(--_hover-state-layer-color);
      opacity: 0;
      transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .md3-search-bar:hover .md3-search-bar__state-layer {
      opacity: var(--_hover-state-layer-opacity);
    }

    .md3-search-bar:active .md3-search-bar__state-layer {
      background-color: var(--_pressed-state-layer-color);
      opacity: var(--_pressed-state-layer-opacity);
    }

    .md3-search-bar__leading {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--_leading-icon-color);
      --md-icon-size: 24px;
      --md-icon-button-icon-color: var(--_leading-icon-color);
    }

    .md3-search-bar__leading slot[hidden] {
      display: none;
    }

    .md3-search-bar__back-button,
    .md3-search-bar__leading ::slotted(md-icon-button) {
      margin-inline: -8px;
    }

    .md3-search-bar__input {
      position: relative;
      z-index: 1;
      flex: 1 1 auto;
      min-width: 0;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      border: none;
      outline: none;
      background: transparent;
      color: var(--_input-text-color);
      caret-color: var(--_caret-color);
      font-family: var(--_text-font);
      font-size: var(--_text-size);
      line-height: var(--_text-line-height);
      font-weight: var(--_text-weight);
      letter-spacing: var(--_text-tracking);
      appearance: none;
      -webkit-appearance: none;
    }

    .md3-search-bar__input::placeholder {
      color: var(--_supporting-text-color);
      opacity: 1;
      font-family: var(
        --md-search-supporting-text-font,
        var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto, sans-serif))
      );
      font-size: var(--md-search-supporting-text-size, var(--md-sys-typescale-body-large-size, 1rem));
      line-height: var(--md-search-supporting-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));
      font-weight: var(
        --md-search-supporting-text-weight,
        var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
      );
      letter-spacing: var(
        --md-search-supporting-text-tracking,
        var(--md-sys-typescale-body-large-tracking, 0.03125rem)
      );
    }

    :host([center-aligned]) .md3-search-bar__input:placeholder-shown:not(:focus) {
      text-align: center;
    }

    .md3-search-bar__input::-webkit-search-decoration,
    .md3-search-bar__input::-webkit-search-cancel-button,
    .md3-search-bar__input::-webkit-search-results-button,
    .md3-search-bar__input::-webkit-search-results-decoration {
      display: none;
      -webkit-appearance: none;
    }

    .md3-search-bar__trailing {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      flex-shrink: 0;
      margin-inline-end: -8px;
      color: var(--_trailing-icon-color);
      --md-icon-size: 24px;
      --md-icon-button-icon-color: var(--_trailing-icon-color);
    }

    .md3-search-bar__trailing[hidden] {
      display: none;
    }

    .md3-search-bar__avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-inline: 4px 8px;
    }

    .md3-search-bar__avatar[hidden] {
      display: none;
    }

    .md3-search-bar__avatar ::slotted(*) {
      width: var(--_avatar-size);
      height: var(--_avatar-size);
      border-radius: var(--_avatar-shape);
      object-fit: cover;
      display: block;
    }

    /* Search View (M3 Expressive Vertical Menu surface when docked on >= 600px) */
    .md3-search-bar__view {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      z-index: 100;
      background-color: var(--_view-container-color);
      border-radius: var(--_view-docked-shape);
      box-sizing: border-box;
      user-select: none;
    }

    .md3-search-bar__view[hidden] {
      display: none;
    }

    .md3-search-bar__view > md-elevation {
      border-radius: inherit;
      --md-elevation-level: var(--_view-elevation);
      --md-elevation-shadow-color: var(--md-menu-container-shadow-color, var(--md-sys-color-shadow, #000));
      pointer-events: none;
    }

    .md3-search-bar__view-content {
      position: relative;
      z-index: 1;
      padding: 8px 6px;
      max-height: var(--md-search-view-max-height, 360px);
      overflow-y: auto;
      border-radius: inherit;
      box-sizing: border-box;
      --md-list-item-container-color: transparent;
      --md-menu-item-container-color: transparent;
    }

    .md3-search-bar__view-content ::slotted([hidden]) {
      display: none !important;
    }

    /* Slotted item margins and shape morphing matching vertical md-menu */
    .md3-search-bar__view-content ::slotted(:is(md-menu-item, md-list-item, [md-menu-item], [md-list-item])) {
      margin: 2px 4px;
      border-radius: var(--md-menu-item-shape, 4px);
      transition:
        border-radius 200ms cubic-bezier(0.2, 0, 0, 1),
        background-color 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    .md3-search-bar__view-content
      ::slotted(:is(md-menu-item, md-list-item, [md-menu-item], [md-list-item])[menu-position='first']) {
      border-start-start-radius: var(--md-sys-shape-corner-medium, 12px);
      border-start-end-radius: var(--md-sys-shape-corner-medium, 12px);
      border-end-start-radius: var(--md-sys-shape-corner-extra-small, 4px);
      border-end-end-radius: var(--md-sys-shape-corner-extra-small, 4px);
    }

    .md3-search-bar__view-content
      ::slotted(:is(md-menu-item, md-list-item, [md-menu-item], [md-list-item])[menu-position='last']) {
      border-start-start-radius: var(--md-sys-shape-corner-extra-small, 4px);
      border-start-end-radius: var(--md-sys-shape-corner-extra-small, 4px);
      border-end-start-radius: var(--md-sys-shape-corner-medium, 12px);
      border-end-end-radius: var(--md-sys-shape-corner-medium, 12px);
    }

    .md3-search-bar__view-content
      ::slotted(:is(md-menu-item, md-list-item, [md-menu-item], [md-list-item])[menu-position='single']) {
      border-radius: var(--md-sys-shape-corner-medium, 12px);
    }

    .md3-search-bar__view-content ::slotted(:is(md-menu-item, md-list-item, [md-menu-item], [md-list-item]):hover),
    .md3-search-bar__view-content
      ::slotted(:is(md-menu-item, md-list-item, [md-menu-item], [md-list-item]):focus-within) {
      border-radius: var(--md-sys-shape-corner-medium, 12px);
    }

    .md3-search-bar__view-content ::slotted(:is(md-divider, [role='separator'])) {
      margin: 6px 12px;
    }

    /* Full-screen Search View on compact windows (< 600px) when view="auto", or when view="fullscreen" */
    @media (width < 600px) {
      :host(:not([view='docked'])) .md3-search-wrapper.view-open {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        background-color: var(--_fullscreen-surface-color);
        padding-top: 8px;
        box-sizing: border-box;
      }

      :host(:not([view='docked'])) .md3-search-wrapper.view-open .md3-search-bar {
        margin: 0 12px;
        width: calc(100% - 24px);
        flex-shrink: 0;
      }

      :host(:not([view='docked'])) .md3-search-wrapper.view-open .md3-search-bar__view {
        position: static;
        flex: 1 1 auto;
        width: 100%;
        border-radius: 0;
        background-color: transparent;
        margin-top: 4px;
      }

      :host(:not([view='docked'])) .md3-search-wrapper.view-open .md3-search-bar__view > md-elevation {
        --md-elevation-level: 0;
      }

      :host(:not([view='docked'])) .md3-search-wrapper.view-open .md3-search-bar__view-content {
        max-height: none;
        height: 100%;
        border-radius: 0;
      }
    }

    :host([view='fullscreen']) .md3-search-wrapper.view-open {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      background-color: var(--_fullscreen-surface-color);
      padding-top: 8px;
      box-sizing: border-box;
    }

    :host([view='fullscreen']) .md3-search-wrapper.view-open .md3-search-bar {
      margin: 0 12px;
      width: calc(100% - 24px);
      flex-shrink: 0;
    }

    :host([view='fullscreen']) .md3-search-wrapper.view-open .md3-search-bar__view {
      position: static;
      flex: 1 1 auto;
      width: 100%;
      border-radius: 0;
      background-color: transparent;
      margin-top: 4px;
    }

    :host([view='fullscreen']) .md3-search-wrapper.view-open .md3-search-bar__view > md-elevation {
      --md-elevation-level: 0;
    }

    :host([view='fullscreen']) .md3-search-wrapper.view-open .md3-search-bar__view-content {
      max-height: none;
      height: 100%;
      border-radius: 0;
    }
  `
}

customElements.define('md-search', Search)
