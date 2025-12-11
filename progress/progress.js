import { html, LitElement, nothing, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { styleMap } from 'lit/directives/style-map.js'
/**
 * A progress component.
 */
export class Progress extends LitElement {
  static properties = {
    type: { type: String, reflect: true },
    value: { type: Number },
    max: { type: Number },
    indeterminate: { type: Boolean },
    fourColor: { type: Boolean, attribute: 'four-color' },
    buffer: { type: Number },
  }
  constructor() {
    super(...arguments)
    this.type = 'circular'
    /**
     * Progress to display, a fraction between 0 and `max`.
     */
    this.value = 0
    /**
     * Maximum progress to display, defaults to 1.
     */
    this.max = 1
    /**
     * Whether or not to display indeterminate progress, which gives no indication
     * to how long an activity will take.
     */
    this.indeterminate = false
    /**
     * Whether or not to render indeterminate mode using 4 colors instead of one.
     */
    this.fourColor = false
    /**
     * Buffer amount to display, a fraction between 0 and `max`.
     * If the value is 0 or negative, the buffer is not displayed.
     */
    this.buffer = 0
  }
  render() {
    // Needed for closure conformance
    const { ariaLabel } = this
    return html`
      <div
        class="progress ${classMap(this.getRenderClasses())}"
        role="progressbar"
        aria-label="${ariaLabel || nothing}"
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.indeterminate ? nothing : this.value}
      >
        ${this.renderIndicator()}
      </div>
    `
  }
  getRenderClasses() {
    return {
      indeterminate: this.indeterminate,
      'four-color': this.fourColor,
      circular: this.type === 'circular',
      linear: this.type === 'linear',
    }
  }
  renderIndicator() {
    if (this.type == 'linear') {
      return this.renderLinearIndicator()
    } else {
      return this.renderCircularIndicator()
    }
  }
  renderCircularIndicator() {
    if (this.indeterminate) {
      return this.renderIndeterminateContainer()
    }
    return this.renderDeterminateContainer()
  }
  // Determinate mode is rendered with an svg so the progress arc can be
  // easily animated via stroke-dashoffset.
  renderDeterminateContainer() {
    const dashOffset = (1 - this.value / this.max) * 100
    // note, dash-array/offset are relative to Setting `pathLength` but
    // Chrome seems to render this inaccurately and using a large viewbox helps.
    return html`
      <svg viewBox="0 0 4800 4800">
        <circle class="track" pathLength="100"></circle>
        <circle class="active-track" pathLength="100" stroke-dashoffset=${dashOffset}></circle>
      </svg>
    `
  }
  // Indeterminate mode rendered with 2 bordered-divs. The borders are
  // clipped into half circles by their containers. The divs are then carefully
  // animated to produce changes to the spinner arc size.
  // This approach has 4.5x the FPS of rendering via svg on Chrome 111.
  // See https://lit.dev/playground/#gist=febb773565272f75408ab06a0eb49746.
  renderIndeterminateContainer() {
    return html` <div class="spinner">
      <div class="left">
        <div class="circle"></div>
      </div>
      <div class="right">
        <div class="circle"></div>
      </div>
    </div>`
  }

  renderLinearIndicator() {
    // Note, the indeterminate animation is rendered with transform %'s
    // Previously, this was optimized to use px calculated with the resizeObserver
    // due to a now fixed Chrome bug: crbug.com/389359.
    const progressStyles = {
      transform: `scaleX(${(this.indeterminate ? 1 : this.value / this.max) * 100}%)`,
    }
    const bufferValue = this.buffer ?? 0
    const hasBuffer = bufferValue > 0
    const dotSize = this.indeterminate || !hasBuffer ? 1 : bufferValue / this.max
    const dotStyles = {
      transform: `scaleX(${dotSize * 100}%)`,
    }
    // Only display dots when visible - this prevents invisible infinite
    // animation.
    const hideDots = this.indeterminate || !hasBuffer || bufferValue >= this.max || this.value >= this.max
    return html`
      <div class="dots" ?hidden=${hideDots}></div>
      <div class="inactive-track" style=${styleMap(dotStyles)}></div>
      <div class="bar primary-bar" style=${styleMap(progressStyles)}>
        <div class="bar-inner"></div>
      </div>
      <div class="bar secondary-bar">
        <div class="bar-inner"></div>
      </div>
    `
  }

  static styles = [
    css`
      :host([type='circular']) {
        --_active-indicator-color: var(
          --md-circular-progress-active-indicator-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_active-indicator-width: var(--md-circular-progress-active-indicator-width, 10);
        --_four-color-active-indicator-four-color: var(
          --md-circular-progress-four-color-active-indicator-four-color,
          var(--md-sys-color-tertiary-container, #ffd8e4)
        );
        --_four-color-active-indicator-one-color: var(
          --md-circular-progress-four-color-active-indicator-one-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_four-color-active-indicator-three-color: var(
          --md-circular-progress-four-color-active-indicator-three-color,
          var(--md-sys-color-tertiary, #7d5260)
        );
        --_four-color-active-indicator-two-color: var(
          --md-circular-progress-four-color-active-indicator-two-color,
          var(--md-sys-color-primary-container, #eaddff)
        );
        --_size: var(--md-circular-progress-size, 48px);
        display: inline-flex;
        vertical-align: middle;
        width: var(--_size);
        height: var(--_size);
        position: relative;
        align-items: center;
        justify-content: center;
        contain: strict;
        content-visibility: auto;
      }
      .progress {
        flex: 1;
        align-self: stretch;
        margin: 4px;
      }
      .progress,
      .spinner,
      .left,
      .right,
      .circle,
      svg,
      .track,
      .active-track {
        position: absolute;
        inset: 0;
      }
      svg {
        transform: rotate(-90deg);
      }
      circle {
        cx: 50%;
        cy: 50%;
        r: calc(50% * (1 - var(--_active-indicator-width) / 100));
        stroke-width: calc(var(--_active-indicator-width) * 1%);
        stroke-dasharray: 100;
        fill: rgba(0, 0, 0, 0);
      }
      .active-track {
        transition: stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);
        stroke: var(--_active-indicator-color);
      }
      .track {
        stroke: rgba(0, 0, 0, 0);
      }
      .progress.indeterminate {
        animation: linear infinite linear-rotate;
        animation-duration: 1568.2352941176ms;
      }
      .spinner {
        animation: infinite both rotate-arc;
        animation-duration: 5332ms;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      .left {
        overflow: hidden;
        inset: 0 50% 0 0;
      }
      .right {
        overflow: hidden;
        inset: 0 0 0 50%;
      }
      .circle {
        box-sizing: border-box;
        border-radius: 50%;
        border: solid calc(var(--_active-indicator-width) / 100 * (var(--_size) - 8px));
        border-color: var(--_active-indicator-color) var(--_active-indicator-color) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);
        animation: expand-arc;
        animation-iteration-count: infinite;
        animation-fill-mode: both;
        animation-duration: 1333ms, 5332ms;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      .four-color .circle {
        animation-name: expand-arc, four-color;
      }
      .left .circle {
        rotate: 135deg;
        inset: 0 -100% 0 0;
      }
      .right .circle {
        rotate: 100deg;
        inset: 0 0 0 -100%;
        animation-delay: -666.5ms, 0ms;
      }
      @media (forced-colors: active) {
        .active-track {
          stroke: CanvasText;
        }
        .circle {
          border-color: CanvasText CanvasText Canvas Canvas;
        }
      }
      @keyframes expand-arc {
        0% {
          transform: rotate(265deg);
        }
        50% {
          transform: rotate(130deg);
        }
        100% {
          transform: rotate(265deg);
        }
      }
      @keyframes rotate-arc {
        12.5% {
          transform: rotate(135deg);
        }
        25% {
          transform: rotate(270deg);
        }
        37.5% {
          transform: rotate(405deg);
        }
        50% {
          transform: rotate(540deg);
        }
        62.5% {
          transform: rotate(675deg);
        }
        75% {
          transform: rotate(810deg);
        }
        87.5% {
          transform: rotate(945deg);
        }
        100% {
          transform: rotate(1080deg);
        }
      }
      @keyframes linear-rotate {
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes four-color {
        0% {
          border-top-color: var(--_four-color-active-indicator-one-color);
          border-right-color: var(--_four-color-active-indicator-one-color);
        }
        15% {
          border-top-color: var(--_four-color-active-indicator-one-color);
          border-right-color: var(--_four-color-active-indicator-one-color);
        }
        25% {
          border-top-color: var(--_four-color-active-indicator-two-color);
          border-right-color: var(--_four-color-active-indicator-two-color);
        }
        40% {
          border-top-color: var(--_four-color-active-indicator-two-color);
          border-right-color: var(--_four-color-active-indicator-two-color);
        }
        50% {
          border-top-color: var(--_four-color-active-indicator-three-color);
          border-right-color: var(--_four-color-active-indicator-three-color);
        }
        65% {
          border-top-color: var(--_four-color-active-indicator-three-color);
          border-right-color: var(--_four-color-active-indicator-three-color);
        }
        75% {
          border-top-color: var(--_four-color-active-indicator-four-color);
          border-right-color: var(--_four-color-active-indicator-four-color);
        }
        90% {
          border-top-color: var(--_four-color-active-indicator-four-color);
          border-right-color: var(--_four-color-active-indicator-four-color);
        }
        100% {
          border-top-color: var(--_four-color-active-indicator-one-color);
          border-right-color: var(--_four-color-active-indicator-one-color);
        }
      }
    `,
    css`
      :host([type='linear']) {
        --_active-indicator-color: var(
          --md-linear-progress-active-indicator-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_active-indicator-height: var(--md-linear-progress-active-indicator-height, 4px);
        --_four-color-active-indicator-four-color: var(
          --md-linear-progress-four-color-active-indicator-four-color,
          var(--md-sys-color-tertiary-container, #ffd8e4)
        );
        --_four-color-active-indicator-one-color: var(
          --md-linear-progress-four-color-active-indicator-one-color,
          var(--md-sys-color-primary, #6750a4)
        );
        --_four-color-active-indicator-three-color: var(
          --md-linear-progress-four-color-active-indicator-three-color,
          var(--md-sys-color-tertiary, #7d5260)
        );
        --_four-color-active-indicator-two-color: var(
          --md-linear-progress-four-color-active-indicator-two-color,
          var(--md-sys-color-primary-container, #eaddff)
        );
        --_track-color: var(--md-linear-progress-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));
        --_track-height: var(--md-linear-progress-track-height, 4px);
        --_track-shape: var(--md-linear-progress-track-shape, var(--md-sys-shape-corner-none, 0px));
        border-radius: var(--_track-shape);
        display: flex;
        position: relative;
        min-width: 80px;
        height: var(--_track-height);
        content-visibility: auto;
        contain: strict;
      }
      .linear.progress,
      .dots,
      .inactive-track,
      .bar,
      .bar-inner {
        position: absolute;
      }
      .linear.progress {
        direction: ltr;
        inset: 0;
        border-radius: inherit;
        overflow: hidden;
        display: flex;
        align-items: center;
        margin: 0;
      }
      .bar {
        animation: none;
        width: 100%;
        height: var(--_active-indicator-height);
        transform-origin: left center;
        transition: transform 250ms cubic-bezier(0.4, 0, 0.6, 1);
      }
      .secondary-bar {
        display: none;
      }
      .bar-inner {
        inset: 0;
        animation: none;
        background: var(--_active-indicator-color);
      }
      .inactive-track {
        background: var(--_track-color);
        inset: 0;
        transition: transform 250ms cubic-bezier(0.4, 0, 0.6, 1);
        transform-origin: left center;
      }
      .dots {
        inset: 0;
        animation: linear infinite 250ms;
        animation-name: buffering;
        background-color: var(--_track-color);
        background-repeat: repeat-x;
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 2' preserveAspectRatio='xMinYMin slice'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 2' preserveAspectRatio='xMinYMin slice'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/svg%3E");
        z-index: -1;
      }
      .dots[hidden] {
        display: none;
      }
      .indeterminate .bar {
        transition: none;
      }
      .indeterminate .primary-bar {
        inset-inline-start: -145.167%;
      }
      .indeterminate .secondary-bar {
        inset-inline-start: -54.8889%;
        display: block;
      }
      .indeterminate .primary-bar {
        animation: linear infinite 2s;
        animation-name: primary-indeterminate-translate;
      }
      .indeterminate .primary-bar > .bar-inner {
        animation: linear infinite 2s primary-indeterminate-scale;
      }
      .indeterminate.four-color .primary-bar > .bar-inner {
        animation-name: primary-indeterminate-scale, four-color;
        animation-duration: 2s, 4s;
      }
      .indeterminate .secondary-bar {
        animation: linear infinite 2s;
        animation-name: secondary-indeterminate-translate;
      }
      .indeterminate .secondary-bar > .bar-inner {
        animation: linear infinite 2s secondary-indeterminate-scale;
      }
      .indeterminate.four-color .secondary-bar > .bar-inner {
        animation-name: secondary-indeterminate-scale, four-color;
        animation-duration: 2s, 4s;
      }
      :host(:dir(rtl)) {
        transform: scale(-1);
      }
      @keyframes primary-indeterminate-scale {
        0% {
          transform: scaleX(0.08);
        }
        36.65% {
          animation-timing-function: cubic-bezier(0.334731, 0.12482, 0.785844, 1);
          transform: scaleX(0.08);
        }
        69.15% {
          animation-timing-function: cubic-bezier(0.06, 0.11, 0.6, 1);
          transform: scaleX(0.661479);
        }
        100% {
          transform: scaleX(0.08);
        }
      }
      @keyframes secondary-indeterminate-scale {
        0% {
          animation-timing-function: cubic-bezier(0.205028, 0.057051, 0.57661, 0.453971);
          transform: scaleX(0.08);
        }
        19.15% {
          animation-timing-function: cubic-bezier(0.152313, 0.196432, 0.648374, 1.00432);
          transform: scaleX(0.457104);
        }
        44.15% {
          animation-timing-function: cubic-bezier(0.257759, -0.003163, 0.211762, 1.38179);
          transform: scaleX(0.72796);
        }
        100% {
          transform: scaleX(0.08);
        }
      }
      @keyframes buffering {
        0% {
          transform: translateX(calc(var(--_track-height) / 2 * 5));
        }
      }
      @keyframes primary-indeterminate-translate {
        0% {
          transform: translateX(0px);
        }
        20% {
          animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
          transform: translateX(0px);
        }
        59.15% {
          animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
          transform: translateX(83.6714%);
        }
        100% {
          transform: translateX(200.611%);
        }
      }
      @keyframes secondary-indeterminate-translate {
        0% {
          animation-timing-function: cubic-bezier(0.15, 0, 0.515058, 0.409685);
          transform: translateX(0px);
        }
        25% {
          animation-timing-function: cubic-bezier(0.31033, 0.284058, 0.8, 0.733712);
          transform: translateX(37.6519%);
        }
        48.35% {
          animation-timing-function: cubic-bezier(0.4, 0.627035, 0.6, 0.902026);
          transform: translateX(84.3862%);
        }
        100% {
          transform: translateX(160.278%);
        }
      }
      @keyframes four-color {
        0% {
          background: var(--_four-color-active-indicator-one-color);
        }
        15% {
          background: var(--_four-color-active-indicator-one-color);
        }
        25% {
          background: var(--_four-color-active-indicator-two-color);
        }
        40% {
          background: var(--_four-color-active-indicator-two-color);
        }
        50% {
          background: var(--_four-color-active-indicator-three-color);
        }
        65% {
          background: var(--_four-color-active-indicator-three-color);
        }
        75% {
          background: var(--_four-color-active-indicator-four-color);
        }
        90% {
          background: var(--_four-color-active-indicator-four-color);
        }
        100% {
          background: var(--_four-color-active-indicator-one-color);
        }
      }
      @media (forced-colors: active) {
        :host {
          outline: 1px solid CanvasText;
        }
        .bar-inner,
        .dots {
          background-color: CanvasText;
        }
      }
    `,
  ]
}
;(() => {
  requestUpdateOnAriaChange(Progress)
})()

customElements.define('md-progress', Progress)
