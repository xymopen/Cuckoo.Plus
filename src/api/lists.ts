import { patchApiUri } from '@/util'
import http from '@/api/http'

async function receiveLists () {
  return http.get(patchApiUri('/api/v1/instance'))
}

export {
  receiveLists
}
