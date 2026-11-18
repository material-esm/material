/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import test, { after, before, describe } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean)
  return candidates.find((p) => existsSync(p)) ?? null
}

function buildTestHarnessHtml(hasLocalLit) {
  const importMap = hasLocalLit
    ? {
        imports: {
          lit: '/node_modules/lit/index.js',
          'lit/': '/node_modules/lit/',
          '@lit/reactive-element': '/node_modules/@lit/reactive-element/reactive-element.js',
          '@lit/reactive-element/': '/node_modules/@lit/reactive-element/',
          'lit-element/lit-element.js': '/node_modules/lit-element/lit-element.js',
          'lit-html': '/node_modules/lit-html/lit-html.js',
          'lit-html/': '/node_modules/lit-html/',
          'material/': '/',
        },
      }
    : {
        imports: {
          lit: 'https://cdn.jsdelivr.net/npm/lit@3/index.js',
          'lit/': 'https://cdn.jsdelivr.net/npm/lit@3/',
          '@lit/reactive-element': 'https://cdn.jsdelivr.net/npm/@lit/reactive-element@2/reactive-element.js',
          '@lit/reactive-element/': 'https://cdn.jsdelivr.net/npm/@lit/reactive-element@2/',
          'lit-element/lit-element.js': 'https://cdn.jsdelivr.net/npm/lit-element@4/lit-element.js',
          'lit-html': 'https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js',
          'lit-html/': 'https://cdn.jsdelivr.net/npm/lit-html@3/',
          'material/': '/',
        },
      }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>FAB Menu Test Harness</title>
    <link rel="stylesheet" href="/demo/css/styles.css" />
    <script type="importmap">${JSON.stringify(importMap)}</script>
  </head>
  <body>
    <main id="fixture"></main>
    <script type="module">
      import '/buttons/fab-menu.js'
      import '/icon/icon.js'
      window.__FAB_MENU_READY__ = true
    </script>
  </body>
</html>`
}

async function startServer() {
  const hasLocalLit = existsSync(join(REPO_ROOT, 'node_modules', 'lit', 'index.js'))
  const harnessHtml = buildTestHarnessHtml(hasLocalLit)

  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    if (url.pathname === '/__test_harness__.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(harnessHtml)
      return
    }

    const safeRel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.(\/|\\|$))+/, '')
    const filePath = resolve(REPO_ROOT, '.' + safeRel)
    if (!filePath.startsWith(REPO_ROOT) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    const mime = MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime })
    res.end(readFileSync(filePath))
  })

  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const { port } = server.address()
  return { server, baseUrl: `http://127.0.0.1:${port}` }
}

class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl)
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Map()
  }

  async connect() {
    await new Promise((resolveConn, rejectConn) => {
      this.ws.addEventListener('open', resolveConn, { once: true })
      this.ws.addEventListener('error', rejectConn, { once: true })
    })
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(String(event.data))
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve: res, reject: rej } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) rej(new Error(msg.error.message))
        else res(msg.result)
      } else if (msg.method && this.listeners.has(msg.method)) {
        for (const fn of this.listeners.get(msg.method)) fn(msg)
      }
    })
  }

  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set())
    this.listeners.get(method).add(fn)
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params }
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej })
      this.ws.send(JSON.stringify(payload))
    })
  }

  async evaluate(sessionId, expression) {
    const res = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId)
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text
      throw new Error(`Browser evaluation error: ${desc}`)
    }
    return res.result?.value
  }

  close() {
    try {
      this.ws.close()
    } catch {
      // ignore
    }
  }
}

describe('Material 3 Expressive FAB Menu — Static & Modularity Checks', () => {
  const ownedJsFiles = [
    'buttons/fab-menu.js',
    'buttons/fab-menu-item.js',
    'buttons/fab-menu-styles.js',
    'tests/fab-menu.test.js',
  ]

  test('all owned JS source and test files stay strictly under 1,000 lines', () => {
    for (const relPath of ownedJsFiles) {
      const fullPath = join(REPO_ROOT, relPath)
      assert.ok(existsSync(fullPath), `${relPath} should exist`)
      const lineCount = readFileSync(fullPath, 'utf8').split(/\r?\n/).length
      assert.ok(lineCount < 1000, `${relPath} has ${lineCount} lines (must be < 1000)`)
    }
  })

  test('fab-menu-styles.js uses Lit css tagged template literals and defines M3 tokens', () => {
    const stylesSrc = readFileSync(join(REPO_ROOT, 'buttons/fab-menu-styles.js'), 'utf8')
    assert.match(stylesSrc, /import\s*\{\s*css\s*\}\s*from\s*'lit'/)
    assert.match(stylesSrc, /export const fabMenuStyles = css`/)
    assert.match(stylesSrc, /export const fabMenuItemStyles = css`/)
    assert.match(stylesSrc, /transition-behavior:\s*allow-discrete/)
    assert.match(stylesSrc, /@starting-style/)
    assert.match(stylesSrc, /prefers-reduced-motion:\s*reduce/)
    assert.match(stylesSrc, /forced-colors:\s*active/)
    assert.match(stylesSrc, /9999px/)
    assert.match(stylesSrc, /56px/)
    assert.match(stylesSrc, /96px/)
  })
})

describe('Material 3 Expressive FAB Menu — Live DOM, Specs, Events & Accessibility', () => {
  let serverInfo
  let chromeProc
  let userDataDir
  let cdp
  let sessionId
  const pageErrors = []

  before(async () => {
    const browserBin = findBrowserExecutable()
    assert.ok(browserBin, 'Expected Chrome or Edge browser executable for DOM tests')

    serverInfo = await startServer()
    userDataDir = mkdtempSync(join(tmpdir(), 'md-fab-menu-test-'))

    chromeProc = spawn(browserBin, [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ])

    const wsUrl = await new Promise((resolveWs, rejectWs) => {
      const timeout = setTimeout(() => rejectWs(new Error('Timed out waiting for Chrome CDP')), 10000)
      chromeProc.stderr.on('data', (chunk) => {
        const match = String(chunk).match(/DevTools listening on (ws:\/\/[^\s]+)/)
        if (match) {
          clearTimeout(timeout)
          resolveWs(match[1])
        }
      })
      chromeProc.once('exit', (code) => {
        clearTimeout(timeout)
        rejectWs(new Error(`Chrome exited prematurely with code ${code}`))
      })
    })

    cdp = new CdpSession(wsUrl)
    await cdp.connect()

    const { targetId } = await cdp.send('Target.createTarget', {
      url: `${serverInfo.baseUrl}/__test_harness__.html`,
    })
    const attached = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
    sessionId = attached.sessionId

    cdp.on('Runtime.exceptionThrown', (msg) => {
      if (msg.sessionId === sessionId) {
        pageErrors.push(msg.params?.exceptionDetails?.text || 'Uncaught exception')
      }
    })

    await cdp.send('Page.enable', {}, sessionId)
    await cdp.send('Runtime.enable', {}, sessionId)

    await cdp.evaluate(
      sessionId,
      `new Promise((resolve, reject) => {
        const start = Date.now()
        const check = () => {
          if (window.__FAB_MENU_READY__ && customElements.get('md-fab-menu') && customElements.get('md-fab-menu-item')) {
            resolve(true)
          } else if (Date.now() - start > 8000) {
            reject(new Error('Timed out waiting for custom elements'))
          } else {
            setTimeout(check, 25)
          }
        }
        check()
      })`,
    )
  })

  after(async () => {
    cdp?.close()
    if (chromeProc && !chromeProc.killed) {
      chromeProc.kill()
      await new Promise((r) => chromeProc.once('exit', r))
    }
    if (serverInfo?.server) {
      await new Promise((r) => serverInfo.server.close(r))
    }
    if (userDataDir) {
      try {
        rmSync(userDataDir, { recursive: true, force: true })
      } catch {
        // ignore Windows lock race
      }
    }
  })

  test('renders collapsed primary 56px FAB (16px radius) with expected ARIA attributes', async () => {
    const result = await cdp.evaluate(
      sessionId,
      `(async () => {
        const fixture = document.getElementById('fixture')
        fixture.innerHTML = \`
          <md-fab-menu quick aria-label="Create item">
            <md-icon slot="icon">add</md-icon>
            <md-fab-menu-item value="doc" label="Document"><md-icon slot="icon">description</md-icon></md-fab-menu-item>
            <md-fab-menu-item value="sheet" label="Spreadsheet"><md-icon slot="icon">table_chart</md-icon></md-fab-menu-item>
          </md-fab-menu>
        \`
        const el = fixture.querySelector('md-fab-menu')
        await el.updateComplete
        const trigger = el.shadowRoot.querySelector('#trigger')
        const menu = el.shadowRoot.querySelector('#menu')
        const style = getComputedStyle(trigger)
        const menuStyle = getComputedStyle(menu)
        return {
          open: el.open,
          variant: el.variant,
          size: el.size,
          align: el.align,
          direction: el.direction,
          ariaHaspopup: trigger.getAttribute('aria-haspopup'),
          ariaExpanded: trigger.getAttribute('aria-expanded'),
          ariaControls: trigger.getAttribute('aria-controls'),
          ariaLabel: trigger.getAttribute('aria-label'),
          width: style.width,
          height: style.height,
          borderRadius: style.borderTopLeftRadius,
          menuDisplay: menuStyle.display,
          menuRole: menu.getAttribute('role'),
        }
      })()`,
    )

    assert.equal(result.open, false)
    assert.equal(result.variant, 'primary')
    assert.equal(result.size, 'medium')
    assert.equal(result.align, 'end')
    assert.equal(result.direction, 'up')
    assert.equal(result.ariaHaspopup, 'menu')
    assert.equal(result.ariaExpanded, 'false')
    assert.equal(result.ariaControls, 'menu')
    assert.equal(result.ariaLabel, 'Create item')
    assert.equal(result.width, '56px')
    assert.equal(result.height, '56px')
    assert.equal(result.borderRadius, '16px')
    assert.equal(result.menuDisplay, 'none')
    assert.equal(result.menuRole, 'menu')
  })

  test('morphs medium (56px), large (96px), small (40px), and extended FABs into circular 56px close button with 8px gap & 56px pill items (4px gap)', async () => {
    const result = await cdp.evaluate(
      sessionId,
      `(async () => {
        const fixture = document.getElementById('fixture')
        fixture.innerHTML = \`
          <md-fab-menu id="m-large" size="large" quick aria-label="Large create">
            <md-fab-menu-item icon="edit" label="Write"></md-fab-menu-item>
            <md-fab-menu-item icon="share" label="Share"></md-fab-menu-item>
            <md-fab-menu-item icon="upload" label="Upload"></md-fab-menu-item>
          </md-fab-menu>
          <md-fab-menu id="m-small" size="small" quick aria-label="Small create">
            <md-fab-menu-item icon="edit" label="Write"></md-fab-menu-item>
            <md-fab-menu-item icon="share" label="Share"></md-fab-menu-item>
          </md-fab-menu>
          <md-fab-menu id="m-ext" label="Compose" extended quick>
            <md-fab-menu-item icon="mail" label="Email"></md-fab-menu-item>
            <md-fab-menu-item icon="chat" label="Chat"></md-fab-menu-item>
          </md-fab-menu>
        \`
        const large = fixture.querySelector('#m-large')
        const small = fixture.querySelector('#m-small')
        const ext = fixture.querySelector('#m-ext')
        await Promise.all([large.updateComplete, small.updateComplete, ext.updateComplete])

        const largeTrigger = large.shadowRoot.querySelector('#trigger')
        const smallTrigger = small.shadowRoot.querySelector('#trigger')
        const extTrigger = ext.shadowRoot.querySelector('#trigger')

        const collapsedLarge = {
          w: getComputedStyle(largeTrigger).width,
          h: getComputedStyle(largeTrigger).height,
          r: getComputedStyle(largeTrigger).borderTopLeftRadius,
        }
        const collapsedSmall = {
          w: getComputedStyle(smallTrigger).width,
          h: getComputedStyle(smallTrigger).height,
          r: getComputedStyle(smallTrigger).borderTopLeftRadius,
        }
        const collapsedExtWidth = extTrigger.getBoundingClientRect().width

        await large.show()
        await small.show()
        await ext.show()

        const openLarge = {
          w: getComputedStyle(largeTrigger).width,
          h: getComputedStyle(largeTrigger).height,
          r: getComputedStyle(largeTrigger).borderTopLeftRadius,
          ariaExpanded: largeTrigger.getAttribute('aria-expanded'),
          ariaLabel: largeTrigger.getAttribute('aria-label'),
        }
        const openSmall = {
          w: getComputedStyle(smallTrigger).width,
          h: getComputedStyle(smallTrigger).height,
        }
        const openExt = {
          w: getComputedStyle(extTrigger).width,
          h: getComputedStyle(extTrigger).height,
        }

        const menu = large.shadowRoot.querySelector('#menu')
        const menuStyle = getComputedStyle(menu)
        const triggerRect = largeTrigger.getBoundingClientRect()
        const items = large.items
        await Promise.all(items.map((i) => i.updateComplete))
        const firstItemBtn = items[0].shadowRoot.querySelector('#item')
        const lastItemRect = items[items.length - 1].getBoundingClientRect()
        const itemStyle = getComputedStyle(firstItemBtn)

        return {
          collapsedLarge,
          collapsedSmall,
          collapsedExtWidth,
          openLarge,
          openSmall,
          openExt,
          menuGap: menuStyle.rowGap || menuStyle.gap,
          buttonToNearestItemGap: Math.round(triggerRect.top - lastItemRect.bottom),
          itemHeight: itemStyle.height,
          itemRadius: itemStyle.borderTopLeftRadius,
          itemRole: firstItemBtn.getAttribute('role'),
        }
      })()`,
    )

    assert.deepEqual(result.collapsedLarge, { w: '96px', h: '96px', r: '28px' })
    assert.deepEqual(result.collapsedSmall, { w: '40px', h: '40px', r: '12px' })
    assert.ok(result.collapsedExtWidth >= 80, `Expected extended FAB >= 80px, got ${result.collapsedExtWidth}`)

    assert.equal(result.openLarge.w, '56px')
    assert.equal(result.openLarge.h, '56px')
    assert.equal(result.openLarge.r, '9999px')
    assert.equal(result.openLarge.ariaExpanded, 'true')
    assert.equal(result.openLarge.ariaLabel, 'Close menu')

    assert.deepEqual(result.openSmall, { w: '56px', h: '56px' })
    assert.deepEqual(result.openExt, { w: '56px', h: '56px' })

    assert.equal(result.menuGap, '4px')
    assert.equal(result.buttonToNearestItemGap, 8)
    assert.equal(result.itemHeight, '56px')
    assert.equal(result.itemRadius, '9999px')
    assert.equal(result.itemRole, 'menuitem')
  })

  test('supports primary, secondary, and tertiary tonal color sets plus --md-fab-menu-* custom properties', async () => {
    const colors = await cdp.evaluate(
      sessionId,
      `(async () => {
        const fixture = document.getElementById('fixture')
        fixture.innerHTML = \`
          <md-fab-menu id="p" variant="primary" quick><md-fab-menu-item label="A"></md-fab-menu-item><md-fab-menu-item label="B"></md-fab-menu-item></md-fab-menu>
          <md-fab-menu id="s" variant="secondary" quick><md-fab-menu-item label="A"></md-fab-menu-item><md-fab-menu-item label="B"></md-fab-menu-item></md-fab-menu>
          <md-fab-menu id="t" color="tertiary" quick><md-fab-menu-item label="A"></md-fab-menu-item><md-fab-menu-item label="B"></md-fab-menu-item></md-fab-menu>
          <md-fab-menu id="c" style="--md-fab-menu-close-button-container-color: rgb(12, 34, 56); --md-fab-menu-item-container-color: rgb(210, 220, 230);" quick>
            <md-fab-menu-item label="Custom A"></md-fab-menu-item>
            <md-fab-menu-item label="Custom B"></md-fab-menu-item>
          </md-fab-menu>
        \`
        const [p, s, t, c] = ['p', 's', 't', 'c'].map((id) => fixture.querySelector('#' + id))
        await Promise.all([p.updateComplete, s.updateComplete, t.updateComplete, c.updateComplete])

        const collapsedColors = [p, s, t].map((el) => getComputedStyle(el.shadowRoot.querySelector('#trigger')).backgroundColor)
        await Promise.all([p.show(), s.show(), t.show(), c.show()])

        const openCloseColors = [p, s, t].map((el) => getComputedStyle(el.shadowRoot.querySelector('#trigger')).backgroundColor)
        const itemColors = [p, s, t].map((el) => getComputedStyle(el.items[0].shadowRoot.querySelector('#item')).backgroundColor)

        return {
          collapsedColors,
          openCloseColors,
          itemColors,
          customCloseBg: getComputedStyle(c.shadowRoot.querySelector('#trigger')).backgroundColor,
          customItemBg: getComputedStyle(c.items[0].shadowRoot.querySelector('#item')).backgroundColor,
        }
      })()`,
    )

    // Primary, Secondary, and Tertiary must all have distinct palettes
    assert.notEqual(colors.collapsedColors[0], colors.collapsedColors[1])
    assert.notEqual(colors.collapsedColors[1], colors.collapsedColors[2])
    assert.notEqual(colors.openCloseColors[0], colors.openCloseColors[1])
    assert.notEqual(colors.openCloseColors[1], colors.openCloseColors[2])
    // Close button contrasts with item container color
    assert.notEqual(colors.openCloseColors[0], colors.itemColors[0])
    assert.equal(colors.collapsedColors[0], colors.itemColors[0])
    // Custom property overrides
    assert.equal(colors.customCloseBg, 'rgb(12, 34, 56)')
    assert.equal(colors.customItemBg, 'rgb(210, 220, 230)')
  })

  test('fires cancelable open/close events, opened/closed events, and supports show(), close(), toggle(), and disabled', async () => {
    const lifecycle = await cdp.evaluate(
      sessionId,
      `(async () => {
        const fixture = document.getElementById('fixture')
        fixture.innerHTML = \`
          <md-fab-menu id="ev" quick>
            <md-fab-menu-item value="one" label="One"></md-fab-menu-item>
            <md-fab-menu-item value="two" label="Two"></md-fab-menu-item>
          </md-fab-menu>
        \`
        const menu = fixture.querySelector('#ev')
        await menu.updateComplete
        const log = []
        let blockOpen = true
        let blockClose = false

        menu.addEventListener('open', (e) => {
          log.push('open')
          if (blockOpen) e.preventDefault()
        })
        menu.addEventListener('opened', () => log.push('opened'))
        menu.addEventListener('close', (e) => {
          log.push('close:' + (e.detail?.reason || ''))
          if (blockClose) e.preventDefault()
        })
        menu.addEventListener('closed', (e) => log.push('closed:' + (e.detail?.reason || '')))

        const blockedOpenResult = await menu.show()
        const afterBlockedOpen = menu.open

        blockOpen = false
        const openedResult = await menu.show()
        const afterShow = menu.open && menu.hasAttribute('open')

        blockClose = true
        const blockedCloseResult = await menu.close('manual')
        const afterBlockedClose = menu.open && menu.hasAttribute('open')

        blockClose = false
        const toggledCloseResult = await menu.toggle()
        const afterToggleClose = menu.open

        menu.disabled = true
        await menu.updateComplete
        const disabledOpenResult = await menu.show()

        return {
          log,
          blockedOpenResult,
          afterBlockedOpen,
          openedResult,
          afterShow,
          blockedCloseResult,
          afterBlockedClose,
          toggledCloseResult,
          afterToggleClose,
          disabledOpenResult,
        }
      })()`,
    )

    assert.equal(lifecycle.blockedOpenResult, false)
    assert.equal(lifecycle.afterBlockedOpen, false)
    assert.equal(lifecycle.openedResult, true)
    assert.equal(lifecycle.afterShow, true)
    assert.equal(lifecycle.blockedCloseResult, false)
    assert.equal(lifecycle.afterBlockedClose, true)
    assert.equal(lifecycle.toggledCloseResult, true)
    assert.equal(lifecycle.afterToggleClose, false)
    assert.equal(lifecycle.disabledOpenResult, false)
    assert.deepEqual(lifecycle.log, ['open', 'open', 'opened', 'close:manual', 'close:toggle', 'closed:toggle'])
  })

  test('handles item-activate, keep-open, href/target link items, and disabled items', async () => {
    const itemRes = await cdp.evaluate(
      sessionId,
      `(async () => {
        const fixture = document.getElementById('fixture')
        fixture.innerHTML = \`
          <md-fab-menu id="im" quick>
            <md-fab-menu-item id="i-keep" value="pin" label="Pin" keep-open></md-fab-menu-item>
            <md-fab-menu-item id="i-dis" value="nope" label="Disabled" disabled></md-fab-menu-item>
            <md-fab-menu-item id="i-link" value="spec" href="#spec-anchor" target="_blank">Spec Link</md-fab-menu-item>
            <md-fab-menu-item id="i-normal" value="save" label="Save"></md-fab-menu-item>
          </md-fab-menu>
        \`
        const menu = fixture.querySelector('#im')
        await menu.updateComplete
        await menu.show()

        const activations = []
        menu.addEventListener('item-activate', (e) => {
          activations.push({
            index: e.detail.index,
            value: e.detail.value,
            label: e.detail.label,
            keepOpen: e.detail.keepOpen,
          })
          if (e.detail.value === 'spec') {
            e.preventDefault() // prevent opening popup window during test
          }
        })

        // Disabled item should not fire item-activate
        fixture.querySelector('#i-dis').click()
        const openAfterDisabled = menu.open

        // keep-open item fires item-activate and stays open
        fixture.querySelector('#i-keep').click()
        const openAfterKeep = menu.open

        // Link item renders <a role="menuitem"> with href, target, rel
        const linkAnchor = fixture.querySelector('#i-link').shadowRoot.querySelector('#item')
        const linkMeta = {
          tag: linkAnchor.tagName,
          role: linkAnchor.getAttribute('role'),
          href: linkAnchor.getAttribute('href'),
          target: linkAnchor.getAttribute('target'),
          rel: linkAnchor.getAttribute('rel'),
        }
        linkAnchor.click()
        const openAfterPreventedLink = menu.open

        // Normal item activates and closes menu
        fixture.querySelector('#i-normal').click()
        await menu.updateComplete
        const openAfterNormal = menu.open

        return {
          activations,
          openAfterDisabled,
          openAfterKeep,
          linkMeta,
          openAfterPreventedLink,
          openAfterNormal,
        }
      })()`,
    )

    assert.equal(itemRes.openAfterDisabled, true)
    assert.equal(itemRes.openAfterKeep, true)
    assert.deepEqual(itemRes.linkMeta, {
      tag: 'A',
      role: 'menuitem',
      href: '#spec-anchor',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
    assert.equal(itemRes.openAfterPreventedLink, true)
    assert.equal(itemRes.openAfterNormal, false)
    assert.deepEqual(itemRes.activations, [
      { index: 0, value: 'pin', label: 'Pin', keepOpen: true },
      { index: 2, value: 'spec', label: 'Spec Link', keepOpen: false },
      { index: 3, value: 'save', label: 'Save', keepOpen: false },
    ])
  })

  test('supports full keyboard navigation (ArrowDown, ArrowUp, Home, End, disabled skip, Escape focus restore, Tab close)', async () => {
    const kbRes = await cdp.evaluate(
      sessionId,
      `(async () => {
        const fixture = document.getElementById('fixture')
        fixture.innerHTML = \`
          <md-fab-menu id="kb" quick aria-label="Actions">
            <md-fab-menu-item id="k0" label="First"></md-fab-menu-item>
            <md-fab-menu-item id="k1" label="Skipped" disabled></md-fab-menu-item>
            <md-fab-menu-item id="k2" label="Middle"></md-fab-menu-item>
            <md-fab-menu-item id="k3" label="Last"></md-fab-menu-item>
          </md-fab-menu>
        \`
        const menu = fixture.querySelector('#kb')
        await menu.updateComplete
        const trigger = menu.shadowRoot.querySelector('#trigger')
        trigger.focus()

        const press = (target, key) => {
          target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))
        }

        // ArrowDown on closed trigger opens menu & focuses k0
        press(trigger, 'ArrowDown')
        await new Promise((r) => setTimeout(r, 30))
        const afterOpenDown = { open: menu.open, activeId: document.activeElement?.id }

        // ArrowDown skips disabled k1 -> focuses k2
        press(document.activeElement, 'ArrowDown')
        const afterSecondDown = document.activeElement?.id

        // End -> k3
        press(document.activeElement, 'End')
        const afterEnd = document.activeElement?.id

        // ArrowDown wraps -> k0
        press(document.activeElement, 'ArrowDown')
        const afterWrapDown = document.activeElement?.id

        // ArrowUp wraps -> k3
        press(document.activeElement, 'ArrowUp')
        const afterWrapUp = document.activeElement?.id

        // Home -> k0
        press(document.activeElement, 'Home')
        const afterHome = document.activeElement?.id

        // Escape closes and restores focus to trigger inside md-fab-menu
        press(document.activeElement, 'Escape')
        await new Promise((r) => setTimeout(r, 30))
        const afterEscape = {
          open: menu.open,
          focusRestoredToMenu: document.activeElement === menu,
          shadowActiveId: menu.shadowRoot.activeElement?.id,
        }

        // Reopen and press Tab -> closes without trapping focus
        await menu.show()
        press(menu.items[0], 'Tab')
        await menu.updateComplete
        const openAfterTab = menu.open

        return {
          afterOpenDown,
          afterSecondDown,
          afterEnd,
          afterWrapDown,
          afterWrapUp,
          afterHome,
          afterEscape,
          openAfterTab,
        }
      })()`,
    )

    assert.deepEqual(kbRes.afterOpenDown, { open: true, activeId: 'k0' })
    assert.equal(kbRes.afterSecondDown, 'k2')
    assert.equal(kbRes.afterEnd, 'k3')
    assert.equal(kbRes.afterWrapDown, 'k0')
    assert.equal(kbRes.afterWrapUp, 'k3')
    assert.equal(kbRes.afterHome, 'k0')
    assert.deepEqual(kbRes.afterEscape, {
      open: false,
      focusRestoredToMenu: true,
      shadowActiveId: 'trigger',
    })
    assert.equal(kbRes.openAfterTab, false)
  })

  test('supports outside-click light-dismiss, scrim dismiss, align="start", direction="down", and RTL stagger origin', async () => {
    const layoutRes = await cdp.evaluate(
      sessionId,
      `(async () => {
        const fixture = document.getElementById('fixture')
        fixture.innerHTML = \`
          <button id="outside">Outside</button>
          <md-fab-menu id="sc" scrim align="start" direction="down" quick>
            <md-fab-menu-item label="Top"></md-fab-menu-item>
            <md-fab-menu-item label="Bottom"></md-fab-menu-item>
          </md-fab-menu>
        \`
        const menu = fixture.querySelector('#sc')
        await menu.updateComplete
        await menu.show()

        const triggerRect = menu.shadowRoot.querySelector('#trigger').getBoundingClientRect()
        const firstItemRect = menu.items[0].getBoundingClientRect()
        const scrimEl = menu.shadowRoot.querySelector('.scrim')
        const hasScrimVisible = Boolean(scrimEl) && !scrimEl.hidden

        let closeReason = ''
        menu.addEventListener('closed', (e) => {
          closeReason = e.detail.reason
        })

        // Scrim click closes with reason 'scrim'
        scrimEl.click()
        await menu.updateComplete
        const reasonAfterScrim = closeReason
        const closedAfterScrim = !menu.open

        // Reopen and click outside -> closes with reason 'outside-click'
        await menu.show()
        fixture.querySelector('#outside').click()
        await menu.updateComplete
        const reasonAfterOutside = closeReason
        const closedAfterOutside = !menu.open

        // RTL check
        fixture.setAttribute('dir', 'rtl')
        menu.align = 'end'
        await menu.updateComplete
        await menu.show()
        const rtlOriginX = menu.items[0].style.getPropertyValue('--_item-origin-x')
        fixture.removeAttribute('dir')

        return {
          opensDownwardGap: Math.round(firstItemRect.top - triggerRect.bottom),
          alignedStart: Math.abs(firstItemRect.left - triggerRect.left) <= 1,
          hasScrimVisible,
          closedAfterScrim,
          reasonAfterScrim,
          closedAfterOutside,
          reasonAfterOutside,
          rtlOriginX,
        }
      })()`,
    )

    assert.equal(layoutRes.opensDownwardGap, 8)
    assert.equal(layoutRes.alignedStart, true)
    assert.equal(layoutRes.hasScrimVisible, true)
    assert.equal(layoutRes.closedAfterScrim, true)
    assert.equal(layoutRes.reasonAfterScrim, 'scrim')
    assert.equal(layoutRes.closedAfterOutside, true)
    assert.equal(layoutRes.reasonAfterOutside, 'outside-click')
    assert.equal(layoutRes.rtlOriginX, 'left')
    assert.deepEqual(pageErrors, [])
  })

  test('supports animated open/close transitions (without quick), stagger indices, and declarative open attribute', async () => {
    const animRes = await cdp.evaluate(
      sessionId,
      `(async () => {
        const fixture = document.getElementById('fixture')
        fixture.innerHTML = \`
          <md-fab-menu id="anim" open aria-label="Animated menu">
            <md-fab-menu-item label="Top"></md-fab-menu-item>
            <md-fab-menu-item label="Middle"></md-fab-menu-item>
            <md-fab-menu-item label="Nearest"></md-fab-menu-item>
          </md-fab-menu>
        \`
        const menu = fixture.querySelector('#anim')
        await menu.updateComplete
        const declarativeOpen = menu.open
        const staggerIndices = menu.items.map((item) => item.style.getPropertyValue('--_stagger-index'))

        let closedFired = false
        menu.addEventListener('closed', () => {
          closedFired = true
        })
        await menu.close('animated')
        const hiddenAfterClose = getComputedStyle(menu.shadowRoot.querySelector('#menu')).display === 'none'

        let openedFired = false
        menu.addEventListener('opened', () => {
          openedFired = true
        })
        await menu.show()

        return {
          declarativeOpen,
          staggerIndices,
          closedFired,
          hiddenAfterClose,
          openedFired,
          finalOpen: menu.open,
        }
      })()`,
    )

    assert.equal(animRes.declarativeOpen, true)
    assert.deepEqual(animRes.staggerIndices, ['2', '1', '0'])
    assert.equal(animRes.closedFired, true)
    assert.equal(animRes.hiddenAfterClose, true)
    assert.equal(animRes.openedFired, true)
    assert.equal(animRes.finalOpen, true)
  })

  test('loads demo/fab-menu-demo.html cleanly with zero console or page errors', async () => {
    const demoTarget = await cdp.send('Target.createTarget', {
      url: `${serverInfo.baseUrl}/demo/fab-menu-demo.html`,
    })
    const demoAttached = await cdp.send('Target.attachToTarget', {
      targetId: demoTarget.targetId,
      flatten: true,
    })
    const demoSession = demoAttached.sessionId
    const demoErrors = []

    cdp.on('Runtime.exceptionThrown', (msg) => {
      if (msg.sessionId === demoSession) {
        demoErrors.push(msg.params?.exceptionDetails?.text || 'Demo exception')
      }
    })
    cdp.on('Runtime.consoleAPICalled', (msg) => {
      if (msg.sessionId === demoSession && msg.params?.type === 'error') {
        const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ')
        demoErrors.push(`console.error: ${text}`)
      }
    })

    await cdp.send('Page.enable', {}, demoSession)
    await cdp.send('Runtime.enable', {}, demoSession)

    const demoState = await cdp.evaluate(
      demoSession,
      `new Promise((resolve, reject) => {
        const start = Date.now()
        const poll = () => {
          const menus = document.querySelectorAll('md-fab-menu')
          if (customElements.get('md-fab-menu') && menus.length >= 6 && menus[0].shadowRoot) {
            resolve({ count: menus.length, title: document.title })
          } else if (Date.now() - start > 8000) {
            reject(new Error('Demo failed to upgrade md-fab-menu'))
          } else {
            setTimeout(poll, 50)
          }
        }
        poll()
      })`,
    )

    await cdp.send('Target.closeTarget', { targetId: demoTarget.targetId })
    assert.ok(demoState.count >= 6)
    assert.match(demoState.title, /FAB Menu/i)
    assert.deepEqual(demoErrors, [])
  })
})
