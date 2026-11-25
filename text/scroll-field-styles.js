/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { css } from 'lit'

export const scrollFieldStyles = css`
  :host {
    --_item-height: var(--md-scroll-field-item-height, 48px);
    --_visible-items: var(--md-scroll-field-visible-items, 3);
    --_width-1-2: var(--md-scroll-field-width-1-2, 88px);
    --_width-3: var(--md-scroll-field-width-3, 116px);
    --_width-4: var(--md-scroll-field-width-4, 144px);
    --_width: var(--md-scroll-field-width, var(--_width-1-2));
    --_container-color: var(--md-scroll-field-container-color, var(--md-sys-color-surface-container, #efedf4));
    --_container-shape: var(--md-scroll-field-container-shape, var(--md-sys-shape-corner-large, 16px));
    --_indicator-color: var(--md-scroll-field-indicator-color, var(--md-sys-color-surface-container-highest, #e3e1e9));
    --_active-indicator-color: var(
      --md-scroll-field-active-indicator-color,
      var(--md-sys-color-secondary-container, #e8def8)
    );
    --_indicator-shape: var(--md-scroll-field-indicator-shape, 14px);
    --_selected-text-color: var(--md-scroll-field-selected-text-color, var(--md-sys-color-on-surface, #1d1b20));
    --_active-selected-text-color: var(
      --md-scroll-field-active-selected-text-color,
      var(--md-sys-color-on-secondary-container, #1d192b)
    );
    --_unselected-text-color: var(
      --md-scroll-field-unselected-text-color,
      var(--md-sys-color-on-surface-variant, #49454f)
    );
    --_suffix-color: var(--md-scroll-field-suffix-color, var(--md-sys-color-on-surface-variant, #49454f));
    --_label-color: var(--md-scroll-field-label-color, var(--md-sys-color-on-surface-variant, #49454f));
    --_focus-outline-color: var(--md-scroll-field-focus-outline-color, var(--md-sys-color-primary, #6750a4));
    --_error-color: var(--md-scroll-field-error-color, var(--md-sys-color-error, #ba1a1a));
    --_error-container-color: var(
      --md-scroll-field-error-container-color,
      var(--md-sys-color-error-container, #ffdad6)
    );
    --_on-error-container-color: var(
      --md-scroll-field-on-error-container-color,
      var(--md-sys-color-on-error-container, #410002)
    );
    --_font-family: var(--md-scroll-field-font-family, var(--md-ref-typeface-brand, inherit));
    --_selected-font-size: var(--md-scroll-field-selected-font-size, 1.75rem);
    --_selected-font-weight: var(--md-scroll-field-selected-font-weight, 600);
    --_unselected-font-size: var(--md-scroll-field-unselected-font-size, 1.25rem);
    --_unselected-font-weight: var(--md-scroll-field-unselected-font-weight, 400);

    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: top;
    box-sizing: border-box;
    font-family: var(--_font-family);
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none;
  }

  :host([size='1']),
  :host([size='2']),
  :host([size='1-2']) {
    --_width: var(--md-scroll-field-width, var(--_width-1-2));
  }

  :host([size='3']) {
    --_width: var(--md-scroll-field-width, var(--_width-3));
  }

  :host([size='4']) {
    --_width: var(--md-scroll-field-width, var(--_width-4));
  }

  :host([size='auto']) {
    --_width: var(--md-scroll-field-width, auto);
  }

  .root {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    box-sizing: border-box;
  }

  .spinbutton {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--_width);
    width: var(--_width);
    height: calc(var(--_item-height) * var(--_visible-items));
    background-color: var(--_container-color);
    border-radius: var(--_container-shape);
    box-sizing: border-box;
    outline: none;
    overflow: visible;
  }

  :host([size='auto']) .spinbutton {
    min-width: 76px;
    width: max-content;
  }

  .root.focused .spinbutton,
  .root.editing .spinbutton {
    --_indicator-color: var(--_active-indicator-color);
    --_selected-text-color: var(--_active-selected-text-color);
  }

  .spinbutton:focus-visible {
    outline: 2px solid var(--_focus-outline-color);
    outline-offset: 2px;
  }

  .root.editing .selection-indicator {
    outline: 2px solid var(--_focus-outline-color);
    outline-offset: -2px;
  }

  .root.error .spinbutton {
    --_indicator-color: var(--_error-container-color);
    --_active-indicator-color: var(--_error-container-color);
    --_selected-text-color: var(--_on-error-container-color);
    --_active-selected-text-color: var(--_on-error-container-color);
    box-shadow: inset 0 0 0 1.5px var(--_error-color);
  }

  .root.error .spinbutton:focus-visible,
  .root.error.editing .selection-indicator {
    outline-color: var(--_error-color);
  }

  .root.disabled {
    pointer-events: none;
  }

  .root.disabled .spinbutton {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 4%, transparent);
    --_indicator-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 10%, transparent);
    --_selected-text-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 38%, transparent);
    --_unselected-text-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 26%, transparent);
    --_suffix-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 38%, transparent);
  }

  .root.disabled .caption {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 38%, transparent);
  }

  .selection-indicator {
    position: absolute;
    inset-inline: 4px;
    top: 50%;
    transform: translateY(-50%);
    height: var(--_item-height);
    border-radius: var(--_indicator-shape);
    background-color: var(--_indicator-color);
    pointer-events: none;
    z-index: 1;
    box-sizing: border-box;
  }

  .scroller {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-snap-type: y mandatory;
    overscroll-behavior-y: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-block: var(--_item-height);
    box-sizing: border-box;
    cursor: grab;
    touch-action: pan-y;
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.85) 20%,
      #000 34%,
      #000 66%,
      rgba(0, 0, 0, 0.85) 80%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.85) 20%,
      #000 34%,
      #000 66%,
      rgba(0, 0, 0, 0.85) 80%,
      transparent 100%
    );
  }

  .scroller::-webkit-scrollbar {
    display: none;
  }

  .scroller.dragging {
    scroll-snap-type: none;
    cursor: grabbing;
  }

  .root.readonly .scroller {
    cursor: default;
  }

  .root.editing .scroller {
    visibility: hidden;
    pointer-events: none;
  }

  .wheel-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    height: var(--_item-height);
    padding-inline: 12px;
    box-sizing: border-box;
    scroll-snap-align: center;
    font-variant-numeric: tabular-nums;
    font-size: var(--_unselected-font-size);
    font-weight: var(--_unselected-font-weight);
    line-height: 1;
    color: var(--_unselected-text-color);
    opacity: 0.72;
    white-space: nowrap;
    cursor: pointer;
  }

  .wheel-item.selected {
    font-size: var(--_selected-font-size);
    font-weight: var(--_selected-font-weight);
    color: var(--_selected-text-color);
    opacity: 1;
  }

  @media (prefers-reduced-motion: no-preference) {
    .selection-indicator {
      transition:
        background-color 180ms cubic-bezier(0.2, 0, 0, 1),
        outline-color 180ms cubic-bezier(0.2, 0, 0, 1);
    }

    .wheel-item {
      transform: scale(0.88);
      transition:
        transform 160ms cubic-bezier(0.2, 0, 0, 1),
        color 160ms cubic-bezier(0.2, 0, 0, 1),
        opacity 160ms cubic-bezier(0.2, 0, 0, 1),
        font-size 160ms cubic-bezier(0.2, 0, 0, 1);
    }

    .wheel-item.selected {
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .selection-indicator,
    .wheel-item {
      transition: none !important;
      transform: none !important;
    }
  }

  @media (forced-colors: active) {
    .spinbutton {
      border: 1px solid ButtonBorder;
    }

    .selection-indicator {
      border: 2px solid Highlight;
    }

    .spinbutton:focus-visible {
      outline: 2px solid Highlight;
    }
  }

  .item-suffix,
  .editor-suffix {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--_suffix-color);
    margin-inline-start: 2px;
    align-self: baseline;
  }

  .wheel-item:not(.selected) .item-suffix {
    opacity: 0;
    width: 0;
    overflow: hidden;
    margin: 0;
  }

  .editor-overlay {
    position: absolute;
    inset-inline: 6px;
    top: 50%;
    transform: translateY(-50%);
    height: var(--_item-height);
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding-inline: 8px;
    box-sizing: border-box;
  }

  .direct-input {
    width: 100%;
    min-width: 0;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    padding: 0;
    margin: 0;
    text-align: center;
    font-family: inherit;
    font-variant-numeric: tabular-nums;
    font-size: var(--_selected-font-size);
    font-weight: var(--_selected-font-weight);
    color: var(--_selected-text-color);
    caret-color: var(--_focus-outline-color);
    user-select: text;
    -webkit-user-select: text;
  }

  .direct-input::selection {
    background-color: color-mix(in srgb, var(--_focus-outline-color) 28%, transparent);
  }

  .caption {
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1rem;
    letter-spacing: 0.025em;
    color: var(--_label-color);
    text-align: center;
    max-width: 100%;
  }

  .root.focused .caption,
  .root.editing .caption {
    color: var(--_focus-outline-color);
  }

  .root.error .caption {
    color: var(--_error-color);
  }

  .fallback-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`

export const scrollFieldGroupStyles = css`
  :host {
    --_group-gap: var(--md-scroll-field-group-gap, 8px);
    --_group-padding: var(--md-scroll-field-group-padding, 12px);
    --_group-shape: var(--md-scroll-field-group-shape, var(--md-sys-shape-corner-extra-large, 28px));
    --_group-color: var(--md-scroll-field-group-container-color, var(--md-sys-color-surface-container-low, #f4f2fa));
    --_separator-color: var(--md-scroll-field-group-separator-color, var(--md-sys-color-on-surface, #1d1b20));
    --_item-height: var(--md-scroll-field-item-height, 48px);
    --_visible-items: var(--md-scroll-field-visible-items, 3);

    display: inline-flex;
    flex-direction: column;
    gap: 8px;
    padding: var(--_group-padding);
    border-radius: var(--_group-shape);
    background-color: var(--_group-color);
    box-sizing: border-box;
    vertical-align: top;
  }

  :host([plain]) {
    padding: 0;
    border-radius: 0;
    background-color: transparent;
  }

  .group-header {
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1rem;
    letter-spacing: 0.03em;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    padding-inline: 4px;
  }

  .group-row {
    display: inline-flex;
    align-items: flex-start;
    justify-content: center;
    gap: var(--_group-gap);
  }

  ::slotted(.separator),
  ::slotted([data-separator]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: calc(var(--_item-height) * var(--_visible-items));
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1;
    color: var(--_separator-color);
    padding-inline: 2px;
    user-select: none;
  }
`

export const styles = scrollFieldStyles
