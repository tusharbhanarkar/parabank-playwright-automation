# Engineering Decisions

## 1. Page Object Model

### Decision

The framework uses the Page Object Model (POM) architecture.

UI pages are represented as dedicated classes:

- LoginPage
- RegisterPage
- AccountsPage
- TransferPage
- LoanPage
- TransactionsPage

### Reason

The Page Object Model keeps selectors and UI interactions separate from test scenarios.

This improves:

- Maintainability
- Reusability
- Readability
- Selector management

When a UI selector changes, the corresponding page object can be updated without changing every test scenario.

---

## 2. API Layer

### Decision

API operations are centralized in:

`api/ParaBankApi.ts`

### Reason

Keeping API operations in a dedicated class prevents tests from containing large amounts of request implementation code.

The API layer handles:

- Database cleanup
- Parameter configuration
- Account retrieval
- Customer account retrieval
- Deposits
- Transaction history

This keeps the test scenarios focused on business validations.

---

## 3. Dynamic Test Data

### Decision

Usernames are generated dynamically during execution.

Example:

`qa7k29px`

Account IDs and loan account numbers are also captured dynamically from the application.

### Reason

Hard-coded usernames and account IDs can cause collisions between test executions.

Dynamic data makes the scenarios reusable across multiple test runs and avoids depending on a specific database state.

---

## 4. Parallel Execution and Shared Database

### Decision

The framework currently uses:

```text
workers: 1
fullyParallel: false