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

let socket: null | WebSocket = null

type Listener = (type: string, payload: any) => void

type Node = {
  children: null | Record<string, Node>
  listeners: null | Set<Listener>
}

const streams: Node = {
  children: null,
  listeners: null
}

const createWS = (streamType: StreamType, listener: Listener): () => void => {
  if (socket === null) {
    const url = new URL(`wss://${new URL(store.state.mastodonServerUri).hostname}/api/v1/streaming`)
    url.search = new URLSearchParams({
      access_token: store.state.OAuthInfo.accessToken,
      ...streamType
    }).toString()
    socket = new WebSocket(url.toString())
    socket.addEventListener("message", onSocketMessage)
  } else {
    const message = {
      type: "subscribe",
      ...streamType
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    } else {
      socket.addEventListener(
        "open",
        function () { this.send(JSON.stringify(message)) },
        { once: true }
      )
    }
  }

  const path = streamType.stream === "hashtag" ? [streamType.stream, streamType.tag!] :
    streamType.stream === "list" ? [streamType.stream, streamType.list!] :
      [streamType.stream]

  const node = path.reduce((current, seg) => {
    if (current.children == null) {
      current.children = {}
    }
    if (current.children[seg] == null) {
      current.children[seg] = {
        children: null,
        listeners: null
      }
    }
    return current.children[seg]
  }, streams)

  if (node.listeners == null) {
    node.listeners = new Set()
  }

  node.listeners.add(listener)

  return () => {
    if (node.listeners != null) {
      node.listeners.delete(listener) // leave a hole in array

      if (node.listeners.size <= 0) {
        socket!.send(JSON.stringify({
          type: "unsubscribe",
          ...streamType
        }))
        node.listeners = null
        // FIXME: close web socket ?
      }
    }
  }
}

const onSocketMessage = (event: MessageEvent) => {
  if (typeof event.data === 'string') {
    const { stream: path, event: type, payload: rawPayload } = JSON.parse(event.data) as {
      stream: string[],
      event: string,
      payload?: string
    }
    const payload = [
      "update",
      "notification",
      "conversation",
      "announcement",
      "announcement.reaction",
      "status.update"
    ].includes(type) ? JSON.parse(rawPayload!) : rawPayload

    const node = path.reduce((current: Node | null, seg) =>
      current?.children?.[seg] ?? null, streams)

    node?.listeners?.forEach(listener => listener(type, payload))
  }
}

// TODO: onMessageError() ?

export const openUserConnection = () =>
  createWS({ stream: 'user' }, initEventListener(TimeLineTypes.HOME))

export const openLocalConnection = () =>
  createWS({ stream: 'public:local' }, initEventListener(TimeLineTypes.LOCAL))

export const openPublicConnection = () =>
  createWS({ stream: 'public' }, initEventListener(TimeLineTypes.PUBLIC))

if (import.meta.webpackHot) {
  import.meta.webpackHot.dispose(() => {
    socket?.close()
    socket = null
  })
}

const initEventListener = (timeLineType, hashName?): Listener =>
  (type, payload) => {
    switch (type) {
      case StreamingEventTypes.UPDATE: {
        return updateStatus(payload, timeLineType, hashName)
      }

      case StreamingEventTypes.DELETE: {
        return deleteStatus(payload)
      }

      case StreamingEventTypes.NOTIFICATION: {
        return emitNotification(payload)
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
