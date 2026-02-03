// account types - using const obj cuz enums dont work with erasableSyntaxOnly
export const AccountType = {
  LDAP: 'LDAP',
  LOCAL: 'LOCAL'
} as const

export type AccountType = (typeof AccountType)[keyof typeof AccountType]

// label is just text for now, might add more fields later
export interface Label {
  text: string
}

export interface Account {
  id: string
  label: Label[]
  type: AccountType
  login: string
  password: string | null
}

// local form state, separate from the actual account data
export interface AccountFormState {
  id: string
  labelInput: string // semicolon separated
  type: AccountType
  login: string
  password: string
}

export interface AccountFormErrors {
  label: string | null
  type: string | null
  login: string | null
  password: string | null
}

// TODO: maybe move these to env or config?
export const VALIDATION_CONSTRAINTS = {
  LABEL_MAX_LENGTH: 50,
  LOGIN_MAX_LENGTH: 100,
  PASSWORD_MAX_LENGTH: 100
} as const
