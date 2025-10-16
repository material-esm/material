import { Menu } from '../menu/menu.js'
/**
 * @summary
 * Select menus display a list of choices on temporary surfaces and display the
 * currently selected menu item above the menu.
 *
 * @description
 * The select component allows users to choose a value from a fixed list of
 * available options. Composed of an interactive anchor button and a menu, it is
 * analogous to the native HTML `<select>` element. This is the option that
 * can be placed inside of an md-select.
 *
 * This component is a subclass of `md-menu-item` and can accept the same slots,
 * properties, and events as `md-menu-item`.
 *
 * @example
 * ```html
 * <md-outlined-select label="fruits">
 *   <!-- An empty selected option will give select an "un-filled" state -->
 *   <md-select-option selected></md-select-option>
 *   <md-select-option value="apple" headline="Apple"></md-select-option>
 *   <md-select-option value="banana" headline="Banana"></md-select-option>
 *   <md-select-option value="kiwi" headline="Kiwi"></md-select-option>
 *   <md-select-option value="orange" headline="Orange"></md-select-option>
 *   <md-select-option value="tomato" headline="Tomato"></md-select-option>
 * </md-outlined-select>
 * ```
 *
 * @final
 * @suppress {visibility}
 */

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../focus/focus-ring.js'
import '../labs/item/item.js'
import '../ripple/ripple.js'
import { html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { queryAssignedElements, queryAssignedNodes } from '../utils/query.js'
import { MenuItemController } from '../menu/controllers/menuItemController.js'

/**
 * @fires close-menu {CustomEvent<{initiator: SelectOption, reason: Reason, itemPath: SelectOption[]}>}
 * Closes the encapsulating menu on closable interaction. --bubbles --composed
 * @fires request-selection {Event} Requests the parent md-select to select this
 * element (and deselect others if single-selection) when `selected` changed to
 * `true`. --bubbles --composed
 * @fires request-deselection {Event} Requests the parent md-select to deselect
 * this element when `selected` changed to `false`. --bubbles --composed
 */
export class SelectOption extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    isMenuItem: { type: Boolean, attribute: 'md-menu-item', reflect: true },
    selected: { type: Boolean },
    value: { type: String },
    typeaheadText: { attribute: 'typeahead-text' },
    displayText: { attribute: 'display-text' },
  }

  constructor() {
    super(...arguments)
    /**
     * Disables the item and makes it non-selectable and non-interactive.
     */
    this.disabled = false
    /**
     * READONLY: self-identifies as a menu item and sets its identifying attribute
     */
    this.isMenuItem = true
    /**
     * Sets the item in the selected visual state when a submenu is opened.
     */
    this.selected = false
    /**
     * Form value of the option.
     */
    this.value = ''
    this.type = 'option'
    // this.typeaheadText = ''
    // this.displayText = ''
    this.selectOptionController = new SelectOptionController(this, {
      getHeadlineElements: () => {
        return this.headlineElements
      },
      getSupportingTextElements: () => {
        return this.supportingTextElements
      },
      getDefaultElements: () => {
        return this.defaultElements
      },
      getInteractiveElement: () => this.listItemRoot,
    })
  }
  /**
   * The text that is selectable via typeahead. If not set, defaults to the
   * innerText of the item slotted into the `"headline"` slot.
   */
  get typeaheadText() {
    return this.selectOptionController.typeaheadText
  }
  set typeaheadText(text) {
    this.selectOptionController.setTypeaheadText(text)
    // this.requestUpdate()
  }
  /**
   * The text that is displayed in the select field when selected. If not set,
   * defaults to the textContent of the item slotted into the `"headline"` slot.
   */
  get displayText() {
    return this.selectOptionController.displayText
  }
  set displayText(text) {
    console.log('SelectOptionEl set displayText', text)
    this.selectOptionController.setDisplayText(text)
    // this.requestUpdate()
  }
  render() {
    return this.renderListItem(html`
      <md-item>
        <div slot="container">${this.renderRipple()} ${this.renderFocusRing()}</div>
        <slot name="start" slot="start"></slot>
        <slot name="end" slot="end"></slot>
        ${this.renderBody()}
      </md-item>
    `)
  }
  /**
   * Renders the root list item.
   *
   * @param content the child content of the list item.
   */
  renderListItem(content) {
    return html`
      <li
        id="item"
        tabindex=${this.disabled ? -1 : 0}
        role=${this.selectOptionController.role}
        aria-label=${this.ariaLabel || nothing}
        aria-selected=${this.ariaSelected || nothing}
        aria-checked=${this.ariaChecked || nothing}
        aria-expanded=${this.ariaExpanded || nothing}
        aria-haspopup=${this.ariaHasPopup || nothing}
        class="list-item ${classMap(this.getRenderClasses())}"
        @click=${this.selectOptionController.onClick}
        @keydown=${this.selectOptionController.onKeydown}
      >
        ${content}
      </li>
    `
  }
  /**
   * Handles rendering of the ripple element.
   */
  renderRipple() {
    return html` <md-ripple part="ripple" for="item" ?disabled=${this.disabled}></md-ripple>`
  }
  /**
   * Handles rendering of the focus ring.
   */
  renderFocusRing() {
    return html` <md-focus-ring part="focus-ring" for="item" inward></md-focus-ring>`
  }
  /**
   * Classes applied to the list item root.
   */
  getRenderClasses() {
    return {
      disabled: this.disabled,
      selected: this.selected,
    }
  }
  /**
   * Handles rendering the headline and supporting text.
   */
  renderBody() {
    return html`
      <slot></slot>
      <slot name="overline" slot="overline"></slot>
      <slot name="headline" slot="headline"></slot>
      <slot name="supporting-text" slot="supporting-text"></slot>
      <slot name="trailing-supporting-text" slot="trailing-supporting-text"></slot>
    `
  }
  focus() {
    // TODO(b/300334509): needed for some cases where delegatesFocus doesn't
    // work programmatically like in FF and select-option
    this.listItemRoot?.focus()
  }

  get listItemRoot() {
    return this.renderRoot.querySelector('.list-item')
  }
  get headlineElements() {
    // console.log("headline elements:", this.renderRoot.querySelectorAll('slot[name="headline"]'))
    return queryAssignedElements(this, { slot: 'headline' })
  }
  get supportingTextElements() {
    return queryAssignedElements(this, { slot: 'supporting-text' })
  }
  get defaultElements() {
    return queryAssignedNodes(this, { slot: '' })
  }

  static styles = [Menu.styles]
}
;(() => {
  requestUpdateOnAriaChange(SelectOption)
})()
/** @nocollapse */
SelectOption.shadowRootOptions = {
  ...LitElement.shadowRootOptions,
  delegatesFocus: true,
}

/*
__decorate([
    query('.list-item')
], SelectOptionEl.prototype, "listItemRoot", void 0);
__decorate([
    queryAssignedElements({ slot: 'headline' })
], SelectOptionEl.prototype, "headlineElements", void 0);
__decorate([
    queryAssignedElements({ slot: 'supporting-text' })
], SelectOptionEl.prototype, "supportingTextElements", void 0);
__decorate([
    queryAssignedNodes({ slot: '' })
], SelectOptionEl.prototype, "defaultElements", void 0);
__decorate([
    property({ attribute: 'typeahead-text' })
], SelectOptionEl.prototype, "typeaheadText", null);
__decorate([
    property({ attribute: 'display-text' })
], SelectOptionEl.prototype, "displayText", null);
*/

/**
 * Creates an event fired by a SelectOption to request selection from md-select.
 * Typically fired after `selected` changes from `false` to `true`.
 */
export function createRequestSelectionEvent() {
  return new Event('request-selection', {
    bubbles: true,
    composed: true,
  })
}
/**
 * Creates an event fired by a SelectOption to request deselection from
 * md-select. Typically fired after `selected` changes from `true` to `false`.
 */
export function createRequestDeselectionEvent() {
  return new Event('request-deselection', {
    bubbles: true,
    composed: true,
  })
}
/**
 * A controller that provides most functionality and md-select compatibility for
 * an element that implements the SelectOption interface.
 */
export class SelectOptionController {
  /**
   * The recommended role of the select option.
   */
  get role() {
    return this.menuItemController.role
  }
  /**
   * The text that is selectable via typeahead. If not set, defaults to the
   * innerText of the item slotted into the `"headline"` slot, and if there are
   * no slotted elements into headline, then it checks the _default_ slot, and
   * then the `"supporting-text"` slot if nothing is in _default_.
   */
  get typeaheadText() {
    return this.menuItemController.typeaheadText
  }
  setTypeaheadText(text) {
    this.menuItemController.setTypeaheadText(text)
  }
  /**
   * The text that is displayed in the select field when selected. If not set,
   * defaults to the textContent of the item slotted into the `"headline"` slot,
   * and if there are no slotted elements into headline, then it checks the
   * _default_ slot, and then the `"supporting-text"` slot if nothing is in
   * _default_.
   */
  get displayText() {
    if (this.internalDisplayText !== null) {
      return this.internalDisplayText
    }
    return this.menuItemController.typeaheadText
  }
  setDisplayText(text) {
    this.internalDisplayText = text
  }
  /**
   * @param host The SelectOption in which to attach this controller to.
   * @param config The object that configures this controller's behavior.
   */
  constructor(host, config) {
    this.host = host
    this.internalDisplayText = null
    this.lastSelected = this.host.selected
    this.firstUpdate = true
    /**
     * Bind this click listener to the interactive element. Handles closing the
     * menu.
     */
    this.onClick = () => {
      this.menuItemController.onClick()
    }
    /**
     * Bind this click listener to the interactive element. Handles closing the
     * menu.
     */
    this.onKeydown = (e) => {
      this.menuItemController.onKeydown(e)
    }
    this.menuItemController = new MenuItemController(host, config)
    host.addController(this)
  }
  hostUpdate() {
    if (this.lastSelected !== this.host.selected) {
      this.host.ariaSelected = this.host.selected ? 'true' : 'false'
    }
  }
  hostUpdated() {
    // Do not dispatch event on first update / boot-up.
    if (this.lastSelected !== this.host.selected && !this.firstUpdate) {
      // This section is really useful for when the user sets selected on the
      // option programmatically. Most other cases (click and keyboard) are
      // handled by md-select because it needs to coordinate the
      // single-selection behavior.
      if (this.host.selected) {
        this.host.dispatchEvent(createRequestSelectionEvent())
      } else {
        this.host.dispatchEvent(createRequestDeselectionEvent())
      }
    }
    this.lastSelected = this.host.selected
    this.firstUpdate = false
  }
}

customElements.define('md-select-option', SelectOption)
