import { html, css } from 'lit'
import '../../buttons/fab-menu.js'
import '../../icon/icon.js'
import { snack } from '../../snackbar/snackbar.js'

export const expressiveFabMenuStyles = css`
  .fab-menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 16px;
  }

  .fab-menu-stage {
    position: relative;
    min-height: 300px;
    padding: 16px;
    border-radius: 16px;
    background: var(--md-sys-color-surface, #ffffff);
    border: 1px solid var(--md-sys-color-outline-variant, rgba(120, 120, 120, 0.2));
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .stage-caption {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
  }

  .stage-anchor-end {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }

  .stage-anchor-start {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
  }
`

function onFabMenuItemActivate(e) {
  const label = e.detail?.label || e.detail?.value || 'Action'
  snack(`FAB Menu: ${label}`)
}

export function renderFabMenuSection() {
  return html`
    <section class="demo-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">FAB Menu (M3 Expressive)</h2>
          <p class="section-desc">
            Speed-dial FAB menu expanding 2–6 pill-shaped action items while morphing the trigger into a circular 56dp
            close button.
          </p>
        </div>
        <a href="./fab-menu-demo.html" class="section-link">
          View Full FAB Menu Demo <md-icon style="font-size: 18px">arrow_forward</md-icon>
        </a>
      </div>

      <div class="fab-menu-grid" @item-activate=${onFabMenuItemActivate}>
        <div class="fab-menu-stage">
          <span class="stage-caption">Primary (4 items)</span>
          <div class="stage-anchor-end">
            <md-fab-menu variant="primary" aria-label="Create new item">
              <md-icon slot="icon">add</md-icon>
              <md-fab-menu-item value="document" icon="description" label="Document"></md-fab-menu-item>
              <md-fab-menu-item value="spreadsheet" icon="table_chart" label="Spreadsheet"></md-fab-menu-item>
              <md-fab-menu-item value="slides" icon="slideshow" label="Presentation"></md-fab-menu-item>
              <md-fab-menu-item value="folder" icon="folder" label="Folder"></md-fab-menu-item>
            </md-fab-menu>
          </div>
        </div>

        <div class="fab-menu-stage">
          <span class="stage-caption">Secondary &amp; Tertiary Color Sets</span>
          <div class="flex aic" style="justify-content: space-between; align-items: flex-end">
            <md-fab-menu align="start" variant="secondary" aria-label="Share content">
              <md-icon slot="icon">share</md-icon>
              <md-fab-menu-item value="camera" icon="photo_camera" label="Camera"></md-fab-menu-item>
              <md-fab-menu-item value="gallery" icon="image" label="Gallery"></md-fab-menu-item>
              <md-fab-menu-item value="scan" icon="document_scanner" label="Scan"></md-fab-menu-item>
            </md-fab-menu>

            <md-fab-menu variant="tertiary" aria-label="Start call">
              <md-icon slot="icon">call</md-icon>
              <md-fab-menu-item value="voice" icon="mic" label="Voice call"></md-fab-menu-item>
              <md-fab-menu-item value="video" icon="videocam" label="Video call"></md-fab-menu-item>
            </md-fab-menu>
          </div>
        </div>

        <div class="fab-menu-stage">
          <span class="stage-caption">Extended FAB Trigger (align="start")</span>
          <div class="stage-anchor-start">
            <md-fab-menu align="start" variant="primary" label="Compose" extended aria-label="Compose">
              <md-icon slot="icon">edit</md-icon>
              <md-fab-menu-item value="email" icon="mail" label="New email"></md-fab-menu-item>
              <md-fab-menu-item value="event" icon="event" label="Calendar invite"></md-fab-menu-item>
              <md-fab-menu-item value="note" icon="sticky_note_2" label="Quick note"></md-fab-menu-item>
            </md-fab-menu>
          </div>
        </div>
      </div>
    </section>
  `
}
