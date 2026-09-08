# AGENTS.md

# Frontend Development Guide

This project is built with **Vue 3 + Vite** and follows a **feature-based architecture**.

When generating code, always follow the rules below.

---

# Reference Docs

Before implementing anything non-trivial, consult the relevant doc(s) in `docs/` — they contain the authoritative, detailed rules this file only summarizes.

| Doc | Consult when |
| --- | --- |
| [docs/workflow.md](docs/workflow.md) | Creating branches, committing, opening a PR, or merging |
| [docs/architecture.md](docs/architecture.md) | Adding a new domain, or deciding where a file belongs |
| [docs/coding-convention.md](docs/coding-convention.md) | Naming any new file or component |
| [docs/msw.md](docs/msw.md) | A feature needs API data but the backend isn't ready |

If a doc's rule conflicts with this file, the doc wins for its topic — this file is the summary, `docs/` is the detail.

---

# Tech Stack

- Vue 3 (Composition API)
- Vite
- Vue Router
- Pinia
- Axios
- JavaScript (ES Modules)

---

# Project Structure

```
src/
│
├── features/
│   └── {domain}/
│       ├── api/
│       ├── components/
│       ├── composables/
│       ├── store/
│       ├── views/
│       └── index.js
│
├── shared/
│   ├── api/
│   ├── components/
│   ├── composables/
│   ├── constants/
│   └── utils/
│
├── layouts/
├── router/
├── assets/
│
├── App.vue
└── main.js
```

---

# Dependency Rules

Always follow these dependency rules.

## Allowed

```
features/*
      ↓
shared/*
```

```
router
      ↓
features/*
```

```
layouts
      ↓
shared/*
```

---

## Forbidden

### Feature-to-feature imports

Never import one feature directly into another.

❌

```js
import LoanTable from '@/features/loan/components/LoanTable.vue'
```

inside

```
features/account/*
```

If logic needs to be shared between multiple features, move it into `shared/`.

---

### Shared-to-feature imports

`shared/` must never import anything from `features/`.

❌

```
shared
    ↓
features
```

---

### Direct access to feature internals

External modules should only import from the feature's public API (`index.js`).

✅

```js
import { LoanListView } from '@/features/loan'
```

❌

```js
import LoanListView from '@/features/loan/views/LoanListView.vue'
```

Every feature must expose its public API through:

```
index.js
```

---

# Naming Conventions

## Components

PascalCase

```
LoanCard.vue
LoanTable.vue
BaseButton.vue
```

---

## Views

PascalCase + `View`

```
LoanListView.vue
LoanDetailView.vue
```

---

## Stores

camelCase + `Store`

```
loanStore.js
```

---

## API

camelCase + `Api`

```
loanApi.js
```

---

## Routes

camelCase + `.routes.js`

```
loan.routes.js
```

---

## Composables

`use` + PascalCase

```
useLoan.js
useModal.js
```

---

# Git Conventions

Always follow these rules for version control.

## Commit Conventions

Use the Conventional Commits format: `type(scope): subject`

- `feat`: New feature
- `fix`: Bug fix
- `design`: UI/UX, CSS, and styling changes
- `style`: Formatting, missing semi-colons, etc. (no code logic changes)
- `refactor`: Code refactoring (no feature changes, no bug fixes)
- `docs`: Documentation updates (e.g., README.md)
- `test`: Adding or updating tests
- `chore`: Maintenance, package manager configs, build scripts

**Examples:**

```
feat(loan): add loan creation form
design: apply hover animations to primary buttons
fix: resolve rendering issue in loan list
```

## Branch Conventions

Use kebab-case for branch names. Include issue numbers if applicable.

- `main`: Production branch
- `develop`: Main development branch
- `feature/`: New features (e.g., `feature/loan-list`, `feature/#12-social-login`)
- `fix/`: Bug fixes (e.g., `fix/payment-error`)
- `hotfix/`: Critical production fixes (e.g., `hotfix/auth-crash`)

---

# Vue Guidelines

Always use:

- Vue 3
- Composition API
- `<script setup>`

Never use the Options API.

Prefer using:

- ref
- reactive
- computed
- watch
- defineProps
- defineEmits

---

# Component Guidelines

A component should have a single responsibility.

If a component becomes too large, split it into smaller components.

Reusable UI components belong in:

```
shared/components
```

Feature-specific components belong in:

```
features/{domain}/components
```

---

# Store Guidelines

Use Pinia.

A store should only contain:

- State
- Getters
- Actions

UI-specific state should remain inside components whenever possible.

---

# API Guidelines

Always use the shared Axios instance.

```
shared/api/httpClient.js
```

Do not create additional Axios instances.

API functions belong in:

```
features/{domain}/api
```

Example:

```js
export async function getLoans() {}

export async function createLoan() {}

export async function deleteLoan() {}
```

---

# Routing

Define routes per feature.

```
router/routes

loan.routes.js
goal.routes.js
member.routes.js
```

Combine them in:

```
router/index.js
```

---

# Styling

Global styles belong in:

```
assets/styles
```

Component styles should use:

```vue
<style scoped>
```

unless global styling is required.

---

# Import Order

Always use the following import order:

```js
// Vue

// External libraries

// Shared

// Feature

// Relative imports
```

---

# Code Style

Always prefer:

- Early returns
- Small, focused functions
- Meaningful variable names
- Readable code over excessive comments
- Reusable code (DRY)
- Named constants instead of magic numbers
- Minimal nesting

---

# File Creation Rules

When implementing a new feature, use the following structure.

```
features/{domain}

    api/

    components/

    composables/

    store/

    views/

    index.js
```

If functionality is reusable across multiple features, move it into:

```
shared/
```

---

# Response Rules

When generating code, always follow these rules.

- Follow the existing project architecture.
- Do not introduce new architectural patterns.
- Never violate the dependency rules.
- Never import from `features/` inside `shared/`.
- Never import one feature directly into another.
- Always expose feature modules through `index.js`.
- Prefer reusable implementations over duplication.
- Always generate Vue 3 Composition API (`<script setup>`) code.
- Generate JavaScript only. Do not generate TypeScript.

## Additional Rules

- Always respond in Korean.
- Generate JavaScript only.
- Use `@` path aliases instead of relative imports.

## General Rules

- Do not add comments unless explicitly requested.
- Do not generate unused code.
- Prefer modifying existing files over creating new ones.
- Follow existing project conventions before introducing new code.
- When a task touches git workflow, architecture, naming, or MSW, check the matching doc under `docs/` (see [Reference Docs](#reference-docs)) instead of relying on memory of this file alone.
