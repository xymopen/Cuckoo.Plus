<template>
  <mu-load-more class="notification-list" loading-text="" @load="loadNotifications(true)"
    :loading="isLoadingNotifications">

    <mu-list textline="three-line">
      <NotificationCard :notification="notification" @updateCurrentCheckStatus="$emit('updateCurrentCheckStatus', $event)"
        v-for="(notification, index) in notificationsToShow" :key="index" />
    </mu-list>

  </mu-load-more>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { mapActions, mapState } from "vuex"
import NotificationCard from './Card.vue'

export default defineComponent({
  components: {
    NotificationCard
  },
  data () {
    return {
      isLoadingNotifications: false
    }
  },
  computed: {
    ...mapState(['notifications', 'contextMap', 'appStatus']),
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
