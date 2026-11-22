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

const { Progress, getCircularWavyIndeterminateState, getWavyCirclePath, parseTimeMs } =
  await import('../indicators/progress.js')

/**
 * Parses top-level CSS rules (excluding @media / @keyframes) from Lit CSSResult styles.
 * @param {Array<{cssText: string}>} styles
 * @return {Map<string, Record<string, string>>}
 */
function stripAtRuleBlocks(cssText) {
  let out = ''
  let i = 0
  while (i < cssText.length) {
    if (cssText[i] === '@') {
      const braceIdx = cssText.indexOf('{', i)
      if (braceIdx === -1) break
      let depth = 1
      let j = braceIdx + 1
      while (j < cssText.length && depth > 0) {
        if (cssText[j] === '{') depth++
        else if (cssText[j] === '}') depth--
        j++
      }
      i = j
    } else {
      out += cssText[i]
      i++
    }
  }
  return out
}

function parseTopLevelRules(styles) {
  const cssText = styles
    .map((s) => s.cssText)
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  const withoutNestedAtRules = stripAtRuleBlocks(cssText)
  const rules = new Map()
  const ruleRegex = /([^{}]+)\{([^{}]*)\}/g

  for (const match of withoutNestedAtRules.matchAll(ruleRegex)) {
    const selector = match[1].trim().replace(/\s+/g, ' ')
    const body = match[2]
    const decls = rules.get(selector) ?? {}
    for (const part of body.split(';')) {
      const colonIdx = part.indexOf(':')
      if (colonIdx === -1) continue
      const prop = part.slice(0, colonIdx).trim()
      const value = part
        .slice(colonIdx + 1)
        .trim()
        .replace(/\s+/g, ' ')
      if (prop) {
        decls[prop] = value
      }
    }
    rules.set(selector, decls)
  }
  return rules
}

/**
 * Parses M L ... SVG path string into numeric [x, y] coordinate pairs.
 * @param {string} d
 * @return {Array<[number, number]>}
 */
function parsePathPoints(d) {
  const pts = []
  for (const m of d.matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)) {
    pts.push([Number(m[1]), Number(m[2])])
  }
  return pts
}

describe('md-progress wavy indicator speed & M3 Expressive motion', () => {
  const rules = parseTopLevelRules(Progress.styles)
  const rawCss = Progress.styles.map((s) => s.cssText).join('\n')

  it('registers md-progress custom element with 1500ms default circular wave duration', () => {
    assert.equal(globalThis.customElements.get('md-progress'), Progress)
    const el = new Progress()
    assert.equal(el._waveDurationMs, 1500)
  })

  it('parses CSS time tokens via parseTimeMs', () => {
    assert.equal(parseTimeMs('1.5s', 1000), 1500)
    assert.equal(parseTimeMs('2s', 1000), 2000)
    assert.equal(parseTimeMs('750ms', 1000), 750)
    assert.equal(parseTimeMs('0s', 1500), 0)
    assert.equal(parseTimeMs('0ms', 1500), 0)
    assert.equal(parseTimeMs('', 1500), 1500)
    assert.equal(parseTimeMs('invalid', 1500), 1500)
    assert.equal(parseTimeMs('-2s', 1500), 1500)
  })

  it('follows the 6000ms M3 Expressive circular wavy indeterminate cycle without wrap discontinuities', () => {
    const start = getCircularWavyIndeterminateState(0, false)
    const mid = getCircularWavyIndeterminateState(3000, false)
    const nearEnd = getCircularWavyIndeterminateState(5999.9, false)
    const wrapped = getCircularWavyIndeterminateState(6000, false)

    assert.ok(Math.abs(start.startAngle) < 1e-6)
    assert.ok(Math.abs(start.sweepAngle - 0.1 * Math.PI * 2) < 1e-6)
    assert.ok(Math.abs(mid.sweepAngle - 0.87 * Math.PI * 2) < 1e-6)

    // Seamless wrap at 6000ms (1080deg global + 360deg stepped = 1440deg === 0 mod 360)
    const endStartAngle = nearEnd.startAngle > Math.PI ? nearEnd.startAngle - Math.PI * 2 : nearEnd.startAngle
    assert.ok(Math.abs(endStartAngle - wrapped.startAngle) < 0.01)
    assert.ok(Math.abs(nearEnd.sweepAngle - wrapped.sweepAngle) < 0.01)

    // Monotonic expand in first 3000ms and monotonic contract in second 3000ms
    let prevSweep = start.sweepAngle
    for (let t = 250; t <= 3000; t += 250) {
      const { sweepAngle } = getCircularWavyIndeterminateState(t, false)
      assert.ok(sweepAngle >= prevSweep - 1e-6, `expected sweep growth at ${t}ms`)
      prevSweep = sweepAngle
    }
    for (let t = 3250; t <= 6000; t += 250) {
      const { sweepAngle } = getCircularWavyIndeterminateState(t === 6000 ? 5999.99 : t, false)
      assert.ok(sweepAngle <= prevSweep + 1e-6, `expected sweep shrink at ${t}ms`)
      prevSweep = sweepAngle
    }

    // Reduced motion drops arc expansion/contraction and uses a fixed 90deg arc over 6s
    const reducedMid = getCircularWavyIndeterminateState(1500, true)
    assert.ok(Math.abs(reducedMid.sweepAngle - Math.PI * 0.5) < 1e-6)
    assert.ok(Math.abs(reducedMid.startAngle - Math.PI * 0.5) < 1e-6)
  })

  it('anchors circular wave phase to the arc startAngle so rotation does not multiply ripple speed', () => {
    const cx = 24
    const cy = 24
    const r = 18.4
    const amp = 1.6
    const freq = 8
    const phase = 0.9
    const sweep = Math.PI * 0.8
    const delta = 1.15

    const pts0 = parsePathPoints(getWavyCirclePath(cx, cy, r, amp, freq, phase, 0, sweep))
    const ptsRot = parsePathPoints(getWavyCirclePath(cx, cy, r, amp, freq, phase, delta, sweep))

    assert.equal(pts0.length, ptsRot.length)
    assert.ok(pts0.length > 16)

    const cosD = Math.cos(delta)
    const sinD = Math.sin(delta)
    for (let i = 0; i < pts0.length; i++) {
      const dx = pts0[i][0] - cx
      const dy = pts0[i][1] - cy
      const expectedX = cx + dx * cosD - dy * sinD
      const expectedY = cy + dx * sinD + dy * cosD
      assert.ok(Math.abs(ptsRot[i][0] - expectedX) < 0.03, `point ${i} x mismatch`)
      assert.ok(Math.abs(ptsRot[i][1] - expectedY) < 0.03, `point ${i} y mismatch`)
    }
  })

  it('stops circular RAF loop when determinate wave duration is 0s while rendering static wave', () => {
    const el = new Progress()
    el.type = 'circular'
    el.shape = 'wavy'
    el.value = 0.6
    el._waveDurationMs = 0

    const attrs = new Map()
    el.renderRoot = {
      querySelector(sel) {
        if (sel === '.active-track.wavy-circle') {
          return {
            setAttribute(k, v) {
              attrs.set(k, v)
            },
          }
        }
        return null
      },
    }

    el._updateWavyAnimationState()
    assert.equal(el._wavyAnimationActive, false)
    assert.ok((attrs.get('d') ?? '').startsWith('M '), 'expected static wavy path to be rendered')
    assert.equal(attrs.get('opacity'), '1')
  })

  it('anchors indeterminate wavy linear mask in track coordinates (100cqi) and uses M3 wave durations', () => {
    const linearContainer = rules.get('.linear.progress')
    assert.ok(linearContainer, 'expected .linear.progress rule')
    assert.equal(linearContainer['container-type'], 'inline-size')

    const wavyHost = rules.get(":host([shape='wavy'][type='linear'])")
    assert.ok(wavyHost, 'expected wavy linear host rule')
    assert.ok(wavyHost['--_wave-duration'].includes('2s'))
    assert.ok(wavyHost['--_indeterminate-wave-duration'].includes('1.5s'))
    assert.equal(wavyHost['--_used-wave-duration'], 'var(--_wave-duration)')

    const indetRoot = rules.get('.linear.progress.indeterminate.registered-props')
    assert.ok(indetRoot, 'expected registered-props indeterminate rule')
    assert.ok(indetRoot['animation'].includes('1750ms'))

    const primaryInner = rules.get('.linear.progress.wavy.indeterminate.registered-props .primary-bar .bar-inner')
    const secondaryInner = rules.get('.linear.progress.wavy.indeterminate.registered-props .secondary-bar .bar-inner')
    assert.ok(primaryInner, 'expected track-anchored primary bar-inner rule')
    assert.ok(secondaryInner, 'expected track-anchored secondary bar-inner rule')
    assert.ok(primaryInner['inset'].includes('var(--_l1-tail) * -100cqi'))
    assert.ok(secondaryInner['inset'].includes('var(--_l2-tail) * -100cqi'))
    assert.equal(primaryInner['width'], 'calc(100cqi + var(--_wavelength) * 2)')

    // Reduced motion slows positive wave durations to >=6s while preserving 0s static waves via sign()
    assert.match(
      rawCss,
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?calc\(sign\(var\(--_wave-duration\)\)\s*\*\s*max\(6s,\s*var\(--_wave-duration\)\)\)/,
    )
  })
})
