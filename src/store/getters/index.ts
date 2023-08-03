import { mastodonentities } from '@/interface'
import { isBaseTimeLine } from '@/util'
import { UiWidthCheckConstants } from '@/constant'
import { GetterTree } from ".."

const timelines: GetterTree = {
  getRootStatuses (state) {
    return (timeLineType: string, hashName?: string): Array<mastodonentities.Status> => {
      const targetStatusIdList = isBaseTimeLine(timeLineType) ? state.timelines[timeLineType] :
        state.timelines[timeLineType][hashName]

      // todo avoid this situation
      if (!targetStatusIdList) return []

      return targetStatusIdList
        .map(statusId => state.statusMap[statusId]).filter(status => status)
        .filter((status: mastodonentities.Status) => !status.in_reply_to_id)
        .filter(status => {
          const muteStatusList = state.appStatus.settings.muteMap.statusList
          return muteStatusList.indexOf(status.id) === -1
        }).filter(status => {
          const muteUserList = state.appStatus.settings.muteMap.userList
          return muteUserList.indexOf(status.account.id) === -1
        })
    }
  }
}

const getters: GetterTree = {
  ...timelines,

  isOAuthUser (state) {
    return state.OAuthInfo.accessToken
  },

  shouldDialogFullScreen (state) {
    return state.appStatus.documentWidth <= UiWidthCheckConstants.POST_STATUS_DIALOG_TOGGLE_WIDTH
  }
}

export default getters
