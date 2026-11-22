import { css } from 'lit'

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
    contain: layout style;
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
      stroke-dasharray: 289.07 70.93;
      stroke-dashoffset: -45.46;
    }
    50% {
      stroke-dasharray: 49.07 310.93;
      stroke-dashoffset: -335.46;
    }
    100% {
      stroke-dasharray: 289.07 70.93;
      stroke-dashoffset: -405.46;
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
    --_used-indeterminate-bar-duration: 1750ms;
    display: flex;
    position: relative;
    min-width: 40px;
    height: max(var(--_track-height), var(--_active-indicator-height));
    contain: layout style paint;
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
  .linear .indeterminate-tracks,
  .linear .indeterminate-track {
    display: none;
  }

  .linear .indeterminate-tracks {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: var(--_track-height);
    border-radius: var(--_track-shape);
    overflow: hidden;
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
  .linear.progress.indeterminate .indeterminate-tracks,
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

  /* Direct standard left/right keyframes ensure WebKit/Safari 26 animates every frame
     even when Shadow DOM custom-property keyframes skip descendant calc() invalidation. */
  .linear.progress.indeterminate .primary-bar {
    width: auto;
    animation:
      m3-l1-tail-left 1750ms infinite,
      m3-l1-head-right 1750ms infinite;
  }

  .linear.progress.indeterminate .secondary-bar {
    width: auto;
    animation:
      m3-l2-tail-left 1750ms infinite,
      m3-l2-head-right 1750ms infinite;
  }

  .linear.progress.indeterminate .track-0 {
    right: 0;
    width: auto;
    margin-left: var(--_track-gap);
    animation: m3-l1-head-left 1750ms infinite;
  }

  .linear.progress.indeterminate .track-1 {
    width: auto;
    margin-left: var(--_track-gap);
    margin-right: var(--_track-gap);
    animation:
      m3-l2-head-left 1750ms infinite,
      m3-l1-tail-right 1750ms infinite;
  }

  .linear.progress.indeterminate .track-2 {
    left: 0;
    width: auto;
    margin-right: var(--_track-gap);
    animation: m3-l2-tail-right 1750ms infinite;
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
    inset: 0 auto 0 calc(-1 * var(--_wavelength));
    width: calc(100cqi + var(--_wavelength) * 2);
    border-radius: 0;
    -webkit-mask-image: ${WAVY_MASK_40};
    mask-image: ${WAVY_MASK_40};
    -webkit-mask-size: var(--_wavelength) 100%;
    mask-size: var(--_wavelength) 100%;
    -webkit-mask-repeat: repeat-x;
    mask-repeat: repeat-x;
    animation: wavy-linear-move var(--_used-wave-duration) linear infinite;
    will-change: transform;
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
     rather than dragging the wave mask at bar-tail velocity. Direct cqi keyframes guarantee
     track-anchoring in Safari 26 without relying on custom-property calc() invalidation. */
  .linear.progress.wavy.indeterminate.registered-props .primary-bar .bar-inner {
    inset: 0 auto 0 calc(var(--_l1-tail) * -100cqi - var(--_wavelength));
    margin-left: calc(-1 * var(--_wavelength));
    width: calc(100cqi + var(--_wavelength) * 2);
    animation:
      wavy-linear-move var(--_used-wave-duration) linear infinite,
      m3-l1-tail-cqi var(--_used-indeterminate-bar-duration) infinite;
  }

  .linear.progress.wavy.indeterminate.registered-props .secondary-bar .bar-inner {
    inset: 0 auto 0 calc(var(--_l2-tail) * -100cqi - var(--_wavelength));
    margin-left: calc(-1 * var(--_wavelength));
    width: calc(100cqi + var(--_wavelength) * 2);
    animation:
      wavy-linear-move var(--_used-wave-duration) linear infinite,
      m3-l2-tail-cqi var(--_used-indeterminate-bar-duration) infinite;
  }

  .linear.progress.wavy.indeterminate.four-color .bar-inner {
    animation:
      wavy-linear-move var(--_used-wave-duration) linear infinite,
      linear-four-color var(--_used-four-color-duration, 3500ms) linear infinite;
  }

  .linear.progress.wavy.indeterminate.registered-props.four-color .primary-bar .bar-inner {
    animation:
      wavy-linear-move var(--_used-wave-duration) linear infinite,
      m3-l1-tail-cqi var(--_used-indeterminate-bar-duration) infinite,
      linear-four-color var(--_used-four-color-duration, 3500ms) linear infinite;
  }

  .linear.progress.wavy.indeterminate.registered-props.four-color .secondary-bar .bar-inner {
    animation:
      wavy-linear-move var(--_used-wave-duration) linear infinite,
      m3-l2-tail-cqi var(--_used-indeterminate-bar-duration) infinite,
      linear-four-color var(--_used-four-color-duration, 3500ms) linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    :host([type='linear']) {
      --_used-indeterminate-bar-duration: 6s;
    }

    .linear.progress:not(.indeterminate) .primary-bar,
    .linear.progress:not(.indeterminate) .inactive-track {
      transition: none;
    }

    .linear.progress.indeterminate.registered-props,
    .linear.progress.indeterminate .primary-bar,
    .linear.progress.indeterminate .secondary-bar,
    .linear.progress.indeterminate .indeterminate-track {
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

  @keyframes m3-l1-head-right {
    0% {
      right: 110%;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    57.14%,
    100% {
      right: -10%;
    }
  }

  @keyframes m3-l1-head-left {
    0% {
      left: -10%;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    57.14%,
    100% {
      left: 110%;
    }
  }

  @keyframes m3-l1-tail-left {
    0%,
    14.29% {
      left: -10%;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    71.43%,
    100% {
      left: 110%;
    }
  }

  @keyframes m3-l1-tail-right {
    0%,
    14.29% {
      right: 110%;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    71.43%,
    100% {
      right: -10%;
    }
  }

  @keyframes m3-l2-head-right {
    0%,
    37.14% {
      right: 110%;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    85.71%,
    100% {
      right: -10%;
    }
  }

  @keyframes m3-l2-head-left {
    0%,
    37.14% {
      left: -10%;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    85.71%,
    100% {
      left: 110%;
    }
  }

  @keyframes m3-l2-tail-left {
    0%,
    51.43% {
      left: -10%;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    100% {
      left: 110%;
    }
  }

  @keyframes m3-l2-tail-right {
    0%,
    51.43% {
      right: 110%;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    100% {
      right: -10%;
    }
  }

  @keyframes m3-l1-tail-cqi {
    0%,
    14.29% {
      left: 10cqi;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    71.43%,
    100% {
      left: -110cqi;
    }
  }

  @keyframes m3-l2-tail-cqi {
    0%,
    51.43% {
      left: 10cqi;
      animation-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
    }
    100% {
      left: -110cqi;
    }
  }

  @keyframes linear-buffering {
    0% {
      transform: translateY(-50%) translateX(10px);
    }
    100% {
      transform: translateY(-50%) translateX(0px);
    }
  }

  @keyframes wavy-linear-move {
    from {
      transform: translate3d(0px, 0px, 0px);
    }
    to {
      transform: translate3d(var(--_wavelength, 40px), 0px, 0px);
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
