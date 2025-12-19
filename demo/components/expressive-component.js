import { html, css, LitElement } from 'lit'
import 'material/text/text-field.js'
import 'material/buttons/button.js'
import 'material/buttons/icon-button.js'
import 'material/buttons/split-button.js'
import 'material/card/card.js'
import 'material/chips/chip-set.js'
import 'material/chips/chip.js'
import 'material/dialog/dialog.js'
import 'material/select/select.js'
import 'material/select/select-option.js'
import 'material/tabs/tabs.js'
import 'material/tabs/tab.js'
import 'material/slider/slider.js'
import 'material/switch/switch.js'
import 'material/radio/radio.js'
import 'material/checkbox/checkbox.js'
import { snack } from 'material/snackbar/snackbar.js'
import { styles as sharedStyles } from './styles.js'
import { styles as typography } from '../../typography/md-typescale-styles.js'

class ExpressiveComponent extends LitElement {
  static styles = [
    sharedStyles,
    typography,
    css`
      md-card {
        width: 300px;
        background: var(--md-sys-color-surface);
        overflow: hidden;
      }
      md-card img {
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
    secondaryTab: { type: Number },
  }

  constructor() {
    super()
    this.activeTab = 0
    this.secondaryTab = 0
  }

  render() {
    return html`
      <div class="flex col g12">
        <form id="form1">
          <div class="flex col g12">
            <md-text-field color="filled" label="Name in filled text field" required minlength="4"></md-text-field>
            <md-text-field color="outlined" label="Name" required minlength="4"></md-text-field>
            <md-text-field color="outlined" label="Email" type="email" required></md-text-field>
            <md-text-field color="outlined" label="Password" type="password" required></md-text-field>
            <md-text-field color="outlined" label="Phone" type="tel" required style="width: 50%;"></md-text-field>
            <md-text-field color="outlined" label="File" type="file" id="file1" required></md-text-field>
            <md-text-field color="outlined" label="Date" type="date" required @change=${this.changed}></md-text-field>
            <md-text-field
              color="outlined"
              label="Date & time"
              type="datetime-local"
              required
              @change=${this.changed}></md-text-field>
            <md-text-field color="outlined" label="Time" type="time" required @change=${this.changed}></md-text-field>
            <md-text-field
              color="outlined"
              type="textarea"
              id="commentBody"
              label="What's on your mind?"
              rows="3"
              value=""></md-text-field>
            <md-select label="Choose your fruit" required @change=${this.selected}>
              <md-select-option aria-label="blank"></md-select-option>
              <md-select-option selected value="apple">
                <div slot="headline">Apple</div>
              </md-select-option>
              <md-select-option value="orange">
                <div slot="headline">Orange</div>
              </md-select-option>
            </md-select>
            <md-select label="Choose your fruit" color="filled" required @change=${this.selected}>
              <md-select-option aria-label="blank"></md-select-option>
              <md-select-option selected value="apple">
                <div slot="headline">Apple</div>
              </md-select-option>
              <md-select-option value="orange">
                <div slot="headline">Orange</div>
              </md-select-option>
            </md-select>
            <div>
              <md-button type="button" @click=${this.save}>Save</md-button>
            </div>
            <md-split-button color="filled">
              Send
              <div slot="menu">
                <!-- define your menu here -->
                <md-menu-item>Schedule send</md-menu-item>
                <md-menu-item>Save template</md-menu-item>
              </div>
            </md-split-button>
            <md-split-button color="outlined">
              Send
              <div slot="menu">
                <!-- define your menu here -->
                <md-menu-item>Schedule send</md-menu-item>
                <md-menu-item>Save template</md-menu-item>
              </div>
            </md-split-button>
          </div>
        </form>

        <div class="flex g20 aic">
          <md-switch
            value="something"
            @change=${(e) => console.log('Switch changed', e.target.selected, e.target.value)}></md-switch>
          <md-checkbox></md-checkbox>
          <div class="flex g8 aic">
            <md-radio id="cats-radio" name="animals" value="cats"></md-radio>
            <label for="cats-radio">Cats</label>

            <md-radio id="dogs-radio" name="animals" value="dogs"></md-radio>
            <label for="dogs-radio">Dogs</label>
          </div>
          <md-button
            color="outlined"
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
            >Snack</md-button
          >
          <md-button color="outlined" show @click=${() => this.renderRoot.querySelector('#dialog1').show()}
            >Dialog</md-button
          >
        </div>

        <div class="flex g12 aic">
          <md-icon-button>
            <md-icon>search</md-icon>
          </md-icon-button>
          <md-icon-button style="--md-icon-button-icon-color: red;">
            <md-icon>favorite</md-icon>
          </md-icon-button>
          <div style="position: relative">
            <md-icon-button color="tonal" id="more-button" @click=${this.toggleMoreMenu}>
              <md-icon>more_vert</md-icon>
            </md-icon-button>
            <md-menu id="more-menu" anchor="more-button">
              <md-menu-item>
                <div slot="headline">Profile</div>
                <md-icon class="startIcon" slot="start">person</md-icon>
              </md-menu-item>
              <md-menu-item id="goto-orgs" href="/orgs">
                <div slot="headline">My Organizations</div>
                <md-icon class="startIcon" slot="start">storefront</md-icon>
              </md-menu-item>
              <md-menu-item id="goto-signout">
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
            style="--md-icon-button-icon-size: 16px; --md-icon-button-container-width: 24px; --md-icon-button-container-height: 24px;">
            <md-icon>content_copy</md-icon>
          </md-icon-button>
          <md-icon-button
            color="filled"
            style="--md-icon-button-icon-size: 16px; --md-icon-button-container-width: 24px; --md-icon-button-container-height: 24px;">
            <md-icon>content_copy</md-icon>
          </md-icon-button>
        </div>
        <!-- Buttons -->
        <h3>Button sizes</h3>
        <div class="flexw g12 aic">
          <md-button>Default</md-button>
          <md-button size="extra-small">Extra small</md-button>
          <md-button size="small">Small</md-button>
          <md-button size="medium"><md-icon slot="icon">edit</md-icon>Medium</md-button>
          <md-button size="large">Large</md-button>
          <md-button size="extra-large">Extra large</md-button>
        </div>

        <h3>Button Colors</h3>
        <div class="flexw g12 aic">
          <md-button color="elevated">
            <md-icon slot="icon">edit</md-icon>
            Elevated
          </md-button>
          <md-button color="outlined">Outlined</md-button>
          <md-button color="filled">
            <md-icon slot="icon">edit</md-icon>
            Filled
          </md-button>
          <md-button color="tonal">
            <md-icon slot="icon">edit</md-icon>
            Tonal
          </md-button>
          <md-button color="text">Text</md-button>
        </div>

        <h3>Square buttons</h3>
        <div class="flexw g12 aic">
          <md-button shape="square">Default</md-button>
          <md-button shape="square" size="extra-small">Extra small</md-button>
          <md-button shape="square" size="small">Small</md-button>
          <md-button shape="square" size="medium"><md-icon slot="icon">edit</md-icon>Medium</md-button>
          <md-button shape="square" size="large">Large</md-button>
          <md-button shape="square" size="extra-large">Extra large</md-button>
        </div>

        <h3>Chips</h3>
        <md-chip-set>
          <md-chip type="assist" label="Assist chip" @click=${this.clicked}>
            <md-icon slot="icon">calendar_add_on</md-icon>
          </md-chip>
          <md-chip type="filter" label="Filter chip"></md-chip>
          <md-chip type="input" label="Input chip"></md-chip>
          <md-chip type="input" label="Pic chip" @click=${this.clicked} avatar>
            <img src="./images/avatar2.png" slot="icon" />
          </md-chip>
          <md-chip type="suggestion" label="Suggestion chip"></md-chip>
        </md-chip-set>

        <h3>Sliders</h3>
        <div class="flexw g12">
          <md-slider @change=${(e) => console.log('Slider changed', e.target.value)} labeled></md-slider>
          <md-slider
            @change=${(e) => console.log('Slider changed', e.target.value)}
            min="0"
            max="50"
            step="10"
            ticks
            value="10"></md-slider>
          <md-slider
            @change=${(e) => console.log('Slider changed', e.target.valueStart, e.target.valueEnd)}
            range
            value-start="25"
            value-end="75"></md-slider>
        </div>

        <h3>Cards</h3>
        <div class="flexw g12">
          <md-card type="outlined">
            <div class="flex col">
              <img src="./images/img1.jpg" />
            </div>
            <div class="flex col g12 p16" style="">
              <div class="card-title">Card 1</div>
              <div>Card content goes here</div>
              <div class="flex g8 jcr mt12">
                <md-button color="outlined">Read More</md-button>
                <md-button color="filled">Buy Now</md-button>
              </div>
            </div>
          </md-card>
          <md-card type="filled">
            <div class="flex col">
              <img src="./images/img2.jpg" />
            </div>
            <div class="flex col g12 p16" style="">
              <div class="card-title">Card 2</div>
              <div>Card content goes here</div>
              <div class="flex g8 jcr mt12">
                <md-button color="outlined">Read More</md-button>
                <md-button color="filled">Buy Now</md-button>
              </div>
            </div>
          </md-card>
          <md-card type="elevated">
            <div class="flex col">
              <img src="./images/img2.jpg" />
            </div>
            <div class="flex col g12 p16" style="">
              <div class="card-title">Card 3</div>
              <div>Card content goes here</div>
              <div class="flex g8 jcr mt12">
                <md-button color="outlined">Read More</md-button>
                <md-button color="filled">Buy Now</md-button>
              </div>
            </div>
          </md-card>
        </div>

        <h3>Tabs</h3>

        <div>
          <md-tabs @change=${this.tabChanged} id="tabs">
            <md-tab type="primary" id="photos-tab" aria-label="Photos" aria-controls="photos-panel">
              <md-icon slot="icon">photo</md-icon>
              Photos
            </md-tab>
            <md-tab type="primary" id="videos-tab" aria-label="Videos" aria-controls="videos-panel">
              <md-icon slot="icon">videocam</md-icon>
              Video
            </md-tab>
            <md-tab type="primary" id="music-tab" aria-label="Music" aria-controls="music-panel">
              <md-icon slot="icon">music_note</md-icon>
              Music
            </md-tab>
          </md-tabs>
          ${this.renderTabPanel()}
        </div>

        <div>
          <md-tabs @change=${this.secondaryTabChanged} id="tabs2">
            <md-tab type="secondary" id="photos-tab" aria-label="Photos" aria-controls="photos-panel"> Photos </md-tab>
            <md-tab type="secondary" id="videos-tab" aria-label="Videos" aria-controls="videos-panel"> Videos </md-tab>
            <md-tab type="secondary" id="music-tab" aria-label="Music" aria-controls="music-panel"> Music </md-tab>
          </md-tabs>
          ${this.renderSecondaryTabPanel()}
        </div>
      </div>

      <md-dialog id="dialog1">
        <div slot="headline">Dialog title</div>
        <form slot="content" id="form-id" method="dialog">A simple dialog with free-form content.</form>
        <div slot="actions">
          <md-button color="text" form="form-id" @click=${() => this.renderRoot.querySelector('#dialog1').close()}
            >Ok</md-button
          >
        </div>
      </md-dialog>
    `
  }

  changed(e) {
    console.log('Value changed', e.target, e.target.value)
  }

  toggleMoreMenu() {
    let m = this.renderRoot.querySelector('#more-menu')
    m.open = !m.open
  }

  selected(e) {
    console.log('SELECTED!!!!', e.target, e.target.value)
  }

  clicked(e) {
    console.log('CLICKED!!!!', e.target, e.target.value)
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
    this.activeTab = e.target.activeTabIndex
  }

  renderTabPanel() {
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

  secondaryTabChanged(e) {
    this.secondaryTab = e.target.activeTabIndex
  }

  renderSecondaryTabPanel() {
    if (this.secondaryTab == 0) {
      return html`
        <div class="tabpanel" id="photos-panel" role="tabpanel" aria-labelledby="photos-tab">Tab 1 content</div>
      `
    }
    if (this.secondaryTab == 1) {
      return html` <div class="tabpanel" id="videos-panel" role="tabpanel" aria-labelledby="videos-tab">
        Tab 2 content
      </div>`
    }
    if (this.secondaryTab == 2) {
      return html` <div class="tabpanel" id="music-panel" role="tabpanel" aria-labelledby="music-tab">
        Tab 3 content
      </div>`
    }
  }
}

customElements.define('expressive-component', ExpressiveComponent)
