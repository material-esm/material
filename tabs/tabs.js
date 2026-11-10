/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { html, isServer, LitElement, css } from 'lit'
import '../divider/divider.js'
import { ANIMATE_INDICATOR } from './tab.js'
import { queryAssignedElements } from '../utils/query.js'
/**
 * @fires change {Event} Fired when the selected tab changes. The target's `activeTabIndex`
 * or `activeTab` provide information about the selection change. The change event is fired
 * when a user interaction like a space/enter key or click cause a selection change. The tab
 * selection based on these actions can be cancelled by calling preventDefault on the
 * triggering `keydown` or `click` event. --bubbles
 *
 * @example
 * // perform an action if a tab is clicked
 * tabs.addEventListener('change', (event) => {
 *   if (event.target.activeTabIndex === 2) {
 *     takeAction();
 *   }
 * });
 *
 * // prevent a click from triggering tab selection under some condition
 * tabs.addEventListener('click', (event) => {
 *   if (notReady) {
 *     event.preventDefault();
 *   }
 * });
 *
 */
export class Tabs extends LitElement {
  static properties = {
    activeTabIndex: { type: Number, attribute: 'active-tab-index', noAccessor: true },
    autoActivate: { type: Boolean, attribute: 'auto-activate' },
    scrollable: { type: Boolean, reflect: true },
  }

  get tabs() {
    return queryAssignedElements(this, { flatten: true, selector: '[md-tab]' })
  }

  get slotElement() {
    return this.renderRoot?.querySelector('slot') ?? null
  }

  get tabsScrollerElement() {
    return this.renderRoot?.querySelector('.tabs') ?? null
  }

  /**
   * The currently selected tab, `null` only when there are no tab children.
   *
   * @export
   */
  get activeTab() {
    return this.tabs.find((tab) => tab.active) ?? null
  }
  set activeTab(tab) {
    // Ignore setting activeTab to null. As long as there are children, one tab
    // must be selected.
    if (tab) {
      this.activateTab(tab)
    }
  }
  /**
   * The index of the currently selected tab.
   *
   * @export
   */
  get activeTabIndex() {
    return this.tabs.findIndex((tab) => tab.active)
  }
  set activeTabIndex(index) {
    const activateTabAtIndex = () => {
      const targetIndex = this._pendingActiveTabIndex !== undefined ? this._pendingActiveTabIndex : index
      if (this.tabs.length === 0) {
        this._pendingActiveTabIndex = targetIndex
        return
      }
      this._pendingActiveTabIndex = undefined
      const tab = this.tabs[targetIndex]
      // Ignore out-of-bound indices.
      if (tab) {
        this.activateTab(tab)
      }
    }
    if (!this.slotElement) {
      // This is needed to support setting the activeTabIndex via a lit property
      // binding or attribute before the `<slot>` element has rendered.
      this._pendingActiveTabIndex = index
      this.updateComplete.then(() => {
        if (this._pendingActiveTabIndex !== undefined) {
          activateTabAtIndex()
        }
      })
      return
    }
    this._pendingActiveTabIndex = undefined
    activateTabAtIndex()
  }
  get focusedTab() {
    return this.tabs.find((tab) => tab.matches(':focus-within'))
  }
  constructor() {
    super()
    /**
     * Whether or not to automatically select a tab when it is focused.
     */
    this.autoActivate = false
    /**
     * Whether tabs size to their content and scroll horizontally with M3's 52dp leading offset.
     */
    this.scrollable = false
    this._pendingActiveTabIndex = undefined
    this.internals =
      // Cast needed for closure
      this.attachInternals()
    if (!isServer) {
      this.internals.role = 'tablist'
      this.addEventListener('keydown', this.handleKeydown.bind(this))
      this.addEventListener('keyup', this.handleKeyup.bind(this))
      this.addEventListener('focusout', this.handleFocusout.bind(this))
    }
  }
  /**
   * Scrolls the toolbar, if overflowing, to the active tab, or the provided
   * tab.
   *
   * @param tabToScrollTo The tab that should be scrolled to. Defaults to the
   *     active tab.
   * @return A Promise that resolves after the tab has been scrolled to.
   */
  async scrollToTab(tabToScrollTo) {
    await this.updateComplete
    const { tabs } = this
    tabToScrollTo ?? (tabToScrollTo = this.activeTab)
    if (!tabToScrollTo || !tabs.includes(tabToScrollTo) || !this.tabsScrollerElement) {
      return
    }
    // wait for tabs to render.
    for (const tab of this.tabs) {
      await tab.updateComplete
    }
    const offset = tabToScrollTo.offsetLeft
    const extent = tabToScrollTo.offsetWidth
    const scroll = this.tabsScrollerElement.scrollLeft
    const hostExtent = this.offsetWidth
    const leadingPadding = parseFloat(getComputedStyle(this.tabsScrollerElement).paddingInlineStart) || 0
    const scrollMargin = Math.max(48, leadingPadding)
    const min = offset - scrollMargin
    const max = offset + extent - hostExtent + scrollMargin
    const to = Math.min(min, Math.max(max, scroll))
    // When a tab is focused, use 'auto' to use the CSS `scroll-behavior`. The
    // default behavior is smooth scrolling. However, when there is not a tab
    // focused on initialization, use 'instant' to immediately bring the focused
    // tab into view.
    const behavior = !this.focusedTab ? 'instant' : 'auto'
    this.tabsScrollerElement.scrollTo({ behavior, top: 0, left: to })
  }
  render() {
    return html`
      <div class="tabs">
        <slot @slotchange=${this.handleSlotChange} @click=${this.handleTabClick}></slot>
      </div>
      <md-divider part="divider"></md-divider>
    `
  }
  async handleTabClick(event) {
    const tab = event.target
    // Allow event to bubble
    await 0
    if (event.defaultPrevented || !isTab(tab) || tab.active) {
      return
    }
    this.activateTab(tab)
  }
  activateTab(activeTab) {
    const { tabs } = this
    const previousTab = this.activeTab
    if (!tabs.includes(activeTab) || previousTab === activeTab) {
      // Ignore setting activeTab to a tab element that is not a child.
      return
    }
    this._pendingActiveTabIndex = undefined
    for (const tab of tabs) {
      tab.active = tab === activeTab
    }
    if (previousTab) {
      // Don't dispatch a change event if activating a tab when no previous tabs
      // were selected, such as when md-tabs auto-selects the first tab.
      const defaultPrevented = !this.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
      if (defaultPrevented) {
        for (const tab of tabs) {
          tab.active = tab === previousTab
        }
        return
      }
      activeTab[ANIMATE_INDICATOR](previousTab)
    }
    this.updateFocusableTab(activeTab)
    this.scrollToTab(activeTab)
  }
  updateFocusableTab(focusableTab) {
    for (const tab of this.tabs) {
      tab.tabIndex = tab === focusableTab ? 0 : -1
    }
  }
  // focus item on keydown and optionally select it
  async handleKeydown(event) {
    // Allow event to bubble.
    await 0
    const isLeft = event.key === 'ArrowLeft'
    const isRight = event.key === 'ArrowRight'
    const isHome = event.key === 'Home'
    const isEnd = event.key === 'End'
    // Ignore non-navigation keys
    if (event.defaultPrevented || (!isLeft && !isRight && !isHome && !isEnd)) {
      return
    }
    const { tabs } = this
    // Don't try to select another tab if there aren't any.
    if (tabs.length < 2) {
      return
    }
    // Prevent default interactions, such as scrolling.
    event.preventDefault()
    let indexToFocus
    if (isHome || isEnd) {
      indexToFocus = isHome ? 0 : tabs.length - 1
    } else {
      // Check if moving forwards or backwards
      const isRtl = getComputedStyle(this).direction === 'rtl'
      const forwards = isRtl ? isLeft : isRight
      const { focusedTab } = this
      if (!focusedTab) {
        // If there is not already a tab focused, select the first or last tab
        // based on the direction we're traveling.
        indexToFocus = forwards ? 0 : tabs.length - 1
      } else {
        const focusedIndex = this.tabs.indexOf(focusedTab)
        indexToFocus = forwards ? focusedIndex + 1 : focusedIndex - 1
        if (indexToFocus >= tabs.length) {
          // Return to start if moving past the last item.
          indexToFocus = 0
        } else if (indexToFocus < 0) {
          // Go to end if moving before the first item.
          indexToFocus = tabs.length - 1
        }
      }
    }
    const tabToFocus = tabs[indexToFocus]
    tabToFocus.focus()
    if (this.autoActivate) {
      this.activateTab(tabToFocus)
    } else {
      this.updateFocusableTab(tabToFocus)
    }
  }
  // scroll to item on keyup.
  handleKeyup() {
    this.scrollToTab(this.focusedTab ?? this.activeTab)
  }
  handleFocusout() {
    // restore focus to selected item when blurring the tab bar.
    if (this.matches(':focus-within')) {
      return
    }
    const { activeTab } = this
    if (activeTab) {
      this.updateFocusableTab(activeTab)
    }
  }
  async handleSlotChange() {
    if (this.tabs.length === 0) {
      const assigned = this.slotElement?.assignedElements({ flatten: true }) ?? []
      if (assigned.length > 0) {
        await Promise.all(assigned.map((el) => el.updateComplete))
      }
    }
    if (this._pendingActiveTabIndex !== undefined && this.tabs.length > 0) {
      const pendingTab = this.tabs[this._pendingActiveTabIndex]
      this._pendingActiveTabIndex = undefined
      if (pendingTab) {
        this.activateTab(pendingTab)
        return
      }
    }
    const firstTab = this.tabs[0]
    if (!this.activeTab && firstTab) {
      // If the active tab was removed, auto-select the first one. There should
      // always be a selected tab while the bar has children.
      this.activateTab(firstTab)
      return
    }
    if (this.activeTab) {
      this.updateFocusableTab(this.activeTab)
    }
    // When children shift, ensure the active tab is visible. For example, if
    // many children are added before the active tab, it'd be pushed off screen.
    // This ensures it stays visible.
    this.scrollToTab(this.activeTab)
  }

  static styles = [
    css`
      :host {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        overflow: auto;
        scroll-behavior: smooth;
        scrollbar-width: none;
        position: relative;
      }
      :host([hidden]) {
        display: none;
      }
      :host::-webkit-scrollbar,
      .tabs::-webkit-scrollbar {
        display: none;
      }
      .tabs {
        align-items: end;
        box-sizing: border-box;
        display: flex;
        height: 100%;
        overflow: inherit;
        position: relative;
        scroll-behavior: inherit;
        scrollbar-width: inherit;
        justify-content: space-between;
        width: 100%;
      }
      :host([scrollable]) .tabs {
        justify-content: flex-start;
        padding-inline-start: var(--md-tabs-scrollable-offset, 52px);
      }
      ::slotted(*) {
        flex: 1;
      }
      :host([scrollable]) ::slotted(*) {
        flex: 0 0 auto;
      }
      ::slotted([active]) {
        z-index: 1;
      }
    `,
  ]
}
function isTab(element) {
  return element instanceof HTMLElement && element.hasAttribute('md-tab')
}

customElements.define('md-tabs', Tabs)
