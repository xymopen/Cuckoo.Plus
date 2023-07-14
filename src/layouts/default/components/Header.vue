<template>
  <div class="cuckoo-header-container">
    <mu-appbar class="header" :class="shouldUseSecondaryThemeHeader && 'dialog-theme-bg-color'" color="primary"
      @click.native="onHeaderBarClick">
      <mu-button v-if="isOAuthUser" icon @click.stop="onMenuBtnClick" slot="left">
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
            <mu-popover cover lazy placement="left-start" style="width: 420px"
              :open="appStatus.isNotificationsPanelOpened" @close="updateNotificationsPanelStatus(false)"
              :trigger="notificationBtnTrigger">
              <notifications />
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
import { State, Mutation, Action, Getter } from 'vuex-class'
import { TimeLineTypes, UiWidthCheckConstants, ThemeNames } from '@/constant'
import { scrollToTop } from '@/utils'
import Notifications from '@/components/Notifications/index.vue'

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
    'notifications': Notifications
  }
})
class Header extends Vue {

  $refs: {
    notificationBtn: any,
  }

  notificationBtnTrigger: HTMLButtonElement = null

  @State('appStatus') appStatus

  @State('mastodonServerUri') mastodonServerUri

  @Action('updateNotifications') updateNotifications

  @Getter('isOAuthUser') isOAuthUser

  @Mutation('updateDrawerOpenStatus') updateDrawerOpenStatus

  @Mutation('updateNotificationsPanelStatus') updateNotificationsPanelStatus

  @Mutation('updateUnreadNotificationCount') updateUnreadNotificationCount

  pathToRouteInfo = pathToRouteInfo

  @Watch('$route')
  onRouteChanged () {
    if (!this.isOAuthUser) return

    this.updateNotificationsPanelStatus(false)
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

  onMenuBtnClick () {
    this.updateDrawerOpenStatus(!this.appStatus.isDrawerOpened)
  }

  onHostMastodonUrlClick () {
    this.$router.push({ path: '/timelines/home' })
  }

  onHeaderBarClick () {
    scrollToTop()
  }

  onOpenNotificationPanel () {
    this.onFetchMoreNotifications()
    this.updateUnreadNotificationCount(0)
    this.updateNotificationsPanelStatus(!this.appStatus.isNotificationsPanelOpened)
  }

  async onFetchMoreNotifications () {
    await this.updateNotifications({
      isFetchMore: true
    })
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

  .search-input-area {
    width: 720px;
    display: flex;
    margin-left: 28px;
    align-items: center;

    .pre-fix-icon {
      margin-left: 10px;
    }

    .search-input {
      margin: 0;
      padding: 0;
      padding-left: 10px;
    }
  }
}
</style>

<style lang="less">
.cuckoo-header-container {
  .mu-appbar-title {
    display: flex;
    align-items: center;
    padding-left: 0;

    .search-input-area {
      .mu-text-field-input {
        height: 48px;
      }

      .mu-input-line,
      .mu-input-focus-line {
        display: none;
      }
    }
  }

  .notification-badge {
    .mu-badge {
      border: 2px solid;
    }
  }
}
</style>
