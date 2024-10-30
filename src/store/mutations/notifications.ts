import Vue from 'vue'
import { mastodonentities } from '@/interface'
import { formatAccountDisplayName, formatHtml } from '@/util'
import { MutationTree } from ".."

export default {
  unShiftNotification (state, newNotifications: Array<mastodonentities.Notification>) {
    newNotifications.forEach(notification => {
      if (notification.account) {
        notification.account.display_name = formatAccountDisplayName(notification.account)
      }
      if (notification.status) {
        notification.status.content = formatHtml(notification.status.content, { externalEmojis: notification.status.emojis })
      }
    })
    state.notifications = newNotifications.concat(state.notifications)
  },

  pushNotifications (state, newNotifications: Array<mastodonentities.Notification>) {
    state.notifications = state.notifications.concat(newNotifications)
  },

  updateRelationships (state, newRelationships: { [id: string]: mastodonentities.Relationship }) {
    Object.keys(newRelationships).forEach(id => {
      Vue.set(state.relationships, id, newRelationships[id])
    })
  }
} satisfies MutationTree
