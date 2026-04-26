# hairlabs.ai — Timeline Section Deep Analysis

## Screenshots

````carousel
![Timeline start — 2005 entry active, cards below are blurred/faded](C:/Users/Alex/.gemini/antigravity/brain/755227f4-8f0a-410a-a8b4-ab238834bc3b/hairlabs_timeline_start_1772782185812.png)
<!-- slide -->
![Mid-scroll — 2017 entry active, previous cards blurred above, upcoming cards blurred below](C:/Users/Alex/.gemini/antigravity/brain/755227f4-8f0a-410a-a8b4-ab238834bc3b/hairlabs_timeline_active_1772782207782.png)
````

---

## 1. Architecture Overview

The "Twenty years of discovery" section is a **scroll-driven vertical timeline** built entirely with **custom vanilla JavaScript** (~10KB inline script) and **CSS transitions**. No external animation libraries are used — no GSAP, ScrollTrigger, Lenis, Locomotive Scroll, AOS, or Framer Motion.

### DOM Hierarchy

```
section.hl-origin (root — Shopify section)
└── div.hl-origin__wrapper
    └── div.hl-origin__container (glassmorphism card)
        ├── div.hl-origin__card-atmosphere (background layers)
        │   ├── div.hl-origin__atmo-base      ← warm gradient bottom layer
        │   ├── div.hl-origin__atmo-dawn       ← peachy mid-layer
        │   └── div.hl-origin__atmo-sunrise    ← bright top fade
        ├── div.hl-origin__card-noise          ← SVG noise texture overlay
        ├── header.hl-origin__header           ← "Twenty years of discovery" title
        ├── div.hl-origin__timeline            ← CSS Grid (80px | 1fr)
        │   ├── div.hl-origin__track           ← vertical progress bar
        │   │   ├── div.hl-origin__track-wrap  ← 3px track rail
        │   │   │   ├── div.track-bg           ← static amber background
        │   │   │   └── div.track-fill         ← animated gradient fill (height %)
        │   │   │       └── div.track-glow     ← blurred glow effect
        │   │   ├── div.hl-origin__dot         ← pulsing amber dot indicator
        │   │   └── div.hl-origin__counter     ← floating year pill (glass badge)
        │   └── div.hl-origin__discoveries     ← 10 × <article> cards
        └── div.hl-origin__cta                 ← "Explore the science" link
```

---

## 2. How the Scroll Animation Works

### Core Mechanism: `scroll` event + `getBoundingClientRect()`

The scroll handler calculates a **progress value (0–1)** based on how far the viewport center has traveled through the track element:

```javascript
function update() {
  var trackRect = track.getBoundingClientRect();
  var viewportCenter = window.innerHeight / 2;
  
  var progress = (viewportCenter - trackRect.top) / (trackRect.bottom - trackRect.top);
  progress = Math.max(0, Math.min(1, progress));  // clamp 0–1
  
  // Drive all visual updates from this single progress value:
  fill.style.height = (progress * 100) + '%';     // fill the track
  dot.style.top = (progress * 100) + '%';          // move the dot
  counter.style.top = (progress * 100) + '%';      // move the year counter
  
  // Determine which card is "active"
  var activeIndex = Math.min(Math.floor(progress * discoveryCount), discoveryCount - 1);
  yearDisplay.textContent = years[activeIndex];
  
  // Toggle classes on all cards
  for (var i = 0; i < discoveryEls.length; i++) {
    discoveryEls[i].classList.remove('is-active', 'is-near');
    if (i === activeIndex)              discoveryEls[i].classList.add('is-active');
    else if (Math.abs(i - activeIndex) === 1) discoveryEls[i].classList.add('is-near');
  }
}
```

### Throttling Strategy

```javascript
var scrollTimeout;
function onScroll() {
  if (scrollTimeout) return;
  scrollTimeout = setTimeout(function() {
    scrollTimeout = null;
    update();
  }, 10);
}
window.addEventListener('scroll', onScroll, { passive: true });
```

Uses `setTimeout(fn, 10)` throttle — roughly 100fps cap. Also runs `setInterval(update, 250)` as a safety net.

### Card State Transitions (CSS-Driven)

| State | Class | `opacity` | `filter` | `transform` | `transition` |
|-------|-------|-----------|----------|-------------|-------------|
| **Default** | (none) | `0.15` | `blur(6px)` | `translateY(24px)` | `0.7s ease-out-expo` |
| **Active** | `is-active` | `1` | `blur(0)` | `translateY(0)` | `0.7s ease-out-expo` |
| **Near** | `is-near` | `0.4` | `blur(3px)` | `translateY(12px)` | `0.7s ease-out-expo` |

The easing curve is a custom CSS variable: `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`.

### Header/CTA Reveal

Uses `IntersectionObserver` with `threshold: 0.2` — adds `is-visible` class when 20% visible:

```css
.hl-origin__header {
  opacity: 0;
  transform: translateY(24px);
  transition: all 0.8s var(--ease-out-expo);
}
.hl-origin__header.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 3. Visual Design Techniques

### Glassmorphism Container
```css
.hl-origin__container {
  background: rgba(255, 250, 240, 0.4);
  backdrop-filter: blur(32px) saturate(160%);
  border-radius: 32px;
  box-shadow:
    inset 0 1px 0 rgba(255, 248, 240, 0.8),     /* inner top highlight */
    inset 0 -1px 0 rgba(218, 186, 168, 0.2),     /* inner bottom edge */
    0 4px 24px rgba(218, 186, 168, 0.15),          /* outer soft shadow */
    0 1px 2px rgba(0, 0, 0, 0.02);                 /* subtle base shadow */
}
```

### SVG Noise Texture
Inline SVG using `<feTurbulence>` at `opacity: 0.015` with `mix-blend-mode: multiply` — adds grain.

### Atmospheric Gradient Layers (3 stacked)
- **atmo-base**: Warm peach `rgba(255,230,200,0.5)` → near-white
- **atmo-dawn**: Stronger orange top → transparent bottom
- **atmo-sunrise**: Transparent top → bright white bottom

### Progress Track
The fill uses an **animated gradient** with a 4-second infinite loop:
```css
@keyframes originGradient {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 0% 100%; }
}
```
With a **blurred glow** child (`filter: blur(8px); opacity: 0.4`).

### Dot with Pulse Animation
```css
@keyframes originPulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}
```

---

## 4. Libraries & Dependencies

| Category | Library | Used? |
|----------|---------|-------|
| Scroll Animation | GSAP / ScrollTrigger | ❌ |
| Smooth Scroll | Lenis / Locomotive | ❌ |
| Reveal-on-scroll | AOS | ❌ |
| Scroll Scenes | ScrollMagic | ❌ |
| Slider | Swiper | ❌ |
| Page Transitions | Barba.js | ❌ |
| Motion | Framer Motion | ❌ |
| Intersection Observer | Native browser API | ✅ |
| Scroll events | Native `addEventListener` | ✅ |

The `vendor.min.js` does contain a **Motion One** (or similar) library with `IntersectionObserver` and `scroll` utilities, but this specific section **does not use it** — it relies entirely on the inline script.

---

## 5. Bugs & Cons Found

### 🔴 Critical Issues

**1. `setTimeout` Throttle Instead of `requestAnimationFrame`**
The scroll handler uses `setTimeout(fn, 10)` which is not synced with the browser's repaint cycle. This can cause:
- Visual tearing / jank on high-refresh-rate monitors (120Hz+)
- Wasteful updates when the tab is minimized (setTimeout still fires)
- `requestAnimationFrame` would be the correct choice here

**2. `setInterval(update, 250)` Safety Net Is Redundant & Wasteful**
The code runs `setInterval(update, 250)` as an always-on backup poller. This means `getBoundingClientRect()` is called **4 times per second even when no scrolling is happening**, forcing layout recalculation unnecessarily.

**3. Aggressive `filter: blur()` on Multiple Elements**
CSS `filter: blur()` is **GPU-expensive**. With 10 cards each having blur applied or transitioning, this causes:
- Frame drops on mobile/low-end devices
- Excessive GPU memory usage
- Compounded by `backdrop-filter: blur(32px)` on the container

### 🟡 Medium Issues

**4. No Cleanup / Destroy Logic**
The scroll and resize listeners are added but **never removed**. In Shopify's section-rendering architecture (where sections can be dynamically loaded/unloaded in the theme editor), this creates memory leaks if the section is re-initialized.

**5. `getBoundingClientRect()` Called on Every Scroll Event**
This forces a **layout reflow** every ~10ms during scrolling. Better approaches:
- Cache the track position and only recalculate on resize
- Use `IntersectionObserver` for card state changes instead of manual calculations

**6. All Cards Iterated on Every Scroll Frame**
The loop `for (var i = 0; i < discoveryEls.length; i++)` runs 10 iterations with `classList.remove` + `classList.add` on **every scroll tick**, even if the active card hasn't changed. Should track `lastActiveIndex` and only update when it changes.

**7. Year Counter Positioning Issues**
The year counter uses `top: N%` with `transition: top 0.08s linear`. This means:
- Uses `top` for animation instead of `transform: translateY()`, triggering **layout** instead of **composite-only** updates
- Same issue for `dot.style.top` and `fill.style.height`

**8. Blurred Cards Have Interactive "Read More" Links**
Cards at `opacity: 0.15` with `blur(6px)` still have clickable "Read more" links. Users might accidentally click them or struggle to read them. Should add `pointer-events: none` on non-active cards.

### 🟢 Minor / UX Issues

**9. No Reduced Motion Support**
No `prefers-reduced-motion` media query is implemented. Users who have system-level animation reduction enabled still get blur transitions.

**10. No Scroll Snapping or Navigation Shortcuts**
The only way to navigate is linear scrolling. No year markers to click/jump to. On mobile, the section is quite long (~3000px), leading to scroll fatigue.

**11. Hardcoded Section ID**
`initOrigintemplate27859313295700__hl_origin_home()` — the function name contains a Shopify template ID, suggesting it's **auto-generated per section instance**. This is fine for production but means the code is duplicated if the section is used multiple times.

**12. Double DOMContentLoaded Guard Is Fragile**
```javascript
document.addEventListener('DOMContentLoaded', function() { init(); });
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(function() { init(); }, 1);
}
```
The `setTimeout(fn, 1)` fallback races with the DOMContentLoaded handler. The `dataset.initialized` flag prevents double execution, but it's a code smell.

---

## 6. Summary — What to Tell the Client

> This timeline section is **custom-built from scratch** using vanilla JavaScript and CSS transitions — no animation libraries. The visual effect is achieved by dividing scroll progress into zones and toggling CSS classes (`is-active`, `is-near`) that control **opacity**, **blur**, and **transform** transitions with a smooth exponential easing.
>
> The design uses **glassmorphism** (backdrop-filter + layered gradients + SVG noise) and the scroll interactions are driven by a single progress value calculated from `getBoundingClientRect()`.
>
> While visually impressive, the implementation has several **performance optimizations they missed** — using `requestAnimationFrame` instead of `setTimeout`, avoiding `getBoundingClientRect` on every frame, using `transform` instead of `top` for compositor-only animations, and adding `prefers-reduced-motion` support.
>
> **Building something similar (or better) is very achievable** — especially if you leverage GSAP ScrollTrigger or CSS `scroll-timeline` for smoother, more performant scroll-driven animations.
