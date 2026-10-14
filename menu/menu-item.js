/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @summary Menus display a list of choices on a temporary surface.
 *
 * @description
 * Menu items are the selectable choices within the menu. Menu items must
 * implement the `MenuItem` interface and also have the `md-menu-item`
 * attribute. Additionally menu items are list items so they must also have the
 * `md-list-item` attribute.
 *
 * Menu items can control a menu by selectively firing the `close-menu` and
 * `deselect-items` events.
 *
 * @final
 * @suppress {visibility}
 */
import '../internal/focus/focus-ring.js'
import '../labs/item/item.js'
import '../internal/ripple/ripple.js'
import { css, html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { literal, html as staticHtml } from 'lit/static-html.js'
import { MenuItemController } from './controllers/menuItemController.js'
import { queryAssignedElements, queryAssignedNodes } from '../utils/query.js'

export const menuItemStyles = css`
  :host {
    display: flex;
    text-wrap: nowrap;
    border-radius: var(--md-menu-item-shape, 0px);
    transition:
      border-radius 200ms cubic-bezier(0.2, 0, 0, 1),
      background-color 200ms cubic-bezier(0.2, 0, 0, 1);
    --md-ripple-hover-color: var(--md-menu-item-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));
    --md-ripple-hover-opacity: var(--md-menu-item-hover-state-layer-opacity, 0.08);
    --md-ripple-pressed-color: var(--md-menu-item-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));
    --md-ripple-pressed-opacity: var(--md-menu-item-pressed-state-layer-opacity, 0.12);
  }
  :host([disabled]) {
    opacity: var(--md-menu-item-disabled-opacity, 0.38);
    pointer-events: none;
  }
  md-focus-ring {
    z-index: 1;
    --md-focus-ring-shape: inherit;
  }
  a,
  button,
  li {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    text-align: unset;
    text-decoration: none;
  }
  .list-item {
    border-radius: inherit;
    display: flex;
    flex: 1;
    max-width: inherit;
    min-width: inherit;
    outline: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    background-color: var(--md-menu-item-container-color, transparent);
    transition:
      background-color 200ms cubic-bezier(0.2, 0, 0, 1),
      border-radius 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .list-item:not(.disabled) {
    cursor: pointer;
  }
  [slot='container'] {
    pointer-events: none;
  }
  md-ripple {
    border-radius: inherit;
  }
  md-item {
    border-radius: inherit;
    flex: 1;
    color: var(--md-menu-item-label-text-color, var(--md-sys-color-on-surface, #1d1b20));
    font-family: var(
      --md-menu-item-label-text-font,
      var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto))
    );
    font-size: var(--md-menu-item-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));
    line-height: var(--md-menu-item-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));
    font-weight: var(
      --md-menu-item-label-text-weight,
      var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
    );
    letter-spacing: var(--md-menu-item-label-text-tracking, var(--md-sys-typescale-label-large-tracking, 0.1px));
    min-height: var(--md-menu-item-one-line-container-height, 48px);
    gap: var(--md-menu-item-between-space, 8px);
    padding-top: var(--md-menu-item-top-space, 8px);
    padding-bottom: var(--md-menu-item-bottom-space, 8px);
    padding-inline-start: var(--md-menu-item-leading-space, 12px);
    padding-inline-end: var(--md-menu-item-trailing-space, 12px);
  }
  md-item[multiline] {
    min-height: var(--md-menu-item-two-line-container-height, 64px);
  }
  [slot='supporting-text'] {
    color: var(--md-menu-item-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));
    font-family: var(
      --md-menu-item-supporting-text-font,
      var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto))
    );
    font-size: var(--md-menu-item-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));
    line-height: var(--md-menu-item-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));
    font-weight: var(
      --md-menu-item-supporting-text-weight,
      var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400))
    );
    letter-spacing: var(--md-menu-item-supporting-text-tracking, var(--md-sys-typescale-body-small-tracking, 0.4px));
  }
  [slot='trailing-supporting-text'] {
    color: var(--md-menu-item-trailing-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));
    font-family: var(
      --md-menu-item-trailing-supporting-text-font,
      var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto))
    );
    font-size: var(--md-menu-item-trailing-supporting-text-size, var(--md-sys-typescale-label-small-size, 0.6875rem));
    line-height: var(
      --md-menu-item-trailing-supporting-text-line-height,
      var(--md-sys-typescale-label-small-line-height, 1rem)
    );
    font-weight: var(
      --md-menu-item-trailing-supporting-text-weight,
      var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500))
    );
  }
  :is([slot='start'], [slot='end'])::slotted(*) {
    fill: currentColor;
    font-size: var(--md-menu-item-icon-size, 20px);
    width: var(--md-menu-item-icon-size, 20px);
    height: var(--md-menu-item-icon-size, 20px);
    max-width: var(--md-menu-item-icon-size, 20px);
    max-height: var(--md-menu-item-icon-size, 20px);
    box-sizing: border-box;
    object-fit: contain;
    flex-shrink: 0;
  }
  :is([slot='start'], [slot='end'])::slotted(img) {
    border-radius: inherit;
    object-fit: cover;
  }
  :is([slot='start'], [slot='end'])::slotted(md-icon) {
    --md-icon-size: var(--md-menu-item-icon-size, 20px);
    font-size: var(--md-menu-item-icon-size, 20px);
    font-variation-settings: 'opsz' 20;
  }
  [slot='start'] {
    color: var(--md-menu-item-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--md-menu-item-icon-size, 20px);
    height: var(--md-menu-item-icon-size, 20px);
    min-width: var(--md-menu-item-icon-size, 20px);
    min-height: var(--md-menu-item-icon-size, 20px);
    max-width: var(--md-menu-item-icon-size, 20px);
    max-height: var(--md-menu-item-icon-size, 20px);
    flex-shrink: 0;
  }
  [slot='end'] {
    color: var(--md-menu-item-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--md-menu-item-icon-size, 20px);
    height: var(--md-menu-item-icon-size, 20px);
    min-width: var(--md-menu-item-icon-size, 20px);
    min-height: var(--md-menu-item-icon-size, 20px);
    max-width: var(--md-menu-item-icon-size, 20px);
    max-height: var(--md-menu-item-icon-size, 20px);
    flex-shrink: 0;
  }
  .list-item.selected {
    background-color: var(--md-menu-item-selected-container-color, var(--md-sys-color-secondary-container, #e8def8));
    border-radius: var(--md-menu-item-selected-shape, inherit);
  }
  .selected:not(.disabled) ::slotted(*) {
    color: var(--md-menu-item-selected-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));
  }
  .selected:not(.disabled) [slot='start'],
  .selected:not(.disabled) [slot='end'] {
    color: var(
      --md-menu-item-selected-icon-color,
      var(--md-menu-item-selected-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b))
    );
  }
  @media (forced-colors: active) {
    :host([disabled]),
    :host([disabled]) slot {
      color: GrayText;
      opacity: 1;
    }
    .list-item {
      position: relative;
    }
    .list-item.selected::before {
      content: '';
      position: absolute;
      inset: 0;
      box-sizing: border-box;
      border-radius: inherit;
      pointer-events: none;
      border: 3px double CanvasText;
    }
  }
`

/**
 * @fires close-menu {CustomEvent<{initiator: SelectOption, reason: Reason, itemPath: SelectOption[]}>}
 * Closes the encapsulating menu on closable interaction. --bubbles --composed
 */
export class MenuItem extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    type: { type: String },
    href: { type: String },
    target: { type: String },
    keepOpen: { type: Boolean, attribute: 'keep-open' },
    selected: { type: Boolean, reflect: true },
    menuItemController: { type: MenuItemController },
    typeaheadText: { type: String, attribute: 'typeahead-text' },
  }

  constructor() {
    super()
    /**
     * Disables the item and makes it non-selectable and non-interactive.
     */
    this.disabled = false
    /**
     * Sets the behavior and role of the menu item, defaults to "menuitem".
     */
    this.type = 'menuitem'
    /**
     * Sets the underlying `HTMLAnchorElement`'s `href` resource attribute.
     */
    this.href = ''
    /**
     * Sets the underlying `HTMLAnchorElement`'s `target` attribute when `href` is
     * set.
     */
    this.target = ''
    /**
     * Keeps the menu open if clicked or keyboard selected.
     */
    this.keepOpen = false
    /**
     * Sets the item in the selected visual state when a submenu is opened.
     */
    this.selected = false
    this.menuItemController = new MenuItemController(this, {
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
    return this.menuItemController.typeaheadText
  }
  set typeaheadText(text) {
    this.menuItemController.setTypeaheadText(text)
  }

  // listItemRoot: { type: HTMLElement, query: '.list-item' },
  // headlineElements: { type: Array, query: 'slot[name="headline"]' },
  // supportingTextElements: { type: Array, query: 'slot[name="supporting-text"]' },
  // defaultElements: { type: Array, query: 'slot' },
  get listItemRoot() {
    return this.renderRoot.querySelector('.list-item')
  }
  get headlineElements() {
    // return this.renderRoot.querySelectorAll('slot[name="headline"]')
    return queryAssignedElements(this, { slot: 'headline' })
  }
  get supportingTextElements() {
    // return this.renderRoot.querySelectorAll('slot[name="supporting-text"]')
    return queryAssignedElements(this, { slot: 'supporting-text' })
  }
  get defaultElements() {
    return queryAssignedNodes(this, { slot: '' })
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
    const isAnchor = this.type === 'link'
    let tag
    switch (this.menuItemController.tagName) {
      case 'a':
        tag = literal`a`
        break
      case 'button':
        tag = literal`button`
        break
      default:
      case 'li':
        tag = literal`li`
        break
    }
    // TODO(b/265339866): announce "button"/"link" inside of a list item. Until
    // then all are "menuitem" roles for correct announcement.
    const target = isAnchor && !!this.target ? this.target : nothing
    return staticHtml`
      <${tag}
        id="item"
        tabindex=${this.disabled && !isAnchor ? -1 : 0}
        role=${this.menuItemController.role}
        aria-label=${this.ariaLabel || nothing}
        aria-selected=${this.ariaSelected || nothing}
        aria-checked=${this.ariaChecked || nothing}
        aria-expanded=${this.ariaExpanded || nothing}
        aria-haspopup=${this.ariaHasPopup || nothing}
        class="list-item ${classMap(this.getRenderClasses())}"
        href=${this.href || nothing}
        target=${target}
        @click=${this.menuItemController.onClick}
        @keydown=${this.menuItemController.onKeydown}
      >${content}</${tag}>
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

  static styles = [menuItemStyles]
}

/** @nocollapse */
MenuItem.shadowRootOptions = {
  ...LitElement.shadowRootOptions,
  delegatesFocus: true,
}

customElements.define('md-menu-item', MenuItem)
