import { mastodonentities } from '@/interface'
import { patchApiUri } from '@/util'
import http from '@/api/http'

async function postMediaFile (formData): Promise<{ data: mastodonentities.Attachment }> {
  return http.post(patchApiUri('/api/v1/media'), formData) as any
}

export {
  postMediaFile
}
