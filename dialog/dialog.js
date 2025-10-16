/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../divider/divider.js'
import { html, isServer, LitElement, nothing, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { redispatchEvent } from '../internal/events/redispatch-event.js'
import { DIALOG_DEFAULT_CLOSE_ANIMATION, DIALOG_DEFAULT_OPEN_ANIMATION } from './internal/animations.js'
/**
 * A dialog component.
 *
 * @fires open {Event} Dispatched when the dialog is opening before any animations.
 * @fires opened {Event} Dispatched when the dialog has opened after any animations.
 * @fires close {Event} Dispatched when the dialog is closing before any animations.
 * @fires closed {Event} Dispatched when the dialog has closed after any animations.
 * @fires cancel {Event} Dispatched when the dialog has been canceled by clicking
 * on the scrim or pressing Escape.
 */
export class Dialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    quick: { type: Boolean, reflect: true },
    returnValue: { type: String },
    type: { type: String },
  }

  /**
   * Opens the dialog when set to `true` and closes it when set to `false`.
   */
  get open() {
    return this.isOpen
  }
  set open(open) {
    if (open === this.isOpen) {
      return
    }
    this.isOpen = open
    if (open) {
      this.setAttribute('open', '')
      this.show()
    } else {
      this.removeAttribute('open')
      this.close()
    }
  }
  constructor() {
    super()
    /**
     * Skips the opening and closing animations.
     */
    this.quick = false
    /**
     * Gets or sets the dialog's return value, usually to indicate which button
     * a user pressed to close it.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/returnValue
     */
    this.returnValue = ''
    /**
     * Gets the opening animation for a dialog. Set to a new function to customize
     * the animation.
     */
    this.getOpenAnimation = () => DIALOG_DEFAULT_OPEN_ANIMATION
    /**
     * Gets the closing animation for a dialog. Set to a new function to customize
     * the animation.
     */
    this.getCloseAnimation = () => DIALOG_DEFAULT_CLOSE_ANIMATION
    this.isOpen = false
    this.isOpening = false
    this.isConnectedPromise = this.getIsConnectedPromise()
    this.isAtScrollTop = false
    this.isAtScrollBottom = false
    this.nextClickIsFromContent = false
    // Dialogs should not be SSR'd while open, so we can just use runtime checks.
    this.hasHeadline = false
    this.hasActions = false
    this.hasIcon = false
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=1512224
    // Chrome v120 has a bug where escape keys do not trigger cancels. If we get
    // a dialog "close" event that is triggered without a "cancel" after an escape
    // keydown, then we need to manually trigger our closing logic.
    //
    // This bug occurs when pressing escape to close a dialog without first
    // interacting with the dialog's content.
    //
    // Cleanup tracking:
    // https://github.com/material-components/material-web/issues/5330
    // This can be removed when full CloseWatcher support added and the above bug
    // in Chromium is fixed to fire 'cancel' with one escape press and close with
    // multiple.
    this.escapePressedWithoutCancel = false
    if (!isServer) {
      this.addEventListener('submit', this.handleSubmit)
      // We do not use `delegatesFocus: true` due to a Chromium bug with
      // selecting text.
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=950357
      //
      // Material requires using focus trapping within the dialog (see
      // b/314840853 for the bug to add it). This would normally mean we don't
      // care about delegating focus since the `<dialog>` never receives it.
      // However, we still need to handle situations when a user has not
      // provided an focusable child in the content. When that happens, the
      // `<dialog>` itself is focused.
      //
      // Listen to focus/blur instead of focusin/focusout since those can bubble
      // from content.
      this.addEventListener('focus', () => {
        this.dialog?.focus()
      })
      this.addEventListener('blur', () => {
        this.dialog?.blur()
      })
    }
  }
  /**
   * Opens the dialog and fires a cancelable `open` event. After a dialog's
   * animation, an `opened` event is fired.
   *
   * Add an `autofocus` attribute to a child of the dialog that should
   * receive focus after opening.
   *
   * @return A Promise that resolves after the animation is finished and the
   *     `opened` event was fired.
   */
  async show() {
    this.isOpening = true
    // Dialogs can be opened before being attached to the DOM, so we need to
    // wait until we're connected before calling `showModal()`.
    await this.isConnectedPromise
    await this.updateComplete
    const dialog = this.dialog
    // Check if already opened or if `dialog.close()` was called while awaiting.
    if (dialog.open || !this.isOpening) {
      this.isOpening = false
      return
    }
    const preventOpen = !this.dispatchEvent(new Event('open', { cancelable: true }))
    if (preventOpen) {
      this.open = false
      return
    }
    // All Material dialogs are modal.
    dialog.showModal()
    this.open = true
    // Reset scroll position if re-opening a dialog with the same content.
    if (this.scroller) {
      this.scroller.scrollTop = 0
    }
    // Native modal dialogs ignore autofocus and instead force focus to the
    // first focusable child. Override this behavior if there is a child with
    // an autofocus attribute.
    this.querySelector('[autofocus]')?.focus()
    await this.animateDialog(this.getOpenAnimation())
    this.dispatchEvent(new Event('opened'))
    this.isOpening = false
  }
  /**
   * Closes the dialog and fires a cancelable `close` event. After a dialog's
   * animation, a `closed` event is fired.
   *
   * @param returnValue A return value usually indicating which button was used
   *     to close a dialog. If a dialog is canceled by clicking the scrim or
   *     pressing Escape, it will not change the return value after closing.
   * @return A Promise that resolves after the animation is finished and the
   *     `closed` event was fired.
   */
  async close(returnValue = this.returnValue) {
    this.isOpening = false
    if (!this.isConnected) {
      // Disconnected dialogs do not fire close events or animate.
      this.open = false
      return
    }
    await this.updateComplete
    const dialog = this.dialog
    // Check if already closed or if `dialog.show()` was called while awaiting.
    if (!dialog.open || this.isOpening) {
      this.open = false
      return
    }
    const prevReturnValue = this.returnValue
    this.returnValue = returnValue
    const preventClose = !this.dispatchEvent(new Event('close', { cancelable: true }))
    if (preventClose) {
      this.returnValue = prevReturnValue
      return
    }
    await this.animateDialog(this.getCloseAnimation())
    dialog.close(returnValue)
    this.open = false
    this.dispatchEvent(new Event('closed'))
  }
  connectedCallback() {
    super.connectedCallback()
    this.isConnectedPromiseResolve()
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    this.isConnectedPromise = this.getIsConnectedPromise()
  }
  render() {
    const scrollable = this.open && !(this.isAtScrollTop && this.isAtScrollBottom)
    const classes = {
      'has-headline': this.hasHeadline,
      'has-actions': this.hasActions,
      'has-icon': this.hasIcon,
      scrollable: scrollable,
      'show-top-divider': scrollable && !this.isAtScrollTop,
      'show-bottom-divider': scrollable && !this.isAtScrollBottom,
    }
    const { ariaLabel } = this
    return html`
      <div class="scrim"></div>
      <dialog
        class=${classMap(classes)}
        aria-label=${ariaLabel || nothing}
        aria-labelledby=${this.hasHeadline ? 'headline' : nothing}
        role=${this.type === 'alert' ? 'alertdialog' : nothing}
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
        @close=${this.handleClose}
        @keydown=${this.handleKeydown}
        .returnValue=${this.returnValue || nothing}
      >
        <div class="container" @click=${this.handleContentClick}>
          <div class="headline">
            <div class="icon" aria-hidden="true">
              <slot name="icon" @slotchange=${this.handleIconChange}></slot>
            </div>
            <h2 id="headline" aria-hidden=${!this.hasHeadline || nothing}>
              <slot name="headline" @slotchange=${this.handleHeadlineChange}></slot>
            </h2>
            <md-divider></md-divider>
          </div>
          <div class="scroller">
            <div class="content">
              <div class="top anchor"></div>
              <slot name="content"></slot>
              <div class="bottom anchor"></div>
            </div>
          </div>
          <div class="actions">
            <md-divider></md-divider>
            <slot name="actions" @slotchange=${this.handleActionsChange}></slot>
          </div>
        </div>
      </dialog>
    `
  }
  firstUpdated() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          this.handleAnchorIntersection(entry)
        }
      },
      { root: this.scroller },
    )
    this.intersectionObserver.observe(this.topAnchor)
    this.intersectionObserver.observe(this.bottomAnchor)
  }
  handleDialogClick() {
    if (this.nextClickIsFromContent) {
      // Avoid doing a layout calculation below if we know the click came from
      // content.
      this.nextClickIsFromContent = false
      return
    }
    // Click originated on the backdrop. Native `<dialog>`s will not cancel,
    // but Material dialogs do.
    const preventDefault = !this.dispatchEvent(new Event('cancel', { cancelable: true }))
    if (preventDefault) {
      return
    }
    this.close()
  }
  handleContentClick() {
    this.nextClickIsFromContent = true
  }
  handleSubmit(event) {
    const form = event.target
    const { submitter } = event
    if (form.method !== 'dialog' || !submitter) {
      return
    }
    // Close reason is the submitter's value attribute, or the dialog's
    // `returnValue` if there is no attribute.
    this.close(submitter.getAttribute('value') ?? this.returnValue)
  }
  handleCancel(event) {
    if (event.target !== this.dialog) {
      // Ignore any cancel events dispatched by content.
      return
    }
    this.escapePressedWithoutCancel = false
    const preventDefault = !redispatchEvent(this, event)
    // We always prevent default on the original dialog event since we'll
    // animate closing it before it actually closes.
    event.preventDefault()
    if (preventDefault) {
      return
    }
    this.close()
  }
  handleClose() {
    if (!this.escapePressedWithoutCancel) {
      return
    }
    this.escapePressedWithoutCancel = false
    this.dialog?.dispatchEvent(new Event('cancel', { cancelable: true }))
  }
  handleKeydown(event) {
    if (event.key !== 'Escape') {
      return
    }
    // An escape key was pressed. If a "close" event fires next without a
    // "cancel" event first, then we know we're in the Chrome v120 bug.
    this.escapePressedWithoutCancel = true
    // Wait a full task for the cancel/close event listeners to fire, then
    // reset the flag.
    setTimeout(() => {
      this.escapePressedWithoutCancel = false
    })
  }
  async animateDialog(animation) {
    // Always cancel the previous animations. Animations can include `fill`
    // modes that need to be cleared when `quick` is toggled. If not, content
    // that faded out will remain hidden when a `quick` dialog re-opens after
    // previously opening and closing without `quick`.
    this.cancelAnimations?.abort()
    this.cancelAnimations = new AbortController()
    if (this.quick) {
      return
    }
    const { dialog, scrim, container, headline, content, actions } = this
    if (!dialog || !scrim || !container || !headline || !content || !actions) {
      return
    }
    const {
      container: containerAnimate,
      dialog: dialogAnimate,
      scrim: scrimAnimate,
      headline: headlineAnimate,
      content: contentAnimate,
      actions: actionsAnimate,
    } = animation
    const elementAndAnimation = [
      [dialog, dialogAnimate ?? []],
      [scrim, scrimAnimate ?? []],
      [container, containerAnimate ?? []],
      [headline, headlineAnimate ?? []],
      [content, contentAnimate ?? []],
      [actions, actionsAnimate ?? []],
    ]
    const animations = []
    for (const [element, animation] of elementAndAnimation) {
      for (const animateArgs of animation) {
        const animation = element.animate(...animateArgs)
        this.cancelAnimations.signal.addEventListener('abort', () => {
          animation.cancel()
        })
        animations.push(animation)
      }
    }
    await Promise.all(
      animations.map((animation) =>
        animation.finished.catch(() => {
          // Ignore intentional AbortErrors when calling `animation.cancel()`.
        }),
      ),
    )
  }
  handleHeadlineChange(event) {
    const slot = event.target
    this.hasHeadline = slot.assignedElements().length > 0
  }
  handleActionsChange(event) {
    const slot = event.target
    this.hasActions = slot.assignedElements().length > 0
  }
  handleIconChange(event) {
    const slot = event.target
    this.hasIcon = slot.assignedElements().length > 0
  }
  handleAnchorIntersection(entry) {
    const { target, isIntersecting } = entry
    if (target === this.topAnchor) {
      this.isAtScrollTop = isIntersecting
    }
    if (target === this.bottomAnchor) {
      this.isAtScrollBottom = isIntersecting
    }
  }
  getIsConnectedPromise() {
    return new Promise((resolve) => {
      this.isConnectedPromiseResolve = resolve
    })
  }
  get topAnchor() {
    return this.renderRoot.querySelector('.top.anchor')
  }
  get bottomAnchor() {
    return this.renderRoot.querySelector('.bottom.anchor')
  }

  get dialog() {
    return this.renderRoot.querySelector('dialog')
  }

  get scrim() {
    return this.renderRoot.querySelector('.scrim')
  }

  static styles = [
    css`
      :host {
        border-start-start-radius: var(
          --md-dialog-container-shape-start-start,
          var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        border-start-end-radius: var(
          --md-dialog-container-shape-start-end,
          var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        border-end-end-radius: var(
          --md-dialog-container-shape-end-end,
          var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        border-end-start-radius: var(
          --md-dialog-container-shape-end-start,
          var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px))
        );
        display: contents;
        margin: auto;
        max-height: min(560px, 100% - 48px);
        max-width: min(560px, 100% - 48px);
        min-height: 140px;
        min-width: 280px;
        position: fixed;
        height: fit-content;
        width: fit-content;
      }
      dialog {
        background: rgba(0, 0, 0, 0);
        border: none;
        border-radius: inherit;
        flex-direction: column;
        height: inherit;
        margin: inherit;
        max-height: inherit;
        max-width: inherit;
        min-height: inherit;
        min-width: inherit;
        outline: none;
        overflow: visible;
        padding: 0;
        width: inherit;
      }
      dialog[open] {
        display: flex;
      }
      ::backdrop {
        background: none;
      }
      .scrim {
        background: var(--md-sys-color-scrim, #000);
        display: none;
        inset: 0;
        opacity: 32%;
        pointer-events: none;
        position: fixed;
        z-index: 1;
      }
      :host([open]) .scrim {
        display: flex;
      }
      h2 {
        all: unset;
        align-self: stretch;
      }
      .headline {
        align-items: center;
        color: var(--md-dialog-headline-color, var(--md-sys-color-on-surface, #1d1b20));
        display: flex;
        flex-direction: column;
        font-family: var(
          --md-dialog-headline-font,
          var(--md-sys-typescale-headline-small-font, var(--md-ref-typeface-brand, Roboto))
        );
        font-size: var(--md-dialog-headline-size, var(--md-sys-typescale-headline-small-size, 1.5rem));
        line-height: var(--md-dialog-headline-line-height, var(--md-sys-typescale-headline-small-line-height, 2rem));
        font-weight: var(
          --md-dialog-headline-weight,
          var(--md-sys-typescale-headline-small-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        position: relative;
      }
      slot[name='headline']::slotted(*) {
        align-items: center;
        align-self: stretch;
        box-sizing: border-box;
        display: flex;
        gap: 8px;
        padding: 24px 24px 0;
      }
      .icon {
        display: flex;
      }
      slot[name='icon']::slotted(*) {
        color: var(--md-dialog-icon-color, var(--md-sys-color-secondary, #625b71));
        fill: currentColor;
        font-size: var(--md-dialog-icon-size, 24px);
        margin-top: 24px;
        height: var(--md-dialog-icon-size, 24px);
        width: var(--md-dialog-icon-size, 24px);
      }
      .has-icon slot[name='headline']::slotted(*) {
        justify-content: center;
        padding-top: 16px;
      }
      .scrollable slot[name='headline']::slotted(*) {
        padding-bottom: 16px;
      }
      .scrollable.has-headline slot[name='content']::slotted(*) {
        padding-top: 8px;
      }
      .container {
        border-radius: inherit;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
        position: relative;
        transform-origin: top;
      }
      .container::before {
        background: var(--md-dialog-container-color, var(--md-sys-color-surface-container-high, #ece6f0));
        border-radius: inherit;
        content: '';
        inset: 0;
        position: absolute;
      }
      .scroller {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
        z-index: 1;
      }
      .scrollable .scroller {
        overflow-y: scroll;
      }
      .content {
        color: var(--md-dialog-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));
        font-family: var(
          --md-dialog-supporting-text-font,
          var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto))
        );
        font-size: var(--md-dialog-supporting-text-size, var(--md-sys-typescale-body-medium-size, 0.875rem));
        line-height: var(
          --md-dialog-supporting-text-line-height,
          var(--md-sys-typescale-body-medium-line-height, 1.25rem)
        );
        font-weight: var(
          --md-dialog-supporting-text-weight,
          var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400))
        );
        height: min-content;
        position: relative;
      }
      slot[name='content']::slotted(*) {
        box-sizing: border-box;
        padding: 24px;
      }
      .anchor {
        position: absolute;
      }
      .top.anchor {
        top: 0;
      }
      .bottom.anchor {
        bottom: 0;
      }
      .actions {
        position: relative;
      }
      slot[name='actions']::slotted(*) {
        box-sizing: border-box;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding: 16px 24px 24px;
      }
      .has-actions slot[name='content']::slotted(*) {
        padding-bottom: 8px;
      }
      md-divider {
        display: none;
        position: absolute;
      }
      .has-headline.show-top-divider .headline md-divider,
      .has-actions.show-bottom-divider .actions md-divider {
        display: flex;
      }
      .headline md-divider {
        bottom: 0;
      }
      .actions md-divider {
        top: 0;
      }
      @media (forced-colors: active) {
        dialog {
          outline: 2px solid WindowText;
        }
      }
    `,
  ]
}
;(() => {
  requestUpdateOnAriaChange(Dialog)
})()

// __decorate([
//     query('dialog')
// ], Dialog.prototype, "dialog", void 0);
// __decorate([
//     query('.scrim')
// ], Dialog.prototype, "scrim", void 0);
// __decorate([
//     query('.container')
// ], Dialog.prototype, "container", void 0);
// __decorate([
//     query('.headline')
// ], Dialog.prototype, "headline", void 0);
// __decorate([
//     query('.content')
// ], Dialog.prototype, "content", void 0);
// __decorate([
//     query('.actions')
// ], Dialog.prototype, "actions", void 0);
// __decorate([
//     state()
// ], Dialog.prototype, "isAtScrollTop", void 0);
// __decorate([
//     state()
// ], Dialog.prototype, "isAtScrollBottom", void 0);
// __decorate([
//     query('.scroller')
// ], Dialog.prototype, "scroller", void 0);
// __decorate([
//     query('.top.anchor')
// ], Dialog.prototype, "topAnchor", void 0);
// __decorate([
//     query('.bottom.anchor')
// ], Dialog.prototype, "bottomAnchor", void 0);
// __decorate([
//     state()
// ], Dialog.prototype, "hasHeadline", void 0);
// __decorate([
//     state()
// ], Dialog.prototype, "hasActions", void 0);
// __decorate([
//     state()
// ], Dialog.prototype, "hasIcon", void 0);

customElements.define('md-dialog', Dialog)
