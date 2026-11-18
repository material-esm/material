/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { css } from 'lit'

export const fabMenuStyles = css`
  :host {
    /* Primary (default) M3 Expressive FAB Menu token set */
    --_trigger-container-color: var(--md-fab-menu-container-color, var(--md-sys-color-primary-container, #eaddff));
    --_trigger-content-color: var(--md-fab-menu-icon-color, var(--md-sys-color-on-primary-container, #21005d));
    --_trigger-label-color: var(--md-fab-menu-label-text-color, var(--_trigger-content-color));
    --_close-container-color: var(--md-fab-menu-close-button-container-color, var(--md-sys-color-primary, #6750a4));
    --_close-icon-color: var(--md-fab-menu-close-button-icon-color, var(--md-sys-color-on-primary, #ffffff));
    --_inherited-item-container-color: var(
      --md-fab-menu-item-container-color,
      var(--md-sys-color-primary-container, #eaddff)
    );
    --_inherited-item-content-color: var(
      --md-fab-menu-item-content-color,
      var(--md-sys-color-on-primary-container, #21005d)
    );
    --_inherited-item-label-color: var(--md-fab-menu-item-label-text-color, var(--_inherited-item-content-color));
    --_inherited-item-icon-color: var(--md-fab-menu-item-icon-color, var(--_inherited-item-content-color));

    /* Dimensions & spacing */
    --_trigger-size: var(--md-fab-menu-container-size, 56px);
    --_trigger-shape: var(--md-fab-menu-container-shape, var(--md-sys-shape-corner-large, 16px));
    --_trigger-icon-size: var(--md-fab-menu-icon-size, 24px);
    --_close-size: var(--md-fab-menu-close-button-size, 56px);
    --_close-shape: var(--md-fab-menu-close-button-shape, var(--md-sys-shape-corner-full, 9999px));
    --_close-icon-size: var(--md-fab-menu-close-button-icon-size, 24px);
    --_item-gap: var(--md-fab-menu-item-gap, 4px);
    --_button-gap: var(--md-fab-menu-button-gap, 8px);
    --_z-index: var(--md-fab-menu-z-index, 900);
    --_scrim-color: var(--md-fab-menu-scrim-color, var(--md-sys-color-scrim, #000000));
    --_scrim-opacity: var(--md-fab-menu-scrim-opacity, 0.32);

    /* Elevation & typography */
    --_elevation: var(--md-fab-menu-container-elevation, 3);
    --_hover-elevation: var(--md-fab-menu-hover-container-elevation, 4);
    --_lowered-elevation: var(--md-fab-menu-lowered-container-elevation, 1);
    --_lowered-hover-elevation: var(--md-fab-menu-lowered-hover-container-elevation, 2);
    --_shadow-color: var(--md-fab-menu-container-shadow-color, var(--md-sys-color-shadow, #000000));
    --_label-font: var(
      --md-fab-menu-label-text-font,
      var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto, sans-serif))
    );
    --_label-size: var(--md-fab-menu-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
    --_label-line-height: var(
      --md-fab-menu-label-text-line-height,
      var(--md-sys-typescale-label-large-line-height, 1.25rem)
    );
    --_label-weight: var(
      --md-fab-menu-label-text-weight,
      var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
    );

    /* Motion curves (M3 Expressive spatial & effects springs) */
    --_spring-spatial: cubic-bezier(0.22, 1.25, 0.36, 1);
    --_standard-easing: cubic-bezier(0.2, 0, 0, 1);

    display: inline-flex;
    position: relative;
    vertical-align: middle;
    align-items: center;
    justify-content: flex-end;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none;
  }

  :host([open]),
  :host([data-closing]) {
    z-index: var(--_z-index);
  }

  :host([align='start']) {
    justify-content: flex-start;
  }

  /* Secondary M3 Expressive color set */
  :host([variant='secondary']),
  :host([color='secondary']) {
    --_trigger-container-color: var(
      --md-fab-menu-secondary-container-color,
      var(--md-fab-menu-container-color, var(--md-sys-color-secondary-container, #e8def8))
    );
    --_trigger-content-color: var(
      --md-fab-menu-secondary-icon-color,
      var(--md-fab-menu-icon-color, var(--md-sys-color-on-secondary-container, #1d192b))
    );
    --_close-container-color: var(
      --md-fab-menu-secondary-close-button-container-color,
      var(--md-fab-menu-close-button-container-color, var(--md-sys-color-secondary, #625b71))
    );
    --_close-icon-color: var(
      --md-fab-menu-secondary-close-button-icon-color,
      var(--md-fab-menu-close-button-icon-color, var(--md-sys-color-on-secondary, #ffffff))
    );
    --_inherited-item-container-color: var(
      --md-fab-menu-secondary-item-container-color,
      var(--md-fab-menu-item-container-color, var(--md-sys-color-secondary-container, #e8def8))
    );
    --_inherited-item-content-color: var(
      --md-fab-menu-secondary-item-content-color,
      var(--md-fab-menu-item-content-color, var(--md-sys-color-on-secondary-container, #1d192b))
    );
  }

  /* Tertiary M3 Expressive color set */
  :host([variant='tertiary']),
  :host([color='tertiary']) {
    --_trigger-container-color: var(
      --md-fab-menu-tertiary-container-color,
      var(--md-fab-menu-container-color, var(--md-sys-color-tertiary-container, #ffd8e4))
    );
    --_trigger-content-color: var(
      --md-fab-menu-tertiary-icon-color,
      var(--md-fab-menu-icon-color, var(--md-sys-color-on-tertiary-container, #31111d))
    );
    --_close-container-color: var(
      --md-fab-menu-tertiary-close-button-container-color,
      var(--md-fab-menu-close-button-container-color, var(--md-sys-color-tertiary, #7d5260))
    );
    --_close-icon-color: var(
      --md-fab-menu-tertiary-close-button-icon-color,
      var(--md-fab-menu-close-button-icon-color, var(--md-sys-color-on-tertiary, #ffffff))
    );
    --_inherited-item-container-color: var(
      --md-fab-menu-tertiary-item-container-color,
      var(--md-fab-menu-item-container-color, var(--md-sys-color-tertiary-container, #ffd8e4))
    );
    --_inherited-item-content-color: var(
      --md-fab-menu-tertiary-item-content-color,
      var(--md-fab-menu-item-content-color, var(--md-sys-color-on-tertiary-container, #31111d))
    );
  }

  /* Surface color option */
  :host([variant='surface']),
  :host([color='surface']) {
    --_trigger-container-color: var(
      --md-fab-menu-surface-container-color,
      var(--md-fab-menu-container-color, var(--md-sys-color-surface-container-high, #ece6f0))
    );
    --_trigger-content-color: var(
      --md-fab-menu-surface-icon-color,
      var(--md-fab-menu-icon-color, var(--md-sys-color-primary, #6750a4))
    );
  }

  /* Collapsed FAB sizes */
  :host([size='small']) {
    --_trigger-size: var(--md-fab-menu-small-container-size, 40px);
    --_trigger-shape: var(--md-fab-menu-small-container-shape, var(--md-sys-shape-corner-medium, 12px));
    --_trigger-icon-size: var(--md-fab-menu-small-icon-size, 24px);
  }

  :host([size='large']) {
    --_trigger-size: var(--md-fab-menu-large-container-size, 96px);
    --_trigger-shape: var(--md-fab-menu-large-container-shape, var(--md-sys-shape-corner-extra-large, 28px));
    --_trigger-icon-size: var(--md-fab-menu-large-icon-size, 36px);
    --_label-size: var(--md-fab-menu-large-label-text-size, 1.5rem);
    --_label-line-height: var(--md-fab-menu-large-label-text-line-height, 2rem);
  }

  :host([disabled]) {
    pointer-events: none;
  }

  /* Optional modal-like backdrop scrim */
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-color: var(--_scrim-color);
    opacity: var(--_scrim-opacity);
    pointer-events: auto;
    transition:
      opacity 220ms linear,
      display 220ms;
    transition-behavior: allow-discrete;
  }

  @starting-style {
    .scrim {
      opacity: 0;
    }
  }

  .scrim:where([hidden], [data-closing]) {
    opacity: 0;
    pointer-events: none;
  }

  .scrim[hidden] {
    display: none;
  }

  /* Trigger / Morphing Close Toggle Button */
  .trigger {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border: none;
    outline: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    font: inherit;
    width: var(--_trigger-size);
    min-width: var(--_trigger-size);
    height: var(--_trigger-size);
    border-radius: var(--_trigger-shape);
    background-color: var(--_trigger-container-color);
    color: var(--_trigger-content-color);
    --md-elevation-level: var(--_elevation);
    --md-elevation-shadow-color: var(--_shadow-color);
    --md-focus-ring-shape: var(--_trigger-shape);
    --md-ripple-hover-color: var(--_trigger-content-color);
    --md-ripple-hover-opacity: 0.08;
    --md-ripple-pressed-color: var(--_trigger-content-color);
    --md-ripple-pressed-opacity: 0.12;
    transition:
      width 280ms var(--_standard-easing),
      min-width 280ms var(--_standard-easing),
      height 280ms var(--_standard-easing),
      padding 280ms var(--_standard-easing),
      border-radius 320ms var(--_spring-spatial),
      background-color 220ms var(--_standard-easing),
      color 220ms var(--_standard-easing);
  }

  .trigger:hover {
    --md-elevation-level: var(--_hover-elevation);
  }

  .trigger.lowered {
    --md-elevation-level: var(--_lowered-elevation);
  }

  .trigger.lowered:hover {
    --md-elevation-level: var(--_lowered-hover-elevation);
  }

  .trigger.extended {
    width: auto;
    min-width: 80px;
    padding-inline-start: 16px;
    padding-inline-end: 20px;
  }

  :host([size='large']) .trigger.extended {
    padding-inline-start: 28px;
    padding-inline-end: 28px;
  }

  /* Morph into circular 56px close button when open */
  :host([open]) .trigger {
    width: var(--_close-size);
    min-width: var(--_close-size);
    height: var(--_close-size);
    padding-inline-start: 0;
    padding-inline-end: 0;
    border-radius: var(--_close-shape);
    background-color: var(--_close-container-color);
    color: var(--_close-icon-color);
    --md-focus-ring-shape: var(--_close-shape);
    --md-ripple-hover-color: var(--_close-icon-color);
    --md-ripple-pressed-color: var(--_close-icon-color);
  }

  .trigger:disabled {
    cursor: default;
    opacity: 0.38;
    --md-elevation-level: 0;
  }

  .trigger .ripple,
  .trigger md-elevation {
    border-radius: inherit;
    z-index: 0;
  }

  .touch-target {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 48px;
    height: 48px;
    transform: translate(-50%, -50%);
  }

  .icon-stack {
    position: relative;
    z-index: 1;
    display: inline-grid;
    place-items: center;
    width: var(--_trigger-icon-size);
    height: var(--_trigger-icon-size);
    flex-shrink: 0;
    transition:
      width 260ms var(--_standard-easing),
      height 260ms var(--_standard-easing);
  }

  :host([open]) .icon-stack {
    width: var(--_close-icon-size);
    height: var(--_close-icon-size);
  }

  .trigger-icon,
  .close-icon {
    grid-area: 1 / 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transition:
      transform 280ms var(--_spring-spatial),
      opacity 180ms var(--_standard-easing);
  }

  .trigger-icon ::slotted(*),
  .trigger-icon md-icon,
  .trigger-icon svg {
    width: var(--_trigger-icon-size);
    height: var(--_trigger-icon-size);
    font-size: var(--_trigger-icon-size);
    color: currentColor;
    fill: currentColor;
  }

  .close-icon ::slotted(*),
  .close-icon md-icon,
  .close-icon svg {
    width: var(--_close-icon-size);
    height: var(--_close-icon-size);
    font-size: var(--_close-icon-size);
    color: currentColor;
    fill: currentColor;
  }

  .trigger-icon {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }

  .close-icon {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
    pointer-events: none;
  }

  :host([open]) .trigger-icon {
    opacity: 0;
    transform: rotate(90deg) scale(0.5);
    pointer-events: none;
  }

  :host([open]) .close-icon {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }

  .trigger-label {
    position: relative;
    z-index: 1;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-inline-start: 12px;
    max-width: 240px;
    opacity: 1;
    color: var(--_trigger-label-color);
    font-family: var(--_label-font);
    font-size: var(--_label-size);
    line-height: var(--_label-line-height);
    font-weight: var(--_label-weight);
    transition:
      max-width 240ms var(--_standard-easing),
      margin-inline-start 240ms var(--_standard-easing),
      opacity 150ms var(--_standard-easing);
  }

  :host([open]) .trigger-label {
    max-width: 0;
    margin-inline-start: 0;
    opacity: 0;
    pointer-events: none;
  }

  /* Speed-dial menu container */
  .menu {
    position: absolute;
    z-index: 2;
    inset-inline-end: 0;
    bottom: calc(100% + var(--_button-gap));
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--_item-gap);
    margin: 0;
    padding: 0;
    min-width: max-content;
    opacity: 1;
    transition:
      opacity 180ms var(--_standard-easing),
      display 220ms;
    transition-behavior: allow-discrete;
  }

  :host([align='start']) .menu {
    inset-inline-end: auto;
    inset-inline-start: 0;
    align-items: flex-start;
  }

  :host([direction='down']) .menu {
    bottom: auto;
    top: calc(100% + var(--_button-gap));
  }

  @starting-style {
    .menu {
      opacity: 0;
    }
  }

  .menu:where([hidden], [data-closing]) {
    opacity: 0;
    pointer-events: none;
  }

  .menu[hidden] {
    display: none;
  }

  /* Staggered item entrance & exit animations */
  .menu ::slotted(md-fab-menu-item) {
    --_item-enter-y: 12px;
    --_item-origin-x: right;
    --_item-origin-y: bottom;
    opacity: 1;
    translate: 0 0;
    scale: 1;
    transform-origin: var(--_item-origin-y) var(--_item-origin-x);
    transition:
      opacity 200ms var(--_standard-easing),
      translate 280ms var(--_spring-spatial),
      scale 280ms var(--_spring-spatial);
    transition-delay: calc(var(--_stagger-index, 0) * 35ms);
  }

  :host([direction='down']) .menu ::slotted(md-fab-menu-item) {
    --_item-enter-y: -12px;
    --_item-origin-y: top;
  }

  :host([align='start']) .menu ::slotted(md-fab-menu-item) {
    --_item-origin-x: left;
  }

  @starting-style {
    .menu ::slotted(md-fab-menu-item) {
      opacity: 0;
      translate: 0 var(--_item-enter-y, 12px);
      scale: 0.85;
    }
  }

  .menu:where([hidden], [data-closing]) ::slotted(md-fab-menu-item) {
    opacity: 0;
    translate: 0 calc(var(--_item-enter-y, 12px) * 0.65);
    scale: 0.9;
    transition-duration: 150ms;
    transition-delay: calc(var(--_close-stagger-index, 0) * 20ms);
  }

  :host([quick]) .trigger,
  :host([quick]) .icon-stack,
  :host([quick]) .trigger-icon,
  :host([quick]) .close-icon,
  :host([quick]) .trigger-label,
  :host([quick]) .menu,
  :host([quick]) .scrim,
  :host([quick]) .menu ::slotted(md-fab-menu-item) {
    transition-duration: 0ms;
    transition-delay: 0ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .trigger {
      transition:
        background-color 120ms linear,
        color 120ms linear;
    }

    .icon-stack,
    .trigger-label {
      transition-duration: 0ms;
    }

    .trigger-icon,
    .close-icon {
      transform: none;
      transition: opacity 100ms linear;
    }

    :host([open]) .trigger-icon {
      transform: none;
    }

    :host([open]) .close-icon {
      transform: none;
    }

    .menu,
    .scrim {
      transition-duration: 100ms;
    }

    .menu ::slotted(md-fab-menu-item),
    .menu:where([hidden], [data-closing]) ::slotted(md-fab-menu-item) {
      translate: none;
      scale: none;
      transition: opacity 100ms linear;
      transition-delay: 0ms;
    }

    @starting-style {
      .menu ::slotted(md-fab-menu-item) {
        translate: none;
        scale: none;
      }
    }
  }

  @media (forced-colors: active) {
    .trigger {
      border: 1px solid ButtonText;
    }

    :host([open]) .trigger {
      border: 2px solid Highlight;
    }

    md-focus-ring {
      --md-focus-ring-outward-offset: 3px;
    }
  }
`

export const fabMenuItemStyles = css`
  :host {
    --_container-color: var(
      --md-fab-menu-item-container-color,
      var(--_inherited-item-container-color, var(--md-sys-color-primary-container, #eaddff))
    );
    --_content-color: var(
      --md-fab-menu-item-content-color,
      var(--_inherited-item-content-color, var(--md-sys-color-on-primary-container, #21005d))
    );
    --_label-color: var(--md-fab-menu-item-label-text-color, var(--_inherited-item-label-color, var(--_content-color)));
    --_icon-color: var(--md-fab-menu-item-icon-color, var(--_inherited-item-icon-color, var(--_content-color)));
    --_height: var(--md-fab-menu-item-height, 56px);
    --_shape: var(--md-fab-menu-item-shape, var(--md-sys-shape-corner-full, 9999px));
    --_padding-start: var(--md-fab-menu-item-padding-inline-start, 20px);
    --_padding-end: var(--md-fab-menu-item-padding-inline-end, 24px);
    --_icon-size: var(--md-fab-menu-item-icon-size, 24px);
    --_icon-gap: var(--md-fab-menu-item-icon-gap, 12px);
    --_elevation: var(--md-fab-menu-item-elevation, 3);
    --_hover-elevation: var(--md-fab-menu-item-hover-elevation, 4);
    --_shadow-color: var(--md-fab-menu-item-shadow-color, var(--md-sys-color-shadow, #000000));
    --_label-font: var(
      --md-fab-menu-item-label-text-font,
      var(--md-sys-typescale-title-medium-font, var(--md-ref-typeface-plain, Roboto, sans-serif))
    );
    --_label-size: var(--md-fab-menu-item-label-text-size, var(--md-sys-typescale-title-medium-size, 1rem));
    --_label-line-height: var(
      --md-fab-menu-item-label-text-line-height,
      var(--md-sys-typescale-title-medium-line-height, 1.5rem)
    );
    --_label-weight: var(
      --md-fab-menu-item-label-text-weight,
      var(--md-sys-typescale-title-medium-weight, var(--md-ref-typeface-weight-medium, 500))
    );

    display: inline-flex;
    vertical-align: middle;
    box-sizing: border-box;
    width: var(--md-fab-menu-item-width, max-content);
    max-width: min(calc(100vw - 32px), 320px);
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .item {
    position: relative;
    z-index: 0;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--_icon-gap);
    width: 100%;
    min-height: var(--_height);
    height: var(--_height);
    padding-block: 0;
    padding-inline-start: var(--_padding-start);
    padding-inline-end: var(--_padding-end);
    box-sizing: border-box;
    border: none;
    outline: none;
    margin: 0;
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    white-space: nowrap;
    border-radius: var(--_shape);
    background-color: var(--_container-color);
    color: var(--_content-color);
    --md-elevation-level: var(--_elevation);
    --md-elevation-shadow-color: var(--_shadow-color);
    --md-focus-ring-shape: var(--_shape);
    --md-ripple-hover-color: var(--_content-color);
    --md-ripple-hover-opacity: 0.08;
    --md-ripple-pressed-color: var(--_content-color);
    --md-ripple-pressed-opacity: 0.12;
    transition:
      background-color 200ms cubic-bezier(0.2, 0, 0, 1),
      color 200ms cubic-bezier(0.2, 0, 0, 1);
  }

  .item.no-icon {
    padding-inline-start: var(--_padding-end);
  }

  .item:hover {
    --md-elevation-level: var(--_hover-elevation);
  }

  .item:focus-visible {
    outline: none;
  }

  .item:disabled,
  .item.disabled {
    cursor: default;
    opacity: 0.38;
    --md-elevation-level: 0;
  }

  .item .ripple,
  .item md-elevation {
    border-radius: inherit;
    z-index: 0;
  }

  .icon {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--_icon-size);
    height: var(--_icon-size);
    color: var(--_icon-color);
  }

  .icon.empty {
    display: none;
  }

  .icon ::slotted(*),
  .icon md-icon,
  .icon svg {
    width: var(--_icon-size);
    height: var(--_icon-size);
    font-size: var(--_icon-size);
    color: currentColor;
    fill: currentColor;
  }

  .label {
    position: relative;
    z-index: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--_label-color);
    font-family: var(--_label-font);
    font-size: var(--_label-size);
    line-height: var(--_label-line-height);
    font-weight: var(--_label-weight);
  }

  @media (forced-colors: active) {
    .item {
      border: 1px solid ButtonText;
    }

    .item:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: 2px;
    }
  }
`
