<template>
  <div>
    <div class="statuses-page-container" v-loading="!status">
      <status-card class="status-card-container" v-if="status" :status="status" />
    </div>
  </div>
</template>

<route>
{
  "name": "statuses"
}
</route>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
import { mastodonentities } from '@/interface'
import StatusCard from '@/components/StatusCard/index.vue'

@Component({
  components: {
      'status-card': StatusCard
  }
})
class Statuses extends Vue {

  @Action('fetchStatusById') fetchStatusById

  @State('statusMap') statusMap: {
    [statusId: string]: mastodonentities.Status
  }

  @Watch('$route')
  onRouteChanged () {
    this.fetchTargetStatus()
  }

  get status (): mastodonentities.Status {
    return this.statusMap[this.$route.params.statusId]
  }

  mounted () {
    this.fetchTargetStatus()
  }

  async fetchTargetStatus () {
    await this.fetchStatusById(this.$route.params.statusId)
  }
}

export default Statuses
</script>

<style lang="less" scoped>
.statuses-page-container {
  max-width: 530px;
  padding-top: 8px;
  margin: 0 auto 40px;

  .status-card-container {
    @media (max-width: 530px) {
      height: 100%;
    }
  }
}
</style>
