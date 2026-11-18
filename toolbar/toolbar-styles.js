/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { css } from 'lit'

export const styles = css`
  :host {
    /* Private shadow tokens reading public --md-toolbar-* custom properties */
    --_container-color: var(--md-toolbar-container-color, var(--md-sys-color-surface-container-high, #ece6f0));
    --_container-height: var(--md-toolbar-container-height, 64px);
    --_container-width: var(--md-toolbar-container-width, 64px);
    --_container-shape: var(--md-toolbar-container-shape, var(--md-sys-shape-corner-full, 9999px));
    --_container-elevation: var(--md-toolbar-container-elevation, 3);
    --_container-shadow-color: var(--md-toolbar-container-shadow-color, var(--md-sys-color-shadow, #000));
    --_icon-color: var(--md-toolbar-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
    --_active-container-color: var(
      --md-toolbar-active-container-color,
      var(--md-sys-color-secondary-container, #e8def8)
    );
    --_active-icon-color: var(--md-toolbar-active-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));
    --_filled-container-color: var(--md-toolbar-filled-container-color, var(--md-sys-color-primary, #6750a4));
    --_filled-icon-color: var(--md-toolbar-filled-icon-color, var(--md-sys-color-on-primary, #ffffff));
    --_inline-padding: var(--md-toolbar-inline-padding, 12px);
    --_block-padding: var(--md-toolbar-block-padding, 8px);
    --_item-gap: var(--md-toolbar-item-gap, 4px);
    --_fab-gap: var(--md-toolbar-fab-gap, 8px);
    --_edge-offset: var(--md-toolbar-edge-offset, 16px);
    --_z-index: var(--md-toolbar-z-index, 100);
    --_positioning: var(--md-toolbar-positioning, fixed);

    display: inline-flex;
    vertical-align: middle;
    box-sizing: border-box;
    max-width: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Contained mode anchors positioned toolbars inside a relative container instead of viewport */
  :host([contained]) {
    --_positioning: var(--md-toolbar-positioning, absolute);
  }

  /* Docked Toolbar host defaults (replaces legacy M3 Bottom App Bar) */
  :host([type='docked']),
  :host([variant='docked']) {
    --_container-color: var(--md-toolbar-container-color, var(--md-sys-color-surface-container, #f3edf7));
    --_container-shape: var(--md-toolbar-container-shape, var(--md-sys-shape-corner-none, 0px));
    --_container-elevation: var(--md-toolbar-container-elevation, 2);
    --_inline-padding: var(--md-toolbar-inline-padding, 16px);
    --_block-padding: var(--md-toolbar-block-padding, 0px);
    --_item-gap: var(--md-toolbar-item-gap, clamp(8px, 3vw, 32px));
    display: block;
    width: 100%;
  }

  /* Floating Vertical host defaults */
  :host([orientation='vertical']:not([type='docked']):not([variant='docked'])) {
    --_inline-padding: var(--md-toolbar-inline-padding, 8px);
    --_block-padding: var(--md-toolbar-block-padding, 12px);
  }

  /* Vibrant color scheme */
  :host([color='vibrant']),
  :host([variant='vibrant']) {
    --_container-color: var(--md-toolbar-container-color, var(--md-sys-color-primary-container, #eaddff));
    --_icon-color: var(--md-toolbar-icon-color, var(--md-sys-color-on-primary-container, #21005d));
    --_active-container-color: var(--md-toolbar-active-container-color, var(--md-sys-color-primary, #6750a4));
    --_active-icon-color: var(--md-toolbar-active-icon-color, var(--md-sys-color-on-primary, #ffffff));
    --_filled-container-color: var(--md-toolbar-filled-container-color, var(--md-sys-color-primary, #6750a4));
    --_filled-icon-color: var(--md-toolbar-filled-icon-color, var(--md-sys-color-on-primary, #ffffff));
  }

  /* Screen-edge positioning for Floating Toolbars (16px screen-edge offset + safe-area insets) */
  :host([position='bottom']:not([type='docked']):not([variant='docked'])) {
    position: var(--_positioning);
    inset-block-end: calc(var(--_edge-offset) + env(safe-area-inset-bottom, 0px));
    inset-inline-start: calc(var(--_edge-offset) + env(safe-area-inset-left, 0px));
    inset-inline-end: calc(var(--_edge-offset) + env(safe-area-inset-right, 0px));
    margin-inline: auto;
    width: fit-content;
    max-width: calc(
      100% - (var(--_edge-offset) * 2) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)
    );
    z-index: var(--_z-index);
  }

  :host([position='top']:not([type='docked']):not([variant='docked'])) {
    position: var(--_positioning);
    inset-block-start: calc(var(--_edge-offset) + env(safe-area-inset-top, 0px));
    inset-inline-start: calc(var(--_edge-offset) + env(safe-area-inset-left, 0px));
    inset-inline-end: calc(var(--_edge-offset) + env(safe-area-inset-right, 0px));
    margin-inline: auto;
    width: fit-content;
    max-width: calc(
      100% - (var(--_edge-offset) * 2) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)
    );
    z-index: var(--_z-index);
  }

  :host([position='start']:not([type='docked']):not([variant='docked'])) {
    position: var(--_positioning);
    inset-inline-start: calc(var(--_edge-offset) + env(safe-area-inset-left, 0px));
    inset-block-start: calc(var(--_edge-offset) + env(safe-area-inset-top, 0px));
    inset-block-end: calc(var(--_edge-offset) + env(safe-area-inset-bottom, 0px));
    margin-block: auto;
    width: fit-content;
    height: fit-content;
    z-index: var(--_z-index);
  }

  :host([position='end']:not([type='docked']):not([variant='docked'])) {
    position: var(--_positioning);
    inset-inline-end: calc(var(--_edge-offset) + env(safe-area-inset-right, 0px));
    inset-block-start: calc(var(--_edge-offset) + env(safe-area-inset-top, 0px));
    inset-block-end: calc(var(--_edge-offset) + env(safe-area-inset-bottom, 0px));
    margin-block: auto;
    width: fit-content;
    height: fit-content;
    z-index: var(--_z-index);
  }

  /* Screen-edge positioning for Docked Toolbars (full-width bottom-anchored, 0px corner radius) */
  :host([type='docked'][position='bottom']),
  :host([variant='docked'][position='bottom']) {
    position: var(--_positioning);
    inset-block-end: 0;
    inset-inline: 0;
    width: 100%;
    z-index: var(--_z-index);
  }

  :host([type='docked'][position='top']),
  :host([variant='docked'][position='top']) {
    position: var(--_positioning);
    inset-block-start: 0;
    inset-inline: 0;
    width: 100%;
    z-index: var(--_z-index);
  }

  /* Outer wrapper pairs the toolbar surface with an optional adjacent slot="fab" (8px gap) */
  .toolbar-wrapper {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: var(--_fab-gap);
    box-sizing: border-box;
    max-width: 100%;
  }

  .toolbar-wrapper--vertical {
    flex-direction: column;
  }

  .toolbar-wrapper--fab-start.toolbar-wrapper--horizontal {
    flex-direction: row-reverse;
  }

  .toolbar-wrapper--fab-start.toolbar-wrapper--vertical {
    flex-direction: column-reverse;
  }

  .toolbar-wrapper--docked {
    display: flex;
    width: 100%;
  }

  .toolbar-wrapper--docked.has-fab {
    padding-inline-end: max(16px, env(safe-area-inset-right, 0px));
  }

  .toolbar-wrapper--docked.toolbar-wrapper--fab-start.has-fab {
    padding-inline-end: 0;
    padding-inline-start: max(16px, env(safe-area-inset-left, 0px));
  }

  /* Main interactive toolbar container */
  .toolbar {
    position: relative;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    background-color: var(--_container-color);
    color: var(--_icon-color);
    border-radius: var(--_container-shape);
    user-select: none;
    z-index: 0;

    --md-elevation-level: var(--_container-elevation);
    --md-elevation-shadow-color: var(--_container-shadow-color);
    --md-divider-color: var(--md-sys-color-outline-variant, #cac4d0);

    /* Cascade M3 Expressive toolbar tokens to slotted <md-icon-button> and <md-button> controls */
    --md-icon-button-icon-color: var(--_icon-color);
    --md-icon-button-hover-icon-color: var(--_icon-color);
    --md-icon-button-focus-icon-color: var(--_icon-color);
    --md-icon-button-pressed-icon-color: var(--_icon-color);
    --md-icon-button-hover-state-layer-color: var(--_icon-color);
    --md-icon-button-pressed-state-layer-color: var(--_icon-color);
    --md-icon-button-toggle-icon-color: var(--_icon-color);
    --md-icon-button-toggle-hover-icon-color: var(--_icon-color);
    --md-icon-button-toggle-focus-icon-color: var(--_icon-color);
    --md-icon-button-toggle-pressed-icon-color: var(--_icon-color);
    --md-icon-button-toggle-hover-state-layer-color: var(--_icon-color);
    --md-icon-button-toggle-pressed-state-layer-color: var(--_icon-color);
    --md-icon-button-unselected-container-color: transparent;
    --md-icon-button-selected-container-color: var(--_active-container-color);
    --md-icon-button-selected-icon-color: var(--_active-icon-color);
    --md-icon-button-selected-hover-icon-color: var(--_active-icon-color);
    --md-icon-button-selected-focus-icon-color: var(--_active-icon-color);
    --md-icon-button-selected-pressed-icon-color: var(--_active-icon-color);
    --md-icon-button-selected-hover-state-layer-color: var(--_active-icon-color);
    --md-icon-button-selected-pressed-state-layer-color: var(--_active-icon-color);
    --md-icon-button-toggle-selected-icon-color: var(--_active-icon-color);
    --md-icon-button-toggle-selected-hover-icon-color: var(--_active-icon-color);
    --md-icon-button-toggle-selected-focus-icon-color: var(--_active-icon-color);
    --md-icon-button-toggle-selected-pressed-icon-color: var(--_active-icon-color);
    --md-icon-button-toggle-selected-hover-state-layer-color: var(--_active-icon-color);
    --md-icon-button-toggle-selected-pressed-state-layer-color: var(--_active-icon-color);

    --md-button-container-color: var(--_filled-container-color);
    --md-button-label-text-color: var(--_filled-icon-color);
    --md-button-hover-label-text-color: var(--_filled-icon-color);
    --md-button-focus-label-text-color: var(--_filled-icon-color);
    --md-button-pressed-label-text-color: var(--_filled-icon-color);
    --md-button-icon-color: var(--_filled-icon-color);
    --md-button-hover-icon-color: var(--_filled-icon-color);
    --md-button-focus-icon-color: var(--_filled-icon-color);
    --md-button-pressed-icon-color: var(--_filled-icon-color);
    --md-button-hover-state-layer-color: var(--_filled-icon-color);
    --md-button-pressed-state-layer-color: var(--_filled-icon-color);
    --md-button-selected-container-color: var(--_active-container-color);
    --md-button-selected-label-text-color: var(--_active-icon-color);
    --md-button-selected-icon-color: var(--_active-icon-color);

    --md-filled-tonal-button-container-color: var(--_active-container-color);
    --md-filled-tonal-button-label-text-color: var(--_active-icon-color);
    --md-filled-tonal-button-hover-label-text-color: var(--_active-icon-color);
    --md-filled-tonal-button-focus-label-text-color: var(--_active-icon-color);
    --md-filled-tonal-button-pressed-label-text-color: var(--_active-icon-color);
    --md-filled-tonal-button-icon-color: var(--_active-icon-color);
    --md-filled-tonal-button-hover-icon-color: var(--_active-icon-color);
    --md-filled-tonal-button-focus-icon-color: var(--_active-icon-color);
    --md-filled-tonal-button-pressed-icon-color: var(--_active-icon-color);
    --md-filled-tonal-button-selected-container-color: var(--_active-container-color);
    --md-filled-tonal-button-selected-label-text-color: var(--_active-icon-color);
    --md-filled-tonal-button-selected-icon-color: var(--_active-icon-color);

    --md-outlined-button-label-text-color: var(--_icon-color);
    --md-outlined-button-icon-color: var(--_icon-color);
    --md-text-button-selected-container-color: var(--_active-container-color);
    --md-text-button-selected-label-text-color: var(--_active-icon-color);
    --md-text-button-selected-icon-color: var(--_active-icon-color);
  }

  /* Variant class fallbacks when variant property is set without host attribute override */
  .toolbar--vibrant {
    --_container-color: var(--md-toolbar-container-color, var(--md-sys-color-primary-container, #eaddff));
    --_icon-color: var(--md-toolbar-icon-color, var(--md-sys-color-on-primary-container, #21005d));
    --_active-container-color: var(--md-toolbar-active-container-color, var(--md-sys-color-primary, #6750a4));
    --_active-icon-color: var(--md-toolbar-active-icon-color, var(--md-sys-color-on-primary, #ffffff));
  }

  /* Floating Horizontal Toolbar: 64px height, pill shape, 8px-12px inline padding, 4px item gap */
  .toolbar--floating.toolbar--horizontal {
    min-height: var(--_container-height);
    height: var(--_container-height);
    padding-inline: var(--_inline-padding);
    padding-block: var(--_block-padding);
    flex-direction: row;
    gap: var(--_item-gap);
    max-width: 100%;
  }

  /* Floating Vertical Toolbar: 64px width, pill shape, 8px-12px block padding, 4px item gap */
  .toolbar--floating.toolbar--vertical {
    min-width: var(--_container-width);
    width: var(--_container-width);
    padding-block: var(--_block-padding);
    padding-inline: var(--_inline-padding);
    flex-direction: column;
    justify-content: center;
    gap: var(--_item-gap);
  }

  /* Docked Toolbar: full-width 64px + safe-area-inset-bottom, 0px radius, 16px inline padding, 8px-32px flexible spacing */
  .toolbar--docked {
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    min-height: calc(var(--_container-height) + env(safe-area-inset-bottom, 0px));
    height: calc(var(--_container-height) + env(safe-area-inset-bottom, 0px));
    padding-top: var(--_block-padding);
    padding-bottom: calc(var(--_block-padding) + env(safe-area-inset-bottom, 0px));
    padding-inline-start: max(var(--_inline-padding), env(safe-area-inset-left, 0px));
    padding-inline-end: max(var(--_inline-padding), env(safe-area-inset-right, 0px));
    flex-direction: row;
    justify-content: space-between;
    gap: var(--_item-gap);
    border-radius: var(--_container-shape);
  }

  md-elevation {
    border-radius: inherit;
    inset: 0;
    position: absolute;
    pointer-events: none;
    z-index: -1;
  }

  /* Sections inside toolbar (leading, items, trailing) */
  .toolbar__section {
    display: inline-flex;
    align-items: center;
    gap: var(--_item-gap);
    min-inline-size: 0;
    box-sizing: border-box;
  }

  .toolbar__section[hidden] {
    display: none !important;
  }

  .toolbar--vertical .toolbar__section {
    flex-direction: column;
    justify-content: center;
  }

  .toolbar--docked .toolbar__items {
    flex: 1 1 auto;
    display: flex;
    justify-content: var(--md-toolbar-docked-justify, space-evenly);
    gap: var(--_item-gap);
  }

  .toolbar--docked.has-edge-slots .toolbar__items {
    justify-content: var(--md-toolbar-docked-justify, center);
  }

  /* Slotted standard icon buttons receive active container pill styling when selected */
  .toolbar__section ::slotted(md-icon-button[selected]) {
    --_container-color: var(--_active-container-color);
  }

  /* Slotted text buttons read --md-button-* tokens; restore toolbar icon/text color so they stay legible */
  .toolbar__section ::slotted(md-button[color='text']) {
    --md-button-label-text-color: var(--_icon-color);
    --md-button-hover-label-text-color: var(--_icon-color);
    --md-button-focus-label-text-color: var(--_icon-color);
    --md-button-pressed-label-text-color: var(--_icon-color);
    --md-button-icon-color: var(--_icon-color);
    --md-button-hover-icon-color: var(--_icon-color);
    --md-button-focus-icon-color: var(--_icon-color);
    --md-button-pressed-icon-color: var(--_icon-color);
    --md-button-hover-state-layer-color: var(--_icon-color);
    --md-button-pressed-state-layer-color: var(--_icon-color);
  }

  /* Floating toolbars enforce round pill geometry on selected icon buttons per M3 Expressive guidelines */
  .toolbar--floating .toolbar__section ::slotted(md-icon-button[selected]) {
    --_container-shape-start-start: var(--md-sys-shape-corner-full, 9999px);
    --_container-shape-start-end: var(--md-sys-shape-corner-full, 9999px);
    --_container-shape-end-end: var(--md-sys-shape-corner-full, 9999px);
    --_container-shape-end-start: var(--md-sys-shape-corner-full, 9999px);
  }

  /* Slotted separators / dividers */
  .toolbar--horizontal .toolbar__section ::slotted([role='separator']),
  .toolbar--horizontal .toolbar__section ::slotted(md-divider) {
    inline-size: 1px;
    block-size: 32px;
    margin-inline: 4px;
    border-inline-start: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    flex-shrink: 0;
  }

  .toolbar--vertical .toolbar__section ::slotted([role='separator']),
  .toolbar--vertical .toolbar__section ::slotted(md-divider) {
    inline-size: 32px;
    block-size: 1px;
    margin-block: 4px;
    border-block-start: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    flex-shrink: 0;
  }

  /* Paired adjacent FAB container (renders outside floating pill with 8px gap) */
  .fab-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .fab-container[hidden] {
    display: none !important;
  }

  /* Scroll hide & collapse states */
  :host([hidden-bar]) .toolbar-wrapper {
    opacity: 0;
    pointer-events: none;
    transform: translateY(calc(100% + 24px));
  }

  :host([hidden-bar][position='top']) .toolbar-wrapper {
    transform: translateY(calc(-100% - 24px));
  }

  :host([hidden-bar][position='start']) .toolbar-wrapper,
  :host([hidden-bar][position='end']:dir(rtl)) .toolbar-wrapper {
    transform: translateX(calc(-100% - 24px));
  }

  :host([hidden-bar][position='end']) .toolbar-wrapper,
  :host([hidden-bar][position='start']:dir(rtl)) .toolbar-wrapper {
    transform: translateX(calc(100% + 24px));
  }

  /* Collapse state: when paired with a FAB, collapses the pill into the FAB; otherwise collapses the bar */
  :host([collapsed]) .toolbar-wrapper.has-fab {
    gap: 0px;
  }

  :host([collapsed]) .toolbar-wrapper.has-fab .toolbar {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
    max-inline-size: 0;
    max-block-size: 0;
    min-inline-size: 0;
    min-block-size: 0;
    padding: 0;
    overflow: hidden;
  }

  :host([collapsed]) .toolbar-wrapper:not(.has-fab) {
    opacity: 0;
    pointer-events: none;
    transform: translateY(calc(100% + 24px)) scale(0.92);
  }

  :host([collapsed][position='top']) .toolbar-wrapper:not(.has-fab) {
    transform: translateY(calc(-100% - 24px)) scale(0.92);
  }

  :host([collapsed][position='start']) .toolbar-wrapper:not(.has-fab),
  :host([collapsed][position='end']:dir(rtl)) .toolbar-wrapper:not(.has-fab) {
    transform: translateX(calc(-100% - 24px)) scale(0.92);
  }

  :host([collapsed][position='end']) .toolbar-wrapper:not(.has-fab),
  :host([collapsed][position='start']:dir(rtl)) .toolbar-wrapper:not(.has-fab) {
    transform: translateX(calc(100% + 24px)) scale(0.92);
  }

  /* Expressive spring transitions gated behind reduced-motion preference */
  @media (prefers-reduced-motion: no-preference) {
    .toolbar-wrapper {
      transition:
        transform 300ms cubic-bezier(0.2, 0, 0, 1),
        opacity 200ms cubic-bezier(0.2, 0, 0, 1),
        gap 280ms cubic-bezier(0.2, 0, 0, 1);
    }

    .toolbar {
      transition:
        background-color 200ms cubic-bezier(0.2, 0, 0, 1),
        transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 180ms cubic-bezier(0.2, 0, 0, 1),
        max-inline-size 300ms cubic-bezier(0.2, 0, 0, 1),
        max-block-size 300ms cubic-bezier(0.2, 0, 0, 1),
        padding 250ms cubic-bezier(0.2, 0, 0, 1);
    }

    md-elevation {
      transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }
  }

  /* Forced-colors (Windows High Contrast) support */
  @media (forced-colors: active) {
    .toolbar {
      outline: 1px solid ButtonText;
      forced-color-adjust: auto;
    }

    .toolbar__section ::slotted([role='separator']),
    .toolbar__section ::slotted(md-divider) {
      border-color: ButtonText;
    }
  }
`
