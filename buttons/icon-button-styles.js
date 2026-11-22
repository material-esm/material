import { css } from 'lit'

export const styles = [
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
    :host(:not([group-position])[shape='square']:not([selected])),
    :host(:not([group-position]):not([shape='square'])[selected]) {
      --_resolved-shape-start-start: min(var(--_square-shape), var(--_base-shape-start-start));
      --_resolved-shape-start-end: min(var(--_square-shape), var(--_base-shape-start-end));
      --_resolved-shape-end-end: min(var(--_square-shape), var(--_base-shape-end-end));
      --_resolved-shape-end-start: min(var(--_square-shape), var(--_base-shape-end-start));
    }

    /* Standalone square toggle when selected morphs to full circle */
    :host(:not([group-position])[shape='square'][selected]) {
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
