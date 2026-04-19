# ClaimSwift AI Project Structure

This document describes the current codebase structure for `ClaimSwift AI`, including the purpose of each major folder and file.

## Root

```text
claimSwift_AI/
├── README.md
├── PROJECT_STRUCTURE.md
├── package.json
├── .gitignore
├── FINAL_CLAIMS_AUTOMATION_SUBMISSION.md
├── END_TO_END_CLAIMS_AUTOMATION_HACKATHON_PACK.md
├── ClaimSwift_AI_Exact_From_Images.pptx
├── backend/
├── frontend/
└── scripts/
```

### Root files

- `README.md`
  Main project documentation, run steps, seeded operator accounts, and API overview.

- `PROJECT_STRUCTURE.md`
  This file. High-level structure and responsibility map for the project.

- `package.json`
  Root-level workspace scripts.

  Scripts:
  - `npm run dev` -> starts frontend and backend together
  - `npm run dev:frontend` -> runs the frontend only
  - `npm run dev:backend` -> runs the backend only
  - `npm run build` -> builds the frontend
  - `npm run start:backend` -> starts backend in non-watch mode
  - `npm run smoke` -> runs smoke verification

- `.gitignore`
  Ignore rules for generated files and local runtime state.

- `FINAL_CLAIMS_AUTOMATION_SUBMISSION.md`
  Submission write-up / project description document.

- `END_TO_END_CLAIMS_AUTOMATION_HACKATHON_PACK.md`
  Supporting hackathon/project pack content.

- `ClaimSwift_AI_Exact_From_Images.pptx`
  Project presentation deck.

## Backend

```text
backend/
├── package.json
├── data/
│   └── runtime-store.json
└── src/
    ├── server.js
    ├── store.js
    └── seed.js
```

### Backend purpose

The backend is a lightweight Node.js insurer-platform API. It powers:

- login and session management
- role-based access control
- claim creation and evaluation
- clarification, review, and settlement actions
- policy rule updates
- analytics and operations endpoints
- audit events
- seeded local persistence

### Backend files

- `backend/package.json`
  Backend package configuration.

  Scripts:
  - `npm run dev` -> starts backend in watch mode
  - `npm run start` -> starts backend normally

- `backend/src/server.js`
  Main backend server and API surface.

  Main responsibilities:
  - HTTP server setup
  - auth endpoints
  - claim endpoints
  - policy rule endpoints
  - dashboard/analytics endpoints
  - platform operations endpoints
  - audit logging
  - claim evaluation and routing logic
  - intake analysis / mock OCR routing

- `backend/src/store.js`
  State persistence layer.

  Main responsibilities:
  - create/load runtime data directory
  - read runtime state from disk
  - auto-hydrate old state with new seeded fields
  - save updated state
  - provide update helper for safe state mutation

- `backend/src/seed.js`
  Seed data for local demo/runtime startup.

  Seeded entities include:
  - policy rules
  - users and roles
  - sessions container
  - audit seed events
  - providers
  - claims across health, motor, home, and life

- `backend/data/runtime-store.json`
  Mutable local runtime data used by the backend.

  Notes:
  - stores live claim/session/audit state
  - behaves like a simple local database for the demo
  - regenerated or hydrated from seed when needed

## Frontend

```text
frontend/
├── README.md
├── package.json
├── package-lock.json
├── index.html
├── vite.config.js
├── dist/
│   ├── index.html
│   └── assets/
│       └── index-*.js
└── src/
    ├── main.jsx
    ├── ClaimSwiftAI.jsx
    ├── api.js
    └── claimswift/
        ├── theme.js
        ├── data.js
        ├── formatters.js
        ├── hooks.js
        ├── playbooks.js
        ├── components/
        │   ├── DashboardLayout.jsx
        │   ├── GlobalStyles.jsx
        │   └── ui.jsx
        └── pages/
            ├── index.js
            ├── LandingScreen.jsx
            ├── LoginScreen.jsx
            ├── IntakeScreen.jsx
            ├── DecisionScreen.jsx
            ├── ReviewerScreen.jsx
            ├── FraudScreen.jsx
            ├── PolicyScreen.jsx
            ├── AnalyticsScreen.jsx
            ├── OperationsScreen.jsx
            ├── MobileHomeScreen.jsx
            ├── MobileClarificationScreen.jsx
            └── PagePieces.jsx
```

### Frontend purpose

The frontend is a React + Vite app that provides:

- login and role-aware navigation
- insurer operations dashboard
- claim intake / submission flow
- claim decision and settlement view
- reviewer queue
- fraud overview
- policy rule controls
- analytics dashboard
- mobile claimant views

### Frontend top-level files

- `frontend/README.md`
  Frontend-specific notes.

- `frontend/package.json`
  Frontend dependencies and scripts.

  Scripts:
  - `npm run dev` -> Vite dev server
  - `npm run build` -> production build
  - `npm run preview` -> preview production build

- `frontend/package-lock.json`
  Frontend dependency lockfile.

- `frontend/index.html`
  Vite entry HTML.

- `frontend/vite.config.js`
  Vite config, including development proxy behavior.

- `frontend/dist/`
  Built frontend output.

### Frontend source files

- `frontend/src/main.jsx`
  React entry point. Mounts the app.

- `frontend/src/ClaimSwiftAI.jsx`
  Main application controller.

  Responsibilities:
  - session restore
  - login/logout handling
  - screen routing
  - role-based default landing behavior
  - API action orchestration
  - bootstrap and platform ops loading
  - toast messaging

- `frontend/src/api.js`
  Frontend API client.

  Responsibilities:
  - token storage
  - authenticated API requests
  - login/logout calls
  - claim/policy/ops endpoint wrappers

## Frontend Shared ClaimSwift Layer

### Shared config and helpers

- `frontend/src/claimswift/theme.js`
  Shared colors, tones, and card styling constants.

- `frontend/src/claimswift/data.js`
  Navigation metadata, including permission requirements.

- `frontend/src/claimswift/formatters.js`
  Formatting helpers for:
  - INR values
  - percentages
  - risk/status tone mapping

- `frontend/src/claimswift/hooks.js`
  Shared React hooks, including toast state management.

- `frontend/src/claimswift/playbooks.js`
  Insurance-line content model.

  Includes per-line configuration for:
  - labels
  - claimant summary copy
  - checklists
  - sample provider/city/procedure values
  - evidence descriptions
  - reviewer checks
  - demo sequence content

## Frontend Components

- `frontend/src/claimswift/components/DashboardLayout.jsx`
  Main authenticated dashboard shell with sidebar navigation and user info.

- `frontend/src/claimswift/components/GlobalStyles.jsx`
  Global app styles and shared utility classes.

- `frontend/src/claimswift/components/ui.jsx`
  Reusable UI primitives such as:
  - tags
  - toasts
  - metric cards
  - confidence cards
  - queue items
  - processing/step cards

## Frontend Pages

- `frontend/src/claimswift/pages/index.js`
  Re-export file for screen imports.

- `frontend/src/claimswift/pages/LandingScreen.jsx`
  Demo/marketing landing screen.

- `frontend/src/claimswift/pages/LoginScreen.jsx`
  Seeded role login screen for insurer operators.

- `frontend/src/claimswift/pages/IntakeScreen.jsx`
  Main claim submission and sample-journey screen.

  Current responsibilities:
  - guided 3-step claim creation
  - document upload and mock analysis
  - short processing animation after submission
  - single post-submit outcome screen
  - advanced demo options
  - sample-claim flow switching

- `frontend/src/claimswift/pages/DecisionScreen.jsx`
  Approved claim / payout / explanation screen.

- `frontend/src/claimswift/pages/ReviewerScreen.jsx`
  Manual review queue and reviewer action screen.

- `frontend/src/claimswift/pages/FraudScreen.jsx`
  Fraud signal overview and suspicious-claim context screen.

- `frontend/src/claimswift/pages/PolicyScreen.jsx`
  Policy rule management screen.

- `frontend/src/claimswift/pages/AnalyticsScreen.jsx`
  Operations analytics and performance trends.

- `frontend/src/claimswift/pages/OperationsScreen.jsx`
  Platform operations screen.

  Includes:
  - readiness checks
  - active sessions
  - queue summary
  - recent audit events

- `frontend/src/claimswift/pages/MobileHomeScreen.jsx`
  Simplified claimant/mobile home experience.

- `frontend/src/claimswift/pages/MobileClarificationScreen.jsx`
  Simple claimant clarification screen for missing or unclear details.

- `frontend/src/claimswift/pages/PagePieces.jsx`
  Shared page-level building blocks and exports.

## Scripts

```text
scripts/
├── dev.js
└── smoke.js
```

- `scripts/dev.js`
  Root dev launcher that starts frontend and backend together.

- `scripts/smoke.js`
  Smoke test runner.

  Verifies:
  - backend health/readiness
  - login
  - claim creation
  - clarification flow
  - reviewer flow
  - settlement
  - role enforcement
  - platform ops payload
  - frontend build

## Runtime / Generated Files

- `frontend/dist/`
  Production build artifacts.

- `backend/data/runtime-store.json`
  Live runtime state file used like a lightweight local database.

- `frontend/node_modules/`
  Frontend installed dependencies.

## Architecture Summary

### Request flow

1. User interacts with the React frontend.
2. Frontend calls backend API through `frontend/src/api.js`.
3. Backend routes requests through `backend/src/server.js`.
4. Backend reads and updates local runtime state via `backend/src/store.js`.
5. State is persisted in `backend/data/runtime-store.json`.
6. Frontend refreshes bootstrap and operations data after major actions.

### Major modules by responsibility

- Claim submission and UX:
  - `frontend/src/claimswift/pages/IntakeScreen.jsx`

- Session and screen orchestration:
  - `frontend/src/ClaimSwiftAI.jsx`

- Claim/business logic:
  - `backend/src/server.js`

- State and persistence:
  - `backend/src/store.js`

- Demo seed content:
  - `backend/src/seed.js`

## Notes

- This project currently behaves like a strong local insurer-platform demo, not a full production deployment.
- Persistence is file-based, not database-backed.
- OCR and document extraction are mocked through filename-driven analysis.
- External integrations such as Aadhaar, PAN, IIB, VAHAN, payments, or real OCR are not yet implemented.
