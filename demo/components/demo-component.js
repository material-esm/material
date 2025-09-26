import { html, css, LitElement } from 'lit'
import 'material/textfield/outlined-text-field.js'
import 'material/textfield/filled-text-field.js'
import 'material/button/filled-button.js'
import 'material/button/outlined-button.js'
import 'material/iconbutton/icon-button.js'
import 'material/iconbutton/filled-icon-button.js'
import 'material/iconbutton/filled-tonal-icon-button.js'
import 'material/card/outlined-card.js'
import 'material/chips/chip-set.js'
import 'material/chips/assist-chip.js'
import 'material/chips/filter-chip.js'
import 'material/chips/input-chip.js'
import 'material/chips/suggestion-chip.js'
import 'material/dialog/dialog.js'
import 'material/select/outlined-select.js'
import 'material/select/select-option.js'
import 'material/tabs/tabs.js'
import 'material/tabs/primary-tab.js'
import 'material/slider/slider.js'
import { snack } from 'material/snackbar/snackbar.js'
import { styles as sharedStyles } from './styles.js'

class DemoComponent extends LitElement {
  static styles = [
    sharedStyles,
    css`
      md-outlined-card {
        width: 300px;
        background: var(--md-sys-color-surface);
        overflow: hidden;
      }
      md-outlined-card img {
        width: 100%;
        height: 160px;
        object-fit: cover;
      }
      .card-title {
        font-size: 1.2rem;
        font-weight: 500;
      }
      .tabpanel {
        padding: 16px;
        background: var(--md-sys-color-surface);
      }
    `,
  ]

  static properties = {
    activeTab: { type: Number },
  }

  constructor() {
    super()
    this.activeTab = 0
  }

  render() {
    return html`
      <div class="flex col g12">
        <form id="form1">
          <div class="flex col g12">
            <md-filled-text-field label="Name in filled text field" required minlength="4"></md-filled-text-field>
            <md-outlined-text-field label="Name" required minlength="4"></md-outlined-text-field>
            <md-outlined-text-field label="Email" type="email" required></md-outlined-text-field>
            <md-outlined-text-field label="Password" type="password" required></md-outlined-text-field>
            <md-outlined-text-field label="Phone" type="tel" required></md-outlined-text-field>
            <md-outlined-text-field label="File" type="file" id="file1" required></md-outlined-text-field>
            <md-outlined-text-field label="Date" type="date" required></md-outlined-text-field>
            <md-outlined-select required @change=${this.selected}>
              <md-select-option aria-label="blank"></md-select-option>
              <md-select-option selected value="apple">
                <div slot="headline">Apple</div>
              </md-select-option>
              <md-select-option value="orange">
                <div slot="headline">Orange</div>
              </md-select-option>
            </md-outlined-select>
            <md-filled-button type="button" @click=${this.save}>Save</md-filled-button>
          </div>
        </form>

        <div class="flex g12 aic">
          <md-icon-button>
            <md-icon>search</md-icon>
          </md-icon-button>
          <md-icon-button style="--md-icon-button-icon-color: red;">
            <md-icon>favorite</md-icon>
          </md-icon-button>
          <div style="position: relative">
            <md-filled-tonal-icon-button id="more-button" @click=${this.toggleMoreMenu}>
              <md-icon>more_vert</md-icon>
            </md-filled-tonal-icon-button>
            <md-menu id="more-menu" anchor="more-button">
              <md-menu-item href="/profile">
                <div slot="headline">Profile</div>
                <md-icon class="startIcon" slot="start">person</md-icon>
              </md-menu-item>
              <md-menu-item id="goto-orgs" href="/orgs">
                <div slot="headline">My Organizations</div>
                <md-icon class="startIcon" slot="start">storefront</md-icon>
              </md-menu-item>
              <md-menu-item id="goto-signout" @click=${this.signOut}>
                <div slot="headline">Sign out</div>
                <md-icon class="startIcon" slot="start">logout</md-icon>
              </md-menu-item>
            </md-menu>
          </div>
          <md-icon-button href="https://thingster.app" target="_blank">
            <md-icon>open_in_new</md-icon>
          </md-icon-button>
          <div>small:</div>
          <md-icon-button
            style="--md-icon-button-icon-size: 16px; --md-icon-button-container-width: 24px; --md-icon-button-container-height: 24px;"
          >
            <md-icon>content_copy</md-icon>
          </md-icon-button>
          <md-filled-icon-button
            style="--md-filled-icon-button-icon-size: 16px; --md-filled-icon-button-container-width: 24px; --md-filled-icon-button-container-height: 24px;"
          >
            <md-icon>content_copy</md-icon>
          </md-filled-icon-button>
        </div>

        <md-chip-set>
          <md-assist-chip label="Assist chip"></md-assist-chip>
          <md-filter-chip label="Filter chip"></md-filter-chip>
          <md-input-chip label="Input chip"></md-input-chip>
          <md-suggestion-chip label="Suggestion chip"></md-suggestion-chip>
        </md-chip-set>

        <div class="flex g12" style="flex-wrap: wrap;">
          <md-outlined-card style="">
            <div class="flex col">
              <img src="./images/img1.jpg" />
            </div>
            <div class="flex col g12 p16" style="">
              <div class="card-title">Card 1</div>
              <div>Card content goes here</div>
              <div class="flex g8 jcr mt12">
                <md-outlined-button>Read More</md-outlined-button>
                <md-filled-button>Buy Now</md-filled-button>
              </div>
            </div>
          </md-outlined-card>
          <md-outlined-card style="">
            <div class="flex col">
              <img src="./images/img2.jpg" />
            </div>
            <div class="flex col g12 p16" style="">
              <div class="card-title">Card 2</div>
              <div>Card content goes here</div>
              <div class="flex g8 jcr mt12">
                <md-outlined-button>Read More</md-outlined-button>
                <md-filled-button>Buy Now</md-filled-button>
              </div>
            </div>
          </md-outlined-card>
        </div>

        <div>
          <md-filled-button
            @click=${() =>
              snack('Hello world', {
                action: {
                  label: 'Undo',
                  onClick: () => {
                    console.log('Undo clicked')
                  },
                },
                showCloseIcon: true,
              })}
            >Snack</md-filled-button
          >
          <md-filled-button @click=${() => this.renderRoot.querySelector('#dialog1').show()} show
            >Dialog</md-filled-button
          >
        </div>

        <div>
          <md-tabs @change=${this.tabChanged} id="tabs">
            <md-primary-tab id="photos-tab" aria-label="Photos" aria-controls="photos-panel"> Photos </md-primary-tab>
            <md-primary-tab id="videos-tab" aria-label="Videos" aria-controls="videos-panel"> Videos </md-primary-tab>
            <md-primary-tab id="music-tab" aria-label="Music" aria-controls="music-panel"> Music </md-primary-tab>
          </md-tabs>
          ${this.renderTabPanel()}
        </div>

        <div class="flex g12">
          <md-slider @change=${(e) => console.log('Slider changed', e.target.value)}></md-slider>
          <md-slider @change=${(e) => console.log('Slider changed', e.target.value)} ticks value="50"></md-slider>
          <md-slider
            @change=${(e) => console.log('Slider changed', e.target.valueStart, e.target.valueEnd)}
            range
            value-start="25"
            value-end="75"
          ></md-slider>
        </div>
      </div>

      <md-dialog id="dialog1">
        <div slot="headline">Dialog title</div>
        <form slot="content" id="form-id" method="dialog">A simple dialog with free-form content.</form>
        <div slot="actions">
          <md-text-button form="form-id" @click=${() => this.renderRoot.querySelector('#dialog1').close()}
            >Ok</md-text-button
          >
        </div>
      </md-dialog>
    `
  }

  toggleMoreMenu() {
    let m = this.renderRoot.querySelector('#more-menu')
    m.open = !m.open
  }

  selected(e) {
    console.log('SELECTED!!!!', e.target, e.target.value)
  }

  save(e) {
    e.preventDefault()
    console.log('Save button clicked')
    let f1 = this.renderRoot.querySelector('#form1')
    let file1 = this.renderRoot.querySelector('#file1')
    console.log(file1.value)
    if (!f1.reportValidity()) {
      console.log('Form is invalid')
      return
    }
  }

  tabChanged(e) {
    console.log('TAB CHANGED!!!!', e.target, e.target.activeTabIndex)
    this.activeTab = e.target.activeTabIndex
  }

  renderTabPanel() {
    console.log('render tab panel', this.activeTab)
    if (this.activeTab == 0) {
      return html`
        <div class="tabpanel" id="photos-panel" role="tabpanel" aria-labelledby="photos-tab">Tab 1 content</div>
      `
    }
    if (this.activeTab == 1) {
      return html` <div class="tabpanel" id="videos-panel" role="tabpanel" aria-labelledby="videos-tab">
        Tab 2 content
      </div>`
    }
    if (this.activeTab == 2) {
      return html` <div class="tabpanel" id="music-panel" role="tabpanel" aria-labelledby="music-tab">
        Tab 3 content
      </div>`
    }
  }
}

customElements.define('demo-component', DemoComponent)
