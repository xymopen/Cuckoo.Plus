<template>
  <div>
    <cuckoo-plus-header @menuBtnClick="isDrawerOpened = !isDrawerOpened" />
    <cuckoo-plus-drawer v-if="isOAuthUser" :isDrawerOpened.sync="isDrawerOpened" />
    <mu-container :fluid="true" class="app-content" :style="appContentStyle">
      <slot />
    </mu-container>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters, mapState } from "vuex";
import Header from './components/Header.vue'
import Drawer from './components/Drawer/index.vue'
import { UiWidthCheckConstants } from '@/constant'
import { Lg } from "packages/breakpoints/mixins"

export default defineComponent({
  name: 'DefaultLayout',
  mixins: [Lg('isNotMobileMode')],
  components: {
    'cuckoo-plus-header': Header,
    'cuckoo-plus-drawer': Drawer,
  },
  data () {
    return {
      isDrawerOpened: false,
    }
  },
  computed: {
    ...mapState(['appStatus']),
    ...mapGetters(['isOAuthUser']),
    appContentStyle () {
      if (this.isDrawerOpened &&
        this.isOAuthUser && this.isNotMobileMode) {
        return {
          paddingLeft: `${UiWidthCheckConstants.DRAWER_DESKTOP_WIDTH}px`
        }
      }
    }
  }
})
</script>

<style scoped src="../styles/app-content.css" />
