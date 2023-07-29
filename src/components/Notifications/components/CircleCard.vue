<template>
  <mu-list-item :style="notificationCardStyle" v-loading="isLoading" @click="onNotificationCardClick(notification)"
    class="notification-card dialog-theme-bg-color" avatar button :ripple="false">
    <mu-list-item-action class="user-avatar-area">
      <mu-avatar class="user-avatar" @click.stop="onCheckUserAccountPage(notification.account)">
        <img :src="notification.account.avatar" />
      </mu-avatar>
    </mu-list-item-action>
    <mu-list-item-content>
      <mu-list-item-title class="user-display-name primary-read-text-color"
        v-html="getAccountDisplayName(notification.account)" @click.stop="onCheckUserAccountPage(notification.account)" />
      <mu-list-item-sub-title class="notification-content primary-read-text-color"
        v-html="getNotificationSubTitle(notification)" @click.prevent="onNotificationContentClick" />
    </mu-list-item-content>
    <mu-list-item-action v-if="shouldShowFollowOperateBtn(notification, followOperateBtnTypes.FOLLOW)">
      <mu-icon @click.stop="onFollowingAccount(notification.account.id)" class="follow-action" value="person_add" />
    </mu-list-item-action>
    <mu-list-item-action v-if="shouldShowFollowOperateBtn(notification, followOperateBtnTypes.UN_FOLLOW)">
      <mu-icon @click.stop="onUnFollowingAccount(notification.account.id)"
        class="follow-action secondary-theme-text-color" value="person_add_disabled" />
    </mu-list-item-action>
  </mu-list-item>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue"
import { mapState, mapActions } from "vuex"
import { NotificationTypes, ThemeNames } from '@/constant'
import { mastodonentities } from '@/interface'
import { getAccountDisplayName } from "@/util"

export default defineComponent({
  props: {
    notification: {
      type: Object as unknown as PropType<mastodonentities.Notification>,
      required: true,
    }
  },
  data () {
    return {
      isLoadingSingleCard: false,
      isLoading: false,
    }
  },
  computed: {
    ...mapState(['appStatus', 'relationships']),
    followOperateBtnTypes () {
      return {
        FOLLOW: 'FOLLOW',
        UN_FOLLOW: 'UN_FOLLOW'
      }
    },
    notificationCardStyle () {
      const themeToStyle: any = {
        [ThemeNames.GOOGLE_PLUS]: {
          backgroundColor: '#fff'
        },
        [ThemeNames.GREEN_LIGHT]: {
          backgroundColor: '#fff'
        }
      }

      themeToStyle[this.appStatus.settings.theme] = themeToStyle[this.appStatus.settings.theme] || {}

      themeToStyle[this.appStatus.settings.theme].position = this.isLoadingSingleCard ? 'relative' : ''

      return themeToStyle[this.appStatus.settings.theme]
    },
  },
  methods: {
    ...mapActions(['followAccountById', 'unFollowAccountById']),
    getAccountDisplayName,
    onNotificationContentClick () { },
    onCheckUserAccountPage (account: mastodonentities.Account) {
      window.open(account.url, "_blank")
    },
    getNotificationSubTitle (notification) {
      return `${this.getAccountDisplayName(notification.account)} ${this.$t(this.$i18nTags.notifications.someone_followed_you)}`
    },
    async onNotificationCardClick (notification: mastodonentities.Notification) {
      window.open(notification.account.url, "_blank")
    },
    shouldShowFollowOperateBtn (notification: mastodonentities.Notification, operateType: string) {
      const isFollowingNotification = notification.type === NotificationTypes.FOLLOW
      let typeCheckOK = false
      if (operateType === this.followOperateBtnTypes.FOLLOW) {
        typeCheckOK = this.relationships[notification.account.id] && !this.relationships[notification.account.id].following
      } else if (operateType === this.followOperateBtnTypes.UN_FOLLOW) {
        typeCheckOK = this.relationships[notification.account.id] && this.relationships[notification.account.id].following
      }
      return isFollowingNotification && typeCheckOK
    },
    async onFollowingAccount (id: string) {
      this.isLoadingSingleCard = true

      this.isLoading = true
      await this.followAccountById(id)
      this.isLoading = false
    },
    async onUnFollowingAccount (id: string) {
      this.isLoadingSingleCard = true

      this.isLoading = true
      await this.unFollowAccountById(id)
      this.isLoading = false
    },
  },
})
</script>

<style lang="pcss" scoped src="../styles/Card.pcss" />

<style lang="pcss" scoped>
.notification-card {
  .follow-action {
    cursor: pointer;
  }
}
</style>
