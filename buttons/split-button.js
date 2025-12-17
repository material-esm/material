import { html, LitElement, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

export class SplitButton extends LitElement {
  static properties = {
    size: { type: String },
    toggle: { type: Boolean },
    togglefn: { type: Function },
    disabled: { type: Boolean },
  }

  constructor() {
    super()
    this.toggle = false
    this.togglefn = () => {}
    this.size = 'small'
    this.disabled = false
  }

  static styles = [
    css`
      .wrapper {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        --_container-color: var(--md-button-container-color, var(--md-sys-color-primary, #6750a4));
        --_container-elevation: var(--md-button-container-elevation, 0);
        /* --_container-height: var(--_container-height, var(--md-button-container-height, 40px)); */
        --_container-shadow-color: var(--md-button-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_disabled-container-color: var(--md-button-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));
        --_disabled-container-elevation: var(--md-button-disabled-container-elevation, 0);
        --_disabled-container-opacity: var(--md-button-disabled-container-opacity, 0.12);
        --_disabled-label-text-color: var(
          --md-button-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
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
        --_icon-size: var(--md-button-icon-size, 18px);
        --_pressed-icon-color: var(--md-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));
        --_leading-space: var(--md-button-leading-space, 16px);
        --_trailing-space: var(--md-button-trailing-space, 16px);
        --_with-leading-icon-leading-space: var(--md-button-with-leading-icon-leading-space, 16px);
        --_with-leading-icon-trailing-space: var(--md-button-with-leading-icon-trailing-space, 24px);
        --_with-trailing-icon-leading-space: var(--md-button-with-trailing-icon-leading-space, 24px);
        --_with-trailing-icon-trailing-space: var(--md-button-with-trailing-icon-trailing-space, 16px);
      }
      .wrapper(:hover) ::slotted([slot='icon']) {
        color: var(--_hover-icon-color);
      }
      .wrapper(:active) md-elevation {
        --md-elevation-level: var(--_pressed-container-elevation);
      }
      .wrapper.disabled polygon {
        fill: light-dark;
      }

      .main-action {
        background: var(--_container-color);
        border: none;
        padding: 0 24px;
        font-size: 24px;
        font-family: inherit;
        border-radius: 999px 0 0 999px;
        display: flex;
        align-items: center;
        cursor: pointer;
        outline: none;
        transition: background 0.2s;
      }

      .dropdown {
        background: var(--_container-color);
        border: none;
        border-left: 2px solid var(--md-sys-color-on-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0 999px 999px 0;
        cursor: pointer;
        outline: none;
        transition: background 0.2s;
      }

      .label {
        margin-left: 8px;
        margin-right: 8px;
        font-weight: 500;
      }
      svg {
        display: block;
        margin: auto;
      }
      polygon {
        fill: var(--md-sys-color-on-primary);
      }
    `,
    css`
      .extra-small {
        height: 32px;
        padding-left: 12px;
        padding-right: 12px;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        border-width: 1px;
      }
      .small {
        height: 40px;
        padding-left: 16px;
        padding-right: 16px;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        border-width: 1px;
      }
      .medium {
        height: 56px;
        padding-left: 24px;
        padding-right: 24px;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        border-width: 1px;
      }
      .large {
        height: 96px;
        padding-left: 48px;
        padding-right: 48px;
        font-weight: 400;
        font-size: 24px;
        line-height: 32px;
        border-width: 2px;
      }
      .extra-large {
        height: 136px;
        padding-left: 64px;
        padding-right: 64px;
        font-weight: 400;
        font-size: 32px;
        line-height: 40px;
        border-width: 3px;
      }
    `,
  ]

  render() {
    return html`<div class="wrapper ${this.disabled ? 'disabled' : ''}">
      <button id="main-action" class="main-action ${this.size}" ?disabled=${this.disabled}>
        <slot name="icon"></slot>
        <span class="label"><slot></slot></span>
      </button>
      <button
        id="dropdown"
        class="dropdown ${this.size}"
        @click=${() => {
          this.toggle = !this.toggle
          this.togglefn()
        }}
        aria-haspopup="menu"
        aria-expanded=${this.toggle}
        ?disabled=${this.disabled}>
        <svg height="5" viewBox="7 10 10 5" focusable="false">
          <polygon
            class=${classMap({
              down: !this.toggle,
              up: this.toggle,
            })}
            stroke="none"
            fill-rule="evenodd"
            points=${
              this.toggle
                ? '7 15 12 10 17 15' // up
                : '7 10 12 15 17 10' // down
            }></polygon>
        </svg>
      </button>
    </div>`
  }
}
customElements.define('md-split-button', SplitButton)
