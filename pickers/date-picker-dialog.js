import { html, css, LitElement, nothing } from 'lit'
import '../dialog/dialog.js'
import '../buttons/button.js'
import './date-picker.js'

export class DatePickerDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    value: { type: String, reflect: true },
    min: { type: String },
    max: { type: String },
  }

  constructor() {
    super()
    this.open = false
    this.value = ''
    this.min = ''
    this.max = ''
  }

  render() {
    return html`
      <md-dialog
        ?open=${this.open}
        @close=${this.handleClose}
        .quick=${true}
        style="position: absolute; z-index: 1000;">
        <div slot="headline">Select Date</div>
        <md-date-picker
          slot="content"
          .value=${this.value}
          .min=${this.min}
          .max=${this.max}
          @change=${this.handleDateChange}
          hide-header></md-date-picker>
        <div slot="actions">
          <md-button @click=${this.cancel} color="text">Cancel</md-button>
          <md-button @click=${this.confirm} color="text">OK</md-button>
        </div>
      </md-dialog>
    `
  }

  updated(changedProperties) {
    if (changedProperties.has('open')) {
      // Re-sync value when opening?
      // Optional: reset picker if needed.
    }
  }

  handleClose(e) {
    this.open = false
    this.dispatchEvent(new Event('close', { bubbles: true }))
  }

  handleDateChange(e) {
    // Just update local value state, don't confirm yet
    this.value = e.target.value
  }

  cancel() {
    this.open = false
    this.dispatchEvent(new Event('cancel', { bubbles: true }))
  }

  confirm() {
    this.open = false
    this.dispatchEvent(new Event('confirm', { bubbles: true }))
  }

  show() {
    this.open = true
  }

  close() {
    this.open = false
  }
}

customElements.define('md-date-picker-dialog', DatePickerDialog)
