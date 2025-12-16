import { html, css, LitElement, nothing } from 'lit'
import '../dialog/dialog.js'
import '../buttons/button.js'
import './time-picker.js'

export class TimePickerDialog extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        value: { type: String, reflect: true },
        format: { type: Number },
    }

    constructor() {
        super();
        this.open = false;
        this.value = '00:00';
        this.format = 12;
    }

    render() {
        return html`
            <md-dialog ?open=${this.open} @close=${this.handleClose} .quick=${true}>
                <div slot="headline">Select time</div>
                <md-time-picker
                    slot="content"
                    .value=${this.value}
                    .format=${this.format}
                    @change=${this.handleTimeChange}
                ></md-time-picker>
                <div slot="actions">
                    <md-button @click=${this.cancel} color="text">Cancel</md-button>
                    <md-button @click=${this.confirm} color="text">OK</md-button>
                </div>
            </md-dialog>
        `
    }

    handleClose(e) {
        this.open = false;
        this.dispatchEvent(new Event('close', { bubbles: true }));
    }

    handleTimeChange(e) {
        // Just update local value state, don't confirm yet
        this.value = e.target.value;
    }

    cancel() {
        this.open = false;
        this.dispatchEvent(new Event('cancel', { bubbles: true }));
    }

    confirm() {
        this.open = false;
        this.dispatchEvent(new Event('confirm', { bubbles: true }));
    }

    show() {
        this.open = true;
    }

    close() {
        this.open = false;
    }
}

customElements.define('md-time-picker-dialog', TimePickerDialog)
