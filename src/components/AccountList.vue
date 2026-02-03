<script setup lang="ts">
  import { computed } from 'vue'
  import { useAccountsStore } from '../stores/accounts'
  import AccountItem from './AccountItem.vue'

  const store = useAccountsStore()

  const accounts = computed(() => store.getAllAccounts())

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
      <h1 class="page-title">Account Management</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="handleAddAccount">
        Add Account
      </UButton>
    </div>

    <!-- TODO: maybe make this collapsible? -->
    <p class="hint-text">
      <strong>Hint:</strong> Labels are separated by "<code>;</code>"
      (semicolon). Example: "admin; user; guest"
    </p>

    <div v-if="accounts.length === 0" class="empty-state">
      <div class="empty-icon">
        <UIcon name="i-lucide-users" />
      </div>
      <p class="empty-text">No accounts yet</p>
      <p class="empty-subtext">
        Click the "Add Account" button to create your first account.
      </p>
    </div>

    <div v-else class="accounts-wrapper">
      <TransitionGroup name="list">
        <AccountItem
          v-for="account in accounts"
          :key="account.id"
          :account-id="account.id"
          @deleted="handleAccountDeleted"
        />
      </TransitionGroup>
    </div>

    <div v-if="accounts.length > 0" class="footer-info">
      <span class="account-count">
        {{ accounts.length }} account{{ accounts.length !== 1 ? 's' : '' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
  .account-list-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--ui-text);
    margin: 0;
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
  }

  .footer-info {
    margin-top: 1rem;
    text-align: right;
  }

  .account-count {
    font-size: 0.875rem;
    color: var(--ui-text-muted);
  }

  /* animations */
  .list-enter-active,
  .list-leave-active {
    transition: all 0.3s ease;
  }
  .list-enter-from {
    opacity: 0;
    transform: translateY(-20px);
  }
  .list-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
  .list-move {
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    .account-list-container {
      padding: 1rem;
    }
    .header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.5rem;
      text-align: center;
    }
  }
</style>
