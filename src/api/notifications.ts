import { mastodonentities } from '@/interface'
import { patchApiUri } from '@/util'
import http from '@/api/http'

interface getNotificationsQueryParams {
  // Get a list of notifications with ID less than this value
  max_id?: string
  // Get a list of notifications with ID greater than this value
  since_id?: string
  // Maximum number of notifications to get (Default 15, Max 30)
  limit?: number
  // Array of notifications to exclude (Allowed values: "follow", "favourite", "reblog", "mention")
  exclude_types?: Array<mastodonentities.NotificationType>
}

async function getNotifications (queryParams: getNotificationsQueryParams) {
  queryParams.limit = 30
  const config = {
    params: queryParams
  }

  return http.get<mastodonentities.Notification[]>(patchApiUri('/api/v1/notifications'), config)
}

export {
  getNotifications
}
