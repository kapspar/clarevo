# Clarevo work progress and session handoff

**As of:** 2026-11-05. Recheck GitHub and deployed site at the start of every session. This file is intentionally conservative.

## Current baseline

| Item | Evidence/status | Next verification |
|---|---|---|
| Live site | Owner reports `clarevo.ca` is live | Validate deployed SHA and route behavior |
| PR #7 | Owner reports merged and Save/Remove behavior working | Independently verify cross-account effects and upload restrictions |
| PR #8 | GitHub PR #8 created for auth redirects; owner reports merged and confirmation link works | Verify merged SHA, fresh signup, Google login, reset and magic links |
| Pricing | `pricing.html` exists with Free/Family messaging | Review exact founding offer copy and entitlement rules |
| Legal pages | `privacy.html` and `terms.html` exist | Compare claims with data flows and legal advice |
| Account deletion | `dashboard.html` contains deletion flow; prior initial test reported | Validate cleanup, errors and failure cases |
| Consent | Signup UI shows passive 'By creating an account...' notice | Implement explicit unchecked acceptance and durable record |
| Security isolation | Not validated in this review | Inspect RLS/storage and run two-account negative tests |
| Stripe | No verified live payment integration | Defer to test-mode phase |

## Highest priority next task

**Two-account permissions and sharing test.** First inspect Supabase schema, RLS, storage policies, Edge Functions and the dashboard sharing code. Create synthetic test data in two disposable accounts. Check that unshared records and files are inaccessible through both UI and direct API/object paths; check permitted access and revocation. Do not use personal documents or loosen policies. Record exact steps/results in `docs/SECURITY_REVIEW.md`.

## Findings during documentation preparation

- `README.md` and the four docs listed in the master Work prompt were absent from default branch when checked on 2026-11-05.
- Frontend includes static `login.html`, `dashboard.html`, `pricing.html`, `privacy.html`, `terms.html`.
- Current `login.html` specifies `https://clarevo.ca/dashboard.html` for email signup and Google OAuth after PR #8.
- `dashboard.html` calls Supabase `getSession()`, which is **not** evidence of secure server-side authorization.
- No root `package.json` or `vercel.json` found in this check. Deployment and testing setup need confirmation.
- Live Supabase RLS configuration, bucket policies, Edge Functions and Vercel environment were **not** accessed during this docs-only review.

## Session log

- **2026-11-05:** Documentation baseline drafted. No product code, database policies or live settings changed. Docs PR pending at time of writing.

## Handoff template (update after each task)

- Date / operator:
- Branch / PR / relevant commit:
- Files/config affected:
- Findings and action taken:
- Validation performed (commands, test accounts, negative tests):
- Result: implemented / tested / reviewed / merged / deployed / production verified:
- Blockers and owner approvals required:
- Next task:

Never write secrets, customer data, raw auth URLs or credentials here.

## 2026-11-05 audit and first remediation

- Reconciled baseline at main `391e68e`. GitHub confirmed #7, #8 and documentation PR #9 merged. No open PRs were returned at session start. Public login and dashboard responses matched main byte for byte before editing. Vercel project settings, deployment SHA and Auth allowlist remain unverified.
- Reviewed live schema policies and function metadata using read-only Supabase access. See Security Review for evidence and the remaining production verification gate.
- Branch `fix/shared-invite-html-injection` changes `dashboard.html` and `shared-welcome.html`. Invite fields render as text and action buttons receive data through JavaScript callbacks. Removed the browser log containing the invitation record.
- Local validation passed: `node tests/sharing-render.cjs` (synthetic hostile markup and quoted values in three render paths, action callbacks, inline JavaScript syntax) and `git diff --check`. This is a DOM/API stub test, with browser and production behavior pending.
- Next: fix invitation accept/decline error handling and test with two dedicated synthetic identities. Check no-share denial, section-specific read, write denial and revocation at the API and Storage layers. Confirm test environment and mailbox access first. Keep reset completion and signed file URLs in separate changes.
