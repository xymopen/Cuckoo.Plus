<template>
  <div>
    <div class="account-container">
      <div class="account-header">

      </div>
    </div>
  </div>
</template>

<route>
{
  "name": "accounts"
}
</route>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: 'Accounts',
  mounted () {
    const accountId = this.$route.params.accountId
  }
})
</script>
