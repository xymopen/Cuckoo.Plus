import Vue, { ComponentOptions } from 'vue'
import {
  useSm,
  useMd,
  useLg,
} from './internal'

type EmptyObject = Record<string, never>

export const Sm = <T extends string> (key: T): ComponentOptions<Vue, EmptyObject, EmptyObject, { [P in T]: boolean }> => {
  const sm = useSm()

  return {
    computed: ({
      [key] () {
        return sm.value
      }
    } as { [P in T]: () => boolean })
  }
}

export const Md = <T extends string> (key: T): ComponentOptions<Vue, EmptyObject, EmptyObject, { [P in T]: boolean }> => {
  const md = useMd()

  return {
    computed: ({
      [key] () {
        return md.value
      }
    } as { [P in T]: () => boolean })
  }
}

export const Lg = <T extends string> (key: T): ComponentOptions<Vue, EmptyObject, EmptyObject, { [P in T]: boolean }> => {
  const lg = useLg()

  return {
    computed: ({
      [key] () {
        return lg.value
      }
    } as { [P in T]: () => boolean })
  }
}
