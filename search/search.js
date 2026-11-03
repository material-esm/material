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

/**
 * Material Design 3 Search Bar component.
 *
 * Implements the Material Design 3 Search specification:
 * https://m3.material.io/components/search/overview
 *
 * @fires input {InputEvent} Dispatched when the search input value changes.
 * @fires change {Event} Dispatched when the search input value is committed.
 * @fires search {CustomEvent<{value: string}>} Dispatched when Enter is pressed.
 * @fires clear {CustomEvent} Dispatched when the clear button is activated.
 */
export class Search extends LitElement {
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
    /** Name of the search input for form usage. */
    name: { type: String },
    /** Whether the search bar is disabled. */
    disabled: { type: Boolean, reflect: true },
    /** Center-aligns the supporting/hint text. */
    centerAligned: { type: Boolean, attribute: 'center-aligned', reflect: true },
    /** Applies resting elevation (level 3) to the search bar container. */
    elevated: { type: Boolean, reflect: true },
    /** Hides the automatic clear ('close') button when text is present. */
    noClear: { type: Boolean, attribute: 'no-clear', reflect: true },
    /** Internal state tracking whether custom trailing content is slotted. */
    _hasSlottedTrailing: { state: true },
    /** Internal state tracking whether a trailing avatar is slotted. */
    _hasSlottedAvatar: { state: true },
  }

  constructor() {
    super()
    this.label = 'Search'
    this.placeholder = 'Search'
    this.value = ''
    this.name = ''
    this.disabled = false
    this.centerAligned = false
    this.elevated = false
    this.noClear = false
    this._hasSlottedTrailing = false
    this._hasSlottedAvatar = false
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

  _handleContainerClick(e) {
    if (this.disabled) return
    const input = this.renderRoot?.querySelector('#input')
    if (!input) return
    // Do not steal focus if clicking an interactive slotted element or clear button
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
  }

  _handleInput(e) {
    this.value = e.target.value
  }

  _handleChange(e) {
    this.value = e.target.value
    redispatchEvent(this, e)
  }

  _handleKeyDown(e) {
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

  _handleTrailingSlotChange(e) {
    const nodes = e.target.assignedNodes({ flatten: true })
    this._hasSlottedTrailing = nodes.some(
      (n) => n.nodeType === Node.ELEMENT_NODE || (n.textContent || '').trim().length > 0,
    )
  }

  _handleAvatarSlotChange(e) {
    const nodes = e.target.assignedNodes({ flatten: true })
    this._hasSlottedAvatar = nodes.some(
      (n) => n.nodeType === Node.ELEMENT_NODE || (n.textContent || '').trim().length > 0,
    )
  }

  _clear(e) {
    if (e) {
      e.stopPropagation()
    }
    if (this.disabled) return
    const input = this.renderRoot?.querySelector('#input')
    this.value = ''
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

    return html`
      <div
        class="md3-search-bar ${hasTrailing ? 'has-trailing' : ''}"
        part="container"
        role="search"
        @click=${this._handleContainerClick}>
        <md-elevation part="elevation"></md-elevation>
        <div class="md3-search-bar__state-layer" part="state-layer"></div>
        <md-focus-ring part="focus-ring" for="input"></md-focus-ring>

        <div class="md3-search-bar__leading" part="leading">
          <slot name="leading-icon">
            <md-icon aria-hidden="true">search</md-icon>
          </slot>
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
          ?disabled=${this.disabled}
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
    `
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-width: var(--md-search-min-width, var(--md-comp-search-bar-container-min-width, min(360px, 100%)));
      max-width: var(--md-search-max-width, var(--md-comp-search-bar-container-max-width, 720px));
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

    md-elevation {
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
  `
}

customElements.define('md-search', Search)
