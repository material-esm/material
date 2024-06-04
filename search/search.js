import { LitElement, html, css } from 'lit'
import { MdOutlinedTextField } from '../textfield/outlined-text-field.js'

class Search extends LitElement {

    static styles = css`
    :host {
        --md-outlined-text-field-container-shape: 24px;
        /* width: 100%; */
    }
    .main {
        /* display: flex;
        flex-direction: column; */
        width: 100%;
    }
    `

    static properties = {
        label: { type: String },
        placeholder: { type: String },
    }

    constructor() {
        super(...arguments)
        console.log("SEARCH IS A WIP")

        this.label = 'Search'
        this.placeholder = 'Search'
    }

    render() {
        return html`
        <div class="main">
        <md-outlined-text-field style="width: 100%;"
            label="${this.label}"
            placeholder="${this.placeholder}"
            @input="${this._handleInput}">
            <slot name="leading-icon" slot="leading-icon"></slot>
            <slot name="trailing-icon" slot="trailing-icon"></slot>
        </md-outlined-text-field>
        </div>
        `
    }
}

customElements.define('md-search', Search)