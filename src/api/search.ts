import { mastodonentities } from '@/interface'
import { patchApiUri } from '@/util'
import http from '@/api/http'

let preAbortCtrl: AbortController

/**
 * @param q The search query
 * @param resolve Whether to resolve non-local accounts (default: don't resolve)
 * */
async function getSearchResults (q: string, resolve = false) {
  abortSearch()
  const abortCtrl = new AbortController()
  const request = http.get<mastodonentities.SearchResults>(patchApiUri('/api/v1/search'), {
    params: {
      q, resolve
    },
    signal: abortCtrl.signal
  })
  preAbortCtrl = abortCtrl
  return request
}

function abortSearch () {
  if (preAbortCtrl) preAbortCtrl.abort()
}

export {
  getSearchResults,
  abortSearch
}
