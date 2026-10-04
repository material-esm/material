import { html, css, LitElement } from 'lit'
import '../../text/text-field.js'
import '../../buttons/button.js'
import '../../buttons/button-group.js'
import '../../buttons/icon-button.js'
import '../../buttons/split-button.js'
import '../../buttons/fab.js'
import '../../card/card.js'
import '../../chips/chip-set.js'
import '../../chips/chip.js'
import '../../badge/badge.js'
import '../../dialog/dialog.js'
import '../../select/select.js'
import '../../select/select-option.js'
import '../../tabs/tabs.js'
import '../../tabs/tab.js'
import '../../slider/slider.js'
import '../../switch/switch.js'
import '../../radio/radio.js'
import '../../checkbox/checkbox.js'
import '../../tooltip/tooltip.js'
import '../../icon/icon.js'
import '../../menu/menu.js'
import '../../menu/menu-item.js'
import '../../indicators/progress.js'
import '../../indicators/loading.js'
import '../../carousel/carousel.js'
import '../../carousel/carousel-item.js'
import { snack } from '../../snackbar/snackbar.js'
import { styles as sharedStyles } from './styles.js'
import { styles as typography } from '../../typography/md-typescale-styles.js'

class ExpressiveComponent extends LitElement {
  static styles = [
    sharedStyles,
    typography,
    css`
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
      }
      .demo-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px;
        margin-bottom: 24px;
        background: var(--md-sys-color-surface-container-low, #f7f2fa);
        border-radius: 20px;
        border: 1px solid var(--md-sys-color-outline-variant, rgba(120, 120, 120, 0.15));
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 4px;
      }
      .section-title {
        font-size: 1.4rem;
        font-weight: 600;
        margin: 0;
        color: var(--md-sys-color-on-surface);
      }
      .section-desc {
        font-size: 0.9rem;
        color: var(--md-sys-color-on-surface-variant);
        margin: 4px 0 0 0;
      }
      .section-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--md-sys-color-primary);
        text-decoration: none;
      }
      .section-link:hover {
        text-decoration: underline;
      }
      .sub-section-title {
        font-size: 1.05rem;
        font-weight: 500;
        margin: 12px 0 4px 0;
        color: var(--md-sys-color-on-surface);
      }
      md-card {
        width: 300px;
        max-width: 100%;
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
        border-radius: 0 0 12px 12px;
      }
      md-carousel {
        width: 100%;
        max-width: 100%;
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
      <div class="flex col g16">
        <!-- 1. Carousel Section (Cooler stuff at top) -->
        <section class="demo-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Carousel (M3 Multi-Browse)</h2>
              <p class="section-desc">Multi-browse carousel with indicators, snap scrolling, and interactive cards.</p>
            </div>
            <a href="./carousel-demo.html" class="section-link">
              View Full Carousel Demo <md-icon style="font-size: 18px">arrow_forward</md-icon>
            </a>
          </div>
          <div>
            <md-carousel layout="multi-browse" indicators loop style="height: 220px">
              <md-carousel-item interactive headline="Mountain Vista" subhead="National Park">
                <img src="./images/img1.jpg" alt="Mountain" />
              </md-carousel-item>
              <md-carousel-item interactive headline="Ocean Coast" subhead="Golden sunset">
                <img src="./images/img2.jpg" alt="Ocean" />
              </md-carousel-item>
              <md-carousel-item interactive headline="Redwood Forest" subhead="Misty trees">
                <img src="./images/img3.jpg" alt="Forest" />
              </md-carousel-item>
              <md-carousel-item interactive headline="Desert Valley" subhead="Sahara dunes">
                <img src="./images/img4.jpg" alt="Desert" />
              </md-carousel-item>
            </md-carousel>
          </div>
        </section>

        <!-- 2. Indicators & Progress Section (Cooler stuff at top) -->
        <section class="demo-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Progress & Loading Indicators (M3 Expressive)</h2>
              <p class="section-desc">
                Expressive motion indicators with morphing loaders and smooth wavy track progress bars.
              </p>
            </div>
          </div>

          <h3 class="sub-section-title">Loading Indicator (M3 Expressive)</h3>
          <div class="flexw g16 aic">
            <md-loading></md-loading>
            <md-loading contained></md-loading>
            <md-loading color="var(--md-sys-color-tertiary, #7d5260)"></md-loading>
            <md-loading contained color="white" container-color="var(--md-sys-color-primary, #6750a4)"></md-loading>
            <md-loading size="64" contained></md-loading>
          </div>

          <h3 class="sub-section-title">Wavy Progress Indicators</h3>
          <div class="flexw g16 aic">
            <md-progress type="circular" indeterminate shape="wavy"></md-progress>
            <md-progress type="circular" value="0.7" shape="wavy"></md-progress>
            <md-progress type="linear" value="0.5" shape="wavy" style="width: 220px"></md-progress>
            <md-progress type="linear" indeterminate shape="wavy" style="width: 220px"></md-progress>
          </div>

          <h3 class="sub-section-title">Standard Progress</h3>
          <div class="flexw g16 aic">
            <md-progress type="circular" indeterminate shape="flat"></md-progress>
            <md-progress type="circular" value="0.7"></md-progress>
            <md-progress type="linear" value="0.5" style="width: 220px"></md-progress>
          </div>
        </section>

        <!-- 3. Buttons & Actions Section -->
        <section class="demo-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Buttons & Actions</h2>
              <p class="section-desc">
                Complete Material 3 button family: styles, sizes, square, toggle, connected groups, split buttons, and
                FABs.
              </p>
            </div>
          </div>

          <h3 class="sub-section-title">Button Colors & Styles</h3>
          <div class="flexw g12 aic">
            <md-button color="elevated">
              <md-icon slot="icon">edit</md-icon>
              Elevated
            </md-button>
            <md-button color="outlined">Outlined</md-button>
            <md-button color="outlined">
              <md-icon slot="icon">archive</md-icon>
              Outlined Icon
            </md-button>
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

          <h3 class="sub-section-title">Button Sizes</h3>
          <div class="flexw g12 aic">
            <md-button size="extra-small">Extra small</md-button>
            <md-button size="small">Small</md-button>
            <md-button>Default</md-button>
            <md-button size="medium"><md-icon slot="icon">edit</md-icon>Medium</md-button>
            <md-button size="large"><md-icon slot="icon">add</md-icon>Large</md-button>
            <md-button size="extra-large">Extra large</md-button>
          </div>

          <h3 class="sub-section-title">Square Buttons</h3>
          <div class="flexw g12 aic">
            <md-button shape="square">Default</md-button>
            <md-button shape="square" size="extra-small">Extra small</md-button>
            <md-button shape="square" size="small">Small</md-button>
            <md-button shape="square" size="medium"><md-icon slot="icon">edit</md-icon>Medium</md-button>
            <md-button shape="square" size="large">Large</md-button>
            <md-button shape="square" size="extra-large">Extra large</md-button>
          </div>

          <h3 class="sub-section-title">Toggle Buttons</h3>
          <div class="flexw g12 aic">
            <md-button toggle>Toggle me</md-button>
            <md-button toggle color="elevated">Toggle me</md-button>
            <md-button toggle color="tonal">Tonal</md-button>
            <md-button toggle color="outlined">Outlined</md-button>
            <md-button toggle shape="square">Toggle me</md-button>
          </div>

          <h3 class="sub-section-title">Connected Button Groups</h3>
          <div class="flex col g16">
            <div>
              <div style="font-weight: 500; margin-bottom: 6px;">Standard (Separated)</div>
              <md-button-group aria-label="Standard button group">
                <md-button>One</md-button>
                <md-button>Two</md-button>
                <md-button>Three</md-button>
              </md-button-group>
            </div>

            <div>
              <div style="font-weight: 500; margin-bottom: 6px;">Folders (Connected Tonal)</div>
              <div style="max-width: 420px;">
                <md-button-group connected aria-label="Folders" style="width: 100%;">
                  <md-button color="tonal" selected>My files</md-button>
                  <md-button color="tonal">Shared</md-button>
                  <md-button color="tonal">Computers</md-button>
                </md-button-group>
              </div>
            </div>

            <div>
              <div style="font-weight: 500; margin-bottom: 6px;">Select Size (Connected with Checkmark)</div>
              <div style="max-width: 360px;" class="flex col g12">
                <md-button-group connected checkmark aria-label="Select size" style="width: 100%;">
                  <md-button color="tonal" selected>8oz</md-button>
                  <md-button color="tonal">12oz</md-button>
                  <md-button color="tonal">16oz</md-button>
                </md-button-group>
              </div>
            </div>

            <div>
              <div style="font-weight: 500; margin-bottom: 6px;">View (Connected Outlined)</div>
              <div style="max-width: 420px;">
                <md-button-group connected aria-label="View options" style="width: 100%;">
                  <md-button color="outlined">Day</md-button>
                  <md-button color="outlined" selected>Week</md-button>
                  <md-button color="outlined">Month</md-button>
                  <md-button color="outlined">Year</md-button>
                </md-button-group>
              </div>
            </div>
          </div>

          <h3 class="sub-section-title">Split Buttons</h3>
          <div class="flexw g16 aic">
            <md-split-button color="filled" @click=${this.clicked}>
              Send
              <div slot="menu">
                <md-menu-item @click=${this.clicked2}>Schedule send</md-menu-item>
                <md-menu-item @click=${this.clicked2}>Save template</md-menu-item>
              </div>
            </md-split-button>
            <md-split-button color="outlined" @click=${this.clicked}>
              Send
              <div slot="menu">
                <md-menu-item>Schedule send</md-menu-item>
                <md-menu-item>Save template</md-menu-item>
              </div>
            </md-split-button>
            <md-split-button color="outlined" @click=${this.clicked} disabled>
              Send
              <div slot="menu">
                <md-menu-item>Schedule send</md-menu-item>
                <md-menu-item>Save template</md-menu-item>
              </div>
            </md-split-button>
          </div>

          <h3 class="sub-section-title">Floating Action Buttons & Icon Buttons</h3>
          <div class="flexw g16 aic">
            <md-fab variant="primary" label="New Item" extended>
              <md-icon slot="icon">edit</md-icon>
            </md-fab>
            <md-fab variant="secondary" lowered>
              <md-icon slot="icon">favorite</md-icon>
            </md-fab>
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
            <div class="flex aic g8">
              <span>Small:</span>
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
          </div>
        </section>

        <!-- 4. Inputs & Form Controls Section -->
        <section class="demo-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Inputs & Form Controls</h2>
              <p class="section-desc">
                Outlined and filled text fields, pickers, selects, and built-in form validation.
              </p>
            </div>
          </div>

          <form id="form1">
            <div class="flex col g16" style="max-width: 440px;">
              <md-text-field
                color="filled"
                label="Name in filled text field"
                required
                minlength="4"
                supporting-text="Supporting text"></md-text-field>
              <md-text-field color="outlined" label="Full Name" required minlength="4"></md-text-field>
              <md-text-field
                label="Error state"
                error
                error-text="Please enter a valid value"
                value="Invalid input"></md-text-field>
              <md-text-field color="outlined" label="Email" type="email" required></md-text-field>
              <md-text-field color="outlined" label="Password" type="password" required></md-text-field>
              <md-text-field color="outlined" label="Phone" type="tel" required style="width: 60%;"></md-text-field>
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
                id="themeColor"
                type="color"
                label="Theme Color"
                value="#6750a4"></md-text-field>
              <md-text-field
                color="outlined"
                type="textarea"
                id="commentBody"
                label="What's on your mind?"
                rows="3"
                value=""></md-text-field>
              <md-select label="Choose your fruit (Outlined)" required @change=${this.selected}>
                <md-select-option selected value="apple">
                  <div slot="headline">Apple</div>
                </md-select-option>
                <md-select-option value="orange">
                  <div slot="headline">Orange</div>
                </md-select-option>
              </md-select>
              <md-select label="Choose your fruit (Filled)" color="filled" required @change=${this.selected}>
                <md-select-option selected value="apple">
                  <div slot="headline">Apple</div>
                </md-select-option>
                <md-select-option value="orange">
                  <div slot="headline">Orange</div>
                </md-select-option>
              </md-select>
              <div>
                <md-button type="button" @click=${this.save}>Validate & Save Form</md-button>
              </div>
            </div>
          </form>
        </section>

        <!-- 5. Selection Controls & Sliders Section -->
        <section class="demo-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Selection Controls & Sliders</h2>
              <p class="section-desc">
                Switches with icon indicators, checkboxes with indeterminate states, radio groups, and sliders.
              </p>
            </div>
          </div>

          <h3 class="sub-section-title">Switches, Checkboxes & Radio Buttons</h3>
          <div class="flexw g24 aic">
            <div class="flex aic g12">
              <md-switch
                selected
                icons
                value="switch1"
                @change=${(e) => console.log('Switch changed', e.target.selected, e.target.value)}></md-switch>
              <md-switch
                value="switch2"
                @change=${(e) => console.log('Switch changed', e.target.selected, e.target.value)}></md-switch>
            </div>
            <div class="flex aic g12">
              <md-checkbox checked></md-checkbox>
              <md-checkbox></md-checkbox>
              <md-checkbox indeterminate></md-checkbox>
            </div>
            <div class="flex g12 aic">
              <div class="flex g8 aic">
                <md-radio id="cats-radio" name="animals" value="cats" checked></md-radio>
                <label for="cats-radio">Cats</label>
              </div>
              <div class="flex g8 aic">
                <md-radio id="dogs-radio" name="animals" value="dogs"></md-radio>
                <label for="dogs-radio">Dogs</label>
              </div>
            </div>
          </div>

          <h3 class="sub-section-title">Sliders</h3>
          <div class="flexw g16" style="max-width: 600px;">
            <md-slider
              @change=${(e) => console.log('Slider changed', e.target.value)}
              labeled
              value="50"
              style="width: 100%"></md-slider>
            <md-slider
              @change=${(e) => console.log('Slider changed', e.target.value)}
              min="0"
              max="50"
              step="10"
              ticks
              labeled
              value="20"
              style="width: 100%"></md-slider>
            <md-slider
              @change=${(e) => console.log('Slider changed', e.target.valueStart, e.target.valueEnd)}
              range
              labeled
              value-start="25"
              value-end="75"
              style="width: 100%"></md-slider>
          </div>
        </section>

        <!-- 6. Cards & Surfaces Section -->
        <section class="demo-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Cards & Surfaces</h2>
              <p class="section-desc">Outlined, filled, and elevated cards for content grouping and layout.</p>
            </div>
          </div>

          <div class="flexw g16">
            <md-card type="outlined">
              <div class="flex col">
                <img src="./images/img1.jpg" alt="Outlined Card" />
              </div>
              <div class="flex col g12 p16">
                <div class="card-title">Outlined Card</div>
                <div>Card container with an explicit border and clean elevation.</div>
                <div class="flex g8 jcr mt12">
                  <md-button color="outlined">Read More</md-button>
                  <md-button color="filled">Buy Now</md-button>
                </div>
              </div>
            </md-card>

            <md-card type="filled">
              <div class="flex col">
                <img src="./images/img2.jpg" alt="Filled Card" />
              </div>
              <div class="flex col g12 p16">
                <div class="card-title">Filled Card</div>
                <div>Subtle container surface color with no border outline.</div>
                <div class="flex g8 jcr mt12">
                  <md-button color="outlined">Read More</md-button>
                  <md-button color="filled">Buy Now</md-button>
                </div>
              </div>
            </md-card>

            <md-card type="elevated">
              <div class="flex col">
                <img src="./images/img3.jpg" alt="Elevated Card" />
              </div>
              <div class="flex col g12 p16">
                <div class="card-title">Elevated Card</div>
                <div>Higher drop-shadow elevation for prominent elements.</div>
                <div class="flex g8 jcr mt12">
                  <md-button color="outlined">Read More</md-button>
                  <md-button color="filled">Buy Now</md-button>
                </div>
              </div>
            </md-card>
          </div>
        </section>

        <!-- 7. Tabs & Navigation Section -->
        <section class="demo-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Tabs & Navigation</h2>
              <p class="section-desc">Primary and secondary tab navigation bars with dynamic active tabpanels.</p>
            </div>
          </div>

          <h3 class="sub-section-title">Primary Tabs (with Icons)</h3>
          <div style="max-width: 600px;">
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

          <h3 class="sub-section-title">Secondary Tabs</h3>
          <div style="max-width: 600px;">
            <md-tabs @change=${this.secondaryTabChanged} id="tabs2">
              <md-tab type="secondary" id="photos-tab2" aria-label="Photos">Photos</md-tab>
              <md-tab type="secondary" id="videos-tab2" aria-label="Videos">Videos</md-tab>
              <md-tab type="secondary" id="music-tab2" aria-label="Music">Music</md-tab>
            </md-tabs>
            ${this.renderSecondaryTabPanel()}
          </div>
        </section>

        <!-- 8. Feedback, Chips & Dialogs Section -->
        <section class="demo-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Feedback, Chips & Dialogs</h2>
              <p class="section-desc">
                Interactive chips, notification badges, plain and rich tooltips, modal dialogs, and snackbars.
              </p>
            </div>
          </div>

          <h3 class="sub-section-title">Chips & Badges</h3>
          <div class="flex col g12">
            <md-chip-set>
              <md-chip type="assist" label="Assist chip" @click=${this.clicked}>
                <md-icon slot="icon">calendar_add_on</md-icon>
              </md-chip>
              <md-chip type="filter" label="Filter chip" selected></md-chip>
              <md-chip type="input" label="Input chip"></md-chip>
              <md-chip type="input" label="Pic chip" @click=${this.clicked} avatar>
                <img src="./images/avatar2.png" slot="icon" />
              </md-chip>
              <md-chip type="suggestion" label="Suggestion chip"></md-chip>
            </md-chip-set>

            <div class="flex aic g16">
              <span style="position: relative; display: inline-flex">
                <md-icon-button>
                  <md-icon>notifications</md-icon>
                </md-icon-button>
                <md-badge value="5" style="position: absolute; top: 4px; right: 4px"></md-badge>
              </span>
              <span style="position: relative; display: inline-flex">
                <md-icon-button>
                  <md-icon>mail</md-icon>
                </md-icon-button>
                <md-badge style="position: absolute; top: 8px; right: 8px"></md-badge>
              </span>
            </div>
          </div>

          <h3 class="sub-section-title">Tooltips</h3>
          <div class="flexw g16 aic">
            <md-tooltip text="This is a plain tooltip">
              <md-button>Hover for Plain Tooltip</md-button>
            </md-tooltip>

            <md-tooltip type="rich">
              <md-button color="tonal">Hover for Rich Tooltip</md-button>
              <div slot="headline">Rich Tooltip</div>
              <div slot="text">This is a rich tooltip with more details and actions.</div>
              <div slot="actions" class="flex g12">
                <md-button color="text" size="x-small">Action 1</md-button>
                <md-button color="text" size="x-small">Action 2</md-button>
              </div>
            </md-tooltip>
          </div>

          <h3 class="sub-section-title">Dialog & Snackbar</h3>
          <div class="flexw g16 aic">
            <md-button color="outlined" @click=${() => this.renderRoot.querySelector('#dialog1').show()}>
              <md-icon slot="icon">open_in_browser</md-icon>
              Open Dialog
            </md-button>
            <md-button
              color="outlined"
              @click=${() =>
                snack('Hello world from snackbar!', {
                  action: {
                    label: 'Undo',
                    onClick: () => {
                      console.log('Undo clicked')
                    },
                  },
                  showCloseIcon: true,
                })}>
              <md-icon slot="icon">chat</md-icon>
              Trigger Snackbar
            </md-button>
          </div>

          <md-dialog id="dialog1">
            <div slot="headline">Dialog title</div>
            <form slot="content" id="form-id" method="dialog">A simple dialog with free-form content.</form>
            <div slot="actions">
              <md-button color="text" form="form-id" @click=${() => this.renderRoot.querySelector('#dialog1').close()}>
                Ok
              </md-button>
            </div>
          </md-dialog>
        </section>
      </div>
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
    console.log('SELECTED!', e.target, e.target.value)
  }

  clicked(e) {
    console.log('CLICKED!', e.target, e.target.value)
  }

  clicked2(e) {
    console.log('CLICKED 2', e.target, e.target.value)
  }

  save(e) {
    e.preventDefault()
    console.log('Save button clicked')
    let f1 = this.renderRoot.querySelector('#form1')
    let file1 = this.renderRoot.querySelector('#file1')
    console.log(file1?.value)
    if (!f1.reportValidity()) {
      console.log('Form is invalid')
      return
    }
    snack('Form submitted successfully!', { showCloseIcon: true })
  }

  tabChanged(e) {
    this.activeTab = e.target.activeTabIndex
  }

  renderTabPanel() {
    if (this.activeTab == 0) {
      return html`
        <div class="tabpanel" id="photos-panel" role="tabpanel" aria-labelledby="photos-tab">
          Photos tab content: view your organized photo library.
        </div>
      `
    }
    if (this.activeTab == 1) {
      return html`
        <div class="tabpanel" id="videos-panel" role="tabpanel" aria-labelledby="videos-tab">
          Videos tab content: watch and manage your uploaded video clips.
        </div>
      `
    }
    if (this.activeTab == 2) {
      return html`
        <div class="tabpanel" id="music-panel" role="tabpanel" aria-labelledby="music-tab">
          Music tab content: browse your playlists and audio tracks.
        </div>
      `
    }
  }

  secondaryTabChanged(e) {
    this.secondaryTab = e.target.activeTabIndex
  }

  renderSecondaryTabPanel() {
    if (this.secondaryTab == 0) {
      return html`
        <div class="tabpanel" id="photos-panel2" role="tabpanel" aria-labelledby="photos-tab2">
          Secondary Photos content.
        </div>
      `
    }
    if (this.secondaryTab == 1) {
      return html`
        <div class="tabpanel" id="videos-panel2" role="tabpanel" aria-labelledby="videos-tab2">
          Secondary Videos content.
        </div>
      `
    }
    if (this.secondaryTab == 2) {
      return html`
        <div class="tabpanel" id="music-panel2" role="tabpanel" aria-labelledby="music-tab2">
          Secondary Music content.
        </div>
      `
    }
  }
}

customElements.define('expressive-component', ExpressiveComponent)
