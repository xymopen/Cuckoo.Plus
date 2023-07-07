<template>
  <mu-container :fluid="true" class="app-content">
    <slot />
  </mu-container>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: 'PlainLayout',
})
</script>


<style scoped src="./styles/app-content.css" />
