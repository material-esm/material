import { css } from 'lit'

export const variantStyles = [
  css`
    :host([color='filled']) {
      --_container-color: var(--md-button-container-color, var(--md-sys-color-primary, #6750a4));
      --_container-elevation: var(--md-button-container-elevation, 0);
      --_container-shadow-color: var(--md-button-container-shadow-color, var(--md-sys-color-shadow, #000));
      --_disabled-container-color: var(--md-button-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-container-elevation: var(--md-button-disabled-container-elevation, 0);
      --_disabled-container-opacity: var(--md-button-disabled-container-opacity, 0.12);
      --_disabled-label-text-color: var(--md-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-label-text-opacity: var(--md-button-disabled-label-text-opacity, 0.38);
      --_focus-container-elevation: var(--md-button-focus-container-elevation, 0);
      --_focus-label-text-color: var(--md-button-focus-label-text-color, var(--md-sys-color-on-primary, #fff));
      --_hover-container-elevation: var(--md-button-hover-container-elevation, 1);
      --_hover-label-text-color: var(--md-button-hover-label-text-color, var(--md-sys-color-on-primary, #fff));
      --_hover-state-layer-color: var(--md-button-hover-state-layer-color, var(--md-sys-color-on-primary, #fff));
      --_hover-state-layer-opacity: var(--md-button-hover-state-layer-opacity, 0.08);
      --_label-text-color: var(--md-button-label-text-color, var(--md-sys-color-on-primary, #fff));
      --_label-text-font: var(
        --md-button-label-text-font,
        var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
      );
      --_label-text-line-height: var(
        --md-button-label-text-line-height,
        var(--md-sys-typescale-label-large-line-height, 1.25rem)
      );
      --_label-text-size: var(--md-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
      --_label-text-weight: var(
        --md-button-label-text-weight,
        var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
      );
      --_pressed-container-elevation: var(--md-button-pressed-container-elevation, 0);
      --_pressed-label-text-color: var(--md-button-pressed-label-text-color, var(--md-sys-color-on-primary, #fff));
      --_pressed-state-layer-color: var(--md-button-pressed-state-layer-color, var(--md-sys-color-on-primary, #fff));
      --_pressed-state-layer-opacity: var(--md-button-pressed-state-layer-opacity, 0.12);
      --_disabled-icon-color: var(--md-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-icon-opacity: var(--md-button-disabled-icon-opacity, 0.38);
      --_focus-icon-color: var(--md-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));
      --_hover-icon-color: var(--md-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));
      --_icon-color: var(--md-button-icon-color, var(--md-sys-color-on-primary, #fff));
      --_icon-size: var(--md-button-icon-size, 20px);
      --_pressed-icon-color: var(--md-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));
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
      --_leading-space: var(--md-button-leading-space, 16px);
      --_trailing-space: var(--md-button-trailing-space, 16px);
      --_with-leading-icon-leading-space: var(--md-button-with-leading-icon-leading-space, 16px);
      --_with-leading-icon-trailing-space: var(--md-button-with-leading-icon-trailing-space, 24px);
      --_with-trailing-icon-leading-space: var(--md-button-with-trailing-icon-leading-space, 24px);
      --_with-trailing-icon-trailing-space: var(--md-button-with-trailing-icon-trailing-space, 16px);
    }
    :host([color='filled'][toggle]:not([selected])) {
      --_container-color: var(
        --md-button-unselected-container-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      );
      --_label-text-color: var(--md-button-unselected-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_icon-color: var(--md-button-unselected-icon-color, var(--md-sys-color-primary, #6750a4));
      --_hover-state-layer-color: var(
        --md-button-unselected-hover-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_pressed-state-layer-color: var(
        --md-button-unselected-pressed-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
    }
    :host([color='filled'][selected]) {
      --_container-color: var(--md-button-selected-container-color, var(--md-sys-color-primary, #6750a4));
      --_label-text-color: var(--md-button-selected-label-text-color, var(--md-sys-color-on-primary, #fff));
      --_icon-color: var(--md-button-selected-icon-color, var(--md-sys-color-on-primary, #fff));
      --_hover-state-layer-color: var(
        --md-button-selected-hover-state-layer-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_pressed-state-layer-color: var(
        --md-button-selected-pressed-state-layer-color,
        var(--md-sys-color-on-primary, #fff)
      );
    }
  `,
  css`
    :host([color='tonal']) {
      --_container-color: var(
        --md-filled-tonal-button-container-color,
        var(--md-sys-color-secondary-container, #e8def8)
      );
      --_container-elevation: var(--md-filled-tonal-button-container-elevation, 0);
      --_container-shadow-color: var(--md-filled-tonal-button-container-shadow-color, var(--md-sys-color-shadow, #000));
      --_disabled-container-color: var(
        --md-filled-tonal-button-disabled-container-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-container-elevation: var(--md-filled-tonal-button-disabled-container-elevation, 0);
      --_disabled-container-opacity: var(--md-filled-tonal-button-disabled-container-opacity, 0.12);
      --_disabled-label-text-color: var(
        --md-filled-tonal-button-disabled-label-text-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-label-text-opacity: var(--md-filled-tonal-button-disabled-label-text-opacity, 0.38);
      --_focus-container-elevation: var(--md-filled-tonal-button-focus-container-elevation, 0);
      --_focus-label-text-color: var(
        --md-filled-tonal-button-focus-label-text-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_hover-container-elevation: var(--md-filled-tonal-button-hover-container-elevation, 1);
      --_hover-label-text-color: var(
        --md-filled-tonal-button-hover-label-text-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_hover-state-layer-color: var(
        --md-filled-tonal-button-hover-state-layer-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_hover-state-layer-opacity: var(--md-filled-tonal-button-hover-state-layer-opacity, 0.08);
      --_label-text-color: var(
        --md-filled-tonal-button-label-text-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_label-text-font: var(
        --md-filled-tonal-button-label-text-font,
        var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
      );
      --_label-text-line-height: var(
        --md-filled-tonal-button-label-text-line-height,
        var(--md-sys-typescale-label-large-line-height, 1.25rem)
      );
      --_label-text-size: var(
        --md-filled-tonal-button-label-text-size,
        var(--md-sys-typescale-label-large-size, 0.875rem)
      );
      --_label-text-weight: var(
        --md-filled-tonal-button-label-text-weight,
        var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
      );
      --_pressed-container-elevation: var(--md-filled-tonal-button-pressed-container-elevation, 0);
      --_pressed-label-text-color: var(
        --md-filled-tonal-button-pressed-label-text-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_pressed-state-layer-color: var(
        --md-filled-tonal-button-pressed-state-layer-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_pressed-state-layer-opacity: var(--md-filled-tonal-button-pressed-state-layer-opacity, 0.12);
      --_disabled-icon-color: var(
        --md-filled-tonal-button-disabled-icon-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-icon-opacity: var(--md-filled-tonal-button-disabled-icon-opacity, 0.38);
      --_focus-icon-color: var(
        --md-filled-tonal-button-focus-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_hover-icon-color: var(
        --md-filled-tonal-button-hover-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_icon-color: var(--md-filled-tonal-button-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));
      --_icon-size: var(--md-filled-tonal-button-icon-size, 20px);
      --_pressed-icon-color: var(
        --md-filled-tonal-button-pressed-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_container-shape-start-start: var(
        --md-filled-tonal-button-container-shape-start-start,
        var(--md-filled-tonal-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-filled-tonal-button-container-shape-start-end,
        var(--md-filled-tonal-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-filled-tonal-button-container-shape-end-end,
        var(--md-filled-tonal-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-filled-tonal-button-container-shape-end-start,
        var(--md-filled-tonal-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_leading-space: var(--md-filled-tonal-button-leading-space, 24px);
      --_trailing-space: var(--md-filled-tonal-button-trailing-space, 24px);
      --_with-leading-icon-leading-space: var(--md-filled-tonal-button-with-leading-icon-leading-space, 16px);
      --_with-leading-icon-trailing-space: var(--md-filled-tonal-button-with-leading-icon-trailing-space, 24px);
      --_with-trailing-icon-leading-space: var(--md-filled-tonal-button-with-trailing-icon-leading-space, 24px);
      --_with-trailing-icon-trailing-space: var(--md-filled-tonal-button-with-trailing-icon-trailing-space, 16px);
    }
    :host([color='tonal'][toggle]:not([selected])) {
      --_container-color: var(
        --md-filled-tonal-button-unselected-container-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      );
      --_label-text-color: var(
        --md-filled-tonal-button-unselected-label-text-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_icon-color: var(
        --md-filled-tonal-button-unselected-icon-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_hover-state-layer-color: var(
        --md-filled-tonal-button-unselected-hover-state-layer-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
      --_pressed-state-layer-color: var(
        --md-filled-tonal-button-unselected-pressed-state-layer-color,
        var(--md-sys-color-on-surface-variant, #49454f)
      );
    }
    :host([color='tonal'][selected]) {
      --_container-color: var(
        --md-filled-tonal-button-selected-container-color,
        var(--md-sys-color-secondary-container, #e8def8)
      );
      --_label-text-color: var(
        --md-filled-tonal-button-selected-label-text-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_icon-color: var(
        --md-filled-tonal-button-selected-icon-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
    }
  `,
  // elevated
  css`
    :host([color='elevated']) {
      --_container-color: var(--md-elevated-button-container-color, var(--md-sys-color-surface-container-low, #f7f2fa));
      --_container-elevation: var(--md-elevated-button-container-elevation, 1);
      --_container-shadow-color: var(--md-elevated-button-container-shadow-color, var(--md-sys-color-shadow, #000));
      --_disabled-container-color: var(
        --md-elevated-button-disabled-container-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-container-elevation: var(--md-elevated-button-disabled-container-elevation, 0);
      --_disabled-container-opacity: var(--md-elevated-button-disabled-container-opacity, 0.12);
      --_disabled-label-text-color: var(
        --md-elevated-button-disabled-label-text-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-label-text-opacity: var(--md-elevated-button-disabled-label-text-opacity, 0.38);
      --_focus-container-elevation: var(--md-elevated-button-focus-container-elevation, 1);
      --_focus-label-text-color: var(--md-elevated-button-focus-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_hover-container-elevation: var(--md-elevated-button-hover-container-elevation, 2);
      --_hover-label-text-color: var(--md-elevated-button-hover-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_hover-state-layer-color: var(
        --md-elevated-button-hover-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_hover-state-layer-opacity: var(--md-elevated-button-hover-state-layer-opacity, 0.08);
      --_label-text-color: var(--md-elevated-button-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_label-text-font: var(
        --md-elevated-button-label-text-font,
        var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
      );
      --_label-text-line-height: var(
        --md-elevated-button-label-text-line-height,
        var(--md-sys-typescale-label-large-line-height, 1.25rem)
      );
      --_label-text-size: var(--md-elevated-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
      --_label-text-weight: var(
        --md-elevated-button-label-text-weight,
        var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
      );
      --_pressed-container-elevation: var(--md-elevated-button-pressed-container-elevation, 1);
      --_pressed-label-text-color: var(
        --md-elevated-button-pressed-label-text-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_pressed-state-layer-color: var(
        --md-elevated-button-pressed-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_pressed-state-layer-opacity: var(--md-elevated-button-pressed-state-layer-opacity, 0.12);
      --_disabled-icon-color: var(--md-elevated-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-icon-opacity: var(--md-elevated-button-disabled-icon-opacity, 0.38);
      --_focus-icon-color: var(--md-elevated-button-focus-icon-color, var(--md-sys-color-primary, #6750a4));
      --_hover-icon-color: var(--md-elevated-button-hover-icon-color, var(--md-sys-color-primary, #6750a4));
      --_icon-color: var(--md-elevated-button-icon-color, var(--md-sys-color-primary, #6750a4));
      --_icon-size: var(--md-elevated-button-icon-size, 20px);
      --_pressed-icon-color: var(--md-elevated-button-pressed-icon-color, var(--md-sys-color-primary, #6750a4));
      --_container-shape-start-start: var(
        --md-elevated-button-container-shape-start-start,
        var(--md-elevated-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-elevated-button-container-shape-start-end,
        var(--md-elevated-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-elevated-button-container-shape-end-end,
        var(--md-elevated-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-elevated-button-container-shape-end-start,
        var(--md-elevated-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_leading-space: var(--md-elevated-button-leading-space, 24px);
      --_trailing-space: var(--md-elevated-button-trailing-space, 24px);
      --_with-leading-icon-leading-space: var(--md-elevated-button-with-leading-icon-leading-space, 16px);
      --_with-leading-icon-trailing-space: var(--md-elevated-button-with-leading-icon-trailing-space, 24px);
      --_with-trailing-icon-leading-space: var(--md-elevated-button-with-trailing-icon-leading-space, 24px);
      --_with-trailing-icon-trailing-space: var(--md-elevated-button-with-trailing-icon-trailing-space, 16px);
    }
    :host([color='elevated'][toggle]:not([selected])) {
      --_container-color: var(
        --md-elevated-button-unselected-container-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      );
      --_label-text-color: var(--md-elevated-button-unselected-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_icon-color: var(--md-elevated-button-unselected-icon-color, var(--md-sys-color-primary, #6750a4));
    }

    :host([color='elevated'][selected]) {
      --_container-color: var(--md-elevated-button-selected-container-color, var(--md-sys-color-primary, #6750a4));
      --_label-text-color: var(--md-elevated-button-selected-label-text-color, var(--md-sys-color-on-primary, #fff));
      --_icon-color: var(--md-elevated-button-selected-icon-color, var(--md-sys-color-on-primary, #fff));
      --_hover-state-layer-color: var(
        --md-elevated-button-selected-hover-state-layer-color,
        var(--md-sys-color-on-primary, #fff)
      );
      --_pressed-state-layer-color: var(
        --md-elevated-button-selected-pressed-state-layer-color,
        var(--md-sys-color-on-primary, #fff)
      );
    }

    md-elevation {
      transition-duration: var(--_shape-transition-duration);
      transition-timing-function: var(--_shape-transition-easing);
      inset: 0;
      pointer-events: none;
      position: absolute;
      --md-elevation-level: var(--_container-elevation);
      --md-elevation-shadow-color: var(--_container-shadow-color);
    }

    :host([disabled]) md-elevation {
      transition: none;
      --md-elevation-level: var(--_disabled-container-elevation);
    }

    :host(:focus-within:not([disabled])) md-elevation {
      --md-elevation-level: var(--_focus-container-elevation);
    }

    :host(:hover:not([disabled])) md-elevation {
      --md-elevation-level: var(--_hover-container-elevation);
    }

    :host(:active:not([disabled])) md-elevation {
      --md-elevation-level: var(--_pressed-container-elevation);
    }
  `,
  css`
    :host([color='text']) {
      --_disabled-label-text-color: var(--md-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-label-text-opacity: var(--md-button-disabled-label-text-opacity, 0.38);
      --_focus-label-text-color: var(--md-button-focus-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_hover-label-text-color: var(--md-button-hover-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_hover-state-layer-color: var(--md-button-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));
      --_hover-state-layer-opacity: var(--md-button-hover-state-layer-opacity, 0.08);
      --_label-text-color: var(--md-button-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_label-text-font: var(
        --md-button-label-text-font,
        var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
      );
      --_label-text-line-height: var(
        --md-button-label-text-line-height,
        var(--md-sys-typescale-label-large-line-height, 1.25rem)
      );
      --_label-text-size: var(--md-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
      --_label-text-weight: var(
        --md-button-label-text-weight,
        var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
      );
      --_pressed-label-text-color: var(--md-button-pressed-label-text-color, var(--md-sys-color-primary, #6750a4));
      --_pressed-state-layer-color: var(--md-button-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));
      --_pressed-state-layer-opacity: var(--md-button-pressed-state-layer-opacity, 0.12);
      --_disabled-icon-color: var(--md-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-icon-opacity: var(--md-button-disabled-icon-opacity, 0.38);
      --_focus-icon-color: var(--md-button-focus-icon-color, var(--md-sys-color-primary, #6750a4));
      --_hover-icon-color: var(--md-button-hover-icon-color, var(--md-sys-color-primary, #6750a4));
      --_icon-color: var(--md-button-icon-color, var(--md-sys-color-primary, #6750a4));
      --_icon-size: var(--md-button-icon-size, 20px);
      --_pressed-icon-color: var(--md-button-pressed-icon-color, var(--md-sys-color-primary, #6750a4));
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
      --_leading-space: var(--md-button-leading-space, 12px);
      --_trailing-space: var(--md-button-trailing-space, 12px);
      --_with-leading-icon-leading-space: var(--md-button-with-leading-icon-leading-space, 12px);
      --_with-leading-icon-trailing-space: var(--md-button-with-leading-icon-trailing-space, 16px);
      --_with-trailing-icon-leading-space: var(--md-button-with-trailing-icon-leading-space, 16px);
      --_with-trailing-icon-trailing-space: var(--md-button-with-trailing-icon-trailing-space, 12px);
      --_container-color: transparent;
      --_disabled-container-color: transparent;
      --_disabled-container-opacity: 0;
    }
    /* This is for things like the snackbar, will use opposite colors */
    :host([color='text'].inverse) {
      --_label-text-color: var(--md-button-label-text-color, var(--md-sys-color-inverse-primary, #d0bcff));
      --_hover-label-text-color: var(--md-button-hover-label-text-color, var(--md-sys-color-inverse-primary, #d0bcff));
      --_focus-label-text-color: var(--md-button-focus-label-text-color, var(--md-sys-color-inverse-primary, #d0bcff));
      --_pressed-label-text-color: var(
        --md-button-pressed-label-text-color,
        var(--md-sys-color-inverse-primary, #d0bcff)
      );
    }
    :host([color='text'][selected]) {
      --_container-color: var(
        --md-text-button-selected-container-color,
        var(--md-sys-color-secondary-container, #e8def8)
      );
      --_label-text-color: var(
        --md-text-button-selected-label-text-color,
        var(--md-sys-color-on-secondary-container, #1d192b)
      );
      --_icon-color: var(--md-text-button-selected-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));
    }
  `,
  css`
    :host([color='outlined']) {
      --_disabled-label-text-color: var(
        --md-outlined-button-disabled-label-text-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-label-text-opacity: var(--md-outlined-button-disabled-label-text-opacity, 0.38);
      --_disabled-outline-color: var(
        --md-outlined-button-disabled-outline-color,
        var(--md-sys-color-on-surface, #1d1b20)
      );
      --_disabled-outline-opacity: var(--md-outlined-button-disabled-outline-opacity, 0.12);
      --_focus-label-text-color: var(
        --md-outlined-button-focus-label-text-color,
        var(--md-sys-color-on-surface-variant, #6750a4)
      );
      --_hover-label-text-color: var(
        --md-outlined-button-hover-label-text-color,
        var(--md-sys-color-on-surface-variant, #6750a4)
      );
      --_hover-state-layer-color: var(
        --md-outlined-button-hover-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_hover-state-layer-opacity: var(--md-outlined-button-hover-state-layer-opacity, 0.08);
      --_label-text-color: var(--md-outlined-button-label-text-color, var(--md-sys-color-on-surface-variant, #6750a4));
      --_label-text-font: var(
        --md-outlined-button-label-text-font,
        var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
      );
      --_label-text-line-height: var(
        --md-outlined-button-label-text-line-height,
        var(--md-sys-typescale-label-large-line-height, 1.25rem)
      );
      --_label-text-size: var(--md-outlined-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
      --_label-text-weight: var(
        --md-outlined-button-label-text-weight,
        var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
      );
      --_outline-color: var(--md-outlined-button-outline-color, var(--md-sys-color-outline, #79747e));
      --_outline-width: var(--md-outlined-button-outline-width, 1px);
      --_pressed-label-text-color: var(
        --md-outlined-button-pressed-label-text-color,
        var(--md-sys-color-on-surface-variant, #6750a4)
      );
      --_pressed-outline-color: var(--md-outlined-button-pressed-outline-color, var(--md-sys-color-outline, #79747e));
      --_pressed-state-layer-color: var(
        --md-outlined-button-pressed-state-layer-color,
        var(--md-sys-color-primary, #6750a4)
      );
      --_pressed-state-layer-opacity: var(--md-outlined-button-pressed-state-layer-opacity, 0.12);
      --_disabled-icon-color: var(--md-outlined-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));
      --_disabled-icon-opacity: var(--md-outlined-button-disabled-icon-opacity, 0.38);
      --_focus-icon-color: var(--md-outlined-button-focus-icon-color, var(--md-sys-color-on-surface-variant, #6750a4));
      --_hover-icon-color: var(--md-outlined-button-hover-icon-color, var(--md-sys-color-on-surface-variant, #6750a4));
      --_icon-color: var(--md-outlined-button-icon-color, var(--md-sys-color-on-surface-variant, #6750a4));
      --_icon-size: var(--md-outlined-button-icon-size, 20px);
      --_pressed-icon-color: var(
        --md-outlined-button-pressed-icon-color,
        var(--md-sys-color-on-surface-variant, #6750a4)
      );
      --_container-shape-start-start: var(
        --md-outlined-button-container-shape-start-start,
        var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-start-end: var(
        --md-outlined-button-container-shape-start-end,
        var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-end: var(
        --md-outlined-button-container-shape-end-end,
        var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_container-shape-end-start: var(
        --md-outlined-button-container-shape-end-start,
        var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, var(--_full-shape)))
      );
      --_leading-space: var(--md-outlined-button-leading-space, 24px);
      --_trailing-space: var(--md-outlined-button-trailing-space, 24px);
      --_with-leading-icon-leading-space: var(--md-outlined-button-with-leading-icon-leading-space, 16px);
      --_with-leading-icon-trailing-space: var(--md-outlined-button-with-leading-icon-trailing-space, 24px);
      --_with-trailing-icon-leading-space: var(--md-outlined-button-with-trailing-icon-leading-space, 24px);
      --_with-trailing-icon-trailing-space: var(--md-outlined-button-with-trailing-icon-trailing-space, 16px);
      --_container-color: transparent;
      --_disabled-container-color: transparent;
      --_disabled-container-opacity: 0;
    }

    :host([color='outlined'][selected]) {
      --_container-color: var(
        --md-outlined-button-selected-container-color,
        var(--md-sys-color-inverse-surface, #313033)
      );
      --_label-text-color: var(
        --md-outlined-button-selected-label-text-color,
        var(--md-sys-color-inverse-on-surface, #f4eff4)
      );
      --_icon-color: var(--md-outlined-button-selected-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4));
      --_outline-color: var(--md-outlined-button-selected-outline-color, transparent);
    }

    .outlined {
      inset: 0;
      border-style: solid;
      position: absolute;
      box-sizing: border-box;
      border-color: var(--_outline-color);
      pointer-events: none;
      transition:
        border-color var(--_color-transition-duration) linear,
        opacity var(--_color-transition-duration) linear,
        border-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-start-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-start-radius var(--_shape-transition-duration) var(--_shape-transition-easing),
        border-end-end-radius var(--_shape-transition-duration) var(--_shape-transition-easing);
    }

    :host(:active:not([disabled])) .outlined {
      border-color: var(--_pressed-outline-color);
    }

    :host([disabled]) .outlined {
      border-color: var(--_disabled-outline-color);
      opacity: var(--_disabled-outline-opacity);
    }

    @media (forced-colors: active) {
      :host([disabled]) .background {
        border-color: GrayText;
      }

      :host([disabled]) .outlined {
        opacity: 1;
      }
    }

    .outlined,
    md-ripple {
      border-width: var(--_outline-width, 0px);
    }

    md-ripple {
      inline-size: calc(100% - 2 * var(--_outline-width, 0px));
      block-size: calc(100% - 2 * var(--_outline-width, 0px));
      border-style: solid;
      border-color: rgba(0, 0, 0, 0);
    }
  `,
]
