<template>
  <div>
    <div class="timelines-container" ref="timelinesContainer" v-loading="isInitLoading">

      <mu-load-more :key="currentTimeLineName" @load="loadStatuses(true)" :loading="!isInitLoading && isLoading"
        loading-text="">
        <div v-masonry-container :style="statusCardsContainerStyle" class="status-cards-container">

          <post-status-stamp-card @click="showNewPostDialogPanel" class="status-card-container"
            :style="[statusCardStyle, currentFocusCardId === '-1' && cardFocusStyle]" />

          <template
            v-for="status in getRootStatuses(currentTimeLineName.split('/')[0], currentTimeLineName.split('/')[1])">
            <status-card v-masonry-item class="status-card-container"
              :ref="`${currentTimeLineName}_statusCard_${status.id}`" @statusCardFocus="onStatusCardFocus(status.id)"
              :shouldCollapseContent="true" :key="status.id" :status="status" :style="[statusCardStyle,
                currentFocusCardId === status.id && cardFocusStyle]" />
          </template>

          <p class="no-more-status-notice secondary-read-text-color"
            v-if="currentTimeLineCannotLoadMore && (count === waterfallLineCount)">
            {{ $t($i18nTags.timeLines.no_load_more_status_notice) }}
          </p>

        </div>
      </mu-load-more>

      <mu-button fab class="post-new-status-button" color="primary" v-show="!isPostStatusDialogOpening"
        @click="showNewPostDialogPanel">
        <mu-icon value="edit" />
      </mu-button>

      <post-status-dialog :open.sync="isPostStatusDialogOpening" />

      <new-status-notice-button :time-line-type="timeLineType" :hash-name="hashName" />
    </div>
  </div>
</template>

<route-meta>
{
  "needOAuth": true
}
</route-meta>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Action, State, Getter } from 'vuex-class'
import { RoutersInfo, TimeLineTypes, UiWidthCheckConstants, ThemeNames } from '@/constant'
import { mastodonentities } from '@/interface'
import { documentGlobalEventBus } from '@/util'
import { scrollToTop } from '@/utils'
import StatusCard from '@/components/StatusCard/index.vue'
import PostStatusDialog from '@/components/PostStatusDialog.vue'
import NewStatusNoticeButton from '@/pages-components/timelines/NewStatusNoticeButton.vue'
import PostStatusStampCard from '@/pages-components/timelines/PostStatusStampCard.vue'

const noneCardFocusId = '-2'
const stampCardFocusId = '-1'

const autoFocusScrollPadding = 24
const headerHeight = 64

const timelineInitStatusMap = {}

function hasCurrentTimeLineInit ({ timeLineType, hashName }) {

  const key = hashName ? `${timeLineType}/${hashName}` : timeLineType
  return timelineInitStatusMap[key]
}

function setCurrentTimeLineHasInit ({ timeLineType, hashName }) {

  const key = hashName ? `${timeLineType}/${hashName}` : timeLineType
  timelineInitStatusMap[key] = true
}

function getFitStatusWidth (containerWidth, lineCount): number {
  return (containerWidth - (lineCount - 1) * UiWidthCheckConstants.TIMELINE_WATER_FALL_GUTTER) / lineCount
}

function calcFitWaterFallLineCount (containerWidth: number, testLineCount: number) {
  if (testLineCount <= 1) return 1

  const testStatusCardWidth = getFitStatusWidth(containerWidth, testLineCount)

  if (testStatusCardWidth > UiWidthCheckConstants.STATUS_CARD_MIN_WIDTH) {
    return testLineCount
  } else {
    return calcFitWaterFallLineCount(containerWidth, testLineCount - 1)
  }
}

@Component({
  components: {
    'status-card': StatusCard,
    'post-status-dialog': PostStatusDialog,
    'new-status-notice-button': NewStatusNoticeButton,
    'post-status-stamp-card': PostStatusStampCard,
  }
})
class TimeLines extends Vue {

  $refs: {
    timelinesContainer: HTMLDivElement
  }

  @State('appStatus') appStatus

  @State('timelines') timelines

  @Getter('getRootStatuses') getRootStatuses

  @Action('updateTimeLineStatuses') updateTimeLineStatuses

  @Action('loadStreamStatusesPool') loadStreamStatusesPool

  /**
  * @description 这种loading应该是全屏白色遮罩
  **/
  isInitLoading = false

  /**
  * @description 这种则只需要转圈就行
  * */
  isLoading = false

  noLoadMoreTimeLineList: Array<string> = []

  isPostStatusDialogOpening = false

  currentFocusCardId: string = noneCardFocusId

  get cardFocusStyle () {
    const darkThemeList = [ThemeNames.DARK, ThemeNames.CUCKOO_HUB]
    const shadowBaseColor = darkThemeList.indexOf(this.appStatus.settings.theme) !== -1 ? 255 : 0
    return {
      'box-shadow': `0 0 20px rgba(${shadowBaseColor}, ${shadowBaseColor}, ${shadowBaseColor},0.3)`
    }
  }

  get allTimeLineNameList (): Array<string> {
    const result = [
      TimeLineTypes.HOME, TimeLineTypes.PUBLIC, TimeLineTypes.LOCAL
    ];
    [TimeLineTypes.TAG, TimeLineTypes.LIST].forEach(secondType => {
      Object.keys(this.timelines[secondType]).forEach(hashName => {
        if (Array.isArray(this.timelines[secondType][hashName])) {
          result.push(`${secondType}/${hashName}`)
        }
      })
    })

    return result
  }

  get currentTimeLineName (): string {
    const { timeLineType, hashName } = this

    return hashName ? `${timeLineType}/${hashName}` : timeLineType
  }

  get currentRootStatuses (): Array<mastodonentities.Status> {
    const { timeLineType, hashName } = this

    return this.getRootStatuses(timeLineType, hashName).filter(status => status.id)
  }

  get currentTimeLineCannotLoadMore () {
    const { timeLineType, hashName } = this

    return this.noLoadMoreTimeLineList.indexOf(`${timeLineType}/${hashName}`) !== -1
  }

  get contentAreaWidth (): number {
    return this.appStatus.documentWidth - UiWidthCheckConstants.DRAWER_DESKTOP_WIDTH
  }

  get timeLineTypeAndHashName () {
    const route = this.$route
    let timeLineType = '', hashName = ''
    if (route.name === RoutersInfo.defaulttimelines.name) {
      timeLineType = route.params.timeLineType
    }
    else if (route.name === RoutersInfo.tagtimelines.name) {
      timeLineType = TimeLineTypes.TAG
      hashName = route.params.tagName
    }
    else if (route.name === RoutersInfo.listtimelines.name) {
      timeLineType = TimeLineTypes.LIST
      hashName = route.params.listName
    }

    return { timeLineType, hashName }
  }

  get timeLineType () {
    return this.timeLineTypeAndHashName.timeLineType
  }

  get hashName () {
    return this.timeLineTypeAndHashName.hashName
  }

  @Watch('$route')
  async onRouteChanged () {
    this.currentFocusCardId = noneCardFocusId

    if (!hasCurrentTimeLineInit({ timeLineType: this.timeLineType, hashName: this.hashName })) {
      if (this.currentRootStatuses.length === 0) {
        this.isInitLoading = true
      }
      await this.loadStatuses()
      this.isInitLoading = false
      setCurrentTimeLineHasInit({ timeLineType: this.timeLineType, hashName: this.hashName })
    } else {
      this.loadStreamStatusesPool({ timeLineType: this.timeLineType, hashName: this.hashName })
      this.loadStatuses(false, true)
    }

  }

  @Watch('currentRootStatuses')
  onCurrentRootStatusesChanged () {
    this.$nextTick(async () => {
      // load more to show scroll
      // todo maybe we could find a better way to serve this?
      // if (this.$refs.timelinesContainer.clientHeight < window.screen.availHeight) {
      //   this.isInitLoading = true
      //   this.isLoading = false
      //   await this.loadStatuses(true)
      //   this.isInitLoading = false
      // }
    })
  }

  async mounted () {
    this.onRouteChanged()
    // @todo 可能存在重复绑定事件问题
    documentGlobalEventBus.on('keydown', e => this.onTimeLinePageKeyDown(e), true)
  }

  async loadStatuses (isLoadMore = false, isFetchMore = false) {

    if (isLoadMore && this.currentTimeLineCannotLoadMore) return

    if (this.isLoading) return

    this.isLoading = true

    const preStatusesLength = this.currentRootStatuses.length
    const { timeLineType, hashName } = this
    await this.updateTimeLineStatuses({
      isLoadMore,
      isFetchMore,
      timeLineType,
      hashName
    })

    const newStatusesLength = this.currentRootStatuses.length

    if (isLoadMore && (preStatusesLength === newStatusesLength)) {
      this.noLoadMoreTimeLineList.push(`${timeLineType}/${hashName}`)
    }

    this.isLoading = false
  }

  showNewPostDialogPanel () {
    // todo handle history.back() event
    // use vue router?
    this.isPostStatusDialogOpening = true
  }

  get waterfallLineCount () {
    if (!this.appStatus.settings.multiLineMode) return 1

    return calcFitWaterFallLineCount(this.contentAreaWidth - UiWidthCheckConstants.TIMELINE_WATER_FALL_GUTTER * 2, this.appStatus.settings.maximumNumberOfColumnsInMultiLineMode)
  }

  get statusCardsContainerStyle () {
    if (this.waterfallLineCount === 1) {
      return {
        maxWidth: `${UiWidthCheckConstants.STATUS_CARD_MAX_WIDTH}px`
      }
    } else {
      const width = this.statusCardMultiLineFinalWidth * this.waterfallLineCount +
        UiWidthCheckConstants.TIMELINE_WATER_FALL_GUTTER * (this.waterfallLineCount - 1)

      return { width: `${width}px` }
    }
  }

  get statusCardMultiLineFinalWidth () {
    let fitWidth = getFitStatusWidth(this.contentAreaWidth - UiWidthCheckConstants.TIMELINE_WATER_FALL_GUTTER * 2, this.waterfallLineCount)

    if (fitWidth > UiWidthCheckConstants.STATUS_CARD_MAX_WIDTH) fitWidth = UiWidthCheckConstants.STATUS_CARD_MAX_WIDTH

    return fitWidth
  }

  get statusCardStyle () {
    if (this.waterfallLineCount === 1) return null

    return {
      width: `${this.statusCardMultiLineFinalWidth}px`
    }
  }

  onTimeLinePageKeyDown (e: KeyboardEvent) {
    if (this.isPostStatusDialogOpening) return

    const knownKeyList = ['j', 'k', 'Enter']
    if (knownKeyList.indexOf(e.key) === -1) return

    e.stopPropagation()
    e.preventDefault()

    switch (e.key) {
      case 'j': {
        return this.onFocusNextCard()
      }

      case 'k': {
        return this.onFocusPreviousCard()
      }

      case 'Enter': {
        return this.activeCard()
      }
    }
  }

  onFocusNextCard () {
    if (this.currentFocusCardId === this.currentRootStatuses[this.currentRootStatuses.length - 1].id) return

    if (this.currentFocusCardId === noneCardFocusId) {
      this.currentFocusCardId = stampCardFocusId
    } else if (this.currentFocusCardId === stampCardFocusId) {
      this.currentFocusCardId = this.currentRootStatuses[0].id
    } else {
      const currentIndex = this.currentRootStatuses
        .findIndex(status => status.id === this.currentFocusCardId)

      if (currentIndex === -1) return console.error('what the f?')

      this.currentFocusCardId = this.currentRootStatuses[currentIndex + 1].id
    }

    this.showTargetCardInViewPort(true)
  }

  onFocusPreviousCard () {
    if (this.currentFocusCardId === noneCardFocusId) return

    if (this.currentFocusCardId === stampCardFocusId) {
      this.currentFocusCardId = noneCardFocusId
    } else {
      const currentIndex = this.currentRootStatuses
        .findIndex(status => status.id === this.currentFocusCardId)

      if (currentIndex === -1) return console.error('what the f?')

      if (currentIndex === 0) {
        this.currentFocusCardId = stampCardFocusId
      } else {
        this.currentFocusCardId = this.currentRootStatuses[currentIndex - 1].id
      }
    }

    this.showTargetCardInViewPort(false)
  }

  activeCard () {
    if (this.currentFocusCardId === noneCardFocusId) return

    if (this.currentFocusCardId === stampCardFocusId) {
      return this.isPostStatusDialogOpening = true
    }

    const { timeLineType } = this
    const targetStatusCard = this.$refs[`${timeLineType}_statusCard_${this.currentFocusCardId}`][0]
    targetStatusCard.onReplyToStatus(targetStatusCard.status)
  }

  onStatusCardFocus (statusId: string) {
    this.currentFocusCardId = statusId
  }

  showTargetCardInViewPort (toNext: boolean) {
    let scrollToTarget = null
    const $html = document.querySelector('html')

    if (this.currentFocusCardId === stampCardFocusId || this.currentFocusCardId === noneCardFocusId) {
      scrollToTarget = 0
    } else {

      const { timeLineType } = this
      const $targetStatusCardRef: HTMLDivElement = this.$refs[`${timeLineType}_statusCard_${this.currentFocusCardId}`][0].$el

      const bounding = $targetStatusCardRef.getBoundingClientRect()

      const topDistance = bounding.top - autoFocusScrollPadding - headerHeight
      const bottomDistance = bounding.bottom + autoFocusScrollPadding - window.innerHeight

      if (topDistance < 0) {
        scrollToTarget = $html.scrollTop + topDistance
      } else if (toNext && (bottomDistance > 0)) {
        if (bottomDistance > 0) {
          scrollToTarget = $html.scrollTop + bottomDistance
        }

        if (this.currentFocusCardId === this.currentRootStatuses[this.currentRootStatuses.length - 1].id) {
          scrollToTarget = $html.scrollHeight
        }
      }

    }

    if (scrollToTarget !== null) {
      scrollToTop()
    }

  }
}

export default TimeLines
</script>

<style lang="less" scoped>
.timelines-container {

  .post-new-status-button {
    position: fixed;
    right: 16px;
    bottom: 16px;

    @media (min-width: 768px) {
      right: 32px;
      bottom: 32px;
    }
  }

  .status-cards-container {
    margin: 0 auto;
    padding-top: 24px;

    .new-status-stamp {
      height: 60px;
    }

    .status-card-container,
    .no-more-status-notice {
      max-width: 530px;
      margin: 0 auto 24px;
      break-inside: avoid;
      box-sizing: border-box;
    }

    .no-more-status-notice {
      text-align: center;
    }

  }

  .new-status-notice-button {
    position: fixed;
    top: 70px;
    left: 50%;
  }

}
</style>
