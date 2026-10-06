// Spring motion for the few things that move (tiles and Glyph cards in the scoring demo).
//
// A critically damped spring (damping ratio 1, no overshoot) sampled into a CSS linear() easing, run with the
// Web Animations API. Moves are FLIP animations measured from each element's *on-screen* rect, which includes
// any animation still in flight, so a tile tapped again mid-move turns around from where it is instead of
// jumping. With prefers-reduced-motion, elements cross-fade in place instead of travelling.

/** Spring response in seconds (Apple's "response": time to reach the target, not a duration). */
const RESPONSE = 0.38

function springEasing(response: number): { easing: string; duration: number } {
  const omega = (2 * Math.PI) / response
  // (1 + ωt)e^(−ωt) < 0.001 once ωt ≈ 9.23: the spring has visibly settled.
  const duration = 9.23 / omega
  const steps = 32
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration
    const x = 1 - (1 + omega * t) * Math.exp(-omega * t)
    points.push((i === steps ? 1 : x).toFixed(4))
  }
  return { easing: `linear(${points.join(', ')})`, duration: duration * 1000 }
}

const spring = springEasing(RESPONSE)

/** linear() easing where supported; otherwise a close cubic-bézier stand-in. */
function springCurve(): string {
  const ok = typeof CSS !== 'undefined' && CSS.supports?.('animation-timing-function', 'linear(0, 1)')
  return ok ? spring.easing : 'cubic-bezier(0.2, 0.9, 0.25, 1)'
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/** Where each keyed element currently is on screen. */
export type Snapshot = Map<string, DOMRect>

/** Records the on-screen rect of every element with a `data-flip` key inside [root]. */
export function snapshot(root: HTMLElement | null): Snapshot {
  const rects: Snapshot = new Map()
  if (!root) return rects
  for (const el of root.querySelectorAll<HTMLElement>('[data-flip]')) {
    rects.set(el.dataset.flip!, el.getBoundingClientRect())
  }
  return rects
}

/** Animates every keyed element in [root] from its [before] rect to where layout has now put it. */
export function playFrom(root: HTMLElement | null, before: Snapshot): void {
  if (!root || typeof Element === 'undefined' || !('animate' in Element.prototype)) return
  const reduced = prefersReducedMotion()
  for (const el of root.querySelectorAll<HTMLElement>('[data-flip]')) {
    const from = before.get(el.dataset.flip!)
    if (!from) continue
    for (const running of el.getAnimations()) running.cancel()
    const to = el.getBoundingClientRect()
    const dx = from.left - to.left
    const dy = from.top - to.top
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue
    if (reduced) {
      el.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' })
    } else {
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
        duration: spring.duration,
        easing: springCurve(),
      })
    }
  }
}
