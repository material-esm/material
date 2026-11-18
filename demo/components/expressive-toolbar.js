import { html, css } from 'lit'
import '../../buttons/button.js'
import '../../buttons/fab.js'
import '../../buttons/icon-button.js'
import '../../icon/icon.js'
import '../../toolbar/toolbar.js'
import { snack } from '../../snackbar/snackbar.js'

export const expressiveToolbarStyles = css`
  .stage-caption {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
  }

  .toolbar-showcase-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
  }

  .toolbar-column {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    max-width: 100%;
  }

  .vertical-toolbar-canvas {
    position: relative;
    width: 100%;
    height: 256px;
    border-radius: 16px;
    background:
      radial-gradient(
          circle at 1px 1px,
          var(--md-sys-color-outline-variant, rgba(120, 120, 120, 0.35)) 1px,
          transparent 0
        )
        0 0 / 20px 20px,
      var(--md-sys-color-surface, #ffffff);
    border: 1px solid var(--md-sys-color-outline-variant, rgba(120, 120, 120, 0.2));
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 0 88px;
    text-align: center;
  }

  .docked-toolbar-frame {
    width: 100%;
    border-radius: 16px;
    background: var(--md-sys-color-surface, #ffffff);
    border: 1px solid var(--md-sys-color-outline-variant, rgba(120, 120, 120, 0.2));
    overflow: hidden;
  }

  .docked-toolbar-body {
    padding: 16px 20px;
    font-size: 0.9rem;
    color: var(--md-sys-color-on-surface-variant);
  }
`

function onToolbarAction(label) {
  snack(`Toolbar: ${label}`)
}

export function renderToolbarsSection() {
  return html`
    <section class="demo-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Toolbars — Floating &amp; Docked (M3 Expressive)</h2>
          <p class="section-desc">
            Floating horizontal &amp; vertical pill toolbars and full-width docked toolbars in Standard and Vibrant
            color schemes, with paired adjacent FABs and roving arrow-key focus.
          </p>
        </div>
        <a href="./toolbar-demo.html" class="section-link">
          View Full Toolbar Demo <md-icon style="font-size: 18px">arrow_forward</md-icon>
        </a>
      </div>

      <h3 class="sub-section-title">Floating Horizontal Toolbars &amp; Paired FAB</h3>
      <div class="toolbar-showcase-row">
        <div class="toolbar-column">
          <span class="stage-caption">Standard + Paired Primary FAB</span>
          <md-toolbar color="standard" aria-label="Text formatting">
            <md-icon-button toggle selected aria-label="Bold">
              <md-icon>format_bold</md-icon>
            </md-icon-button>
            <md-icon-button toggle aria-label="Italic">
              <md-icon>format_italic</md-icon>
            </md-icon-button>
            <md-icon-button toggle aria-label="Underline">
              <md-icon>format_underlined</md-icon>
            </md-icon-button>
            <md-icon-button aria-label="Insert link" @click=${() => onToolbarAction('Insert link')}>
              <md-icon>link</md-icon>
            </md-icon-button>
            <md-fab slot="fab" variant="primary" aria-label="Compose reply" @click=${() => onToolbarAction('Reply')}>
              <md-icon slot="icon">reply</md-icon>
            </md-fab>
          </md-toolbar>
        </div>

        <div class="toolbar-column">
          <span class="stage-caption">Vibrant Color Scheme</span>
          <md-toolbar color="vibrant" aria-label="Photo editing">
            <md-icon-button toggle selected aria-label="Auto enhance">
              <md-icon>auto_fix_high</md-icon>
            </md-icon-button>
            <md-icon-button toggle aria-label="Crop">
              <md-icon>crop</md-icon>
            </md-icon-button>
            <md-icon-button toggle aria-label="Adjust">
              <md-icon>tune</md-icon>
            </md-icon-button>
            <md-button color="filled" @click=${() => onToolbarAction('Saved photo')}>
              <md-icon slot="icon">check</md-icon>
              Save
            </md-button>
          </md-toolbar>
        </div>
      </div>

      <h3 class="sub-section-title">Floating Vertical Toolbars</h3>
      <div class="vertical-toolbar-canvas">
        <span class="stage-caption">Edge-positioned 64dp vertical toolbars (ArrowUp / ArrowDown roving focus)</span>
        <md-toolbar orientation="vertical" position="start" contained aria-label="Canvas tools">
          <md-icon-button toggle selected aria-label="Select tool">
            <md-icon>near_me</md-icon>
          </md-icon-button>
          <md-icon-button toggle aria-label="Brush tool">
            <md-icon>brush</md-icon>
          </md-icon-button>
          <md-icon-button aria-label="Undo" @click=${() => onToolbarAction('Undo')}>
            <md-icon>undo</md-icon>
          </md-icon-button>
        </md-toolbar>

        <md-toolbar orientation="vertical" color="vibrant" position="end" contained aria-label="Zoom tools">
          <md-icon-button aria-label="Zoom in" @click=${() => onToolbarAction('Zoom in')}>
            <md-icon>zoom_in</md-icon>
          </md-icon-button>
          <md-icon-button aria-label="Zoom out" @click=${() => onToolbarAction('Zoom out')}>
            <md-icon>zoom_out</md-icon>
          </md-icon-button>
          <md-icon-button aria-label="Fit screen" @click=${() => onToolbarAction('Fit to screen')}>
            <md-icon>fit_screen</md-icon>
          </md-icon-button>
        </md-toolbar>
      </div>

      <h3 class="sub-section-title">Docked Toolbar (Replaces Bottom App Bar)</h3>
      <div class="docked-toolbar-frame">
        <div class="docked-toolbar-body">
          Full-width 64dp docked toolbar with flexible action spacing across container width.
        </div>
        <md-toolbar type="docked" aria-label="Page actions">
          <md-icon-button aria-label="Navigate back" @click=${() => onToolbarAction('Back')}>
            <md-icon>arrow_back</md-icon>
          </md-icon-button>
          <md-icon-button aria-label="Navigate forward" @click=${() => onToolbarAction('Forward')}>
            <md-icon>arrow_forward</md-icon>
          </md-icon-button>
          <md-icon-button toggle aria-label="Bookmark">
            <md-icon>bookmark</md-icon>
          </md-icon-button>
          <md-icon-button aria-label="Share" @click=${() => onToolbarAction('Share')}>
            <md-icon>share</md-icon>
          </md-icon-button>
          <md-icon-button aria-label="Open tabs" @click=${() => onToolbarAction('Tabs')}>
            <md-icon>tab</md-icon>
          </md-icon-button>
        </md-toolbar>
      </div>
    </section>
  `
}
