import { html, LitElement, css } from 'lit'

/**
 * A Material 3 Button Group layout component.
 *
 * Supports standard (8px gap) and connected (2px gap, merged inner radii, single/multi-select) variants.
 *
 * https://m3.material.io/components/button-groups/overview
 *
 * @fires change {CustomEvent<{button: Button, selected: boolean, value: string|string[], selectedIndex: number}>}
 * Dispatched when the selection changes within the button group.
 */
export class ButtonGroup extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      flex-direction: row;
      vertical-align: middle;
      align-items: center;
    }

    /* Standard group adds 8px gap between buttons */
    :host(:not([connected])) {
      gap: 8px; /* M3 standard button group gap */
    }

    /* Connected group adds 2px gap per M3 spec */
    :host([connected]) {
      gap: var(--md-button-group-connected-gap, 2px);
      --_inner-radius: 8px;
      --_outer-radius: 24px;
    }

    /* Connected buttons expand to share container width equally */
    :host([connected]) ::slotted(*) {
      flex: 1 1 0%;
    }

    /* Inner and outer corner sizes by button group size */
    :host([connected][size='extra-small']) {
      --_inner-radius: 4px;
      --_outer-radius: 16px;
    }
    :host([connected][size='small']) {
      --_inner-radius: 8px;
      --_outer-radius: 20px;
    }
    :host([connected][size='medium']) {
      --_inner-radius: 8px;
      --_outer-radius: 28px;
    }
    :host([connected][size='large']) {
      --_inner-radius: 16px;
      --_outer-radius: 48px;
    }
    :host([connected][size='extra-large']) {
      --_inner-radius: 20px;
      --_outer-radius: 68px;
    }

    /* Also support child size attributes */
    :host([connected]) ::slotted([size='extra-small']) {
      --_inner-radius: 4px;
      --_outer-radius: 16px;
    }
    :host([connected]) ::slotted([size='small']) {
      --_inner-radius: 8px;
      --_outer-radius: 20px;
    }
    :host([connected]) ::slotted([size='medium']) {
      --_inner-radius: 8px;
      --_outer-radius: 28px;
    }
    :host([connected]) ::slotted([size='large']) {
      --_inner-radius: 16px;
      --_outer-radius: 48px;
    }
    :host([connected]) ::slotted([size='extra-large']) {
      --_inner-radius: 20px;
      --_outer-radius: 68px;
    }

    /* Square shapes */
    :host([connected][shape='square']),
    :host([connected]) ::slotted([shape='square']) {
      --_outer-radius: 16px;
    }
    :host([connected][shape='square'][size='extra-small']),
    :host([connected]) ::slotted([shape='square'][size='extra-small']),
    :host([connected][shape='square'][size='small']),
    :host([connected]) ::slotted([shape='square'][size='small']) {
      --_outer-radius: 12px;
    }
    :host([connected][shape='square'][size='large']),
    :host([connected]) ::slotted([shape='square'][size='large']),
    :host([connected][shape='square'][size='extra-large']),
    :host([connected]) ::slotted([shape='square'][size='extra-large']) {
      --_outer-radius: 28px;
    }

    /* First button: inner (end) corners rounded to _inner-radius, start corners rounded to _outer-radius */
    :host([connected]) ::slotted([group-position='first']) {
      --md-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-button-container-shape-end-end: var(--_inner-radius, 8px);
      --md-filled-tonal-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-filled-tonal-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-filled-tonal-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-filled-tonal-button-container-shape-end-end: var(--_inner-radius, 8px);
      --md-elevated-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-elevated-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-elevated-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-elevated-button-container-shape-end-end: var(--_inner-radius, 8px);
      --md-outlined-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-outlined-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-outlined-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-outlined-button-container-shape-end-end: var(--_inner-radius, 8px);
      --md-icon-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-icon-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-icon-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-icon-button-container-shape-end-end: var(--_inner-radius, 8px);
    }

    /* Middle buttons: all 4 corners rounded to _inner-radius */
    :host([connected]) ::slotted([group-position='middle']) {
      --md-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-button-container-shape-end-end: var(--_inner-radius, 8px);
      --md-filled-tonal-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-filled-tonal-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-filled-tonal-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-filled-tonal-button-container-shape-end-end: var(--_inner-radius, 8px);
      --md-elevated-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-elevated-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-elevated-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-elevated-button-container-shape-end-end: var(--_inner-radius, 8px);
      --md-outlined-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-outlined-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-outlined-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-outlined-button-container-shape-end-end: var(--_inner-radius, 8px);
      --md-icon-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-icon-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-icon-button-container-shape-start-end: var(--_inner-radius, 8px);
      --md-icon-button-container-shape-end-end: var(--_inner-radius, 8px);
    }

    /* Last button: inner (start) corners rounded to _inner-radius, end corners rounded to _outer-radius */
    :host([connected]) ::slotted([group-position='last']) {
      --md-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-button-container-shape-end-end: var(--_outer-radius, 24px);
      --md-filled-tonal-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-filled-tonal-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-filled-tonal-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-filled-tonal-button-container-shape-end-end: var(--_outer-radius, 24px);
      --md-elevated-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-elevated-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-elevated-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-elevated-button-container-shape-end-end: var(--_outer-radius, 24px);
      --md-outlined-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-outlined-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-outlined-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-outlined-button-container-shape-end-end: var(--_outer-radius, 24px);
      --md-icon-button-container-shape-start-start: var(--_inner-radius, 8px);
      --md-icon-button-container-shape-end-start: var(--_inner-radius, 8px);
      --md-icon-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-icon-button-container-shape-end-end: var(--_outer-radius, 24px);
    }

    /* Single button: all corners rounded to _outer-radius */
    :host([connected]) ::slotted([group-position='single']) {
      --md-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-button-container-shape-end-end: var(--_outer-radius, 24px);
      --md-filled-tonal-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-filled-tonal-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-filled-tonal-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-filled-tonal-button-container-shape-end-end: var(--_outer-radius, 24px);
      --md-elevated-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-elevated-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-elevated-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-elevated-button-container-shape-end-end: var(--_outer-radius, 24px);
      --md-outlined-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-outlined-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-outlined-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-outlined-button-container-shape-end-end: var(--_outer-radius, 24px);
      --md-icon-button-container-shape-start-start: var(--_outer-radius, 24px);
      --md-icon-button-container-shape-end-start: var(--_outer-radius, 24px);
      --md-icon-button-container-shape-start-end: var(--_outer-radius, 24px);
      --md-icon-button-container-shape-end-end: var(--_outer-radius, 24px);
    }

    /* Ensure active/hovered/focused button is above adjacent buttons */
    :host([connected]) ::slotted(*:hover),
    :host([connected]) ::slotted(*:focus-within),
    :host([connected]) ::slotted(*:active) {
      z-index: 2;
      position: relative;
    }

    /* Selected state */
    :host([connected]) ::slotted([selected]) {
      z-index: 1;
      position: relative;
    }
  `

  static properties = {
    connected: { type: Boolean, reflect: true },
    multiselect: { type: Boolean, reflect: true },
    selectionRequired: { type: Boolean, attribute: 'selection-required', reflect: true },
    checkmark: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
  }

  constructor() {
    super()
    this.connected = false
    this.multiselect = false
    this.selectionRequired = true
    this.checkmark = false
    this.size = ''

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'group')
    }

    this.handleClick = this.handleClick.bind(this)
  }

  connectedCallback() {
    super.connectedCallback()
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'group')
    }
    this.addEventListener('click', this.handleClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('click', this.handleClick)
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties)
    this.updateConnectedPositions()
  }

  updated(changedProperties) {
    super.updated(changedProperties)
    if (changedProperties.has('connected') || changedProperties.has('checkmark') || changedProperties.has('size')) {
      this.updateConnectedPositions()
    }
  }

  handleSlotChange() {
    this.updateConnectedPositions()
  }

  get buttons() {
    const slot = this.renderRoot?.querySelector('slot')
    const elements = slot?.assignedElements({ flatten: true }) ?? []
    return elements.filter((el) => !['STYLE', 'SCRIPT', 'TEMPLATE'].includes(el.tagName))
  }

  get selectedButtons() {
    return this.buttons.filter((b) => b.selected)
  }

  get selectedIndex() {
    return this.buttons.findIndex((b) => b.selected)
  }

  set selectedIndex(index) {
    this.buttons.forEach((b, i) => {
      b.selected = i === index
    })
  }

  get value() {
    if (this.multiselect) {
      return this.selectedButtons.map((b) => b.value || b.textContent.trim())
    }
    const selected = this.selectedButtons[0]
    return selected ? selected.value || selected.textContent.trim() : ''
  }

  set value(val) {
    if (this.multiselect && Array.isArray(val)) {
      this.buttons.forEach((b) => {
        const v = b.value || b.textContent.trim()
        b.selected = val.includes(v)
      })
    } else {
      this.buttons.forEach((b) => {
        const v = b.value || b.textContent.trim()
        b.selected = v === val
      })
    }
  }

  updateConnectedPositions() {
    const buttons = this.buttons
    const count = buttons.length

    buttons.forEach((button, index) => {
      // Propagate checkmark and toggle settings
      if (this.checkmark && !button.hasAttribute('checkmark')) {
        button.checkmark = true
      }
      if (this.connected && !button.toggle) {
        button.toggle = true
      }
      if (this.size && !button.size) {
        button.size = this.size
      }

      if (!this.connected || count <= 1) {
        if (count === 1) {
          button.setAttribute('group-position', 'single')
        } else {
          button.removeAttribute('group-position')
        }
      } else if (index === 0) {
        button.setAttribute('group-position', 'first')
      } else if (index === count - 1) {
        button.setAttribute('group-position', 'last')
      } else {
        button.setAttribute('group-position', 'middle')
      }
    })
  }

  handleClick(event) {
    const path = event.composedPath()
    const button = this.buttons.find((btn) => path.includes(btn))
    if (!button || button.disabled) return

    const isToggle = this.connected || button.toggle
    if (!isToggle) return

    if (this.multiselect) {
      if (this.selectionRequired && !button.selected && this.selectedButtons.length === 0) {
        // Button was deselected by button's handleClick, restore if selectionRequired
        button.selected = true
        return
      }
    } else {
      // Single select:
      if (this.selectionRequired && !button.selected && this.selectedButtons.length === 0) {
        // User clicked the already selected button (which toggled itself off), re-select it
        button.selected = true
        return
      }

      const shouldBeSelected = !this.selectionRequired && !button.selected ? false : true
      // Deselect other buttons
      this.buttons.forEach((b) => {
        if (b !== button) {
          b.selected = false
        }
      })
      button.selected = shouldBeSelected
    }

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          button,
          selected: button.selected,
          value: this.value,
          selectedIndex: this.selectedIndex,
        },
        bubbles: true,
        composed: true,
      }),
    )
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`
  }
}

customElements.define('md-button-group', ButtonGroup)
