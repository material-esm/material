import { html, css, LitElement, nothing } from 'lit'
import '../dialog/dialog.js'
import '../buttons/button.js'
import './date-picker.js'
import './time-picker.js'

export class DateTimePickerDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    value: { type: String, reflect: true }, // ISO string: YYYY-MM-DDThh:mm
    min: { type: String },
    max: { type: String },
    _date: { state: true },
    _time: { state: true },
  }

  constructor() {
    super()
    this.open = false
    this.value = ''
    this.min = ''
    this.max = ''
  }

  updated(changedProperties) {
    if (changedProperties.has('value') || changedProperties.has('open')) {
      if (this.open) {
        if (this.value) {
          const [d, t] = this.value.split('T')
          this._date = d
          this._time = t
        } else {
          this._date = ''
          this._time = ''
        }
      }
    }
  }

  render() {
    return html`
      <md-dialog
        ?open=${this.open}
        @close=${this.handleClose}
        .quick=${true}
        style="position: absolute; z-index: 1000; --md-dialog-container-max-width: 800px;">
        <div slot="headline">Select Date and Time</div>
        <div slot="content" class="pickers">
          <md-date-picker
            .value=${this._date}
            .min=${this.min}
            .max=${this.max}
            @change=${this.handleDateChange}
            hide-header></md-date-picker>
          <div class="separator"></div>
          <md-time-picker .value=${this._time} @change=${this.handleTimeChange}></md-time-picker>
        </div>
        <div slot="actions">
          <md-button @click=${this.cancel} color="text">Cancel</md-button>
          <md-button @click=${this.confirm} color="text">OK</md-button>
        </div>
      </md-dialog>
    `
  }

  handleClose() {
    this.open = false
    this.dispatchEvent(new Event('close', { bubbles: true }))
  }

  handleDateChange(e) {
    this._date = e.target.value
    this.updateValue()
  }

  handleTimeChange(e) {
    this._time = e.target.value
    this.updateValue()
  }

  updateValue() {
    if (this._date && this._time) {
      this.value = `${this._date}T${this._time}`
    } else if (this._date) {
      // Should we allow partial value? ISO format requires both.
      // But maybe we can store partial until both are set.
      // The prompt implies "datetime-local", which is combined.
      // Let's default time to 00:00 if not set when date is set?
      // Or wait for user interaction.
      // Better to not set this.value until both are present, or use intermediate state.
      // But I will trigger input event with what we have if useful?
      // Standard input[type=datetime-local] requires both.
    }
  }

  cancel() {
    this.open = false
    this.dispatchEvent(new Event('cancel', { bubbles: true }))
  }

  confirm() {
    // Only confirm if we have a valid value?
    // Or if the user clicks OK, we try to form it.
    if (this._date && !this._time) {
      this._time = '00:00'
      this.updateValue()
    }
    if (!this._date) {
      // Date is mandatory
      return
    }

    this.open = false
    this.dispatchEvent(new Event('confirm', { bubbles: true }))
  }

  show() {
    this.open = true
  }

  close() {
    this.open = false
  }

  static styles = css`
    .pickers {
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
      .pickers {
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

customElements.define('md-date-time-picker-dialog', DateTimePickerDialog)
