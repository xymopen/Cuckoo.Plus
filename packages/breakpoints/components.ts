import { defineComponent, Ref } from 'vue'
import {
  useSm,
  useMd,
  useLg,
} from './internal'

const createBreakpoint = (breakpoint: () => Ref<boolean>) => defineComponent({
  inheritAttrs: false,
  setup (_, { slots }) {
    const matched = breakpoint();

    return () => {
      if (matched.value) {
        return slots.default?.()
      } else {
        return slots.else?.()
      }
    }
  },
})

export const Sm = createBreakpoint(useSm)
export const Md = createBreakpoint(useMd)
export const Lg = createBreakpoint(useLg)
