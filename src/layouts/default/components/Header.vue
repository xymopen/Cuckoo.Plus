<template>
  <div class="cuckoo-header-container">
    <mu-appbar class="header" :class="shouldUseSecondaryThemeHeader && 'dialog-theme-bg-color'" color="primary"
      @click.native="onHeaderBarClick">
      <mu-button v-if="isOAuthUser" icon @click.stop="$emit('menuBtnClick')" slot="left">
        <mu-icon value="menu"></mu-icon>
      </mu-button>
      <div class="host-mastodon-url cuckoo-hub-logo" v-if="isCuckooHubTheme">
        <span>Cuck</span><span>Hub</span>
      </div>
      <span v-if="!isCuckooHubTheme" class="host-mastodon-url" @click="onHostMastodonUrlClick">{{ parsedMastodonServerUri
      }}</span>

      <span class="route-info" v-if="shouldShowRouteInfo">{{ pathToRouteInfo[$route.path].name }}</span>

      <template v-if="isOAuthUser" slot="right">
        <Md>
          <!-- TODO: Remove <div> after migrate to Vue 3 -->
          <div>
            <mu-button ref="notificationBtn" icon @click.stop="onOpenNotificationPanel">
              <mu-icon v-if="appStatus.unreadNotificationCount === 0" value="notifications"></mu-icon>
              <mu-badge class="notification-badge" v-if="appStatus.unreadNotificationCount > 0"
                :content="String(appStatus.unreadNotificationCount)" circle color="primary" />
            </mu-button>
            <mu-popover cover :lazy="false" placement="left-start" style="width: 420px"
              :open.sync="isNotificationsPanelOpened" :trigger="notificationBtnTrigger">
              <NotificationPanel ref="notificationPanel" />
            </mu-popover>
          </div>
          <template #else>
            <RouterLink to="/notifications" custom>
              <template v-slot="{ navigate }">
                <mu-button icon @click.stop="navigate">
                  <mu-icon v-if="appStatus.unreadNotificationCount === 0" value="notifications"></mu-icon>
                  <mu-badge class="notification-badge" v-if="appStatus.unreadNotificationCount > 0"
                    :content="String(appStatus.unreadNotificationCount)" circle color="primary" />
                </mu-button>
              </template>
            </RouterLink>
          </template>
        </Md>
      </template>
    </mu-appbar>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'
import { TimeLineTypes, ThemeNames } from '@/constant'
import { scrollToTop } from '@/utils'
import NotificationPanel from '@/components/NotificationPanel.vue'

// todo 统一位置管理
const pathToRouteInfo = {
  '/timelines/home': {
    name: 'Home'
  },
  '/timelines/public': {
    name: 'Public'
  },
  '/timelines/local': {
    name: 'Local'
  }
}

@Component({
  components: {
    NotificationPanel
  },
  emits: ['menuBtnClick'],
})
class Header extends Vue {

  declare $refs: {
    notificationBtn: any,
    notificationPanel: InstanceType<typeof NotificationPanel> | null,
  }

  notificationBtnTrigger: HTMLButtonElement = null

  @State('appStatus') appStatus

  @State('mastodonServerUri') mastodonServerUri

  @Getter('isOAuthUser') isOAuthUser

  pathToRouteInfo = pathToRouteInfo

  isNotificationsPanelOpened = false

  @Watch('$route')
  onRouteChanged () {
    if (!this.isOAuthUser) return

    this.isNotificationsPanelOpened = false
  }

  get shouldShowRouteInfo () {
    return this.isOAuthUser && (this.appStatus.documentWidth > 600) && this.pathToRouteInfo[this.$route.path]
  }

  get parsedMastodonServerUri () {
    if (!this.isOAuthUser) {
      return 'Cuckoo.Plus'
    }

    const url = new URL(this.mastodonServerUri)
    return url.host.replace(url.host[0], (c) => c.toUpperCase())
  }

  get shouldUseSecondaryThemeHeader () {
    return this.isCuckooHubTheme
  }

  get isCuckooHubTheme () {
    return this.appStatus.settings.theme === ThemeNames.CUCKOO_HUB
  }

  mounted () {
    if (this.isOAuthUser) {
      this.notificationBtnTrigger = this.$refs.notificationBtn?.$el
    }
  }

  onHostMastodonUrlClick () {
    this.$router.push({ path: '/timelines/home' })
  }

  onHeaderBarClick () {
    scrollToTop()
  }

  onOpenNotificationPanel () {
    this.$refs.notificationPanel!.loadNotifications()
    this.isNotificationsPanelOpened = !this.isNotificationsPanelOpened
  }
}

export default Header
</script>

<style lang="less" scoped>
.header {
  padding-left: 8px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 20141223;

  .host-mastodon-url {
    cursor: pointer;
  }

  .cuckoo-hub-logo {

    span:first-child {
      padding: 5px 5px;
      font-weight: 600;
    }

    span:last-child {
      padding: 5px 10px;
      background-color: #FF9900;
      border-radius: 7px;
      font-weight: 700;
    }
  }

  .route-info {
    height: 32px;
    line-height: 32px;
    padding-left: 10px;
    margin-left: 20px;
  }
}
</style>

<style lang="less">
.cuckoo-header-container {
  .mu-appbar-title {
    display: flex;
    align-items: center;
    padding-left: 0;
  }

  .notification-badge {
    .mu-badge {
      border: 2px solid;
    }
  }
}
</style>
