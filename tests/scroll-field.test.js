/**
 * @license
 * Copyright 2026 Material Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CSSResult, nothing } from 'lit'
import { ScrollField, ScrollFieldGroup } from '../text/scroll-field.js'
import { scrollFieldStyles, scrollFieldGroupStyles } from '../text/scroll-field-styles.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

/**
 * Recursively renders a Lit TemplateResult (including classMap/styleMap directives)
 * into an HTML string in pure Node without requiring JSDOM.
 */
function renderTemplateToString(val) {
  if (val === null || val === undefined || val === nothing || typeof val === 'boolean') {
    return ''
  }
  if (Array.isArray(val)) {
    return val.map(renderTemplateToString).join('')
  }
  if (typeof val === 'object' && Array.isArray(val.strings) && Array.isArray(val.values)) {
    let out = ''
    for (let i = 0; i < val.strings.length; i++) {
      out += val.strings[i]
      if (i < val.values.length) {
        const v = val.values[i]
        if (v && typeof v === 'object' && '_$litDirective$' in v) {
          const arg = v.values?.[0]
          if (arg && typeof arg === 'object') {
            // Handle classMap and styleMap directive payloads
            const entries = Object.entries(arg)
            if (entries.every(([, entryVal]) => typeof entryVal === 'boolean')) {
              out += entries
                .filter(([, enabled]) => enabled)
                .map(([k]) => k)
                .join(' ')
            } else {
              out += entries
                .filter(([, styleVal]) => styleVal !== undefined && styleVal !== null)
                .map(([k, styleVal]) => `${k}:${styleVal}`)
                .join(';')
            }
          }
        } else if (typeof v === 'function') {
          out += '[handler]'
        } else {
          out += renderTemplateToString(v)
        }
      }
    }
    return out
  }
  return String(val)
}

function makeKeyEvent(key, extra = {}) {
  let prevented = false
  let stopped = false
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    isComposing: false,
    keyCode: key === 'Enter' ? 13 : 0,
    timeStamp: 1000,
    ...extra,
    get defaultPrevented() {
      return prevented
    },
    get propagationStopped() {
      return stopped
    },
    preventDefault() {
      prevented = true
    },
    stopPropagation() {
      stopped = true
    },
    composedPath() {
      return extra.path || []
    },
  }
}

test('Custom elements and Lit CSSResult styles are properly defined', () => {
  assert.equal(customElements.get('md-scroll-field'), ScrollField)
  assert.equal(customElements.get('md-scroll-field-group'), ScrollFieldGroup)
  assert.equal(ScrollField.formAssociated, true)
  assert.equal(ScrollField.shadowRootOptions.delegatesFocus, true)

  assert.ok(scrollFieldStyles instanceof CSSResult, 'scrollFieldStyles must use Lit css tagged template')
  assert.ok(scrollFieldGroupStyles instanceof CSSResult, 'scrollFieldGroupStyles must use Lit css tagged template')
  assert.ok(ScrollField.styles.every((s) => s instanceof CSSResult))
  assert.ok(ScrollFieldGroup.styles.every((s) => s instanceof CSSResult))
})

test('File size & modularity rule: all scroll-field JS files are well under 1,000 lines', () => {
  const filesToCheck = ['text/scroll-field.js', 'text/scroll-field-styles.js', 'tests/scroll-field.test.js']
  for (const relPath of filesToCheck) {
    const absPath = path.join(repoRoot, relPath)
    const content = fs.readFileSync(absPath, 'utf8')
    const lineCount = content.split(/\r?\n/).length
    assert.ok(lineCount < 1000, `${relPath} has ${lineCount} lines (must be < 1,000)`)
  }
})

test('Digit sizes: supports 1-2 (default + 1/2 aliases), 3, 4, and auto', () => {
  const el = new ScrollField()
  assert.equal(el.size, '1-2')
  assert.equal(el.normalizedSize, '1-2')

  el.size = '1'
  assert.equal(el.normalizedSize, '1-2')
  el.size = '2'
  assert.equal(el.normalizedSize, '1-2')

  el.size = '3'
  assert.equal(el.normalizedSize, '3')

  el.size = '4'
  assert.equal(el.normalizedSize, '4')

  el.size = 'auto'
  assert.equal(el.normalizedSize, 'auto')
})

test('Numeric range mode: min, max, step, decimal steps, pad formatting, and property order resilience', () => {
  const el = new ScrollField()
  assert.equal(el.min, 0)
  assert.equal(el.max, 99)
  assert.equal(el.step, 1)
  assert.equal(el.itemCount, 100)
  assert.equal(el.value, '0')
  assert.equal(el.valueAsNumber, 0)

  // Zero-padding formatting
  el.pad = 2
  el.value = 5
  assert.equal(el.value, '5')
  assert.equal(el.valueAsNumber, 5)
  assert.equal(el.formattedValue, '05')

  // Negative number zero-padding
  el.min = -10
  el.max = 10
  el.value = -5
  assert.equal(el.formattedValue, '-05')

  // Decimal step without IEEE-754 float drift
  const temp = new ScrollField()
  temp.min = 35
  temp.max = 42
  temp.step = 0.1
  temp.value = 35.3
  assert.equal(temp.value, '35.3')
  assert.equal(temp.formattedValue, '35.3')
  temp.stepBy(1)
  assert.equal(temp.value, '35.4')

  // Out-of-order assignment: setting 4-digit year value BEFORE max=2100
  const year = new ScrollField()
  year.value = '2026'
  year.min = 1900
  year.max = 2100
  year.size = '4'
  assert.equal(year.value, '2026')
  assert.equal(year.valueAsNumber, 2026)
  assert.equal(year.selectedIndex, 126)
})

test('Discrete options mode: array of strings, array of {value, label, ariaLabel}, and JSON attribute parsing', () => {
  const period = new ScrollField()
  period.options = ['AM', 'PM']
  assert.equal(period.isOptionsMode, true)
  assert.equal(period.itemCount, 2)
  assert.equal(period.value, 'AM')

  period.value = 'pm' // case-insensitive match
  assert.equal(period.value, 'PM')
  assert.equal(period.selectedIndex, 1)

  // Object options + JSON converter
  const unit = new ScrollField()
  const converter = ScrollField.properties.options.converter
  unit.options = converter.fromAttribute(
    '[{"value":"kg","label":"kg","ariaLabel":"kilograms"},{"value":"lb","label":"lb","ariaLabel":"pounds"}]',
  )
  unit.value = 'lb'
  assert.equal(unit.value, 'lb')
  assert.equal(unit.formattedValue, 'lb')
  assert.equal(unit.computedAriaValueText, 'pounds')
})

test('Finite vs Looping (loop) scroll math, wrap-around, and virtual windowing', () => {
  // Finite mode clamps at min and max without firing spurious events
  const finite = new ScrollField()
  finite.min = 0
  finite.max = 59
  finite.value = 0

  let inputCount = 0
  let changeCount = 0
  finite.addEventListener('input', () => inputCount++)
  finite.addEventListener('change', () => changeCount++)

  assert.equal(finite.stepBy(-1, { emitEvents: true, commitChange: true }), false)
  assert.equal(finite.value, '0')
  assert.equal(inputCount, 0)
  assert.equal(changeCount, 0)

  assert.equal(finite.stepBy(1, { emitEvents: true, commitChange: true }), true)
  assert.equal(finite.value, '1')
  assert.equal(inputCount, 1)
  assert.equal(changeCount, 1)

  finite.value = 59
  assert.equal(finite.stepBy(1, { emitEvents: true, commitChange: true }), false)
  assert.equal(finite.value, '59')

  // Looping mode wraps seamlessly 0 <-> 59 and triples slots
  const looping = new ScrollField()
  looping.min = 0
  looping.max = 59
  looping.pad = 2
  looping.loop = true
  looping.value = 0

  assert.equal(looping.isLoopActive, true)
  assert.equal(looping.totalSlots, 180)
  assert.equal(looping.canonicalSlot, 60)

  // Step backward from 00 -> wraps to 59
  assert.equal(looping.stepBy(-1, { emitEvents: true, commitChange: true }), true)
  assert.equal(looping.value, '59')
  assert.equal(looping.formattedValue, '59')

  // Step forward from 59 -> wraps back to 00
  assert.equal(looping.stepBy(1, { emitEvents: true, commitChange: true }), true)
  assert.equal(looping.value, '0')
  assert.equal(looping.formattedValue, '00')

  // Verify recenter helper brings outer copy scrollTop back to canonical middle copy
  const mockScroller = { scrollTop: 5 * 48, style: { scrollBehavior: '' } }
  Object.defineProperty(looping, 'scrollerElement', { get: () => mockScroller })
  looping._getItemHeight = () => 48
  looping._recenterLoopIfNeeded()
  assert.equal(mockScroller.scrollTop, (60 + 5) * 48)

  // Verify large 4-digit looping range uses virtual windowing (< 250 rendered items instead of 30,000)
  const big = new ScrollField()
  big.size = '4'
  big.min = 0
  big.max = 9999
  big.loop = true
  big.value = 2026
  big._windowCenterSlot = big.canonicalSlot
  const items = big._renderWheelItems()
  assert.equal(big.totalSlots, 30000)
  assert.ok(items.length <= 205, `Expected windowed item count <= 205, got ${items.length}`)
})

test('Spinbutton ARIA attributes & keyboard navigation (ArrowUp/Down, PageUp/Down, Home/End)', () => {
  const el = new ScrollField()
  el.min = 0
  el.max = 100
  el.step = 5
  el.value = 25
  el.label = 'Target Speed'
  el.unit = 'km/h'

  const htmlOut = renderTemplateToString(el.render())
  assert.match(htmlOut, /role="spinbutton"/)
  assert.match(htmlOut, /aria-label="Target Speed"/)
  assert.match(htmlOut, /aria-valuenow="25"/)
  assert.match(htmlOut, /aria-valuemin="0"/)
  assert.match(htmlOut, /aria-valuemax="100"/)
  assert.match(htmlOut, /aria-valuetext="25 km\/h"/)
  assert.match(htmlOut, /aria-disabled="false"/)
  assert.match(htmlOut, /aria-readonly="false"/)

  // ArrowUp -> +1 step (30)
  const up = makeKeyEvent('ArrowUp')
  el._onHostKeyDown(up)
  assert.equal(up.defaultPrevented, true)
  assert.equal(el.value, '30')

  // ArrowDown -> -1 step (25)
  el._onHostKeyDown(makeKeyEvent('ArrowDown'))
  assert.equal(el.value, '25')

  // PageUp -> +10 steps (75)
  el._onHostKeyDown(makeKeyEvent('PageUp'))
  assert.equal(el.value, '75')

  // PageDown -> -10 steps (25)
  el._onHostKeyDown(makeKeyEvent('PageDown'))
  assert.equal(el.value, '25')

  // End -> max (100)
  el._onHostKeyDown(makeKeyEvent('End'))
  assert.equal(el.value, '100')

  // Home -> min (0)
  el._onHostKeyDown(makeKeyEvent('Home'))
  assert.equal(el.value, '0')
})

test('Wheel interaction steps value and dispatches input + change', () => {
  const el = new ScrollField()
  el.min = 0
  el.max = 59
  el.loop = true
  el.value = 0

  const events = []
  el.addEventListener('input', () => events.push('input'))
  el.addEventListener('change', () => events.push('change'))

  let prevented = false
  el._onScrollerWheel({
    deltaY: -48,
    deltaMode: 0,
    cancelable: true,
    isTrusted: false,
    preventDefault() {
      prevented = true
    },
  })

  assert.equal(prevented, true)
  assert.equal(el.value, '59')
  assert.deepEqual(events, ['input', 'change'])
})

test('Direct text input: click/digit opens editor, Enter/blur clamps & snaps, Escape cancels, IME-safe', () => {
  const el = new ScrollField()
  el.min = 10
  el.max = 100
  el.step = 5
  el.value = 25

  const events = []
  el.addEventListener('input', () => events.push(`input:${el.value}`))
  el.addEventListener('change', () => events.push(`change:${el.value}`))

  // 1. Clicking center item enters editing mode with formattedValue
  el._onItemClick({ stopPropagation() {} }, el.canonicalSlot, el.selectedIndex)
  assert.equal(el.editing, true)
  assert.equal(el._editDraft, '25')
  const editHtml = renderTemplateToString(el.render())
  assert.match(editHtml, /class="direct-input"/)
  assert.match(editHtml, /inputmode="numeric"/)

  // 2. Typing "43" and pressing IME-composing Enter does NOT commit prematurely
  el._onDirectInput({ target: { value: '43' } })
  el._onDirectKeyDown(makeKeyEvent('Enter', { isComposing: true }))
  assert.equal(el.editing, true)
  el._onDirectKeyDown(makeKeyEvent('Enter', { keyCode: 229 }))
  assert.equal(el.editing, true)

  // 3. Real Enter commits and snaps 43 -> 45 (nearest step of 5), firing input & change
  el._onDirectKeyDown(makeKeyEvent('Enter'))
  assert.equal(el.editing, false)
  assert.equal(el.value, '45')
  assert.deepEqual(events, ['input:45', 'change:45'])

  // 4. Typing digit key on focused spinbutton opens editing with that digit, Escape cancels
  el._onHostKeyDown(makeKeyEvent('9'))
  assert.equal(el.editing, true)
  assert.equal(el._editDraft, '9')
  el._onDirectInput({ target: { value: '99' } })
  el._onDirectKeyDown(makeKeyEvent('Escape'))
  assert.equal(el.editing, false)
  assert.equal(el.value, '45') // unchanged!
  assert.equal(events.length, 2) // no new events!

  // 5. Blur commits & clamps out-of-range value (999 -> 100)
  el.startEditing('999')
  el._onDirectBlur()
  assert.equal(el.editing, false)
  assert.equal(el.value, '100')
  assert.deepEqual(events, ['input:45', 'change:45', 'input:100', 'change:100'])

  // 6. Options mode prefix text matching ('p' -> 'PM')
  const period = new ScrollField()
  period.options = ['AM', 'PM']
  period.value = 'AM'
  period.startEditing('p')
  period.commitEditing()
  assert.equal(period.value, 'PM')

  // 7. readonly and no-text-input prevent opening editor
  el.readOnly = true
  assert.equal(el.startEditing(), false)
  el.readOnly = false
  el.noTextInput = true
  assert.equal(el.startEditing(), false)
})

test('Form-associated lifecycle: setFormValue, formResetCallback, formStateRestoreCallback, fieldset disabled', () => {
  const el = new ScrollField()
  let recordedFormValue = undefined
  let recordedValidity = null
  el._internals = {
    setFormValue(v) {
      recordedFormValue = v
    },
    setValidity(flags) {
      recordedValidity = flags
    },
    checkValidity() {
      return !recordedValidity || Object.keys(recordedValidity).length === 0
    },
  }
  el._supportsFormInternals = true

  el.setAttribute('value', '42')
  el.connectedCallback()
  assert.equal(el.value, '42')
  assert.equal(recordedFormValue, '42')

  el.value = '77'
  assert.equal(recordedFormValue, '77')

  // formDisabledCallback disables without mutating host disabled attribute
  el.formDisabledCallback(true)
  assert.equal(el.isDisabled, true)
  assert.equal(el.disabled, false)
  assert.equal(recordedFormValue, null)

  el.formDisabledCallback(false)
  assert.equal(el.isDisabled, false)
  assert.equal(recordedFormValue, '77')

  // formResetCallback restores initial attribute value
  el.formResetCallback()
  assert.equal(el.value, '42')
  assert.equal(recordedFormValue, '42')

  // formStateRestoreCallback restores saved state
  el.formStateRestoreCallback('64')
  assert.equal(el.value, '64')

  // Required + explicit empty triggers valueMissing validity
  el.required = true
  el.value = ''
  assert.equal(el.checkValidity(), false)
  assert.deepEqual(recordedValidity, { valueMissing: true })
})

function findBrowserBinary() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean)
  return candidates.find((p) => fs.existsSync(p)) || null
}

test('Live headless browser audit: demo/scroll-field-demo.html renders cleanly with zero console/page errors', async (t) => {
  const browserBin = findBrowserBinary()
  if (!browserBin || typeof WebSocket !== 'function') {
    t.skip('No headless Chromium binary or native WebSocket available')
    return
  }

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  }

  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, 'http://127.0.0.1')
    const safeRel = path.normalize(decodeURIComponent(reqUrl.pathname)).replace(/^(\.\.(\/|\\|$))+/, '')
    const filePath = path.join(repoRoot, safeRel)
    if (!filePath.startsWith(repoRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
    fs.createReadStream(filePath).pipe(res)
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md-scroll-field-cdp-'))

  const proc = spawn(
    browserBin,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )

  let ws = null
  try {
    const browserWsUrl = await new Promise((resolve, reject) => {
      let stderr = ''
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for DevTools WS: ${stderr}`)), 10000)
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
        const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/)
        if (match) {
          clearTimeout(timer)
          resolve(match[1])
        }
      })
      proc.once('exit', (code) => {
        clearTimeout(timer)
        reject(new Error(`Browser exited early with code ${code}`))
      })
    })

    ws = new WebSocket(browserWsUrl)
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true })
      ws.addEventListener('error', reject, { once: true })
    })

    let nextId = 1
    const pending = new Map()
    const exceptions = []
    const consoleErrors = []

    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(String(evt.data))
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
      } else if (msg.method === 'Runtime.exceptionThrown') {
        exceptions.push(msg.params.exceptionDetails?.text || 'Uncaught exception')
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
      }
    })

    const send = (method, params = {}, sessionId = undefined) =>
      new Promise((resolve, reject) => {
        const id = nextId++
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }))
      })

    const { targetInfos } = await send('Target.getTargets')
    const pageTarget = targetInfos.find((ti) => ti.type === 'page')
    const { sessionId } = await send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true })

    await send('Page.enable', {}, sessionId)
    await send('Runtime.enable', {}, sessionId)
    await send('Page.navigate', { url: `http://127.0.0.1:${port}/demo/scroll-field-demo.html` }, sessionId)

    const evalResult = await send(
      'Runtime.evaluate',
      {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          await customElements.whenDefined('md-scroll-field')
          await customElements.whenDefined('md-scroll-field-group')
          const fields = [...document.querySelectorAll('md-scroll-field')]
          await Promise.all(fields.map((f) => f.updateComplete))

          const s12 = document.getElementById('size-1-2')
          const s3 = document.getElementById('size-3')
          const s4 = document.getElementById('size-4')
          const widths = [s12, s3, s4].map((el) => Math.round(el.shadowRoot.querySelector('.spinbutton').getBoundingClientRect().width))
          const height = Math.round(s12.shadowRoot.querySelector('.spinbutton').getBoundingClientRect().height)

          // Verify ARIA spinbutton in real Shadow DOM
          const spin = s12.shadowRoot.querySelector('[role="spinbutton"]')
          const ariaNow = spin.getAttribute('aria-valuenow')
          const ariaText = spin.getAttribute('aria-valuetext')

          // Test loop wrap-around in browser
          const loopWheel = document.getElementById('loop-wheel')
          loopWheel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
          await loopWheel.updateComplete
          const wrappedVal = loopWheel.value

          // Test direct text input commit and cancel in browser
          const cadence = document.getElementById('form-cadence')
          cadence.shadowRoot.querySelector('.wheel-item.selected').click()
          await cadence.updateComplete
          const inputEl = cadence.shadowRoot.querySelector('input.direct-input')
          const openedEditor = Boolean(inputEl)
          inputEl.value = '184'
          inputEl.dispatchEvent(new Event('input', { bubbles: true }))
          inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
          await cadence.updateComplete
          const afterCommit = cadence.value

          cadence.startEditing('999')
          await cadence.updateComplete
          cadence.shadowRoot.querySelector('input.direct-input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
          await cadence.updateComplete
          const afterCancel = cadence.value

          // Test native FormData participation
          const formVal = new FormData(document.getElementById('demo-form')).get('cadence')

          return { count: fields.length, widths, height, ariaNow, ariaText, wrappedVal, openedEditor, afterCommit, afterCancel, formVal }
        })()`,
      },
      sessionId,
    )

    assert.deepEqual(exceptions, [], `Unexpected page exceptions: ${exceptions.join('; ')}`)
    assert.deepEqual(consoleErrors, [], `Unexpected console errors: ${consoleErrors.join('; ')}`)

    const data = evalResult.result.value
    assert.ok(data.count >= 14)
    assert.deepEqual(data.widths, [88, 116, 144])
    assert.equal(data.height, 144)
    assert.equal(data.ariaNow, '7')
    assert.equal(data.ariaText, '07')
    assert.equal(data.wrappedVal, '59')
    assert.equal(data.openedEditor, true)
    assert.equal(data.afterCommit, '184')
    assert.equal(data.afterCancel, '184')
    assert.equal(data.formVal, '184')
  } finally {
    try {
      ws?.close()
    } catch {}
    proc.kill()
    await new Promise((resolve) => server.close(resolve))
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true })
    } catch {}
  }
})
