import { Sm, Md, Lg } from '@/components/Breakpoints'

declare module 'vue' {
  interface GlobalComponents {
    Sm: typeof Sm
    Md: typeof Md
    Lg: typeof Lg
  }
}
