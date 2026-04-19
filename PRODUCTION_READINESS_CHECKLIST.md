# ClaimSwift AI Production Readiness Checklist

This checklist captures the gap between the current ClaimSwift AI codebase and a real production insurer platform.

Current status:

- The project is `demo-ready`
- The project is `not production-ready`

Use this file as the implementation roadmap for hardening the platform.

## 1. Core Platform Architecture

### Current state

- Backend uses a local JSON file as runtime state
- Frontend is a single bundled React app
- No real infrastructure separation exists for dev / staging / production

### Required for production

- Replace file-based persistence with a real database
  - PostgreSQL is the practical default
- Introduce database migrations
  - schema versioning
  - rollback support
- Separate environments
  - local
  - staging
  - production
- Add environment-based configuration management
- Move secrets out of code and local files

### Priority

- `Critical`

## 2. Authentication and Identity

### Current state

- Seeded demo users exist in local seed data
- Passwords are stored in plain text
- Sessions are stored in local JSON

### Required for production

- Hash passwords using a secure algorithm
  - bcrypt or argon2
- Implement secure session/token management
  - short-lived access tokens
  - refresh token strategy if needed
- Add password reset / account recovery flows
- Add MFA for insurer/operator roles
- Add account lifecycle controls
  - lock
  - disable
  - invite
  - role assignment
- Add audit controls for auth events

### Priority

- `Critical`

## 3. Authorization and Access Control

### Current state

- Basic role-based permission checks exist

### Required for production

- Formalize RBAC model
  - claimant
  - adjuster
  - reviewer
  - ops admin
  - auditor
- Add resource-level authorization
  - user can only access allowed claims/tenants
- Add tenancy or insurer-org separation if multi-client
- Add policy enforcement tests

### Priority

- `Critical`

## 4. Data Persistence and Integrity

### Current state

- Claims, sessions, and audit data live in `runtime-store.json`

### Required for production

- Store claims, users, audit logs, providers, and policy rules in a database
- Add transaction-safe writes
- Add optimistic or pessimistic concurrency protection
- Add idempotency for key mutation endpoints
  - claim creation
  - settlement
  - reviewer actions
- Add backup and recovery plan
- Add archival strategy for old claims and logs

### Priority

- `Critical`

## 5. File Upload and Document Handling

### Current state

- Mock file analysis exists
- No real upload storage exists
- No real OCR pipeline exists

### Required for production

- Add real file upload pipeline
- Use object storage
  - S3 or equivalent
- Add antivirus / malware scanning for uploads
- Add MIME/type validation and size limits
- Add OCR/document extraction service
- Add document retention rules
- Add secure download/view access controls
- Add hashing and fingerprinting for duplicate detection

### Priority

- `Critical`

## 6. Claim Orchestration and Business Logic

### Current state

- Claim routing logic exists in one backend file
- Fraud and decision rules are seeded/demo-oriented

### Required for production

- Move core workflow logic into clearer modules/services
- Add claim state machine constraints
- Add policy rule versioning
- Add insurer-configurable product/rule models
- Add clearer domain boundaries
  - claim intake
  - policy validation
  - fraud scoring
  - settlement
  - audit
- Add replay-safe workflow behavior

### Priority

- `High`

## 7. External Integrations

### Current state

- No real external insurer/identity/payment integrations

### Required for production

- Payment rail integration
- Policy source-of-truth integration
- Customer/profile integration
- Document verification integrations if required
- Indian ecosystem integrations where applicable
  - Aadhaar/PAN verification
  - IIB
  - VAHAN
- Provider registry integrations
- Notification providers
  - SMS
  - email
  - push

### Priority

- `Critical` for real operations

## 8. Security Hardening

### Current state

- Basic app works locally
- Not security hardened

### Required for production

- Input validation on every API boundary
- Output sanitization where required
- CORS hardening
- CSRF protection if cookie sessions are used
- Rate limiting
- Brute-force protection on login
- Secure headers
- Content security policy
- Dependency vulnerability scanning
- Secrets rotation strategy
- Security review and threat modeling
- Penetration testing before launch

### Priority

- `Critical`

## 9. Audit, Compliance, and Traceability

### Current state

- Basic audit events exist

### Required for production

- Immutable or tamper-resistant audit trail
- Structured event taxonomy
- Request correlation across services
- Actor + reason capture for sensitive actions
- Audit export/reporting capability
- Compliance review based on insurer/legal obligations
- Data retention and deletion policy

### Priority

- `Critical`

## 10. Observability and Operations

### Current state

- Smoke test exists
- No production monitoring stack exists

### Required for production

- Centralized logging
- Metrics and dashboards
- Alerting
- Error tracking
- Uptime checks
- SLOs / SLAs
- Runbooks for operational issues
- Incident response process

### Priority

- `High`

## 11. Testing

### Current state

- Smoke test exists
- No serious automated test suite exists

### Required for production

- Unit tests
- Integration tests
- API contract tests
- RBAC/authorization tests
- Workflow/state transition tests
- File upload/OCR pipeline tests
- Frontend interaction tests
- End-to-end browser tests
- Regression suite in CI

### Priority

- `Critical`

## 12. CI/CD and Release Management

### Current state

- No full production delivery pipeline described

### Required for production

- CI pipeline for lint/test/build
- Deployment pipeline for staging and production
- Artifact/version management
- Rollback strategy
- Release approval flow
- Migration execution in deployment pipeline

### Priority

- `High`

## 13. Performance and Scalability

### Current state

- Frontend bundle is large
- No load/scalability validation exists

### Required for production

- Code splitting and bundle optimization
- API latency measurement
- Caching strategy where appropriate
- Background job strategy for heavy work
  - OCR
  - fraud analysis
  - notifications
- Load testing
- Capacity planning
- Queue/retry design for async work

### Priority

- `High`

## 14. UX and Product Readiness

### Current state

- Claimant flow is much better than before
- Still a demo-oriented single app

### Required for production

- Separate claimant and operator experiences cleanly
- Accessibility review
  - keyboard
  - screen reader
  - contrast
- Cross-browser QA
- Mobile QA
- Real copy review with customer-support/legal input
- Localization if required
- Notification and receipt UX finalization

### Priority

- `High`

## 15. Legal and Insurer Process Readiness

### Current state

- Demo logic only

### Required for production

- Policy/legal review of flows
- Claim disclaimer review
- Consent and privacy notices
- Data processing agreements if needed
- Escalation and dispute handling process
- Manual override governance
- Settlement and reconciliation controls

### Priority

- `Critical`

## 16. Recommended Build Order

### Phase 1: Foundation

- move to PostgreSQL
- secure auth/password hashing
- real user/session model
- validation hardening
- CI pipeline

### Phase 2: Real Operations

- file storage
- OCR pipeline
- structured audit model
- role/resource authorization hardening
- staging deployment

### Phase 3: Insurer Integration

- payment integration
- policy system integration
- provider/identity integrations
- notification systems

### Phase 4: Launch Hardening

- full test suite
- load/security testing
- monitoring/alerting
- compliance review

## 17. Honest Production Readiness Verdict

As of now, ClaimSwift AI is:

- `Strong demo / hackathon platform`
- `Good product prototype`
- `Not ready for production insurer deployment`

The biggest blockers are:

1. no real database
2. no secure auth model
3. no real file/OCR pipeline
4. no external integrations
5. no full test/monitoring/deployment stack

## 18. Suggested Next Practical Milestone

If you want the next realistic milestone after demo-ready, target:

`Staging-ready platform`

That means:

- database-backed
- secure auth
- real uploads
- OCR pipeline
- CI + tests
- staging deployment
- basic monitoring

That is the right step before calling anything production-ready.
