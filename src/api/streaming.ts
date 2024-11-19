import store from '@/store'
import Multimap, { type Multimap as MultimapType } from 'packages/multimap'

const StreamingEventTypes = {
  FILTERS_CHANGED: 'filters_changed'
}

type StreamType = {
  stream: string;
  list?: string;
  tag?: string;
}

let socket: null | WebSocket = null

type Listener = (payload: any) => void

type Node = {
  children: null | Record<string, Node>
  listeners: null | MultimapType<string, Listener>
}

const streams: Node = {
  children: null,
  listeners: null
}

export const createWS = (streamType: StreamType, type: string, listener: Listener): () => void => {
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

  if (socket === null) {
    const url = new URL(`wss://${new URL(store.state.mastodonServerUri).hostname}/api/v1/streaming`)
    url.search = new URLSearchParams({
      access_token: store.state.OAuthInfo.accessToken,
      ...streamType
    }).toString()
    socket = new WebSocket(url.toString())
    socket.addEventListener("message", onSocketMessage)
  } else if (node.listeners == null) {
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

  if (node.listeners == null) {
    node.listeners = new Multimap()
  }

  node.listeners.add(type, listener)

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

    const it = node?.listeners?.getAll(type)

    if (it != null) {
      for (const listener of it) {
        listener(payload)
      }
    }
  }
}

// TODO: onMessageError() ?

if (import.meta.webpackHot) {
  import.meta.webpackHot.dispose(() => {
    socket?.close()
    socket = null
  })
}
