import { css } from 'lit'
import { variantStyles } from './button-variant-styles.js'

export { variantStyles } from './button-variant-styles.js'

export const styles = [
  css`
    :host {
      --_size-height: 40px;
      --_container-height: var(--md-button-container-height, var(--_size-height));
      --_full-shape: calc(var(--_container-height) / 2);
      --_square-shape: 12px;
      --_pressed-shape: 8px;
      --_shape-transition-duration: var(--md-button-shape-transition-duration, 200ms);
      --_shape-transition-easing: var(--md-button-shape-transition-easing, cubic-bezier(0.2, 0, 0, 1));
      --_color-transition-duration: 150ms;

      --_container-shape-start-start: var(
        --md-button-container-shape-start-start,
        var(--md-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-button-container-shape-start-end,
        var(--md-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-button-container-shape-end-end,
        var(--md-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-button-container-shape-end-start,
        var(--md-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );

      --_base-shape-start-start: min(var(--_container-shape-start-start), var(--_full-shape));
      --_base-shape-start-end: min(var(--_container-shape-start-end), var(--_full-shape));
      --_base-shape-end-end: min(var(--_container-shape-end-end), var(--_full-shape));
      --_base-shape-end-start: min(var(--_container-shape-end-start), var(--_full-shape));

      --_resolved-shape-start-start: var(--_base-shape-start-start);
      --_resolved-shape-start-end: var(--_base-shape-start-end);
      --_resolved-shape-end-end: var(--_base-shape-end-end);
      --_resolved-shape-end-start: var(--_base-shape-end-start);
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        --_shape-transition-duration: 0s;
      }
    }
  `,
  ...variantStyles,
  css`
    :host,
    .background,
    .outlined,
    .button,
    md-ripple,
    md-elevation {
      border-start-start-radius: var(--_resolved-shape-start-start);
      border-start-end-radius: var(--_resolved-shape-start-end);
      border-end-start-radius: var(--_resolved-shape-end-start);
      border-end-end-radius: var(--_resolved-shape-end-end);
    }

    :host {
      height: var(--_container-height);
      padding-left: 16px;
      padding-right: 16px;
      font-weight: 500;
      font-size: 14px;
      box-sizing: border-box;
      cursor: pointer;
      display: inline-flex;
      gap: 8px;
      align-items: center;
      outline: none;
      place-content: center;
      place-items: center;
      position: relative;
      font-family: var(--_label-text-font);
      line-height: var(--_label-text-line-height);
      text-overflow: ellipsis;
      text-wrap: nowrap;
      user-select: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      vertical-align: top;
      --md-ripple-hover-color: var(--_hover-state-layer-color);
      --md-ripple-pressed-color: var(--_pressed-state-layer-color);
      --md-ripple-hover-opacity: var(--_hover-state-layer-opacity);
      --md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
      transition:
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

    :host([disabled]) {
      cursor: default;
      pointer-events: none;
      --_shape-transition-duration: 0s;
    }

    .button {
      cursor: inherit;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      outline: none;
      -webkit-appearance: none;
      vertical-align: middle;
      background: rgba(0, 0, 0, 0);
      text-decoration: none;
      min-width: calc(64px - var(--_leading-space, 16px) - var(--_trailing-space, 16px));
      width: 100%;
      z-index: 0;
      height: 100%;
      font: inherit;
      color: var(--_label-text-color);
      padding: 0;
      gap: inherit;
      text-transform: inherit;
      transition: color var(--_color-transition-duration) linear;
    }

    .button::-moz-focus-inner {
      padding: 0;
      border: 0;
    }

    :host(:hover:not([disabled])) .button {
      color: var(--_hover-label-text-color);
    }

    :host(:focus-within:not([disabled])) .button {
      color: var(--_focus-label-text-color);
    }

    :host(:active:not([disabled])) .button {
      color: var(--_pressed-label-text-color);
    }

    .background {
      background-color: var(--_container-color);
      inset: 0;
      position: absolute;
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

    .label {
      overflow: hidden;
    }

    :is(.button, .label, .label slot),
    .label ::slotted(*) {
      text-overflow: inherit;
    }

    :host([disabled]) .label {
      color: var(--_disabled-label-text-color);
      opacity: var(--_disabled-label-text-opacity);
    }

    :host([disabled]) .background {
      background-color: var(--_disabled-container-color);
      opacity: var(--_disabled-container-opacity);
    }

    @media (forced-colors: active) {
      .background {
        border: 1px solid CanvasText;
      }

      :host([disabled]) {
        --_disabled-icon-color: GrayText;
        --_disabled-icon-opacity: 1;
        --_disabled-container-opacity: 1;
        --_disabled-label-text-color: GrayText;
        --_disabled-label-text-opacity: 1;
      }
    }

    :host([has-icon]:not([trailing-icon])) {
      padding-inline-start: var(--_with-leading-icon-leading-space);
      padding-inline-end: var(--_with-leading-icon-trailing-space);
    }

    :host([has-icon][trailing-icon]) {
      padding-inline-start: var(--_with-trailing-icon-leading-space);
      padding-inline-end: var(--_with-trailing-icon-trailing-space);
    }

    ::slotted([slot='icon']) {
      display: inline-flex;
      position: relative;
      writing-mode: horizontal-tb;
      fill: currentColor;
      flex-shrink: 0;
      color: var(--_icon-color);
      font-size: var(--_icon-size);
      inline-size: var(--_icon-size);
      block-size: var(--_icon-size);
      transition: color var(--_color-transition-duration) linear;
    }

    :host(:hover:not([disabled])) ::slotted([slot='icon']) {
      color: var(--_hover-icon-color);
    }

    :host(:focus-within:not([disabled])) ::slotted([slot='icon']) {
      color: var(--_focus-icon-color);
    }

    :host(:active:not([disabled])) ::slotted([slot='icon']) {
      color: var(--_pressed-icon-color);
    }

    :host([disabled]) ::slotted([slot='icon']) {
      color: var(--_disabled-icon-color);
      opacity: var(--_disabled-icon-opacity);
    }

    .checkmark {
      writing-mode: horizontal-tb;
      fill: currentColor;
      flex-shrink: 0;
      color: var(--_icon-color);
      font-size: var(--_icon-size, 18px);
      inline-size: var(--_icon-size, 18px);
      block-size: var(--_icon-size, 18px);
      transition: color var(--_color-transition-duration) linear;
    }

    :host(:hover:not([disabled])) .checkmark {
      color: var(--_hover-icon-color);
    }

    :host(:focus-within:not([disabled])) .checkmark {
      color: var(--_focus-icon-color);
    }

    :host(:active:not([disabled])) .checkmark {
      color: var(--_pressed-icon-color);
    }

    :host([disabled]) .checkmark {
      color: var(--_disabled-icon-color);
      opacity: var(--_disabled-icon-opacity);
    }

    .touch {
      position: absolute;
      top: 50%;
      height: 48px;
      left: 0;
      right: 0;
      transform: translateY(-50%);
    }

    :host([touch-target='wrapper']) {
      margin: max(0px, (48px - var(--_container-height)) / 2) 0;
    }

    :host([touch-target='none']) .touch {
      display: none;
    }
  `,
  // sizes
  css`
    :host([size='extra-small']) {
      --_size-height: 32px;
      --_square-shape: 12px;
      --_pressed-shape: 8px;
      padding-left: 12px;
      padding-right: 12px;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      border-width: 1px;
    }
    :host([size='small']) {
      --_size-height: 40px;
      --_square-shape: 12px;
      --_pressed-shape: 8px;
      padding-left: 16px;
      padding-right: 16px;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      border-width: 1px;
    }
    :host([size='medium']) {
      --_size-height: 56px;
      --_square-shape: 16px;
      --_pressed-shape: 12px;
      padding-left: 24px;
      padding-right: 24px;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      border-width: 1px;
      --_icon-size: 24px;
    }
    :host([size='large']) {
      --_size-height: 96px;
      --_square-shape: 28px;
      --_pressed-shape: 16px;
      padding-left: 48px;
      padding-right: 48px;
      font-weight: 400;
      font-size: 24px;
      line-height: 32px;
      border-width: 2px;
      --_icon-size: 32px;
    }
    :host([size='extra-large']) {
      --_size-height: 136px;
      --_square-shape: 28px;
      --_pressed-shape: 16px;
      padding-left: 64px;
      padding-right: 64px;
      font-weight: 400;
      font-size: 32px;
      line-height: 40px;
      border-width: 3px;
      --_icon-size: 40px;
    }
  `,
  // shapes (M3 Expressive shape morphing)
  css`
    /* Standalone square rest state, or standalone round toggle when selected */
    :host(:not([group-position])[shape='square']:not([selected])),
    :host(:not([group-position]):not([shape='square'])[selected]) {
      --_resolved-shape-start-start: min(var(--_square-shape), var(--_base-shape-start-start));
      --_resolved-shape-start-end: min(var(--_square-shape), var(--_base-shape-start-end));
      --_resolved-shape-end-end: min(var(--_square-shape), var(--_base-shape-end-end));
      --_resolved-shape-end-start: min(var(--_square-shape), var(--_base-shape-end-start));
    }

    /* Standalone square toggle when selected morphs to full pill */
    :host(:not([group-position])[shape='square'][selected]) {
      --_resolved-shape-start-start: var(--_base-shape-start-start);
      --_resolved-shape-start-end: var(--_base-shape-start-end);
      --_resolved-shape-end-end: var(--_base-shape-end-end);
      --_resolved-shape-end-start: var(--_base-shape-end-start);
    }

    /* Standalone pressed state sharpens corners for tactile feedback */
    :host(:not([group-position])[pressed]) {
      --_resolved-shape-start-start: min(var(--_pressed-shape), var(--_base-shape-start-start));
      --_resolved-shape-start-end: min(var(--_pressed-shape), var(--_base-shape-start-end));
      --_resolved-shape-end-end: min(var(--_pressed-shape), var(--_base-shape-end-end));
      --_resolved-shape-end-start: min(var(--_pressed-shape), var(--_base-shape-end-start));
    }

    /* Connected button group positions resolve directly from group-assigned container-shape tokens */
    :host([group-position]) {
      --_resolved-shape-start-start: var(--_base-shape-start-start);
      --_resolved-shape-start-end: var(--_base-shape-start-end);
      --_resolved-shape-end-end: var(--_base-shape-end-end);
      --_resolved-shape-end-start: var(--_base-shape-end-start);
    }
  `,
]
