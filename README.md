# ClaimSwift AI

ClaimSwift AI is an explainable end-to-end claims automation workspace with:

- a React operations and claimant frontend
- a Node API for claim orchestration, fraud rules, policy rules, analytics, and platform operations
- seeded multi-line claims across health, motor, home, and life
- seeded operator accounts with authentication, RBAC, session tracking, readiness checks, and audit logging

## Project Structure

- `frontend/` — React + Vite UI
- `backend/` — API and workflow engine

## Run

### Quick start

```bash
cd /Users/anshu/Downloads/projects/claimSwift_AI
npm run dev
```

This starts both the backend and frontend together.

## Seeded Operator Accounts

Use one of these accounts in the login screen:

- `admin@claimswift.ai` / `admin123` — ops admin, full access
- `adjuster@claimswift.ai` / `adjust123` — create, clarify, and settle claims
- `reviewer@claimswift.ai` / `review123` — reviewer queue and audit visibility
- `analyst@claimswift.ai` / `analyst123` — analytics and operations visibility

### 1. Start the backend

```bash
cd /Users/anshu/Downloads/projects/claimSwift_AI
npm run dev:backend
```

The API runs on `http://localhost:4100`.

### 2. Start the frontend

```bash
cd /Users/anshu/Downloads/projects/claimSwift_AI
npm run dev:frontend
```

The frontend runs on the Vite dev server and proxies `/api` calls to the backend.

## Build

```bash
cd /Users/anshu/Downloads/projects/claimSwift_AI
npm run build
```

## Implemented API

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/health`
- `GET /api/ready`
- `GET /api/bootstrap`
- `GET /api/claims`
- `POST /api/claims`
- `GET /api/claims/:id`
- `GET /api/claims/:id/explanation`
- `POST /api/claims/:id/clarifications`
- `POST /api/claims/:id/review`
- `POST /api/claims/:id/settle`
- `GET /api/dashboard/metrics`
- `GET /api/policy/rules`
- `POST /api/policy/rules`
- `GET /api/platform/ops`
- `GET /api/audit/events`
- `POST /api/intake/analyze`

## Verification

```bash
cd /Users/anshu/Downloads/projects/claimSwift_AI
npm run smoke
```

The smoke suite verifies:

- backend readiness
- login and session handling
- intake analysis
- claim creation
- clarification resolution
- reviewer approval
- role-based permission enforcement
- settlement
- platform operations/audit payloads
- frontend production build

## Current Scope

The backend supports multi-line claim modeling and seeded examples for:

- health
- motor
- home
- life

The current UI remains centered on the most complete straight-through demo flow:

- health clarification
- health STP decisioning
- reviewer fraud investigation
- cross-line analytics, policy management, and operations monitoring
