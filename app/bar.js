import { LitElement, html, css } from 'lit'
import '../textfield/outlined-text-field.js'
import { sharedStyles } from '../shared/shared.css.js'

class AppBar extends LitElement {
  static properties = {
    label: { type: String },
    placeholder: { type: String },
    type: { type: String },
  }

  constructor() {
    super()
    console.log('SEARCH IS A WIP')

    this.label = 'Search'
    this.placeholder = 'Search'
    this.type = 'search'
  }

  render() {
    return html`
      <div class="main flex g8 pl4 pr4 aic fw">
        <slot name="leading-icon"></slot>
        <md-outlined-text-field id="input" class="fw" style="max-height: 48px;" label="${this.label}" placeholder="">
          <slot name="leading-icon-text-field" slot="leading-icon"></slot>
          <slot name="trailing-icon-text-field" slot="trailing-icon"></slot>
        </md-outlined-text-field>
        <slot name="trailing-icon"></slot>
      </div>
    `
  }

  get value() {
    return this.renderRoot.querySelector('#input').value
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        --md-outlined-text-field-container-shape: 24px;
        /* width: 100%; */
        height: 48px;
      }
      .main {
        width: 100%;
      }
    `,
  ]
}

customElements.define('md-app-bar', AppBar)
