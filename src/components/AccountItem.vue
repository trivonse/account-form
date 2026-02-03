<script setup lang="ts">
  import { reactive, computed, watch, onMounted } from 'vue'
  import { useAccountsStore } from '../stores/accounts'
  import {
    AccountType,
    VALIDATION_CONSTRAINTS,
    type AccountFormState,
    type AccountFormErrors,
    type Label
  } from '../types/account'

  const props = defineProps<{
    accountId: string
  }>()

  const emit = defineEmits<{
    deleted: [id: string]
  }>()

  const store = useAccountsStore()

  // form state
  const formState = reactive<AccountFormState>({
    id: props.accountId,
    labelInput: '',
    type: AccountType.LOCAL,
    login: '',
    password: ''
  })

  const errors = reactive<AccountFormErrors>({
    label: null,
    type: null,
    login: null,
    password: null
  })

  // track which fields user has interacted with
  const touched = reactive({
    label: false,
    type: false,
    login: false,
    password: false
  })

  const typeOptions = [
    { label: 'LDAP', value: AccountType.LDAP },
    { label: 'LOCAL', value: AccountType.LOCAL }
  ]

  const showPassword = computed(() => formState.type === AccountType.LOCAL)

  // parse "label1; label2; label3" into array
  function parseLabels(input: string): Label[] {
    if (!input.trim()) return []

    return input
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((text) => ({ text }))
  }

  function labelsToString(labels: Label[]): string {
    return labels.map((l) => l.text).join('; ')
  }

  // validation stuff
  function validateLabel(): boolean {
    const val = formState.labelInput
    if (val.length > VALIDATION_CONSTRAINTS.LABEL_MAX_LENGTH) {
      errors.label = `Label must be at most ${VALIDATION_CONSTRAINTS.LABEL_MAX_LENGTH} characters`
      return false
    }
    errors.label = null
    return true
  }

  function validateType(): boolean {
    if (!formState.type) {
      errors.type = 'Type is required'
      return false
    }
    // this check is kinda redundant but whatever
    if (!Object.values(AccountType).includes(formState.type)) {
      errors.type = 'Invalid account type'
      return false
    }
    errors.type = null
    return true
  }

  function validateLogin(): boolean {
    const val = formState.login.trim()
    if (!val) {
      errors.login = 'Login is required'
      return false
    }
    if (val.length > VALIDATION_CONSTRAINTS.LOGIN_MAX_LENGTH) {
      errors.login = `Login must be at most ${VALIDATION_CONSTRAINTS.LOGIN_MAX_LENGTH} characters`
      return false
    }
    errors.login = null
    return true
  }

  function validatePassword(): boolean {
    // only required for LOCAL
    if (formState.type !== AccountType.LOCAL) {
      errors.password = null
      return true
    }

    const val = formState.password.trim()
    if (!val) {
      errors.password = 'Password is required for LOCAL accounts'
      return false
    }
    if (val.length > VALIDATION_CONSTRAINTS.PASSWORD_MAX_LENGTH) {
      errors.password = `Password must be at most ${VALIDATION_CONSTRAINTS.PASSWORD_MAX_LENGTH} characters`
      return false
    }
    errors.password = null
    return true
  }

  function validateAll(): boolean {
    const a = validateLabel()
    const b = validateType()
    const c = validateLogin()
    const d = validatePassword()
    return a && b && c && d
  }

  function saveToStore(): void {
    if (!validateAll()) return

    store.updateAccount(props.accountId, {
      label: parseLabels(formState.labelInput),
      type: formState.type,
      login: formState.login.trim(),
      password:
        formState.type === AccountType.LOCAL ? formState.password.trim() : null
    })
  }

  // handlers
  function handleLabelBlur(): void {
    touched.label = true
    validateLabel()
    saveToStore()
  }

  function handleTypeChange(): void {
    touched.type = true
    validateType()

    // clear password when switching to LDAP
    if (formState.type === AccountType.LDAP) {
      formState.password = ''
      errors.password = null
      touched.password = false
    }

    saveToStore()
  }

  function handleLoginBlur(): void {
    touched.login = true
    validateLogin()
    saveToStore()
  }

  function handlePasswordBlur(): void {
    touched.password = true
    validatePassword()
    saveToStore()
  }

  function handleDelete(): void {
    store.removeAccount(props.accountId)
    emit('deleted', props.accountId)
  }

  function initFromStore(): void {
    const account = store.getAccountById(props.accountId)
    if (account) {
      formState.labelInput = labelsToString(account.label)
      formState.type = account.type
      formState.login = account.login
      formState.password = account.password ?? ''
    }
  }

  watch(
    () => props.accountId,
    () => initFromStore()
  )

  onMounted(() => {
    initFromStore()
  })

  // computed classes for error styling
  const labelInputClass = computed(() =>
    touched.label && errors.label ? 'error-input' : ''
  )
  const typeSelectClass = computed(() =>
    touched.type && errors.type ? 'error-input' : ''
  )
  const loginInputClass = computed(() =>
    touched.login && errors.login ? 'error-input' : ''
  )
  const passwordInputClass = computed(() =>
    touched.password && errors.password ? 'error-input' : ''
  )
</script>

<template>
  <div class="account-item">
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Label</label>
        <UInput
          v-model="formState.labelInput"
          placeholder="Enter labels separated by ;"
          :class="labelInputClass"
          :color="touched.label && errors.label ? 'error' : 'neutral'"
          @blur="handleLabelBlur"
        />
        <span v-if="touched.label && errors.label" class="error-message">
          {{ errors.label }}
        </span>
      </div>

      <div class="form-group">
        <label class="form-label">Type *</label>
        <USelect
          v-model="formState.type"
          :items="typeOptions"
          value-key="value"
          :class="typeSelectClass"
          :color="touched.type && errors.type ? 'error' : 'neutral'"
          @update:model-value="handleTypeChange"
        />
        <span v-if="touched.type && errors.type" class="error-message">
          {{ errors.type }}
        </span>
      </div>

      <div class="form-group">
        <label class="form-label">Login *</label>
        <UInput
          v-model="formState.login"
          placeholder="Enter login"
          :class="loginInputClass"
          :color="touched.login && errors.login ? 'error' : 'neutral'"
          @blur="handleLoginBlur"
        />
        <span v-if="touched.login && errors.login" class="error-message">
          {{ errors.login }}
        </span>
      </div>

      <!-- only show for LOCAL accounts -->
      <div v-if="showPassword" class="form-group">
        <label class="form-label">Password *</label>
        <UInput
          v-model="formState.password"
          type="password"
          placeholder="Enter password"
          :class="passwordInputClass"
          :color="touched.password && errors.password ? 'error' : 'neutral'"
          @blur="handlePasswordBlur"
        />
        <span v-if="touched.password && errors.password" class="error-message">
          {{ errors.password }}
        </span>
      </div>

      <div class="form-group delete-group">
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          @click="handleDelete"
        >
          Delete
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .account-item {
    background-color: var(--ui-bg-muted);
    border: 1px solid var(--ui-border);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: start;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ui-text);
  }

  .error-message {
    font-size: 0.75rem;
    color: var(--ui-error);
  }

  .delete-group {
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding-top: 1.25rem;
  }

  .error-input :deep(input),
  .error-input :deep(select) {
    border-color: var(--ui-error) !important;
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    .delete-group {
      padding-top: 0.5rem;
    }
  }
</style>
