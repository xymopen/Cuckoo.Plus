import Vue from 'vue'
import { getTargetStatusesList } from '@/util'
import { ThemeNames } from '@/constant'
import ThemeManager from '@/themes'
import { MutationTree } from ".."

export default {
  updateDrawerOpenStatus (state, isDrawerOpened: boolean) {
    state.appStatus.isDrawerOpened = isDrawerOpened
  },

  updateUnreadNotificationCount (state, count: number) {
    state.appStatus.unreadNotificationCount = count
  },

  updateDocumentWidth (state) {
    state.appStatus.documentWidth = window.innerWidth
  },

  updateTheme (state, newThemeName: string) {
    state.appStatus.settings.theme = newThemeName
    localStorage.setItem('theme', newThemeName)
  },

  updateTags (state, newTags: Array<string>) {
    Vue.set(state.appStatus.settings, 'tags', newTags)
    localStorage.setItem('tags', JSON.stringify(newTags))
  },

  updateMultiLineMode (state, newMode: boolean) {
    state.appStatus.settings.multiLineMode = newMode
    localStorage.setItem('multiLineMode', JSON.stringify(newMode))
  },

  updateShowSensitiveContentMode (state, newMode: boolean) {
    state.appStatus.settings.showSensitiveContentMode = newMode
    localStorage.setItem('showSensitiveContentMode', JSON.stringify(newMode))
  },

  updateRealTimeLoadStatusMode (state, newMode: boolean) {
    state.appStatus.settings.realTimeLoadStatusMode = newMode
    localStorage.setItem('realTimeLoadStatusMode', JSON.stringify(newMode))
  },

  updateLocale (state, newLocale: string) {
    state.appStatus.settings.locale = newLocale
    localStorage.setItem('locale', newLocale)
  },

  updateMuteStatusList (state, statusId: string) {
    const statusList: Array<string> = state.appStatus.settings.muteMap.statusList
    if (statusList.indexOf(statusId) === -1) statusList.push(statusId)
    localStorage.setItem('statusMuteList', JSON.stringify(statusList))
  },

  updateMuteUserList (state, userId: string) {
    const userList: Array<string> = state.appStatus.settings.muteMap.userList
    if (userList.indexOf(userId) === -1) userList.push(userId)
    localStorage.setItem('userMuteList', JSON.stringify(userList))
  },

  unShiftStreamStatusesPool (state, { newStatusIdList, timeLineType, hashName }) {
    const targetStatusesPool = getTargetStatusesList(state.appStatus.streamStatusesPool, timeLineType, hashName)
    newStatusIdList = newStatusIdList.filter(id => {
      return targetStatusesPool.indexOf(id) === -1
    })

    targetStatusesPool.unshift(...newStatusIdList)
  },

  clearStreamStatusesPool (state, { timeLineType, hashName }) {
    const targetStatusesPool = getTargetStatusesList(state.appStatus.streamStatusesPool, timeLineType, hashName)
    targetStatusesPool.splice(0, targetStatusesPool.length)
  },

  updatePostPrivacy (state, newPostPrivacy: string) {
    state.appStatus.settings.postPrivacy = newPostPrivacy
    localStorage.setItem('postPrivacy', newPostPrivacy)
  },

  updatePostMediaAsSensitiveMode (state, newMode: boolean) {
    state.appStatus.settings.postMediaAsSensitiveMode = newMode
    localStorage.setItem('postMediaAsSensitiveMode', JSON.stringify(newMode))
  },

  updateOnlyMentionTargetUserMode (state, newMode: boolean) {
    state.appStatus.settings.onlyMentionTargetUserMode = newMode
    localStorage.setItem('onlyMentionTargetUserMode', JSON.stringify(newMode))
  },

  updateMaximumNumberOfColumnsInMultiLineMode (state, newNumber: number) {
    state.appStatus.settings.maximumNumberOfColumnsInMultiLineMode = newNumber
    localStorage.setItem('maximumNumberOfColumnsInMultiLineMode', JSON.stringify(newNumber))
  },

  updateAutoExpandSpoilerTextMode (state, newMode: boolean) {
    state.appStatus.settings.autoExpandSpoilerTextMode = newMode
    localStorage.setItem('autoExpandSpoilerTextMode', JSON.stringify(newMode))
  },

  updateIsEditingThemeMode (state, newMode: boolean) {
    state.appStatus.isEditingThemeMode = newMode
    state.appStatus.shouldShowThemeEditPanel = newMode
  },

  updateShouldShowThemeEditPanel (state, show: boolean) {
    state.appStatus.shouldShowThemeEditPanel = show
  }
} satisfies MutationTree
