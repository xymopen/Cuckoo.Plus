import { mastodonentities } from '@/interface'
import { patchApiUri } from '@/util'
import http from '@/api/http'

async function getCustomEmojis () {
  return http.get<mastodonentities.Emoji[]>(patchApiUri('/api/v1/custom_emojis'))
}

export {
  getCustomEmojis
}
