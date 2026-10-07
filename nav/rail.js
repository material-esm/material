import { LitElement, css, html, nothing } from 'lit'
import '../icon/icon.js'
import '../buttons/icon-button.js'
import { NavigationBar } from './bar.js'
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
    expanded: { type: Boolean, reflect: true },
  }

  constructor() {
    super()
    this.activeIndex = 0
    this.hideInactiveLabels = false
    this.tabs = []
    this.expanded = false
  }

  connectedCallback() {
    super.connectedCallback()
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
      @navigation-tab-rendered=${this.handleNavigationTabConnected}>
      <md-elevation part="elevation"></md-elevation>
      <div
        class="md3-navigation-bar__tabs-slot-container md3-navigation-rail__tabs-slot-container
       ${this.expanded ? 'expanded' : ''}">
        <div class="md3-navigation-rail-top ${this.expanded ? 'expanded' : ''}">
          <div class="menuSlot ${this.expanded ? 'expanded' : ''}">
            <slot name="menu">
              <!-- user can replace this with a different button if they want -->
              <md-icon-button @click=${this.toggleExpanded}>
                <md-icon>${menuIcon}</md-icon>
              </md-icon-button>
            </slot>
          </div>
          <slot name="fab" @slotchange=${this._updateChildren}></slot>
        </div>
        <div>
          <slot @slotchange=${this._updateChildren}></slot>
        </div>
      </div>
    </div> `
  }

  toggleExpanded() {
    this.expanded = !this.expanded
  }

  updated(changedProperties) {
    super.updated(changedProperties)
    if (changedProperties.has('expanded')) {
      this._updateChildren()
      this.dispatchEvent(
        new CustomEvent('expanded-change', {
          detail: { expanded: this.expanded },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  _updateChildren() {
    this.renderRoot
      .querySelector('slot[name="fab"]')
      ?.assignedElements({ flatten: true })
      .forEach((tab) => {
        if (tab.tagName === 'MD-FAB') {
          tab.expanded = this.expanded
        }
      })
    this.renderRoot
      .querySelector('slot:not([name])')
      ?.assignedElements({ flatten: true })
      .forEach((tab) => {
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
        height: 100dvh;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
        background-color: var(--md-sys-color-surface);
        border-right: 1px solid var(--md-sys-color-divider);
        transition: width 200ms cubic-bezier(0.2, 0, 0, 1);
      }

      .md3-navigation-rail::-webkit-scrollbar {
        display: none;
      }

      .md3-navigation-rail__tabs-slot-container {
        display: flex;
        flex-direction: column;
        gap: 32px;
        align-items: center;
      }

      .md3-navigation-rail-top {
        padding-top: 24px;
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
        width: auto;
        min-width: 220px;
        max-width: min(360px, 85vw);
        padding-left: 16px;
        padding-right: 16px;
      }

      .md3-navigation-rail__tabs-slot-container.expanded {
        align-items: start;
        width: 100%;
      }

      .md3-navigation-rail-top.expanded {
        align-items: start;
        padding-top: 16px;
        padding-left: 8px;
      }

      .menuSlot.expanded {
        padding-left: 8px;
      }

      .md3-navigation-rail__tabs-slot-container.expanded > div {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    `,
  ]
}

customElements.define('md-nav-rail', Rail)
