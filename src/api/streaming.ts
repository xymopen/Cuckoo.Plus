import store from '@/store'
import { TimeLineTypes, NotificationTypes, I18nTags } from '@/constant'
import { mastodonentities } from "@/interface"
import router from '@/router'
import { extractText, getAccountDisplayName, prepareRootStatus } from "@/util"
import i18n from '@/i18n'

const StreamingEventTypes = {
  UPDATE: 'update',
  NOTIFICATION: 'notification',
  DELETE: 'delete',
  FILTERS_CHANGED: 'filters_changed'
}

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

type StreamType = {
  stream: string;
  list?: string;
  tag?: string;
}

const createWS = (stream: StreamType) => {
  const url = new URL(`wss://${new URL(store.state.mastodonServerUri).hostname}/api/v1/streaming`)
  url.search = new URLSearchParams({
    access_token: store.state.OAuthInfo.accessToken,
    ...stream
  }).toString()
  return new WebSocket(url.toString())
}

export const openUserConnection = () => {
  const userStreamWs = createWS({ stream: 'user' })

  userStreamWs.onmessage = initEventListener(TimeLineTypes.HOME)

  return userStreamWs.close.bind(userStreamWs)
}

export const openLocalConnection = () => {
  const localStreamWs = createWS({ stream: 'public:local' })

  localStreamWs.onmessage = initEventListener(TimeLineTypes.LOCAL)

  return localStreamWs.close.bind(localStreamWs)
}

export const openPublicConnection = () => {
  const publicStreamWs = createWS({ stream: 'public' })

  publicStreamWs.onmessage = initEventListener(TimeLineTypes.PUBLIC)

  return publicStreamWs.close.bind(publicStreamWs)
}

const initEventListener = (timeLineType, hashName?) =>
  (message: MessageEvent<any>) => {
    if (message.data.length) {
      const parsedMessage = JSON.parse(message.data)

      switch (parsedMessage.event) {
        case StreamingEventTypes.UPDATE: {
          return updateStatus(JSON.parse(parsedMessage.payload), timeLineType, hashName)
        }

        case StreamingEventTypes.DELETE: {
          return deleteStatus(parsedMessage.payload)
        }

        case StreamingEventTypes.NOTIFICATION: {
          return emitNotification(JSON.parse(parsedMessage.payload))
        }
      }
    }
  }

const updateStatus = (newStatus: mastodonentities.Status, timeLineType, hashName?) => {
  if (store.state.statusMap[newStatus.id]) return

  // update status map
  store.commit('updateStatusMap', { [newStatus.id]: newStatus })
  store.dispatch('updateCardMap', newStatus.id)
  if (timeLineType === TimeLineTypes.HOME) {
    prepareRootStatus(newStatus)
  }

  // update target timeline list
  const targetMutationName = store.state.appStatus.settings.realTimeLoadStatusMode ? 'unShiftTimeLineStatuses' : 'unShiftStreamStatusesPool'
  store.commit(targetMutationName, {
    newStatusIdList: [newStatus.id],
    timeLineType, hashName
  })

}

const deleteStatus = (statusId: string) => {
  if (!store.state.statusMap[statusId]) return

  // remove from time line
  store.commit('deleteStatusFromTimeLine', statusId)

  // remove from status map
  store.commit('removeStatusFromStatusMapById', statusId)
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
