import { Sm, Md, Lg } from '@/components/Breakpoints'
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
