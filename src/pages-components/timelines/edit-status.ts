import store from '@/store'
import { TimeLineTypes } from '@/constant'
import { mastodonentities } from "@/interface"
import { prepareRootStatus } from "@/util"

export const updateStatus = (newStatus: mastodonentities.Status, timeLineType, hashName?) => {
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

export const deleteStatus = (statusId: string) => {
  if (!store.state.statusMap[statusId]) return

  // remove from time line
  store.commit('deleteStatusFromTimeLine', statusId)

  // remove from status map
  store.commit('removeStatusFromStatusMapById', statusId)
}
