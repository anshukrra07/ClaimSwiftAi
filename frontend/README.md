# ClaimSwift Frontend

React frontend for the ClaimSwift AI workspace. The UI now reads from the local backend API instead of relying only on hardcoded demo state.

## Stack

- React 19
- Vite 7
- Plain CSS

## Run

```bash
cd /Users/anshu/Downloads/projects/claimSwift_AI/frontend
npm run dev
```

The frontend expects the backend API on `http://localhost:4100`. In local development the Vite proxy forwards `/api/*` requests there.

## Auth

The app now starts with a login screen and uses the backend session endpoints. Seeded accounts are defined in the root [README](/Users/anshu/Downloads/projects/claimSwift_AI/README.md).

## Screens

- Landing / pitch
- Claim intake and orchestration
- Decision dashboard
- Reviewer console
- Fraud heatmap and document intelligence
- Operations control plane
- Analytics overview
- Mobile claimant home
- Mobile clarification flow

## Notes

- Navigation is still local React state, but claim content, analytics, policy rules, session-aware operations, and workflow actions are API-backed.
- The intake screen includes the visible-processing workflow with clarification recovery.
- Reviewer actions, clarification submission, settlement simulation, and role-aware controls call the backend API.
