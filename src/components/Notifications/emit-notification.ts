
import { NotificationTypes, I18nTags } from '@/constant'
import { mastodonentities } from "@/interface"
import router from '@/router'
import store from '@/store'
import i18n from '@/i18n'
import { extractText, getAccountDisplayName, prepareRootStatus } from "@/util"

const emit = (newNotification: mastodonentities.Notification) => {
  switch (newNotification.type) {
    case NotificationTypes.MENTION: {
      return emitStatusOperateNotification(newNotification, i18n.t(I18nTags.notifications.mentioned_you))
    }

    case NotificationTypes.REBLOG: {
      return emitStatusOperateNotification(newNotification, i18n.t(I18nTags.notifications.boosted_your_status))
    }

    case NotificationTypes.FAVOURITE: {
      // update status info
      store.dispatch('fetchStatusById', newNotification.status.id)

      return emitStatusOperateNotification(newNotification, i18n.t(I18nTags.notifications.favourited_your_status))
    }

    case NotificationTypes.FOLLOW: {
      store.dispatch('updateRelationships', { idList: [newNotification.account.id] })

      return emitStatusOperateNotification(newNotification, i18n.t(I18nTags.notifications.someone_followed_you))
    }
  }
}

const emitStatusOperateNotification = (newNotification: mastodonentities.Notification, operateTypeString) => {
  const title = `${getFromName(newNotification)} ${operateTypeString}`
  const bodyText = newNotification.status ? extractText(newNotification.status.content) : ''

  // ignore all muted status's notification
  if (newNotification.status && (store.state.appStatus.settings.muteMap.statusList.indexOf(newNotification.status) !== -1)) return

  if (store.state.appStatus.settings.muteMap.userList.indexOf(newNotification.account.id) !== -1) return

  const nativeNotification = new Notification(title, { body: bodyText, icon: getImageUrl(newNotification) })

  nativeNotification.addEventListener('click', () => {
    if (store.state.appStatus.unreadNotificationCount > 0) {
      store.commit('updateUnreadNotificationCount', store.state.appStatus.unreadNotificationCount - 1)
    }

    routeToTargetStatus(newNotification)
  })
}

const getFromName = (newNotification: mastodonentities.Notification): string => {
  // account's display name have been formatted
  return getAccountDisplayName(newNotification.account)
    .replace('<span>', '').replace('</span>', '')
}

const getImageUrl = (newNotification: mastodonentities.Notification): string => {
  return newNotification.account.avatar
}

const routeToTargetStatus = async (newNotification: mastodonentities.Notification) => {
  const targetStatus = await prepareRootStatus(newNotification.status)

  router.push({
    name: "statuses",
    params: {
      statusId: targetStatus.id
    }
  })
}

const routeToTargetAccount = () => {

}

const emitNotification = (newNotification: mastodonentities.Notification) => {
  // update notification list
  store.commit('unShiftNotification', [newNotification])

  // set notification icon unread
  store.commit('updateUnreadNotificationCount', store.state.appStatus.unreadNotificationCount + 1)

  // send browser notification
  // @ts-ignore
  if (window.Notification) {
    emit(newNotification)
  }
}

export default emitNotification
