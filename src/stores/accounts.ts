import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { AccountType, type Account } from '../types/account'

const STORAGE_KEY = 'accounts-storage'

// localStorage helpers
function loadFromStorage(): Account[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as Account[]
    }
  } catch (e) {
    console.error('couldnt load from storage', e)
  }
  return []
}

function saveToStorage(accounts: Account[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch (e) {
    console.error('save failed:', e)
  }
}

function generateId(): string {
  // timestamp + random string should be unique enough
  return `account-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>(loadFromStorage())

  // auto-save on changes
  watch(
    accounts,
    (newVal) => {
      saveToStorage(newVal)
    },
    { deep: true }
  )

  function getAccountById(id: string): Account | undefined {
    return accounts.value.find((acc) => acc.id === id)
  }

  function getAllAccounts(): Account[] {
    return accounts.value
  }

  function addAccount(account: Omit<Account, 'id'>): string {
    const id = generateId()
    accounts.value.push({
      id,
      label: account.label,
      type: account.type,
      login: account.login,
      password: account.password
    })
    return id
  }

  function updateAccount(
    id: string,
    updates: {
      label?: Account['label']
      type?: Account['type']
      login?: Account['login']
      password?: Account['password']
    }
  ): boolean {
    const idx = accounts.value.findIndex((acc) => acc.id === id)
    if (idx === -1) return false

    const existing = accounts.value[idx]
    if (!existing) return false // typescript being annoying

    accounts.value[idx] = {
      id: existing.id,
      label: updates.label ?? existing.label,
      type: updates.type ?? existing.type,
      login: updates.login ?? existing.login,
      password:
        updates.password !== undefined ? updates.password : existing.password
    }
    return true
  }

  function removeAccount(id: string): boolean {
    const idx = accounts.value.findIndex((acc) => acc.id === id)
    if (idx === -1) return false
    accounts.value.splice(idx, 1)
    return true
  }

  function createEmptyAccount(): string {
    return addAccount({
      label: [],
      type: AccountType.LOCAL,
      login: '',
      password: ''
    })
  }

  return {
    accounts,
    getAccountById,
    getAllAccounts,
    addAccount,
    updateAccount,
    removeAccount,
    createEmptyAccount
  }
})
