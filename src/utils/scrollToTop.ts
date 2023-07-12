const rAF = requestAnimationFrame

function easeInOutQuad (t: number, b: number, c: number, d: number): number {
  t /= d / 2
  if (t < 1) return c / 2 * t * t + b
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

const scrollToTop = (): Promise<void> => {
  const element = document.documentElement,
    start = element.scrollTop,
    end = 0,
    change = end - start,
    animationStart = +new Date(),
    duration = 400
  let animating = true

  return new Promise(resolve => {
    const animateScroll: FrameRequestCallback = () => {
      if (!animating) return

      rAF(animateScroll)

      const now = +new Date()
      const val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration))

      element.scrollTop = val

      if (now > animationStart + duration) {
        element.scrollTop = end

        animating = false
        resolve()
      }
    }

    rAF(animateScroll)
  })
}

export default scrollToTop
