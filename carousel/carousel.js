/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { html, LitElement, nothing, css } from 'lit'
import { isRtl } from '../internal/controller/is-rtl.js'
import { queryAssignedElements } from '../utils/query.js'
import '../icon/icon.js'
import '../internal/elevation/elevation.js'
import '../internal/focus/focus-ring.js'
import '../internal/ripple/ripple.js'
import './carousel-item.js'

/**
 * A Material 3 Carousel component supporting multi-browse, uncontained, hero,
 * centered-hero, and full-screen layout strategies.
 *
 * https://m3.material.io/components/carousel/overview
 *
 * @fires change {CustomEvent<{index: number, item: CarouselItem}>} Dispatched when the active item changes.
 * @fires scroll {Event} Dispatched when the carousel is scrolled.
 */
export class Carousel extends LitElement {
  static properties = {
    layout: { type: String, reflect: true },
    itemWidth: { type: String, attribute: 'item-width', reflect: true },
    itemSpacing: { type: Number, attribute: 'item-spacing', reflect: true },
    navigation: { type: String, reflect: true }, // 'auto' | 'always' | 'none'
    indicators: { type: Boolean, reflect: true },
    autoplay: { type: Number },
    loop: { type: Boolean, reflect: true },
    activeIndex: { type: Number, attribute: 'active-index', reflect: true },
    scrollSnap: { type: Boolean, attribute: 'scroll-snap', reflect: true },
    hideScrollbar: { type: Boolean, attribute: 'hide-scrollbar', reflect: true },
    ariaLabel: { type: String, attribute: 'aria-label' },
    _canScrollPrev: { state: true },
    _canScrollNext: { state: true },
  }

  constructor() {
    super()
    this.layout = 'multi-browse'
    this.itemWidth = ''
    this.itemSpacing = 8
    this.navigation = 'auto'
    this.indicators = false
    this.autoplay = 0
    this.loop = false
    this.activeIndex = 0
    this.scrollSnap = true
    this.hideScrollbar = true
    this.ariaLabel = 'Carousel'
    this._canScrollPrev = false
    this._canScrollNext = true

    this._resizeObserver = null
    this._autoplayTimer = null
    this._isPointerDown = false
    this._startX = 0
    this._startScrollLeft = 0
    this._hasDragged = false

    this._handleScroll = this._handleScroll.bind(this)
    this._handleKeyDown = this._handleKeyDown.bind(this)
    this._onPointerDown = this._onPointerDown.bind(this)
    this._onPointerMove = this._onPointerMove.bind(this)
    this._onPointerUp = this._onPointerUp.bind(this)
    this._onPointerCancel = this._onPointerCancel.bind(this)
  }

  get items() {
    return queryAssignedElements(this, { flatten: true, selector: '[md-carousel-item], md-carousel-item' })
  }

  get scrollerElement() {
    return this.renderRoot?.querySelector('.scroller')
  }

  get activeItem() {
    return this.items[this.activeIndex] ?? null
  }

  get canScrollPrev() {
    return this.loop || this._canScrollPrev
  }

  get canScrollNext() {
    return this.loop || this._canScrollNext
  }

  connectedCallback() {
    super.connectedCallback()

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        this._updateLayout()
        this._updateScrollState()
      })
      this._resizeObserver.observe(this)
    }

    this.addEventListener('keydown', this._handleKeyDown)
    this._startAutoplay()
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }

    this.removeEventListener('keydown', this._handleKeyDown)
    this._stopAutoplay()
  }

  firstUpdated() {
    this._updateLayout()
    this._updateScrollState()
    this._syncActiveItem()
  }

  updated(changedProperties) {
    if (changedProperties.has('layout') || changedProperties.has('itemWidth') || changedProperties.has('itemSpacing')) {
      this._updateLayout()
      this._updateScrollState()
    }

    if (changedProperties.has('autoplay')) {
      this._startAutoplay()
    }

    if (changedProperties.has('activeIndex') && changedProperties.get('activeIndex') !== undefined) {
      this._applyItemSizes()
      this._syncActiveItem()
    }
  }

  render() {
    const isRtlMode = isRtl(this, false)
    const showNav = this.navigation !== 'none'
    const itemCount = this.items.length

    return html`
      <div
        class="carousel-container"
        @mouseenter=${this._pauseAutoplay}
        @mouseleave=${this._resumeAutoplay}
        @focusin=${this._pauseAutoplay}
        @focusout=${this._resumeAutoplay}>
        <div
          class="scroller"
          role="region"
          aria-roledescription="carousel"
          aria-label=${this.ariaLabel}
          tabindex="0"
          @scroll=${this._handleScroll}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerCancel}>
          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>

        ${showNav
          ? html`
              <button
                class="nav-button prev ${!this.canScrollPrev ? 'disabled' : ''}"
                ?disabled=${!this.canScrollPrev}
                @click=${this.previous}
                aria-label="Previous item"
                tabindex="-1">
                <md-elevation></md-elevation>
                <md-ripple></md-ripple>
                <md-focus-ring></md-focus-ring>
                <md-icon>${isRtlMode ? 'chevron_right' : 'chevron_left'}</md-icon>
              </button>

              <button
                class="nav-button next ${!this.canScrollNext ? 'disabled' : ''}"
                ?disabled=${!this.canScrollNext}
                @click=${this.next}
                aria-label="Next item"
                tabindex="-1">
                <md-elevation></md-elevation>
                <md-ripple></md-ripple>
                <md-focus-ring></md-focus-ring>
                <md-icon>${isRtlMode ? 'chevron_left' : 'chevron_right'}</md-icon>
              </button>
            `
          : nothing}
        ${this.indicators && itemCount > 0
          ? html`
              <div class="indicators" role="tablist" aria-label="Slides">
                ${this.items.map(
                  (_, i) => html`
                    <button
                      class="indicator-dot ${i === this.activeIndex ? 'active' : ''}"
                      role="tab"
                      aria-selected=${i === this.activeIndex}
                      aria-label="Go to slide ${i + 1}"
                      @click=${() => this.scrollToIndex(i)}></button>
                  `,
                )}
              </div>
            `
          : nothing}
      </div>
    `
  }

  /**
   * Navigates to the next slide.
   */
  async next() {
    const total = this.items.length
    if (total === 0) return

    if (this.activeIndex < total - 1) {
      await this.scrollToIndex(this.activeIndex + 1)
    } else if (this.loop) {
      await this.scrollToIndex(0)
    }
  }

  /**
   * Navigates to the previous slide.
   */
  async previous() {
    const total = this.items.length
    if (total === 0) return

    if (this.activeIndex > 0) {
      await this.scrollToIndex(this.activeIndex - 1)
    } else if (this.loop) {
      await this.scrollToIndex(total - 1)
    }
  }

  /**
   * Scrolls smoothly to the specified slide index.
   *
   * @param {number} index Target item index.
   * @param {'smooth' | 'auto' | 'instant'} behavior Scroll behavior.
   */
  async scrollToIndex(index, behavior = 'smooth') {
    await this.updateComplete
    const items = this.items
    if (!items.length || !this.scrollerElement) return

    const boundedIndex = Math.max(0, Math.min(index, items.length - 1))
    this.activeIndex = boundedIndex
    this._isScrollingProgrammatically = true

    this._applyItemSizes()
    this._syncActiveItem()

    const scroller = this.scrollerElement
    const targetItem = items[boundedIndex]
    if (!targetItem || !scroller) {
      this._isScrollingProgrammatically = false
      return
    }

    let scrollTarget
    if (this.layout === 'centered-hero') {
      const itemCenter = targetItem.offsetLeft + targetItem.offsetWidth / 2
      const scrollerCenter = scroller.offsetWidth / 2
      scrollTarget = itemCenter - scrollerCenter
    } else {
      scrollTarget = targetItem.offsetLeft - scroller.offsetLeft
    }

    scroller.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior,
    })

    this._updateScrollState()
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { index: boundedIndex, item: targetItem },
        bubbles: true,
        composed: true,
      }),
    )

    if (behavior === 'smooth') {
      setTimeout(() => {
        this._isScrollingProgrammatically = false
        this._updateScrollState()
      }, 400)
    } else {
      this._isScrollingProgrammatically = false
    }
  }

  _updateLayout() {
    const scroller = this.scrollerElement
    if (!scroller) return

    const spacing = Number(this.itemSpacing) || 8
    scroller.style.setProperty('--_item-spacing', `${spacing}px`)

    this._applyItemSizes()
  }

  _applyItemSizes() {
    const items = this.items
    if (!items.length) return

    const scroller = this.scrollerElement
    const containerWidth = this.offsetWidth || scroller?.clientWidth || 360
    const spacing = Number(this.itemSpacing) || 8
    const activeIndex = this.activeIndex

    if (this.layout === 'multi-browse' || !this.layout) {
      if (scroller) {
        scroller.style.paddingLeft = '0px'
        scroller.style.paddingRight = '0px'
      }

      const smallWidth = containerWidth < 400 ? 40 : containerWidth < 600 ? 48 : 56
      const remaining = Math.max(120, containerWidth - smallWidth - 2 * spacing)
      const mediumRatio = containerWidth < 400 ? 0.3 : 0.32
      const mediumWidth = Math.max(60, Math.round(remaining * mediumRatio))
      const largeWidth = Math.max(120, remaining - mediumWidth)

      items.forEach((item, i) => {
        let sizeType = 'large'
        let width = largeWidth

        if (i === activeIndex) {
          sizeType = 'large'
          width = largeWidth
        } else if (i === activeIndex + 1) {
          sizeType = 'medium'
          width = mediumWidth
        } else if (i === activeIndex + 2) {
          sizeType = 'small'
          width = smallWidth
        } else {
          sizeType = 'large'
          width = largeWidth
        }

        item.setAttribute('data-size', sizeType)
        item.style.flex = `0 0 ${width}px`
        item.style.width = `${width}px`
        item.style.minWidth = `${width}px`
        item.style.maxWidth = `${width}px`
      })
    } else if (this.layout === 'hero') {
      if (scroller) {
        scroller.style.paddingLeft = '0px'
        scroller.style.paddingRight = '0px'
      }

      const smallWidth = containerWidth < 480 ? 48 : 56
      const largeWidth = Math.max(240, containerWidth - smallWidth - spacing)

      items.forEach((item, i) => {
        let sizeType = 'large'
        let width = largeWidth

        if (i === activeIndex) {
          sizeType = 'large'
          width = largeWidth
        } else if (i === activeIndex + 1) {
          sizeType = 'small'
          width = smallWidth
        } else {
          sizeType = 'large'
          width = largeWidth
        }

        item.setAttribute('data-size', sizeType)
        item.style.flex = `0 0 ${width}px`
        item.style.width = `${width}px`
        item.style.minWidth = `${width}px`
        item.style.maxWidth = `${width}px`
      })
    } else if (this.layout === 'centered-hero') {
      const peekWidth = containerWidth < 480 ? 40 : 56
      const largeWidth = Math.max(220, containerWidth - 2 * peekWidth - 2 * spacing)

      if (scroller) {
        scroller.style.paddingLeft = `${peekWidth + spacing}px`
        scroller.style.paddingRight = `${peekWidth + spacing}px`
      }

      items.forEach((item, i) => {
        let sizeType = 'large'
        let width = largeWidth

        if (i === activeIndex) {
          sizeType = 'large'
          width = largeWidth
        } else if (i === activeIndex - 1 || i === activeIndex + 1) {
          sizeType = 'small'
          width = peekWidth
        } else {
          sizeType = 'large'
          width = largeWidth
        }

        item.setAttribute('data-size', sizeType)
        item.style.flex = `0 0 ${width}px`
        item.style.width = `${width}px`
        item.style.minWidth = `${width}px`
        item.style.maxWidth = `${width}px`
      })
    } else if (this.layout === 'uncontained') {
      if (scroller) {
        scroller.style.paddingLeft = '0px'
        scroller.style.paddingRight = '0px'
      }
      const customWidth = this.itemWidth
        ? isNaN(Number(this.itemWidth))
          ? this.itemWidth
          : `${this.itemWidth}px`
        : '280px'
      items.forEach((item) => {
        item.setAttribute('data-size', 'large')
        item.style.flex = `0 0 ${customWidth}`
        item.style.width = customWidth
        item.style.minWidth = customWidth
        item.style.maxWidth = customWidth
      })
    } else if (this.layout === 'full-screen') {
      if (scroller) {
        scroller.style.paddingLeft = '0px'
        scroller.style.paddingRight = '0px'
      }
      items.forEach((item) => {
        item.setAttribute('data-size', 'large')
        item.style.flex = '0 0 100%'
        item.style.width = '100%'
        item.style.minWidth = '100%'
        item.style.maxWidth = '100%'
      })
    }
  }

  _updateScrollState() {
    const scroller = this.scrollerElement
    if (!scroller) return

    const { scrollLeft, scrollWidth, clientWidth } = scroller
    const maxScroll = scrollWidth - clientWidth

    this._canScrollPrev = scrollLeft > 4
    this._canScrollNext = scrollLeft < maxScroll - 4
  }

  _handleScroll() {
    this._updateScrollState()
    if (this._isScrollingProgrammatically) return

    const scroller = this.scrollerElement
    const items = this.items
    if (!scroller || !items.length) return

    const scrollerLeft = scroller.scrollLeft
    const scrollerCenter = scrollerLeft + scroller.clientWidth / 2

    let closestIndex = 0
    let minDistance = Infinity

    items.forEach((item, index) => {
      let distance
      if (this.layout === 'centered-hero') {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2
        distance = Math.abs(itemCenter - scrollerCenter)
      } else {
        distance = Math.abs(item.offsetLeft - scrollerLeft)
      }

      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    if (this.activeIndex !== closestIndex) {
      this.activeIndex = closestIndex
      this._applyItemSizes()
      this._syncActiveItem()
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { index: closestIndex, item: items[closestIndex] },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  _syncActiveItem() {
    const items = this.items
    items.forEach((item, i) => {
      item.active = i === this.activeIndex
      item.setAttribute('aria-label', `Slide ${i + 1} of ${items.length}`)
      item.setAttribute('role', 'group')
      item.setAttribute('aria-roledescription', 'slide')
    })
  }

  _handleSlotChange() {
    this._updateLayout()
    this._updateScrollState()
    this._syncActiveItem()
    this.requestUpdate()
  }

  _handleKeyDown(event) {
    if (event.defaultPrevented) return

    const isRtlMode = isRtl(this, false)
    const isLeft = event.key === 'ArrowLeft'
    const isRight = event.key === 'ArrowRight'
    const isHome = event.key === 'Home'
    const isEnd = event.key === 'End'

    if (!isLeft && !isRight && !isHome && !isEnd) {
      return
    }

    event.preventDefault()

    const forwards = isRtlMode ? isLeft : isRight
    const backwards = isRtlMode ? isRight : isLeft

    if (isHome) {
      this.scrollToIndex(0)
    } else if (isEnd) {
      this.scrollToIndex(this.items.length - 1)
    } else if (forwards) {
      this.next()
    } else if (backwards) {
      this.previous()
    }
  }

  _onPointerDown(e) {
    if (e.button !== 0) return // Left-click only
    const scroller = this.scrollerElement
    if (!scroller) return

    this._isPointerDown = true
    this._startX = e.pageX - scroller.offsetLeft
    this._startScrollLeft = scroller.scrollLeft
    this._hasDragged = false

    try {
      scroller.setPointerCapture?.(e.pointerId)
    } catch {}
  }

  _onPointerMove(e) {
    if (!this._isPointerDown) return
    const scroller = this.scrollerElement
    if (!scroller) return

    const x = e.pageX - scroller.offsetLeft
    const walk = (x - this._startX) * 1.2

    if (Math.abs(walk) > 5) {
      this._hasDragged = true
      scroller.classList.add('is-dragging')
      scroller.scrollLeft = this._startScrollLeft - walk
    }
  }

  _onPointerUp(e) {
    if (!this._isPointerDown) return
    this._isPointerDown = false

    const scroller = this.scrollerElement
    if (scroller) {
      scroller.classList.remove('is-dragging')
      try {
        if (e && scroller.hasPointerCapture?.(e.pointerId)) {
          scroller.releasePointerCapture?.(e.pointerId)
        }
      } catch {}
    }

    if (this._hasDragged) {
      this._handleScroll()
    }
  }

  _onPointerCancel(e) {
    this._isPointerDown = false
    const scroller = this.scrollerElement
    if (scroller) {
      scroller.classList.remove('is-dragging')
      try {
        if (e && scroller.hasPointerCapture?.(e.pointerId)) {
          scroller.releasePointerCapture?.(e.pointerId)
        }
      } catch {}
    }
  }

  _startAutoplay() {
    this._stopAutoplay()
    const delay = Number(this.autoplay)
    if (delay && delay > 0) {
      this._autoplayTimer = setInterval(() => {
        this.next()
      }, delay)
    }
  }

  _stopAutoplay() {
    if (this._autoplayTimer) {
      clearInterval(this._autoplayTimer)
      this._autoplayTimer = null
    }
  }

  _pauseAutoplay() {
    this._stopAutoplay()
  }

  _resumeAutoplay() {
    this._startAutoplay()
  }

  static styles = [
    css`
      :host {
        display: block;
        position: relative;
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        border-radius: var(--md-carousel-shape, var(--md-sys-shape-corner-extra-large, 28px));
        --_nav-button-size: 40px;
        --_nav-button-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
        --_nav-button-icon-color: var(--md-sys-color-on-surface, #1d1b20);
        --_indicator-color: var(--md-sys-color-outline-variant, #cac4d0);
        --_indicator-active-color: var(--md-sys-color-primary, #6750a4);
      }

      .carousel-container {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 0;
        box-sizing: border-box;
        overflow: hidden;
        border-radius: inherit;
      }

      .scroller {
        display: flex;
        flex-direction: row;
        flex: 1;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        gap: var(--_item-spacing, 8px);
        width: 100%;
        height: 100%;
        min-height: 0;
        box-sizing: border-box;
        outline: none;
        user-select: none;
        touch-action: pan-y pinch-zoom;
        -webkit-overflow-scrolling: touch;
      }

      ::slotted([md-carousel-item]),
      ::slotted(md-carousel-item) {
        height: 100%;
        min-height: 0;
      }

      :host([scroll-snap]) .scroller:not(.is-dragging) {
        scroll-snap-type: x mandatory;
      }

      :host([hide-scrollbar]) .scroller {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      :host([hide-scrollbar]) .scroller::-webkit-scrollbar {
        display: none;
      }

      .scroller.is-dragging {
        scroll-behavior: auto;
        cursor: grabbing;
      }
      .scroller.is-dragging ::slotted(*) {
        pointer-events: none;
      }

      /* Layout alignments */
      ::slotted([md-carousel-item]),
      ::slotted(md-carousel-item) {
        height: 100%;
        min-height: 0;
        scroll-snap-align: start;
      }

      :host([layout='centered-hero']) ::slotted([md-carousel-item]),
      :host([layout='centered-hero']) ::slotted(md-carousel-item) {
        scroll-snap-align: center;
      }

      /* Navigation Buttons */
      .nav-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: var(--_nav-button-size);
        height: var(--_nav-button-size);
        border-radius: 50%;
        background: var(--_nav-button-color);
        color: var(--_nav-button-icon-color);
        border: none;
        outline: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        transition:
          opacity 0.2s cubic-bezier(0.2, 0, 0, 1),
          transform 0.2s cubic-bezier(0.2, 0, 0, 1),
          background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
        -webkit-tap-highlight-color: transparent;
      }

      .nav-button md-elevation {
        --md-elevation-level: 2;
        border-radius: 50%;
      }

      .nav-button md-focus-ring {
        --md-focus-ring-shape: 50%;
      }

      .nav-button.prev {
        left: 12px;
      }

      .nav-button.next {
        right: 12px;
      }

      .nav-button.disabled,
      .nav-button:disabled {
        opacity: 0;
        pointer-events: none;
      }

      :host([navigation='auto']) .nav-button {
        opacity: 0;
      }

      :host([navigation='auto']:hover) .nav-button:not(.disabled),
      :host([navigation='auto']:focus-within) .nav-button:not(.disabled) {
        opacity: 0.92;
      }

      :host([navigation='auto']:hover) .nav-button:not(.disabled):hover {
        opacity: 1;
        transform: translateY(-50%) scale(1.06);
      }

      :host([navigation='always']) .nav-button:not(.disabled) {
        opacity: 0.92;
      }
      :host([navigation='always']) .nav-button:not(.disabled):hover {
        opacity: 1;
        transform: translateY(-50%) scale(1.06);
      }

      /* Indicators */
      .indicators {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-top: 12px;
        width: 100%;
      }

      .indicator-dot {
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background: var(--_indicator-color);
        border: none;
        outline: none;
        padding: 0;
        cursor: pointer;
        transition:
          width 0.3s cubic-bezier(0.2, 0, 0, 1),
          background-color 0.3s cubic-bezier(0.2, 0, 0, 1);
      }

      .indicator-dot.active {
        width: 24px;
        background: var(--_indicator-active-color);
      }

      .indicator-dot:hover:not(.active) {
        background: var(--md-sys-color-outline, #79747e);
      }
    `,
  ]
}

customElements.define('md-carousel', Carousel)
