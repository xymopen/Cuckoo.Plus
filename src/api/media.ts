import { mastodonentities } from '@/interface'
import { patchApiUri } from '@/util'
import http from '@/api/http'

async function postMediaFile (formData) {
  return http.post<mastodonentities.Attachment>(patchApiUri('/api/v1/media'), formData)
}

export {
  postMediaFile
}
