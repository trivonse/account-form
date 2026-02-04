# account-form

quick account management thing i made with vue 3

## basically

lets you add/edit/delete accounts. each one has a label, type (LDAP or LOCAL), login, and password. password only shows for LOCAL accounts cuz LDAP handles auth differently.

labels are separated by semicolons btw, like "admin; user; guest"

saves everything to localStorage so it persists between sessions

## stack

- vue 3 + typescript
- pinia (state management)
- nuxt ui for components
- tailwind
- vite

## run it

```bash
pnpm install
pnpm dev
```

thats it

## structure

```
src/
  components/
    AccountList.vue    - the main list
    AccountItem.vue    - individual account form
  stores/
    accounts.ts        - pinia store, handles localStorage too
  types/
    account.ts         - ts types
```

## random notes

- validation runs on blur not on every keystroke (felt less annoying)
- localStorage key is `accounts-storage` if you need to clear it
- the empty state has a nice little icon thing

## might do later

- search/filter maybe?
- import/export would be nice
- dark mode idk
