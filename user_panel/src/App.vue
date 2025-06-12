<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { darkTheme } from 'naive-ui'
import { useColorMode } from '@vueuse/core'

const { system } = useColorMode()
const theme = computed(() => (system.value === 'dark' ? darkTheme : null))
</script>