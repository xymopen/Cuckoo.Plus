import { mastodonentities } from '@/interface'
import { patchApiUri, generateUniqueKey } from '@/util'
import { VisibilityTypes } from '@/constant'
import http from '@/api/http'

async function getStatusById (id: string) {
  return http.get<mastodonentities.Status>(patchApiUri(`/api/v1/statuses/${id}`))
}

interface postStatusFormData {
  // The text of the status
  status: string
  // local ID of the status you want to reply to
  inReplyToId?: string
  // Array of media IDs to attach to the status (maximum 4)
  mediaIds?: Array<string>
  // Set this to mark the media of the status as NSFW
  sensitive?: boolean
  // Text to be shown as a warning before the actual content
  spoilerText?: string
  // Either "direct", "private", "unlisted" or "public"
  visibility?: string
  // ISO 639-2 language code of the toot, to skip automatic detection
  language?: string
}

async function postStatus (formData: postStatusFormData) {
  const apiFormData: any = {}

  apiFormData.status = formData.status
  apiFormData.in_reply_to_id = formData.inReplyToId
  apiFormData.media_ids = formData.mediaIds
  apiFormData.sensitive = formData.sensitive
  apiFormData.spoiler_text = formData.spoilerText
  apiFormData.visibility = formData.visibility || VisibilityTypes.PUBLIC
  apiFormData.language = formData.language

  const config = {
    headers: {
      'Idempotency-Key': generateUniqueKey()
    }
  }

  return http.post<mastodonentities.Status>(patchApiUri(`/api/v1/statuses`), apiFormData, config)
}

async function getStatusContextById (id: string) {
  return http.get<mastodonentities.Context>(patchApiUri(`/api/v1/statuses/${id}/context`))
}

async function getReBloggedAccountsById (id: string) {
  return http.get<mastodonentities.Account[]>(patchApiUri(`/api/v1/statuses/${id}/reblogged_by`))
}

async function getFavouritedAccountsById (id: string) {
  return http.get<mastodonentities.Account[]>(patchApiUri(`/api/v1/statuses/${id}/favourited_by`))
}

async function favouriteStatusById (id: string) {
  return http.post<mastodonentities.Status>(patchApiUri(`/api/v1/statuses/${id}/favourite`))
}

async function unFavouriteStatusById (id: string) {
  return http.post<mastodonentities.Status>(patchApiUri(`/api/v1/statuses/${id}/unfavourite`))
}

async function reblogStatusById (id: string) {
  return http.post<mastodonentities.Status>(patchApiUri(`/api/v1/statuses/${id}/reblog`))
}

async function unReblogStatusById (id: string) {
  return http.post<mastodonentities.Status>(patchApiUri(`/api/v1/statuses/${id}/unreblog`))
}

async function deleteStatusById (id: string) {
  return http.delete(patchApiUri(`/api/v1/statuses/${id}`))
}

async function muteStatusById (id: string) {
  return http.post(patchApiUri(`/api/v1/statuses/${id}/mute`))
}

async function unMuteStatusById (id: string) {
  return http.post(patchApiUri(`/api/v1/statuses/${id}/unmute`))
}

async function getStatusCardInfoById (id: string) {
  return http.get<mastodonentities.Card>(patchApiUri(`/api/v1/statuses/${id}/card`))
}

export {
  getStatusById,
  postStatus,
  getStatusContextById,
  getReBloggedAccountsById,
  getFavouritedAccountsById,
  favouriteStatusById,
  unFavouriteStatusById,
  reblogStatusById,
  unReblogStatusById,
  deleteStatusById,
  muteStatusById,
  unMuteStatusById,
  getStatusCardInfoById
}
