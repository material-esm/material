/**
 * An item layout component that can be used inside list items to give them
 * their customizable structure.
 *
 * `<md-item>` does not have any functionality, which must be added by the
 * component using it.
 *
 * All text will wrap unless `white-space: nowrap` is set on the item or any of
 * its children.
 *
 * Slots available:
 * - `<default>`: The headline, or custom content.
 * - `headline`: The first line.
 * - `supporting-text`: Supporting text lines underneath the headline.
 * - `trailing-supporting-text`: A small text snippet at the end of the item.
 * - `start`: Any leading content, such as icons, avatars, or checkboxes.
 * - `end`: Any trailing content, such as icons and buttons.
 * - `container`: Background container content, intended for adding additional
 *     styles, such as ripples or focus rings.
 *
 * @example
 * ```html
 * <md-item>Single line</md-item>
 *
 * <md-item>
 *   <div class="custom-content">...</div>
 * </md-item>
 *
 * <!-- Classic 1 to 3+ line list items -->
 * <md-item>
 *   <md-icon slot="start">image</md-icon>
 *   <div slot="overline">Overline</div>
 *   <div slot="headline">Headline</div>
 *   <div="supporting-text">Supporting text</div>
 *   <div="trailing-supporting-text">Trailing</div>
 *   <md-icon slot="end">image</md-icon>
 * </md-item>
 * ```
 *
 * When wrapping `<md-item>`, forward the available slots to use the same slot
 * structure for the wrapping component (this is what `<md-list-item>` does).
 *
 * @example
 * ```html
 * <md-item>
 *   <slot></slot>
 *   <slot name="overline" slot="overline"></slot>
 *   <slot name="headline" slot="headline"></slot>
 *   <slot name="supporting-text" slot="supporting-text"></slot>
 *   <slot name="trailing-supporting-text"
 *       slot="trailing-supporting-text"></slot>
 *   <slot name="start" slot="start"></slot>
 *   <slot name="end" slot="end"></slot>
 * </md-item>
 * ```
 *
 * @final
 * @suppress {visibility}
 */

import { css, LitElement, html } from 'lit'

export class MdItem extends LitElement {
  static properties = {
    multiline: { type: Boolean, reflect: true },
  }
  constructor() {
    super(...arguments)
    /**
     * Only needed for SSR.
     *
     * Add this attribute when an item has two lines to avoid a Flash Of Unstyled
     * Content. This attribute is not needed for single line items or items with
     * three or more lines.
     */
    this.multiline = false
  }
  render() {
    return html`
      <slot name="container"></slot>
      <slot class="non-text" name="start"></slot>
      <div class="text">
        <slot name="overline" @slotchange=${this.handleTextSlotChange}></slot>
        <slot class="default-slot" @slotchange=${this.handleTextSlotChange}></slot>
        <slot name="headline" @slotchange=${this.handleTextSlotChange}></slot>
        <slot name="supporting-text" @slotchange=${this.handleTextSlotChange}></slot>
      </div>
      <slot class="non-text" name="trailing-supporting-text"></slot>
      <slot class="non-text" name="end"></slot>
    `
  }
  handleTextSlotChange() {
    // Check if there's more than one text slot with content. If so, the item is
    // multiline, which has a different min-height than single line items.
    let isMultiline = false
    let slotsWithContent = 0
    for (const slot of this.textSlots) {
      if (slotHasContent(slot)) {
        slotsWithContent += 1
      }
      if (slotsWithContent > 1) {
        isMultiline = true
        break
      }
    }
    this.multiline = isMultiline
  }

  /*
    // __decorate([
//     queryAll('.text slot')
// ], Item.prototype, "textSlots", void 0);
*/
  get textSlots() {
    return this.renderRoot.querySelectorAll('.text slot')
  }

  static styles = [
    css`
      :host {
        color: var(--md-sys-color-on-surface, #1d1b20);
        font-family: var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto));
        font-size: var(--md-sys-typescale-body-large-size, 1rem);
        font-weight: var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400));
        line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
        align-items: center;
        box-sizing: border-box;
        display: flex;
        gap: 16px;
        min-height: 56px;
        overflow: hidden;
        padding: 12px 16px;
        position: relative;
        text-overflow: ellipsis;
      }
      :host([multiline]) {
        min-height: 72px;
      }
      [name='overline'] {
        color: var(--md-sys-color-on-surface-variant, #49454f);
        font-family: var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto));
        font-size: var(--md-sys-typescale-label-small-size, 0.6875rem);
        font-weight: var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500));
        line-height: var(--md-sys-typescale-label-small-line-height, 1rem);
      }
      [name='supporting-text'] {
        color: var(--md-sys-color-on-surface-variant, #49454f);
        font-family: var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto));
        font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
        font-weight: var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400));
        line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
      }
      [name='trailing-supporting-text'] {
        color: var(--md-sys-color-on-surface-variant, #49454f);
        font-family: var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto));
        font-size: var(--md-sys-typescale-label-small-size, 0.6875rem);
        font-weight: var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500));
        line-height: var(--md-sys-typescale-label-small-line-height, 1rem);
      }
      [name='container']::slotted(*) {
        inset: 0;
        position: absolute;
      }
      .default-slot {
        display: inline;
      }
      .default-slot,
      .text ::slotted(*) {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .text {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
      }
    `,
  ]
}

function slotHasContent(slot) {
  for (const node of slot.assignedNodes({ flatten: true })) {
    // Assume there's content if there's an element slotted in
    const isElement = node.nodeType === Node.ELEMENT_NODE
    // If there's only text nodes for the default slot, check if there's
    // non-whitespace.
    const isTextWithContent = node.nodeType === Node.TEXT_NODE && node.textContent?.match(/\S/)
    if (isElement || isTextWithContent) {
      return true
    }
  }
  return false
}

customElements.define('md-item', MdItem)
