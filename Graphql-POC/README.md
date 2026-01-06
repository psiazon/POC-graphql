# Loan Application Portal  
**Next.js + React + TypeScript + GraphQL + Prisma + PostgreSQL**

A production-grade web application that accepts loan applications via a React UI and processes them through a GraphQL HTTP API.  
Built using modern patterns suitable for real-world enterprise systems.

---

## ✨ Features

- **Next.js App Router** (React 18, TypeScript)
- **GraphQL HTTP API** using GraphQL Yoga
- **CRUD + Workflow** for loan applications
  - Draft → Submitted → Approved / Rejected
- **PostgreSQL** database (Docker-based local dev)
- **Prisma ORM** for schema & migrations
- **Zod validation** for GraphQL inputs
- **Optional API key security**
- Clean separation of concerns (UI / API / DB)
- Ready to extend with auth, RBAC, auditing, and observability

---

## 🏗️ Architecture Overview

```
Browser (React / Next.js)
        |
        |  GraphQL (HTTP)
        v
Next.js API Route (/api/graphql)
        |
        |  Prisma ORM
        v
PostgreSQL Database
```

---

## 📁 Project Structure

```
loan-graphql-prod/
├── app/
│   ├── api/graphql/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── graphql/
│   ├── schema.ts
│   └── validators.ts
├── lib/
│   ├── prisma.ts
│   └── graphqlClient.ts
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

## ✅ Prerequisites

- Node.js 20+
- Docker / Docker Desktop

---

## 🚀 Getting Started

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

---

## 🌐 Access Points

- UI: http://localhost:3000  
- GraphQL: http://localhost:3000/api/graphql

---

## 🔁 Loan Workflow

- DRAFT → SUBMITTED → APPROVED / REJECTED

---

## 🔐 Security

- Optional `x-api-key` header via `GRAPHQL_API_KEY`
- Ready for JWT, RBAC, rate limiting

---

## 📦 Production Hardening Ideas

- Auth & roles
- Audit logs
- Optimistic locking
- OpenTelemetry
- CI/CD pipelines
