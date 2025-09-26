import { html, css, LitElement } from 'lit'
import '../buttons/button.js'

export function snack(message, { duration = 3000, action = null, showCloseIcon = false } = {}) {
  // console.log('duration:', duration, 'action:', action, 'showCloseIcon', showCloseIcon)
  let snack = document.createElement('md-snackbar')
  // const x = document.getElementById("snackbar")
  snack.message = message
  snack.duration = duration
  if (action) {
    let actionButton = document.createElement('md-button')
    actionButton.type = 'text'
    actionButton.slot = 'action'
    actionButton.innerText = action.label
    if (action.onClick) actionButton.addEventListener('click', action.onClick)
    if (action.href) actionButton.href = action.href
    snack.insertAdjacentElement('beforeend', actionButton)
  }
  if (showCloseIcon) {
    let closeButton = document.createElement('md-icon')
    closeButton.slot = 'icon'
    closeButton.innerText = 'close'
    closeButton.addEventListener('click', () => {
      snack.close()
    })
    snack.insertAdjacentElement('beforeend', closeButton)
  }
  document.body.appendChild(snack)
  snack.show()
}

class SnackBar extends LitElement {
  static styles = css`
    #snackbar {
      /* visibility: hidden; */
      min-width: 250px;
      transform: translateX(-50%); /* centers the div */
      background-color: var(--md-sys-color-inverse-surface, #333);
      color: var(--md-sys-color-inverse-on-surface, white);
      text-align: center;
      border-radius: 4px;
      position: fixed;
      z-index: 1000;
      left: 50%;
      bottom: 30px;
      height: 48px;
    }

    .inner {
      margin-left: 16px;
      margin-right: 8px;
      display: flex;
      gap: 8px;
      justify-content: space-between;
      align-items: center;
      height: 100%;
    }

    .right {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-right: 4px;
    }

    #snackbar.show {
      /* visibility: visible; */
    }

    @keyframes fadein {
      from {
        bottom: 0;
        opacity: 0;
      }
      to {
        bottom: 30px;
        opacity: 1;
      }
    }

    @keyframes fadeout {
      from {
        bottom: 30px;
        opacity: 1;
      }
      to {
        bottom: 0;
        opacity: 0;
      }
    }
  `

  static properties = {
    message: { type: String },
    action: { type: Object },
    showCloseIcon: { type: Boolean },

    showing: { type: Boolean },
    duration: { type: Number },
    open: { type: Boolean },
  }

  constructor() {
    super()
    this.message = ''
    this.action = null
    this.showCloseIcon = false
    this.showing = false
    this.duration = 6000
    this.open = false
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.open) this.show()
  }

  render() {
    if (!this.showing) return ''
    let animStyle = `animation: fadein 0.5s` // , fadeout 0.5s ${this.duration}ms forwards;`
    return html`
      <div id="snackbar" class="show" style="${animStyle}">
        <div class="inner">
          <div>${this.message}</div>
          <div class="right">
            <slot name="action"></slot>
            <slot name="icon"></slot>
          </div>
        </div>
      </div>
    `
  }

  show() {
    this.showing = true
    // var x = this.renderRoot.getElementById("snackbar")
    // x.className = "show"
    // x.style.setProperty('-webkit-animation', 'fadein 0.5s, fadeout 0.5s 2.5s')
    // x.style.setProperty('animation', 'fadein 0.5s, fadeout 0.5s 2.5s')
    // console.log("after show")
    if (this.duration > 0 && !this.showCloseIcon) {
      setTimeout(() => {
        // check if X is slotted
        let islot = this.renderRoot.querySelector('slot[name="icon"]')
        if (!islot) return // race condition between explicit closing and timed closing
        if (islot.assignedElements().length == 0) {
          this.close()
        }
      }, this.duration + 500) // added 500 for enough time to fade out. forwards makes it keep the final state. https://stackoverflow.com/questions/12991164/maintaining-the-final-state-at-end-of-a-css-animation
    }
  }

  close() {
    var x = this.renderRoot.getElementById('snackbar')
    x.style.setProperty('animation', 'fadeout 0.5s forwards')
    setTimeout(() => {
      this.showing = false
    }, 1000)
  }
}

customElements.define('md-snackbar', SnackBar)
