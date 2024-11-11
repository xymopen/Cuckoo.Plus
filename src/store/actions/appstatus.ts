import * as Api from '@/api'
import { ActionTree } from ".."

const appStatus: ActionTree = {
  async updatePostPrivacy ({ commit }, newPrivacy: string) {
    try {
      await Api.accounts.updateUserAccountInfo({ source: { privacy: newPrivacy } })

      commit('updatePostPrivacy', newPrivacy)
    } catch (e) {
      // todo log error
      commit('updatePostPrivacy', newPrivacy)
    }
  },

  async updatePostMediaAsSensitiveMode ({ commit }, newSensitiveMode: boolean) {
    try {
      await Api.accounts.updateUserAccountInfo({ source: { sensitive: newSensitiveMode } })

      commit('updatePostMediaAsSensitiveMode', newSensitiveMode)
    } catch (e) {
      // todo log error
      commit('updatePostMediaAsSensitiveMode', newSensitiveMode)
    }
  }
}

export default appStatus
