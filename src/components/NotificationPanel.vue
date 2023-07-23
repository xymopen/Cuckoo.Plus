<template>
  <div class="notification-panel-container base-theme-bg-color"
    :style="isLoadingTargetStatus ? { overflow: 'hidden' } : undefined">

    <keep-alive>
      <div class="notification-list-wrapper" v-show="!shouldShowTargetStatus">
        <mu-flex class="panel-header" calign-items="center">
          <mu-flex justify-content="start" fill>
            <mu-sub-header class="secondary-read-text-color">Notifications</mu-sub-header>
          </mu-flex>
          <mu-flex justify-content="end" fill>
            <mu-button icon @click="$refs.notifications.loadNotifications(false, true)">
              <mu-icon class="primary-read-text-color" value="refresh" />
            </mu-button>
          </mu-flex>
        </mu-flex>
        <Notifications ref="notifications" @updateCurrentCheckStatus="onUpdateCurrentCheckStatus" />
      </div>
    </keep-alive>

    <div v-if="shouldShowTargetStatus" class="notification-status-check-area">
      <mu-appbar color="secondary">
        <mu-button slot="left" icon @click.stop="shouldShowTargetStatus = false">
          <mu-icon value="arrow_back" />
        </mu-button>
      </mu-appbar>
      <div class="notification-status-card-container">
        <status-card class="status-card-container no-limit-reply-area-height" v-if="currentCheckStatus"
          :status="currentCheckStatus" />
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, Ref } from "vue"
import store from '@/store'
import { useRouter } from "vue-router/composables"
import { whenNotMd } from "packages/breakpoints/composables"
import StatusCard from '@/components/StatusCard/index.vue'
import { mastodonentities } from '@/interface'
import Notifications from "@/components/Notifications/index.vue"

export default defineComponent({
  components: {
    'status-card': StatusCard,
    Notifications
  },
  setup (_, ctx) {
    // todo
    const isLoadingTargetStatus = ref(false)

    const shouldShowTargetStatus = ref(false)

    const currentCheckStatus: Ref<mastodonentities.Status | null> = ref(null)

    const notifications = ref<InstanceType<typeof Notifications> | null>(null)

    const $router = useRouter()
    whenNotMd(() => {
      if (shouldShowTargetStatus.value) {
        const targetStatus = currentCheckStatus.value!
        $router.push({
          name: 'statuses',
          params: { statusId: targetStatus.id }
        })
      }
    })

    const onUpdateCurrentCheckStatus = (targetStatus: mastodonentities.Status) => {
      currentCheckStatus.value = targetStatus
      shouldShowTargetStatus.value = true
    }

    ctx.expose({
      loadNotifications () {
        notifications.value!.loadNotifications(false, true)
        store.commit('updateUnreadNotificationCount', 0)
      }
    })

    return reactive({
      isLoadingTargetStatus,
      shouldShowTargetStatus,
      currentCheckStatus,
      notifications,
      onUpdateCurrentCheckStatus,
    })
  }
})
</script>

<style lang="less" scoped>
.notification-panel-container {
  width: 100%;
  height: calc(100vh - 56px) !important;
  max-height: 1200px;
  position: relative;

  .notification-list-wrapper {
    padding: 8px;
    height: 100%;
    overflow: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .notification-status-check-area {
    height: 100%;

    .notification-status-card-container {
      padding-top: 8px;

      .status-card-container {
        height: 100%;
        margin-bottom: 40px;
      }
    }
  }
}
</style>
