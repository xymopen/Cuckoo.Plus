<template>
  <mu-button v-if="!appStatus.settings.realTimeLoadStatusMode" v-show="currentTimeLineStreamPool.length"
    class="new-status-notice-button" round color="primary" @click="onNoticeButtonClick" :style="buttonStyle">
    <svg style="margin-left: 6px" width="18px" height="18px" viewBox="0 0 48 48" fill="#fff">
      <path fill="none" d="M0 0h48v48H0V0z"></path>
      <path d="M8 24l2.83 2.83L22 15.66V40h4V15.66l11.17 11.17L40 24 24 8 8 24z"></path>
    </svg>
    {{ $tc($i18nTags.timeLines.new_message_notice, currentTimeLineStreamPool.length, {
      count:
        currentTimeLineStreamPool.length
    }) }}
  </mu-button>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import { scrollToTop } from '@/utils'
import { isBaseTimeLine, getTargetStatusesList } from '@/util'

@Component({})
class NewStatusNoticeButton extends Vue {
  @Prop({ required: true })
  declare readonly timeLineType: string

  @Prop({ required: true })
  declare readonly hashName: string

  @State('appStatus') appStatus

  @State('statusMap') statusMap

  @Mutation('unShiftTimeLineStatuses') unShiftTimeLineStatuses

  @Action('loadStreamStatusesPool') loadStreamStatusesPool

  translateY = 0

  get currentTimeLineStreamPool () {
    const { timeLineType, hashName } = this

    if (timeLineType === '') return []

    const targetStreamPool = getTargetStatusesList(this.appStatus.streamStatusesPool, timeLineType, hashName)

    // filter root status
    return targetStreamPool.filter(id => this.statusMap[id] && !this.statusMap[id].in_reply_to_id)
  }

  get buttonStyle () {
    return { transform: `translate(-50%, ${this.translateY}px)` }
  }

  mounted () {
    this.initWindowScrollEvent()
  }

  initWindowScrollEvent () {
    let preScrollY = window.scrollY

    const minTranslateY = -110
    const maxTranslateY = 0

    window.addEventListener('scroll', () => {
      if (!this.currentTimeLineStreamPool.length) return

      if (this.translateY >= minTranslateY && this.translateY <= maxTranslateY) {
        this.translateY -= window.scrollY - preScrollY

        if (this.translateY < minTranslateY) this.translateY = minTranslateY
        if (this.translateY > maxTranslateY) this.translateY = maxTranslateY
      }

      preScrollY = window.scrollY

    }, { passive: true })
  }

  async onNoticeButtonClick () {
    await scrollToTop()
    this.loadStreamStatusesPool({
      timeLineType: this.timeLineType,
      hashName: this.hashName,
     })
  }
}

export default NewStatusNoticeButton
</script>
