<template>
  <mu-load-more class="notification-list" loading-text="" @load="loadNotifications(true)"
    :loading="isLoadingNotifications">

    <mu-list textline="three-line">
      <template v-for="(notification, index) in notificationsToShow">
        <CircleCard v-if="notification.type === NotificationTypes.FOLLOW" :key="index" :notification="notification"/>
        <Plus1Card v-else-if="notification.type === NotificationTypes.FAVOURITE" :key="index" :notification="notification"
          @updateCurrentCheckStatus="$emit('updateCurrentCheckStatus', $event)" />
        <RepostCard v-else-if="notification.type === NotificationTypes.REBLOG" :key="index" :notification="notification"
          @updateCurrentCheckStatus="$emit('updateCurrentCheckStatus', $event)" />
        <MentionCard v-else-if="notification.type === NotificationTypes.MENTION" :key="index" :notification="notification"
          @updateCurrentCheckStatus="$emit('updateCurrentCheckStatus', $event)" />
      </template>
    </mu-list>

  </mu-load-more>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { mapActions, mapState } from "vuex"
import CircleCard from './components/CircleCard.vue'
import MentionCard from './components/MentionCard.vue'
import Plus1Card from './components/Plus1Card.vue'
import RepostCard from './components/RepostCard.vue'
import { NotificationTypes } from '@/constant'
import { createWS } from '@/api/streaming'
import emitNotification from './emit-notification'

export default defineComponent({
  components: {
    CircleCard,
    MentionCard,
    Plus1Card,
    RepostCard,
  },
  data () {
    return {
      closeNotificationStream: null as null | (() => void),
      isLoadingNotifications: false
    }
  },
  mounted () {
    this.closeNotificationStream = createWS({ stream: 'user' }, 'notification', emitNotification)
  },
  beforeDestroy () {
    this.closeNotificationStream!()
  },
  computed: {
    ...mapState(['notifications', 'contextMap', 'appStatus']),
    NotificationTypes () { return NotificationTypes },
    notificationsToShow () {
      const allDescendantsToMute = []

      this.appStatus.settings.muteMap.statusList.forEach(statusId => {
        if (this.contextMap[statusId]) {
          allDescendantsToMute.push(...this.contextMap[statusId].descendants, statusId)
        }
      })

      return this.notifications.filter(notification => {
        let toMuteByStatus, toMuteByUser

        if (notification.status) toMuteByStatus = allDescendantsToMute.indexOf(notification.status.id) !== -1
        if (notification.account) toMuteByUser = this.appStatus.settings.muteMap.userList.indexOf(notification.account.id) !== -1

        return !toMuteByStatus && !toMuteByUser
      })
    },
  },
  methods: {
    ...mapActions(['updateNotifications']),
    async loadNotifications (isLoadMore, isFetchMore = false) {
      this.isLoadingNotifications = true
      await this.updateNotifications({
        isLoadMore,
        isFetchMore
      })
      this.isLoadingNotifications = false
    },
  },
})
</script>

<style lang="less">
.notification-list {

  .mu-item-wrapper.hover {
    background-color: inherit !important;
    cursor: pointer;
  }

  .notification-content {
    >p {
      display: inline
    }
  }

  .mu-item-sub-title {
    p {
      margin: 0
    }
  }

  .mu-avatar {
    margin: 0;
  }
}
</style>
