<template>
  <DefaultLayout>
    <!-- <mu-button slot="right" icon @click="onFetchMoreNotifications">
      <mu-icon value="refresh" />
    </mu-button> -->
    <notifications :style="notificationContainerStyle" :hideHeader="true"
      @shouldShowTargetStatusChanged="onDialogNotificationShowStatusChanged" />
  </DefaultLayout>
</template>


<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue"
import store from '@/store'
import Notifications from '@/components/Notifications/index.vue'

export default defineComponent({
  components: {
    notifications: Notifications
  },
  setup () {
    const shouldShowNotificationDialogHeader = ref(true)
    const notificationContainerStyle = computed(() => {
      return {
        height: shouldShowNotificationDialogHeader.value ? 'auto' : '100%'
      }
    })
    const onDialogNotificationShowStatusChanged = (val: boolean) => {
      shouldShowNotificationDialogHeader.value = !val
    }
    const onFetchMoreNotifications = async () => {
      await store.dispatch('updateNotifications', {
        isFetchMore: true
      })
    }

    return reactive({
      notificationContainerStyle,
      onDialogNotificationShowStatusChanged,
      // onFetchMoreNotifications,
    })
  },
})
</script>
