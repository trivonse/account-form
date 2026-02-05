<script setup lang="ts">
  import { reactive, computed, watch, onMounted, ref } from 'vue'
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
  const passwordVisible = ref(false)

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
      errors.label = `Макс ${VALIDATION_CONSTRAINTS.LABEL_MAX_LENGTH} символов`
      return false
    }
    errors.label = null
    return true
  }

  function validateType(): boolean {
    if (!formState.type) {
      errors.type = 'Обязательно'
      return false
    }
    // this check is kinda redundant but whatever
    if (!Object.values(AccountType).includes(formState.type)) {
      errors.type = 'Неверный тип'
      return false
    }
    errors.type = null
    return true
  }

  function validateLogin(): boolean {
    const val = formState.login.trim()
    if (!val) {
      errors.login = 'Обязательно'
      return false
    }
    if (val.length > VALIDATION_CONSTRAINTS.LOGIN_MAX_LENGTH) {
      errors.login = `Макс ${VALIDATION_CONSTRAINTS.LOGIN_MAX_LENGTH} символов`
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
      errors.password = 'Обязательно'
      return false
    }
    if (val.length > VALIDATION_CONSTRAINTS.PASSWORD_MAX_LENGTH) {
      errors.password = `Макс ${VALIDATION_CONSTRAINTS.PASSWORD_MAX_LENGTH} символов`
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
    <div class="item-header">
      <UButton
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        size="sm"
        @click="handleDelete"
      />
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">
          <UIcon name="i-lucide-tag" class="label-icon" />
          Метка
        </label>
        <UInput
          v-model="formState.labelInput"
          placeholder="Через точку с запятой"
          :class="labelInputClass"
          :color="touched.label && errors.label ? 'error' : 'neutral'"
          @blur="handleLabelBlur"
        />
        <span v-if="touched.label && errors.label" class="error-message">
          {{ errors.label }}
        </span>
      </div>

      <div class="form-group">
        <label class="form-label">
          <UIcon name="i-lucide-shield" class="label-icon" />
          Тип *
        </label>
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

      <div class="form-group" :class="{ 'span-2': !showPassword }">
        <label class="form-label">
          <UIcon name="i-lucide-user" class="label-icon" />
          Логин *
        </label>
        <UInput
          v-model="formState.login"
          placeholder="Введи логин"
          :class="loginInputClass"
          :color="touched.login && errors.login ? 'error' : 'neutral'"
          @blur="handleLoginBlur"
        />
        <span v-if="touched.login && errors.login" class="error-message">
          {{ errors.login }}
        </span>
      </div>

      <div v-if="showPassword" class="form-group">
        <label class="form-label">
          <UIcon name="i-lucide-lock" class="label-icon" />
          Пароль *
        </label>
        <UInput
          v-model="formState.password"
          :type="passwordVisible ? 'text' : 'password'"
          placeholder="Введи пароль"
          :class="passwordInputClass"
          :color="touched.password && errors.password ? 'error' : 'neutral'"
          :ui="{ trailing: 'pr-1' }"
          @blur="handlePasswordBlur"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="passwordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="passwordVisible ? 'Скрыть' : 'Показать'"
              @click="passwordVisible = !passwordVisible"
            />
          </template>
        </UInput>
        <span v-if="touched.password && errors.password" class="error-message">
          {{ errors.password }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .account-item {
    background-color: var(--ui-bg-muted);
    border: 1px solid var(--ui-border);
    border-radius: 8px;
    padding: 1rem 1.5rem 1.5rem;
    margin-bottom: 1rem;
    position: relative;
  }

  .item-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    align-items: start;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: relative;
    padding-bottom: 1rem;
  }

  .span-2 {
    grid-column: span 2;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ui-text);
  }

  .label-icon {
    font-size: 0.9rem;
    opacity: 0.6;
  }

  .error-message {
    position: absolute;
    bottom: -0.25rem;
    left: 0.5rem;
    font-size: 0.75rem;
    color: var(--ui-error);
    animation: slideUp 0.2s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .error-input :deep(input),
  .error-input :deep(select) {
    border-color: var(--ui-error) !important;
  }

  @media (max-width: 900px) {
    .form-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 500px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    .span-2 {
      grid-column: span 1;
    }
  }
</style>
