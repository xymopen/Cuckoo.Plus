import store from '@/store'
import { TimeLineTypes } from '@/constant'
import { mastodonentities } from "@/interface"
import { prepareRootStatus } from "@/util"
import { StreamType } from "@/api/streaming"

export const updateStatus = (newStatus: mastodonentities.Status, stream: StreamType) => {
  if (store.state.statusMap[newStatus.id]) return

  const timeLineType = stream.stream === 'hashtag' ? TimeLineTypes.TAG :
    stream.stream === 'list' ? TimeLineTypes.LIST :
    stream.stream === 'public' ? TimeLineTypes.PUBLIC :
    stream.stream === 'user' ? TimeLineTypes.HOME :
    stream.stream === 'direct' ? TimeLineTypes.DIRECT :
    stream.stream === 'public:local' ? TimeLineTypes.LOCAL : undefined
  const hashName = timeLineType === TimeLineTypes.TAG ? stream.tag! : undefined

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
