import { html, css, LitElement, nothing } from 'lit'
import '../dialog/dialog.js'
import '../buttons/button.js'
import './date-picker.js'
import './time-picker.js'

export class DateTimePickerDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    value: { type: String, reflect: true },
    type: { type: String, reflect: true }, // 'date' | 'time' | 'datetime-local'
    min: { type: String },
    max: { type: String },
    format: { type: Number }, // 12 | 24
    _date: { state: true },
    _time: { state: true },
  }

  constructor() {
    super()
    this.open = false
    this.value = ''
    this.type = 'date'
    this.min = ''
    this.max = ''
    this.format = 12
    this._date = ''
    this._time = ''
  }

  updated(changedProperties) {
    if (changedProperties.has('open') && this.open) {
      this.syncInternalState()
    } else if (changedProperties.has('value') && !this.open) {
      // If value changes while closed, also sync (optional, but good practice)
      this.syncInternalState()
    }
  }

  syncInternalState() {
    if (this.type === 'date') {
      this._date = this.value || ''
    } else if (this.type === 'time') {
      this._time = this.value || '00:00'
    } else if (this.type === 'datetime-local') {
      if (this.value) {
        const [d, t] = this.value.split('T')
        this._date = d || ''
        this._time = t || ''
      } else {
        this._date = ''
        this._time = ''
      }
    }
  }

  render() {
    return html`
      <md-dialog ?open=${this.open} @close=${this.handleClose} .quick=${true} class="dialog">
        <div slot="headline">${this.getHeadline()}</div>
        <div slot="content" class="content">${this.renderPickers()}</div>
        <div slot="actions">
          <md-button @click=${this.cancel} color="text">Cancel</md-button>
          <md-button @click=${this.confirm} color="text">OK</md-button>
        </div>
      </md-dialog>
    `
  }

  getHeadline() {
    if (this.type === 'date') return 'Select Date'
    if (this.type === 'time') return 'Select Time'
    return 'Select Date and Time'
  }

  renderPickers() {
    if (this.type === 'date') {
      return html`<md-date-picker
        .value=${this._date}
        .min=${this.min}
        .max=${this.max}
        @change=${this.handleDateChange}
        hide-header></md-date-picker>`
    }
    if (this.type === 'time') {
      return html`<md-time-picker
        .value=${this._time}
        .format=${this.format}
        @change=${this.handleTimeChange}></md-time-picker>`
    }
    // datetime-local
    return html`
      <div class="combined-pickers">
        <md-date-picker
          .value=${this._date}
          .min=${this.min}
          .max=${this.max}
          @change=${this.handleDateChange}
          hide-header></md-date-picker>
        <div class="separator"></div>
        <md-time-picker .value=${this._time} @change=${this.handleTimeChange}></md-time-picker>
      </div>
    `
  }

  handleDateChange(e) {
    this._date = e.target.value
    if (this.type === 'date') {
      this.value = this._date
    } else {
      this.updateValue()
    }
  }

  handleTimeChange(e) {
    this._time = e.target.value
    if (this.type === 'time') {
      this.value = this._time
    } else {
      this.updateValue()
    }
  }

  updateValue() {
    if (this.type === 'datetime-local') {
      if (this._date && this._time) {
        this.value = `${this._date}T${this._time}`
      }
    }
  }

  confirm() {
    if (this.type === 'datetime-local') {
      if (!this._date) return // Date is mandatory
      if (!this._time) {
        this._time = '00:00'
      }
      this.value = `${this._date}T${this._time}`
    } else if (this.type === 'date') {
      // Value already updated
    } else if (this.type === 'time') {
      // Value already updated
    }

    this.open = false
    this.dispatchEvent(new Event('confirm', { bubbles: true }))
  }

  cancel() {
    this.open = false
    this.dispatchEvent(new Event('cancel', { bubbles: true }))
  }

  handleClose() {
    this.open = false
    this.dispatchEvent(new Event('close', { bubbles: true }))
  }

  show() {
    this.open = true
  }

  close() {
    this.open = false
  }

  static styles = css`
    md-dialog {
      position: absolute;
      z-index: 1000;
      --md-dialog-container-max-width: 800px;
    }

    .combined-pickers {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: center;
      justify-content: center;
    }

    .separator {
      width: 100%;
      height: 1px;
      background-color: var(--md-sys-color-outline-variant, #cac4d0);
      display: block;
    }

    @media (min-width: 650px) {
      .combined-pickers {
        flex-direction: row;
        align-items: flex-start;
        flex-wrap: nowrap;
      }
      .separator {
        width: 1px;
        height: auto;
        align-self: stretch;
      }
    }
  `
}

customElements.define('md-datetime-picker-dialog', DateTimePickerDialog)
