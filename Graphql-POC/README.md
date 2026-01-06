# Loan Application Portal (Production-Grade Demo)

A Next.js (App Router) + React + TypeScript app that accepts loan applications and calls a GraphQL HTTP endpoint.
The GraphQL API supports CRUD operations backed by **Postgres** via **Prisma** with input validation via **Zod**.

## Prereqs
- Node.js 20+
- Docker (for local Postgres)

## 1) Install
```bash
npm install
```

## 2) Configure env
```bash
cp .env.example .env
```

> Optional: Set `GRAPHQL_API_KEY` in `.env` to protect the endpoint, and send `x-api-key` header from clients.

## 3) Start Postgres
```bash
docker compose up -d
```

## 4) Create DB schema (Prisma migrate)
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 5) Run
```bash
npm run dev
```

- App UI: http://localhost:3000
- GraphQL endpoint (GraphiQL in dev): http://localhost:3000/api/graphql

## GraphQL operations (examples)

Create:
```graphql
mutation Create($input: CreateLoanApplicationInput!) {
  createLoanApplication(input: $input) {
    id
    status
    createdAt
  }
}
```

Variables:
```json
{
  "input": {
    "fullName": "Pat Siazon",
    "email": "pat@example.com",
    "amount": 25000,
    "termMonths": 48,
    "purpose": "Home improvement"
  }
}
```

List:
```graphql
query {
  loanApplications(limit: 50, offset: 0) {
    id
    fullName
    amount
    status
  }
}
```

Submit:
```graphql
mutation {
  submitLoanApplication(id: "YOUR_ID") { id status updatedAt }
}
```

Approve/Reject:
```graphql
mutation { approveLoanApplication(id: "YOUR_ID") { id status } }
mutation { rejectLoanApplication(id: "YOUR_ID") { id status } }
```

Delete:
```graphql
mutation { deleteLoanApplication(id: "YOUR_ID") }
```

## Production notes / hardening ideas
- Add proper auth (JWT / session), RBAC for approval actions
- Add audit logs and optimistic concurrency (version field)
- Add rate limiting / request size limits
- Replace GraphiQL in prod and enable persisted operations
- Add observability (OpenTelemetry, structured logs)
