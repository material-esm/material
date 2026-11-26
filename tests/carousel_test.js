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

const { Carousel } = await import('../carousel/carousel.js')

function makeClassList() {
  const set = new Set()
  return {
    add: (...names) => names.forEach((n) => set.add(n)),
    remove: (...names) => names.forEach((n) => set.delete(n)),
    contains: (name) => set.has(name),
  }
}

function makeMockItem({ href = '', disabled = false, offsetLeft = 0, offsetWidth = 200 } = {}) {
  const attrs = new Map()
  const shadowRoot = { isShadowRoot: true }
  const item = {
    href,
    disabled,
    active: false,
    offsetLeft,
    offsetWidth,
    style: {},
    classList: makeClassList(),
    shadowRoot,
    setAttribute(k, v) {
      attrs.set(k, String(v))
    },
    getAttribute(k) {
      return attrs.get(k) ?? null
    },
  }
  const mediaContainer = {
    matches: () => false,
    getRootNode: () => shadowRoot,
  }
  const linkEl = {
    matches: (sel) => sel.includes('a[href]'),
    getRootNode: () => shadowRoot,
  }
  return { item, mediaContainer, linkEl, shadowRoot }
}

function makeCarousel({ layout = 'multi-browse', activeIndex = 0, itemsConfig = [{}, {}, {}] } = {}) {
  const carousel = new Carousel()
  carousel.layout = layout
  carousel.activeIndex = activeIndex
  carousel.offsetWidth = 900

  const scrollCalls = []
  const events = []
  const scroller = {
    clientWidth: 900,
    offsetWidth: 900,
    offsetLeft: 0,
    scrollWidth: 2000,
    scrollLeft: 0,
    style: {
      setProperty() {},
    },
    classList: makeClassList(),
    scrollTo(opts) {
      scrollCalls.push(opts)
      this.scrollLeft = opts.left
    },
    addEventListener() {},
    removeEventListener() {},
  }

  const mocks = itemsConfig.map((cfg, idx) => makeMockItem({ offsetLeft: idx * 300, ...cfg }))
  const items = mocks.map((m) => m.item)

  Object.defineProperty(carousel, 'items', {
    configurable: true,
    get: () => items,
  })
  Object.defineProperty(carousel, 'updateComplete', {
    configurable: true,
    get: () => Promise.resolve(true),
  })
  carousel.renderRoot = {
    querySelector(sel) {
      if (sel === '.scroller') return scroller
      return null
    },
  }
  carousel.dispatchEvent = (ev) => {
    events.push(ev)
    return true
  }

  return { carousel, items, mocks, scroller, scrollCalls, events }
}

function makeClickEvent(path, overrides = {}) {
  let defaultPrevented = false
  return {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    get defaultPrevented() {
      return defaultPrevented
    },
    preventDefault() {
      defaultPrevented = true
    },
    stopPropagation() {},
    composedPath: () => path,
    target: path[0],
    ...overrides,
  }
}

describe('md-carousel item click navigation', () => {
  it('registers md-carousel and configures overscroll containment, pointer cursor, and reduced-motion scroll behavior', () => {
    assert.equal(globalThis.customElements.get('md-carousel'), Carousel)
    const rawCss = Carousel.styles.map((s) => s.cssText).join('\n')
    assert.match(rawCss, /overscroll-behavior-x:\s*contain/)
    assert.match(rawCss, /@media\s*\(prefers-reduced-motion:\s*no-preference\)[\s\S]*?scroll-behavior:\s*smooth/)
    assert.match(rawCss, /::slotted\(md-carousel-item:not\(\[active\]\):not\(\[disabled\]\)\)[\s\S]*?cursor:\s*pointer/)
  })

  it('scrolls to and activates a clicked non-active item in multi-browse layout', async () => {
    const { carousel, items, mocks, scrollCalls, events } = makeCarousel({
      layout: 'multi-browse',
      activeIndex: 0,
    })

    const ev = makeClickEvent([mocks[1].mediaContainer, mocks[1].shadowRoot, items[1]])
    carousel._handleItemClick(ev)
    await carousel.updateComplete

    assert.equal(carousel.activeIndex, 1)
    assert.equal(items[1].active, true)
    assert.equal(items[0].active, false)
    assert.equal(scrollCalls.length, 1)
    assert.equal(scrollCalls[0].behavior, 'smooth')
    assert.equal(events.length, 1)
    assert.equal(events[0].type, 'change')
    assert.equal(events[0].detail.index, 1)
    assert.equal(events[0].detail.item, items[1])

    carousel.disconnectedCallback()
  })

  it('does not re-scroll or emit change when clicking the already active item', async () => {
    const { carousel, items, mocks, scrollCalls, events } = makeCarousel({
      layout: 'multi-browse',
      activeIndex: 0,
    })

    const ev = makeClickEvent([mocks[0].mediaContainer, mocks[0].shadowRoot, items[0]])
    carousel._handleItemClick(ev)
    await carousel.updateComplete

    assert.equal(carousel.activeIndex, 0)
    assert.equal(scrollCalls.length, 0)
    assert.equal(events.length, 0)
    assert.equal(ev.defaultPrevented, false)
  })

  it('prevents navigation on first click of a non-active href item in focal layouts, then allows click once active', async () => {
    const { carousel, items, mocks, scrollCalls } = makeCarousel({
      layout: 'hero',
      activeIndex: 0,
      itemsConfig: [{ href: '#1' }, { href: '#2' }, { href: '#3' }],
    })

    // First click on non-active href item focuses it and prevents immediate link navigation
    const firstClick = makeClickEvent([mocks[1].mediaContainer, mocks[1].linkEl, mocks[1].shadowRoot, items[1]])
    carousel._handleItemClick(firstClick)
    await carousel.updateComplete

    assert.equal(firstClick.defaultPrevented, true)
    assert.equal(carousel.activeIndex, 1)
    assert.equal(scrollCalls.length, 1)

    // Second click now that item 1 is active allows normal link navigation
    const secondClick = makeClickEvent([mocks[1].mediaContainer, mocks[1].linkEl, mocks[1].shadowRoot, items[1]])
    carousel._handleItemClick(secondClick)
    await carousel.updateComplete

    assert.equal(secondClick.defaultPrevented, false)
    assert.equal(scrollCalls.length, 1)

    carousel.disconnectedCallback()
  })

  it('allows href navigation directly in uncontained layout while still scrolling non-href cards', async () => {
    const { carousel, items, mocks, scrollCalls } = makeCarousel({
      layout: 'uncontained',
      activeIndex: 0,
      itemsConfig: [{}, { href: '#card-2' }, {}],
    })

    const hrefClick = makeClickEvent([mocks[1].mediaContainer, mocks[1].linkEl, mocks[1].shadowRoot, items[1]])
    carousel._handleItemClick(hrefClick)
    await carousel.updateComplete

    assert.equal(hrefClick.defaultPrevented, false)
    assert.equal(carousel.activeIndex, 0)
    assert.equal(scrollCalls.length, 0)

    const cardClick = makeClickEvent([mocks[2].mediaContainer, mocks[2].shadowRoot, items[2]])
    carousel._handleItemClick(cardClick)
    await carousel.updateComplete

    assert.equal(carousel.activeIndex, 2)
    assert.equal(scrollCalls.length, 1)

    carousel.disconnectedCallback()
  })

  it('ignores clicks on nested interactive elements inside a non-active item', async () => {
    const { carousel, items, scrollCalls } = makeCarousel({
      layout: 'uncontained',
      activeIndex: 0,
    })

    const nestedButton = {
      matches: (sel) => sel.includes('md-button'),
      getRootNode: () => ({ isDocument: true }),
    }
    const ev = makeClickEvent([nestedButton, items[1]])
    carousel._handleItemClick(ev)
    await carousel.updateComplete

    assert.equal(carousel.activeIndex, 0)
    assert.equal(scrollCalls.length, 0)
    assert.equal(ev.defaultPrevented, false)
  })

  it('ignores clicks after dragging, modifier-key clicks, and disabled items', async () => {
    const { carousel, items, mocks, scrollCalls } = makeCarousel({
      layout: 'multi-browse',
      activeIndex: 0,
      itemsConfig: [{}, { disabled: true }, { href: '#3' }],
    })

    // Disabled item
    carousel._handleItemClick(makeClickEvent([mocks[1].mediaContainer, mocks[1].shadowRoot, items[1]]))
    await carousel.updateComplete
    assert.equal(carousel.activeIndex, 0)

    // Modifier-key click (e.g. Cmd/Ctrl+click)
    const modClick = makeClickEvent([mocks[2].linkEl, mocks[2].shadowRoot, items[2]], { ctrlKey: true })
    carousel._handleItemClick(modClick)
    await carousel.updateComplete
    assert.equal(carousel.activeIndex, 0)
    assert.equal(modClick.defaultPrevented, false)

    // After dragging
    carousel._hasDragged = true
    carousel._handleItemClick(makeClickEvent([mocks[2].mediaContainer, mocks[2].shadowRoot, items[2]]))
    await carousel.updateComplete
    assert.equal(carousel.activeIndex, 0)
    assert.equal(scrollCalls.length, 0)
  })

  it('activates a focused non-active item on Enter or Space without hijacking nested controls', async () => {
    const { carousel, items, mocks, scrollCalls } = makeCarousel({
      layout: 'centered-hero',
      activeIndex: 0,
    })

    // Nested button Enter should not be hijacked
    const nestedBtn = {
      matches: (sel) => sel.includes('button'),
      getRootNode: () => ({ isDocument: true }),
    }
    const nestedKeyEvent = makeClickEvent([nestedBtn, items[1]], { key: 'Enter' })
    carousel._handleKeyDown(nestedKeyEvent)
    await carousel.updateComplete
    assert.equal(carousel.activeIndex, 0)
    assert.equal(nestedKeyEvent.defaultPrevented, false)

    // Non-active item Space activates and scrolls to it
    const itemKeyEvent = makeClickEvent([mocks[1].mediaContainer, mocks[1].shadowRoot, items[1]], { key: ' ' })
    carousel._handleKeyDown(itemKeyEvent)
    await carousel.updateComplete
    assert.equal(itemKeyEvent.defaultPrevented, true)
    assert.equal(carousel.activeIndex, 1)
    assert.equal(scrollCalls.length, 1)

    carousel.disconnectedCallback()
  })

  it('uses instant scrolling when prefers-reduced-motion: reduce is active', async () => {
    const hadWindow = 'window' in globalThis
    const prevWindow = globalThis.window
    globalThis.window = {
      matchMedia: (q) => ({ matches: q === '(prefers-reduced-motion: reduce)' }),
    }

    try {
      const { carousel, items, mocks, scrollCalls } = makeCarousel({
        layout: 'multi-browse',
        activeIndex: 0,
      })

      carousel._handleItemClick(makeClickEvent([mocks[2].mediaContainer, mocks[2].shadowRoot, items[2]]))
      await carousel.updateComplete

      assert.equal(carousel.activeIndex, 2)
      assert.equal(scrollCalls.length, 1)
      assert.equal(scrollCalls[0].behavior, 'instant')

      carousel.disconnectedCallback()
    } finally {
      if (hadWindow) {
        globalThis.window = prevWindow
      } else {
        delete globalThis.window
      }
    }
  })
})
