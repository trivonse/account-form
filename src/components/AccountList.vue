<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useAccountsStore } from '../stores/accounts'
  import AccountItem from './AccountItem.vue'

  const store = useAccountsStore()

  const accounts = computed(() => store.getAllAccounts())
  const showEmpty = ref(accounts.value.length === 0)

  // hide empty state when accounts added
  watch(
    accounts,
    (newVal) => {
      if (newVal.length > 0) {
        showEmpty.value = false
      }
    },
    { immediate: true }
  )

  function onAfterLeave() {
    if (accounts.value.length === 0) {
      showEmpty.value = true
    }
  }

  function handleAddAccount(): void {
    store.createEmptyAccount()
  }

  // keeping this in case we need to do something after delete
  function handleAccountDeleted(id: string): void {
    console.log('deleted account:', id)
  }
</script>

<template>
  <div class="account-list-container">
    <div class="header">
      <div class="header-left">
        <h1 class="page-title">Управление аккаунтами</h1>
        <span v-if="accounts.length > 0" class="account-count">
          {{ accounts.length }}
          {{ accounts.length === 1 ? 'аккаунт' : accounts.length < 5 ? 'аккаунта' : 'аккаунтов' }}
        </span>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="handleAddAccount">
        Добавить
      </UButton>
    </div>

    <!-- TODO: maybe make this collapsible? -->
    <p class="hint-text">
      <strong>Подсказка:</strong> Метки разделяются через "<code>;</code>".
      Например: "админ; юзер; гость"
    </p>

    <div class="accounts-wrapper">
      <TransitionGroup name="list" @after-leave="onAfterLeave">
        <AccountItem
          v-for="account in accounts"
          :key="account.id"
          :account-id="account.id"
          @deleted="handleAccountDeleted"
        />
      </TransitionGroup>
    </div>

    <Transition name="fade">
      <div v-if="showEmpty" class="empty-state">
        <div class="empty-icon">
          <UIcon name="i-lucide-users" />
        </div>
        <p class="empty-text">Пока пусто</p>
        <p class="empty-subtext">Нажми "Добавить" чтобы создать первый аккаунт</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  .account-list-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: -2rem -2rem 1rem -2rem;
    padding: 1rem 2rem;
    background-color: var(--ui-bg);
    border-bottom: 1px solid var(--ui-border);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--ui-text);
    margin: 0;
  }

  .account-count {
    font-size: 0.875rem;
    color: var(--ui-text-muted);
    background-color: var(--ui-bg-muted);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
  }

  .hint-text {
    font-size: 0.875rem;
    color: var(--ui-text-muted);
    margin-bottom: 1.5rem;
    padding: 0.75rem 1rem;
    background-color: var(--ui-bg-elevated);
    border-radius: 6px;
    border-left: 3px solid var(--ui-primary);
  }

  .hint-text code {
    background-color: var(--ui-bg-muted);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-family: monospace;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background-color: var(--ui-bg-muted);
    border-radius: 12px;
    border: 2px dashed var(--ui-border);
  }

  .empty-icon {
    font-size: 3rem;
    color: var(--ui-text-muted);
    margin-bottom: 1rem;
  }

  .empty-text {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--ui-text);
    margin: 0 0 0.5rem 0;
  }

  .empty-subtext {
    font-size: 0.875rem;
    color: var(--ui-text-muted);
    margin: 0;
  }

  .accounts-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* animations */
  .list-enter-active {
    transition: all 0.3s ease;
  }
  .list-leave-active {
    transition: all 0.3s ease;
    position: absolute;
    width: 100%;
  }
  .list-enter-from {
    opacity: 0;
    transform: translateY(-20px);
  }
  .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  .list-move {
    transition: transform 0.3s ease;
  }

  /* empty state fade */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  @media (max-width: 768px) {
    .account-list-container {
      padding: 1rem;
    }
    .header {
      margin: -1rem -1rem 1rem -1rem;
      padding: 1rem;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
    .header-left {
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .page-title {
      font-size: 1.25rem;
      text-align: center;
    }
  }
</style>
