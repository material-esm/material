import { css, isServer, LitElement } from 'lit'
import { AttachableController } from '../../internal/controller/attachable-controller.js'
/**
 * Events that the focus ring listens to.
 */
const EVENTS = ['focusin', 'focusout', 'pointerdown']
/**
 * A focus ring component.
 *
 * @fires visibility-changed {Event} Fired whenever `visible` changes.
 */
export class FocusRing extends LitElement {
  static properties = {
    visible: { type: Boolean, reflect: true },
    inward: { type: Boolean, reflect: true },
  }
  constructor() {
    super(...arguments)
    /**
     * Makes the focus ring visible.
     */
    this.visible = false
    /**
     * Makes the focus ring animate inwards instead of outwards.
     */
    this.inward = false
    this.attachableController = new AttachableController(this, this.onControlChange.bind(this))
  }
  get htmlFor() {
    return this.attachableController.htmlFor
  }
  set htmlFor(htmlFor) {
    this.attachableController.htmlFor = htmlFor
  }
  get control() {
    return this.attachableController.control
  }
  set control(control) {
    this.attachableController.control = control
  }
  attach(control) {
    this.attachableController.attach(control)
  }
  detach() {
    this.attachableController.detach()
  }
  connectedCallback() {
    super.connectedCallback()
    // Needed for VoiceOver, which will create a "group" if the element is a
    // sibling to other content.
    this.setAttribute('aria-hidden', 'true')
  }
  /** @private */
  handleEvent(event) {
    if (event[HANDLED_BY_FOCUS_RING]) {
      // This ensures the focus ring does not activate when multiple focus rings
      // are used within a single component.
      return
    }
    switch (event.type) {
      default:
        return
      case 'focusin':
        this.visible = this.control?.matches(':focus-visible') ?? false
        break
      case 'focusout':
      case 'pointerdown':
        this.visible = false
        break
    }
    event[HANDLED_BY_FOCUS_RING] = true
  }
  onControlChange(prev, next) {
    if (isServer) return
    for (const event of EVENTS) {
      prev?.removeEventListener(event, this)
      next?.addEventListener(event, this)
    }
  }
  update(changed) {
    if (changed.has('visible')) {
      // This logic can be removed once the `:has` selector has been introduced
      // to Firefox. This is necessary to allow correct submenu styles.
      this.dispatchEvent(new Event('visibility-changed'))
    }
    super.update(changed)
  }
  static styles = [
    css`
      :host {
        animation-delay: 0s, calc(var(--md-focus-ring-duration, 600ms) * 0.25);
        animation-duration: calc(var(--md-focus-ring-duration, 600ms) * 0.25),
          calc(var(--md-focus-ring-duration, 600ms) * 0.75);
        animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
        box-sizing: border-box;
        color: var(--md-focus-ring-color, var(--md-sys-color-secondary, #625b71));
        display: none;
        pointer-events: none;
        position: absolute;
      }
      :host([visible]) {
        display: flex;
      }
      :host(:not([inward])) {
        animation-name: outward-grow, outward-shrink;
        border-end-end-radius: calc(
          var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) +
            var(--md-focus-ring-outward-offset, 2px)
        );
        border-end-start-radius: calc(
          var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) +
            var(--md-focus-ring-outward-offset, 2px)
        );
        border-start-end-radius: calc(
          var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) +
            var(--md-focus-ring-outward-offset, 2px)
        );
        border-start-start-radius: calc(
          var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) +
            var(--md-focus-ring-outward-offset, 2px)
        );
        inset: calc(-1 * var(--md-focus-ring-outward-offset, 2px));
        outline: var(--md-focus-ring-width, 3px) solid currentColor;
      }
      :host([inward]) {
        animation-name: inward-grow, inward-shrink;
        border-end-end-radius: calc(
          var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) -
            var(--md-focus-ring-inward-offset, 0px)
        );
        border-end-start-radius: calc(
          var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) -
            var(--md-focus-ring-inward-offset, 0px)
        );
        border-start-end-radius: calc(
          var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) -
            var(--md-focus-ring-inward-offset, 0px)
        );
        border-start-start-radius: calc(
          var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) -
            var(--md-focus-ring-inward-offset, 0px)
        );
        border: var(--md-focus-ring-width, 3px) solid currentColor;
        inset: var(--md-focus-ring-inward-offset, 0px);
      }
      @keyframes outward-grow {
        from {
          outline-width: 0;
        }
        to {
          outline-width: var(--md-focus-ring-active-width, 8px);
        }
      }
      @keyframes outward-shrink {
        from {
          outline-width: var(--md-focus-ring-active-width, 8px);
        }
      }
      @keyframes inward-grow {
        from {
          border-width: 0;
        }
        to {
          border-width: var(--md-focus-ring-active-width, 8px);
        }
      }
      @keyframes inward-shrink {
        from {
          border-width: var(--md-focus-ring-active-width, 8px);
        }
      }
      @media (prefers-reduced-motion) {
        :host {
          animation: none;
        }
      }
    `,
  ]
}
const HANDLED_BY_FOCUS_RING = Symbol('handledByFocusRing')

customElements.define('md-focus-ring', FocusRing)
