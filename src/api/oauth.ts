import store from '@/store'
import { patchApiUri } from '@/util'
import http from '@/api/http'

async function fetchOAuthToken () {
  const OAuthInfo = store.state.OAuthInfo

  const formData = {
    client_id: OAuthInfo.clientId,
    client_secret: OAuthInfo.clientSecret,
    redirect_uri: location.origin,
    grant_type: "authorization_code",
    code: OAuthInfo.code
  }

  return await http.post<{
    access_token: string
  }>(patchApiUri('/oauth/token'), formData)
}

export {
  fetchOAuthToken
}
