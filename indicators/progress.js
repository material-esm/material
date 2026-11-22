import { css, html, LitElement, nothing, svg } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
const INDETERMINATE_LINEAR_PROPS = ['--_l1-head', '--_l1-tail', '--_l2-head', '--_l2-tail']

export const SUPPORTS_REGISTERED_PROPS = (() => {
  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') {
    return false
  }
  for (const name of INDETERMINATE_LINEAR_PROPS) {
    try {
      CSS.registerProperty({
        name,
        syntax: '<number>',
        inherits: true,
        initialValue: '-0.1',
      })
    } catch {
      // Property may already be registered if module is evaluated multiple times
    }
  }
  return true
})()

// Seamless C2-continuous sinusoidal SVG masks (stroke-width=4, amplitude=3, height=10)
// Extended one half-cycle past [0, wavelength] so repeat-x tile boundaries have zero seam.
const WAVY_MASK_40 = css`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='10' viewBox='0 0 40 10'%3E%3Cpath d='M -20 5 C -12.72 9 -7.28 9 0 5 S 12.72 1 20 5 S 32.72 9 40 5 S 52.72 1 60 5' fill='none' stroke='black' stroke-width='4'/%3E%3C/svg%3E")`
const WAVY_MASK_20 = css`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10' viewBox='0 0 20 10'%3E%3Cpath d='M -10 5 C -6.36 9 -3.64 9 0 5 S 6.36 1 10 5 S 16.36 9 20 5 S 26.36 1 30 5' fill='none' stroke='black' stroke-width='4'/%3E%3C/svg%3E")`

export const circularStyles = css`
  :host(:not([type])),
  :host([type='circular']) {
    --_active-indicator-color: var(
      --md-circular-progress-active-indicator-color,
      var(--md-progress-active-indicator-color, var(--md-sys-color-primary, #6750a4))
    );
    --_track-color: var(
      --md-circular-progress-track-color,
      var(--md-progress-track-color, var(--md-sys-color-secondary-container, #e8def8))
    );
    --_four-color-one: var(
      --md-circular-progress-four-color-active-indicator-one-color,
      var(--md-sys-color-primary, #6750a4)
    );
    --_four-color-two: var(
      --md-circular-progress-four-color-active-indicator-two-color,
      var(--md-sys-color-primary-container, #eaddff)
    );
    --_four-color-three: var(
      --md-circular-progress-four-color-active-indicator-three-color,
      var(--md-sys-color-tertiary, #7d5260)
    );
    --_four-color-four: var(
      --md-circular-progress-four-color-active-indicator-four-color,
      var(--md-sys-color-tertiary-container, #ffd8e4)
    );
    --_size: var(--md-circular-progress-size, var(--md-progress-size, 48px));
    --_track-gap: var(--md-circular-progress-track-gap, var(--md-progress-track-gap, 4px));
    display: inline-flex;
    vertical-align: middle;
    width: var(--_size);
    height: var(--_size);
    min-width: 24px;
    min-height: 24px;
    position: relative;
    align-items: center;
    justify-content: center;
    contain: strict;
    content-visibility: auto;
  }

  .circular.progress {
    position: absolute;
    inset: 0;
    margin: 0;
  }

  .circular svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    overflow: visible;
  }

  .circular .track,
  .circular .active-track {
    fill: none;
    stroke-linecap: round;
  }

  .circular .track {
    stroke: var(--_track-color);
  }

  .circular .active-track {
    stroke: var(--_active-indicator-color);
  }

  .circular .wavy-circle {
    stroke-linejoin: round;
  }

  .circular.progress:not(.indeterminate):not(.wavy) .active-track,
  .circular.progress:not(.indeterminate):not(.wavy) .track {
    transition:
      stroke-dasharray 500ms cubic-bezier(0, 0, 0.2, 1),
      stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1),
      opacity 150ms linear;
  }

  /* Flat Circular Indeterminate (SVG period-360 math with exact gap on both ends) */
  .circular.progress.indeterminate:not(.wavy) svg {
    animation: circular-linear-rotate 1568.235ms linear infinite;
  }

  .circular.progress.indeterminate:not(.wavy) .active-track {
    animation: circular-indeterminate-active 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .circular.progress.indeterminate.four-color:not(.wavy) .active-track {
    animation:
      circular-indeterminate-active 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite,
      circular-four-color 5332ms linear infinite;
  }

  .circular.progress.indeterminate:not(.wavy) .track {
    animation: circular-indeterminate-track 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .circular.progress.indeterminate.four-color.wavy .active-track {
    animation: circular-four-color var(--_used-circular-four-color-duration, 6000ms) linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .circular.progress:not(.indeterminate):not(.wavy) .active-track,
    .circular.progress:not(.indeterminate):not(.wavy) .track {
      transition: none;
    }

    .circular.progress.indeterminate:not(.wavy) svg {
      animation-duration: 6s;
    }

    .circular.progress.indeterminate:not(.wavy) .active-track {
      animation: none;
      stroke-dasharray: 90 270;
      stroke-dashoffset: 0;
    }

    .circular.progress.indeterminate.four-color:not(.wavy) .active-track {
      animation: circular-four-color 12s linear infinite;
      stroke-dasharray: 90 270;
      stroke-dashoffset: 0;
    }

    .circular.progress.indeterminate.four-color.wavy .active-track {
      --_used-circular-four-color-duration: 12s;
    }

    .circular.progress.indeterminate:not(.wavy) .track {
      animation: none;
      stroke-dasharray: var(--_ind-reduced-track, 219.07) var(--_ind-reduced-track-comp, 140.93);
      stroke-dashoffset: var(--_ind-reduced-offset, -115.46);
    }
  }

  @media (forced-colors: active) {
    :host([type='circular']) {
      forced-color-adjust: none;
    }
    .circular .active-track {
      stroke: CanvasText;
    }
    .circular .track {
      stroke: GrayText;
    }
  }

  @keyframes circular-linear-rotate {
    from {
      transform: rotate(-90deg);
    }
    to {
      transform: rotate(270deg);
    }
  }

  @keyframes circular-indeterminate-active {
    0% {
      stroke-dasharray: 20 340;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 260 100;
      stroke-dashoffset: -50;
    }
    100% {
      stroke-dasharray: 20 340;
      stroke-dashoffset: -360;
    }
  }

  @keyframes circular-indeterminate-track {
    0% {
      stroke-dasharray: var(--_ind-track-max, 289.07) var(--_ind-track-max-comp, 70.93);
      stroke-dashoffset: var(--_ind-offset-0, -45.46);
    }
    50% {
      stroke-dasharray: var(--_ind-track-min, 49.07) var(--_ind-track-min-comp, 310.93);
      stroke-dashoffset: var(--_ind-offset-50, -335.46);
    }
    100% {
      stroke-dasharray: var(--_ind-track-max, 289.07) var(--_ind-track-max-comp, 70.93);
      stroke-dashoffset: var(--_ind-offset-100, -405.46);
    }
  }

  @keyframes circular-four-color {
    0%,
    15% {
      stroke: var(--_four-color-one);
    }
    25%,
    40% {
      stroke: var(--_four-color-two);
    }
    50%,
    65% {
      stroke: var(--_four-color-three);
    }
    75%,
    90% {
      stroke: var(--_four-color-four);
    }
    100% {
      stroke: var(--_four-color-one);
    }
  }
`

export const linearStyles = css`
  :host([type='linear']) {
    --_active-indicator-color: var(
      --md-linear-progress-active-indicator-color,
      var(--md-progress-active-indicator-color, var(--md-sys-color-primary, #6750a4))
    );
    --_active-indicator-height: var(
      --md-linear-progress-active-indicator-height,
      var(--md-progress-active-indicator-thickness, 4px)
    );
    --_active-indicator-shape: var(
      --md-linear-progress-active-indicator-shape,
      var(--md-progress-active-indicator-shape, var(--md-sys-shape-corner-full, 9999px))
    );
    --_track-color: var(
      --md-linear-progress-track-color,
      var(--md-progress-track-color, var(--md-sys-color-secondary-container, #e8def8))
    );
    --_track-height: var(--md-linear-progress-track-height, var(--md-progress-track-thickness, 4px));
    --_track-shape: var(
      --md-linear-progress-track-shape,
      var(--md-progress-track-shape, var(--md-sys-shape-corner-full, 9999px))
    );
    --_track-gap: var(--md-linear-progress-track-gap, var(--md-progress-track-gap, 4px));
    --_stop-color: var(
      --md-linear-progress-stop-indicator-color,
      var(--md-progress-stop-indicator-color, var(--_active-indicator-color))
    );
    --_stop-size: var(--md-linear-progress-stop-indicator-size, var(--md-progress-stop-indicator-size, 4px));
    --_four-color-one: var(
      --md-linear-progress-four-color-active-indicator-one-color,
      var(--md-sys-color-primary, #6750a4)
    );
    --_four-color-two: var(
      --md-linear-progress-four-color-active-indicator-two-color,
      var(--md-sys-color-primary-container, #eaddff)
    );
    --_four-color-three: var(
      --md-linear-progress-four-color-active-indicator-three-color,
      var(--md-sys-color-tertiary, #7d5260)
    );
    --_four-color-four: var(
      --md-linear-progress-four-color-active-indicator-four-color,
      var(--md-sys-color-tertiary-container, #ffd8e4)
    );
    display: flex;
    position: relative;
    min-width: 40px;
    height: max(var(--_track-height), var(--_active-indicator-height));
    content-visibility: auto;
    contain: strict;
  }

  :host([type='linear']:dir(rtl)) {
    transform: scaleX(-1);
  }

  [hidden] {
    display: none !important;
  }

  .linear.progress {
    direction: ltr;
    position: absolute;
    inset: 0;
    container-type: inline-size;
    border-radius: var(--_track-shape);
    overflow: hidden;
    display: flex;
    align-items: center;
    margin: 0;
  }

  .linear .bar,
  .linear .track-segment,
  .linear .dots {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .linear .bar {
    height: var(--_active-indicator-height);
    border-radius: var(--_active-indicator-shape);
    overflow: hidden;
  }

  .linear .bar-inner {
    position: absolute;
    inset: 0;
    background: var(--_active-indicator-color);
    border-radius: inherit;
  }

  .linear .track-segment {
    height: var(--_track-height);
    background: var(--_track-color);
    border-radius: var(--_track-shape);
  }

  /* Determinate transitions */
  .linear.progress:not(.indeterminate) .primary-bar,
  .linear.progress:not(.indeterminate) .inactive-track {
    transition:
      left 250ms cubic-bezier(0.4, 0, 0.2, 1),
      width 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .linear .secondary-bar,
  .linear .indeterminate-track {
    display: none;
  }

  .linear .stop-indicator {
    position: absolute;
    right: max(0px, calc((var(--_track-height) - var(--_stop-size)) / 2));
    top: 50%;
    transform: translateY(-50%);
    width: var(--_stop-size);
    height: var(--_stop-size);
    border-radius: 50%;
    background: var(--_stop-color);
    pointer-events: none;
  }

  .linear .dots {
    height: var(--_track-height);
    animation: linear-buffering 250ms linear infinite;
    background-color: var(--_track-color);
    background-repeat: repeat-x;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 2' preserveAspectRatio='xMinYMin slice'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 2' preserveAspectRatio='xMinYMin slice'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/svg%3E");
  }

  /* --- Indeterminate Linear (M3 2-bar disjoint curves + 4px gap track segments) --- */
  .linear.progress.indeterminate .inactive-track {
    display: none;
  }

  .linear.progress.indeterminate .secondary-bar,
  .linear.progress.indeterminate .indeterminate-track {
    display: block;
  }

  .linear.progress.indeterminate.registered-props {
    animation:
      m3-l1-head 1750ms infinite,
      m3-l1-tail 1750ms infinite,
      m3-l2-head 1750ms infinite,
      m3-l2-tail 1750ms infinite;
  }

  .linear.progress.indeterminate.registered-props .primary-bar {
    left: calc(var(--_l1-tail) * 100%);
    width: max(0px, calc((var(--_l1-head) - var(--_l1-tail)) * 100%));
  }

  .linear.progress.indeterminate.registered-props .secondary-bar {
    left: calc(var(--_l2-tail) * 100%);
    width: max(0px, calc((var(--_l2-head) - var(--_l2-tail)) * 100%));
  }

  .linear.progress.indeterminate.registered-props .track-0 {
    --_t0-left: max(0px, calc(var(--_l1-head) * 100% + var(--_track-gap)));
    left: var(--_t0-left);
    width: max(0px, calc(100% - var(--_t0-left)));
  }

  .linear.progress.indeterminate.registered-props .track-1 {
    --_t1-left: max(0px, calc(var(--_l2-head) * 100% + var(--_track-gap)));
    --_t1-right: max(0px, calc((1 - var(--_l1-tail)) * 100% + var(--_track-gap)));
    left: var(--_t1-left);
    width: max(0px, calc(100% - var(--_t1-left) - var(--_t1-right)));
  }

  .linear.progress.indeterminate.registered-props .track-2 {
    --_t2-right: max(0px, calc((1 - var(--_l2-tail)) * 100% + var(--_track-gap)));
    left: 0;
    width: max(0px, calc(100% - var(--_t2-right)));
  }

  /* Fallback when CSS.registerProperty is unavailable (e.g. non-browser test runners) */
  .linear.progress.indeterminate:not(.registered-props) .track-0 {
    left: 0;
    width: 100%;
  }

  .linear.progress.indeterminate:not(.registered-props) .track-1,
  .linear.progress.indeterminate:not(.registered-props) .track-2 {
    display: none;
  }

  .linear.progress.indeterminate:not(.registered-props) .primary-bar {
    animation: m3-fallback-bar-1 1750ms cubic-bezier(0.3, 0, 0.8, 0.15) infinite;
  }

  .linear.progress.indeterminate:not(.registered-props) .secondary-bar {
    animation: m3-fallback-bar-2 1750ms cubic-bezier(0.3, 0, 0.8, 0.15) infinite;
  }

  .linear.progress.indeterminate.four-color .bar-inner {
    animation: linear-four-color 3500ms linear infinite;
  }

  /* --- M3 Expressive Wavy Linear --- */
  :host([shape='wavy'][type='linear']) {
    --_wave-height: var(--md-linear-progress-wave-height, var(--md-progress-wave-height, 10px));
    --_wavelength: var(--md-linear-progress-wavelength, var(--md-progress-wavelength, 40px));
    --_indeterminate-wavelength: var(
      --md-linear-progress-indeterminate-wavelength,
      var(--md-linear-progress-wavelength, var(--md-progress-wavelength, 20px))
    );
    --_wave-duration: var(--md-linear-progress-wave-duration, var(--md-progress-wave-duration, 2s));
    --_indeterminate-wave-duration: var(
      --md-linear-progress-indeterminate-wave-duration,
      var(--md-linear-progress-wave-duration, var(--md-progress-wave-duration, 1.5s))
    );
    --_used-wave-duration: var(--_wave-duration);
    height: var(--_wave-height);
  }

  .linear.progress.wavy {
    border-radius: 0;
  }

  .linear.progress.wavy .bar {
    height: var(--_wave-height);
    border-radius: calc(var(--_active-indicator-height) / 2);
  }

  .linear.progress.wavy .bar-inner {
    border-radius: 0;
    -webkit-mask-image: ${WAVY_MASK_40};
    mask-image: ${WAVY_MASK_40};
    -webkit-mask-size: var(--_wavelength) 100%;
    mask-size: var(--_wavelength) 100%;
    -webkit-mask-repeat: repeat-x;
    mask-repeat: repeat-x;
    animation: wavy-linear-move var(--_used-wave-duration) linear infinite;
  }

  .linear.progress.wavy.indeterminate {
    --_used-wave-duration: var(--_indeterminate-wave-duration);
  }

  .linear.progress.wavy.indeterminate .bar-inner {
    --_wavelength: var(--_indeterminate-wavelength);
    -webkit-mask-image: ${WAVY_MASK_20};
    mask-image: ${WAVY_MASK_20};
    -webkit-mask-size: var(--_wavelength) 100%;
    mask-size: var(--_wavelength) 100%;
  }

  /* Anchor indeterminate wavy mask in track coordinates so moving bars window across the wave
     rather than dragging the wave mask at bar-tail velocity. */
  .linear.progress.wavy.indeterminate.registered-props .primary-bar .bar-inner {
    inset: 0 auto 0 calc(var(--_l1-tail) * -100cqi - var(--_wavelength));
    width: calc(100cqi + var(--_wavelength) * 2);
  }

  .linear.progress.wavy.indeterminate.registered-props .secondary-bar .bar-inner {
    inset: 0 auto 0 calc(var(--_l2-tail) * -100cqi - var(--_wavelength));
    width: calc(100cqi + var(--_wavelength) * 2);
  }

  .linear.progress.wavy.indeterminate.four-color .bar-inner {
    animation:
      wavy-linear-move var(--_used-wave-duration) linear infinite,
      linear-four-color var(--_used-four-color-duration, 3500ms) linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .linear.progress:not(.indeterminate) .primary-bar,
    .linear.progress:not(.indeterminate) .inactive-track {
      transition: none;
    }

    .linear.progress.indeterminate.registered-props {
      animation-duration: 6s;
    }

    .linear.progress.indeterminate:not(.registered-props) .primary-bar,
    .linear.progress.indeterminate:not(.registered-props) .secondary-bar {
      animation-duration: 6s;
    }

    :host([shape='wavy'][type='linear']) {
      --_used-wave-duration: max(6s, var(--_wave-duration));
      --_used-four-color-duration: 12s;
    }

    .linear.progress.wavy.indeterminate {
      --_used-wave-duration: max(6s, var(--_indeterminate-wave-duration));
    }

    @supports (animation-duration: calc(1s * sign(1s))) {
      :host([shape='wavy'][type='linear']) {
        --_used-wave-duration: calc(sign(var(--_wave-duration)) * max(6s, var(--_wave-duration)));
      }

      .linear.progress.wavy.indeterminate {
        --_used-wave-duration: calc(
          sign(var(--_indeterminate-wave-duration)) * max(6s, var(--_indeterminate-wave-duration))
        );
      }
    }

    .linear .dots {
      animation-duration: 1.5s;
    }
  }

  @media (forced-colors: active) {
    :host([type='linear']) {
      forced-color-adjust: none;
    }
    .linear .bar-inner,
    .linear .stop-indicator,
    .linear .dots {
      background-color: CanvasText;
    }
    .linear .track-segment {
      background-color: GrayText;
    }
  }

  @keyframes m3-l1-head {
    0% {
      --_l1-head: -0.1;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    57.14%,
    100% {
      --_l1-head: 1.1;
    }
  }

  @keyframes m3-l1-tail {
    0%,
    14.29% {
      --_l1-tail: -0.1;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    71.43%,
    100% {
      --_l1-tail: 1.1;
    }
  }

  @keyframes m3-l2-head {
    0%,
    37.14% {
      --_l2-head: -0.1;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    85.71%,
    100% {
      --_l2-head: 1.1;
    }
  }

  @keyframes m3-l2-tail {
    0%,
    51.43% {
      --_l2-tail: -0.1;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    100% {
      --_l2-tail: 1.1;
    }
  }

  @keyframes m3-fallback-bar-1 {
    0% {
      left: -10%;
      width: 10%;
    }
    45% {
      left: 25%;
      width: 55%;
    }
    70%,
    100% {
      left: 105%;
      width: 10%;
    }
  }

  @keyframes m3-fallback-bar-2 {
    0%,
    55% {
      left: -10%;
      width: 10%;
    }
    80% {
      left: 35%;
      width: 50%;
    }
    100% {
      left: 105%;
      width: 10%;
    }
  }

  @keyframes linear-buffering {
    0% {
      transform: translateY(-50%) translateX(calc(var(--_track-height) / 2 * 5));
    }
  }

  @keyframes wavy-linear-move {
    from {
      -webkit-mask-position: 0px 0px;
      mask-position: 0px 0px;
    }
    to {
      -webkit-mask-position: var(--_wavelength) 0px;
      mask-position: var(--_wavelength) 0px;
    }
  }

  @keyframes linear-four-color {
    0%,
    15% {
      background-color: var(--_four-color-one);
    }
    25%,
    40% {
      background-color: var(--_four-color-two);
    }
    50%,
    65% {
      background-color: var(--_four-color-three);
    }
    75%,
    90% {
      background-color: var(--_four-color-four);
    }
    100% {
      background-color: var(--_four-color-one);
    }
  }
`

const TWO_PI = Math.PI * 2
const _reducedMotionMql =
  typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null : null
const DEFAULT_CIRCULAR_WAVE_DURATION_MS = 1500
const CIRCULAR_WAVY_INDETERMINATE_CYCLE_MS = 6000
const CIRCULAR_WAVY_MIN_PROGRESS = 0.1
const CIRCULAR_WAVY_MAX_PROGRESS = 0.87
const CIRCULAR_WAVY_STEP_INTERVAL_MS = 1500
const CIRCULAR_WAVY_STEP_DURATION_MS = 300

/**
 * Material Design 3 Progress Indicator (`<md-progress>`).
 *
 * Supports `type="circular" | "linear"`, determinate and `indeterminate` states,
 * `four-color` indeterminate palette cycling, and M3 Expressive `shape="flat" | "wavy"`.
 */
export class Progress extends LitElement {
  static properties = {
    type: { type: String, reflect: true },
    value: { type: Number },
    max: { type: Number },
    indeterminate: { type: Boolean, reflect: true },
    fourColor: { type: Boolean, attribute: 'four-color', reflect: true },
    buffer: { type: Number },
    shape: { type: String, reflect: true },
    _boxSize: { state: true },
    _strokeWidth: { state: true },
    _trackGap: { state: true },
    _waveAmplitude: { state: true },
    _waveDurationMs: { state: true },
  }

  static styles = [circularStyles, linearStyles]

  constructor() {
    super()
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
    /**
     * Visual shape style: `'flat'` (default) or `'wavy'` (M3 Expressive).
     */
    this.shape = 'flat'

    this._boxSize = 48
    this._strokeWidth = 4
    this._trackGap = 4
    this._waveAmplitude = 1.6
    this._waveDurationMs = DEFAULT_CIRCULAR_WAVE_DURATION_MS

    this._wavyAnimationActive = false
    this._wavyRafId = 0
    this._wavyLastTs = 0
    this._wavyPhase = 0
    this._wavyElapsedMs = 0
    this._wavyPathEl = null
    this._wavyTrackEl = null
    this._resizeObserver = null
    this._intersectionObserver = null
    this._isOffscreen = false
    this._onContentVisibilityChange = (e) => {
      this._isOffscreen = Boolean(e.skipped)
      this._updateWavyAnimationState()
    }
  }

  get clampedFraction() {
    if (!Number.isFinite(this.max) || this.max <= 0 || !Number.isFinite(this.value)) {
      return 0
    }
    return Math.max(0, Math.min(1, this.value / this.max))
  }

  get clampedBufferFraction() {
    if (!Number.isFinite(this.max) || this.max <= 0 || !Number.isFinite(this.buffer)) {
      return 0
    }
    return Math.max(0, Math.min(1, this.buffer / this.max))
  }

  connectedCallback() {
    super.connectedCallback()
    this._setupResizeObserver()
    this._setupVisibilityObserver()
    if (this.hasUpdated) {
      this._syncCircularMetrics()
      this._updateWavyAnimationState()
    }
  }

  firstUpdated() {
    this._syncCircularMetrics()
    this._updateWavyAnimationState()
  }

  updated(changedProperties) {
    if (changedProperties.has('type') || changedProperties.has('shape') || changedProperties.has('indeterminate')) {
      this._wavyPathEl = null
      this._wavyTrackEl = null
      this._setupResizeObserver()
      this._syncCircularMetrics()
      this._updateWavyAnimationState()
    } else if (changedProperties.has('value') || changedProperties.has('max')) {
      this._updateWavyAnimationState()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._stopWavyAnimation()
    this._teardownResizeObserver()
    this._teardownVisibilityObserver()
  }

  _setupVisibilityObserver() {
    if (typeof document === 'undefined') return
    if ('oncontentvisibilityautostatechange' in this) {
      this.addEventListener('contentvisibilityautostatechange', this._onContentVisibilityChange)
    } else if (typeof IntersectionObserver !== 'undefined' && !this._intersectionObserver) {
      this._intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1]
          if (!entry) return
          this._isOffscreen = !entry.isIntersecting
          this._updateWavyAnimationState()
        },
        { rootMargin: '200px' },
      )
      this._intersectionObserver.observe(this)
    }
  }

  _teardownVisibilityObserver() {
    this.removeEventListener('contentvisibilityautostatechange', this._onContentVisibilityChange)
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect()
      this._intersectionObserver = null
    }
    this._isOffscreen = false
  }

  _setupResizeObserver() {
    if (this.type === 'linear') {
      this._teardownResizeObserver()
      return
    }
    if (this._resizeObserver || typeof ResizeObserver === 'undefined') {
      return
    }
    this._resizeObserver = new ResizeObserver(() => {
      this._syncCircularMetrics()
    })
    this._resizeObserver.observe(this)
  }

  _teardownResizeObserver() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }
  }

  _syncCircularMetrics() {
    if (this.type === 'linear' || typeof window === 'undefined') {
      return
    }
    const rect = this.getBoundingClientRect()
    const cs = window.getComputedStyle(this)
    const cssSize = parsePx(cs.width) || parsePx(cs.getPropertyValue('--md-circular-progress-size')) || 48
    const boxSize = rect.width > 0 ? rect.width : cssSize

    const explicitGap =
      cs.getPropertyValue('--md-circular-progress-track-gap').trim() ||
      cs.getPropertyValue('--md-progress-track-gap').trim()
    const trackGap = explicitGap ? Math.max(0, parsePx(explicitGap, 4)) : 4

    const explicitThickness =
      cs.getPropertyValue('--md-circular-progress-track-thickness').trim() ||
      cs.getPropertyValue('--md-progress-active-indicator-thickness').trim() ||
      cs.getPropertyValue('--md-progress-track-thickness').trim()
    const legacyWidth = cs.getPropertyValue('--md-circular-progress-active-indicator-width').trim()

    let strokeWidth = boxSize < 32 ? Math.max(2.5, (boxSize / 40) * 4) : 4
    if (explicitThickness) {
      strokeWidth = Math.max(1, parsePx(explicitThickness, 4))
    } else if (legacyWidth) {
      if (legacyWidth.endsWith('px')) {
        strokeWidth = Math.max(1, parseFloat(legacyWidth) || 4)
      } else {
        const pct = parseFloat(legacyWidth)
        if (Number.isFinite(pct) && pct > 0) {
          const inset = boxSize >= 40 ? 8 : 0
          strokeWidth = Math.max(1, (pct / 100) * Math.max(16, boxSize - inset))
        }
      }
    }

    const explicitAmp =
      cs.getPropertyValue('--md-circular-progress-wave-amplitude').trim() ||
      cs.getPropertyValue('--md-progress-wave-amplitude').trim()
    const waveAmplitude = explicitAmp ? Math.max(0, parsePx(explicitAmp, 1.6)) : 1.6 * (boxSize / 48)

    const explicitWaveDuration =
      cs.getPropertyValue('--md-circular-progress-wave-duration').trim() ||
      cs.getPropertyValue('--md-progress-wave-duration').trim()
    const waveDurationMs = explicitWaveDuration
      ? parseTimeMs(explicitWaveDuration, DEFAULT_CIRCULAR_WAVE_DURATION_MS)
      : DEFAULT_CIRCULAR_WAVE_DURATION_MS

    if (Math.abs(this._boxSize - boxSize) > 0.05) this._boxSize = boxSize
    if (Math.abs(this._strokeWidth - strokeWidth) > 0.05) this._strokeWidth = strokeWidth
    if (Math.abs(this._trackGap - trackGap) > 0.05) this._trackGap = trackGap
    if (Math.abs(this._waveAmplitude - waveAmplitude) > 0.05) this._waveAmplitude = waveAmplitude
    if (Math.abs(this._waveDurationMs - waveDurationMs) > 0.5) {
      this._waveDurationMs = waveDurationMs
      this._updateWavyAnimationState()
    }
  }

  _getCircularGeometry() {
    const size = this._boxSize || 48
    const stroke = this._strokeWidth || 4
    const gap = Math.max(0, this._trackGap ?? 4)
    const isWavy = this.shape === 'wavy'
    const cx = size / 2
    const cy = size / 2

    if (isWavy) {
      const amp = this._waveAmplitude ?? 1.6
      const padding = size >= 40 ? 2 : 1
      const r = Math.max(4, size / 2 - padding - amp - stroke / 2)
      const circumference = TWO_PI * r
      const frequency = Math.max(4, Math.round(circumference / 14.5))
      return { size, cx, cy, r, stroke, gap, amp, frequency, circumference }
    }

    // M3 flat circular: 40dp visual ring inside 48dp host (4dp inset), scaling down to 0 inset at 24dp
    const padding = size >= 40 ? 4 : Math.max(0, ((size - 24) / 16) * 4)
    const r = Math.max(4, size / 2 - padding - stroke / 2)
    const circumference = TWO_PI * r
    return { size, cx, cy, r, stroke, gap, amp: 0, frequency: 0, circumference }
  }

  _prefersReducedMotion() {
    if (_reducedMotionMql) {
      return _reducedMotionMql.matches
    }
    return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  }

  _updateWavyAnimationState() {
    if (this._isOffscreen) {
      this._stopWavyAnimation()
      return
    }
    if (this.shape === 'wavy' && this.type !== 'linear' && (this.indeterminate || this.clampedFraction > 0)) {
      if (this.indeterminate || this._waveDurationMs > 0) {
        this._startWavyAnimation()
      } else {
        this._stopWavyAnimation()
        this._wavyPhase = 0
        this._renderWavyCircularFrame(this._prefersReducedMotion())
      }
    } else {
      this._stopWavyAnimation()
    }
  }

  _startWavyAnimation() {
    if (this._wavyAnimationActive || typeof requestAnimationFrame === 'undefined') {
      return
    }
    this._wavyAnimationActive = true
    this._wavyLastTs = 0

    const loop = (ts) => {
      if (!this._wavyAnimationActive) return
      if (this._wavyLastTs === 0) this._wavyLastTs = ts
      const rawDt = Math.min((ts - this._wavyLastTs) / 1000, 0.1)
      this._wavyLastTs = ts

      const reduced = this._prefersReducedMotion()
      const dtSec = Math.max(0, rawDt)
      const effectiveWaveDurationMs =
        this._waveDurationMs <= 0 ? 0 : reduced ? Math.max(6000, this._waveDurationMs) : this._waveDurationMs

      if (effectiveWaveDurationMs > 0) {
        this._wavyPhase = (this._wavyPhase + ((dtSec * 1000) / effectiveWaveDurationMs) * TWO_PI) % TWO_PI
      }
      this._wavyElapsedMs = (this._wavyElapsedMs + dtSec * 1000) % CIRCULAR_WAVY_INDETERMINATE_CYCLE_MS

      this._renderWavyCircularFrame(reduced)
      this._wavyRafId = requestAnimationFrame(loop)
    }

    this._wavyRafId = requestAnimationFrame(loop)
  }

  _renderWavyCircularFrame(reduced = false) {
    if (!this._wavyPathEl) {
      this._wavyPathEl = this.renderRoot?.querySelector('.active-track.wavy-circle')
    }
    if (!this._wavyTrackEl) {
      this._wavyTrackEl = this.renderRoot?.querySelector('.circular .track')
    }
    const pathEl = this._wavyPathEl
    const trackEl = this._wavyTrackEl
    if (!pathEl) return

    const { cx, cy, r, stroke, gap, amp, frequency, circumference } = this._getCircularGeometry()
    const clearance = gap > 0 ? gap + stroke : 0

    let startAngle = 0
    let sweepAngle = 0

    if (this.indeterminate) {
      ;({ startAngle, sweepAngle } = getCircularWavyIndeterminateState(this._wavyElapsedMs, reduced))
    } else {
      sweepAngle = this.clampedFraction * TWO_PI
    }

    if (sweepAngle <= 0.001) {
      pathEl.setAttribute('d', '')
      pathEl.setAttribute('opacity', '0')
    } else {
      pathEl.setAttribute('d', getWavyCirclePath(cx, cy, r, amp, frequency, this._wavyPhase, startAngle, sweepAngle))
      pathEl.setAttribute('opacity', '1')
    }

    if (trackEl) {
      if (sweepAngle <= 0.001) {
        trackEl.setAttribute('stroke-dasharray', `${circumference} 0`)
        trackEl.setAttribute('stroke-dashoffset', '0')
        trackEl.setAttribute('opacity', '1')
      } else if (sweepAngle >= TWO_PI - 0.001) {
        trackEl.setAttribute('stroke-dasharray', `0 ${circumference}`)
        trackEl.setAttribute('opacity', '0')
      } else {
        const activeLen = (sweepAngle / TWO_PI) * circumference
        const startLen = ((startAngle % TWO_PI) / TWO_PI) * circumference
        const trackStart = startLen + activeLen + clearance
        const trackLen = Math.max(0, circumference - activeLen - 2 * clearance)
        trackEl.setAttribute('stroke-dasharray', `${trackLen} ${circumference - trackLen}`)
        trackEl.setAttribute('stroke-dashoffset', `${-trackStart}`)
        trackEl.setAttribute('opacity', trackLen > 0.1 ? '1' : '0')
      }
    }
  }

  _stopWavyAnimation() {
    this._wavyAnimationActive = false
    if (this._wavyRafId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this._wavyRafId)
      this._wavyRafId = 0
    }
  }

  render() {
    const { ariaLabel, ariaValueText } = this
    return html`
      <div
        class="progress ${classMap(this.getRenderClasses())}"
        role="progressbar"
        aria-label=${ariaLabel || nothing}
        aria-valuetext=${ariaValueText || nothing}
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.indeterminate ? nothing : this.value}>
        ${this.type === 'linear' ? this.renderLinearIndicator() : this.renderCircularIndicator()}
      </div>
    `
  }

  getRenderClasses() {
    const isLinear = this.type === 'linear'
    return {
      indeterminate: this.indeterminate,
      'four-color': this.fourColor,
      circular: !isLinear,
      linear: isLinear,
      wavy: this.shape === 'wavy',
      'registered-props': SUPPORTS_REGISTERED_PROPS,
    }
  }

  renderCircularIndicator() {
    const { size, cx, cy, r, stroke, gap, amp, frequency, circumference } = this._getCircularGeometry()
    const isWavy = this.shape === 'wavy'
    const clearance = gap > 0 ? gap + stroke : 0

    if (!isWavy && this.indeterminate) {
      const gapDeg = Math.min(80, (clearance / circumference) * 360)
      const trackMax = Math.max(0, 360 - 20 - 2 * gapDeg)
      const trackMin = Math.max(0, 360 - 260 - 2 * gapDeg)
      const reducedTrack = Math.max(0, 360 - 90 - 2 * gapDeg)
      const indeterminateVars = {
        '--_ind-track-max': `${trackMax.toFixed(2)}`,
        '--_ind-track-max-comp': `${(360 - trackMax).toFixed(2)}`,
        '--_ind-track-min': `${trackMin.toFixed(2)}`,
        '--_ind-track-min-comp': `${(360 - trackMin).toFixed(2)}`,
        '--_ind-offset-0': `${-(20 + gapDeg).toFixed(2)}`,
        '--_ind-offset-50': `${-(50 + 260 + gapDeg).toFixed(2)}`,
        '--_ind-offset-100': `${-(360 + 20 + gapDeg).toFixed(2)}`,
        '--_ind-reduced-track': `${reducedTrack.toFixed(2)}`,
        '--_ind-reduced-track-comp': `${(360 - reducedTrack).toFixed(2)}`,
        '--_ind-reduced-offset': `${-(90 + gapDeg).toFixed(2)}`,
      }

      return html`
        <svg viewBox="0 0 ${size} ${size}" style=${styleMap(indeterminateVars)}>
          <circle class="track" cx=${cx} cy=${cy} r=${r} stroke-width=${stroke} pathLength="360"></circle>
          <circle class="active-track" cx=${cx} cy=${cy} r=${r} stroke-width=${stroke} pathLength="360"></circle>
        </svg>
      `
    }

    const fraction = this.indeterminate ? 0.25 : this.clampedFraction
    let trackDashArray = `${circumference} 0`
    let trackDashOffset = 0
    let trackOpacity = 1

    if (fraction >= 1) {
      trackDashArray = `0 ${circumference}`
      trackOpacity = 0
    } else if (fraction > 0) {
      const activeLen = fraction * circumference
      const trackStart = activeLen + clearance
      const trackLen = Math.max(0, circumference - activeLen - 2 * clearance)
      trackDashArray = `${trackLen} ${circumference - trackLen}`
      trackDashOffset = -trackStart
      trackOpacity = trackLen > 0.1 ? 1 : 0
    }

    if (isWavy) {
      const sweepAngle = fraction * TWO_PI
      const d = sweepAngle > 0.001 ? getWavyCirclePath(cx, cy, r, amp, frequency, this._wavyPhase, 0, sweepAngle) : ''
      return html`
        <svg viewBox="0 0 ${size} ${size}">
          <circle
            class="track"
            cx=${cx}
            cy=${cy}
            r=${r}
            stroke-width=${stroke}
            stroke-dasharray=${trackDashArray}
            stroke-dashoffset=${trackDashOffset}
            opacity=${trackOpacity}></circle>
          <path
            class="active-track wavy-circle"
            stroke-width=${stroke}
            d=${d}
            opacity=${sweepAngle > 0.001 ? 1 : 0}></path>
        </svg>
      `
    }

    let activeDashArray = `0 ${circumference}`
    let activeOpacity = 0
    if (fraction >= 1) {
      activeDashArray = `${circumference} 0`
      activeOpacity = 1
    } else if (fraction > 0) {
      const activeLen = fraction * circumference
      activeDashArray = `${activeLen} ${circumference - activeLen}`
      activeOpacity = 1
    }

    return html`
      <svg viewBox="0 0 ${size} ${size}">
        <circle
          class="track"
          cx=${cx}
          cy=${cy}
          r=${r}
          stroke-width=${stroke}
          stroke-dasharray=${trackDashArray}
          stroke-dashoffset=${trackDashOffset}
          opacity=${trackOpacity}></circle>
        <circle
          class="active-track"
          cx=${cx}
          cy=${cy}
          r=${r}
          stroke-width=${stroke}
          stroke-dasharray=${activeDashArray}
          stroke-dashoffset="0"
          opacity=${activeOpacity}></circle>
      </svg>
    `
  }

  renderLinearIndicator() {
    const p = this.clampedFraction
    const b = this.clampedBufferFraction
    const hasBuffer = !this.indeterminate && this.buffer > 0 && b < 1 && p < 1

    const primaryBarStyles = {}
    const inactiveTrackStyles = {}
    const dotsStyles = {}

    if (!this.indeterminate) {
      if (p <= 0) {
        primaryBarStyles.left = '0px'
        primaryBarStyles.width = '0px'
        primaryBarStyles.opacity = '0'
      } else if (p >= 1) {
        primaryBarStyles.left = '0px'
        primaryBarStyles.width = '100%'
      } else {
        primaryBarStyles.left = '0px'
        primaryBarStyles.width = `max(var(--_active-indicator-height), ${p * 100}%)`
      }

      const trackEnd = hasBuffer ? `${b * 100}%` : '100%'
      const activeEnd = p > 0 ? `calc(max(var(--_active-indicator-height), ${p * 100}%) + var(--_track-gap))` : '0px'
      if (p >= 1 || (hasBuffer && b <= p)) {
        inactiveTrackStyles.left = '100%'
        inactiveTrackStyles.width = '0px'
      } else if (p <= 0) {
        inactiveTrackStyles.left = '0px'
        inactiveTrackStyles.width = trackEnd
      } else {
        inactiveTrackStyles.left = activeEnd
        inactiveTrackStyles.width = `max(0px, calc(${trackEnd} - ${activeEnd}))`
      }

      if (hasBuffer) {
        const bufferEnd = `calc(${b * 100}% + var(--_track-gap))`
        const dotsStart = p > 0 ? `max(${activeEnd}, ${bufferEnd})` : bufferEnd
        dotsStyles.left = dotsStart
        dotsStyles.width = `max(0px, calc(100% - ${dotsStart}))`
      }
    }

    const hideDots = !hasBuffer
    const hideStop = this.indeterminate || p >= 1 || hasBuffer

    return html`
      <div class="dots" ?hidden=${hideDots} style=${styleMap(dotsStyles)}></div>
      <div class="track-segment inactive-track" style=${styleMap(inactiveTrackStyles)}></div>
      <div class="track-segment indeterminate-track track-0"></div>
      <div class="track-segment indeterminate-track track-1"></div>
      <div class="track-segment indeterminate-track track-2"></div>
      <div class="stop-indicator" ?hidden=${hideStop}></div>
      <div class="bar primary-bar" style=${styleMap(primaryBarStyles)}>
        <div class="bar-inner"></div>
      </div>
      <div class="bar secondary-bar">
        <div class="bar-inner"></div>
      </div>
    `
  }
}

;(() => {
  requestUpdateOnAriaChange(Progress)
})()

if (!customElements.get('md-progress')) {
  customElements.define('md-progress', Progress)
}

function parsePx(value, fallback = 0) {
  if (!value) return fallback
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

export function parseTimeMs(value, fallbackMs = DEFAULT_CIRCULAR_WAVE_DURATION_MS) {
  if (value === null || value === undefined) return fallbackMs
  const trimmed = String(value).trim().toLowerCase()
  if (!trimmed) return fallbackMs
  if (trimmed.endsWith('ms')) {
    const n = parseFloat(trimmed)
    return Number.isFinite(n) && n >= 0 ? n : fallbackMs
  }
  if (trimmed.endsWith('s')) {
    const n = parseFloat(trimmed)
    return Number.isFinite(n) && n >= 0 ? n * 1000 : fallbackMs
  }
  const n = parseFloat(trimmed)
  return Number.isFinite(n) && n >= 0 ? n : fallbackMs
}

function solveCubicBezier(x1, y1, x2, y2, x) {
  if (x <= 0) return 0
  if (x >= 1) return 1
  let lo = 0
  let hi = 1
  let t = x
  for (let i = 0; i < 8; i++) {
    const u = 1 - t
    const bx = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t - x
    if (Math.abs(bx) < 1e-6) break
    if (bx < 0) lo = t
    else hi = t
    const dbx = 3 * u * u * x1 + 6 * u * t * (x2 - x1) + 3 * t * t * (1 - x2)
    const nextT = Math.abs(dbx) > 1e-6 ? t - bx / dbx : (lo + hi) * 0.5
    t = nextT > lo && nextT < hi ? nextT : (lo + hi) * 0.5
  }
  const u = 1 - t
  return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t
}

/**
 * Computes M3 Expressive circular wavy indeterminate arc startAngle and sweepAngle
 * over the 6000ms cycle (3000ms expand 10% -> 87%, 3000ms contract 87% -> 10%,
 * 1080deg linear rotation + four 90deg stepped bursts).
 */
export function getCircularWavyIndeterminateState(elapsedMs, reduced = false) {
  const cycleMs =
    ((elapsedMs % CIRCULAR_WAVY_INDETERMINATE_CYCLE_MS) + CIRCULAR_WAVY_INDETERMINATE_CYCLE_MS) %
    CIRCULAR_WAVY_INDETERMINATE_CYCLE_MS

  if (reduced) {
    return {
      startAngle: (cycleMs / CIRCULAR_WAVY_INDETERMINATE_CYCLE_MS) * TWO_PI,
      sweepAngle: Math.PI * 0.5,
    }
  }

  const halfCycleMs = CIRCULAR_WAVY_INDETERMINATE_CYCLE_MS / 2
  let sweepFraction
  if (cycleMs < halfCycleMs) {
    const u = solveCubicBezier(0.2, 0, 0, 1, cycleMs / halfCycleMs)
    sweepFraction = CIRCULAR_WAVY_MIN_PROGRESS + (CIRCULAR_WAVY_MAX_PROGRESS - CIRCULAR_WAVY_MIN_PROGRESS) * u
  } else {
    const u = solveCubicBezier(0.2, 0, 0, 1, (cycleMs - halfCycleMs) / halfCycleMs)
    sweepFraction = CIRCULAR_WAVY_MAX_PROGRESS - (CIRCULAR_WAVY_MAX_PROGRESS - CIRCULAR_WAVY_MIN_PROGRESS) * u
  }

  const globalDeg = 1080 * (cycleMs / CIRCULAR_WAVY_INDETERMINATE_CYCLE_MS)
  const stepIndex = Math.min(3, Math.floor(cycleMs / CIRCULAR_WAVY_STEP_INTERVAL_MS))
  const stepLocalMs = cycleMs - stepIndex * CIRCULAR_WAVY_STEP_INTERVAL_MS
  const stepProgress =
    stepLocalMs < CIRCULAR_WAVY_STEP_DURATION_MS
      ? solveCubicBezier(0.05, 0.7, 0.1, 1, stepLocalMs / CIRCULAR_WAVY_STEP_DURATION_MS)
      : 1
  const additionalDeg = (stepIndex + stepProgress) * 90

  return {
    startAngle: (((globalDeg + additionalDeg) % 360) * Math.PI) / 180,
    sweepAngle: sweepFraction * TWO_PI,
  }
}

export function getWavyCirclePath(cx, cy, r, amplitude, frequency, phase, startAngle = 0, sweepAngle = TWO_PI) {
  if (!Number.isFinite(sweepAngle) || sweepAngle <= 0.001) {
    return ''
  }
  const clampedSweep = Math.min(TWO_PI, Math.max(0, sweepAngle))
  const isClosed = clampedSweep >= TWO_PI - 0.001
  // Smoothly taper wave amplitude near tiny sweeps so very small arcs stay clean
  const effectiveAmp = amplitude * Math.min(1, clampedSweep / 0.35)
  const fullCircleSteps = Math.max(96, frequency * 16)
  const steps = isClosed ? fullCircleSteps : Math.max(16, Math.ceil((clampedSweep / TWO_PI) * fullCircleSteps))
  const points = []
  const count = isClosed ? steps : steps + 1

  for (let i = 0; i < count; i++) {
    const frac = i / steps
    const localTheta = frac * clampedSweep
    const theta = startAngle + localTheta
    const perturbedRadius = r + effectiveAmp * Math.sin(frequency * localTheta - phase)
    const x = cx + perturbedRadius * Math.cos(theta)
    const y = cy + perturbedRadius * Math.sin(theta)
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }

  if (isClosed) {
    points.push('Z')
  }
  return points.join(' ')
}
