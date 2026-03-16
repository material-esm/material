import { LitElement, html, css } from 'lit'
import '../../search/search.js'
import { styles as sharedStyles } from './styles.js'

export class TopNav extends LitElement {
  static styles = [sharedStyles, css``]

  constructor() {
    super()
  }

  render() {
    return html`
      <div class="p4" style="position: relative;">
        <!-- Material search -->
        <md-search placeholder="Search..." @keydown=${this.handleKeyDown}></md-search>
      </div>
    `
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      let v = e.target.value
      console.log('search value: ', v)
    }
  }

  toggleDrawer() {
    this.dispatchEvent(
      new CustomEvent('drawerButtonClicked', {
        bubbles: true,
        composed: true,
      }),
    )
  }

  toggleMenu() {
    let m = this.renderRoot.querySelector('#user-menu')
    m.open = !m.open
  }

  signOut() {
    window.location.href = '/signout'
  }
}

customElements.define('top-nav', TopNav)
