import { defineComponent, ref, watch, Ref } from 'vue'
import {
  useSm,
  useMd,
  useLg,
} from './internal'

const createBreakpoint = (breakpoint: () => Ref<boolean>) => defineComponent({
  inheritAttrs: false,
  setup (_, { slots }) {
    const matched = breakpoint();
    const delayed = ref(matched.value)

    // Add a little delay to let composables run first
    watch(matched, value => {
      setImmediate(() => {
        delayed.value = value
      })
    })

    return () => {
      if (delayed.value) {
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
