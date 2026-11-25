import { html, css } from 'lit'
import '../../icon/icon.js'
import '../../text/scroll-field.js'

export const expressiveScrollFieldStyles = css`
  .scroll-wheel-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: flex-start;
  }

  .readout-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
    background: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }
`

export function renderScrollFieldsSection(host) {
  return html`
    <section class="demo-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Scroll Fields (M3 Expressive)</h2>
          <p class="section-desc">
            Drum/wheel inputs in 1–2, 3, and 4 digit sizes with finite &amp; seamless looping modes, spinbutton keyboard
            control, and click-to-type inline text editing.
          </p>
        </div>
        <a href="./scroll-field-demo.html" class="section-link">
          View Full Scroll Field Demo <md-icon style="font-size: 18px">arrow_forward</md-icon>
        </a>
      </div>

      <div class="flexw g24" style="align-items: flex-start">
        <div class="flex col g12">
          <h3 class="sub-section-title" style="margin-top: 0">Digit Sizes (1–2, 3, 4) — Click Center to Type</h3>
          <div class="scroll-wheel-row">
            <md-scroll-field
              size="1-2"
              min="0"
              max="59"
              pad="2"
              .value=${host.scrollMinutes}
              label="Minutes (1–2)"
              aria-label="Minutes"
              @input=${(e) => {
                host.scrollMinutes = e.target.formattedValue || e.target.value
              }}></md-scroll-field>

            <md-scroll-field
              size="3"
              min="0"
              max="359"
              .value=${host.scrollHeading}
              suffix="°"
              label="Heading (3)"
              aria-label="Heading degrees"
              @input=${(e) => {
                host.scrollHeading = e.target.value
              }}></md-scroll-field>

            <md-scroll-field
              size="4"
              min="1900"
              max="2100"
              .value=${host.scrollYear}
              label="Year (4)"
              aria-label="Year"
              @input=${(e) => {
                host.scrollYear = e.target.value
              }}></md-scroll-field>
          </div>
          <div>
            <span class="readout-chip">
              Selected: ${String(host.scrollMinutes).padStart(2, '0')}m · ${host.scrollHeading}° · ${host.scrollYear}
            </span>
          </div>
        </div>

        <div class="flex col g12">
          <h3 class="sub-section-title" style="margin-top: 0">Looping Time Group &amp; Discrete Options</h3>
          <md-scroll-field-group label="Wake-up Alarm">
            <md-scroll-field
              size="1-2"
              min="1"
              max="12"
              .value=${host.alarmHour}
              loop
              label="Hour"
              aria-label="Alarm hour"
              @input=${(e) => {
                host.alarmHour = e.target.value
              }}></md-scroll-field>
            <span class="separator" aria-hidden="true">:</span>
            <md-scroll-field
              size="1-2"
              min="0"
              max="59"
              pad="2"
              .value=${host.alarmMinute}
              loop
              label="Minute"
              aria-label="Alarm minute"
              @input=${(e) => {
                host.alarmMinute = e.target.formattedValue || e.target.value
              }}></md-scroll-field>
            <md-scroll-field
              .options=${['AM', 'PM']}
              .value=${host.alarmPeriod}
              label="Period"
              aria-label="AM or PM"
              @input=${(e) => {
                host.alarmPeriod = e.target.value
              }}></md-scroll-field>
          </md-scroll-field-group>
          <div>
            <span class="readout-chip">
              Alarm: ${host.alarmHour}:${String(host.alarmMinute).padStart(2, '0')} ${host.alarmPeriod}
            </span>
          </div>
        </div>
      </div>
    </section>
  `
}
