import '../elevation/elevation.js'
import { css, html, LitElement, nothing } from 'lit'
/**
 * NavigationBar
 */
export class NavigationBar extends LitElement {
  static properties = {
    activeIndex: { type: Number, attribute: 'active-index' },
    hideInactiveLabels: { type: Boolean, attribute: 'hide-inactive-labels' },
  }
  constructor() {
    super()
    this.activeIndex = 0
    this.hideInactiveLabels = false
    this.tabs = []
  }
  render() {
    // Needed for closure conformance
    const { ariaLabel } = this
    return html`<div
      class="md3-navigation-bar"
      role="tablist"
      aria-label=${ariaLabel || nothing}
      @keydown="${this.handleKeydown}"
      @navigation-tab-interaction="${this.handleNavigationTabInteraction}"
      @navigation-tab-rendered=${this.handleNavigationTabConnected}
    >
      <md-elevation part="elevation"></md-elevation>
      <div class="md3-navigation-bar__tabs-slot-container"><slot></slot></div>
    </div>`
  }
  updated(changedProperties) {
    if (changedProperties.has('activeIndex')) {
      this.onActiveIndexChange(this.activeIndex)
      this.dispatchEvent(
        new CustomEvent('navigation-bar-activated', {
          detail: {
            tab: this.tabs[this.activeIndex],
            activeIndex: this.activeIndex,
          },
          bubbles: true,
          composed: true,
        }),
      )
    }
    if (changedProperties.has('hideInactiveLabels')) {
      this.onHideInactiveLabelsChange(this.hideInactiveLabels)
    }
    if (changedProperties.has('tabs')) {
      this.onHideInactiveLabelsChange(this.hideInactiveLabels)
      this.onActiveIndexChange(this.activeIndex)
    }
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties)
    this.layout()
  }
  layout() {
    if (!this.tabsElement) return
    const navTabs = []
    for (const node of this.tabsElement) {
      navTabs.push(node)
    }
    this.tabs = navTabs
  }
  handleNavigationTabConnected(event) {
    const target = event.target
    if (this.tabs.indexOf(target) === -1) {
      this.layout()
    }
  }
  handleNavigationTabInteraction(event) {
    this.activeIndex = this.tabs.indexOf(event.detail.state)
  }
  handleKeydown(event) {
    const key = event.key
    const focusedTabIndex = this.tabs.findIndex((tab) => {
      return tab.matches(':focus-within')
    })
    const isRTL = isRtl(this)
    const maxIndex = this.tabs.length - 1
    if (key === 'Enter' || key === ' ') {
      this.activeIndex = focusedTabIndex
      return
    }
    if (key === 'Home') {
      this.tabs[0].focus()
      return
    }
    if (key === 'End') {
      this.tabs[maxIndex].focus()
      return
    }
    const toNextTab = (key === 'ArrowRight' && !isRTL) || (key === 'ArrowLeft' && isRTL)
    if (toNextTab && focusedTabIndex === maxIndex) {
      this.tabs[0].focus()
      return
    }
    if (toNextTab) {
      this.tabs[focusedTabIndex + 1].focus()
      return
    }
    const toPreviousTab = (key === 'ArrowLeft' && !isRTL) || (key === 'ArrowRight' && isRTL)
    if (toPreviousTab && focusedTabIndex === 0) {
      this.tabs[maxIndex].focus()
      return
    }
    if (toPreviousTab) {
      this.tabs[focusedTabIndex - 1].focus()
      return
    }
  }
  onActiveIndexChange(value) {
    if (!this.tabs[value]) {
      throw new Error('NavigationBar: activeIndex is out of bounds.')
    }
    for (let i = 0; i < this.tabs.length; i++) {
      this.tabs[i].active = i === value
    }
  }
  onHideInactiveLabelsChange(value) {
    for (const tab of this.tabs) {
      tab.hideInactiveLabel = value
    }
  }
  get tabsElement() {
    let slot = ''
    const slotSelector = `slot${slot ? `[name=${slot}]` : ':not([name])'}`
    let els = this.renderRoot?.querySelector(slotSelector)
    // console.log("ELS:", els)
    // let els = this.renderRoot?.querySelector('slot')?.assignedElements({ flatten: true })
    // return els.filter((e) => e.tagName === 'MD-NAVIGATION-TAB')
    return els.assignedElements({ flatten: true })
  }

  static styles = [
    css`
      :host {
        --_active-indicator-color: var(
          --md-navigation-bar-active-indicator-color,
          var(--md-sys-color-secondary-container, #e8def8)
        );
        --_active-indicator-height: var(--md-navigation-bar-active-indicator-height, 32px);
        --_active-indicator-shape: var(
          --md-navigation-bar-active-indicator-shape,
          var(--md-sys-shape-corner-full, 9999px)
        );
        --_active-indicator-width: var(--md-navigation-bar-active-indicator-width, 64px);
        --_active-focus-icon-color: var(
          --md-navigation-bar-active-focus-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_active-focus-label-text-color: var(
          --md-navigation-bar-active-focus-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-focus-state-layer-color: var(
          --md-navigation-bar-active-focus-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-hover-icon-color: var(
          --md-navigation-bar-active-hover-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_active-hover-label-text-color: var(
          --md-navigation-bar-active-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-hover-state-layer-color: var(
          --md-navigation-bar-active-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-icon-color: var(
          --md-navigation-bar-active-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_active-label-text-color: var(
          --md-navigation-bar-active-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-label-text-weight: var(
          --md-navigation-bar-active-label-text-weight,
          var(--md-sys-typescale-label-medium-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
        );
        --_active-pressed-icon-color: var(
          --md-navigation-bar-active-pressed-icon-color,
          var(--md-sys-color-on-secondary-container, #1d192b)
        );
        --_active-pressed-label-text-color: var(
          --md-navigation-bar-active-pressed-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_active-pressed-state-layer-color: var(
          --md-navigation-bar-active-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_container-color: var(--md-navigation-bar-container-color, var(--md-sys-color-surface-container, #f3edf7));
        --_container-elevation: var(--md-navigation-bar-container-elevation, 2);
        --_container-height: var(--md-navigation-bar-container-height, 80px);
        --_container-shape: var(--md-navigation-bar-container-shape, var(--md-sys-shape-corner-none, 0px));
        --_focus-state-layer-opacity: var(--md-navigation-bar-focus-state-layer-opacity, 0.12);
        --_hover-state-layer-opacity: var(--md-navigation-bar-hover-state-layer-opacity, 0.08);
        --_icon-size: var(--md-navigation-bar-icon-size, 24px);
        --_inactive-focus-icon-color: var(
          --md-navigation-bar-inactive-focus-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-focus-label-text-color: var(
          --md-navigation-bar-inactive-focus-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-focus-state-layer-color: var(
          --md-navigation-bar-inactive-focus-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-hover-icon-color: var(
          --md-navigation-bar-inactive-hover-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-hover-label-text-color: var(
          --md-navigation-bar-inactive-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-hover-state-layer-color: var(
          --md-navigation-bar-inactive-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-icon-color: var(
          --md-navigation-bar-inactive-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_inactive-label-text-color: var(
          --md-navigation-bar-inactive-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_inactive-pressed-icon-color: var(
          --md-navigation-bar-inactive-pressed-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-pressed-label-text-color: var(
          --md-navigation-bar-inactive-pressed-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_inactive-pressed-state-layer-color: var(
          --md-navigation-bar-inactive-pressed-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_label-text-font: var(
          --md-navigation-bar-label-text-font,
          var(--md-sys-typescale-label-medium-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-line-height: var(
          --md-navigation-bar-label-text-line-height,
          var(--md-sys-typescale-label-medium-line-height, 1rem)
        );
        --_label-text-size: var(
          --md-navigation-bar-label-text-size,
          var(--md-sys-typescale-label-medium-size, 0.75rem)
        );
        --_label-text-tracking: var(--md-navigation-bar-label-text-tracking);
        --_label-text-type: var(
          --md-navigation-bar-label-text-type,
          var(--md-sys-typescale-label-medium-weight, var(--md-ref-typeface-weight-medium, 500))
            var(--md-sys-typescale-label-medium-size, 0.75rem) / var(--md-sys-typescale-label-medium-line-height, 1rem)
            var(--md-sys-typescale-label-medium-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_label-text-weight: var(
          --md-navigation-bar-label-text-weight,
          var(--md-sys-typescale-label-medium-weight, var(--md-ref-typeface-weight-medium, 500))
        );
        --_pressed-state-layer-opacity: var(--md-navigation-bar-pressed-state-layer-opacity, 0.12);
        --md-elevation-level: var(--_container-elevation);
        --md-elevation-shadow-color: var(--_container-shadow-color);
        width: 100%;
      }

      .md3-navigation-bar {
        display: flex;
        position: relative;
        width: 100%;
        background-color: var(--_container-color);
        border-radius: var(--_container-shape);
        height: var(--_container-height);
        z-index: 10000;
      }

      .md3-navigation-bar .md3-navigation-bar__tabs-slot-container {
        display: inherit;
        width: inherit;
      }

      md-elevation {
        transition-duration: 280ms;
        z-index: 0;
      }
    `,
  ]
}

customElements.define('md-nav-bar', NavigationBar)
