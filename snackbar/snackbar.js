import { html, css, LitElement } from 'lit'
import '../internal/elevation/elevation.js'
import '../buttons/button.js'
import '../buttons/icon-button.js'
import '../icon/icon.js'

let activeSnackbar = null

/**
 * Programmatic helper to display a Material 3 snackbar.
 *
 * @param {string} message - Message text to display.
 * @param {object} [options]
 * @param {number} [options.duration] - Duration in ms before auto-dismissing (non-actionable only, default 5000ms).
 * @param {object} [options.action] - Optional action button { label, onClick, href }.
 * @param {boolean} [options.showCloseIcon] - Whether to show a close icon button.
 * @param {boolean} [options.stacked] - Whether to stack action below the supporting text.
 * @returns {SnackBar} The created snackbar element.
 */
export function snack(message, { duration, action = null, showCloseIcon = false, stacked = false } = {}) {
  // Only one snackbar may be displayed at a time per M3 spec.
  if (activeSnackbar && activeSnackbar.isConnected && activeSnackbar.showing) {
    activeSnackbar.close()
  }

  const snackbar = document.createElement('md-snackbar')
  snackbar.message = message
  if (stacked) snackbar.stacked = true

  // M3: Snackbars with actions must NOT auto-dismiss.
  // Snackbars without actions can auto-dismiss after a sufficient duration (4–10 seconds, default 5000ms).
  if (duration !== undefined) {
    snackbar.duration = duration
  } else if (action || showCloseIcon) {
    snackbar.duration = 0
  } else {
    snackbar.duration = 5000
  }

  if (action) {
    const actionButton = document.createElement('md-button')
    actionButton.color = 'text'
    actionButton.slot = 'action'
    actionButton.classList.add('inverse')
    actionButton.textContent = action.label
    actionButton.addEventListener('click', (event) => {
      if (action.onClick) action.onClick(event)
      snackbar.close()
    })
    if (action.href) actionButton.href = action.href
    snackbar.appendChild(actionButton)
  }

  if (showCloseIcon) {
    snackbar.showCloseIcon = true
    const closeButton = document.createElement('md-icon-button')
    closeButton.slot = 'icon'
    closeButton.setAttribute('aria-label', 'Dismiss')
    const icon = document.createElement('md-icon')
    icon.textContent = 'close'
    closeButton.appendChild(icon)
    closeButton.addEventListener('click', () => {
      snackbar.close()
    })
    snackbar.appendChild(closeButton)
  }

  // Remove element from DOM once it has completed closing transition to prevent DOM leaks
  snackbar.addEventListener(
    'closed',
    () => {
      if (activeSnackbar === snackbar) {
        activeSnackbar = null
      }
      snackbar.remove()
    },
    { once: true },
  )

  activeSnackbar = snackbar
  document.body.appendChild(snackbar)
  snackbar.show()
  return snackbar
}

export class SnackBar extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    #snackbar {
      position: fixed;
      left: 50%;
      bottom: var(--md-snackbar-bottom, 24px);
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
      visibility: hidden;
      min-width: var(--md-snackbar-min-width, var(--md-comp-snackbar-min-width, 288px));
      max-width: var(--md-snackbar-max-width, var(--md-comp-snackbar-max-width, min(568px, calc(100vw - 32px))));
      min-height: var(--md-comp-snackbar-with-single-line-container-height, 48px);
      box-sizing: border-box;
      background-color: var(
        --md-snackbar-container-color,
        var(--md-comp-snackbar-container-color, var(--md-sys-color-inverse-surface, #313033))
      );
      color: var(
        --md-snackbar-supporting-text-color,
        var(--md-comp-snackbar-supporting-text-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
      border-radius: var(
        --md-snackbar-container-shape,
        var(--md-comp-snackbar-container-shape, var(--md-sys-shape-corner-extra-small, 4px))
      );
      z-index: 1000;
      transition:
        transform 150ms cubic-bezier(0.05, 0.7, 0.1, 1),
        opacity 150ms cubic-bezier(0.05, 0.7, 0.1, 1),
        visibility 150ms;
      pointer-events: none;
    }

    #snackbar.open {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }

    #snackbar.closing {
      opacity: 0;
      visibility: hidden;
      transform: translateX(-50%) translateY(20px);
      transition:
        transform 100ms cubic-bezier(0.3, 0, 0.8, 0.15),
        opacity 100ms cubic-bezier(0.3, 0, 0.8, 0.15),
        visibility 100ms;
      pointer-events: none;
    }

    md-elevation {
      --md-elevation-level: var(
        --md-snackbar-container-elevation,
        var(--md-comp-snackbar-container-elevation, var(--md-sys-elevation-level3, 3))
      );
      --md-elevation-shadow-color: var(
        --md-snackbar-container-shadow-color,
        var(--md-comp-snackbar-container-shadow-color, var(--md-sys-color-shadow, #000))
      );
    }

    .inner {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-height: 48px;
      padding-top: 4px;
      padding-bottom: 4px;
      padding-left: 16px;
      padding-right: 8px;
      box-sizing: border-box;
    }

    #snackbar.has-icon .inner {
      padding-right: 12px;
    }

    #snackbar.stacked .inner {
      flex-direction: column;
      align-items: stretch;
      padding-top: 14px;
      padding-bottom: 12px;
      gap: 8px;
    }

    #snackbar.stacked .right {
      align-self: flex-end;
    }

    .message {
      flex: 1 1 auto;
      text-align: start;
      word-break: break-word;
      padding-top: 10px;
      padding-bottom: 10px;
      font: var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400))
        var(--md-sys-typescale-body-medium-size, 0.875rem) / var(--md-sys-typescale-body-medium-line-height, 1.25rem)
        var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto, sans-serif));
      letter-spacing: var(--md-sys-typescale-body-medium-tracking, 0.015625rem);
      color: inherit;
    }

    .right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    ::slotted([slot='action']) {
      --md-button-label-text-color: var(
        --md-snackbar-action-label-text-color,
        var(--md-comp-snackbar-action-label-text-color, var(--md-sys-color-inverse-primary, #d0bcff))
      );
      --md-sys-color-primary: var(
        --md-snackbar-action-label-text-color,
        var(--md-comp-snackbar-action-label-text-color, var(--md-sys-color-inverse-primary, #d0bcff))
      );
      --md-ripple-hover-color: var(
        --md-snackbar-action-label-text-color,
        var(--md-comp-snackbar-action-label-text-color, var(--md-sys-color-inverse-primary, #d0bcff))
      );
      --md-ripple-pressed-color: var(
        --md-snackbar-action-label-text-color,
        var(--md-comp-snackbar-action-label-text-color, var(--md-sys-color-inverse-primary, #d0bcff))
      );
    }

    ::slotted([slot='icon']) {
      --md-icon-button-icon-color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
      --md-icon-button-hover-icon-color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
      --md-icon-button-focus-icon-color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
      --md-icon-button-pressed-icon-color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
      --md-icon-button-hover-state-layer-color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
      --md-icon-button-focus-state-layer-color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
      --md-icon-button-pressed-state-layer-color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
      --md-icon-button-icon-size: var(--md-comp-snackbar-icon-size, 24px);
      color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
    }

    ::slotted(md-icon[slot='icon']) {
      cursor: pointer;
      font-size: 24px;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(
        --md-snackbar-icon-color,
        var(--md-comp-snackbar-icon-color, var(--md-sys-color-inverse-on-surface, #f4eff4))
      );
    }
  `

  static properties = {
    message: { type: String },
    action: { type: Object },
    showCloseIcon: { type: Boolean, attribute: 'show-close-icon' },
    stacked: { type: Boolean, reflect: true },
    duration: { type: Number },
    open: { type: Boolean, reflect: true },
  }

  constructor() {
    super()
    this.message = ''
    this.action = null
    this.showCloseIcon = false
    this.stacked = false
    this.duration = 5000
    this._open = false
    this._closing = false
    this._dismissTimerId = null
    this._openedTimerId = null
    this._closedTimerId = null
  }

  get open() {
    return this._open
  }

  set open(value) {
    const isOpen = Boolean(value)
    if (isOpen === this._open) return
    if (isOpen) {
      this.show()
    } else {
      this.close()
    }
  }

  get showing() {
    return this._open || this._closing
  }

  set showing(val) {
    if (val) {
      this.show()
    } else {
      this.close()
    }
  }

  get hasAction() {
    return Boolean(this.action || this.querySelector('[slot="action"]'))
  }

  get hasCloseIcon() {
    return Boolean(this.showCloseIcon || this.querySelector('[slot="icon"]'))
  }

  connectedCallback() {
    super.connectedCallback()
    if (this._open || this.hasAttribute('open')) {
      this.show()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.clearTimers()
  }

  clearTimers() {
    if (this._dismissTimerId) {
      clearTimeout(this._dismissTimerId)
      this._dismissTimerId = null
    }
    if (this._openedTimerId) {
      clearTimeout(this._openedTimerId)
      this._openedTimerId = null
    }
    if (this._closedTimerId) {
      clearTimeout(this._closedTimerId)
      this._closedTimerId = null
    }
  }

  render() {
    const isStacked = this.stacked
    const hasIcon = this.hasCloseIcon
    const stateClass = this._open ? 'open' : this._closing ? 'closing' : ''
    const classes = [stateClass, isStacked ? 'stacked' : '', hasIcon ? 'has-icon' : ''].filter(Boolean).join(' ')

    return html`
      <div id="snackbar" class="${classes}" role="status" aria-live="polite" aria-atomic="true">
        <md-elevation></md-elevation>
        <div class="inner">
          <div class="message">${this.message ? this.message : html`<slot></slot>`}</div>
          <div class="right">
            <slot name="action"></slot>
            <slot name="icon"></slot>
          </div>
        </div>
      </div>
    `
  }

  async show() {
    if (this._open && !this._closing) return
    this.clearTimers()
    this._closing = false

    this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }))

    if (!this.hasUpdated) {
      this.requestUpdate()
      await this.updateComplete
      // ensure initial hidden layout is established before transition
      this.renderRoot?.getElementById('snackbar')?.getBoundingClientRect()
    }

    this._open = true
    if (!this.hasAttribute('open')) {
      this.setAttribute('open', '')
    }
    this.requestUpdate()

    // M3: Snackbars with actions should NOT auto-dismiss.
    // Only auto-dismiss if non-actionable and duration > 0.
    const isActionable = this.hasAction || this.hasCloseIcon
    if (!isActionable && this.duration > 0 && Number.isFinite(this.duration)) {
      this._dismissTimerId = setTimeout(() => {
        this.close()
      }, this.duration)
    }

    this._openedTimerId = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('opened', { bubbles: true, composed: true }))
    }, 150)
  }

  close() {
    if (!this._open) return
    this.clearTimers()

    this._open = false
    this._closing = true
    this.removeAttribute('open')
    this.requestUpdate()

    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }))

    this._closedTimerId = setTimeout(() => {
      this._closing = false
      this.requestUpdate()
      this.dispatchEvent(new CustomEvent('closed', { bubbles: true, composed: true }))
    }, 100)
  }
}

customElements.define('md-snackbar', SnackBar)
