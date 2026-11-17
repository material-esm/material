import { html, LitElement, nothing, svg } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { circularStyles, linearStyles, SUPPORTS_REGISTERED_PROPS } from './progress-styles.js'

const TWO_PI = Math.PI * 2
const CIRCULAR_INDETERMINATE_ARC_MS = 1333
const CIRCULAR_INDETERMINATE_ROTATE_MS = 1568.2352941176

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

    this._wavyAnimationActive = false
    this._wavyRafId = 0
    this._wavyLastTs = 0
    this._wavyPhase = 0
    this._wavyElapsedMs = 0
    this._wavyPathEl = null
    this._wavyTrackEl = null
    this._resizeObserver = null
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

    if (Math.abs(this._boxSize - boxSize) > 0.05) this._boxSize = boxSize
    if (Math.abs(this._strokeWidth - strokeWidth) > 0.05) this._strokeWidth = strokeWidth
    if (Math.abs(this._trackGap - trackGap) > 0.05) this._trackGap = trackGap
    if (Math.abs(this._waveAmplitude - waveAmplitude) > 0.05) this._waveAmplitude = waveAmplitude
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
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }

  _updateWavyAnimationState() {
    if (this.shape === 'wavy' && this.type !== 'linear' && (this.indeterminate || this.clampedFraction > 0)) {
      this._startWavyAnimation()
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
      const speedFactor = reduced ? 0.2 : 1
      const dt = Math.max(0, rawDt) * speedFactor

      // Advance wave phase at ~1 wave cycle per second
      this._wavyPhase += dt * TWO_PI
      this._wavyElapsedMs += dt * 1000

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
      const rotAngle =
        ((this._wavyElapsedMs % CIRCULAR_INDETERMINATE_ROTATE_MS) / CIRCULAR_INDETERMINATE_ROTATE_MS) * TWO_PI
      if (reduced) {
        startAngle = rotAngle
        sweepAngle = Math.PI * 0.5
      } else {
        const cycleT = (this._wavyElapsedMs % CIRCULAR_INDETERMINATE_ARC_MS) / CIRCULAR_INDETERMINATE_ARC_MS
        let arcDeg
        let offsetDeg
        if (cycleT < 0.5) {
          const u = easeStandard(cycleT * 2)
          arcDeg = 20 + 240 * u
          offsetDeg = 50 * u
        } else {
          const u = easeStandard((cycleT - 0.5) * 2)
          arcDeg = 260 - 240 * u
          offsetDeg = 50 + 310 * u
        }
        startAngle = rotAngle + (offsetDeg * Math.PI) / 180
        sweepAngle = (arcDeg * Math.PI) / 180
      }
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

// Fast-out, slow-in M3 standard easing approximation: cubic-bezier(0.4, 0, 0.2, 1)
function easeStandard(x) {
  if (x <= 0) return 0
  if (x >= 1) return 1
  // Solve x(t) for cubic-bezier(0.4, 0, 0.2, 1) via 5 Newton-Raphson iterations
  let t = x
  for (let i = 0; i < 5; i++) {
    const u = 1 - t
    const bx = 3 * u * u * t * 0.4 + 3 * u * t * t * 0.2 + t * t * t - x
    const dbx = 3 * u * u * 0.4 + 6 * u * t * (0.2 - 0.4) + 3 * t * t * (1 - 0.2)
    if (Math.abs(dbx) < 1e-6) break
    t = Math.max(0, Math.min(1, t - bx / dbx))
  }
  const u = 1 - t
  return 3 * u * t * t + t * t * t
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
    const theta = startAngle + frac * clampedSweep
    const perturbedRadius = r + effectiveAmp * Math.sin(frequency * theta - phase)
    const x = cx + perturbedRadius * Math.cos(theta)
    const y = cy + perturbedRadius * Math.sin(theta)
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }

  if (isClosed) {
    points.push('Z')
  }
  return points.join(' ')
}
