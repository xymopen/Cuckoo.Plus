import Vue from 'vue'
import timelinesMutations from './timelines'
import notificationsMutations from './notifications'
import appStatusMutations from './appstatus'
import { mastodonentities } from '@/interface'
import { formatHtml, formatAccountDisplayName } from '@/util'
import { MutationTree } from ".."

function formatStatusContent (status: mastodonentities.Status) {
  return formatHtml(status.content, { externalEmojis: status.emojis })
}

const oAuthInfoMutations: MutationTree = {

  clearAllOAuthInfo (state) {
    state.OAuthInfo.clientId = ''
    state.OAuthInfo.clientSecret = ''
    state.OAuthInfo.code = ''
    state.OAuthInfo.accessToken = ''

    localStorage.clear()
  },

  updateClientInfo (state, { clientId, clientSecret }) {
    state.OAuthInfo.clientId = clientId
    state.OAuthInfo.clientSecret = clientSecret

    localStorage.setItem('clientId', clientId)
    localStorage.setItem('clientSecret', clientSecret)
  },

  updateOAuthCode (state, code: string) {
    state.OAuthInfo.code = code

    localStorage.setItem('code', code)
  },

  updateOAuthAccessToken (state, accessToken: string) {
    state.OAuthInfo.accessToken = accessToken

    localStorage.setItem('accessToken', accessToken)
  }
}

const statusesMutations: MutationTree = {
  updateStatusMap (state, newStatusMap) {
    Object.keys(newStatusMap).forEach(statusId => {
      // format content
      const newStatus: mastodonentities.Status = newStatusMap[statusId]
      newStatus.content = formatStatusContent(newStatus)

      // format reblog content
      if (newStatus.reblog) newStatus.reblog.content = formatStatusContent(newStatus.reblog)

      // format spoiler text
      if (newStatus.spoiler_text) newStatus.spoiler_text = formatHtml(newStatus.spoiler_text, { externalEmojis: newStatus.emojis })

      // format account display name
      newStatus.account.display_name = formatAccountDisplayName(newStatus.account)

      // fix favourited and reblogged count sync bug
      const checkTarget = newStatus.reblog || newStatus
      if (checkTarget.favourited && checkTarget.favourites_count === 0) checkTarget.favourites_count = 1
      if (checkTarget.reblogged && checkTarget.reblogs_count === 0) checkTarget.reblogs_count = 1

      Vue.set(state.statusMap, statusId, newStatusMap[statusId])
    })
  },

  removeStatusFromStatusMapById (state, statusId: string) {
    Vue.set(state.statusMap, statusId, undefined)
  },

  updateFavouriteStatusById (state, { favourited, mainStatusId, targetStatusId, notSelfOperate }) {
    let targetStatus
    if (mainStatusId === targetStatusId) {
      targetStatus = state.statusMap[targetStatusId]
    } else {
      targetStatus = state.statusMap[mainStatusId].reblog
    }

    if (!targetStatus) return

    if (!notSelfOperate) {
      Vue.set(targetStatus, 'favourited', favourited)
    }

    Vue.set(targetStatus, 'favourites_count', favourited ?
      targetStatus.favourites_count + 1 : targetStatus.favourites_count - 1)
  },

  updateReblogStatusById (state, { reblogged, mainStatusId, targetStatusId, notSelfOperate }) {
    let targetStatus
    if (mainStatusId === targetStatusId) {
      targetStatus = state.statusMap[targetStatusId]
    } else {
      targetStatus = state.statusMap[mainStatusId].reblog
    }

    if (!targetStatus) return

    if (!notSelfOperate) {
      Vue.set(targetStatus, 'reblogged', reblogged)
    }

    Vue.set(targetStatus, 'reblogs_count', reblogged ?
      targetStatus.reblogs_count + 1 : targetStatus.reblogs_count - 1)
  }
}

const mutations: MutationTree = {
  updateMastodonServerUri (state, mastodonServerUri: string) {
    state.mastodonServerUri = mastodonServerUri

    localStorage.setItem('mastodonServerUri', mastodonServerUri)
  },

  updateCurrentUserAccount (state, currentUserAccount: mastodonentities.Account) {
    currentUserAccount.display_name = formatAccountDisplayName(currentUserAccount)

    state.currentUserAccount = currentUserAccount

    localStorage.setItem('currentUserAccount', JSON.stringify(currentUserAccount))
  },

  updateCustomEmojis (state, customEmojis: Array<mastodonentities.Emoji>) {
    state.customEmojis = customEmojis

    localStorage.setItem('customEmojis', JSON.stringify(customEmojis))
  },

  updateContextMap (state, newContextMap) {
    Object.keys(newContextMap).forEach(statusId => {
      Vue.set(state.contextMap, statusId, newContextMap[statusId])
    })
  },

  updateCardMap (state, newCardMap) {
    Object.keys(newCardMap).forEach(statusId => {
      Vue.set(state.cardMap, statusId, newCardMap[statusId])
    })
  },

  ...oAuthInfoMutations,
  ...timelinesMutations,
  ...statusesMutations,
  ...appStatusMutations,
  ...notificationsMutations
}

export default mutations
