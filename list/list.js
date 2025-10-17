import { html, isServer, LitElement, css } from 'lit'
import { ListController, NavigableKeys } from './internal/list-controller.js'
const NAVIGABLE_KEY_SET = new Set(Object.values(NavigableKeys))
// tslint:disable-next-line:enforce-comments-on-exported-symbols
export class List extends LitElement {
  /** @export */
  get items() {
    return this.listController.items
  }
  constructor() {
    super()
    this.listController = new ListController({
      isItem: (item) => item.hasAttribute('md-list-item'),
      getPossibleItems: () => this.slotItems,
      isRtl: () => getComputedStyle(this).direction === 'rtl',
      deactivateItem: (item) => {
        item.tabIndex = -1
      },
      activateItem: (item) => {
        item.tabIndex = 0
      },
      isNavigableKey: (key) => NAVIGABLE_KEY_SET.has(key),
      isActivatable: (item) => !item.disabled && item.type !== 'text',
    })
    this.internals =
      // Cast needed for closure
      this.attachInternals()
    if (!isServer) {
      this.internals.role = 'list'
      this.addEventListener('keydown', this.listController.handleKeydown)
    }
  }
  render() {
    return html`
      <slot
        @deactivate-items=${this.listController.onDeactivateItems}
        @request-activation=${this.listController.onRequestActivation}
        @slotchange=${this.listController.onSlotchange}>
      </slot>
    `
  }
  /**
   * Activates the next item in the list. If at the end of the list, the first
   * item will be activated.
   *
   * @return The activated list item or `null` if there are no items.
   */
  activateNextItem() {
    return this.listController.activateNextItem()
  }
  /**
   * Activates the previous item in the list. If at the start of the list, the
   * last item will be activated.
   *
   * @return The activated list item or `null` if there are no items.
   */
  activatePreviousItem() {
    return this.listController.activatePreviousItem()
  }

  get slotItems() {
    let slots = this.renderRoot.querySelector('slot')
    return slots.assignedElements({ flatten: true })
  }

  static styles = [
    css`
      :host {
        background: var(--md-list-container-color, var(--md-sys-color-surface, #fef7ff));
        color: unset;
        display: flex;
        flex-direction: column;
        outline: none;
        padding: 8px 0;
        position: relative;
      }
    `,
  ]
}
customElements.define('md-list', List)
