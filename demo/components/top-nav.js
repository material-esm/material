import { LitElement, html, css } from 'lit'
import '../../search/search.js'
import { styles as sharedStyles } from './styles.js'

export class TopNav extends LitElement {
    static styles = [
        sharedStyles,
        css``]

    constructor() {
        super()
    }

    render() {
        return html`
        <div class="p4">
        <!-- Material search -->
          <md-search placeholder="Search...">
            <md-icon-button slot="leading-icon" @click=${this.toggleDrawer}>
                <md-icon>menu</md-icon>
            </md-icon-button>
            <div slot="trailing-icon">
              <img id="profile-pic" src="./images/avatar2.png" class="circle" style="height: 40px;"
              @click=${this.toggleMenu}>
            </div>
          </md-search>

          <md-menu id="user-menu" anchor="profile-pic" ?open=${this.open}
          @closed=${() => { }}>
            <md-menu-item href="/profile">
                <div slot="headline">Profile</div>
                <md-icon class="startIcon" slot="start">person</md-icon>
            </md-menu-item>
            <md-menu-item id="goto-orgs" href="/orgs">
                <div slot="headline">My&nbsp;Orgs</div>
                <md-icon class="startIcon" slot="start">storefront</md-icon>
            </md-menu-item>
            <md-menu-item id="goto-signout" @click=${this.signOut}>
                <div slot="headline">Sign&nbsp;out</div>
                <md-icon class="startIcon" slot="start">logout</md-icon>
            </md-menu-item>
          </md-menu>
          </div>
          `
    }

    toggleDrawer() {
        this.dispatchEvent(new CustomEvent('drawerButtonClicked', {
            bubbles: true,
            composed: true,
        }))
    }

    toggleMenu() {
        let m = this.renderRoot.querySelector("#user-menu")
        m.open = !m.open
    }

    signOut() {
        window.location.href = '/signout'
    }
}

customElements.define('top-nav', TopNav)
