import { mastodonentities } from '@/interface'
import { patchApiUri } from '@/util'
import http from '@/api/http'

async function getCustomEmojis (): Promise<{ data: Array<mastodonentities.Emoji> }> {
  return http.get(patchApiUri('/api/v1/custom_emojis')) as any
}

export {
  getCustomEmojis
}
