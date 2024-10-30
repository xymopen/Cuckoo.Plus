import { mastodonentities } from '@/interface'
import { patchApiUri } from '@/util'
import http from '@/api/http'

interface updateAccountFormData {
  // The name to display in the user's profile
  display_name?: string
  // A new biography for the user
  note?: string
  // An avatar for the user (encoded using multipart/form-data)
  avatar?: FormData
  // A header image for the user (encoded using multipart/form-data)
  header?: FormData
  // Manually approve followers?
  locked?: boolean
  // (2.4 or later) extra source attribute from verify_credentials
  source?: {
    privacy?: string
    sensitive?: boolean
    note?: string
    fields?: Array<any>
  }
}

async function fetchAccountInfoById () {

}

async function fetchCurrentUserAccountInfo () {
  return http.get<mastodonentities.AuthenticatedAccount>(patchApiUri('/api/v1/accounts/verify_credentials'))
}

async function updateUserAccountInfo (formData: updateAccountFormData) {
  return http.patch<mastodonentities.AuthenticatedAccount>(patchApiUri('/api/v1/accounts/update_credentials'), formData)
}

async function fetchRelationships (idList: Array<string>) {
  return http.get(patchApiUri('/api/v1/accounts/relationships'), {
    params: {
      id: idList
    }
  })
}

async function followAccountById (id: string) {
  return http.post(patchApiUri(`/api/v1/accounts/${id}/follow`))
}

async function unFollowAccountById (id: string) {
  return http.post(patchApiUri(`/api/v1/accounts/${id}/unfollow`))
}

export {
  fetchAccountInfoById,
  fetchCurrentUserAccountInfo,
  updateUserAccountInfo,
  fetchRelationships,
  followAccountById,
  unFollowAccountById
}
