# Final Claims Automation Submission

## Project Title

ClaimSwift AI

## One-Line Pitch

ClaimSwift AI is an explainable straight-through insurance claims engine that validates documents, checks policy coverage, detects fraud risk, estimates payout, and settles low-risk claims in minutes while routing complex claims to human reviewers.

## Core Positioning

Most teams will automate claim intake. We automate explainable, fraud-aware straight-through settlement.

## What Makes This Project Better Than Others

### 1. Straight-Through Settlement, Not Just Claim Intake

Most teams will stop at OCR, document reading, or claim filing. Our solution goes beyond intake and supports the full low-risk claims journey:

- submission
- extraction
- validation
- risk scoring
- payout estimation
- payment initiation

### 2. AI with Policy Guardrails

Pure AI is risky in insurance. Our approach combines:

- OCR and document intelligence
- policy knowledge and deterministic rules
- fraud and anomaly checks
- human-in-the-loop escalation

This makes the system more realistic, auditable, and usable in an actual insurer workflow.

### 3. Explainable Decisions

The system does not only output approve or reject. It also explains:

- coverage matched
- exclusions triggered
- deductible applied
- missing documents
- fraud or anomaly signals
- why a case was escalated

This makes the product enterprise-ready and improves trust for both operations teams and customers.

### 4. Fraud-Aware Automation

Many solutions optimize speed only. Our solution optimizes speed without leakage by checking:

- duplicate claims
- inconsistent documents
- suspicious billing patterns
- repeat claimant or provider anomalies
- risk thresholds before auto-settlement

### 5. India-Ready Execution

The solution is designed for practical Indian insurance workflows with support for:

- multilingual and low-quality scanned documents
- mobile-first claim submission
- simple digital communication flows
- instant payout rails such as bank transfer and UPI simulation

### 6. Confidence-Aware Self-Correction

Most demo systems fail on messy inputs. Our workflow does not stop when extraction quality is low.

If the extraction confidence is below a defined threshold or a mandatory field is missing, a clarification step is triggered. The system asks the user for a clearer image or a manual confirmation for the missing value, then resumes the claim workflow.

This turns the project from a happy-path demo into a more realistic production-style system.

### 7. Transparent Payout Breakdown

The system does not only decide whether a claim should move forward. It also explains how the payable amount was calculated.

This includes:

- deductible applied
- coverage matched
- exclusions triggered
- non-payable line items
- final payout estimate

This directly addresses partial-approval confusion and payout ambiguity.

### 8. Multilingual and Low-Quality Document Handling

The architecture is designed for Indian claims reality, where documents often arrive as mobile photos, blurred scans, multilingual forms, and handwritten bills.

The system handles this through:

- field-level confidence scoring
- clarification loop for uncertain fields
- support for multilingual OCR and normalization in later phases

### 9. Complaint Reduction by Design

A major source of claims complaints is that customers do not know what is happening or why a claim is delayed.

The platform reduces this through:

- live status visibility
- clarification prompts instead of silent failures
- structured explanation of decision outcomes
- proactive notifications during routing and settlement

### 10. Policy Gap Guidance

For claims that are rejected due to uncovered risk, the system can optionally explain what policy condition was missing and what type of add-on cover would have prevented the rejection.

This is not the core MVP decision engine, but it is a strong Phase 2 customer-retention and education feature.

### 11. Claim History and Trust Context

Where historical data is available, the system can incorporate prior claim patterns to improve fraud triage and reviewer context.

This is best positioned as a later-phase extension, not as a mandatory MVP dependency.

## Final Architecture

### Architecture Goal

Settle straightforward low-risk claims in minutes while safely routing risky or incomplete claims to humans.

### End-to-End Flow

Claim Submission -> Intake and Pre-Check -> Extraction Agent -> Clarification Agent if needed -> Policy Agent -> Fraud and Risk Agent -> Decision Agent -> Explanation and Audit Layer -> Dynamic Risk Guardrails -> Auto-Settlement or Human Review -> Notifications -> Dashboard and Analytics

### Layer 1. Claim Submission

Supports unified intake from:

- web portal
- mobile upload
- scanned documents and claim forms
- API-ready future input channels

Inputs include:

- claim form details
- policy number
- invoices and bills
- photos and supporting evidence

### Layer 2. Intake and Pre-Check

This layer ensures only valid claims enter the processing pipeline.

Functions:

- file validation
- image and PDF quality checks
- duplicate submission detection
- missing-document checks
- basic metadata capture

### Layer 3. Agentic Workflow Core

The system uses a LangGraph-style multi-agent workflow to coordinate specialized claim-processing steps. This keeps the architecture aligned with the Agent Builder Challenge while ensuring that the final business decision remains rule-driven.

Core agents:

- Extraction Agent
- Clarification Agent
- Policy Agent
- Fraud and Risk Agent
- Decision Agent
- Explanation Agent

The agents coordinate the workflow, but they do not replace deterministic policy rules and risk guardrails.

### Layer 4. Extraction Agent

This layer converts unstructured claim material into structured claim data.

Functions:

- OCR for documents and images
- extraction of claimant details, claim amount, provider details, and dates
- normalization of bills, forms, and evidence
- confidence scoring for extracted fields

This should be presented as OCR plus document intelligence, not as fully autonomous LLM reasoning.

Suggested implementation stance:

- primary OCR and form extraction for bills and forms
- fallback visual understanding only for low-quality or unstructured evidence
- structured output with confidence score per field
- future multilingual OCR and normalization for Indian-language claim documents

### Layer 5. Clarification Agent

This layer handles low-confidence extraction and incomplete inputs.

Trigger conditions:

- extraction confidence below threshold
- missing mandatory fields
- conflicting evidence across uploaded documents

Actions:

- ask the user to type the unclear field
- request a clearer photo or rescan
- mark the claim as pending clarification instead of failing silently

This is a key technical differentiator because it shows self-correction instead of a brittle demo flow.

### Layer 6. Policy Agent and Rules Engine

This is the core business-logic layer.

Functions:

- policy eligibility check
- coverage and exclusion matching
- deductible and limits validation
- claim category checks
- rule-based payout constraints

This is a major differentiator because it avoids relying on AI alone for settlement decisions.

### Layer 7. Fraud and Risk Agent

This layer checks whether a claim is safe to auto-process.

Functions:

- anomaly detection
- repeated claim pattern checks
- duplicate invoice or suspicious evidence checks
- provider and claimant consistency checks
- risk score generation

Representative methods for the MVP:

- anomaly scoring on claim amount, provider pattern, and claimant behavior
- duplicate evidence detection using similarity checks
- configurable fraud score bands for low, medium, and high risk

Optional extensions:

- claimant history and repeat-pattern signals
- provider benchmarking and abnormal medical billing signals
- cost outlier detection against expected treatment ranges

### Layer 8. Decision Agent

This layer combines outputs from extraction, rules, and fraud screening.

Decision outcomes:

- approve
- verify
- escalate

It determines whether a claim is safe for straight-through processing or needs manual review.

Important design principle:

- agentic workflow for coordination
- deterministic rules for approval logic
- human-in-the-loop control for high-value or risky payouts

### Layer 9. Explanation and Audit Layer

This is one of the strongest differentiators in the solution.

For every decision, the platform records:

- coverage matched
- rules triggered
- payout basis
- deductible applied
- non-payable amount or exclusions
- missing evidence
- fraud signals
- final reason for approval or escalation

This provides enterprise trust, transparency, and auditability.

The explanation output should be a structured decision trace, not hidden model reasoning.

### Layer 10. Dynamic Risk Guardrails

This layer translates risk and payout rules into operational controls.

Example MVP guardrails:

- low-risk claims under a configurable threshold such as `₹25,000` can be auto-settled
- claims above the threshold generate a recommendation report but require human approval
- medium-risk claims move to verification
- high-risk claims move to human adjuster or fraud investigation

Suggested initial fraud routing bands for the MVP:

- `0.0-0.3` -> auto-settle if amount is within threshold
- `0.3-0.7` -> verification queue
- `0.7+` -> human review

These are initial configurable thresholds for the MVP and can be tuned with pilot data.

### Layer 11. Settlement and Disbursement

For low-risk approved claims, the system:

- estimates payable amount
- applies deductibles and limits
- provides a payable versus non-payable breakdown
- initiates payment workflow
- sends settlement confirmation

### Layer 12. Notifications, Dashboard, and Analytics

Operations and business teams can monitor:

- number of claims processed
- straight-through processing rate
- average turnaround time
- fraud flags raised
- manual review reduction
- cost savings

The UI should also include a Live Agent Activity feed such as:

- Intake Agent: validating uploaded bill
- Extraction Agent: reading claim amount and claim date
- Policy Agent: checking eligibility and coverage
- Fraud Agent: evaluating anomaly indicators
- Decision Agent: routing to auto-settlement or review

This improves explainability during demos without exposing hidden chain-of-thought reasoning.

### Layer 13. Claimant Communication and Complaint Prevention

This layer improves claimant visibility and reduces avoidable follow-ups.

Functions:

- real-time claim status updates
- clarification requests with exact missing-field guidance
- payout explanation for partial approvals
- final decision summary with next-step instructions

This directly targets complaint growth caused by opaque and slow claims handling.

### Layer 14. Policy Gap and Coverage Guidance

This is an optional post-decision layer for rejected or partially covered claims.

Functions:

- identify which policy clause blocked coverage
- explain what type of add-on cover or policy option would have helped
- generate a customer-friendly policy-gap summary

This is a Phase 2 feature and should not be presented as a core MVP dependency.

## Architecture Summary for Presentation

ClaimSwift AI is not just a claims OCR tool. It is a decision-ready straight-through claims engine with agentic workflow coordination, policy guardrails, fraud control, explainable outcomes, and settlement automation.

## Technology Architecture

### Frontend

- React for claim submission, status tracking, reviewer console, and live agent activity feed
- Tailwind CSS or component library for fast MVP UI delivery
- Mobile-first responsive UI for claimant uploads and clarification prompts

### Backend and APIs

- FastAPI for core APIs and workflow orchestration
- Pydantic models for request and response validation
- Background task or queue-based async processing for document-heavy claims
- notification APIs for claimant updates and clarification responses

### Agentic Orchestration

- LangGraph for multi-agent workflow coordination
- Agents for extraction, clarification, policy retrieval, fraud analysis, decision routing, and explanation generation
- Deterministic rules remain the final source of truth for approval and payout logic

### OCR and Document Understanding

- AWS Textract or Tesseract for primary OCR and form extraction
- Gemini Flash or equivalent vision-capable model only for fallback understanding on low-quality or unstructured evidence
- Structured field confidence scoring for each extracted claim attribute
- later-phase multilingual OCR and normalization support for Indian-language claim documents

### Policy and Decisioning

- Rule engine implemented in Python for eligibility, exclusions, deductibles, limits, and payout constraints
- Retrieval layer for policy clauses and supporting policy text used by the Policy Agent
- Configurable risk bands and payout thresholds per claim type

### Fraud and Similarity Layer

- Isolation Forest or similar anomaly model for fraud-risk scoring
- Vector similarity search for duplicate invoice or repeated evidence detection
- Configurable fraud indicators using claimant, provider, invoice, and claim-pattern features
- optional claimant history and provider-cost benchmarking for later phases

### Data and Storage

- PostgreSQL for claims, extracted fields, workflow states, audit trail, and reviewer actions
- Object storage such as AWS S3 for uploaded documents, bills, and claim evidence
- Optional Redis or queue service for async workflow steps

### Deployment

- AWS Lambda or ECS/Fargate for backend deployment depending on demo scope
- API Gateway or load-balanced API entry point
- Step Functions or equivalent workflow service for settlement-stage orchestration if shown in the final MVP

## Low-Level MVP Design

### Single-Claim Processing Flow

1. Claimant submits claim form, policy number, invoice, and evidence through the React UI.
2. `POST /api/claims` creates a new claim record and uploads files to object storage.
3. FastAPI stores metadata in PostgreSQL and triggers the LangGraph workflow.
4. Extraction Agent runs OCR and writes structured fields plus confidence scores.
5. If mandatory fields are missing or confidence is low, Clarification Agent creates a clarification task.
6. Claimant responds through `POST /api/claims/{claim_id}/clarifications`.
7. Policy Agent retrieves the relevant policy clauses and runs deterministic validation rules.
8. Fraud Agent computes risk indicators and duplicate-evidence checks.
9. Decision Agent applies payout threshold and fraud bands to output `approve`, `verify`, or `escalate`.
10. Explanation Agent writes a structured decision trace, including payable and non-payable breakdown.
11. Claimant communication layer sends status update or clarification prompt.
12. If approved, `POST /api/claims/{claim_id}/settle` simulates payout initiation and notification.
13. If partially covered or rejected, a policy-gap summary can be generated in later phases.
14. Dashboard reads claim state, turnaround time, and straight-through metrics from PostgreSQL.

### Core MVP API Surface

- `POST /api/claims`
  - create a new claim and upload files
- `GET /api/claims/{claim_id}`
  - fetch claim summary, current state, extracted fields, and decision trace
- `POST /api/claims/{claim_id}/clarifications`
  - submit missing values or replacement files after a clarification request
- `POST /api/claims/{claim_id}/review`
  - reviewer approves, rejects, or overrides a flagged case
- `POST /api/claims/{claim_id}/settle`
  - trigger settlement simulation for approved low-risk claims
- `GET /api/claims/{claim_id}/explanation`
  - fetch payout breakdown, rules triggered, and decision summary
- `POST /api/claims/{claim_id}/notify`
  - trigger claimant notification update for state changes
- `GET /api/dashboard/metrics`
  - return claims processed, fraud flags, STP rate, and average resolution time

### Agent State Machine

- `submitted`
- `extracting`
- `clarification_required`
- `policy_validation`
- `fraud_scoring`
- `decision_ready`
- `approved_for_stp`
- `verification_queue`
- `human_review`
- `settled`
- `closed`

### Minimal Database Schema

#### `claims`

- `id`
- `claim_type`
- `policy_number`
- `claim_amount`
- `status`
- `risk_score`
- `payout_estimate`
- `created_at`
- `updated_at`

#### `claim_documents`

- `id`
- `claim_id`
- `file_type`
- `storage_key`
- `ocr_status`
- `uploaded_at`

#### `extracted_fields`

- `id`
- `claim_id`
- `field_name`
- `field_value`
- `confidence_score`
- `source_document`

#### `audit_events`

- `id`
- `claim_id`
- `agent_name`
- `event_type`
- `event_payload`
- `created_at`

#### `review_actions`

- `id`
- `claim_id`
- `reviewer_id`
- `action`
- `comment`
- `created_at`

### MVP Decision Logic

- If extraction confidence is below threshold, request clarification.
- If policy validation fails, move to review or rejection path.
- If fraud score is between `0.0-0.3` and payout is below threshold, allow straight-through settlement.
- If fraud score is between `0.3-0.7`, move to verification queue.
- If fraud score is above `0.7` or payout exceeds configured threshold, require human approval.
- Always generate payout explanation showing deductible, exclusions, and payable amount.

## Working Prototype and Demo Flow

### MVP Demo Surfaces

- claimant submission screen
- live agent activity panel
- clarification prompt screen
- reviewer queue dashboard
- final decision and payout summary screen
- payout breakdown and explanation panel

### Demo Storyboard

1. User uploads a low-risk claim with invoice and policy number.
2. System shows live agent activity: extraction, policy check, fraud scoring, and decision.
3. Demo highlights extracted fields and confidence values.
4. Policy validation confirms that the claim is covered and deductible rules are applied.
5. Fraud score remains in the low-risk band.
6. Decision engine shows payout estimate and routes the claim to straight-through settlement.
7. UI shows notification and final status update.

### Clarification Demo Branch

To show resilience during judging:

1. Upload a blurred or incomplete bill.
2. Extraction Agent reports low confidence on one required field.
3. Clarification Agent requests a clearer image or manual value entry.
4. User responds.
5. Workflow resumes and reaches a decision.

This branch is useful because it proves the system can recover from messy real-world data instead of failing on non-ideal inputs.

### Prototype Scope for May 7 Evaluation

The working prototype should demonstrate:

- one claim category end to end
- one clarification loop
- one low-risk straight-through settlement path
- one human-review path for higher-risk claims
- live dashboard metrics and activity trace

## Roadmap

### Phase 1. Hackathon MVP

Build a working flow for one low-risk claim category.

Scope:

- claim upload
- OCR and structured extraction
- confidence-aware clarification flow
- policy validation for one claim type
- basic fraud-risk scoring
- payout estimate
- approve or escalate output
- live agent activity feed
- simple dashboard

### Phase 2. Pilot-Ready Workflow

Timeline:

- 2 to 4 weeks

Scope:

- configurable rule engine
- explanation panel
- notification workflow
- better document parsing
- manual verification queue
- configurable payout thresholds

### Phase 3. Operational Integration

Timeline:

- 4 to 8 weeks

Scope:

- payment integration
- stronger anomaly and duplicate checks
- audit trail hardening
- operations dashboard
- SLA and turnaround analytics
- recommendation report for high-value claims

### Phase 4. Enterprise Scale

Timeline:

- 8 to 12 weeks

Scope:

- support for multiple claim products
- broader insurer system integration
- more advanced fraud intelligence
- role-based access and enterprise security
- multi-channel deployment

## Presentation Edge

### Live Agent Activity Feed

Instead of showing a generic loading spinner, the UI should display a structured live workflow trace.

Example feed:

- Intake Agent: validating uploaded claim package
- Extraction Agent: extracted claim date and invoice amount
- Policy Agent: collision coverage active and deductible matched
- Fraud Agent: no duplicate invoice signal found
- Decision Agent: approved for straight-through settlement

This makes the project feel transparent, enterprise-ready, and aligned with the Agent Builder Challenge.

## Wow Factor and Demo Priorities

### Core Wow Factor

The strongest wow factor in this project is not perfect AI. It is resilient AI that shows its work, recovers from bad inputs, and still makes safe claim decisions.

### Highest-Impact Demo Priorities

#### A. Live Agent Activity Feed

This is the highest-impact UI addition before the demo.

Why it matters:

- makes the multi-agent architecture visible
- proves the agent workflow is real, not just conceptual
- helps judges understand extraction, policy checks, fraud scoring, and decision routing in real time

Demo examples:

- Extraction Agent: reading invoice amount
- Policy Agent: checking coverage and deductible
- Fraud Agent: evaluating anomaly indicators
- Decision Agent: routing to settlement or review

#### B. Messy Document Recovery

This is the strongest demo story.

Why it matters:

- shows the system can handle messy real-world inputs
- proves the clarification agent is useful, not decorative
- creates a memorable before-and-after moment during judging

Demo sequence:

1. Upload a blurred or incomplete bill.
2. Extraction confidence drops below threshold.
3. Clarification Agent asks for a missing field or clearer image.
4. User responds.
5. Workflow resumes and reaches a final decision.

This is the clearest proof that the platform works beyond a happy-path demo.

#### C. Fraud Score Visualization

This is a strong secondary demo addition.

Why it matters:

- makes fraud awareness visible in the UI
- shows why a claim is low, medium, or high risk
- supports explainability and enterprise trust

Show:

- fraud score band
- top reasons such as duplicate invoice, unusual amount, or provider anomaly

#### D. Manual vs ClaimSwift Comparison Panel

This is useful for the business-value slide and final pitch.

Why it matters:

- gives judges an immediate operational comparison
- makes cost and time savings feel concrete

Suggested comparison:

- manual process: days, multiple touchpoints, repeated follow-ups
- ClaimSwift: minutes for low-risk claims, fewer touchpoints, proactive notifications

### Best Demo Sequence

The strongest judge-facing flow is:

1. Upload a bad document.
2. Show the live agent activity feed updating in real time.
3. Trigger the clarification step.
4. Provide the missing input.
5. Resume the workflow automatically.
6. Show final decision, payout estimate, and explanation trace.

This is the most memorable and differentiated demo moment in the project.

## Innovation Section for Slide

Our innovation lies in automating not just claim intake but claim decisioning and settlement. The solution combines an agentic workflow, confidence-aware self-correction, policy-rule validation, fraud-aware risk scoring, and explainable decisioning to enable straight-through settlement for low-risk claims. Unlike basic OCR-led claim tools, the platform is designed to be enterprise-ready, auditable, and practical for real insurer workflows.

## Value Proposition and Returns

### Business Outcomes

- significantly lower handling effort for straightforward claims
- settlement time reduced from days to minutes for verified low-risk cases
- fewer status-check follow-ups through proactive notifications
- better fraud control and reduced payout leakage
- improved customer satisfaction through faster and more transparent claims processing
- reduced confusion around partial approvals through explicit payout breakdown

### Judge-Safe Metrics for the Deck

Use defensible target-style language:

- `60-90%` lower manual handling effort for straightforward claims
- low-risk verified claims can move from `days` to `minutes`
- proactive notifications can materially reduce status-check calls
- straight-through processing can improve insurer throughput without compromising auditability

Avoid overclaiming exact cost or payout-time numbers unless you can prove them with pilot data.

## Final WHY / HOW / WHAT

### WHY

Insurance claims are still slow, document-heavy, and expensive to process. Customers wait too long for simple reimbursements, while insurers spend heavily on repetitive manual review. Straightforward claims should not take days when policy logic, evidence checks, and payout rules can be automated safely.

### HOW

ClaimSwift AI uses an agentic workflow to coordinate extraction, clarification, policy validation, fraud screening, payout estimation, and explanation. Deterministic rules and dynamic risk guardrails decide whether a low-risk claim can be auto-settled or whether it must move to verification or human review.

### WHAT

The result is faster settlement, lower handling cost, better fraud control, stronger auditability, and improved customer experience. The system is scalable across claim categories and practical for real-world insurer operations.

## Problem Coverage Matrix

### Covered in Core MVP

- slow claim processing
- documentation chaos
- lack of transparency
- fraud and duplicate claims
- manual overload for insurers
- avoidable rejections due to missing documents or unresolved queries
- payout ambiguity through explicit decision and payout breakdown

### Partially Covered in MVP, Stronger in Later Phases

- multilingual and low-quality document handling
- complaint reduction through better visibility and notifications
- provider-cost outlier detection
- claimant history and trust context

### Addressed Better as Phase 2 or Context, Not Core MVP

- policy gap guidance after rejection
- mis-selling education and coverage advisory
- rising medical inflation as a market driver rather than a direct workflow problem

## Final 30-Second Judge Answer

Most teams will build a claim submission tool or OCR demo. We are building a straight-through claims engine that actually decides what to do next. Our platform uses an agentic workflow to read documents, recover from low-confidence inputs, validate policy rules, check fraud risk, estimate payout, and settle low-risk claims while routing high-value or risky cases to humans with full explanation and auditability.
