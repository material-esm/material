import { css } from 'lit'
/**
 * @summary
 * Select menus display a list of choices on temporary surfaces and display the
 * currently selected menu item above the menu.
 *
 * @description
 * The select component allows users to choose a value from a fixed list of
 * available options. Composed of an interactive anchor button and a menu, it is
 * analogous to the native HTML `<select>` element. This is the "filled"
 * variant.
 *
 * @example
 * ```html
 * <md-filled-select label="fruits">
 *   <!-- An empty selected option will give select an "un-filled" state -->
 *   <md-select-option selected></md-select-option>
 *   <md-select-option value="apple" headline="Apple"></md-select-option>
 *   <md-select-option value="banana" headline="Banana"></md-select-option>
 *   <md-select-option value="kiwi" headline="Kiwi"></md-select-option>
 *   <md-select-option value="orange" headline="Orange"></md-select-option>
 *   <md-select-option value="tomato" headline="Tomato"></md-select-option>
 * </md-filled-select>
 * ```
 *
 * @final
 * @suppress {visibility}
 */
var _a
import '../menu/menu.js'
import { html, isServer, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { html as staticHtml } from 'lit/static-html.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { redispatchEvent } from '../internal/events/redispatch-event.js'
import {
  createValidator,
  getValidityAnchor,
  mixinConstraintValidation,
} from '../labs/behaviors/constraint-validation.js'
import { mixinElementInternals } from '../labs/behaviors/element-internals.js'
import { getFormValue, mixinFormAssociated } from '../labs/behaviors/form-associated.js'
import { mixinOnReportValidity, onReportValidity } from '../labs/behaviors/on-report-validity.js'
import { SelectValidator } from '../labs/behaviors/validators/select-validator.js'
import { getActiveItem } from '../list/internal/list-navigation-helpers.js'
import { FocusState, isElementInSubtree, isSelectableKey } from '../menu/controllers/shared.js'
import { TYPEAHEAD_RECORD } from '../menu/controllers/typeaheadController.js'
import { DEFAULT_TYPEAHEAD_BUFFER_TIME } from '../menu/menu.js'
import { queryAssignedElements, queryAssignedNodes } from '../utils/query.js'

const VALUE = Symbol('value')
// Separate variable needed for closure.
const selectBaseClass = mixinOnReportValidity(
  mixinConstraintValidation(mixinFormAssociated(mixinElementInternals(LitElement))),
)

/**
 * Given a list of select options, this function will return an array of
 * SelectOptionRecords that are selected.
 *
 * @return An array of SelectOptionRecords describing the options that are
 * selected.
 */
export function getSelectedItems(items) {
  const selectedItemRecords = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.selected) {
      selectedItemRecords.push([item, i])
    }
  }
  return selectedItemRecords
}

/**
 * @fires change {Event} The native `change` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)
 * --bubbles
 * @fires input {InputEvent} The native `input` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event)
 * --bubbles --composed
 * @fires opening {Event} Fired when the select's menu is about to open.
 * @fires opened {Event} Fired when the select's menu has finished animations
 * and opened.
 * @fires closing {Event} Fired when the select's menu is about to close.
 * @fires closed {Event} Fired when the select's menu has finished animations
 * and closed.
 */
export class Select extends selectBaseClass {
  static properties = {
    quick: { type: Boolean },
    required: { type: Boolean },
    errorText: { type: String },
    label: { type: String },
    supportingText: { type: String },
    error: { type: Boolean, reflect: true },
    menuPositioning: { type: String, attribute: 'menu-positioning' },
    clampMenuWidth: { type: Boolean, attribute: 'clamp-menu-width' },
    typeaheadDelay: { type: Number, attribute: 'typeahead-delay' },
    hasLeadingIcon: { type: Boolean, attribute: 'has-leading-icon' },
    displayText: { type: String, attribute: 'display-text' },
    menuAlign: { type: String, attribute: 'menu-align' },
    value: { type: String },
    selectedIndex: { type: Number, attribute: 'selected-index' },
    disabled: { type: Boolean, reflect: true },
    isMenuItem: { type: Boolean, attribute: 'md-menu-item', reflect: true },
    selected: { type: Boolean, reflect: true },
    typeaheadText: { type: String, attribute: 'typeahead-text' },
    nativeError: { type: Object },
    nativeErrorText: { type: String },
    focused: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    defaultFocus: { type: Number, attribute: 'default-focus' },
    selectWidth: { type: Number, attribute: 'select-width' },
    lastUserSetValue: { type: String, attribute: 'last-user-set-value' },
    lastUserSetSelectedIndex: { type: Number, attribute: 'last-user-set-selected-index' },
    lastSelectedOption: { type: Object, attribute: 'last-selected-option' },
    lastSelectedOptionRecords: { type: Array, attribute: 'last-selected-option-records' },
  }

  /**
   * The value of the currently selected option.
   *
   * Note: For SSR, set `[selected]` on the requested option and `displayText`
   * rather than setting `value` setting `value` will incur a DOM query.
   */
  get value() {
    return this[VALUE]
  }
  set value(value) {
    if (isServer) return
    this.lastUserSetValue = value
    this.select(value)
  }
  get options() {
    // NOTE: this does a DOM query.
    return this.menu?.items ?? []
  }
  /**
   * The index of the currently selected option.
   *
   * Note: For SSR, set `[selected]` on the requested option and `displayText`
   * rather than setting `selectedIndex` setting `selectedIndex` will incur a
   * DOM query.
   */
  get selectedIndex() {
    // tslint:disable-next-line:enforce-name-casing
    const [_option, index] = (this.getSelectedOptions() ?? [])[0] ?? []
    return index ?? -1
  }
  set selectedIndex(index) {
    this.lastUserSetSelectedIndex = index
    this.selectIndex(index)
  }
  /**
   * Returns an array of selected options.
   *
   * NOTE: md-select only suppoprts single selection.
   */
  get selectedOptions() {
    return (this.getSelectedOptions() ?? []).map(([option]) => option)
  }
  get hasError() {
    return this.error || this.nativeError
  }
  constructor() {
    super()
    this.color = 'filled'
    /**
     * Opens the menu synchronously with no animation.
     */
    this.quick = false
    /**
     * Whether or not the select is required.
     */
    this.required = false
    /**
     * The error message that replaces supporting text when `error` is true. If
     * `errorText` is an empty string, then the supporting text will continue to
     * show.
     *
     * This error message overrides the error message displayed by
     * `reportValidity()`.
     */
    this.errorText = ''
    /**
     * The floating label for the field.
     */
    this.label = ''
    this.value = ''
    /**
     * Conveys additional information below the select, such as how it should
     * be used.
     */
    this.supportingText = ''
    /**
     * Gets or sets whether or not the select is in a visually invalid state.
     *
     * This error state overrides the error state controlled by
     * `reportValidity()`.
     */
    this.error = false
    /**
     * Whether or not the underlying md-menu should be position: fixed to display
     * in a top-level manner, or position: absolute.
     *
     * position:fixed is useful for cases where select is inside of another
     * element with stacking context and hidden overflows such as `md-dialog`.
     */
    this.menuPositioning = 'popover'
    /**
     * Clamps the menu-width to the width of the select.
     */
    this.clampMenuWidth = false
    /**
     * The max time between the keystrokes of the typeahead select / menu behavior
     * before it clears the typeahead buffer.
     */
    this.typeaheadDelay = DEFAULT_TYPEAHEAD_BUFFER_TIME
    /**
     * Whether or not the text field has a leading icon. Used for SSR.
     */
    this.hasLeadingIcon = false
    /**
     * Text to display in the field. Only set for SSR.
     */
    this.displayText = ''
    /**
     * Whether the menu should be aligned to the start or the end of the select's
     * textbox.
     */
    this.menuAlign = 'start'
    this[_a] = ''
    /**
     * Used for initializing select when the user sets the `value` directly.
     */
    this.lastUserSetValue = null
    /**
     * Used for initializing select when the user sets the `selectedIndex`
     * directly.
     */
    this.lastUserSetSelectedIndex = null
    /**
     * Used for `input` and `change` event change detection.
     */
    this.lastSelectedOption = null
    // tslint:disable-next-line:enforce-name-casing
    this.lastSelectedOptionRecords = []
    /**
     * Whether or not a native error has been reported via `reportValidity()`.
     */
    this.nativeError = false
    /**
     * The validation message displayed from a native error via
     * `reportValidity()`.
     */
    this.nativeErrorText = ''
    this.focused = false
    this.open = false
    this.defaultFocus = FocusState.NONE
    // Have to keep track of previous open because it's state and private and thus
    // cannot be tracked in PropertyValues<this> map.
    this.prevOpen = this.open
    this.selectWidth = 0
    if (isServer) {
      return
    }
    this.addEventListener('focus', this.handleFocus.bind(this))
    this.addEventListener('blur', this.handleBlur.bind(this))
  }
  /**
   * Selects an option given the value of the option, and updates MdSelect's
   * value.
   */
  select(value) {
    const optionToSelect = this.options.find((option) => option.value === value)
    if (optionToSelect) {
      this.selectItem(optionToSelect)
    }
  }
  /**
   * Selects an option given the index of the option, and updates MdSelect's
   * value.
   */
  selectIndex(index) {
    const optionToSelect = this.options[index]
    if (optionToSelect) {
      this.selectItem(optionToSelect)
    }
  }
  /**
   * Reset the select to its default value.
   */
  reset() {
    for (const option of this.options) {
      option.selected = option.hasAttribute('selected')
    }
    this.updateValueAndDisplayText()
    this.nativeError = false
    this.nativeErrorText = ''
  }
  [((_a = VALUE), onReportValidity)](invalidEvent) {
    // Prevent default pop-up behavior.
    invalidEvent?.preventDefault()
    const prevMessage = this.getErrorText()
    this.nativeError = !!invalidEvent
    this.nativeErrorText = this.validationMessage
    if (prevMessage === this.getErrorText()) {
      this.field?.reannounceError()
    }
  }
  update(changed) {
    // In SSR the options will be ready to query, so try to figure out what
    // the value and display text should be.
    if (!this.hasUpdated) {
      this.initUserSelection()
    }
    // We have just opened the menu.
    // We are only able to check for the select's rect in `update()` instead of
    // having to wait for `updated()` because the menu can never be open on
    // first render since it is not settable and Lit SSR does not support click
    // events which would open the menu.
    if (this.prevOpen !== this.open && this.open) {
      const selectRect = this.getBoundingClientRect()
      this.selectWidth = selectRect.width
    }
    this.prevOpen = this.open
    super.update(changed)
  }
  render() {
    return html`
      <div class="wrapper ${this.color}">
        <span class="select ${classMap(this.getRenderClasses())}" @focusout=${this.handleFocusout}>
          ${this.renderField()} ${this.renderMenu()}
        </span>
      </div>
    `
  }
  async firstUpdated(changed) {
    await this.menu?.updateComplete
    // If this has been handled on update already due to SSR, try again.
    if (!this.lastSelectedOptionRecords.length) {
      this.initUserSelection()
    }
    // Case for when the DOM is streaming, there are no children, and a child
    // has [selected] set on it, we need to wait for DOM to render something.
    if (!this.lastSelectedOptionRecords.length && !isServer && !this.options.length) {
      setTimeout(() => {
        this.updateValueAndDisplayText()
      })
    }
    super.firstUpdated(changed)
  }
  getRenderClasses() {
    return {
      disabled: this.disabled,
      error: this.error,
      open: this.open,
    }
  }
  renderField() {
    return staticHtml`
      <md-field
          aria-haspopup="listbox"
          role="combobox"
          part="field"
          id="field"
          tabindex=${this.disabled ? '-1' : '0'}
          aria-label=${this.ariaLabel || nothing}
          aria-describedby="description"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="listbox"
          class="field"
          label=${this.label}
          .focused=${this.focused || this.open}
          .populated=${!!this.displayText}
          .disabled=${this.disabled}
          .required=${this.required}
          .error=${this.hasError}
          ?has-start=${this.hasLeadingIcon}
          has-end
          supporting-text=${this.supportingText}
          error-text=${this.getErrorText()}
          @keydown=${this.handleKeydown}
          @click=${this.handleClick}>
         ${this.renderFieldContent()}
         <div id="description" slot="aria-describedby"></div>
      </md-field>`
  }
  renderFieldContent() {
    return [this.renderLeadingIcon(), this.renderLabel(), this.renderTrailingIcon()]
  }
  renderLeadingIcon() {
    return html`
      <span class="icon leading" slot="start">
        <slot name="leading-icon" @slotchange=${this.handleIconChange}></slot>
      </span>
    `
  }
  renderTrailingIcon() {
    return html`
      <span class="icon trailing" slot="end">
        <slot name="trailing-icon" @slotchange=${this.handleIconChange}>
          <svg height="5" viewBox="7 10 10 5" focusable="false">
            <polygon class="down" stroke="none" fill-rule="evenodd" points="7 10 12 15 17 10"></polygon>
            <polygon class="up" stroke="none" fill-rule="evenodd" points="7 15 12 10 17 15"></polygon>
          </svg>
        </slot>
      </span>
    `
  }
  renderLabel() {
    // need to render &nbsp; so that line-height can apply and give it a
    // non-zero height
    return html`<div id="label">${this.displayText || html`&nbsp;`}</div>`
  }
  renderMenu() {
    const ariaLabel = this.label || this.ariaLabel
    return html`<div class="menu-wrapper">
      <md-menu
        id="listbox"
        .defaultFocus=${this.defaultFocus}
        role="listbox"
        tabindex="-1"
        aria-label=${ariaLabel || nothing}
        stay-open-on-focusout
        part="menu"
        exportparts="focus-ring: menu-focus-ring"
        anchor="field"
        style=${styleMap({
          '--__menu-min-width': `${this.selectWidth}px`,
          '--__menu-max-width': this.clampMenuWidth ? `${this.selectWidth}px` : undefined,
        })}
        no-navigation-wrap
        .open=${this.open}
        .quick=${this.quick}
        .positioning=${this.menuPositioning}
        .typeaheadDelay=${this.typeaheadDelay}
        .anchorCorner=${this.menuAlign === 'start' ? 'end-start' : 'end-end'}
        .menuCorner=${this.menuAlign === 'start' ? 'start-start' : 'start-end'}
        @opening=${this.handleOpening}
        @opened=${this.redispatchEvent}
        @closing=${this.redispatchEvent}
        @closed=${this.handleClosed}
        @close-menu=${this.handleCloseMenu}
        @request-selection=${this.handleRequestSelection}
        @request-deselection=${this.handleRequestDeselection}>
        ${this.renderMenuContent()}
      </md-menu>
    </div>`
  }
  renderMenuContent() {
    return html`<slot></slot>`
  }
  /**
   * Handles opening the select on keydown and typahead selection when the menu
   * is closed.
   */
  handleKeydown(event) {
    if (this.open || this.disabled || !this.menu) {
      return
    }
    const typeaheadController = this.menu.typeaheadController
    const isOpenKey =
      event.code === 'Space' ||
      event.code === 'ArrowDown' ||
      event.code === 'ArrowUp' ||
      event.code === 'End' ||
      event.code === 'Home' ||
      event.code === 'Enter'
    // Do not open if currently typing ahead because the user may be typing the
    // spacebar to match a word with a space
    if (!typeaheadController.isTypingAhead && isOpenKey) {
      event.preventDefault()
      this.open = true
      // https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/#kbd_label
      switch (event.code) {
        case 'Space':
        case 'ArrowDown':
        case 'Enter':
          // We will handle focusing last selected item in this.handleOpening()
          this.defaultFocus = FocusState.NONE
          break
        case 'End':
          this.defaultFocus = FocusState.LAST_ITEM
          break
        case 'ArrowUp':
        case 'Home':
          this.defaultFocus = FocusState.FIRST_ITEM
          break
        default:
          break
      }
      return
    }
    const isPrintableKey = event.key.length === 1
    // Handles typing ahead when the menu is closed by delegating the event to
    // the underlying menu's typeaheadController
    if (isPrintableKey) {
      typeaheadController.onKeydown(event)
      event.preventDefault()
      const { lastActiveRecord } = typeaheadController
      if (!lastActiveRecord) {
        return
      }
      this.labelEl?.setAttribute?.('aria-live', 'polite')
      const hasChanged = this.selectItem(lastActiveRecord[TYPEAHEAD_RECORD.ITEM])
      if (hasChanged) {
        this.dispatchInteractionEvents()
      }
    }
  }
  handleClick() {
    this.open = !this.open
  }
  handleFocus() {
    this.focused = true
  }
  handleBlur() {
    this.focused = false
  }
  /**
   * Handles closing the menu when the focus leaves the select's subtree.
   */
  handleFocusout(event) {
    // Don't close the menu if we are switching focus between menu,
    // select-option, and field
    if (event.relatedTarget && isElementInSubtree(event.relatedTarget, this)) {
      return
    }
    this.open = false
  }
  /**
   * Gets a list of all selected select options as a list item record array.
   *
   * @return An array of selected list option records.
   */
  getSelectedOptions() {
    if (!this.menu) {
      this.lastSelectedOptionRecords = []
      return null
    }
    const items = this.menu.items
    this.lastSelectedOptionRecords = getSelectedItems(items)
    return this.lastSelectedOptionRecords
  }
  async getUpdateComplete() {
    await this.menu?.updateComplete
    return super.getUpdateComplete()
  }
  /**
   * Gets the selected options from the DOM, and updates the value and display
   * text to the first selected option's value and headline respectively.
   *
   * @return Whether or not the selected option has changed since last update.
   */
  updateValueAndDisplayText() {
    const selectedOptions = this.getSelectedOptions() ?? []
    // Used to determine whether or not we need to fire an input / change event
    // which fire whenever the option element changes (value or selectedIndex)
    // on user interaction.
    let hasSelectedOptionChanged = false
    if (selectedOptions.length) {
      const [firstSelectedOption] = selectedOptions[0]
      hasSelectedOptionChanged = this.lastSelectedOption !== firstSelectedOption
      this.lastSelectedOption = firstSelectedOption
      this[VALUE] = firstSelectedOption.value
      this.displayText = firstSelectedOption.displayText
    } else {
      hasSelectedOptionChanged = this.lastSelectedOption !== null
      this.lastSelectedOption = null
      this[VALUE] = ''
      this.displayText = ''
    }
    return hasSelectedOptionChanged
  }
  /**
   * Focuses and activates the last selected item upon opening, and resets other
   * active items.
   */
  async handleOpening(e) {
    this.labelEl?.removeAttribute?.('aria-live')
    this.redispatchEvent(e)
    // FocusState.NONE means we want to handle focus ourselves and focus the
    // last selected item.
    if (this.defaultFocus !== FocusState.NONE) {
      return
    }
    const items = this.menu.items
    const activeItem = getActiveItem(items)?.item
    let [selectedItem] = this.lastSelectedOptionRecords[0] ?? [null]
    // This is true if the user keys through the list but clicks out of the menu
    // thus no close-menu event is fired by an item and we can't clean up in
    // handleCloseMenu.
    if (activeItem && activeItem !== selectedItem) {
      activeItem.tabIndex = -1
    }
    // in the case that nothing is selected, focus the first item
    selectedItem = selectedItem ?? items[0]
    if (selectedItem) {
      selectedItem.tabIndex = 0
      selectedItem.focus()
    }
  }
  redispatchEvent(e) {
    redispatchEvent(this, e)
  }
  handleClosed(e) {
    this.open = false
    this.redispatchEvent(e)
  }
  /**
   * Determines the reason for closing, and updates the UI accordingly.
   */
  handleCloseMenu(event) {
    const reason = event.detail.reason
    const item = event.detail.itemPath[0]
    this.open = false
    let hasChanged = false
    if (reason.kind === 'click-selection') {
      hasChanged = this.selectItem(item)
    } else if (reason.kind === 'keydown' && isSelectableKey(reason.key)) {
      hasChanged = this.selectItem(item)
    } else {
      // This can happen on ESC being pressed
      item.tabIndex = -1
      item.blur()
    }
    // Dispatch interaction events since selection has been made via keyboard
    // or mouse.
    if (hasChanged) {
      this.dispatchInteractionEvents()
    }
  }
  /**
   * Selects a given option, deselects other options, and updates the UI.
   *
   * @return Whether the last selected option has changed.
   */
  selectItem(item) {
    const selectedOptions = this.getSelectedOptions() ?? []
    selectedOptions.forEach(([option]) => {
      if (item !== option) {
        option.selected = false
      }
    })
    item.selected = true
    return this.updateValueAndDisplayText()
  }
  /**
   * Handles updating selection when an option element requests selection via
   * property / attribute change.
   */
  handleRequestSelection(event) {
    const requestingOptionEl = event.target
    // No-op if this item is already selected.
    if (this.lastSelectedOptionRecords.some(([option]) => option === requestingOptionEl)) {
      return
    }
    this.selectItem(requestingOptionEl)
  }
  /**
   * Handles updating selection when an option element requests deselection via
   * property / attribute change.
   */
  handleRequestDeselection(event) {
    const requestingOptionEl = event.target
    // No-op if this item is not even in the list of tracked selected items.
    if (!this.lastSelectedOptionRecords.some(([option]) => option === requestingOptionEl)) {
      return
    }
    this.updateValueAndDisplayText()
  }
  /**
   * Attempts to initialize the selected option from user-settable values like
   * SSR, setting `value`, or `selectedIndex` at startup.
   */
  initUserSelection() {
    // User has set `.value` directly, but internals have not yet booted up.
    if (this.lastUserSetValue && !this.lastSelectedOptionRecords.length) {
      this.select(this.lastUserSetValue)
      // User has set `.selectedIndex` directly, but internals have not yet
      // booted up.
    } else if (this.lastUserSetSelectedIndex !== null && !this.lastSelectedOptionRecords.length) {
      this.selectIndex(this.lastUserSetSelectedIndex)
      // Regular boot up!
    } else {
      this.updateValueAndDisplayText()
    }
  }
  handleIconChange() {
    this.hasLeadingIcon = this.leadingIcons.length > 0
  }
  /**
   * Dispatches the `input` and `change` events.
   */
  dispatchInteractionEvents() {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    this.dispatchEvent(new Event('change', { bubbles: true }))
  }
  getErrorText() {
    return this.error ? this.errorText : this.nativeErrorText
  }
  [getFormValue]() {
    return this.value
  }
  formResetCallback() {
    this.reset()
  }
  formStateRestoreCallback(state) {
    this.value = state
  }
  click() {
    this.field?.click()
  }
  [createValidator]() {
    return new SelectValidator(() => this)
  }
  [getValidityAnchor]() {
    return this.field
  }

  get listItemRoot() {
    return this.renderRoot?.querySelector('.list-item')
  }
  get headlineElements() {
    // return this.renderRoot?.querySelectorAll('slot[name="headline"]')
    return queryAssignedElements(this, { slot: 'headline' })
  }
  get supportingTextElements() {
    // return this.renderRoot?.querySelectorAll('slot[name="supporting-text"]')
    return queryAssignedElements(this, { slot: 'supporting-text' })
  }
  get defaultElements() {
    // return this.renderRoot?.querySelector('slot').assignedElements({ flatten: true })
    return queryAssignedElements(this, { flatten: true })
  }

  get field() {
    return this.renderRoot?.querySelector('.field')
  }
  get menu() {
    return this.renderRoot?.querySelector('md-menu')
  }
  get labelEl() {
    return this.renderRoot?.querySelector('#label')
  }
  get leadingIcons() {
    // return this.renderRoot?.querySelector('slot[name="leading-icon"]').assignedElements({ flatten: true })
    return queryAssignedElements(this, { slot: 'leading-icon', flatten: true })
  }
  get trailingIcons() {
    return queryAssignedElements(this, { slot: 'trailing-icon', flatten: true })
  }

  static styles = [
    css`
      .wrapper {
        color: unset;
        min-width: 210px;
        display: flex;
      }
      .field {
        cursor: default;
        outline: none;
      }
      .select {
        position: relative;
        flex-direction: column;
      }
      .icon.trailing svg,
      .icon ::slotted(*) {
        fill: currentColor;
      }
      .icon ::slotted(*) {
        width: inherit;
        height: inherit;
        font-size: inherit;
      }
      .icon slot {
        display: flex;
        height: 100%;
        width: 100%;
        align-items: center;
        justify-content: center;
      }
      .icon.trailing :is(.up, .down) {
        opacity: 0;
        transition: opacity 75ms linear 75ms;
      }
      .select:not(.open) .down,
      .select.open .up {
        opacity: 1;
      }
      .field,
      .select,
      md-menu {
        min-width: inherit;
        width: inherit;
        max-width: inherit;
        display: flex;
      }
      md-menu {
        min-width: var(--__menu-min-width);
        max-width: var(--__menu-max-width, inherit);
      }
      .menu-wrapper {
        width: 0px;
        height: 0px;
        max-width: inherit;
      }
      md-menu ::slotted(:not[disabled]) {
        cursor: pointer;
      }
      .field,
      .select {
        width: 100%;
      }
      :host {
        display: inline-flex;
      }
      :host([disabled]) {
        pointer-events: none;
      }
    `,
    css`
      .wrapper.outlined {
        --_text-field-disabled-input-text-color: var(
          --md-outlined-select-text-field-disabled-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-input-text-opacity: var(
          --md-outlined-select-text-field-disabled-input-text-opacity,
          0.38
        );
        --_text-field-disabled-label-text-color: var(
          --md-outlined-select-text-field-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-label-text-opacity: var(
          --md-outlined-select-text-field-disabled-label-text-opacity,
          0.38
        );
        --_text-field-disabled-leading-icon-color: var(
          --md-outlined-select-text-field-disabled-leading-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-leading-icon-opacity: var(
          --md-outlined-select-text-field-disabled-leading-icon-opacity,
          0.38
        );
        --_text-field-disabled-outline-color: var(
          --md-outlined-select-text-field-disabled-outline-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-outline-opacity: var(--md-outlined-select-text-field-disabled-outline-opacity, 0.12);
        --_text-field-disabled-outline-width: var(--md-outlined-select-text-field-disabled-outline-width, 1px);
        --_text-field-disabled-supporting-text-color: var(
          --md-outlined-select-text-field-disabled-supporting-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-supporting-text-opacity: var(
          --md-outlined-select-text-field-disabled-supporting-text-opacity,
          0.38
        );
        --_text-field-disabled-trailing-icon-color: var(
          --md-outlined-select-text-field-disabled-trailing-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-trailing-icon-opacity: var(
          --md-outlined-select-text-field-disabled-trailing-icon-opacity,
          0.38
        );
        --_text-field-error-focus-input-text-color: var(
          --md-outlined-select-text-field-error-focus-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-error-focus-label-text-color: var(
          --md-outlined-select-text-field-error-focus-label-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-focus-leading-icon-color: var(
          --md-outlined-select-text-field-error-focus-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-error-focus-outline-color: var(
          --md-outlined-select-text-field-error-focus-outline-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-focus-supporting-text-color: var(
          --md-outlined-select-text-field-error-focus-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-focus-trailing-icon-color: var(
          --md-outlined-select-text-field-error-focus-trailing-icon-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-hover-input-text-color: var(
          --md-outlined-select-text-field-error-hover-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-error-hover-label-text-color: var(
          --md-outlined-select-text-field-error-hover-label-text-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_text-field-error-hover-leading-icon-color: var(
          --md-outlined-select-text-field-error-hover-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-error-hover-outline-color: var(
          --md-outlined-select-text-field-error-hover-outline-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_text-field-error-hover-supporting-text-color: var(
          --md-outlined-select-text-field-error-hover-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-hover-trailing-icon-color: var(
          --md-outlined-select-text-field-error-hover-trailing-icon-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_text-field-error-input-text-color: var(
          --md-outlined-select-text-field-error-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-error-label-text-color: var(
          --md-outlined-select-text-field-error-label-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-leading-icon-color: var(
          --md-outlined-select-text-field-error-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-error-outline-color: var(
          --md-outlined-select-text-field-error-outline-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-supporting-text-color: var(
          --md-outlined-select-text-field-error-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-trailing-icon-color: var(
          --md-outlined-select-text-field-error-trailing-icon-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-focus-input-text-color: var(
          --md-outlined-select-text-field-focus-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-focus-label-text-color: var(
          --md-outlined-select-text-field-focus-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_text-field-focus-leading-icon-color: var(
          --md-outlined-select-text-field-focus-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-focus-outline-color: var(
          --md-outlined-select-text-field-focus-outline-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_text-field-focus-outline-width: var(--md-outlined-select-text-field-focus-outline-width, 3px);
        --_text-field-focus-supporting-text-color: var(
          --md-outlined-select-text-field-focus-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-focus-trailing-icon-color: var(
          --md-outlined-select-text-field-focus-trailing-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_text-field-hover-input-text-color: var(
          --md-outlined-select-text-field-hover-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-hover-label-text-color: var(
          --md-outlined-select-text-field-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-hover-leading-icon-color: var(
          --md-outlined-select-text-field-hover-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-hover-outline-color: var(
          --md-outlined-select-text-field-hover-outline-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-hover-outline-width: var(--md-outlined-select-text-field-hover-outline-width, 1px);
        --_text-field-hover-supporting-text-color: var(
          --md-outlined-select-text-field-hover-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-hover-trailing-icon-color: var(
          --md-outlined-select-text-field-hover-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-input-text-color: var(
          --md-outlined-select-text-field-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-input-text-font: var(
          --md-outlined-select-text-field-input-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_text-field-input-text-line-height: var(
          --md-outlined-select-text-field-input-text-line-height,
          var(--md-sys-typescale-body-large-line-height, 1.5rem)
        );
        --_text-field-input-text-size: var(
          --md-outlined-select-text-field-input-text-size,
          var(--md-sys-typescale-body-large-size, 1rem)
        );
        --_text-field-input-text-weight: var(
          --md-outlined-select-text-field-input-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_text-field-label-text-color: var(
          --md-outlined-select-text-field-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-label-text-font: var(
          --md-outlined-select-text-field-label-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_text-field-label-text-line-height: var(
          --md-outlined-select-text-field-label-text-line-height,
          var(--md-sys-typescale-body-large-line-height, 1.5rem)
        );
        --_text-field-label-text-populated-line-height: var(
          --md-outlined-select-text-field-label-text-populated-line-height,
          var(--md-sys-typescale-body-small-line-height, 1rem)
        );
        --_text-field-label-text-populated-size: var(
          --md-outlined-select-text-field-label-text-populated-size,
          var(--md-sys-typescale-body-small-size, 0.75rem)
        );
        --_text-field-label-text-size: var(
          --md-outlined-select-text-field-label-text-size,
          var(--md-sys-typescale-body-large-size, 1rem)
        );
        --_text-field-label-text-weight: var(
          --md-outlined-select-text-field-label-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_text-field-leading-icon-color: var(
          --md-outlined-select-text-field-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-leading-icon-size: var(--md-outlined-select-text-field-leading-icon-size, 24px);
        --_text-field-outline-color: var(
          --md-outlined-select-text-field-outline-color,
          var(--md-sys-color-outline, #79747e)
        );
        --_text-field-outline-width: var(--md-outlined-select-text-field-outline-width, 1px);
        --_text-field-supporting-text-color: var(
          --md-outlined-select-text-field-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-supporting-text-font: var(
          --md-outlined-select-text-field-supporting-text-font,
          var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_text-field-supporting-text-line-height: var(
          --md-outlined-select-text-field-supporting-text-line-height,
          var(--md-sys-typescale-body-small-line-height, 1rem)
        );
        --_text-field-supporting-text-size: var(
          --md-outlined-select-text-field-supporting-text-size,
          var(--md-sys-typescale-body-small-size, 0.75rem)
        );
        --_text-field-supporting-text-weight: var(
          --md-outlined-select-text-field-supporting-text-weight,
          var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_text-field-trailing-icon-color: var(
          --md-outlined-select-text-field-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-trailing-icon-size: var(--md-outlined-select-text-field-trailing-icon-size, 24px);
        --_text-field-container-shape-start-start: var(
          --md-outlined-select-text-field-container-shape-start-start,
          var(--md-outlined-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_text-field-container-shape-start-end: var(
          --md-outlined-select-text-field-container-shape-start-end,
          var(--md-outlined-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_text-field-container-shape-end-end: var(
          --md-outlined-select-text-field-container-shape-end-end,
          var(--md-outlined-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_text-field-container-shape-end-start: var(
          --md-outlined-select-text-field-container-shape-end-start,
          var(--md-outlined-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --md-outlined-field-container-shape-end-end: var(--_text-field-container-shape-end-end);
        --md-outlined-field-container-shape-end-start: var(--_text-field-container-shape-end-start);
        --md-outlined-field-container-shape-start-end: var(--_text-field-container-shape-start-end);
        --md-outlined-field-container-shape-start-start: var(--_text-field-container-shape-start-start);
        --md-outlined-field-content-color: var(--_text-field-input-text-color);
        --md-outlined-field-content-font: var(--_text-field-input-text-font);
        --md-outlined-field-content-line-height: var(--_text-field-input-text-line-height);
        --md-outlined-field-content-size: var(--_text-field-input-text-size);
        --md-outlined-field-content-weight: var(--_text-field-input-text-weight);
        --md-outlined-field-disabled-content-color: var(--_text-field-disabled-input-text-color);
        --md-outlined-field-disabled-content-opacity: var(--_text-field-disabled-input-text-opacity);
        --md-outlined-field-disabled-label-text-color: var(--_text-field-disabled-label-text-color);
        --md-outlined-field-disabled-label-text-opacity: var(--_text-field-disabled-label-text-opacity);
        --md-outlined-field-disabled-leading-content-color: var(--_text-field-disabled-leading-icon-color);
        --md-outlined-field-disabled-leading-content-opacity: var(--_text-field-disabled-leading-icon-opacity);
        --md-outlined-field-disabled-outline-color: var(--_text-field-disabled-outline-color);
        --md-outlined-field-disabled-outline-opacity: var(--_text-field-disabled-outline-opacity);
        --md-outlined-field-disabled-outline-width: var(--_text-field-disabled-outline-width);
        --md-outlined-field-disabled-supporting-text-color: var(--_text-field-disabled-supporting-text-color);
        --md-outlined-field-disabled-supporting-text-opacity: var(--_text-field-disabled-supporting-text-opacity);
        --md-outlined-field-disabled-trailing-content-color: var(--_text-field-disabled-trailing-icon-color);
        --md-outlined-field-disabled-trailing-content-opacity: var(--_text-field-disabled-trailing-icon-opacity);
        --md-outlined-field-error-content-color: var(--_text-field-error-input-text-color);
        --md-outlined-field-error-focus-content-color: var(--_text-field-error-focus-input-text-color);
        --md-outlined-field-error-focus-label-text-color: var(--_text-field-error-focus-label-text-color);
        --md-outlined-field-error-focus-leading-content-color: var(--_text-field-error-focus-leading-icon-color);
        --md-outlined-field-error-focus-outline-color: var(--_text-field-error-focus-outline-color);
        --md-outlined-field-error-focus-supporting-text-color: var(--_text-field-error-focus-supporting-text-color);
        --md-outlined-field-error-focus-trailing-content-color: var(--_text-field-error-focus-trailing-icon-color);
        --md-outlined-field-error-hover-content-color: var(--_text-field-error-hover-input-text-color);
        --md-outlined-field-error-hover-label-text-color: var(--_text-field-error-hover-label-text-color);
        --md-outlined-field-error-hover-leading-content-color: var(--_text-field-error-hover-leading-icon-color);
        --md-outlined-field-error-hover-outline-color: var(--_text-field-error-hover-outline-color);
        --md-outlined-field-error-hover-supporting-text-color: var(--_text-field-error-hover-supporting-text-color);
        --md-outlined-field-error-hover-trailing-content-color: var(--_text-field-error-hover-trailing-icon-color);
        --md-outlined-field-error-label-text-color: var(--_text-field-error-label-text-color);
        --md-outlined-field-error-leading-content-color: var(--_text-field-error-leading-icon-color);
        --md-outlined-field-error-outline-color: var(--_text-field-error-outline-color);
        --md-outlined-field-error-supporting-text-color: var(--_text-field-error-supporting-text-color);
        --md-outlined-field-error-trailing-content-color: var(--_text-field-error-trailing-icon-color);
        --md-outlined-field-focus-content-color: var(--_text-field-focus-input-text-color);
        --md-outlined-field-focus-label-text-color: var(--_text-field-focus-label-text-color);
        --md-outlined-field-focus-leading-content-color: var(--_text-field-focus-leading-icon-color);
        --md-outlined-field-focus-outline-color: var(--_text-field-focus-outline-color);
        --md-outlined-field-focus-outline-width: var(--_text-field-focus-outline-width);
        --md-outlined-field-focus-supporting-text-color: var(--_text-field-focus-supporting-text-color);
        --md-outlined-field-focus-trailing-content-color: var(--_text-field-focus-trailing-icon-color);
        --md-outlined-field-hover-content-color: var(--_text-field-hover-input-text-color);
        --md-outlined-field-hover-label-text-color: var(--_text-field-hover-label-text-color);
        --md-outlined-field-hover-leading-content-color: var(--_text-field-hover-leading-icon-color);
        --md-outlined-field-hover-outline-color: var(--_text-field-hover-outline-color);
        --md-outlined-field-hover-outline-width: var(--_text-field-hover-outline-width);
        --md-outlined-field-hover-supporting-text-color: var(--_text-field-hover-supporting-text-color);
        --md-outlined-field-hover-trailing-content-color: var(--_text-field-hover-trailing-icon-color);
        --md-outlined-field-label-text-color: var(--_text-field-label-text-color);
        --md-outlined-field-label-text-font: var(--_text-field-label-text-font);
        --md-outlined-field-label-text-line-height: var(--_text-field-label-text-line-height);
        --md-outlined-field-label-text-populated-line-height: var(--_text-field-label-text-populated-line-height);
        --md-outlined-field-label-text-populated-size: var(--_text-field-label-text-populated-size);
        --md-outlined-field-label-text-size: var(--_text-field-label-text-size);
        --md-outlined-field-label-text-weight: var(--_text-field-label-text-weight);
        --md-outlined-field-leading-content-color: var(--_text-field-leading-icon-color);
        --md-outlined-field-outline-color: var(--_text-field-outline-color);
        --md-outlined-field-outline-width: var(--_text-field-outline-width);
        --md-outlined-field-supporting-text-color: var(--_text-field-supporting-text-color);
        --md-outlined-field-supporting-text-font: var(--_text-field-supporting-text-font);
        --md-outlined-field-supporting-text-line-height: var(--_text-field-supporting-text-line-height);
        --md-outlined-field-supporting-text-size: var(--_text-field-supporting-text-size);
        --md-outlined-field-supporting-text-weight: var(--_text-field-supporting-text-weight);
        --md-outlined-field-trailing-content-color: var(--_text-field-trailing-icon-color);
      }
      [has-start] .icon.leading {
        font-size: var(--_text-field-leading-icon-size);
        height: var(--_text-field-leading-icon-size);
        width: var(--_text-field-leading-icon-size);
      }
      .icon.trailing {
        font-size: var(--_text-field-trailing-icon-size);
        height: var(--_text-field-trailing-icon-size);
        width: var(--_text-field-trailing-icon-size);
      }
    `,
    css`
      .wrapper.filled {
        --_text-field-active-indicator-color: var(
          --md-filled-select-text-field-active-indicator-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-active-indicator-height: var(--md-filled-select-text-field-active-indicator-height, 1px);
        --_text-field-container-color: var(
          --md-filled-select-text-field-container-color,
          var(--md-sys-color-surface-container-highest, #e6e0e9)
        );
        --_text-field-disabled-active-indicator-color: var(
          --md-filled-select-text-field-disabled-active-indicator-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-active-indicator-height: var(
          --md-filled-select-text-field-disabled-active-indicator-height,
          1px
        );
        --_text-field-disabled-active-indicator-opacity: var(
          --md-filled-select-text-field-disabled-active-indicator-opacity,
          0.38
        );
        --_text-field-disabled-container-color: var(
          --md-filled-select-text-field-disabled-container-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-container-opacity: var(--md-filled-select-text-field-disabled-container-opacity, 0.04);
        --_text-field-disabled-input-text-color: var(
          --md-filled-select-text-field-disabled-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-input-text-opacity: var(--md-filled-select-text-field-disabled-input-text-opacity, 0.38);
        --_text-field-disabled-label-text-color: var(
          --md-filled-select-text-field-disabled-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-label-text-opacity: var(--md-filled-select-text-field-disabled-label-text-opacity, 0.38);
        --_text-field-disabled-leading-icon-color: var(
          --md-filled-select-text-field-disabled-leading-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-leading-icon-opacity: var(
          --md-filled-select-text-field-disabled-leading-icon-opacity,
          0.38
        );
        --_text-field-disabled-supporting-text-color: var(
          --md-filled-select-text-field-disabled-supporting-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-supporting-text-opacity: var(
          --md-filled-select-text-field-disabled-supporting-text-opacity,
          0.38
        );
        --_text-field-disabled-trailing-icon-color: var(
          --md-filled-select-text-field-disabled-trailing-icon-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-disabled-trailing-icon-opacity: var(
          --md-filled-select-text-field-disabled-trailing-icon-opacity,
          0.38
        );
        --_text-field-error-active-indicator-color: var(
          --md-filled-select-text-field-error-active-indicator-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-focus-active-indicator-color: var(
          --md-filled-select-text-field-error-focus-active-indicator-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-focus-input-text-color: var(
          --md-filled-select-text-field-error-focus-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-error-focus-label-text-color: var(
          --md-filled-select-text-field-error-focus-label-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-focus-leading-icon-color: var(
          --md-filled-select-text-field-error-focus-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-error-focus-supporting-text-color: var(
          --md-filled-select-text-field-error-focus-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-focus-trailing-icon-color: var(
          --md-filled-select-text-field-error-focus-trailing-icon-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-hover-active-indicator-color: var(
          --md-filled-select-text-field-error-hover-active-indicator-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_text-field-error-hover-input-text-color: var(
          --md-filled-select-text-field-error-hover-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-error-hover-label-text-color: var(
          --md-filled-select-text-field-error-hover-label-text-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_text-field-error-hover-leading-icon-color: var(
          --md-filled-select-text-field-error-hover-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-error-hover-state-layer-color: var(
          --md-filled-select-text-field-error-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-error-hover-state-layer-opacity: var(
          --md-filled-select-text-field-error-hover-state-layer-opacity,
          0.08
        );
        --_text-field-error-hover-supporting-text-color: var(
          --md-filled-select-text-field-error-hover-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-hover-trailing-icon-color: var(
          --md-filled-select-text-field-error-hover-trailing-icon-color,
          var(--md-sys-color-on-error-container, #410e0b)
        );
        --_text-field-error-input-text-color: var(
          --md-filled-select-text-field-error-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-error-label-text-color: var(
          --md-filled-select-text-field-error-label-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-leading-icon-color: var(
          --md-filled-select-text-field-error-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-error-supporting-text-color: var(
          --md-filled-select-text-field-error-supporting-text-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-error-trailing-icon-color: var(
          --md-filled-select-text-field-error-trailing-icon-color,
          var(--md-sys-color-error, #b3261e)
        );
        --_text-field-focus-active-indicator-color: var(
          --md-filled-select-text-field-focus-active-indicator-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_text-field-focus-active-indicator-height: var(
          --md-filled-select-text-field-focus-active-indicator-height,
          3px
        );
        --_text-field-focus-input-text-color: var(
          --md-filled-select-text-field-focus-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-focus-label-text-color: var(
          --md-filled-select-text-field-focus-label-text-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_text-field-focus-leading-icon-color: var(
          --md-filled-select-text-field-focus-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-focus-supporting-text-color: var(
          --md-filled-select-text-field-focus-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-focus-trailing-icon-color: var(
          --md-filled-select-text-field-focus-trailing-icon-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_text-field-hover-active-indicator-color: var(
          --md-filled-select-text-field-hover-active-indicator-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-hover-active-indicator-height: var(
          --md-filled-select-text-field-hover-active-indicator-height,
          1px
        );
        --_text-field-hover-input-text-color: var(
          --md-filled-select-text-field-hover-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-hover-label-text-color: var(
          --md-filled-select-text-field-hover-label-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-hover-leading-icon-color: var(
          --md-filled-select-text-field-hover-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-hover-state-layer-color: var(
          --md-filled-select-text-field-hover-state-layer-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-hover-state-layer-opacity: var(--md-filled-select-text-field-hover-state-layer-opacity, 0.08);
        --_text-field-hover-supporting-text-color: var(
          --md-filled-select-text-field-hover-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-hover-trailing-icon-color: var(
          --md-filled-select-text-field-hover-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-input-text-color: var(
          --md-filled-select-text-field-input-text-color,
          var(--md-sys-color-on-surface, #1d1b20)
        );
        --_text-field-input-text-font: var(
          --md-filled-select-text-field-input-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_text-field-input-text-line-height: var(
          --md-filled-select-text-field-input-text-line-height,
          var(--md-sys-typescale-body-large-line-height, 1.5rem)
        );
        --_text-field-input-text-size: var(
          --md-filled-select-text-field-input-text-size,
          var(--md-sys-typescale-body-large-size, 1rem)
        );
        --_text-field-input-text-weight: var(
          --md-filled-select-text-field-input-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_text-field-label-text-color: var(
          --md-filled-select-text-field-label-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-label-text-font: var(
          --md-filled-select-text-field-label-text-font,
          var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_text-field-label-text-line-height: var(
          --md-filled-select-text-field-label-text-line-height,
          var(--md-sys-typescale-body-large-line-height, 1.5rem)
        );
        --_text-field-label-text-populated-line-height: var(
          --md-filled-select-text-field-label-text-populated-line-height,
          var(--md-sys-typescale-body-small-line-height, 1rem)
        );
        --_text-field-label-text-populated-size: var(
          --md-filled-select-text-field-label-text-populated-size,
          var(--md-sys-typescale-body-small-size, 0.75rem)
        );
        --_text-field-label-text-size: var(
          --md-filled-select-text-field-label-text-size,
          var(--md-sys-typescale-body-large-size, 1rem)
        );
        --_text-field-label-text-weight: var(
          --md-filled-select-text-field-label-text-weight,
          var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_text-field-leading-icon-color: var(
          --md-filled-select-text-field-leading-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-leading-icon-size: var(--md-filled-select-text-field-leading-icon-size, 24px);
        --_text-field-supporting-text-color: var(
          --md-filled-select-text-field-supporting-text-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-supporting-text-font: var(
          --md-filled-select-text-field-supporting-text-font,
          var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto))
        );
        --_text-field-supporting-text-line-height: var(
          --md-filled-select-text-field-supporting-text-line-height,
          var(--md-sys-typescale-body-small-line-height, 1rem)
        );
        --_text-field-supporting-text-size: var(
          --md-filled-select-text-field-supporting-text-size,
          var(--md-sys-typescale-body-small-size, 0.75rem)
        );
        --_text-field-supporting-text-weight: var(
          --md-filled-select-text-field-supporting-text-weight,
          var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        --_text-field-trailing-icon-color: var(
          --md-filled-select-text-field-trailing-icon-color,
          var(--md-sys-color-on-surface-variant, #49454f)
        );
        --_text-field-trailing-icon-size: var(--md-filled-select-text-field-trailing-icon-size, 24px);
        --_text-field-container-shape-start-start: var(
          --md-filled-select-text-field-container-shape-start-start,
          var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_text-field-container-shape-start-end: var(
          --md-filled-select-text-field-container-shape-start-end,
          var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
        );
        --_text-field-container-shape-end-end: var(
          --md-filled-select-text-field-container-shape-end-end,
          var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --_text-field-container-shape-end-start: var(
          --md-filled-select-text-field-container-shape-end-start,
          var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-none, 0px))
        );
        --md-filled-field-active-indicator-color: var(--_text-field-active-indicator-color);
        --md-filled-field-active-indicator-height: var(--_text-field-active-indicator-height);
        --md-filled-field-container-color: var(--_text-field-container-color);
        --md-filled-field-container-shape-end-end: var(--_text-field-container-shape-end-end);
        --md-filled-field-container-shape-end-start: var(--_text-field-container-shape-end-start);
        --md-filled-field-container-shape-start-end: var(--_text-field-container-shape-start-end);
        --md-filled-field-container-shape-start-start: var(--_text-field-container-shape-start-start);
        --md-filled-field-content-color: var(--_text-field-input-text-color);
        --md-filled-field-content-font: var(--_text-field-input-text-font);
        --md-filled-field-content-line-height: var(--_text-field-input-text-line-height);
        --md-filled-field-content-size: var(--_text-field-input-text-size);
        --md-filled-field-content-weight: var(--_text-field-input-text-weight);
        --md-filled-field-disabled-active-indicator-color: var(--_text-field-disabled-active-indicator-color);
        --md-filled-field-disabled-active-indicator-height: var(--_text-field-disabled-active-indicator-height);
        --md-filled-field-disabled-active-indicator-opacity: var(--_text-field-disabled-active-indicator-opacity);
        --md-filled-field-disabled-container-color: var(--_text-field-disabled-container-color);
        --md-filled-field-disabled-container-opacity: var(--_text-field-disabled-container-opacity);
        --md-filled-field-disabled-content-color: var(--_text-field-disabled-input-text-color);
        --md-filled-field-disabled-content-opacity: var(--_text-field-disabled-input-text-opacity);
        --md-filled-field-disabled-label-text-color: var(--_text-field-disabled-label-text-color);
        --md-filled-field-disabled-label-text-opacity: var(--_text-field-disabled-label-text-opacity);
        --md-filled-field-disabled-leading-content-color: var(--_text-field-disabled-leading-icon-color);
        --md-filled-field-disabled-leading-content-opacity: var(--_text-field-disabled-leading-icon-opacity);
        --md-filled-field-disabled-supporting-text-color: var(--_text-field-disabled-supporting-text-color);
        --md-filled-field-disabled-supporting-text-opacity: var(--_text-field-disabled-supporting-text-opacity);
        --md-filled-field-disabled-trailing-content-color: var(--_text-field-disabled-trailing-icon-color);
        --md-filled-field-disabled-trailing-content-opacity: var(--_text-field-disabled-trailing-icon-opacity);
        --md-filled-field-error-active-indicator-color: var(--_text-field-error-active-indicator-color);
        --md-filled-field-error-content-color: var(--_text-field-error-input-text-color);
        --md-filled-field-error-focus-active-indicator-color: var(--_text-field-error-focus-active-indicator-color);
        --md-filled-field-error-focus-content-color: var(--_text-field-error-focus-input-text-color);
        --md-filled-field-error-focus-label-text-color: var(--_text-field-error-focus-label-text-color);
        --md-filled-field-error-focus-leading-content-color: var(--_text-field-error-focus-leading-icon-color);
        --md-filled-field-error-focus-supporting-text-color: var(--_text-field-error-focus-supporting-text-color);
        --md-filled-field-error-focus-trailing-content-color: var(--_text-field-error-focus-trailing-icon-color);
        --md-filled-field-error-hover-active-indicator-color: var(--_text-field-error-hover-active-indicator-color);
        --md-filled-field-error-hover-content-color: var(--_text-field-error-hover-input-text-color);
        --md-filled-field-error-hover-label-text-color: var(--_text-field-error-hover-label-text-color);
        --md-filled-field-error-hover-leading-content-color: var(--_text-field-error-hover-leading-icon-color);
        --md-filled-field-error-hover-state-layer-color: var(--_text-field-error-hover-state-layer-color);
        --md-filled-field-error-hover-state-layer-opacity: var(--_text-field-error-hover-state-layer-opacity);
        --md-filled-field-error-hover-supporting-text-color: var(--_text-field-error-hover-supporting-text-color);
        --md-filled-field-error-hover-trailing-content-color: var(--_text-field-error-hover-trailing-icon-color);
        --md-filled-field-error-label-text-color: var(--_text-field-error-label-text-color);
        --md-filled-field-error-leading-content-color: var(--_text-field-error-leading-icon-color);
        --md-filled-field-error-supporting-text-color: var(--_text-field-error-supporting-text-color);
        --md-filled-field-error-trailing-content-color: var(--_text-field-error-trailing-icon-color);
        --md-filled-field-focus-active-indicator-color: var(--_text-field-focus-active-indicator-color);
        --md-filled-field-focus-active-indicator-height: var(--_text-field-focus-active-indicator-height);
        --md-filled-field-focus-content-color: var(--_text-field-focus-input-text-color);
        --md-filled-field-focus-label-text-color: var(--_text-field-focus-label-text-color);
        --md-filled-field-focus-leading-content-color: var(--_text-field-focus-leading-icon-color);
        --md-filled-field-focus-supporting-text-color: var(--_text-field-focus-supporting-text-color);
        --md-filled-field-focus-trailing-content-color: var(--_text-field-focus-trailing-icon-color);
        --md-filled-field-hover-active-indicator-color: var(--_text-field-hover-active-indicator-color);
        --md-filled-field-hover-active-indicator-height: var(--_text-field-hover-active-indicator-height);
        --md-filled-field-hover-content-color: var(--_text-field-hover-input-text-color);
        --md-filled-field-hover-label-text-color: var(--_text-field-hover-label-text-color);
        --md-filled-field-hover-leading-content-color: var(--_text-field-hover-leading-icon-color);
        --md-filled-field-hover-state-layer-color: var(--_text-field-hover-state-layer-color);
        --md-filled-field-hover-state-layer-opacity: var(--_text-field-hover-state-layer-opacity);
        --md-filled-field-hover-supporting-text-color: var(--_text-field-hover-supporting-text-color);
        --md-filled-field-hover-trailing-content-color: var(--_text-field-hover-trailing-icon-color);
        --md-filled-field-label-text-color: var(--_text-field-label-text-color);
        --md-filled-field-label-text-font: var(--_text-field-label-text-font);
        --md-filled-field-label-text-line-height: var(--_text-field-label-text-line-height);
        --md-filled-field-label-text-populated-line-height: var(--_text-field-label-text-populated-line-height);
        --md-filled-field-label-text-populated-size: var(--_text-field-label-text-populated-size);
        --md-filled-field-label-text-size: var(--_text-field-label-text-size);
        --md-filled-field-label-text-weight: var(--_text-field-label-text-weight);
        --md-filled-field-leading-content-color: var(--_text-field-leading-icon-color);
        --md-filled-field-supporting-text-color: var(--_text-field-supporting-text-color);
        --md-filled-field-supporting-text-font: var(--_text-field-supporting-text-font);
        --md-filled-field-supporting-text-line-height: var(--_text-field-supporting-text-line-height);
        --md-filled-field-supporting-text-size: var(--_text-field-supporting-text-size);
        --md-filled-field-supporting-text-weight: var(--_text-field-supporting-text-weight);
        --md-filled-field-trailing-content-color: var(--_text-field-trailing-icon-color);
      }
      [has-start] .icon.leading {
        font-size: var(--_text-field-leading-icon-size);
        height: var(--_text-field-leading-icon-size);
        width: var(--_text-field-leading-icon-size);
      }
      .icon.trailing {
        font-size: var(--_text-field-trailing-icon-size);
        height: var(--_text-field-trailing-icon-size);
        width: var(--_text-field-trailing-icon-size);
      }
    `,
  ]
}
;(() => {
  requestUpdateOnAriaChange(Select)
})()
/** @nocollapse */
Select.shadowRootOptions = {
  ...LitElement.shadowRootOptions,
  delegatesFocus: true,
}

/*
_decorate([
    property({ type: Boolean })
], Select.prototype, "quick", void 0);
__decorate([
    property({ type: Boolean })
], Select.prototype, "required", void 0);
__decorate([
    property({ type: String, attribute: 'error-text' })
], Select.prototype, "errorText", void 0);
__decorate([
    property()
], Select.prototype, "label", void 0);
__decorate([
    property({ type: String, attribute: 'supporting-text' })
], Select.prototype, "supportingText", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], Select.prototype, "error", void 0);
__decorate([
    property({ attribute: 'menu-positioning' })
], Select.prototype, "menuPositioning", void 0);
__decorate([
    property({ type: Boolean, attribute: 'clamp-menu-width' })
], Select.prototype, "clampMenuWidth", void 0);
__decorate([
    property({ type: Number, attribute: 'typeahead-delay' })
], Select.prototype, "typeaheadDelay", void 0);
__decorate([
    property({ type: Boolean, attribute: 'has-leading-icon' })
], Select.prototype, "hasLeadingIcon", void 0);
__decorate([
    property({ attribute: 'display-text' })
], Select.prototype, "displayText", void 0);
__decorate([
    property({ attribute: 'menu-align' })
], Select.prototype, "menuAlign", void 0);
__decorate([
    property()
], Select.prototype, "value", null);
__decorate([
    property({ type: Number, attribute: 'selected-index' })
], Select.prototype, "selectedIndex", null);
__decorate([
    state()
], Select.prototype, "nativeError", void 0);
__decorate([
    state()
], Select.prototype, "nativeErrorText", void 0);
__decorate([
    state()
], Select.prototype, "focused", void 0);
__decorate([
    state()
], Select.prototype, "open", void 0);
__decorate([
    state()
], Select.prototype, "defaultFocus", void 0);
__decorate([
    query('.field')
], Select.prototype, "field", void 0);
__decorate([
    query('md-menu')
], Select.prototype, "menu", void 0);
__decorate([
    query('#label')
], Select.prototype, "labelEl", void 0);
__decorate([
    queryAssignedElements({ slot: 'leading-icon', flatten: true })
], Select.prototype, "leadingIcons", void 0);
*/

customElements.define('md-select', Select)
