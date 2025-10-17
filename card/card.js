/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../internal/elevation/elevation.js'
import { html, LitElement, css } from 'lit'
/**
 * A card component.
 */
export class Card extends LitElement {
  static properties = {
    type: { type: String },
  }

  constructor() {
    super()
    this.type = 'outlined'
  }

  render() {
    return html`
      <div class="root ${this.type}">
        <md-elevation part="elevation"></md-elevation>
        <div class="background"></div>
        <slot></slot>
        <div class="outline ${this.type}"></div>
      </div>
    `
  }

  static styles = [
    css`
      :host {
        border-radius: var(--_container-shape);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 0;
      }
      md-elevation,
      .background,
      .outline {
        border-radius: inherit;
        inset: 0;
        pointer-events: none;
        position: absolute;
      }
      .background {
        background: var(--_container-color);
        z-index: -1;
      }
      .outline {
        border: 1px solid rgba(0, 0, 0, 0);
        z-index: 1;
      }
      md-elevation {
        z-index: -1;
        --md-elevation-level: var(--_container-elevation);
        --md-elevation-shadow-color: var(--_container-shadow-color);
      }
      slot {
        border-radius: inherit;
      }

      .root.outlined {
        --_container-color: var(--md-card-container-color, var(--md-sys-color-surface, #fef7ff));
        --_container-elevation: var(--md-card-container-elevation, 0);
        --_container-shadow-color: var(--md-card-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_container-shape: var(--md-card-container-shape, var(--md-sys-shape-corner-medium, 12px));
        --_outline-color: var(--md-card-outline-color, var(--md-sys-color-outline-variant, #cac4d0));
        --_outline-width: var(--md-card-outline-width, 1px);
      }
      .outline.outlined {
        border-color: var(--_outline-color);
        border-width: var(--_outline-width);
      }

      .root.filled {
        --_container-color: var(
          --md-filled-card-container-color,
          var(--md-sys-color-surface-container-highest, #e6e0e9)
        );
        --_container-elevation: var(--md-filled-card-container-elevation, 0);
        --_container-shadow-color: var(--md-filled-card-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_container-shape: var(--md-filled-card-container-shape, var(--md-sys-shape-corner-medium, 12px));
      }

      .root.elevated {
        --_container-color: var(--md-elevated-card-container-color, var(--md-sys-color-surface-container-low, #f7f2fa));
        --_container-elevation: var(--md-elevated-card-container-elevation, 1);
        --_container-shadow-color: var(--md-elevated-card-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_container-shape: var(--md-elevated-card-container-shape, var(--md-sys-shape-corner-medium, 12px));
      }
    `,
    css`
      :host.elevated {
        --_container-color: var(--md-elevated-card-container-color, var(--md-sys-color-surface-container-low, #f7f2fa));
        --_container-elevation: var(--md-elevated-card-container-elevation, 1);
        --_container-shadow-color: var(--md-elevated-card-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_container-shape: var(--md-elevated-card-container-shape, var(--md-sys-shape-corner-medium, 12px));
      }
    `,
    css`
      .root.filled {
        --_container-color: var(
          --md-filled-card-container-color,
          var(--md-sys-color-surface-container-highest, #e6e0e9)
        );
        --_container-elevation: var(--md-filled-card-container-elevation, 0);
        --_container-shadow-color: var(--md-filled-card-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_container-shape: var(--md-filled-card-container-shape, var(--md-sys-shape-corner-medium, 12px));
      }
    `,
    css`
      .root.outlined {
        --_container-color: var(--md-card-container-color, var(--md-sys-color-surface, #fef7ff));
        --_container-elevation: var(--md-card-container-elevation, 0);
        --_container-shadow-color: var(--md-card-container-shadow-color, var(--md-sys-color-shadow, #000));
        --_container-shape: var(--md-card-container-shape, var(--md-sys-shape-corner-medium, 12px));
        --_outline-color: var(--md-card-outline-color, var(--md-sys-color-outline-variant, #cac4d0));
        --_outline-width: var(--md-card-outline-width, 1px);
      }
      .outline {
        border-color: var(--_outline-color);
        border-width: var(--_outline-width);
      }
    `,
  ]
}

customElements.define('md-card', Card)
