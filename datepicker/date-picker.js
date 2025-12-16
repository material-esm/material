import { html, css, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import '../icon/icon.js'
import '../buttons/icon-button.js'
import '../divider/divider.js'

export class DatePicker extends LitElement {
  static properties = {
    value: { type: String, reflect: true }, // YYYY-MM-DD
    min: { type: String },
    max: { type: String },
    open: { type: Boolean, reflect: true },
    displayDate: { state: true }, // Date object
    view: { state: true }, // 'day' | 'year' | 'month'
    hideHeader: { type: Boolean, attribute: 'hide-header' }
  }

  constructor() {
    super()
    this.value = ''
    this.displayDate = new Date()
    this.view = 'day'
    this.hideHeader = false
  }

  updated(changedProperties) {
    if (changedProperties.has('value') && this.value) {
      // If value changes externally, update displayDate if it's valid
      const date = new Date(this.value)
      if (!isNaN(date.getTime())) {
        // Only update display date if we are not already viewing that month/year?
        // Actually, usually if value changes, we want to jump to it.
        // But we must be careful not to reset it while user is browsing.
        // For now, let's sync them.
        this.displayDate = new Date(date)
      }
    }
  }

  get _displayDate() {
    return this.displayDate || new Date()
  }

  render() {
    return html`
      <div class="container">
        ${this.hideHeader ? nothing : this.renderHeader()}
        ${this.renderContent()}
        ${this.renderActions()}
      </div>
    `
  }

  renderHeader() {
    // In M3, the header typically shows the selected date or "Select date"
    // And also controls for switching views.

    // For embedded/modal, the top part usually has "Select date" (subhead) and the selected date (headline).
    // Then below that is the navigation bar (Month Year + Arrows).

    const selectedDate = this.value ? new Date(this.value) : null
    // Adjust for timezone offset to display correctly
    if (selectedDate) {
        selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset())
    }

    const dateString = selectedDate && !isNaN(selectedDate.getTime())
      ? new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(selectedDate)
      : 'Select date'

    return html`
      <div class="header">
        <div class="subhead">Select date</div>
        <div class="headline">${dateString}</div>
      </div>
    `
  }

  renderContent() {
    return html`
      <div class="content">
        ${this.renderControls()}
        ${this.view === 'day' ? this.renderCalendar() : this.renderYearList()}
      </div>
    `
  }

  renderControls() {
    const date = this._displayDate
    const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)

    return html`
      <div class="controls">
        <div class="period-selector" @click=${this.toggleView}>
          <span>${monthYear}</span>
          <md-icon class="dropdown-icon">${this.view === 'year' ? 'arrow_drop_up' : 'arrow_drop_down'}</md-icon>
        </div>
        <div class="arrows">
          <md-icon-button @click=${this.prevMonth} ?disabled=${this.view !== 'day'}>
            <md-icon>chevron_left</md-icon>
          </md-icon-button>
          <md-icon-button @click=${this.nextMonth} ?disabled=${this.view !== 'day'}>
            <md-icon>chevron_right</md-icon>
          </md-icon-button>
        </div>
      </div>
    `
  }

  renderCalendar() {
    const displayDate = this._displayDate
    const year = displayDate.getFullYear()
    const month = displayDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startingDayOfWeek = firstDay.getDay() // 0 = Sunday
    const totalDays = lastDay.getDate()

    const days = []
    // Empty slots for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(html`<div class="day empty"></div>`)
    }

    // Days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i)
      const dateString = this.formatDate(date)
      const isSelected = this.value === dateString
      const isToday = this.isToday(date)
      const isDisabled = this.isDateDisabled(date)

      const classes = {
        day: true,
        selected: isSelected,
        today: isToday,
        disabled: isDisabled
      }

      days.push(html`
        <div class=${classMap(classes)} @click=${() => !isDisabled && this.selectDate(date)}>
          ${i}
        </div>
      `)
    }

    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    return html`
      <div class="calendar">
        <div class="weekdays">
          ${weekdays.map(d => html`<div class="weekday">${d}</div>`)}
        </div>
        <div class="days">
          ${days}
        </div>
      </div>
    `
  }

  renderYearList() {
    // Basic year list implementation
    const years = []
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 100
    const endYear = currentYear + 100

    for (let y = startYear; y <= endYear; y++) {
        const isSelected = this._displayDate.getFullYear() === y
        years.push(html`
            <div class="year ${isSelected ? 'selected' : ''}" @click=${() => this.selectYear(y)}>
                ${y}
            </div>
        `)
    }

    // We should scroll to the selected year.
    // For now, just render simple list.
    return html`<div class="year-list">${years}</div>`
  }

  renderActions() {
    return html`
        <div class="actions">
            <slot name="actions"></slot>
        </div>
    `
  }

  toggleView() {
    this.view = this.view === 'day' ? 'year' : 'day'
  }

  prevMonth() {
    const d = new Date(this._displayDate)
    d.setMonth(d.getMonth() - 1)
    this.displayDate = d
  }

  nextMonth() {
    const d = new Date(this._displayDate)
    d.setMonth(d.getMonth() + 1)
    this.displayDate = d
  }

  selectDate(date) {
    if (this.isDateDisabled(date)) return
    this.value = this.formatDate(date)
    this.dispatchEvent(new Event('change', { bubbles: true }))
    this.dispatchEvent(new Event('input', { bubbles: true }))
  }

  selectYear(year) {
    const d = new Date(this._displayDate)
    d.setFullYear(year)
    this.displayDate = d
    this.view = 'day'
  }

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  isToday(date) {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  isDateDisabled(date) {
    const dateString = this.formatDate(date)
    if (this.min && dateString < this.min) return true
    if (this.max && dateString > this.max) return true
    return false
  }

  static styles = css`
    :host {
      display: inline-block;
      background-color: var(--md-sys-color-surface-container-high, #ece6f0);
      border-radius: 16px;
      overflow: hidden;
      /* width: 320px; */ /* Let it be sized by content or container */
    }

    .container {
      display: flex;
      flex-direction: column;
      width: 320px;
    }

    .header {
      padding: 16px 24px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .subhead {
      font-size: 12px; // label-medium
      line-height: 16px;
      letter-spacing: 0.5px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
    }

    .headline {
      font-size: 32px; // headline-large
      line-height: 40px;
      color: var(--md-sys-color-on-surface);
      margin-top: 4px;
    }

    .content {
      padding: 0 12px 12px;
    }

    .controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 48px;
      margin-bottom: 8px;
    }

    .period-selector {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 8px;
        border-radius: 24px; // Full
        font-weight: 500;
        font-size: 14px; // label-large
        color: var(--md-sys-color-on-surface-variant);
    }

    .period-selector:hover {
        background-color: var(--md-sys-color-surface-variant); // slightly darker
    }

    .dropdown-icon {
        font-size: 18px;
        margin-left: 4px;
    }

    .arrows {
        display: flex;
    }

    .calendar {
      display: flex;
      flex-direction: column;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 4px;
    }

    .weekday {
      text-align: center;
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
      width: 40px;
      height: 24px;
      line-height: 24px;
    }

    .days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      row-gap: 4px;
    }

    .day {
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      color: var(--md-sys-color-on-surface);
      position: relative;
    }

    .day:hover {
      background-color: var(--md-sys-color-surface-variant);
    }

    .day.empty {
      pointer-events: none;
    }

    .day.disabled {
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.38;
      pointer-events: none;
    }

    .day.today {
      border: 1px solid var(--md-sys-color-primary);
      color: var(--md-sys-color-primary);
      box-sizing: border-box;
      line-height: 38px; /* adjust for border */
    }

    .day.selected {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }

    .day.selected:hover {
        background-color: var(--md-sys-color-primary); /* Keep it primary on hover if selected */
    }

    .year-list {
        height: 250px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .year {
        padding: 12px 24px;
        cursor: pointer;
        border-radius: 16px;
        font-size: 16px;
    }

    .year:hover {
        background-color: var(--md-sys-color-surface-variant);
    }

    .year.selected {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        padding: 8px 12px;
        gap: 8px;
    }
  `
}

customElements.define('md-date-picker', DatePicker)
