import { html, css, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

export class TimePicker extends LitElement {
  static properties = {
    value: { type: String, reflect: true }, // HH:MM (24h format)
    format: { type: Number }, // 12 or 24
    view: { state: true }, // 'hour' | 'minute'
    period: { state: true }, // 'AM' | 'PM'
  }

  constructor() {
    super()
    this.value = '00:00'
    this.format = 12
    this.view = 'hour'
    this.period = 'AM'
  }

  updated(changedProperties) {
    if (changedProperties.has('value') && this.value) {
        this.syncFromValue()
    }
  }

  syncFromValue() {
      if (!this.value) return
      const [h, m] = this.value.split(':').map(Number)
      if (isNaN(h) || isNaN(m)) return

      if (this.format === 12) {
          this.period = h >= 12 ? 'PM' : 'AM'
          let hour12 = h % 12
          if (hour12 === 0) hour12 = 12
          // We don't store displayHour separately, we derive it or use a getter?
          // But for editing, we might want state.
          // Let's rely on internal state matching value for now, unless interaction changes it.
      }
  }

  get _parsedTime() {
      if (!this.value) return { h: 0, m: 0 }
      const [h, m] = this.value.split(':').map(Number)
      return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m }
  }

  render() {
    return html`
      <div class="container">
        ${this.renderHeader()}
        ${this.renderClock()}
        ${this.renderActions()}
      </div>
    `
  }

  renderHeader() {
    const { h, m } = this._parsedTime
    let displayHour = h
    if (this.format === 12) {
        displayHour = h % 12
        if (displayHour === 0) displayHour = 12
    }
    const displayMinute = String(m).padStart(2, '0')

    const hourClasses = { active: this.view === 'hour' }
    const minuteClasses = { active: this.view === 'minute' }

    // AM/PM selector
    const amActive = this.period === 'AM'
    const pmActive = this.period === 'PM'

    return html`
      <div class="header">
        <div class="time-display">
            <span class="time-part ${classMap(hourClasses)}" @click=${() => this.view = 'hour'}>${displayHour}</span>
            <span class="separator">:</span>
            <span class="time-part ${classMap(minuteClasses)}" @click=${() => this.view = 'minute'}>${displayMinute}</span>
        </div>
        ${this.format === 12 ? html`
            <div class="period-selector">
                <div class="period ${amActive ? 'active' : ''}" @click=${() => this.setPeriod('AM')}>AM</div>
                <div class="period ${pmActive ? 'active' : ''}" @click=${() => this.setPeriod('PM')}>PM</div>
            </div>
        ` : nothing}
      </div>
    `
  }

  renderClock() {
    // Clock face size 256px
    // Numbers positioned at radius
    const numbers = this.view === 'hour' ? this.getHourNumbers() : this.getMinuteNumbers()
    const rotation = this.getHandRotation()

    return html`
      <div class="clock-face" @pointerdown=${this.handlePointerDown} @pointermove=${this.handlePointerMove} @pointerup=${this.handlePointerUp}>
        <div class="center-dot"></div>
        <div class="hand" style="transform: rotate(${rotation}deg)">
            <div class="hand-line"></div>
            <div class="hand-circle"></div>
        </div>
        ${numbers.map(n => html`
            <div class="number ${n.selected ? 'selected' : ''}" style="left: ${n.x}px; top: ${n.y}px">
                ${n.label}
            </div>
        `)}
      </div>
    `
  }

  getHourNumbers() {
      const { h } = this._parsedTime
      const radius = 100 // clock radius is 128, numbers at ~100
      const center = 128
      const nums = []

      const is12 = this.format === 12
      const count = is12 ? 12 : 12 // Simplified for 24h first ring for now, assume 12h first

      for (let i = 1; i <= 12; i++) {
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)

          let val = i
          if (val === 12 && !is12) val = 0 // for 24h? tricky.
          // Let's focus on 12h format primarily as per spec example

          let selected = false
          if (is12) {
              let currentH12 = h % 12
              if (currentH12 === 0) currentH12 = 12
              if (currentH12 === i) selected = true
          }

          nums.push({ label: i, x, y, selected })
      }
      return nums
  }

  getMinuteNumbers() {
      const { m } = this._parsedTime
      const radius = 100
      const center = 128
      const nums = []

      for (let i = 0; i < 12; i++) {
          const val = i * 5
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)

          // Only show numbers for multiples of 5
          const selected = m === val
          nums.push({ label: String(val).padStart(2, '0'), x, y, selected })
      }
      return nums
  }

  getHandRotation() {
      const { h, m } = this._parsedTime
      if (this.view === 'hour') {
          // 12 hours = 360 deg, 1 hour = 30 deg
          let val = h % 12
          // if (val === 0) val = 12; // 12 should be at top (0 deg visual, but 270 math).
          // 12 -> 0 deg (top). 3 -> 90 deg.
          // (val * 30) gives 12->360->0, 3->90.
          return val * 30
      } else {
          // 60 minutes = 360 deg, 1 min = 6 deg
          return m * 6
      }
  }

  renderActions() {
    return html`
        <div class="actions">
            <slot name="actions"></slot>
        </div>
    `
  }

  setPeriod(p) {
      if (this.period === p) return
      this.period = p
      // Update value
      let { h, m } = this._parsedTime
      if (p === 'AM' && h >= 12) {
          h -= 12
      } else if (p === 'PM' && h < 12) {
          h += 12
      }
      this.updateValue(h, m)
  }

  updateValue(h, m) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      this.value = time
      this.dispatchEvent(new Event('input', { bubbles: true }))
      this.dispatchEvent(new Event('change', { bubbles: true }))
  }

  handlePointerDown(e) {
      this._isDragging = true
      this.setClockTimeFromEvent(e)
  }

  handlePointerMove(e) {
      if (!this._isDragging) return
      e.preventDefault() // prevent scroll
      this.setClockTimeFromEvent(e)
  }

  handlePointerUp(e) {
      this._isDragging = false
      if (this.view === 'hour') {
          // Switch to minute view on mouse up (common behavior)
          // But maybe wait a bit or animate?
          this.view = 'minute'
      }
  }

  setClockTimeFromEvent(e) {
      const rect = this.shadowRoot.querySelector('.clock-face').getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const x = e.clientX - rect.left - centerX
      const y = e.clientY - rect.top - centerY

      // Calculate angle
      // atan2(y, x) returns -PI to PI.
      // 0 is right (3 o'clock).
      // We want 0 at top (12 o'clock).
      // top: x=0, y=-1. atan2(-1, 0) = -PI/2.

      let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
      if (angle < 0) angle += 360

      // angle is now 0 at top, increasing clockwise.

      if (this.view === 'hour') {
          // 360 deg / 12 = 30 deg per hour
          let hour = Math.round(angle / 30)
          if (hour === 0) hour = 12

          // Handle AM/PM logic for internal 24h storage
          if (this.period === 'PM' && hour !== 12) hour += 12
          if (this.period === 'AM' && hour === 12) hour = 0

          const { m } = this._parsedTime
          this.updateValue(hour, m)
      } else {
          // 360 deg / 60 = 6 deg per minute
          let minute = Math.round(angle / 6)
          if (minute === 60) minute = 0

          const { h } = this._parsedTime
          this.updateValue(h, minute)
      }
  }

  static styles = css`
    :host {
      display: inline-block;
      background-color: var(--md-sys-color-surface-container-high, #ece6f0);
      border-radius: 28px;
      overflow: hidden;
      user-select: none;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 320px; /* Standard width? */
      padding-bottom: 24px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 24px 0;
      gap: 12px;
    }

    .time-display {
      display: flex;
      align-items: baseline;
      font-size: 57px; /* display-large */
      line-height: 64px;
      color: var(--md-sys-color-on-surface);
    }

    .time-part {
      cursor: pointer;
      border-radius: 8px;
      padding: 0 4px;
      background-color: transparent;
    }

    .time-part.active {
      background-color: var(--md-sys-color-primary-container, #eaddff);
      color: var(--md-sys-color-on-primary-container, #21005d);
    }

    .separator {
        margin: 0 4px;
    }

    .period-selector {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--md-sys-color-outline, #79747e);
      border-radius: 8px;
      overflow: hidden;
    }

    .period {
      padding: 8px 10px;
      font-size: 16px;
      cursor: pointer;
      color: var(--md-sys-color-on-surface-variant);
    }

    .period:hover {
        background-color: var(--md-sys-color-surface-variant);
    }

    .period.active {
      background-color: var(--md-sys-color-tertiary-container, #ffd8e4);
      color: var(--md-sys-color-on-tertiary-container, #31111d);
    }

    .clock-face {
      position: relative;
      width: 256px;
      height: 256px;
      background-color: var(--md-sys-color-surface-variant, #e7e0ec);
      border-radius: 50%;
      cursor: pointer;
      touch-action: none; /* Prevent scrolling while dragging */
    }

    .center-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      background-color: var(--md-sys-color-primary, #6750a4);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }

    .hand {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 2px;
      height: 100px; /* Radius */
      background-color: transparent;
      transform-origin: bottom center;
      /* Rotate from bottom center which is clock center */
      /* Note: height is radius. We need to position it so bottom is at center. */
      /* top: 50% - 100px = top position */
      margin-top: -100px;
      /* Actually simpler: wrapper 0 height at center? */
      pointer-events: none;
    }

    .hand-line {
        width: 2px;
        height: 100%;
        background-color: var(--md-sys-color-primary, #6750a4);
        margin: 0 auto;
    }

    .hand-circle {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--md-sys-color-primary, #6750a4);
        position: absolute;
        top: -24px; /* Center circle at tip */
        left: 50%;
        transform: translateX(-50%);
        opacity: 0.8; /* See number through it? M3 usually solid but behind text. */
        /* Actually in M3, the selected number is white text on primary circle. */
        /* The hand circle is the background for the selected number. */
        z-index: 1;
    }

    .number {
        position: absolute;
        width: 48px;
        height: 48px;
        line-height: 48px;
        text-align: center;
        transform: translate(-50%, -50%);
        font-size: 16px;
        color: var(--md-sys-color-on-surface);
        pointer-events: none;
        z-index: 3; /* Above hand circle */
    }

    .number.selected {
        color: var(--md-sys-color-on-primary, #ffffff);
    }

    .actions {
        display: none; /* Embedded doesn't enforce actions, dialog does */
    }
  `
}

customElements.define('md-time-picker', TimePicker)
