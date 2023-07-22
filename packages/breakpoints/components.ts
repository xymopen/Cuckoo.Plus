import { defineComponent } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { dp2px } from "@/utils/AndroidMeasurements"

const createBreakpoint = (breakpoint: number) => defineComponent({
  inheritAttrs: false,
  setup (_, { slots }) {
    const matched = useMediaQuery(`(min-width: ${dp2px(breakpoint)}px)`);

    return () => {
      if (matched.value) {
        return slots.default?.()
      } else {
        return slots.else?.()
      }
    }
  },
})

// See {@file ./styles.pcss}
export const Sm = createBreakpoint(600)
export const Md = createBreakpoint(840)
export const Lg = createBreakpoint(1440)
