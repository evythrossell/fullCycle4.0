<script lang="ts" setup>
import { ref } from 'vue'

const user = ref(null)
</script>

<template>
  <h1>SPA - Protected</h1>
  <pre>{{ user }}</pre>
</template>