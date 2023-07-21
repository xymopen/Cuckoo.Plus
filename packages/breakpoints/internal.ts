import { once } from 'lodash'
import { useMediaQuery } from '@vueuse/core'
import { dp2px } from "@/utils/AndroidMeasurements"

// See {@file ./styles.pcss}
export const useSm = once(() => useMediaQuery(`(min-width: ${dp2px(600)}px)`))
export const useNotSm = once(() => useMediaQuery(`(max-width: ${dp2px(600)}px)`))

export const useMd = once(() => useMediaQuery(`(min-width: ${dp2px(840)}px)`))
export const useNotMd = once(() => useMediaQuery(`(max-width: ${dp2px(840)}px)`))

export const useLg = once(() => useMediaQuery(`(min-width: ${dp2px(1440)}px)`))
export const useNotLg = once(() => useMediaQuery(`(max-width: ${dp2px(1440)}px)`))
