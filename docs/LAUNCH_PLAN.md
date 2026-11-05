# Clarevo launch plan

Last reviewed: 2026-11-05. This is a staged execution plan, not a claim that outstanding controls have passed testing.

## Objective

Launch a **controlled founding-member beta** using unique lifetime Family codes; subsequently offer Family at **CAD $30/year** to new paying users. Do not collect real sensitive documents until security/privacy readiness is demonstrated.

## Phase 1 — Security and signup (blocking for sensitive-data beta)

- [x] PR #7 Save/Remove fix merged; owner reported live behavior working. Other changes in that PR require separate verification.
- [x] PR #8 auth redirect fix merged; owner reported email confirmation navigation working. Google OAuth and other paths remain to be verified.
- [ ] Two-account isolation: verify database records, shared sections, document access, direct object paths, and revoked access.
- [ ] Audit RLS policies on every user-data table and storage bucket, as well as privileged functions and Edge Function authentication.
- [ ] Test signup, email confirmation, Google OAuth, session handling, logout, magic links, password reset, account deletion and data cleanup.
- [ ] Implement mandatory, initially unchecked Terms/Privacy acceptance for email and Google signup, with server-recorded version and timestamp.
- [ ] Review policy pages, contact information, deletion and retention statements against actual behavior; obtain Canadian legal review where appropriate.
- [ ] Review Supabase security warnings and password protection options.
- [ ] Owner: check Transport Canada outside-business/conflict-of-interest disclosure requirements.

**Gate:** documented test evidence for identity, authorization and deletion plus appropriate legal/privacy review before inviting strangers to upload real sensitive content.

## Phase 2 — Business setup (owner tasks)

- [ ] Decide sole proprietorship vs incorporation with appropriate liability advice.
- [ ] Verify business name availability and register in Ontario if appropriate.
- [ ] Set up separate banking and bookkeeping.
- [ ] Create/verify Stripe account using accurate legal details, initially in test mode.
- [ ] Consider tax registration thresholds, insurance and professional review. Do not assume this checklist is legal/tax advice.

## Phase 3 — Founding-member beta

- [ ] Audit redemption rules for server-side enforcement, uniqueness, authorization, one-time use and persistence.
- [ ] Create 25 unique lifetime Family codes only after code security is verified.
- [ ] Publish clear founding-member copy alongside future CAD $30/year pricing.
- [ ] Prepare onboarding email, feedback form and low-data usage metrics.
- [ ] Owner authorizes and sends invitations to controlled users.
- [ ] Measure invite activation, completed binders, sharing success, feedback and referrals.

**Suggested validation target:** 25 invites, 10 completed binders, 5 people willing to recommend Clarevo. Treat as experiment targets, not current results.

## Phase 4 — Payment readiness

- [ ] Implement annual CAD $30 Stripe Checkout in test mode.
- [ ] Validate webhook signatures, idempotency and server-side entitlements.
- [ ] Keep permanent founding entitlements separate from paid subscriptions.
- [ ] Build cancellation, renewals, failures and user billing-management workflows.
- [ ] Test payment lifecycle end to end; owner approves live billing enablement.
- [ ] Stop issuing founding codes without revoking prior lifetime grants.

## Phase 5 — Growth and quality

- [ ] Improve mobile UX, accessibility, performance and error handling.
- [ ] Improve onboarding based on beta feedback.
- [ ] Add useful educational content/SEO.
- [ ] Explore referrals and relevant partnerships.
- [ ] Revisit insurance, business structure, monitoring and disaster recovery as usage grows.

## Work execution protocol

1. Re-read `README.md`, `docs/WORK_PROGRESS.md`, `docs/SECURITY_REVIEW.md` and `docs/DECISIONS.md`; inspect GitHub and actual configuration.
2. Choose one highest-priority independently executable task; make a small branch/PR, not a direct push to `main`.
3. Record **implemented / tested locally / PR reviewed / merged / deployed / production-verified** distinctly.
4. Update documentation in the task PR. If blocked, record who can unblock it and proceed with safe independent work.
5. Never interpret unverified SQL, policy screenshots or code inspection as a passed isolation test.
