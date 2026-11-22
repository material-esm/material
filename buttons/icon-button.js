import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import { css, html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { setupFormSubmitter } from '../internal/controller/form-submitter.js'
import { isRtl } from '../internal/controller/is-rtl.js'
import { internals, mixinElementInternals } from '../labs/behaviors/element-internals.js'
export const iconButtonStyles = [
  css`
    :host {
      display: inline-flex;
      outline: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      vertical-align: top;
      position: relative;
      z-index: 0;
      justify-content: center;
      align-items: center;

      /* Default size (small) */
      --_size: 40px;
      --_container-height: var(--md-icon-button-container-height, var(--_size));
      --_container-width: var(--md-icon-button-container-width, var(--_size));
      height: var(--_container-height);
      width: var(--_container-width);
      --_icon-size: 24px;
      --_resolved-icon-size: var(--md-icon-button-icon-size, var(--_icon-size));
      --md-badge-anchor-size: var(--_resolved-icon-size);

      --_full-shape: calc(min(var(--_container-height), var(--_container-width)) / 2);
      --_square-shape: 12px;
      --_pressed-shape: 8px;
      --_shape-transition-duration: var(--md-icon-button-shape-transition-duration, 200ms);
      --_shape-transition-easing: var(--md-icon-button-shape-transition-easing, cubic-bezier(0.2, 0, 0, 1));
      --_color-transition-duration: 150ms;

      --_container-shape-start-start: var(
        --md-icon-button-container-shape-start-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-icon-button-container-shape-start-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-icon-button-container-shape-end-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-icon-button-container-shape-end-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );

      --_base-shape-start-start: min(var(--_container-shape-start-start), var(--_full-shape));
      --_base-shape-start-end: min(var(--_container-shape-start-end), var(--_full-shape));
      --_base-shape-end-end: min(var(--_container-shape-end-end), var(--_full-shape));
      --_base-shape-end-start: min(var(--_container-shape-end-start), var(--_full-shape));

      --_resolved-shape-start-start: var(--_base-shape-start-start);
      --_resolved-shape-start-end: var(--_base-shape-start-end);
      --_resolved-shape-end-end: var(--_base-shape-end-end);
      --_resolved-shape-end-start: var(--_base-shape-end-start);

      transition:
        color var(--_color-transition-duration) linear,
        border-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing);
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        --_shape-transition-duration: 0s;
      }
    }

    :host,
    .background,
    .outlined,
    .icon-button,
    md-ripple {
      border-start-start-radius: var(--_resolved-shape-start-start);
      border-start-end-radius: var(--_resolved-shape-start-end);
      border-end-start-radius: var(--_resolved-shape-end-start);
      border-end-end-radius: var(--_resolved-shape-end-end);
    }

    :host([disabled]) {
      pointer-events: none;
      cursor: default;
      --_shape-transition-duration: 0s;
    }

    .icon-button {
      place-items: center;
      background: none;
      border: none;
      box-sizing: border-box;
      cursor: pointer;
      display: flex;
      place-content: center;
      outline: none;
      padding: 0;
      position: relative;
      text-decoration: none;
      user-select: none;
      z-index: 0;
      width: 100%;
      height: 100%;
      color: inherit;
    }

    .icon ::slotted(*) {
      --md-icon-size: var(--_resolved-icon-size);
      font-size: var(--_resolved-icon-size);
      height: var(--_resolved-icon-size);
      width: var(--_resolved-icon-size);
      font-weight: inherit;
      color: currentColor;
    }

    /* Fix for slot="selected" content falling back to default slot if unassigned behavior occurs */
    .icon:not(.icon--selected) ::slotted([slot]) {
      display: none !important;
    }

    .background {
      background-color: var(--_container-color, transparent);
      inset: 0;
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transition:
        background-color var(--_color-transition-duration) linear,
        opacity var(--_color-transition-duration) linear,
        border-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing);
    }

    .outlined {
      inset: 0;
      border-style: solid;
      position: absolute;
      box-sizing: border-box;
      border-color: var(--_outline-color);
      border-width: var(--_outline-width);
      pointer-events: none;
      transition:
        border-color var(--_color-transition-duration) linear,
        border-width var(--_color-transition-duration) linear,
        opacity var(--_color-transition-duration) linear,
        border-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing);
    }

    md-ripple {
      transition:
        border-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing);
    }

    md-focus-ring {
      --md-focus-ring-shape-start-start: var(--_resolved-shape-start-start);
      --md-focus-ring-shape-start-end: var(--_resolved-shape-start-end);
      --md-focus-ring-shape-end-end: var(--_resolved-shape-end-end);
      --md-focus-ring-shape-end-start: var(--_resolved-shape-end-start);
    }

    .flip-icon .icon {
      transform: scaleX(-1);
    }

    .icon {
      display: inline-flex;
    }

    .icon-button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: max(48px, 100%);
      height: max(48px, 100%);
      transform: translate(-50%, -50%);
      background: transparent;
    }

    :host([touch-target='none']) .icon-button::before {
      display: none;
    }

    :host([touch-target='wrapper']) {
      margin: max(0px, (48px - var(--_size)) / 2);
    }

    @media (forced-colors: active) {
      :host([disabled]) {
        --_disabled-icon-opacity: 1;
      }
    }
  `,
  // Standard
  css`
    :host([color='standard']) {
      color: var(--_icon-color);
      --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
      --_selected-focus-icon-color: var(
        --md-icon-button-selected-focus-icon-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_selected-hover-icon-color: var(
        --md-icon-button-selected-hover-icon-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_selected-hover-state-layer-color: var(
        --md-icon-button-selected-hover-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_selected-hover-state-layer-opacity: var(--md-icon-button-selected-hover-state-layer-opacity, 0.08);
      --_selected-icon-color: var(--md-icon-button-selected-icon-color, var(--md-sys-color-primary, #6750a4));
      --_selected-pressed-icon-color: var(
        --md-icon-button-selected-pressed-icon-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_selected-pressed-state-layer-color: var(
        --md-icon-button-selected-pressed-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_selected-pressed-state-layer-opacity: var(--md-icon-button-selected-pressed-state-layer-opacity, 0.12);

      --_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
      --_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
      --_hover-state-layer-color: var(
        --md-icon-button-hover-state-layer-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
      --_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
      --_pressed-icon-color: var(--md-icon-button-pressed-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
      --_pressed-state-layer-color: var(
        --md-icon-button-pressed-state-layer-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);

      --_container-shape-start-start: var(
        --md-icon-button-container-shape-start-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-icon-button-container-shape-start-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-icon-button-container-shape-end-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-icon-button-container-shape-end-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );

      --md-ripple-hover-color: var(--_hover-state-layer-color);
      --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
      --md-ripple-pressed-color: var(--_pressed-state-layer-color);
      --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
    }

    :host([color='standard']:hover:not([disabled])) {
      color: var(--_hover-icon-color);
    }
    :host([color='standard']:focus:not([disabled])) {
      color: var(--_focus-icon-color);
    }
    :host([color='standard']:active:not([disabled])) {
      color: var(--_pressed-icon-color);
    }
    :host([color='standard'][disabled]) {
      color: var(--_disabled-icon-color);
    }
    :host([color='standard'][disabled]) .icon {
      opacity: var(--_disabled-icon-opacity);
    }

    :host([color='standard'][selected]) {
      --md-ripple-hover-color: var(--_selected-hover-state-layer-color);
      --md-ripple-hover-opacity: var(--_selected-hover-state-layer-opacity);
      --md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);
      --md-ripple-pressed-opacity: var(--_selected-pressed-state-layer-opacity);
    }
    :host([color='standard'][selected]:not([disabled])) {
      color: var(--_selected-icon-color);
    }
    :host([color='standard'][selected]:not([disabled]):hover) {
      color: var(--_selected-hover-icon-color);
    }
    :host([color='standard'][selected]:not([disabled]):focus) {
      color: var(--_selected-focus-icon-color);
    }
    :host([color='standard'][selected]:not([disabled]):active) {
      color: var(--_selected-pressed-icon-color);
    }
  `,
  // Outlined
  css`
    :host([color='outlined']) {
      color: var(--_icon-color);
      --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
      --_disabled-selected-container-color: var(
        --md-icon-button-disabled-selected-container-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-selected-container-opacity: var(--md-icon-button-disabled-selected-container-opacity, 0.12);
      --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
      --_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);
      --_selected-container-color: var(
        --md-icon-button-selected-container-color,
        var(--md-sys-color-inverse-surface, #322f35)
      );
      --_selected-focus-icon-color: var(
        --md-icon-button-selected-focus-icon-color,
        var(--md-sys-color-inverse-on-surface, #f5eff7)
      );
      --_selected-hover-icon-color: var(
        --md-icon-button-selected-hover-icon-color,
        var(--md-sys-color-inverse-on-surface, #f5eff7)
      );
      --_selected-hover-state-layer-color: var(
        --md-icon-button-selected-hover-state-layer-color,
        var(--md-sys-color-inverse-on-surface, #f5eff7)
      );
      --_selected-icon-color: var(
        --md-icon-button-selected-icon-color,
        var(--md-sys-color-inverse-on-surface, #f5eff7)
      );
      --_selected-pressed-icon-color: var(
        --md-icon-button-selected-pressed-icon-color,
        var(--md-sys-color-inverse-on-surface, #f5eff7)
      );
      --_selected-pressed-state-layer-color: var(
        --md-icon-button-selected-pressed-state-layer-color,
        var(--md-sys-color-inverse-on-surface, #f5eff7)
      );
      --_disabled-outline-color: var(--md-icon-button-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-outline-opacity: var(--md-icon-button-disabled-outline-opacity, 0.12);
      --_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
      --_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
      --_hover-state-layer-color: var(
        --md-icon-button-hover-state-layer-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
      --_outline-color: var(--md-icon-button-outline-color, var(--md-sys-color-outline, #79747e));
      --_outline-width: var(--md-icon-button-outline-width, 1px);
      --_pressed-icon-color: var(--md-icon-button-pressed-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_pressed-state-layer-color: var(
        --md-icon-button-pressed-state-layer-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );

      --_container-shape-start-start: var(
        --md-icon-button-container-shape-start-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-icon-button-container-shape-start-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-icon-button-container-shape-end-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-icon-button-container-shape-end-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );

      --md-ripple-hover-color: var(--_hover-state-layer-color);
      --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
      --md-ripple-pressed-color: var(--_pressed-state-layer-color);
      --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
    }

    :host([color='outlined']:hover:not([disabled])) {
      color: var(--_hover-icon-color);
    }
    :host([color='outlined']:focus:not([disabled])) {
      color: var(--_focus-icon-color);
    }
    :host([color='outlined']:active:not([disabled])) {
      color: var(--_pressed-icon-color);
    }
    :host([color='outlined'][disabled]) {
      color: var(--_disabled-icon-color);
    }
    :host([color='outlined'][disabled]) .outlined {
      border-color: var(--_disabled-outline-color);
      opacity: var(--_disabled-outline-opacity);
    }
    :host([color='outlined'][disabled]) .icon {
      opacity: var(--_disabled-icon-opacity);
    }

    :host([color='outlined'][selected]) .outlined {
      border-width: 0;
    }

    :host([color='outlined'][selected]) {
      --md-ripple-hover-color: var(--_selected-hover-state-layer-color);
      --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
      --md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);
      --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
    }

    :host([color='outlined'][selected]:not([disabled])) {
      color: var(--_selected-icon-color);
    }
    :host([color='outlined'][selected]:not([disabled]):hover) {
      color: var(--_selected-hover-icon-color);
    }
    :host([color='outlined'][selected]:not([disabled]):focus) {
      color: var(--_selected-focus-icon-color);
    }
    :host([color='outlined'][selected]:not([disabled]):active) {
      color: var(--_selected-pressed-icon-color);
    }

    :host([color='outlined'][selected]:not([disabled])) .background {
      background-color: var(--_selected-container-color);
    }
    :host([color='outlined'][selected][disabled]) .background {
      background-color: var(--_disabled-selected-container-color);
      opacity: var(--_disabled-selected-container-opacity);
    }
  `,
  // Tonal
  css`
    :host([color='tonal']) {
      --_container-color: var(--md-icon-button-container-color, var(--md-sys-color-secondary-container, #e8def8));
      --_disabled-container-color: var(
        --md-icon-button-disabled-container-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-container-opacity: var(--md-icon-button-disabled-container-opacity, 0.12);
      --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
      --_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));
      --_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));
      --_hover-state-layer-color: var(
        --md-icon-button-hover-state-layer-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
      --_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));
      --_pressed-icon-color: var(
        --md-icon-button-pressed-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_pressed-state-layer-color: var(
        --md-icon-button-pressed-state-layer-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);
      --_selected-container-color: var(
        --md-icon-button-selected-container-color,
        var(--md-sys-color-secondary-container, #e8def8)
      );
      --_toggle-selected-focus-icon-color: var(
        --md-icon-button-toggle-selected-focus-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_toggle-selected-hover-icon-color: var(
        --md-icon-button-toggle-selected-hover-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_toggle-selected-hover-state-layer-color: var(
        --md-icon-button-toggle-selected-hover-state-layer-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_toggle-selected-icon-color: var(
        --md-icon-button-toggle-selected-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_toggle-selected-pressed-icon-color: var(
        --md-icon-button-toggle-selected-pressed-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_toggle-selected-pressed-state-layer-color: var(
        --md-icon-button-toggle-selected-pressed-state-layer-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_unselected-container-color: var(
        --md-icon-button-unselected-container-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      );
      --_toggle-focus-icon-color: var(
        --md-icon-button-toggle-focus-icon-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_toggle-hover-icon-color: var(
        --md-icon-button-toggle-hover-icon-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_toggle-hover-state-layer-color: var(
        --md-icon-button-toggle-hover-state-layer-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_toggle-icon-color: var(--md-icon-button-toggle-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
      --_toggle-pressed-icon-color: var(
        --md-icon-button-toggle-pressed-icon-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_toggle-pressed-state-layer-color: var(
        --md-icon-button-toggle-pressed-state-layer-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );

      --_container-shape-start-start: var(
        --md-icon-button-container-shape-start-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-icon-button-container-shape-start-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-icon-button-container-shape-end-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-icon-button-container-shape-end-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );

      color: var(--_icon-color);
      --md-ripple-hover-color: var(--_hover-state-layer-color);
      --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
      --md-ripple-pressed-color: var(--_pressed-state-layer-color);
      --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
    }

    :host([color='tonal']:hover:not([disabled])) {
      color: var(--_hover-icon-color);
    }
    :host([color='tonal']:focus:not([disabled])) {
      color: var(--_focus-icon-color);
    }
    :host([color='tonal']:active:not([disabled])) {
      color: var(--_pressed-icon-color);
    }
    :host([color='tonal'][disabled]) {
      color: var(--_disabled-icon-color);
    }
    :host([color='tonal'][disabled]) .background {
      background-color: var(--_disabled-container-color);
      opacity: var(--_disabled-container-opacity);
    }
    :host([color='tonal'][disabled]) .icon {
      opacity: var(--_disabled-icon-opacity);
    }

    /* Toggle logic for tonal */
    :host([color='tonal'][toggle]) {
      --md-ripple-hover-color: var(--_toggle-hover-state-layer-color);
      --md-ripple-pressed-color: var(--_toggle-pressed-state-layer-color);
    }
    :host([color='tonal'][toggle]:not([disabled])) {
      color: var(--_toggle-icon-color);
    }
    :host([color='tonal'][toggle]:not([disabled]):hover) {
      color: var(--_toggle-hover-icon-color);
    }
    :host([color='tonal'][toggle]:not([disabled]):focus) {
      color: var(--_toggle-focus-icon-color);
    }
    :host([color='tonal'][toggle]:not([disabled]):active) {
      color: var(--_toggle-pressed-icon-color);
    }
    :host([color='tonal'][toggle]:not([disabled])) .background {
      background-color: var(--_unselected-container-color);
    }

    /* Selected (Tonal) */
    :host([color='tonal'][selected]) {
      --md-ripple-hover-color: var(--_toggle-selected-hover-state-layer-color);
      --md-ripple-pressed-color: var(--_toggle-selected-pressed-state-layer-color);
    }
    :host([color='tonal'][selected]:not([disabled])) {
      color: var(--_toggle-selected-icon-color);
    }
    :host([color='tonal'][selected]:not([disabled]):hover) {
      color: var(--_toggle-selected-hover-icon-color);
    }
    :host([color='tonal'][selected]:not([disabled]):focus) {
      color: var(--_toggle-selected-focus-icon-color);
    }
    :host([color='tonal'][selected]:not([disabled]):active) {
      color: var(--_toggle-selected-pressed-icon-color);
    }
    :host([color='tonal'][selected]:not([disabled])) .background {
      background-color: var(--_selected-container-color);
    }
  `,
  // Filled
  css`
    :host([color='filled']) {
      --_container-color: var(--md-icon-button-container-color, var(--md-sys-color-primary, #6750a4));
      --_disabled-container-color: var(
        --md-icon-button-disabled-container-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-container-opacity: var(--md-icon-button-disabled-container-opacity, 0.12);
      --_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);
      --_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));
      --_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));
      --_hover-state-layer-color: var(--md-icon-button-hover-state-layer-color, var(--md-sys-color-on-primary, #fff));
      --_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
      --_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-primary, #fff));
      --_pressed-icon-color: var(--md-icon-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));
      --_pressed-state-layer-color: var(
        --md-icon-button-pressed-state-layer-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);
      --_selected-container-color: var(--md-icon-button-selected-container-color, var(--md-sys-color-primary, #6750a4));
      --_toggle-selected-focus-icon-color: var(
        --md-icon-button-toggle-selected-focus-icon-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_toggle-selected-hover-icon-color: var(
        --md-icon-button-toggle-selected-hover-icon-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_toggle-selected-hover-state-layer-color: var(
        --md-icon-button-toggle-selected-hover-state-layer-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_toggle-selected-icon-color: var(
        --md-icon-button-toggle-selected-icon-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_toggle-selected-pressed-icon-color: var(
        --md-icon-button-toggle-selected-pressed-icon-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_toggle-selected-pressed-state-layer-color: var(
        --md-icon-button-toggle-selected-pressed-state-layer-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_unselected-container-color: var(
        --md-icon-button-unselected-container-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      );
      --_toggle-focus-icon-color: var(--md-icon-button-toggle-focus-icon-color, var(--md-sys-color-primary, #6750a4));
      --_toggle-hover-icon-color: var(--md-icon-button-toggle-hover-icon-color, var(--md-sys-color-primary, #6750a4));
      --_toggle-hover-state-layer-color: var(
        --md-icon-button-toggle-hover-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_toggle-icon-color: var(--md-icon-button-toggle-icon-color, var(--md-sys-color-primary, #6750a4));
      --_toggle-pressed-icon-color: var(
        --md-icon-button-toggle-pressed-icon-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_toggle-pressed-state-layer-color: var(
        --md-icon-button-toggle-pressed-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );

      --_container-shape-start-start: var(
        --md-icon-button-container-shape-start-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-icon-button-container-shape-start-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-icon-button-container-shape-end-end,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-icon-button-container-shape-end-start,
        var(--md-icon-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );

      color: var(--_icon-color);
      --md-ripple-hover-color: var(--_hover-state-layer-color);
      --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
      --md-ripple-pressed-color: var(--_pressed-state-layer-color);
      --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
    }

    :host([color='filled']:hover:not([disabled])) {
      color: var(--_hover-icon-color);
    }
    :host([color='filled']:focus:not([disabled])) {
      color: var(--_focus-icon-color);
    }
    :host([color='filled']:active:not([disabled])) {
      color: var(--_pressed-icon-color);
    }
    :host([color='filled'][disabled]) {
      color: var(--_disabled-icon-color);
    }
    :host([color='filled'][disabled]) .background {
      background-color: var(--_disabled-container-color);
      opacity: var(--_disabled-container-opacity);
    }
    :host([color='filled'][disabled]) .icon {
      opacity: var(--_disabled-icon-opacity);
    }

    /* Toggle logic for filled */
    :host([color='filled'][toggle]) {
      --md-ripple-hover-color: var(--_toggle-hover-state-layer-color);
      --md-ripple-pressed-color: var(--_toggle-pressed-state-layer-color);
    }
    :host([color='filled'][toggle]:not([disabled])) {
      color: var(--_toggle-icon-color);
    }
    :host([color='filled'][toggle]:not([disabled]):hover) {
      color: var(--_toggle-hover-icon-color);
    }
    :host([color='filled'][toggle]:not([disabled]):focus) {
      color: var(--_toggle-focus-icon-color);
    }
    :host([color='filled'][toggle]:not([disabled]):active) {
      color: var(--_toggle-pressed-icon-color);
    }
    :host([color='filled'][toggle]:not([disabled])) .background {
      background-color: var(--_unselected-container-color);
    }

    /* Selected (Filled) */
    :host([color='filled'][selected]) {
      --md-ripple-hover-color: var(--_toggle-selected-hover-state-layer-color);
      --md-ripple-pressed-color: var(--_toggle-selected-pressed-state-layer-color);
    }
    :host([color='filled'][selected]:not([disabled])) {
      color: var(--_toggle-selected-icon-color);
    }
    :host([color='filled'][selected]:not([disabled]):hover) {
      color: var(--_toggle-selected-hover-icon-color);
    }
    :host([color='filled'][selected]:not([disabled]):focus) {
      color: var(--_toggle-selected-focus-icon-color);
    }
    :host([color='filled'][selected]:not([disabled]):active) {
      color: var(--_toggle-selected-pressed-icon-color);
    }
    :host([color='filled'][selected]:not([disabled])) .background {
      background-color: var(--_selected-container-color);
    }
  `,
  // Sizes & M3 Expressive shape morphing
  css`
    :host([size='extra-small']) {
      --_size: 32px;
      --_icon-size: 20px;
      --_square-shape: 12px;
      --_pressed-shape: 8px;
    }
    :host(:not([size])),
    :host([size='small']) {
      --_size: 40px;
      --_icon-size: 24px;
      --_square-shape: 12px;
      --_pressed-shape: 8px;
    }
    :host([size='medium']) {
      --_size: 56px;
      --_icon-size: 24px;
      --_square-shape: 16px;
      --_pressed-shape: 12px;
    }
    :host([size='large']) {
      --_size: 96px;
      --_icon-size: 32px;
      --_square-shape: 28px;
      --_pressed-shape: 16px;
    }
    :host([size='extra-large']) {
      --_size: 136px;
      --_icon-size: 40px;
      --_square-shape: 28px;
      --_pressed-shape: 16px;
    }

    /* Standalone square rest state, or standalone round toggle when selected */
    :host(:not([group-position]):not([pressed])[shape='square']:not([selected])),
    :host(:not([group-position]):not([pressed]):not([shape='square'])[selected]) {
      --_resolved-shape-start-start: min(var(--_square-shape), var(--_base-shape-start-start));
      --_resolved-shape-start-end: min(var(--_square-shape), var(--_base-shape-start-end));
      --_resolved-shape-end-end: min(var(--_square-shape), var(--_base-shape-end-end));
      --_resolved-shape-end-start: min(var(--_square-shape), var(--_base-shape-end-start));
    }

    /* Standalone square toggle when selected morphs to full circle */
    :host(:not([group-position]):not([pressed])[shape='square'][selected]) {
      --_resolved-shape-start-start: var(--_base-shape-start-start);
      --_resolved-shape-start-end: var(--_base-shape-start-end);
      --_resolved-shape-end-end: var(--_base-shape-end-end);
      --_resolved-shape-end-start: var(--_base-shape-end-start);
    }

    /* Standalone pressed state sharpens corners */
    :host(:not([group-position])[pressed]) {
      --_resolved-shape-start-start: min(var(--_pressed-shape), var(--_base-shape-start-start));
      --_resolved-shape-start-end: min(var(--_pressed-shape), var(--_base-shape-start-end));
      --_resolved-shape-end-end: min(var(--_pressed-shape), var(--_base-shape-end-end));
      --_resolved-shape-end-start: min(var(--_pressed-shape), var(--_base-shape-end-start));
    }

    :host([group-position]) {
      --_resolved-shape-start-start: var(--_base-shape-start-start);
      --_resolved-shape-start-end: var(--_base-shape-start-end);
      --_resolved-shape-end-end: var(--_base-shape-end-end);
      --_resolved-shape-end-start: var(--_base-shape-end-start);
    }
  `,
]
const styles = iconButtonStyles

const MINIMUM_PRESS_MS = 150
const iconButtonBaseClass = mixinElementInternals(LitElement)

/**
 * A button for rendering icons.
 *
 * @fires input {InputEvent} Dispatched when a toggle button toggles --bubbles
 * --composed
 * @fires change {Event} Dispatched when a toggle button toggles --bubbles
 */
export class IconButton extends iconButtonBaseClass {
  static properties = {
    disabled: { type: Boolean, noAccessor: true },
    flipIconInRtl: { type: Boolean, attribute: 'flip-icon-in-rtl' },
    href: { type: String },
    target: { type: String },
    ariaLabelSelected: { type: String, attribute: 'aria-label-selected' },
    toggle: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    pressed: { type: Boolean, reflect: true },
    shape: { type: String, reflect: true },
    type: { type: String },
    value: { type: String },
    flipIcon: { type: Boolean },
    color: { type: String, reflect: true },
    size: { type: String, noAccessor: true },
  }

  constructor() {
    super()

    /**
     * Flips the icon if it is in an RTL context at startup.
     */
    this.flipIconInRtl = false
    /**
     * Sets the underlying `HTMLAnchorElement`'s `href` resource attribute.
     */
    this.href = ''
    /**
     * Sets the underlying `HTMLAnchorElement`'s `target` attribute.
     */
    this.target = ''
    /**
     * The `aria-label` of the button when the button is toggleable and selected.
     */
    this.ariaLabelSelected = ''
    /**
     * When true, the button will toggle between selected and unselected
     * states
     */
    this.toggle = false
    /**
     * Sets the selected state. When false, displays the default icon. When true,
     * displays the selected icon, or the default icon If no `slot="selected"`
     * icon is provided.
     */
    this.selected = false
    this.pressed = false
    /**
     * Accepted values are 'round' (default), 'square'.
     */
    this.shape = 'round'
    /**
     * The default behavior of the button. May be "text", "reset", or "submit"
     * (default).
     */
    this.type = 'submit'
    /**
     * The value added to a form with the button's name when the button submits a
     * form.
     */
    this.value = ''
    this.flipIcon = isRtl(this, this.flipIconInRtl)
    /**
     * filled, tonal, outlined, standard
     */
    this.color = 'standard'

    this.handlePress = this.handlePress.bind(this)
    this.handleRelease = this.handleRelease.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  get name() {
    return this.getAttribute('name') ?? ''
  }
  set name(name) {
    this.setAttribute('name', name)
  }

  get form() {
    return this[internals].form
  }

  get labels() {
    return this[internals].labels
  }

  #formDisabled = false
  #pressStartTime = 0
  #releaseTimer = 0
  #activePointerId = null

  get disabled() {
    return this.hasAttribute('disabled') || this.#formDisabled
  }
  set disabled(disabled) {
    const oldValue = this.disabled
    this.toggleAttribute('disabled', Boolean(disabled))
    if (this.disabled) {
      this.#clearPressImmediately()
    }
    this.requestUpdate('disabled', oldValue)
  }

  formDisabledCallback(disabled) {
    const oldValue = this.disabled
    this.#formDisabled = disabled
    if (this.disabled) {
      this.#clearPressImmediately()
    }
    this.requestUpdate('disabled', oldValue)
  }

  /**
   * extra-small, small, medium, large, extra-large
   */
  get size() {
    return this.getAttribute('size') || 'small'
  }
  set size(size) {
    const next = size || ''
    const prevAttr = this.getAttribute('size') ?? ''
    if (next === prevAttr) return
    const oldValue = prevAttr || 'small'
    if (next) {
      this.setAttribute('size', next)
    } else {
      this.removeAttribute('size')
    }
    this.requestUpdate('size', oldValue)
  }

  attributeChangedCallback(name, old, value) {
    if (name === 'disabled') {
      const oldValue = old !== null
      if (value !== null) {
        this.#clearPressImmediately()
      }
      this.requestUpdate(name, oldValue)
      return
    }
    if (name === 'size') {
      if (old !== value) {
        this.requestUpdate('size', old || 'small')
      }
      return
    }
    super.attributeChangedCallback(name, old, value)
  }

  get buttonElement() {
    return this.shadowRoot.querySelector('#button') || this.shadowRoot.querySelector('#link')
  }

  willUpdate() {
    if (this.href) {
      this.disabled = false
    }
  }

  connectedCallback() {
    this.flipIcon = isRtl(this, this.flipIconInRtl)
    super.connectedCallback()
    this.addEventListener('pointerdown', this.handlePress)
    this.addEventListener('pointerup', this.handleRelease)
    this.addEventListener('pointercancel', this.#onPointerCancel)
    this.addEventListener('pointerleave', this.#onPointerCancel)
    this.addEventListener('click', this.handleClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.#clearPressImmediately()
    this.removeEventListener('pointerdown', this.handlePress)
    this.removeEventListener('pointerup', this.handleRelease)
    this.removeEventListener('pointercancel', this.#onPointerCancel)
    this.removeEventListener('pointerleave', this.#onPointerCancel)
    this.removeEventListener('click', this.handleClick)
  }

  #clearPressImmediately() {
    if (this.#releaseTimer) {
      clearTimeout(this.#releaseTimer)
      this.#releaseTimer = 0
    }
    this.#activePointerId = null
    this.#pressStartTime = 0
    if (this.pressed) {
      this.pressed = false
    }
  }

  #onPointerCancel = (event) => {
    if (!this.pressed || this.#releaseTimer) {
      return
    }
    if (event && this.#activePointerId !== null && event.pointerId !== this.#activePointerId) {
      return
    }
    this.#clearPressImmediately()
  }

  handlePress(event) {
    if (this.disabled && !this.href) {
      return
    }
    if (event) {
      if (event.isPrimary === false) return
      if (event.pointerType === 'mouse' && event.buttons !== undefined && event.buttons !== 1) return
      this.#activePointerId = event.pointerId ?? null
    }
    if (this.#releaseTimer) {
      clearTimeout(this.#releaseTimer)
      this.#releaseTimer = 0
    }
    this.#pressStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.pressed = true
  }

  handleRelease(event) {
    if (
      event &&
      this.#activePointerId !== null &&
      event.pointerId !== undefined &&
      event.pointerId !== this.#activePointerId
    ) {
      return
    }
    this.#activePointerId = null
    if (!this.pressed) {
      return
    }
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const elapsed = this.#pressStartTime > 0 ? now - this.#pressStartTime : MINIMUM_PRESS_MS
    if (elapsed >= MINIMUM_PRESS_MS) {
      this.pressed = false
      return
    }
    if (this.#releaseTimer) {
      clearTimeout(this.#releaseTimer)
    }
    this.#releaseTimer = setTimeout(() => {
      this.#releaseTimer = 0
      this.pressed = false
    }, MINIMUM_PRESS_MS - elapsed)
  }

  render() {
    // Needed for closure conformance
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this
    const hasToggledAriaLabel = ariaLabel && this.ariaLabelSelected
    const ariaPressedValue = !this.toggle ? nothing : this.selected
    let ariaLabelValue = nothing
    if (!this.href) {
      ariaLabelValue = hasToggledAriaLabel && this.selected ? this.ariaLabelSelected : ariaLabel
    }

    const buttonOrLink = this.href ? this.renderLink() : this.renderButton(ariaLabelValue, ariaPressedValue)
    const buttonId = this.href ? 'link' : 'button'

    return html`
      <div class="background"></div>
      <md-focus-ring part="focus-ring" for=${buttonId}></md-focus-ring>
      <md-ripple for=${buttonId} ?disabled="${!this.href && this.disabled}"></md-ripple>
      ${this.renderOutline()} ${buttonOrLink}
      <slot name="badge"></slot>
    `
  }

  renderOutline() {
    if (this.color === 'outlined') {
      return html`<div class="outlined"></div>`
    }
    return nothing
  }

  renderButton(ariaLabelValue, ariaPressedValue) {
    return html`<button
      class="icon-button ${classMap(this.getRenderClasses())}"
      id="button"
      aria-label="${ariaLabelValue || nothing}"
      aria-haspopup="${this.ariaHasPopup || nothing}"
      aria-expanded="${this.ariaExpanded || nothing}"
      aria-pressed="${ariaPressedValue}"
      ?disabled="${this.disabled}">
      ${this.selected ? this.renderSelectedIcon() : this.renderIcon()} ${this.renderTouchTarget()}
    </button>`
  }

  renderLink() {
    return html`<a
      class="icon-button ${classMap(this.getRenderClasses())}"
      id="link"
      href="${this.href}"
      target="${this.target || nothing}"
      aria-label="${this.ariaLabel || nothing}">
      ${this.selected ? this.renderSelectedIcon() : this.renderIcon()} ${this.renderTouchTarget()}
    </a>`
  }

  getRenderClasses() {
    return {
      'flip-icon': this.flipIcon,
    }
  }

  renderIcon() {
    return html`<span class="icon"><slot></slot></span>`
  }

  renderSelectedIcon() {
    return html`<span class="icon icon--selected"
      ><slot name="selected"><slot></slot></slot
    ></span>`
  }

  renderTouchTarget() {
    return nothing
  }

  async handleClick(event) {
    // Allow the event to propagate
    await 0
    if (!this.toggle || this.disabled || event.defaultPrevented) {
      return
    }
    this.selected = !this.selected
    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
    this.dispatchEvent(new Event('change', { bubbles: true }))
  }

  static styles = styles
}
;(() => {
  requestUpdateOnAriaChange(IconButton)
  setupFormSubmitter(IconButton)
})()
/** @nocollapse */
IconButton.formAssociated = true
/** @nocollapse */
IconButton.shadowRootOptions = {
  mode: 'open',
  delegatesFocus: true,
}

customElements.define('md-icon-button', IconButton)
