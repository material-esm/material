import { html, css, LitElement } from 'lit'

// --- Spring Physics Engine ---
class Spring {
  constructor(stiffness, dampingRatio) {
    this.k = stiffness
    this.c = dampingRatio * 2 * Math.sqrt(stiffness)
    this.pos = 0
    this.vel = 0
    this.target = 0
  }
  step(dt) {
    const SUB_STEPS = 12
    const sub = dt / SUB_STEPS
    for (let i = 0; i < SUB_STEPS; i++) {
      const accel = -this.k * (this.pos - this.target) - this.c * this.vel
      this.vel += accel * sub
      this.pos += this.vel * sub
    }
  }
  reset() {
    this.pos = 0
    this.vel = 0
    this.target = 0
  }
}

// --- Shape Definitions and Geometry Math ---
const SHAPE_COUNT = 7
const SAMPLES_PER_CURVE = 14
const POINTS_PER_SHAPE = 180
const SVG_DEFS = [
  // 0: SOFT_BURST (144×144)
  {
    viewBox: 144,
    d: "M65.3162 3.5567C68.3922 -1.18556 75.6078 -1.18557 78.6837 3.55669L86.0569 14.9241C88.0791 18.0418 92.1588 19.3094 95.7112 17.9237L108.664 12.8715C114.067 10.7638 119.905 14.8195 119.478 20.3849L118.456 33.7255C118.175 37.3845 120.697 40.7029 124.422 41.5786L138.007 44.7714C143.674 46.1033 145.903 52.6655 142.137 56.9283L133.11 67.1465C130.634 69.9491 130.634 74.0509 133.11 76.8535L142.137 87.0716C145.903 91.3345 143.674 97.8967 138.007 99.2286L124.422 102.421C120.697 103.297 118.175 106.616 118.456 110.274L119.478 123.615C119.905 129.181 114.067 133.236 108.664 131.129L95.7112 126.076C92.1588 124.691 88.0791 125.958 86.0569 129.076L78.6838 140.443C75.6078 145.186 68.3922 145.186 65.3162 140.443L57.9431 129.076C55.9208 125.958 51.8412 124.691 48.2888 126.076L35.3365 131.129C29.933 133.236 24.0954 129.181 24.5219 123.615L25.5442 110.274C25.8246 106.616 23.3033 103.297 19.5775 102.421L5.99339 99.2286C0.326335 97.8967 -1.90342 91.3345 1.86259 87.0717L10.8899 76.8535C13.3658 74.0509 13.3658 69.9491 10.8899 67.1465L1.8626 56.9283C-1.90341 52.6655 0.326326 46.1033 5.99338 44.7714L19.5775 41.5786C23.3033 40.7029 25.8246 37.3845 25.5442 33.7255L24.5219 20.3849C24.0954 14.8195 29.933 10.7638 35.3364 12.8715L48.2888 17.9237C51.8412 19.3094 55.9208 18.0418 57.9431 14.9241L65.3162 3.5567Z",
  },
  // 1: COOKIE_9 (144×144)
  {
    viewBox: 144,
    d: "M56.3679 6.02002C57.1442 5.3783 57.5324 5.05744 57.8867 4.78656C66.2354 -1.59552 77.7646 -1.59552 86.1133 4.78656C86.4676 5.05744 86.8558 5.3783 87.6321 6.02002C87.9786 6.30648 88.1519 6.44971 88.3233 6.58606C92.2522 9.71203 97.0693 11.4835 102.068 11.6405C102.286 11.6473 102.51 11.6501 102.957 11.6558C103.96 11.6684 104.462 11.6747 104.906 11.6973C115.361 12.2303 124.193 19.7179 126.528 30.0289C126.627 30.4666 126.721 30.9644 126.907 31.9602C126.99 32.4047 127.032 32.627 127.076 32.8427C128.097 37.789 130.661 42.2744 134.39 45.6409C134.552 45.7878 134.722 45.9353 135.062 46.2304C135.822 46.8914 136.202 47.2219 136.528 47.5275C144.198 54.7262 146.2 66.1979 141.429 75.6132C141.227 76.0128 140.981 76.4547 140.49 77.3386C140.271 77.7332 140.162 77.9304 140.059 78.1246C137.694 82.5768 136.804 87.6775 137.519 92.6782C137.55 92.8964 137.586 93.1196 137.658 93.5661C137.82 94.5662 137.901 95.0663 137.956 95.5117C139.252 106.008 133.488 116.096 123.843 120.21C123.434 120.385 122.965 120.564 122.026 120.922C121.608 121.082 121.398 121.162 121.196 121.244C116.552 123.119 112.625 126.448 109.991 130.743C109.876 130.93 109.762 131.125 109.533 131.514C109.021 132.385 108.765 132.821 108.523 133.198C102.839 142.08 92.0048 146.064 81.9992 142.952C81.5745 142.82 81.1011 142.652 80.1544 142.318C79.7318 142.168 79.5205 142.094 79.3133 142.025C74.5631 140.445 69.4369 140.445 64.6867 142.025C64.4795 142.094 64.2682 142.168 63.8456 142.318C62.8989 142.652 62.4255 142.82 62.0008 142.952C51.9952 146.064 41.1613 142.08 35.4766 133.198C35.2353 132.821 34.9791 132.385 34.4669 131.514C34.2382 131.125 34.1239 130.93 34.009 130.743C31.3752 126.448 27.4482 123.119 22.8044 121.244C22.6018 121.162 22.3924 121.082 21.9736 120.922C21.0354 120.564 20.5663 120.385 20.1569 120.21C10.5122 116.096 4.74763 106.008 6.04367 95.5117C6.09868 95.0663 6.17963 94.5662 6.34151 93.5661C6.41377 93.1196 6.4499 92.8964 6.48109 92.6783C7.19603 87.6775 6.30587 82.5768 3.94121 78.1246C3.83807 77.9304 3.72855 77.7332 3.50951 77.3386C3.01883 76.4547 2.77349 76.0128 2.57099 75.6132C-2.19995 66.1979 -0.197931 54.7262 7.47248 47.5275C7.79804 47.2219 8.17819 46.8914 8.93848 46.2304C9.27787 45.9353 9.44757 45.7878 9.61023 45.6409C13.3394 42.2744 15.9025 37.789 16.9235 32.8427C16.9681 32.627 17.0097 32.4047 17.0929 31.9602C17.2793 30.9644 17.3725 30.4666 17.4717 30.0289C19.8069 19.7179 28.6387 12.2303 39.0944 11.6973C39.5382 11.6747 40.0397 11.6684 41.0426 11.6558C41.4903 11.6501 41.7142 11.6473 41.9322 11.6405C46.9307 11.4835 51.7478 9.71203 55.6767 6.58606C55.8481 6.44971 56.0214 6.30648 56.3679 6.02002Z",
  },
  // 2: PENTAGON (144×144)
  {
    viewBox: 144,
    d: "M49.3332 10.9681C56.3577 5.53061 59.8699 2.81189 63.6224 1.46315C69.0501 -0.487717 74.9499 -0.487717 80.3776 1.46315C84.1301 2.81189 87.6423 5.53062 94.6668 10.9681L110.03 22.8606L125.386 34.0038C132.67 39.2902 136.313 41.9334 138.747 45.2576C142.27 50.0661 144.119 55.9761 143.994 62.0207C143.907 66.1996 142.46 70.5678 139.564 79.3044L133.535 97.4958L127.969 116.136C125.358 124.884 124.052 129.258 121.769 132.66C118.466 137.581 113.667 141.201 108.144 142.936C104.327 144.135 99.9259 144.065 91.1241 143.926L72 143.623L52.8759 143.926C44.0741 144.065 39.6732 144.135 35.8555 142.936C30.3334 141.201 25.5338 137.581 22.2314 132.66C19.9483 129.258 18.6425 124.884 16.0307 116.136L10.4655 97.4958L4.43609 79.3044C1.54044 70.5678 0.0926215 66.1996 0.00597479 62.0207C-0.119358 55.9761 1.73035 50.0661 5.2525 45.2576C7.68747 41.9334 11.3298 39.2902 18.6143 34.0038L33.9696 22.8606L49.3332 10.9681Z",
  },
  // 3: PILL (144×144) — rotated rounded diamond
  {
    viewBox: 144,
    d: "M40.4355 21.4968C63.0979 -1.16559 99.8408 -1.16559 122.503 21.4968C145.166 44.1592 145.166 80.9021 122.503 103.565L103.565 122.503C80.9021 145.166 44.1592 145.166 21.4968 122.503C-1.16559 99.8408 -1.1656 63.0979 21.4968 40.4355L40.4355 21.4968Z",
  },
  // 4: SUNNY (153×153)
  {
    viewBox: 153,
    d: "M117.835 18.5569C122.594 18.8803 124.973 19.0419 126.896 19.883C129.679 21.0999 131.9 23.3213 133.117 26.1039C133.958 28.027 134.12 30.4062 134.443 35.1647L135.181 46.0237C135.312 47.9482 135.377 48.9105 135.586 49.8297C135.889 51.1579 136.414 52.4254 137.139 53.5784C137.641 54.3763 138.275 55.1029 139.544 56.5563L146.7 64.7565C149.837 68.3499 151.405 70.1466 152.17 72.1011C153.277 74.9292 153.277 78.0708 152.17 80.8989C151.405 82.8534 149.837 84.6501 146.7 88.2435L139.544 96.4437C138.275 97.8971 137.641 98.6237 137.139 99.4217C136.414 100.575 135.889 101.842 135.586 103.17C135.377 104.09 135.312 105.052 135.181 106.976L134.443 117.835C134.12 122.594 133.958 124.973 133.117 126.896C131.9 129.679 129.679 131.9 126.896 133.117C124.973 133.958 122.594 134.12 117.835 134.443L106.976 135.181C105.052 135.312 104.09 135.377 103.17 135.586C101.842 135.889 100.575 136.414 99.4217 137.139C98.6237 137.641 97.8971 138.275 96.4437 139.544L88.2435 146.7C84.6501 149.837 82.8534 151.405 80.8989 152.17C78.0708 153.277 74.9292 153.277 72.1011 152.17C70.1466 151.405 68.3499 149.837 64.7565 146.7L56.5563 139.544C55.1029 138.275 54.3763 137.641 53.5784 137.139C52.4254 136.414 51.1579 135.889 49.8297 135.586C48.9105 135.377 47.9482 135.312 46.0237 135.181L35.1647 134.443C30.4062 134.12 28.027 133.958 26.1039 133.117C23.3213 131.9 21.0999 129.679 19.883 126.896C19.0419 124.973 18.8803 122.594 18.5569 117.835L17.819 106.976C17.6882 105.052 17.6228 104.09 17.4136 103.17C17.1113 101.842 16.5863 100.575 15.8608 99.4217C15.3588 98.6237 14.7246 97.8971 13.4562 96.4437L6.29956 88.2435C3.16348 84.6501 1.59544 82.8534 0.830322 80.8989C-0.276774 78.0708 -0.276774 74.9292 0.830323 72.1011C1.59544 70.1466 3.16348 68.3499 6.29956 64.7565L13.4562 56.5563C14.7246 55.1029 15.3588 54.3763 15.8608 53.5784C16.5863 52.4254 17.1113 51.1579 17.4136 49.8297C17.6228 48.9105 17.6882 47.9482 17.819 46.0237L18.5569 35.1647C18.8803 30.4062 19.0419 28.027 19.883 26.1039C21.0999 23.3213 23.3213 21.0999 26.1039 19.883C28.027 19.0419 30.4062 18.8803 35.1647 18.5569L46.0237 17.819C47.9482 17.6882 48.9105 17.6228 49.8297 17.4136C51.1579 17.1113 52.4254 16.5863 53.5784 15.8608C54.3763 15.3588 55.1029 14.7246 56.5563 13.4562L64.7565 6.29957C68.3499 3.16348 70.1466 1.59544 72.1011 0.830323C74.9292 -0.276774 78.0708 -0.276774 80.8989 0.830323C82.8534 1.59544 84.6501 3.16348 88.2435 6.29957L96.4437 13.4562C97.8971 14.7246 98.6237 15.3588 99.4216 15.8608C100.575 16.5863 101.842 17.1113 103.17 17.4136C104.09 17.6228 105.052 17.6882 106.976 17.819L117.835 18.5569Z",
  },
  // 5: COOKIE_4 (144×144)
  {
    viewBox: 144,
    d: "M89.4282 11.7931C116.492 0.0387955 143.961 27.5077 132.207 54.5718L130.263 59.0465C126.675 67.3094 126.675 76.6907 130.263 84.9535L132.207 89.4282C143.961 116.492 116.492 143.961 89.4282 132.207L84.9535 130.263C76.6907 126.675 67.3093 126.675 59.0465 130.263L54.5718 132.207C27.5077 143.961 0.0387983 116.492 11.7931 89.4282L13.7366 84.9535C17.3253 76.6907 17.3252 67.3093 13.7366 59.0465L11.7931 54.5718C0.0387955 27.5077 27.5077 0.0387993 54.5718 11.7931L59.0465 13.7366C67.3094 17.3252 76.6907 17.3252 84.9535 13.7366L89.4282 11.7931Z",
  },
  // 6: OVAL (generated dynamically)
  null,
]

function parseSVGPath(d) {
  const cmds = []
  const re = /([MCLZmclz])([^MCLZmclz]*)/g
  let m
  while ((m = re.exec(d)) !== null) {
    const nums = m[2].trim().match(/-?\d+\.?\d*(?:e[+-]?\d+)?/g)
    cmds.push({ cmd: m[1], args: nums ? nums.map(Number) : [] })
  }
  return cmds
}

function sampleCubic(p0, p1, p2, p3, steps) {
  const out = []
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ])
  }
  return out
}

function svgPathToPoints(d) {
  const cmds = parseSVGPath(d)
  const pts = []
  let cx = 0, cy = 0
  for (const { cmd, args } of cmds) {
    if (cmd === "M") {
      cx = args[0]
      cy = args[1]
      pts.push([cx, cy])
    } else if (cmd === "L") {
      for (let i = 0; i < args.length; i += 2) {
        cx = args[i]
        cy = args[i + 1]
        pts.push([cx, cy])
      }
    } else if (cmd === "C") {
      for (let i = 0; i < args.length; i += 6) {
        const p0 = [cx, cy]
        const p1 = [args[i], args[i + 1]]
        const p2 = [args[i + 2], args[i + 3]]
        const p3 = [args[i + 4], args[i + 5]]
        pts.push(...sampleCubic(p0, p1, p2, p3, SAMPLES_PER_CURVE))
        cx = p3[0]
        cy = p3[1]
      }
    }
  }
  return pts
}

function normalize(pts, viewBox) {
  const h = viewBox / 2
  const c = pts.map(([x, y]) => [(x - h) / h, (y - h) / h])
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (const [x, y] of c) {
    if (x < x0) x0 = x
    if (x > x1) x1 = x
    if (y < y0) y0 = y
    if (y > y1) y1 = y
  }
  const s = Math.min(2 / (x1 - x0), 2 / (y1 - y0))
  const ox = (x0 + x1) / 2, oy = (y0 + y1) / 2
  return c.map(([x, y]) => [(x - ox) * s, (y - oy) * s])
}

function resample(pts, n) {
  const all = [...pts, pts[0]]
  const arc = [0]
  for (let i = 1; i < all.length; i++) {
    const dx = all[i][0] - all[i - 1][0]
    const dy = all[i][1] - all[i - 1][1]
    arc.push(arc[i - 1] + Math.sqrt(dx * dx + dy * dy))
  }
  const total = arc[arc.length - 1]
  const out = []
  for (let i = 0; i < n; i++) {
    const target = i / n * total
    let j = 1
    while (j < arc.length - 1 && arc[j] < target) j++
    const t = arc[j] > arc[j - 1] ? (target - arc[j - 1]) / (arc[j] - arc[j - 1]) : 0
    out.push([
      all[j - 1][0] + t * (all[j][0] - all[j - 1][0]),
      all[j - 1][1] + t * (all[j][1] - all[j - 1][1]),
    ])
  }
  return out
}

function generateOval(n) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const theta = i / n * 2 * Math.PI
    pts.push([Math.cos(theta), 0.74 * Math.sin(theta)])
  }
  return pts
}

let _shapes = null
function getShapes() {
  if (_shapes) return _shapes
  _shapes = SVG_DEFS.map((def) => {
    if (def === null) return generateOval(POINTS_PER_SHAPE)
    const raw = svgPathToPoints(def.d)
    const norm = normalize(raw, def.viewBox)
    return resample(norm, POINTS_PER_SHAPE)
  })
  return _shapes
}

function lerpShapes(a, b, t) {
  const out = new Array(a.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = [
      a[i][0] + (b[i][0] - a[i][0]) * t,
      a[i][1] + (b[i][1] - a[i][1]) * t,
    ]
  }
  return out
}

function getMorphedShape(morphFraction) {
  const shapes = getShapes()
  const idx = Math.floor(morphFraction)
  const from = (idx % SHAPE_COUNT + SHAPE_COUNT) % SHAPE_COUNT
  const to = (from + 1) % SHAPE_COUNT
  const t = Math.max(0, Math.min(1, morphFraction - idx))
  return lerpShapes(shapes[from], shapes[to], t)
}

// --- Animator State Machine ---
const DURATION_PER_SHAPE_MS = 650
const CONSTANT_ROTATION_DEG = 50
const EXTRA_ROTATION_DEG = 90
const DEFAULT_SPRING_STIFFNESS = 200
const DEFAULT_SPRING_DAMPING = 0.6

class M3Animator {
  constructor(stiffness = DEFAULT_SPRING_STIFFNESS, damping = DEFAULT_SPRING_DAMPING) {
    this.morphTarget = 1
    this.fraction = 0
    this.elapsed = 0
    this.lastTs = 0
    this.prevCycle = 0
    this.speed = 1
    this.paused = false
    this.rotation = 0
    this.morph = 0
    this.spring = new Spring(stiffness, damping)
    this.spring.target = 1
  }
  update(ts) {
    if (this.paused) {
      this.lastTs = ts
      return
    }
    if (this.lastTs === 0) this.lastTs = ts
    const rawDt = Math.min((ts - this.lastTs) / 1e3, 0.1)
    const dt = rawDt * this.speed
    this.lastTs = ts
    if (isNaN(dt) || !isFinite(dt) || dt <= 0) return
    this.elapsed += dt * 1e3
    const cycle = Math.floor(this.elapsed / DURATION_PER_SHAPE_MS)
    if (cycle > this.prevCycle) {
      this.morphTarget += cycle - this.prevCycle
      this.spring.target = this.morphTarget
      this.prevCycle = cycle
    }
    this.fraction = (this.elapsed % DURATION_PER_SHAPE_MS) / DURATION_PER_SHAPE_MS
    this.spring.step(dt)
    const base = this.morphTarget - 1
    const perShape = this.spring.pos - base
    this.rotation = ((CONSTANT_ROTATION_DEG + EXTRA_ROTATION_DEG) * base + CONSTANT_ROTATION_DEG * this.fraction + EXTRA_ROTATION_DEG * perShape) % 360
    this.morph = this.spring.pos
  }
  reset() {
    this.morphTarget = 1
    this.fraction = 0
    this.elapsed = 0
    this.lastTs = 0
    this.prevCycle = 0
    this.spring.reset()
    this.spring.target = 1
    this.rotation = 0
    this.morph = 0
  }
}

// --- Canvas Drawing Utilities ---
function drawIndicator(ctx, cssSize, points, rotation, options) {
  const ratio = options.sizeRatio ?? 0.79
  const indicatorSize = cssSize * ratio
  const cx = cssSize / 2
  const cy = cssSize / 2
  const scale = indicatorSize / 2
  ctx.clearRect(0, 0, cssSize, cssSize)
  if (options.contained) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, cssSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = options.containerColor ?? "rgba(0,0,0,0.08)"
    ctx.fill()
    ctx.restore()
  }
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.beginPath()
  for (let i = 0; i <= points.length; i++) {
    const [px, py] = points[i % points.length]
    if (i === 0) ctx.moveTo(px * scale, py * scale)
    else ctx.lineTo(px * scale, py * scale)
  }
  ctx.closePath()
  ctx.fillStyle = options.color
  ctx.fill()
  ctx.restore()
}

function setupCanvas(canvas, cssSize) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const px = Math.round(cssSize * dpr)
  canvas.width = px
  canvas.height = px
  canvas.style.width = `${cssSize}px`
  canvas.style.height = `${cssSize}px`
  const ctx = canvas.getContext("2d")
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
  return ctx
}

// --- Web Component Implementation ---
export class Loading extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      position: relative;
      align-items: center;
      justify-content: center;
      contain: strict;
      content-visibility: auto;
      width: var(--md-loading-size, 48px);
      height: var(--md-loading-size, 48px);
    }
    canvas {
      display: block;
    }
  `

  static properties = {
    size: { type: Number },
    color: { type: String },
    contained: { type: Boolean },
    containerColor: { type: String, attribute: 'container-color' },
    speed: { type: Number },
    paused: { type: Boolean },
    sizeRatio: { type: Number, attribute: 'size-ratio' },
  }

  constructor() {
    super()
    this.size = 48
    this.color = 'var(--md-sys-color-primary, #6750a4)'
    this.contained = false
    this.containerColor = 'var(--md-sys-color-surface-container-high, rgba(0, 0, 0, 0.08))'
    this.speed = 1
    this.paused = false
    this.sizeRatio = 0.79

    this.rafId = 0
    this.ctx = null
    this.animator = new M3Animator()
    this.resolvedColor = '#6750a4'
    this.resolvedContainerColor = 'rgba(0, 0, 0, 0.08)'
    this.frameCount = 0
  }

  render() {
    return html`
      <canvas id="canvas" aria-label="Loading"></canvas>
    `
  }

  updateResolvedColors() {
    this.resolvedColor = this._resolveColor(this.color)
    this.resolvedContainerColor = this._resolveColor(this.containerColor)
  }

  startAnimation() {
    if (this.paused) return
    if (this.rafId) return
    const canvas = this.renderRoot?.querySelector('#canvas')
    if (!canvas) return
    if (!this.ctx) {
      this.ctx = setupCanvas(canvas, this.size)
    }
    this.animator.lastTs = 0

    const loop = (ts) => {
      this.animator.speed = this.speed
      this.animator.paused = this.paused
      this.animator.update(ts)
      const shape = getMorphedShape(this.animator.morph)

      this.frameCount++
      if (this.frameCount % 60 === 0) {
        this.updateResolvedColors()
      }

      drawIndicator(this.ctx, this.size, shape, this.animator.rotation, {
        color: this.resolvedColor,
        sizeRatio: this.sizeRatio,
        contained: this.contained,
        containerColor: this.resolvedContainerColor
      })
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  stopAnimation() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.startAnimation()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopAnimation()
  }

  firstUpdated() {
    this.updateResolvedColors()
    this.startAnimation()
  }

  updated(changedProperties) {
    if (changedProperties.has('size')) {
      this.style.setProperty('--md-loading-size', `${this.size}px`)
      const canvas = this.renderRoot.querySelector('#canvas')
      if (canvas) {
        this.ctx = setupCanvas(canvas, this.size)
      }
    }
    if (changedProperties.has('color') || changedProperties.has('containerColor') || changedProperties.has('contained')) {
      this.updateResolvedColors()
    }
    if (changedProperties.has('paused')) {
      if (this.paused) {
        this.stopAnimation()
      } else {
        this.startAnimation()
      }
    }
  }

  _resolveColor(colorString, depth = 0) {
    if (depth > 5) return '#6750a4'
    if (!colorString) return '#6750a4'
    const trimmed = colorString.trim()
    const windowExists = typeof window !== 'undefined'
    if (trimmed === 'currentColor') {
      return (windowExists ? window.getComputedStyle(this).color : '') || '#6750a4'
    }
    if (trimmed.startsWith('var(') && trimmed.endsWith(')')) {
      const content = trimmed.substring(4, trimmed.length - 1).trim()
      const commaIdx = content.indexOf(',')
      if (commaIdx === -1) {
        const varName = content.trim()
        const val = windowExists ? window.getComputedStyle(this).getPropertyValue(varName).trim() : ''
        return val ? this._resolveColor(val, depth + 1) : '#6750a4'
      } else {
        const varName = content.substring(0, commaIdx).trim()
        const fallback = content.substring(commaIdx + 1).trim()
        const val = windowExists ? window.getComputedStyle(this).getPropertyValue(varName).trim() : ''
        return val ? this._resolveColor(val, depth + 1) : this._resolveColor(fallback, depth + 1)
      }
    }
    if (trimmed.startsWith('--')) {
      const val = windowExists ? window.getComputedStyle(this).getPropertyValue(trimmed).trim() : ''
      return val ? this._resolveColor(val, depth + 1) : '#6750a4'
    }
    return trimmed
  }
}

customElements.define('md-loading', Loading)
