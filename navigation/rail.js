/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, css, html, nothing } from 'lit'
import 'material/icon/icon.js'
import 'material/iconbutton/icon-button.js'
import { NavigationBar } from '../navigationbar/internal/navigation-bar.js'
/**
 * New expandable rail.
 *
 * https://m3.material.io/components/navigation-rail/specs
 */
export class Rail extends NavigationBar {
  static properties = {
    activeIndex: { type: Number, attribute: 'active-index' },
    hideInactiveLabels: { type: Boolean, attribute: 'hide-inactive-labels' },
    tabs: { type: Array },
    expanded: { type: Boolean },
  }

  constructor() {
    super()
    this.activeIndex = 0
    this.hideInactiveLabels = false
    this.tabs = []
    this.expanded = false
  }

  render() {
    // Needed for closure conformance
    const { ariaLabel } = this
    let menuIcon = this.expanded ? 'menu_open' : 'menu'
    return html`<div
      class="md3-navigation-bar md3-navigation-rail ${this.expanded ? 'expanded' : ''}"
      role="tablist"
      aria-label=${ariaLabel || nothing}
      @keydown="${this.handleKeydown}"
      @navigation-tab-interaction="${this.handleNavigationTabInteraction}"
      @navigation-tab-rendered=${this.handleNavigationTabConnected}
    >
      <md-elevation part="elevation"></md-elevation>
      <div
        class="md3-navigation-bar__tabs-slot-container md3-navigation-rail__tabs-slot-container
       ${this.expanded ? 'expanded' : ''}"
      >
        <div class="md3-navigation-rail-top ${this.expanded ? 'expanded' : ''}">
          <div class="menuSlot ${this.expanded ? 'expanded' : ''}">
            <slot name="menu">
              <!-- user can replace this with a different button if they want -->
              <md-icon-button @click=${this.toggleExpanded}>
                <md-icon>${menuIcon}</md-icon>
              </md-icon-button>
            </slot>
          </div>
          <slot name="fab"></slot>
        </div>
        <div>
          <slot></slot>
        </div>
      </div>
    </div> `
  }

  toggleExpanded() {
    this.expanded = !this.expanded
    this.renderRoot
      .querySelector('slot[name="fab"]')
      .assignedElements({ flatten: true })
      .forEach((tab) => {
        console.log('fab slot item:', tab)
        if (tab.tagName === 'MD-FAB') {
          tab.expanded = this.expanded
        }
      })
    this.renderRoot
      .querySelector('slot:not([name])')
      .assignedElements({ flatten: true })
      .forEach((tab) => {
        console.log('slot item:', tab)
        if (tab.tagName === 'MD-NAV-ITEM') {
          tab.expanded = this.expanded
        }
      })
  }

  static styles = [
    css`
      .md3-navigation-rail {
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 96px;
        position: sticky;
        top: 0;
        height: 100vh;
        background-color: var(--md-sys-color-surface);
        border-right: 1px solid var(--md-sys-color-divider);
      }

      .md3-navigation-rail__tabs-slot-container {
        display: flex;
        flex-direction: column;
        /* height: 100vh; */
        gap: 32px;
        /* justify-content: space-between; */
        align-items: center;
      }

      .md3-navigation-rail-top {
        padding-top: 40px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
      }

      .md3-navigation-rail-middle {
        display: inherit;
        width: inherit;
        justify-content: space-between;
        align-items: center;
      }

      .md3-navigation-rail.expanded {
        min-width: 220px;
        max-width: 360px;
        padding-left: 16px;
      }
      .md3-navigation-rail__tabs-slot-container.expanded {
        align-items: start;
      }

      .md3-navigation-rail-top.expanded {
        align-items: start;
        padding-left: 8px;
      }

      .menuSlot.expanded {
        padding-left: 8px;
      }
    `,
  ]
}

customElements.define('md-rail', Rail)
