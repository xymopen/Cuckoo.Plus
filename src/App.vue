<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive" />
    </keep-alive>

    <router-view v-if="!$route.meta.keepAlive" />
    <theme-edit-panel v-if="appStatus.isEditingThemeMode" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Mutation, State } from 'vuex-class'
import * as _ from 'underscore'
import { TimeLineTypes, TITLE } from '@/constant'
import ThemeEditPanel from '@/components/ThemeEditPanel.vue'

@Component({
  components: {
    'theme-edit-panel': ThemeEditPanel
  }
})
class App extends Vue {

  @State('appStatus') appStatus
  @State('timelines') timelines
  @State('contextMap') contextMap
  @State('statusMap') statusMap
  @State('cardMap') cardMap

  @Mutation('updateDocumentWidth') updateDocumentWidth

  mounted () {
    window.addEventListener('resize', _.debounce(() => this.updateDocumentWidth(), 200))
    this.listenToWindowUnload()
  }

  @Watch('appStatus.unreadNotificationCount')
  onUnreadNotificationCountChanged () {
    document.querySelector('title').innerText = this.appStatus.unreadNotificationCount > 0 ?
      `(${this.appStatus.unreadNotificationCount}) ${TITLE}` : `${TITLE}`
  }

  listenToWindowUnload () {
    window.addEventListener('unload', () => {
      // save timelines
      localStorage.setItem(TimeLineTypes.HOME, JSON.stringify(this.timelines[TimeLineTypes.HOME]))

      // save contextMap
      localStorage.setItem('contextMap', JSON.stringify(this.contextMap))

      // save statusMap
      localStorage.setItem('statusMap', JSON.stringify(this.statusMap))

      localStorage.setItem('cardMap', JSON.stringify(this.cardMap))
    })
  }
}

export default App
</script>

<style lang="less">
body {
  height: 100%;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
}

a,
.mu-load-more {
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
}

// header z-index 20141223
// drawer z-index 20141224

.mu-loading-wrap {
  z-index: 20141222 !important;
}

.drag-over-layer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-emoji {
  width: 20px;
  height: 20px;
  vertical-align: text-bottom;
}

.netease-music-iframe {
  display: block;
  width: 100%;
}

.youtube-video-iframe {
  display: block;
  width: 100%;
}

@keyframes fadein {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
