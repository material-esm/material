/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
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

const { Progress } = await import('../indicators/progress.js')
const { Loading } = await import('../indicators/loading.js')

const rootDir = path.resolve(import.meta.dirname, '..')

function walkJs(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'demo' || entry.name === 'tests') {
      continue
    }
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkJs(full, out)
    } else if (entry.name.endsWith('.js')) {
      out.push(full)
    }
  }
  return out
}

describe('ESM network & runtime performance guards', () => {
  it('does not statically import heavy optional picker or search modules in text-field or app-bar', () => {
    const textFieldSrc = fs.readFileSync(path.join(rootDir, 'text/text-field.js'), 'utf8')
    assert.doesNotMatch(textFieldSrc, /^import\s+['"]\.\.\/pickers\/datetime-picker-dialog\.js['"]/m)
    assert.doesNotMatch(textFieldSrc, /^import\s+['"]\.\.\/buttons\/icon-button\.js['"]/m)

    const appBarSrc = fs.readFileSync(path.join(rootDir, 'app/bar.js'), 'utf8')
    assert.doesNotMatch(appBarSrc, /^import\s+['"]\.\.\/search\/search\.js['"]/m)
    assert.doesNotMatch(appBarSrc, /^import\s+['"]\.\.\/icon\/icon\.js['"]/m)
  })

  it('does not import lit/decorators.js, lit/directives/when.js, or leave broken sourceMappingURL comments', () => {
    for (const file of walkJs(rootDir)) {
      const src = fs.readFileSync(file, 'utf8')
      const rel = path.relative(rootDir, file)
      assert.doesNotMatch(src, /from\s+['"]lit\/decorators\.js['"]/, `${rel} should not import lit/decorators.js`)
      assert.doesNotMatch(src, /from\s+['"]lit\/directives\/when\.js['"]/, `${rel} should not import lit/directives/when.js`)
      assert.doesNotMatch(src, /\/\/#\s*sourceMappingURL=/, `${rel} should not contain broken sourceMappingURL`)
    }
  })

  it('pauses wavy md-progress rAF loop when contentvisibilityautostatechange reports skipped', () => {
    const prevRaf = globalThis.requestAnimationFrame
    const prevCancel = globalThis.cancelAnimationFrame
    let nextId = 1
    let cancelled = 0
    globalThis.requestAnimationFrame = () => nextId++
    globalThis.cancelAnimationFrame = () => {
      cancelled++
    }

    try {
      const el = new Progress()
      el.type = 'circular'
      el.shape = 'wavy'
      el.indeterminate = true

      el._updateWavyAnimationState()
      assert.equal(el._wavyAnimationActive, true)

      el._onContentVisibilityChange({ skipped: true })
      assert.equal(el._isOffscreen, true)
      assert.equal(el._wavyAnimationActive, false)
      assert.ok(cancelled >= 1)

      el._onContentVisibilityChange({ skipped: false })
      assert.equal(el._isOffscreen, false)
      assert.equal(el._wavyAnimationActive, true)

      el._stopWavyAnimation()
    } finally {
      globalThis.requestAnimationFrame = prevRaf
      globalThis.cancelAnimationFrame = prevCancel
    }
  })

  it('pauses md-loading rAF loop when contentvisibilityautostatechange reports skipped', () => {
    const prevRaf = globalThis.requestAnimationFrame
    const prevCancel = globalThis.cancelAnimationFrame
    let nextId = 1
    let cancelled = 0
    globalThis.requestAnimationFrame = () => nextId++
    globalThis.cancelAnimationFrame = () => {
      cancelled++
    }

    try {
      const el = new Loading()
      el.ctx = {}
      el.renderRoot = {
        querySelector(sel) {
          return sel === '#canvas' ? {} : null
        },
      }

      el.startAnimation()
      assert.ok(el.rafId > 0)

      el._onContentVisibilityChange({ skipped: true })
      assert.equal(el._isOffscreen, true)
      assert.equal(el.rafId, 0)
      assert.ok(cancelled >= 1)

      // Calling startAnimation while offscreen stays paused
      el.startAnimation()
      assert.equal(el.rafId, 0)

      el._onContentVisibilityChange({ skipped: false })
      assert.equal(el._isOffscreen, false)
      assert.ok(el.rafId > 0)

      el.stopAnimation()
    } finally {
      globalThis.requestAnimationFrame = prevRaf
      globalThis.cancelAnimationFrame = prevCancel
    }
  })
})
