/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CSSResult, nothing } from 'lit'

import { Toolbar, toolbarStyles } from '../toolbar/toolbar.js'
import { Toolbar as AppToolbar, toolbarStyles as appToolbarStyles } from '../app/toolbar.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

/**
 * Renders a Lit TemplateResult (including classMap directives and boolean attributes)
 * into an inspectable HTML string in Node without requiring a browser DOM.
 */
function renderTemplateToString(result) {
  if (result === null || result === undefined || result === nothing || typeof result === 'symbol') {
    return ''
  }
  if (typeof result === 'string' || typeof result === 'number') {
    return String(result)
  }
  if (Array.isArray(result)) {
    return result.map(renderTemplateToString).join('')
  }
  // Handle Lit directive results (such as classMap)
  if (typeof result === 'object' && '_$litDirective$' in result) {
    const [arg] = result.values || []
    if (arg && typeof arg === 'object') {
      return Object.entries(arg)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([cls]) => cls)
        .join(' ')
    }
    return ''
  }
  if (typeof result === 'object' && Array.isArray(result.strings) && Array.isArray(result.values)) {
    let out = ''
    for (let i = 0; i < result.strings.length; i++) {
      let chunk = result.strings[i]
      if (i < result.values.length) {
        const val = result.values[i]
        // Handle Lit boolean attribute syntax `?inert=`
        const boolMatch = chunk.match(/\?([a-zA-Z0-9_-]+)=["']?$/)
        if (boolMatch) {
          const attrName = boolMatch[1]
          chunk = chunk.slice(0, chunk.length - boolMatch[0].length)
          out += chunk + (val ? attrName : '')
          continue
        }
        // Handle event binding `@keydown=`
        const eventMatch = chunk.match(/@([a-zA-Z0-9_-]+)=["']?$/)
        if (eventMatch) {
          chunk = chunk.slice(0, chunk.length - eventMatch[0].length)
          out += chunk + `data-on-${eventMatch[1]}="${typeof val === 'function' ? 'bound' : ''}"`
          continue
        }
        out += chunk + renderTemplateToString(val)
      } else {
        out += chunk
      }
    }
    return out
  }
  return String(result)
}

/**
 * Creates a lightweight mock control element for testing slot discovery,
 * roving tabindex, focus movement, and ARIA state in Node.
 */
function createMockControl(tagName = 'MD-ICON-BUTTON', attrs = {}, children = []) {
  const attrMap = new Map(Object.entries(attrs).map(([k, v]) => [k, String(v)]))
  let focused = false
  const el = {
    nodeType: 1,
    tagName: tagName.toUpperCase(),
    tabIndex: 0,
    hidden: Boolean(attrs.hidden),
    disabled: Boolean(attrs.disabled),
    children,
    get focused() {
      return focused
    },
    focus() {
      if (!this.disabled) {
        focused = true
        if (this._onFocus) this._onFocus(this)
      }
    },
    blur() {
      focused = false
    },
    getAttribute(name) {
      return attrMap.has(name) ? attrMap.get(name) : null
    },
    setAttribute(name, value) {
      attrMap.set(name, String(value))
      if (name === 'tabindex') {
        this.tabIndex = Number(value)
      }
    },
    hasAttribute(name) {
      return attrMap.has(name)
    },
    contains(other) {
      return other === this || this.children.some((c) => c === other || c.contains?.(other))
    },
    matches(selector) {
      if (selector === ':focus' || selector === ':focus-within') {
        return focused || this.children.some((c) => c.matches?.(selector))
      }
      return false
    },
  }
  return el
}

function attachMockChildren(toolbar, controls) {
  for (const ctrl of controls) {
    ctrl._onFocus = (active) => {
      for (const item of controls) {
        if (item !== active) item.blur?.()
      }
    }
  }
  toolbar.children = controls
  toolbar._syncSlotStates()
  toolbar._syncRovingTabindex()
}

function createKeyEvent(key, target, extra = {}) {
  let prevented = false
  return {
    key,
    target,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    ...extra,
    get defaultPrevented() {
      return prevented
    },
    preventDefault() {
      prevented = true
    },
    composedPath() {
      return target ? [target] : []
    },
  }
}

describe('Material 3 Expressive Toolbar (<md-toolbar>)', () => {
  describe('Module exports, registration & file size modularity', () => {
    it('registers <md-toolbar> and re-exports cleanly from app/toolbar.js', () => {
      assert.equal(customElements.get('md-toolbar'), Toolbar)
      assert.equal(AppToolbar, Toolbar)
      assert.equal(appToolbarStyles, toolbarStyles)
    })

    it('uses Lit css tagged template literals (CSSResult) for styles and never plain strings', () => {
      assert.ok(toolbarStyles instanceof CSSResult)
      assert.ok(Array.isArray(Toolbar.styles))
      for (const s of Toolbar.styles) {
        assert.ok(s instanceof CSSResult, 'Expected every entry in Toolbar.styles to be a Lit CSSResult')
      }
    })

    it('keeps every owned source and test file strictly under 1,000 lines', () => {
      const files = ['toolbar/toolbar.js', 'toolbar/toolbar-styles.js', 'app/toolbar.js', 'tests/toolbar.test.js']
      for (const relPath of files) {
        const content = readFileSync(resolve(repoRoot, relPath), 'utf8')
        const lineCount = content.split(/\r?\n/).length
        assert.ok(lineCount < 1000, `Expected ${relPath} (${lineCount} lines) to be strictly < 1000 lines`)
      }
    })
  })

  describe('Defaults & variant resolution', () => {
    it('initializes M3 Expressive floating standard horizontal defaults', () => {
      const el = new Toolbar()
      assert.equal(el.type, 'floating')
      assert.equal(el.orientation, 'horizontal')
      assert.equal(el.color, 'standard')
      assert.equal(el.position, 'static')
      assert.equal(el.fabPosition, 'end')
      assert.equal(el.contained, false)
      assert.equal(el.scrollBehavior, 'none')
      assert.equal(el.scrollTarget, 'window')
      assert.equal(el.hiddenBar, false)
      assert.equal(el.collapsed, false)
      assert.equal(el._effectiveType, 'floating')
      assert.equal(el._effectiveOrientation, 'horizontal')
      assert.equal(el._effectiveColor, 'standard')
    })

    it('resolves docked, floating, standard, and vibrant via type, color, and variant aliases', () => {
      const el = new Toolbar()
      el.type = 'docked'
      el.color = 'vibrant'
      assert.equal(el._effectiveType, 'docked')
      assert.equal(el._effectiveColor, 'vibrant')

      const viaVariant = new Toolbar()
      viaVariant.variant = 'docked'
      assert.equal(viaVariant._effectiveType, 'docked')

      viaVariant.variant = 'vibrant'
      assert.equal(viaVariant._effectiveColor, 'vibrant')
    })

    it('enforces horizontal orientation for docked toolbars even when orientation="vertical" is set', () => {
      const el = new Toolbar()
      el.type = 'floating'
      el.orientation = 'vertical'
      assert.equal(el._effectiveOrientation, 'vertical')

      el.type = 'docked'
      assert.equal(el._effectiveOrientation, 'horizontal')
    })

    it('supports programmatic show(), hide(), collapse(), and expand() helpers', () => {
      const el = new Toolbar()
      el.hide()
      assert.equal(el.hiddenBar, true)

      el.collapse()
      assert.equal(el.collapsed, true)

      el.expand()
      assert.equal(el.collapsed, false)
      assert.equal(el.hiddenBar, true)

      el.show()
      assert.equal(el.hiddenBar, false)
      assert.equal(el.collapsed, false)
    })
  })

  describe('Rendered DOM, ARIA semantics & Paired FAB slot', () => {
    it('renders role="toolbar", aria-orientation, aria-label, elevation, and shadow parts', () => {
      const el = new Toolbar()
      el.ariaLabel = 'Text formatting'
      const markup = renderTemplateToString(el.render())

      assert.match(markup, /role="toolbar"/)
      assert.match(markup, /aria-orientation="horizontal"/)
      assert.match(markup, /aria-label="Text formatting"/)
      assert.match(markup, /toolbar--floating/)
      assert.match(markup, /toolbar--horizontal/)
      assert.match(markup, /toolbar--standard/)
      assert.match(markup, /part="container"/)
      assert.match(markup, /<md-elevation part="elevation"><\/md-elevation>/)
      assert.match(markup, /part="fab"/)
    })

    it('renders vertical orientation and vibrant classes accurately', () => {
      const el = new Toolbar()
      el.orientation = 'vertical'
      el.color = 'vibrant'
      el.label = 'Canvas tools'
      const markup = renderTemplateToString(el.render())

      assert.match(markup, /aria-orientation="vertical"/)
      assert.match(markup, /aria-label="Canvas tools"/)
      assert.match(markup, /toolbar-wrapper--vertical/)
      assert.match(markup, /toolbar--vertical/)
      assert.match(markup, /toolbar--vibrant/)
    })

    it('renders paired slot="fab" outside the role="toolbar" surface and toggles has-fab class', () => {
      const el = new Toolbar()
      const btn = createMockControl('MD-ICON-BUTTON', { 'aria-label': 'Edit' })
      const fab = createMockControl('MD-FAB', { slot: 'fab', 'aria-label': 'Add' })
      attachMockChildren(el, [btn, fab])

      assert.equal(el._hasFab, true)
      const markup = renderTemplateToString(el.render())
      assert.match(markup, /has-fab/)

      // Verify slot="fab" appears after the role="toolbar" container rather than inside it
      const roleToolbarIndex = markup.indexOf('role="toolbar"')
      const defaultSlotIndex = markup.indexOf('<slot data-on-slotchange="bound"></slot>')
      const fabSlotIndex = markup.indexOf('<slot name="fab"')
      assert.ok(roleToolbarIndex >= 0 && defaultSlotIndex > roleToolbarIndex)
      assert.ok(fabSlotIndex > defaultSlotIndex)
    })

    it('keeps paired FAB interactive (non-inert wrapper) when collapsed with slot="fab"', () => {
      const el = new Toolbar()
      const btn = createMockControl('MD-ICON-BUTTON')
      const fab = createMockControl('MD-FAB', { slot: 'fab' })
      attachMockChildren(el, [btn, fab])

      el.collapse()
      const withFabMarkup = renderTemplateToString(el.render())
      // Outer wrapper must NOT be inert so the paired FAB remains focusable, while inner bar IS inert
      assert.doesNotMatch(withFabMarkup, /<div class="[^"]*toolbar-wrapper[^"]*"\s+inert>/)
      assert.match(withFabMarkup, /role="toolbar"[\s\S]*?inert/)

      // Without FAB, collapsing marks the outer wrapper inert too
      const noFabEl = new Toolbar()
      attachMockChildren(noFabEl, [btn])
      noFabEl.collapse()
      const withoutFabMarkup = renderTemplateToString(noFabEl.render())
      assert.match(withoutFabMarkup, /<div class="[^"]*toolbar-wrapper[^"]*"\s+inert>/)
    })
  })

  describe('M3 Expressive CSS specification tokens & measurements', () => {
    const cssText = toolbarStyles.cssText

    it('defines 64px height/width, pill shape (9999px), elevation 3, 4px gap, and 16px edge offset for floating toolbars', () => {
      assert.match(cssText, /--_container-height:\s*var\(--md-toolbar-container-height,\s*64px\)/)
      assert.match(cssText, /--_container-width:\s*var\(--md-toolbar-container-width,\s*64px\)/)
      assert.match(
        cssText,
        /--_container-shape:\s*var\(--md-toolbar-container-shape,\s*var\(--md-sys-shape-corner-full,\s*9999px\)\)/,
      )
      assert.match(cssText, /--_container-elevation:\s*var\(--md-toolbar-container-elevation,\s*3\)/)
      assert.match(cssText, /--_item-gap:\s*var\(--md-toolbar-item-gap,\s*4px\)/)
      assert.match(cssText, /--_edge-offset:\s*var\(--md-toolbar-edge-offset,\s*16px\)/)
      assert.match(cssText, /--_fab-gap:\s*var\(--md-toolbar-fab-gap,\s*8px\)/)
    })

    it('defines docked full-width bar with 0px corner radius, elevation 2, 16px inline padding, 8px-32px spacing, and safe-area-inset-bottom', () => {
      assert.match(
        cssText,
        /--_container-shape:\s*var\(--md-toolbar-container-shape,\s*var\(--md-sys-shape-corner-none,\s*0px\)\)/,
      )
      assert.match(cssText, /--_container-elevation:\s*var\(--md-toolbar-container-elevation,\s*2\)/)
      assert.match(cssText, /--_inline-padding:\s*var\(--md-toolbar-inline-padding,\s*16px\)/)
      assert.match(cssText, /clamp\(8px,\s*3vw,\s*32px\)/)
      assert.match(cssText, /env\(safe-area-inset-bottom,\s*0px\)/)
    })

    it('maps standard and vibrant color tokens and cascades --md-icon-button-* and --md-button-* properties', () => {
      assert.match(cssText, /--md-sys-color-surface-container-high/)
      assert.match(cssText, /--md-sys-color-surface-container/)
      assert.match(cssText, /--md-sys-color-on-surface-variant/)
      assert.match(cssText, /--md-sys-color-secondary-container/)
      assert.match(cssText, /--md-sys-color-on-secondary-container/)
      assert.match(cssText, /--md-sys-color-primary-container/)
      assert.match(cssText, /--md-sys-color-on-primary-container/)
      assert.match(cssText, /--md-icon-button-icon-color:\s*var\(--_icon-color\)/)
      assert.match(cssText, /--md-icon-button-selected-container-color:\s*var\(--_active-container-color\)/)
      assert.match(cssText, /--md-button-container-color:\s*var\(--_filled-container-color\)/)
      assert.match(cssText, /--md-filled-tonal-button-container-color:\s*var\(--_active-container-color\)/)
    })

    it('respects prefers-reduced-motion and forced-colors media queries', () => {
      assert.match(cssText, /@media\s*\(prefers-reduced-motion:\s*no-preference\)/)
      assert.match(cssText, /@media\s*\(forced-colors:\s*active\)/)
    })
  })

  describe('WAI-ARIA roving tabindex keyboard navigation & RTL support', () => {
    it('assigns single tab stop (tabindex="0" on first item, "-1" on others), skipping disabled/separators/fab while keeping aria-disabled focusable', () => {
      const el = new Toolbar()
      const lead = createMockControl('MD-ICON-BUTTON', { slot: 'leading' })
      const b1 = createMockControl('MD-ICON-BUTTON')
      const sep = createMockControl('SPAN', { role: 'separator' })
      const disabledBtn = createMockControl('MD-ICON-BUTTON', { disabled: 'true' })
      const ariaDisabledBtn = createMockControl('MD-ICON-BUTTON', { 'aria-disabled': 'true' })
      const groupBtn = createMockControl('MD-BUTTON')
      const group = createMockControl('DIV', { role: 'group' }, [groupBtn])
      const trail = createMockControl('MD-ICON-BUTTON', { slot: 'trailing' })
      const fab = createMockControl('MD-FAB', { slot: 'fab' })

      attachMockChildren(el, [b1, sep, disabledBtn, ariaDisabledBtn, group, fab, trail, lead])

      const items = el.getToolbarItems()
      assert.deepEqual(items, [lead, b1, ariaDisabledBtn, groupBtn, trail])
      assert.equal(lead.tabIndex, 0)
      assert.equal(b1.tabIndex, -1)
      assert.equal(ariaDisabledBtn.tabIndex, -1)
      assert.equal(groupBtn.tabIndex, -1)
      assert.equal(trail.tabIndex, -1)
    })

    it('roves horizontally with ArrowRight, ArrowLeft, Home, End, and wraps at ends (LTR)', () => {
      const el = new Toolbar()
      const b0 = createMockControl('MD-ICON-BUTTON')
      const b1 = createMockControl('MD-ICON-BUTTON')
      const b2 = createMockControl('MD-ICON-BUTTON')
      attachMockChildren(el, [b0, b1, b2])
      b0.focus()

      // ArrowRight: 0 -> 1
      const eRight1 = createKeyEvent('ArrowRight', b0)
      el._handleKeydown(eRight1)
      assert.equal(eRight1.defaultPrevented, true)
      assert.equal(b1.focused, true)
      assert.equal(b1.tabIndex, 0)
      assert.equal(b0.tabIndex, -1)

      // End: 1 -> 2
      const eEnd = createKeyEvent('End', b1)
      el._handleKeydown(eEnd)
      assert.equal(b2.focused, true)
      assert.equal(b2.tabIndex, 0)

      // ArrowRight wrap: 2 -> 0
      el._handleKeydown(createKeyEvent('ArrowRight', b2))
      assert.equal(b0.focused, true)
      assert.equal(b0.tabIndex, 0)

      // ArrowLeft wrap: 0 -> 2
      el._handleKeydown(createKeyEvent('ArrowLeft', b0))
      assert.equal(b2.focused, true)

      // Home: 2 -> 0
      el._handleKeydown(createKeyEvent('Home', b2))
      assert.equal(b0.focused, true)

      // Vertical keys & Tab are not intercepted in horizontal mode
      const eDown = createKeyEvent('ArrowDown', b0)
      el._handleKeydown(eDown)
      assert.equal(eDown.defaultPrevented, false)

      const eTab = createKeyEvent('Tab', b0)
      el._handleKeydown(eTab)
      assert.equal(eTab.defaultPrevented, false)
    })

    it('reverses ArrowRight and ArrowLeft in RTL horizontal mode', () => {
      const el = new Toolbar()
      el.dir = 'rtl'
      const b0 = createMockControl('MD-ICON-BUTTON')
      const b1 = createMockControl('MD-ICON-BUTTON')
      const b2 = createMockControl('MD-ICON-BUTTON')
      attachMockChildren(el, [b0, b1, b2])
      b0.focus()

      // In RTL, ArrowLeft moves to next logical item (0 -> 1)
      el._handleKeydown(createKeyEvent('ArrowLeft', b0))
      assert.equal(b1.focused, true)
      assert.equal(b1.tabIndex, 0)

      // In RTL, ArrowRight moves to previous logical item (1 -> 0 -> 2)
      el._handleKeydown(createKeyEvent('ArrowRight', b1))
      assert.equal(b0.focused, true)
      el._handleKeydown(createKeyEvent('ArrowRight', b0))
      assert.equal(b2.focused, true)
    })

    it('roves vertically with ArrowDown and ArrowUp (ignoring ArrowLeft/ArrowRight and NOT flipping in RTL)', () => {
      const el = new Toolbar()
      el.orientation = 'vertical'
      el.dir = 'rtl'
      const b0 = createMockControl('MD-ICON-BUTTON')
      const b1 = createMockControl('MD-ICON-BUTTON')
      const b2 = createMockControl('MD-ICON-BUTTON')
      attachMockChildren(el, [b0, b1, b2])
      b0.focus()

      // ArrowDown advances 0 -> 1 even when dir="rtl"
      const eDown = createKeyEvent('ArrowDown', b0)
      el._handleKeydown(eDown)
      assert.equal(eDown.defaultPrevented, true)
      assert.equal(b1.focused, true)
      assert.equal(b1.tabIndex, 0)

      // ArrowUp moves 1 -> 0 -> 2
      el._handleKeydown(createKeyEvent('ArrowUp', b1))
      assert.equal(b0.focused, true)
      el._handleKeydown(createKeyEvent('ArrowUp', b0))
      assert.equal(b2.focused, true)

      // ArrowRight does nothing in vertical toolbar
      const eRight = createKeyEvent('ArrowRight', b2)
      el._handleKeydown(eRight)
      assert.equal(eRight.defaultPrevented, false)
      assert.equal(b2.focused, true)
    })

    it('restores active tabindex stop on focusin (e.g. pointer click on an item)', () => {
      const el = new Toolbar()
      const b0 = createMockControl('MD-ICON-BUTTON')
      const b1 = createMockControl('MD-ICON-BUTTON')
      const b2 = createMockControl('MD-ICON-BUTTON')
      attachMockChildren(el, [b0, b1, b2])

      b2.focus()
      el._handleFocusIn({ target: b2, composedPath: () => [b2] })
      assert.equal(b2.tabIndex, 0)
      assert.equal(b0.tabIndex, -1)
      assert.equal(b1.tabIndex, -1)
    })
  })

  describe('Scroll hide & collapse behavior', () => {
    it('hides on scroll down and reveals on scroll up or top reset when scroll-behavior="hide"', () => {
      const el = new Toolbar()
      el.scrollBehavior = 'hide'
      el.scrollThreshold = 8

      const scroller = { scrollTop: 0 }
      el._currentScrollTarget = scroller
      const events = []
      el.addEventListener('scroll-state-change', (e) => events.push(e.detail))

      // Small scroll below threshold: stays visible
      scroller.scrollTop = 6
      el._handleScroll()
      assert.equal(el.hiddenBar, false)

      // Scroll down past threshold: hides
      scroller.scrollTop = 40
      el._handleScroll()
      assert.equal(el.hiddenBar, true)
      assert.equal(events.length, 1)
      assert.equal(events[0].hiddenBar, true)

      // Scroll up past threshold: reveals
      scroller.scrollTop = 20
      el._handleScroll()
      assert.equal(el.hiddenBar, false)
      assert.equal(events.length, 2)
      assert.equal(events[1].hiddenBar, false)

      // Hide again, then jump straight to top (<= 4): always reveals
      scroller.scrollTop = 60
      el._handleScroll()
      assert.equal(el.hiddenBar, true)
      scroller.scrollTop = 2
      el._handleScroll()
      assert.equal(el.hiddenBar, false)
    })

    it('collapses on scroll down and expands on scroll up when scroll-behavior="collapse"', () => {
      const el = new Toolbar()
      el.scrollBehavior = 'collapse'
      const scroller = { scrollTop: 0 }
      el._currentScrollTarget = scroller

      scroller.scrollTop = 50
      el._handleScroll()
      assert.equal(el.collapsed, true)
      assert.equal(el.hiddenBar, false)

      scroller.scrollTop = 25
      el._handleScroll()
      assert.equal(el.collapsed, false)
    })
  })
})
