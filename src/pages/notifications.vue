<template>
  <DefaultLayout>
    <!-- <mu-button slot="right" icon @click="onFetchMoreNotifications">
      <mu-icon value="refresh" />
    </mu-button> -->
    <Notifications :style="{ height: 'auto' }" @updateCurrentCheckStatus="onUpdateCurrentCheckStatus" />
  </DefaultLayout>
</template>


<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue"
import store from '@/store'
import Notifications from '@/components/Notifications/index.vue'
import { mastodonentities } from '@/interface'
import { useRouter } from "vue-router/composables";

export default defineComponent({
  components: {
    Notifications
  },
  setup () {
    const onFetchMoreNotifications = async () => {
      await store.dispatch('updateNotifications', {
        isFetchMore: true
      })
    }

    onMounted(onFetchMoreNotifications)

    const $router = useRouter()
    const onUpdateCurrentCheckStatus = (targetStatus: mastodonentities.Status) => {
      $router.push({
        name: 'statuses',
        params: { statusId: targetStatus.id }
      })
    }

    return reactive({
      // onFetchMoreNotifications,
      onUpdateCurrentCheckStatus,
    })
  },
})
</script>
