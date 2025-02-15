import * as api from '@/api'
import { TimeLineTypes } from '@/constant'
import { ActionTree } from ".."

interface postStatusFormData {
  // The text of the status
  status: string
  // local ID of the status you want to reply to
  inReplyToId?: string
  // Array of media IDs to attach to the status (maximum 4)
  mediaIds?: Array<string>
  // Set this to mark the media of the status as NSFW
  sensitive?: boolean
  // Text to be shown as a warning before the actual content
  spoilerText?: string
  // Either "direct", "private", "unlisted" or "public"
  visibility?: string
  // ISO 639-2 language code of the toot, to skip automatic detection
  language?: string
}

const statuses: ActionTree = {
  async fetchStatusById ({ commit, dispatch }, statusId: string) {
    try {
      const result = await api.statuses.getStatusById(statusId)
      commit('updateStatusMap', { [statusId]: result.data })
      dispatch('updateContextMap', statusId)
      dispatch('updateCardMap', statusId)
    } catch (e) {
      throw new Error(e)
    }
  },

  async updateFavouriteStatusById ({ commit }, { favourited, mainStatusId, targetStatusId }) {
    try {

      if (favourited) {
        api.statuses.favouriteStatusById(targetStatusId)
      } else {
        api.statuses.unFavouriteStatusById(targetStatusId)
      }

      commit('updateFavouriteStatusById', { favourited, mainStatusId, targetStatusId })
    } catch (e) {
      throw new Error(e)
    }
  },

  async updateReblogStatusById ({ commit }, { reblogged, mainStatusId, targetStatusId }) {
    try {
      if (reblogged) {
        api.statuses.reblogStatusById(targetStatusId)
      } else {
        api.statuses.unReblogStatusById(targetStatusId)
      }

      commit('updateReblogStatusById', { reblogged, mainStatusId, targetStatusId })
    } catch (e) {
      throw new Error(e)
    }
  },

  async updateContextMap ({ commit, dispatch }, statusId: string) {
    if (!statusId) throw new Error('unknown status id!')

    try {
      const result = await api.statuses.getStatusContextById(statusId)
      const ancestors = result.data.ancestors
      const descendants = result.data.descendants

      commit('updateContextMap', {
        [statusId]: {
          ancestors: ancestors.map(status => status.id),
          descendants: descendants.map(status => status.id)
        }
      })

      const newStatusMap = {}
      ancestors.forEach(status => newStatusMap[status.id] = status)
      descendants.forEach(status => newStatusMap[status.id] = status)
      commit('updateStatusMap', newStatusMap)
    } catch (e) {

    }
  },

  async updateCardMap (store, statusId: string) {
    const targetStatus = store.state.statusMap[statusId]

    if (store.state.cardMap[statusId]) return

    try {
      const result = await api.statuses.getStatusCardInfoById(statusId)
      store.commit('updateCardMap', { [statusId]: result.data })
    } catch (e) {

    }
  },

  async postStatus ({ commit, dispatch }, { formData, mainStatusId }: {
    formData: postStatusFormData
    mainStatusId: string
  }) {
    try {
      const result = await api.statuses.postStatus(formData)

      // meaning this is a new root post
      if (!formData.inReplyToId) {
        // todo 默认只有home信息流，真的好吗？
        commit('unShiftTimeLineStatuses', {
          newStatusIdList: [result.data.id],
          timeLineType: TimeLineTypes.HOME
        })
      } else {
        // update the reply status's context
        await dispatch('updateContextMap', mainStatusId)
      }

      // update status map
      commit('updateStatusMap', { [result.data.id]: result.data })
      dispatch('updateCardMap', result.data.id)
    } catch (e) {
      throw new Error(e)
    }
  },

  async deleteStatus ({ commit }, { statusId }) {
    // remove from time line
    commit('deleteStatusFromTimeLine', statusId)

    // remove from status map
    commit('removeStatusFromStatusMapById', statusId)

    try {
      await api.statuses.deleteStatusById(statusId)

    } catch (e) {

    }
  }
}

export default statuses
