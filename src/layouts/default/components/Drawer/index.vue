<template>
  <mu-drawer class="cuckoo-drawer default-theme-bg-color primary-read-text-color" :open="isDrawerOpened"
    @update:open="$emit('update:isDrawerOpened', $event)" :style="drawerStyle" :docked="shouldDrawerDocked"
    :z-depth="shouldDrawerDocked ? 0 : 16">

    <search />

    <mu-divider />

    <mu-list :value="$route.path" toggle-nested>

      <mu-list-item button value="/timelines/home" ripple
        @click="onBaseRouteItemClick('/timelines/home')">
        <mu-list-item-action>
          <mu-icon value="home" />
        </mu-list-item-action>
        <mu-list-item-title>{{ $t($i18nTags.drawer.home) }}</mu-list-item-title>

      </mu-list-item>

      <mu-list-item button value="/timelines/public" ripple
        @click="onBaseRouteItemClick('/timelines/public')">
        <mu-list-item-action>
          <mu-icon value="public" />
        </mu-list-item-action>
        <mu-list-item-title>{{ $t($i18nTags.drawer.public) }}</mu-list-item-title>

      </mu-list-item>

      <mu-list-item button value="/timelines/local" ripple
        @click="onBaseRouteItemClick('/timelines/local')">
        <mu-list-item-action>
          <mu-icon value="people" />
        </mu-list-item-action>
        <mu-list-item-title>{{ $t($i18nTags.drawer.local) }}</mu-list-item-title>

      </mu-list-item>

      <mu-list-item button value="/timelines/tag" nested>
        <mu-list-item-action>
          <mu-icon value="loyalty" />
        </mu-list-item-action>
        <mu-list-item-title>{{ $t($i18nTags.drawer.tag) }}</mu-list-item-title>

        <mu-list-item-action>
          <mu-icon class="toggle-icon" size="24" value="keyboard_arrow_down" />
        </mu-list-item-action>

        <mu-list-item class="hash-list-item" slot="nested" button v-for="(hashName, index) in hashList"
          :value="'/timelines/tag/' + hashName" :key="index" @click="onHashRouteItemClick(hashName)">
          <mu-list-item-title># {{ hashName }}</mu-list-item-title>
          <mu-list-item-action>
            <mu-button class="delete-hash-btn" icon @click.stop="onDeleteHash(hashName)">
              <mu-icon value="delete" />
            </mu-button>
          </mu-list-item-action>
        </mu-list-item>

      </mu-list-item>

      <mu-list-item button value="profile" ripple @click="onProfileClick">
        <mu-list-item-action>
          <mu-icon value="person" />
        </mu-list-item-action>
        <mu-list-item-title>{{ $t($i18nTags.drawer.profile) }}</mu-list-item-title>

      </mu-list-item>

    </mu-list>

    <mu-divider />

    <mu-list class="secondary-list">
      <mu-list-item button to="/settings" @click="onSecondaryItemClick">
        <mu-list-item-title class="secondary-read-text-color">{{ $t($i18nTags.drawer.settings) }}</mu-list-item-title>
      </mu-list-item>
    </mu-list>

    <div class="bottom-info-area secondary-read-text-color">
      <div style="margin-bottom: 6px">
        <a class="secondary-read-text-color">
          ©{{ (new Date().getFullYear()).toString().split('').reverse().join('') }} Cuckoo</a>
        •
        <a class="secondary-read-text-color link-text" href="https://github.com/NanaMorse/Cuckoo.Plus"
          target="_blank">Github</a>
      </div>
      <a class="secondary-read-text-color link-text" :href="mastodonServerUri" target="_blank">{{
        $t($i18nTags.drawer.toHostInstance) }}</a>
      <div style="margin-top: 6px">
        <a class="secondary-read-text-color link-text" @click="onTryLogout">{{ $t($i18nTags.drawer.logout) }}</a>
      </div>
    </div>

  </mu-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { mapState, mapMutations, mapActions } from "vuex"
import { isBaseTimeLine } from '@/util'
import { TimeLineTypes, UiWidthCheckConstants, RoutersInfo, I18nTags } from '@/constant'
import Search from './Search.vue'
import { Lg } from "packages/breakpoints/mixins"

export default defineComponent({
  mixins: [Lg('shouldDrawerDocked')],
  components: {
    'search': Search
  },
  props: {
    isDrawerOpened: {
      type: Boolean
    },
  },
  emits: ['update:isDrawerOpened'],
  computed: {
    ...mapState(['currentUserAccount', 'appStatus', 'mastodonServerUri']),
    hashList() {
      return this.appStatus.settings.tags
    },
    drawerStyle () {
      if (this.shouldDrawerDocked) {
        return {
          top: '64px',
          width: `${UiWidthCheckConstants.DRAWER_DESKTOP_WIDTH}px`
        }
      } else {
        return {
          width: `${UiWidthCheckConstants.DRAWER_MOBILE_WIDTH}px`
        }
      }
    },
  },
  watch: {
    shouldDrawerDocked () {
      if (!this.shouldDrawerDocked && this.isDrawerOpened) {
        this.$emit('update:isDrawerOpened', false)
      }
    }
  },
  mounted () {
    this.$emit('update:isDrawerOpened', this.shouldDrawerDocked)
  },
  methods: {
    ...mapMutations(['updateTags']),
    ...mapActions(['updateTimeLineStatuses']),
    onProfileClick() {
      // todo
      // this.$router.push({
      //   name: 'accounts',
      //   params: {
      //     accountId: this.currentUserAccount.id
      //   }
      // })

      return window.open(this.currentUserAccount.url, '_blank')
    },
    async onBaseRouteItemClick (targetPath: string) {
      const clickedRouterValue = ({
        '/timelines/home': TimeLineTypes.HOME,
        '/timelines/public': TimeLineTypes.PUBLIC,
        '/timelines/local': TimeLineTypes.LOCAL,
        '/timelines/tag': TimeLineTypes.TAG,
      })[targetPath]

      if (targetPath === this.$route.path) {
        this.fetchTimeLineStatuses(clickedRouterValue)
      } else if (isBaseTimeLine(clickedRouterValue)) {
        this.$router.push(targetPath)
      }

      window.scrollTo(0, 0)
    },

    async onHashRouteItemClick (hashName: string) {
      const targetPath = '/timelines/tag/' + hashName

      if (targetPath === this.$route.path) {
        this.fetchTimeLineStatuses(TimeLineTypes.TAG, hashName)
      } else {
        this.$router.push(targetPath)
      }

      window.scrollTo(0, 0)
    },

    onSecondaryItemClick () {
      window.scrollTo(0, 0)
    },

    async onTryLogout () {
      const doLogout = (await this.$confirm(this.$t(this.$i18nTags.drawer.do_logout_message_confirm), {
        okLabel: this.$t(this.$i18nTags.drawer.do_logout_message_yes),
        cancelLabel: this.$t(this.$i18nTags.drawer.do_logout_message_no),
      })).result
      if (doLogout) {
        localStorage.clear()
        location.href = '/'
      }
    },

    onDeleteHash (hashName: string) {
      // todo only tag has hash now
      const newTags = [...this.appStatus.settings.tags]
      newTags.splice(newTags.indexOf(hashName as any), 1)

      this.updateTags(newTags)
    },

    /**
    * @desc if clicked timeline item is just current timeline
    * */
    async fetchTimeLineStatuses (timeLineType: string, hashName = '') {
      await this.updateTimeLineStatuses({
        isFetchMore: true,
        timeLineType, hashName
      })
    },

    onOpenHostInstance () {
      window.open(this.mastodonServerUri, '_blank');
    },
  },
})
</script>

<style lang="less" scoped>
.cuckoo-drawer {
  .hash-list-item {

    .delete-hash-btn {
      display: none;
    }

    &:hover {

      .delete-hash-btn {
        display: unset;
      }

    }
  }

  .bottom-info-area {
    position: absolute;
    bottom: 0;
    margin: 0 0 24px 24px;
    font-size: 13px;

    .link-text {
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>

<style lang="less">
.cuckoo-drawer {
  // todo current size is not fit to every screen
  //background: url("https://i.imgur.com/vKv5bn5.png") no-repeat left bottom;
  //background-size: 42%;

  .mu-item-wrapper {
    -webkit-transition: background-color .3s cubic-bezier(0, 0, 0.2, 1);
    -moz-transition: background-color .3s cubic-bezier(0, 0, 0.2, 1);
    -ms-transition: background-color .3s cubic-bezier(0, 0, 0.2, 1);
    -o-transition: background-color .3s cubic-bezier(0, 0, 0.2, 1);
    transition: background-color .3s cubic-bezier(0, 0, 0.2, 1);
  }

  .toggle-icon {
    transform: rotate(0);
    transition: transform .3s cubic-bezier(.23, 1, .32, 1), -webkit-transform .3s cubic-bezier(.23, 1, .32, 1)
  }

  .mu-item__open .toggle-icon {
    transform: rotate(180deg);
  }
}
</style>
