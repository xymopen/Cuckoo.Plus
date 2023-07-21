import { watch } from 'vue'
import {
  useSm,
  useNotSm,
  useMd,
  useNotMd,
  useLg,
  useNotLg,
} from './internal'

export const whenSm = (enterSm?: () => void, leaveSm?: () => void) =>
  watch(useSm(), value => {
    if (value) {
      enterSm?.()
    } else {
      leaveSm?.()
    }
  })

export const whenMd = (enterMd?: () => void, leaveMd?: () => void) =>
  watch(useMd(), value => {
    if (value) {
      enterMd?.()
    } else {
      leaveMd?.()
    }
  })

export const whenLg = (enterLg?: () => void, leaveLg?: () => void) =>
  watch(useLg(), value => {
    if (value) {
      enterLg?.()
    } else {
      leaveLg?.()
    }
  })

export const whenNotSm = (callback: () => void) => watch(useNotSm(), value => { if (value) { callback() } })
export const whenNotMd = (callback: () => void) => watch(useNotMd(), value => { if (value) { callback() } })
export const whenNotLg = (callback: () => void) => watch(useNotLg(), value => { if (value) { callback() } })
