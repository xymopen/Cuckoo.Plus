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
import { computed, defineComponent, onMounted, reactive, ref } from "vue"
import { scrollToTop } from '@/utils'
import { isBaseTimeLine, getTargetStatusesList } from '@/util'
import store from "@/store"

export default defineComponent({
  props: {
    timeLineType: {
      type: String,
      required: true
    },
    hashName: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const translateY = ref(0)

    const currentTimeLineStreamPool = computed(() => {
      const { timeLineType, hashName } = props
      const { streamStatusesPool, statusMap } = store.state

      if (timeLineType === '') return []

      const targetStreamPool = getTargetStatusesList(streamStatusesPool, timeLineType, hashName)

      // filter root status
      return targetStreamPool.filter(id => statusMap[id] && !statusMap[id].in_reply_to_id)
    })

    const buttonStyle = computed(() => {
      return { transform: `translate(-50%, ${translateY}px)` }
    })

    const initWindowScrollEvent = () => {
      let preScrollY = window.scrollY

      const minTranslateY = -110
      const maxTranslateY = 0

      window.addEventListener('scroll', () => {
        if (!currentTimeLineStreamPool.value.length) return

        if (translateY.value >= minTranslateY && translateY.value <= maxTranslateY) {
          translateY.value -= window.scrollY - preScrollY

          if (translateY.value < minTranslateY) translateY.value = minTranslateY
          if (translateY.value > maxTranslateY) translateY.value = maxTranslateY
        }

        preScrollY = window.scrollY

      }, { passive: true })
    }

    onMounted(initWindowScrollEvent)

    const onNoticeButtonClick = async () => {
      await scrollToTop()
      store.dispatch('loadStreamStatusesPool', {
        timeLineType: props.timeLineType,
        hashName: props.hashName,
      })
    }

    return reactive({
      get appStatus () {
        return store.state.appStatus
      },
      currentTimeLineStreamPool,
      buttonStyle,
      onNoticeButtonClick,
    })
  }
})
</script>
