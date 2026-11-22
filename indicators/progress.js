import { html, LitElement, nothing, svg } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { requestUpdateOnAriaChange } from '../internal/aria/delegate.js'
import { circularStyles, linearStyles, SUPPORTS_REGISTERED_PROPS } from './progress-styles.js'

const TWO_PI = Math.PI * 2
const CIRCULAR_INDETERMINATE_ARC_MS = 1333
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
    this._customTrackAnim = null
    this._customTrackKey = ''
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
      this._syncCustomCircularTrackAnimation()
    }
  }

  firstUpdated() {
    this._syncCircularMetrics()
    this._updateWavyAnimationState()
    this._syncCustomCircularTrackAnimation()
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
    this._syncCustomCircularTrackAnimation()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._stopWavyAnimation()
    this._stopCustomCircularTrackAnimation()
    this._teardownResizeObserver()
  }

  _stopCustomCircularTrackAnimation() {
    if (this._customTrackAnim) {
      this._customTrackAnim.cancel()
      this._customTrackAnim = null
      this._customTrackKey = ''
    }
  }

  _syncCustomCircularTrackAnimation() {
    const isFlatCircularIndeterminate = this.type !== 'linear' && this.shape !== 'wavy' && this.indeterminate
    if (!isFlatCircularIndeterminate || this._prefersReducedMotion()) {
      this._stopCustomCircularTrackAnimation()
      return
    }
    const { stroke, gap, circumference } = this._getCircularGeometry()
    const clearance = gap > 0 ? gap + stroke : 0
    const gapDeg = Math.min(80, (clearance / circumference) * 360)
    const trackMax = Math.max(0, 360 - 20 - 2 * gapDeg)
    // Default 48px geometry already matches static literal CSS @keyframes (289.07)
    if (Math.abs(trackMax - 289.07) < 0.2) {
      this._stopCustomCircularTrackAnimation()
      return
    }
    const trackEl = this.renderRoot?.querySelector('.circular .track')
    if (!trackEl || typeof trackEl.animate !== 'function') {
      return
    }
    const trackMin = Math.max(0, 360 - 260 - 2 * gapDeg)
    const key = `${trackMax.toFixed(2)}:${gapDeg.toFixed(2)}`
    if (this._customTrackAnim && this._customTrackKey === key) {
      return
    }
    this._stopCustomCircularTrackAnimation()
    const anim = trackEl.animate(
      [
        {
          strokeDasharray: `${trackMax.toFixed(2)} ${(360 - trackMax).toFixed(2)}`,
          strokeDashoffset: `${-(20 + gapDeg).toFixed(2)}`,
        },
        {
          strokeDasharray: `${trackMin.toFixed(2)} ${(360 - trackMin).toFixed(2)}`,
          strokeDashoffset: `${-(50 + 260 + gapDeg).toFixed(2)}`,
        },
        {
          strokeDasharray: `${trackMax.toFixed(2)} ${(360 - trackMax).toFixed(2)}`,
          strokeDashoffset: `${-(360 + 20 + gapDeg).toFixed(2)}`,
        },
      ],
      {
        duration: CIRCULAR_INDETERMINATE_ARC_MS,
        iterations: Infinity,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    )
    const activeEl = this.renderRoot?.querySelector('.circular .active-track')
    const activeAnims = activeEl?.getAnimations?.()
    const activeAnim = activeAnims?.find((a) => a.animationName === 'circular-indeterminate-active') ?? activeAnims?.[0]
    if (activeAnim && activeAnim.startTime !== null) {
      anim.startTime = activeAnim.startTime
    }
    this._customTrackAnim = anim
    this._customTrackKey = key
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
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }

  _updateWavyAnimationState() {
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
