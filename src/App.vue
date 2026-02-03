<script setup lang="ts">
  import AccountList from './components/AccountList.vue'
</script>

<template>
  <UApp>
    <main class="app-main">
      <AccountList />
    </main>
  </UApp>
</template>

<style scoped>
  .app-main {
    min-height: 100vh;
    background-color: var(--ui-bg);
  }
</style>
