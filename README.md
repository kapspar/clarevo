# Clarevo

Clarevo is a Canadian family emergency-readiness and information-organizing web application. Public site: https://clarevo.ca

**Status (2026-11-05):** Live application; preparing for a controlled founding-member beta. Do not interpret a deployed feature as security-verified or production-ready for sensitive documents.

## Architecture (observed in repository)

- Static HTML/CSS/JavaScript frontend (for example `home.html`, `login.html`, `dashboard.html`, `pricing.html`).
- Supabase JavaScript client (v2 CDN) for authentication and application data, with Supabase-backed storage/services.
- Hosted on Vercel, with production domain `https://clarevo.ca`.
- Google OAuth and email/password authentication implemented in `login.html`.
- No root `package.json` found during the documentation review. Do not assume a Node build system or automated test suite exists.

**Do not put service-role keys, database passwords, verification links, or customer data in Git.** Browser-facing Supabase public/anon keys are not substitutes for RLS.

## Project roadmap and Work handoff

1. Read [Launch Plan](docs/LAUNCH_PLAN.md).
2. Read [Work Progress](docs/WORK_PROGRESS.md) and inspect GitHub PRs / current `main`; do not trust stale status notes.
3. Read [Security Review](docs/SECURITY_REVIEW.md) before modifying data access, sharing, storage, or authentication.
4. Read [Decisions](docs/DECISIONS.md) before changing pricing or founding-member entitlements.

For future ChatGPT Work sessions: select the highest-priority unfinished task, inspect relevant code and live configuration (with authorization), use a separate branch, test with synthetic data, open a small PR, and update these documents as part of the PR. Do not merge, deploy, change production permissions, activate payments, or send invitations without the owner's approval.

## Local inspection

This is a static site in the reviewed root. For UI development, serve the repository over local HTTP rather than opening pages as `file://`. Actual Supabase configuration, preview URLs and redirect allowlists require care: authentication may reach live services even from development pages. Use disposable test accounts and synthetic documents only. There are no verified automated test commands to report yet.

## Release checks

- Verify email sign-up confirmation, Google OAuth, login/logout, magic link and password reset on the production domain.
- Test account isolation, sharing and document access with two distinct test accounts.
- Review Supabase RLS, storage policies and privileged functions before real sensitive data.
- Check legal copy against actual data handling, and implement recorded consent.
- Obtain explicit approval before merging/deploying any change.

See the linked documents for detailed status. This README is for project orientation, not a claim of compliance or security certification.
