# Clarevo decision log

As of 2026-11-05. Decisions reflect owner direction from project conversations; they are not evidence that implementation is complete.

| Date | Decision | Reason / constraint |
|---|---|---|
| 2026-11 | Public site is `https://clarevo.ca` | Production authentication should return to this domain, not an ephemeral Vercel preview |
| 2026-11 | Founding members receive unique lifetime **Family** redemption codes | Reward early testers, preserve entitlement for each successfully redeemed code |
| 2026-11 | Future new-customer Family price target: **CAD $30/year** | Keep this visible in messaging, do not treat beta users as paid subscribers |
| 2026-11 | Controlled beta precedes live Stripe billing | Validate usefulness and security before taking payments |
| 2026-11 | Only synthetic data until sensitive-upload readiness is demonstrated | Family documents and financial information introduce real privacy/security exposure |
| 2026-11 | Use PRs instead of direct changes to main | Owner reviews/authorizes merges and production changes |
| 2026-11 | Avoid expensive/unnecessary tooling, ad spend and premature complexity | Prioritize secure onboarding, measurable usage and feedback |
| 2026-11 | Owner handles TC ethics/disclosure, Ontario registration, banking and professional advisers | AI can prepare materials but must not falsely mark owner/professional tasks complete |

## Open decisions

- Sole proprietorship vs incorporation and insurance arrangements, particularly for storing sensitive customer documents.
- Final legally reviewed privacy/terms language and versioning.
- Exact founding-member code eligibility, expiration of **unredeemed** codes, and abuse limits (must not revoke promised redeemed lifetime entitlements).
- Production billing activation date, refund terms and applicable tax handling.
- Formal beta scope and launch criteria after security review.

## Decision-change protocol

When revising an existing decision, document date, owner approval, rationale, implementation impact and any required customer notice. Never silently change pricing or lifetime access semantics.

## Phase 1 implementation decisions

- Render sharing record fields as text and bind actions through callbacks. Retain the existing static frontend and database authorization while eliminating HTML and JavaScript interpretation of record values.
- Use read-only production catalog inspection for the baseline. Record synthetic two-account runtime tests separately and reserve destructive cleanup tests for an isolated environment.
