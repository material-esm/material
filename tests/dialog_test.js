/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Lit provides server-side HTMLElement stubs, while customElements.define is browser-only.
globalThis.customElements ??= {
  registry: new Map(),
  define(name, ctor) {
    this.registry.set(name, ctor)
  },
  get(name) {
    return this.registry.get(name)
  },
}

const { Dialog } = await import('../dialog/dialog.js')

/**
 * Parses top-level CSS rules from Lit CSSResult styles into selector -> declarations map.
 * @param {Array<{cssText: string}>} styles
 * @return {Map<string, Record<string, string>>}
 */
function parseTopLevelRules(styles) {
  const cssText = styles
    .map((s) => s.cssText)
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  const rules = new Map()
  // Strip @media blocks so top-level rules are matched unambiguously.
  const withoutAtRules = cssText.replace(/@media[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
  const ruleRegex = /([^{}]+)\{([^{}]*)\}/g

  for (const match of withoutAtRules.matchAll(ruleRegex)) {
    const selector = match[1].trim().replace(/\s+/g, ' ')
    const body = match[2]
    const decls = rules.get(selector) ?? {}
    for (const part of body.split(';')) {
      const colonIdx = part.indexOf(':')
      if (colonIdx === -1) continue
      const prop = part.slice(0, colonIdx).trim()
      const value = part.slice(colonIdx + 1).trim()
      if (prop) {
        decls[prop] = value
      }
    }
    rules.set(selector, decls)
  }
  return rules
}

describe('md-dialog overscroll containment', () => {
  const rules = parseTopLevelRules(Dialog.styles)

  it('registers md-dialog custom element', () => {
    assert.equal(globalThis.customElements.get('md-dialog'), Dialog)
  })

  it('turns dialog::backdrop into a non-scrollable scroll container with overscroll-behavior: contain', () => {
    const backdrop = rules.get('dialog::backdrop')
    assert.ok(backdrop, 'expected dialog::backdrop rule')
    assert.equal(backdrop['overflow'], 'hidden')
    assert.equal(backdrop['overscroll-behavior'], 'contain')
  })

  it('contains scroll chaining on .container while preserving overflow: visible on <dialog> for elevation shadows', () => {
    const dialogRule = rules.get('dialog')
    assert.ok(dialogRule, 'expected dialog rule')
    assert.equal(dialogRule['overflow'], 'visible')

    const container = rules.get('.container')
    assert.ok(container, 'expected .container rule')
    assert.equal(container['overflow'], 'hidden')
    assert.equal(container['overscroll-behavior'], 'contain')
  })

  it('contains scroll chaining on .scroller for both non-overflowing and scrollable dialogs', () => {
    const scroller = rules.get('.scroller')
    assert.ok(scroller, 'expected .scroller rule')
    assert.equal(scroller['overflow'], 'hidden')
    assert.equal(scroller['overscroll-behavior'], 'contain')

    const scrollableScroller = rules.get('.scrollable .scroller')
    assert.ok(scrollableScroller, 'expected .scrollable .scroller rule')
    assert.equal(scrollableScroller['overflow-y'], 'scroll')
  })

  it('opens with showModal() and closes without mutating html or body scroll styles', async () => {
    const htmlStyle = { overflow: '', position: '' }
    const bodyStyle = { overflow: '', position: '' }
    const hadDoc = 'document' in globalThis
    const prevDoc = globalThis.document
    globalThis.document = {
      documentElement: { style: htmlStyle },
      body: { style: bodyStyle },
    }

    try {
      const el = new Dialog()
      el.quick = true
      el.isConnected = true
      el.isConnectedPromiseResolve()
      Object.defineProperty(el, 'updateComplete', {
        configurable: true,
        get: () => Promise.resolve(true),
      })

      let modalOpened = false
      const innerDialog = {
        open: false,
        showModal() {
          modalOpened = true
          this.open = true
        },
        close() {
          this.open = false
        },
      }
      const scroller = { scrollTop: 42 }
      el.renderRoot = {
        querySelector(sel) {
          if (sel === 'dialog') return innerDialog
          if (sel === '.scroller') return scroller
          return null
        },
      }
      el.querySelector = () => null
      el.dispatchEvent = () => true

      await el.show()
      assert.equal(modalOpened, true)
      assert.equal(innerDialog.open, true)
      assert.equal(scroller.scrollTop, 0)
      assert.deepEqual(htmlStyle, { overflow: '', position: '' })
      assert.deepEqual(bodyStyle, { overflow: '', position: '' })

      await el.close('confirm')
      assert.equal(innerDialog.open, false)
      assert.equal(el.returnValue, 'confirm')
      assert.deepEqual(htmlStyle, { overflow: '', position: '' })
      assert.deepEqual(bodyStyle, { overflow: '', position: '' })
    } finally {
      if (hadDoc) {
        globalThis.document = prevDoc
      } else {
        delete globalThis.document
      }
    }
  })
})
