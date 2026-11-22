/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

globalThis.customElements ??= {
  registry: new Map(),
  define(name, ctor) {
    this.registry.set(name, ctor)
  },
  get(name) {
    return this.registry.get(name)
  },
}

const { Button, buttonStyles } = await import('../buttons/button.js')
const { IconButton, iconButtonStyles } = await import('../buttons/icon-button.js')
const { ButtonGroup } = await import('../buttons/button-group.js')
const { SplitButton } = await import('../buttons/split-button.js')
const { Ripple } = await import('../internal/ripple/ripple.js')
const { Elevation } = await import('../internal/elevation/elevation.js')
const { Progress } = await import('../indicators/progress.js')
const { Loading } = await import('../indicators/loading.js')

function flattenCss(styles) {
  const arr = Array.isArray(styles) ? styles : [styles]
  return arr.map((s) => s.cssText).join('\n')
}

describe('Safari 26 button shape transitions', () => {
  it('re-exports buttonStyles and iconButtonStyles and registers custom elements', () => {
    assert.equal(Button.styles, buttonStyles)
    assert.equal(IconButton.styles, iconButtonStyles)
    assert.equal(globalThis.customElements.get('md-button'), Button)
    assert.equal(globalThis.customElements.get('md-icon-button'), IconButton)
    assert.equal(globalThis.customElements.get('md-button-group'), ButtonGroup)
    assert.equal(globalThis.customElements.get('md-split-button'), SplitButton)
  })

  it('uses half-height pill clamping instead of 9999px and avoids border-radius: inherit across :host in md-button', () => {
    const cssText = flattenCss(Button.styles)
    assert.ok(!cssText.includes('9999px'), 'md-button styles should not use 9999px pill radius that stalls transitions')
    assert.ok(!cssText.includes('border-radius: inherit'), 'md-button should not rely on border-radius: inherit')
    assert.ok(cssText.includes('--_full-shape: calc(var(--_container-height) / 2)'))
    assert.ok(cssText.includes('min(var(--_container-shape-start-start), var(--_full-shape))'))

    // Both physical shorthand and logical longhands must be transitioned for WebKit compatibility
    for (const prop of [
      'border-radius',
      'border-start-start-radius',
      'border-start-end-radius',
      'border-end-start-radius',
      'border-end-end-radius',
    ]) {
      assert.ok(cssText.includes(`${prop} var(--_shape-transition-duration)`), `expected transition on ${prop}`)
    }

    // Reduced motion disables spatial shape morphing while keeping color transitions
    assert.match(cssText, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?--_shape-transition-duration:\s*0s/)
    assert.ok(cssText.includes('--_color-transition-duration: 150ms'))
  })

  it('avoids 9999px and border-radius: inherit in md-icon-button and transitions logical corners', () => {
    const cssText = flattenCss(IconButton.styles)
    assert.ok(!cssText.includes('9999px'), 'md-icon-button styles should not use 9999px pill radius')
    assert.ok(!cssText.includes('border-radius: inherit'), 'md-icon-button should not rely on border-radius: inherit')
    assert.ok(cssText.includes('border-start-start-radius var(--_shape-transition-duration)'))
    assert.match(cssText, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?--_shape-transition-duration:\s*0s/)
  })

  it('holds pressed state across touch pointerup -> pointerleave and clears immediately on drag-off or disable', async () => {
    const attachListeners = (el) => {
      const listeners = new Map()
      el.scheduleUpdate = () => {}
      el.addEventListener = (type, fn) => listeners.set(type, fn)
      el.removeEventListener = (type) => listeners.delete(type)
      el.connectedCallback()
      return listeners
    }

    const btn = new Button()
    const btnListeners = attachListeners(btn)
    assert.equal(btn.pressed, false)

    // Fast touch tap: pointerdown -> pointerup -> immediate pointerleave must preserve 150ms hold
    btnListeners.get('pointerdown')({ isPrimary: true, pointerType: 'touch', pointerId: 1 })
    assert.equal(btn.pressed, true)
    btnListeners.get('pointerup')({ pointerId: 1 })
    btnListeners.get('pointerleave')({ pointerId: 1 })
    assert.equal(btn.pressed, true, 'pointerleave after pointerup must not cancel release-hold timer')

    await new Promise((resolve) => setTimeout(resolve, 180))
    assert.equal(btn.pressed, false, 'pressed should release after MINIMUM_PRESS_MS')

    // Drag-off while held (pointerdown -> pointerleave before pointerup) clears immediately
    btnListeners.get('pointerdown')({ isPrimary: true, pointerType: 'touch', pointerId: 2 })
    assert.equal(btn.pressed, true)
    btnListeners.get('pointerleave')({ pointerId: 2 })
    assert.equal(btn.pressed, false, 'pointerleave while held down must clear pressed immediately')

    // Disabling while pressed clears immediately without waiting for timer
    btnListeners.get('pointerdown')({ isPrimary: true, pointerType: 'mouse', buttons: 1, pointerId: 3 })
    assert.equal(btn.pressed, true)
    btn.disabled = true
    assert.equal(btn.pressed, false)
    btn.disconnectedCallback()

    // IconButton follows the same press hold, pointerleave, & disable contract
    const iconBtn = new IconButton()
    const iconListeners = attachListeners(iconBtn)
    assert.equal(iconBtn.pressed, false)
    assert.equal(iconBtn.shape, 'round')
    iconListeners.get('pointerdown')({ isPrimary: true, pointerType: 'touch', pointerId: 4 })
    assert.equal(iconBtn.pressed, true)
    iconListeners.get('pointerup')({ pointerId: 4 })
    iconListeners.get('pointerleave')({ pointerId: 4 })
    assert.equal(iconBtn.pressed, true, 'IconButton pointerleave after pointerup must preserve hold')
    iconBtn.disabled = true
    assert.equal(iconBtn.pressed, false)
    iconBtn.disconnectedCallback()
  })

  it('morphs selected connected button group items to full pill and omits group-position when not connected', () => {
    const cssText = flattenCss(ButtonGroup.styles)
    assert.match(
      cssText,
      /:host\(\[connected\]\)\s*::slotted\(\[group-position\]\[selected\]\)[\s\S]*?--_group-start-start:\s*var\(--_outer-radius,\s*20px\)/,
    )
    assert.ok(cssText.includes('--_pressed-inner-radius'))

    const group = new ButtonGroup()
    const child = {
      attrs: new Map(),
      hasAttribute(k) {
        return this.attrs.has(k)
      },
      setAttribute(k, v) {
        this.attrs.set(k, v)
      },
      removeAttribute(k) {
        this.attrs.delete(k)
      },
      tagName: 'MD-BUTTON',
    }
    group.renderRoot = {
      querySelector: () => ({
        assignedElements: () => [child],
      }),
    }

    group.connected = false
    group.updateConnectedPositions()
    assert.equal(child.attrs.has('group-position'), false)

    group.connected = true
    group.updateConnectedPositions()
    assert.equal(child.attrs.get('group-position'), 'single')
  })

  it('uses explicit 0px units and icon-button shape tokens in md-split-button', () => {
    const cssText = flattenCss(SplitButton.styles)
    assert.ok(!/shape-[a-z-]+:\s*0;/.test(cssText), 'split-button shape tokens must use 0px for CSS min()/calc()')
    assert.ok(cssText.includes('--md-icon-button-container-shape-start-start: 0px'))
    assert.ok(cssText.includes('--md-icon-button-container-shape-end-start: 0px'))
  })

  it('promotes md-ripple .surface to a composited layer and transitions corners in ripple and elevation', () => {
    const rippleCss = flattenCss(Ripple.styles)
    assert.ok(rippleCss.includes('transform: translateZ(0)'))
    assert.ok(rippleCss.includes('border-start-start-radius'))

    const elevationCss = flattenCss(Elevation.styles)
    assert.ok(elevationCss.includes('border-start-start-radius'))
  })
})

describe('Safari 26 indicator animations', () => {
  it('removes content-visibility: auto and contain: strict from md-loading and md-progress hosts', () => {
    const loadingCss = flattenCss(Loading.styles)
    assert.ok(!loadingCss.includes('content-visibility: auto'))
    assert.ok(!loadingCss.includes('contain: strict'))

    const progressCss = flattenCss(Progress.styles)
    assert.ok(!progressCss.includes('content-visibility: auto'))
    assert.ok(!progressCss.includes('contain: strict'))
  })

  it('animates indeterminate linear progress with direct left/right keyframes and wavy linear with GPU translate3d', () => {
    const progressCss = flattenCss(Progress.styles)
    assert.ok(progressCss.includes('@keyframes m3-l1-head-right'))
    assert.ok(progressCss.includes('@keyframes m3-l1-tail-left'))
    assert.ok(progressCss.includes('@keyframes m3-l2-head-right'))
    assert.ok(progressCss.includes('@keyframes m3-l2-tail-left'))
    assert.ok(progressCss.includes('@keyframes m3-l1-tail-cqi'))
    assert.ok(progressCss.includes('@keyframes m3-l2-tail-cqi'))

    assert.match(progressCss, /@keyframes\s+wavy-linear-move[\s\S]*?translate3d\(var\(--_wavelength,\s*40px\)/)
    assert.ok(!progressCss.includes('mask-position: var('))
  })
})
