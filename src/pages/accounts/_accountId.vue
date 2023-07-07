<template>
  <DefaultLayout>
    <div class="account-container">
      <account-header />
    </div>
  </DefaultLayout>
</template>

<route>
{
  "name": "accounts"
}
</route>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { } from 'vuex-class'
import AccountHeader from './components/AccountHeader.vue'
import DefaultLayout from '@/layouts/default/index.vue'

@Component({
  components: {
    'account-header': AccountHeader,
    DefaultLayout
  }
})
class Accounts extends Vue {

}

export default Accounts
</script>
