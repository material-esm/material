import { LitElement, html, css } from 'lit'
import '../text/text-field.js'
import '../icon/icon.js'

class Search extends LitElement {
  static styles = css`
    :host {
      display: block;
      --md-text-field-container-shape: 24px;
    }
  `

  static properties = {
    label: { type: String },
    placeholder: { type: String },
    _hasValue: { type: Boolean, state: true },
  }

  constructor() {
    super()

    this.label = 'Search'
    this.placeholder = 'Search'
    this._hasValue = false
  }

  _handleInput(e) {
    this._hasValue = !!e.target.value
  }

  _clear() {
    const input = this.renderRoot.querySelector('#input')
    input.value = ''
    this._hasValue = false
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
  }

  render() {
    return html`
      <md-text-field
        color="outlined"
        type="search"
        id="input"
        style="width: 100%;"
        label="${this.label}"
        @input=${this._handleInput}
        placeholder="${this.placeholder}">
        <slot name="leading-icon" slot="leading-icon">
          <md-icon>search</md-icon>
        </slot>
        ${this._hasValue
          ? html`
              <slot name="trailing-icon" slot="trailing-icon" @click=${this._clear}>
                <md-icon style="cursor: pointer;">close</md-icon>
              </slot>
            `
          : ''}
      </md-text-field>
    `
  }

  get value() {
    return this.renderRoot?.querySelector('#input')?.value || ''
  }

  set value(v) {
    const input = this.renderRoot?.querySelector('#input')
    if (input) {
      input.value = v
    }
    this._hasValue = !!v
  }
}

customElements.define('md-search', Search)
