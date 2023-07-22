import { Sm, Md, Lg } from 'packages/breakpoints/components'
import { RouterView, RouterLink } from 'vue-router'

declare module 'vue' {
  interface GlobalComponents {
    Sm: typeof Sm
    Md: typeof Md
    Lg: typeof Lg
    RouterView: typeof RouterView
    RouterLink: typeof RouterLink
  }
}
