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
  </mu-list-item>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue"
import { mapState } from "vuex"
import { ThemeNames, I18nTags } from '@/constant'
import { mastodonentities } from '@/interface'
import { prepareRootStatus, formatHtml, getAccountDisplayName } from "@/util"

export default defineComponent({
  props: {
    notification: {
      type: Object as unknown as PropType<mastodonentities.Notification>,
      required: true,
    }
  },
  emits: ['updateCurrentCheckStatus'],
  data () {
    return {
      isLoadingSingleCard: false,
      isLoading: false,
    }
  },
  computed: {
    ...mapState(['appStatus']),
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
    getAccountDisplayName,
    onNotificationContentClick () { },
    onCheckUserAccountPage (account: mastodonentities.Account) {
      window.open(account.url, "_blank")
    },
    getNotificationSubTitle (notification) {
      return this.$t(I18nTags.notifications.boosted_your_status) + ": " + formatHtml(notification.status.content)
    },
    async onNotificationCardClick (notification: mastodonentities.Notification) {
      if (notification.status) {
        this.isLoadingSingleCard = false

        this.isLoading = true
        const targetStatus = await prepareRootStatus(notification.status)
        this.isLoading = false

        this.$emit('updateCurrentCheckStatus', targetStatus)
      }
    },
  },
})
</script>

<style lang="pcss" scoped src="../styles/Card.pcss" />
