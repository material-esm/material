/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { css } from 'lit'

export const styles = css`
  :host {
    --_z-index: var(--md-sheet-z-index, 1000);
    --_scrim-color: var(--md-sheet-scrim-color, var(--md-sys-color-scrim, #000));
    --_scrim-opacity: var(--md-sheet-scrim-opacity, 0.32);
    --_outline-color: var(--md-sheet-outline-color, var(--md-sys-color-outline-variant, #cac4d0));
    --_drag-handle-color: var(--md-sheet-drag-handle-color, var(--md-sys-color-on-surface-variant, #49454f));
    --_icon-color: var(--md-sheet-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
    --_content-color: var(--md-sheet-content-color, var(--md-sys-color-on-surface, #1d1b20));
    --_bottom-shape: var(--md-sheet-container-shape, var(--md-sys-shape-corner-extra-large, 28px));
    --_side-shape: var(--md-sheet-container-shape, var(--md-sys-shape-corner-large, 16px));
    --_bottom-max-width: var(--md-sheet-max-width, 640px);
    --_side-max-width: var(--md-sheet-max-width, 400px);

    display: none;
    position: fixed;
    inset: 0;
    z-index: var(--_z-index);
    pointer-events: none;
    box-sizing: border-box;
    overscroll-behavior: contain;
    align-items: flex-end;
    justify-content: center;
  }

  :host([open]) {
    display: flex;
  }

  /* Side sheet host alignments */
  :host([position='end']),
  :host([position='side']) {
    align-items: stretch;
    justify-content: flex-end;
  }

  :host([position='start']) {
    align-items: stretch;
    justify-content: flex-start;
  }

  :host([position='right']),
  :host([position='left']) {
    align-items: stretch;
  }

  /* Standard (non-modal) viewport-docked host bounds */
  :host(:not([inline])[type='standard']),
  :host(:not([inline])[modal='false']) {
    inset: auto 0 0 0;
    pointer-events: none;
  }

  :host(:not([inline])[position='end'][type='standard']),
  :host(:not([inline])[position='end'][modal='false']),
  :host(:not([inline])[position='side'][type='standard']),
  :host(:not([inline])[position='side'][modal='false']) {
    inset-block: 0;
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  :host(:not([inline])[position='start'][type='standard']),
  :host(:not([inline])[position='start'][modal='false']) {
    inset-block: 0;
    inset-inline-start: 0;
    inset-inline-end: auto;
  }

  :host(:not([inline])[position='right'][type='standard']),
  :host(:not([inline])[position='right'][modal='false']) {
    inset: 0 0 0 auto;
  }

  :host(:not([inline])[position='left'][type='standard']),
  :host(:not([inline])[position='left'][modal='false']) {
    inset: 0 auto 0 0;
  }

  /* Coplanar inline layout mode for standard side sheets inside flex/grid shells */
  :host([inline]) {
    position: sticky;
    inset: auto;
    top: 0;
    height: 100vh;
    height: 100svh;
    z-index: auto;
    pointer-events: auto;
    flex-shrink: 0;
    overflow: hidden;
  }

  .scrim {
    position: fixed;
    inset: 0;
    background-color: var(--_scrim-color);
    opacity: var(--_scrim-opacity);
    z-index: 1;
    pointer-events: auto;
    overflow: hidden;
    overscroll-behavior: contain;
  }

  /* Base Sheet Surface */
  .sheet {
    position: relative;
    z-index: 2;
    pointer-events: auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    color: var(--_content-color);
    outline: none;
    overflow: hidden;
    overscroll-behavior: contain;
  }

  /* Bottom Sheet Surface (M3 Bottom Sheets spec) */
  .sheet.bottom-sheet {
    --md-elevation-level: 1;
    --_actions-justify: var(--md-sheet-actions-justify, flex-end);
    --_headline-color: var(--md-sheet-headline-color, var(--md-sys-color-on-surface, #1d1b20));
    width: var(--md-sheet-width, 100%);
    max-width: var(--_bottom-max-width);
    max-height: var(--md-sheet-max-height, calc(100vh - 72px));
    max-height: var(--md-sheet-max-height, calc(100svh - 72px));
    margin: 0 auto;
    background-color: var(--md-sheet-container-color, var(--md-sys-color-surface-container-low, #f7f2fa));
    border-top-left-radius: var(--_bottom-shape);
    border-top-right-radius: var(--_bottom-shape);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  :host([full-width]) .sheet.bottom-sheet {
    max-width: 100%;
    margin: 0;
  }

  :host([detached]) .sheet.bottom-sheet {
    margin: 16px auto;
    width: calc(100% - 32px);
    max-width: min(var(--_bottom-max-width), calc(100% - 32px));
    border-radius: var(--_bottom-shape);
  }

  /* Side Sheet Surface (M3 Side Sheets spec: max-width 400dp, full height) */
  .sheet.side-sheet {
    --_actions-justify: var(--md-sheet-actions-justify, flex-start);
    --_headline-color: var(--md-sheet-headline-color, var(--md-sys-color-on-surface-variant, #49454f));
    width: var(--md-sheet-width, 100%);
    max-width: var(--_side-max-width);
    height: 100%;
    max-height: var(--md-sheet-max-height, 100%);
  }

  :host([position='right']) .sheet.side-sheet {
    margin-left: auto;
    margin-right: 0;
  }

  :host([position='left']) .sheet.side-sheet {
    margin-right: auto;
    margin-left: 0;
  }

  :host([inline]) .sheet.side-sheet {
    width: var(--md-sheet-width, 360px);
    max-width: min(var(--_side-max-width), 100vw);
  }

  /* Modal Side Sheet: Surface container low, 16dp inner corners, level 1 elevation */
  .sheet.side-sheet.modal {
    --md-elevation-level: 1;
    background-color: var(--md-sheet-container-color, var(--md-sys-color-surface-container-low, #f7f2fa));
  }

  .sheet.side-sheet.modal.resolved-right {
    border-top-left-radius: var(--_side-shape);
    border-bottom-left-radius: var(--_side-shape);
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .sheet.side-sheet.modal.resolved-left {
    border-top-right-radius: var(--_side-shape);
    border-bottom-right-radius: var(--_side-shape);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  /* Standard Side Sheet: Surface container, 0dp corners, 1px outline-variant inner divider */
  .sheet.side-sheet.standard {
    --md-elevation-level: 0;
    width: var(--md-sheet-width, min(400px, 100vw));
    background-color: var(--md-sheet-container-color, var(--md-sys-color-surface, #fef7ff));
    border-radius: 0;
  }

  .sheet.side-sheet.standard.resolved-right {
    border-left: 1px solid var(--_outline-color);
  }

  .sheet.side-sheet.standard.resolved-left {
    border-right: 1px solid var(--_outline-color);
  }

  /* Detached Side Sheet: 16dp margins and 16dp radius on all four corners */
  :host([detached]) .sheet.side-sheet {
    margin: 16px;
    height: calc(100% - 32px);
    max-height: calc(100% - 32px);
    width: calc(100% - 32px);
    max-width: min(var(--_side-max-width), calc(100vw - 32px));
    border-radius: var(--_side-shape);
  }

  :host([position='right'][detached]) .sheet.side-sheet {
    margin-left: auto;
    margin-right: 16px;
  }

  :host([position='left'][detached]) .sheet.side-sheet {
    margin-right: auto;
    margin-left: 16px;
  }

  :host([detached]) .sheet.side-sheet.standard {
    width: var(--md-sheet-width, min(400px, calc(100vw - 32px)));
    border: 1px solid var(--_outline-color);
  }

  :host([full-width]) .sheet.side-sheet {
    max-width: 100%;
    width: 100%;
  }

  md-elevation {
    border-radius: inherit;
    pointer-events: none;
  }

  /* Drag Handle (32dp x 4dp pill in 48dp touch target) */
  .drag-handle-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 48px;
    min-height: 48px;
    flex-shrink: 0;
    cursor: grab;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .drag-handle-container:active {
    cursor: grabbing;
  }

  .drag-handle {
    width: 32px;
    height: 4px;
    border-radius: 2px;
    background-color: var(--_drag-handle-color);
    opacity: 0.4;
  }

  /* Header (Back button, Headline, Close button) */
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    flex-shrink: 0;
    color: var(--_icon-color);
  }

  .sheet:not(.with-header) .header {
    display: none;
  }

  /* Side Sheet header spacing (24dp outer text padding, 12dp icon button inset) */
  .sheet.side-sheet .header {
    min-height: 64px;
    padding: 12px 24px;
  }

  .sheet.side-sheet.with-back .header {
    padding-inline-start: 12px;
  }

  .sheet.side-sheet.with-close .header {
    padding-inline-end: 12px;
  }

  /* Bottom Sheet header spacing */
  .sheet.bottom-sheet .header {
    padding: 0 24px 16px 24px;
  }

  .sheet.bottom-sheet:not(.with-drag-handle) .header {
    padding-top: 24px;
  }

  .sheet.bottom-sheet.with-back .header {
    padding-inline-start: 12px;
    padding-top: 12px;
  }

  .sheet.bottom-sheet.with-close .header {
    padding-inline-end: 12px;
    padding-top: 12px;
  }

  .sheet.bottom-sheet.with-drag-handle.with-back .header,
  .sheet.bottom-sheet.with-drag-handle.with-close .header {
    padding-top: 0;
  }

  .back-button-wrapper,
  .close-button-wrapper {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--_icon-color);
  }

  .back-button-wrapper.visible,
  .close-button-wrapper.visible {
    display: inline-flex;
  }

  .back-icon:dir(rtl) {
    transform: scaleX(-1);
  }

  .headline {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    font-family: var(
      --md-sheet-headline-font,
      var(--md-sys-typescale-title-large-font, var(--md-ref-typeface-brand, Roboto))
    );
    font-size: var(--md-sheet-headline-size, var(--md-sys-typescale-title-large-size, 1.375rem));
    line-height: var(--md-sheet-headline-line-height, var(--md-sys-typescale-title-large-line-height, 1.75rem));
    font-weight: var(--md-sheet-headline-weight, var(--md-sys-typescale-title-large-weight, 400));
    color: var(--_headline-color);
  }

  /* Optional Header & Footer Dividers */
  .header-divider,
  .actions-divider {
    display: none;
    flex-shrink: 0;
  }

  .sheet.with-divider.with-header .header-divider {
    display: flex;
  }

  .sheet.with-divider.with-actions .actions-divider {
    display: flex;
  }

  /* Scrollable Body Content */
  .content-scroller {
    flex: 1 1 auto;
    overflow-y: auto;
    overscroll-behavior: contain;
    box-sizing: border-box;
    padding: 0 24px 16px 24px;
  }

  .sheet.bottom-sheet:not(.with-drag-handle):not(.with-header) .content-scroller,
  .sheet.side-sheet:not(.with-drag-handle):not(.with-header) .content-scroller {
    padding-top: 24px;
  }

  .sheet.with-divider.with-header .content-scroller {
    padding-top: 16px;
  }

  .content {
    font-family: var(
      --md-sheet-content-font,
      var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto))
    );
    font-size: var(--md-sheet-content-size, var(--md-sys-typescale-body-medium-size, 0.875rem));
    line-height: var(--md-sheet-content-line-height, var(--md-sys-typescale-body-medium-line-height, 1.25rem));
    font-weight: var(--md-sheet-content-weight, var(--md-sys-typescale-body-medium-weight, 400));
    color: var(--_content-color);
  }

  ::slotted(md-list) {
    --md-list-container-color: transparent;
    background: transparent;
    margin: 0 -24px;
  }

  /* Bottom Actions Area (M3 Side Sheets: 72dp min-height, 16dp top / 24dp bottom, start-aligned) */
  .actions {
    display: none;
    position: relative;
    flex-shrink: 0;
    box-sizing: border-box;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 72px;
    padding: 16px 24px 24px 24px;
    justify-content: var(--_actions-justify);
  }

  .sheet.with-actions .actions {
    display: flex;
  }

  slot[name='actions']::slotted(div) {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    justify-content: var(--_actions-justify);
  }
`
