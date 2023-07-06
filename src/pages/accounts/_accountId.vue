<template>
  <div class="account-container">
    <account-header />
  </div>
</template>

<route>
{
  "name": "accounts"
}
</route>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { } from 'vuex-class'
import AccountHeader from './components/AccountHeader'

@Component({
  components: {
    'account-header': AccountHeader
  }
})
class Accounts extends Vue {

}

export default Accounts
</script>
