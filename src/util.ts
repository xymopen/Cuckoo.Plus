import store from '@/store'
import { TimeLineTypes, I18nTags, VisibilityTypes } from '@/constant'
import Formatter from "./formatter"
import { mastodonentities } from "@/interface"
import { sanitize } from 'dompurify'

export function patchApiUri (uri: string): string {
  const targetServerUri = store.state.mastodonServerUri || 'https://pawoo.net'
  return `${targetServerUri}${uri}`
}

export function generateUniqueKey () {
  const toReplacedString = 'xxxxxxxy-yyxx-xxyx-yyxx-xxyyxxxxxyyy'

  return toReplacedString.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8)

    return v.toString(16)
  })
}

export function isBaseTimeLine (timeLineType: string): boolean {
  return [TimeLineTypes.HOME, TimeLineTypes.PUBLIC, TimeLineTypes.DIRECT, TimeLineTypes.LOCAL].indexOf(timeLineType) !== -1
}

export function getTargetStatusesList (listMap, timeLineType, hashName) {
  let targetStatusesList
  if (isBaseTimeLine(timeLineType)) {
    targetStatusesList = listMap[timeLineType]
  } else {
    targetStatusesList = listMap[timeLineType][hashName]
  }

  return targetStatusesList || []
}

const visibilityTypeToDescMap = {
  [VisibilityTypes.PUBLIC]: {
    descTag: I18nTags.common.status_visibility_public_desc,
    icon: 'public'
  },
  [VisibilityTypes.UNLISTED]: {
    descTag: I18nTags.common.status_visibility_unlisted_desc,
    icon: 'lock_open'
  },
  [VisibilityTypes.PRIVATE]: {
    descTag: I18nTags.common.status_visibility_private_desc,
    icon: 'lock'
  },
  [VisibilityTypes.DIRECT]: {
    descTag: I18nTags.common.status_visibility_direct_desc,
    icon: 'email'
  }
}
export function getVisibilityDescInfo (visibilityType: string) {
  return visibilityTypeToDescMap[visibilityType]
}

export async function prepareRootStatus (status: mastodonentities.Status) {
  const contextMap = store.state.contextMap
  const statusMap = store.state.statusMap

  if (!contextMap[status.id]) {
    await store.dispatch('updateContextMap', status.id)
  }

  let targetStatus = status

  const targetStatusContext = contextMap[status.id]

  if (!targetStatusContext) return

  if (targetStatusContext.ancestors.length) {
    targetStatus = statusMap[targetStatusContext.ancestors[0]]
  }

  store.dispatch('updateContextMap', targetStatus.id)

  return targetStatus
}

// TODO: Replace with v-html
let formatter
export function formatHtml (html: string, options: { externalEmojis } = { externalEmojis: [] }): string {
  if (!formatter) {
    formatter = new Formatter(store.state.customEmojis)
  }

  formatter.updateCustomEmojiMap(options.externalEmojis)

  // create a parent node to contain the input html
  const parentNode = document.createElement('template')
  parentNode.innerHTML = html

  walkTextNodes(parentNode.content, (parentNode, textNode) => {
    const spanNode = document.createElement('span')
    spanNode.innerHTML = formatter.format(sanitize(textNode.textContent))
    parentNode.replaceChild(spanNode, textNode)
  })

  return parentNode.innerHTML
}

export function formatAccountDisplayName (account: mastodonentities.Account) {
  return formatHtml(getAccountDisplayName(account), { externalEmojis: account.emojis })
}

export function extractText (html: string): string {
  let text = ""

  // create a parent node to contain the input html
  const parentNode = document.createElement('template')
  parentNode.innerHTML = html

  walkTextNodes(parentNode.content, (parentNode, textNode) => {
    text += (textNode.textContent + " ")
  })

  return text
}

const maxImageSize = 7.8 * 1024 * 1024
export async function resetImageFileSizeForUpload (file: File) {
  if (file.size < maxImageSize) return new Promise(r => r(file))

  const oldImage = new Image()
  oldImage.src = window.URL.createObjectURL(file)

  // todo set to 1280 width for now
  const newWidth = 1280

  return new Promise(resolve => {
    oldImage.onload = () => {
      const newHeight = oldImage.height * newWidth / oldImage.width
      const canvas = document.createElement('canvas')
      const canvasContext = canvas.getContext('2d')

      canvas.width = newWidth
      canvas.height = newHeight

      canvasContext.drawImage(oldImage, 0, 0, newWidth, newHeight)

      canvas.toBlob((blob) => {
        resolve(blob)
      })
    }
  })
}

function walkTextNodes (node, textNodeHandler) {
  if (node) {
    for (let i = 0; i < node.childNodes.length; ++i) {
      const childNode = node.childNodes[i]
      if (childNode.nodeType === 3) {
        textNodeHandler(node, childNode)
      } else if (childNode.nodeType === 1 || childNode.nodeType === 9 || childNode.nodeType === 11) {
        walkTextNodes(childNode, textNodeHandler)
      }
    }
  }
}

export const documentGlobalEventBus = new class {

  private eventMap: {
    [key: string]: Array<{
      listener: Function,
      skip?: boolean
    }>
  } = {}

  on (eventName: string, eventListener: Function, coexistWithOtherListener = false) {
    if (!this.eventMap[eventName]) {
      this.eventMap[eventName] = []
      this.initDocumentGlobalEvent(eventName)
    }

    if (!coexistWithOtherListener) {
      this.eventMap[eventName].forEach(listenerInfo => {
        listenerInfo.skip = true
      })
    }

    this.eventMap[eventName].push({
      listener: eventListener
    })
  }

  off (eventName: string, eventListener: Function) {
    if (!eventListener) {
      this.eventMap[eventName] = []
    }

    if (!this.eventMap[eventName]) return

    const targetIndex = this.eventMap[eventName].findIndex(listenerInfo => listenerInfo.listener === eventListener)
    this.eventMap[eventName].splice(targetIndex, 1)
    this.eventMap[eventName].forEach(listenerInfo => {
      listenerInfo.skip = false
    })
  }

  private initDocumentGlobalEvent (eventName: string) {
    document.addEventListener(eventName, (e) => {
      this.eventMap[eventName].forEach(listenerInfo => {
        if (listenerInfo.skip) return
        listenerInfo.listener(e)
      })
    })
  }
}

export function checkShouldRegisterApplication (to, from): boolean {
  // should have clientId/clientSecret/code
  const { clientId, clientSecret, accessToken } = store.state.OAuthInfo

  let code = store.state.OAuthInfo.code

  if (accessToken || code) {
    return false
  } else {
    if (from.path === '/' && !code) {
      if (location.search.substring(0, 6) == "?code=") {
        code = (new RegExp("[\\?&]code=([^&#]*)")).exec(location.search)
        code = code == null ? "" : decodeURIComponent(code[1]);
        // todo maybe shouldn't put this here?
        store.commit('updateOAuthCode', code)
      }
    }

    return !(clientId && clientSecret && store.state.mastodonServerUri && code)
  }
}

export const getAccountDisplayName = (account: mastodonentities.Account) => account.display_name || account.username || account.acct

export const getAccountAtName = (account: mastodonentities.Account) => account.username || account.acct
