import { UiWidthCheckConstants } from '@/constant'
import { GetterTree } from ".."

const getters: GetterTree = {

  isOAuthUser (state) {
    return state.OAuthInfo.accessToken
  },

  shouldDialogFullScreen (state) {
    return state.appStatus.documentWidth <= UiWidthCheckConstants.POST_STATUS_DIALOG_TOGGLE_WIDTH
  }
}

export default getters
