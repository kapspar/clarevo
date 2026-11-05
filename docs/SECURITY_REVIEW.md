# Clarevo security review

**Status:** Preliminary documentation/code review only, 2026-11-05. **NOT a security certification or completed audit.** Neither production Supabase policies nor cross-account access controls were tested in this review.

## Threat model and priorities

Clarevo may store highly sensitive family, financial, insurance and emergency information. Key risks: horizontal privilege escalation across households, leaked storage objects, overly broad sharing, compromised accounts, destructive updates, untrustworthy billing entitlements, and incomplete deletion.

## Outstanding findings / verification tasks

| Priority | Area | Observation | Required evidence / remediation |
|---|---|---|---|
| Critical / unverified | RLS and account isolation | No live policy review or negative API test completed | Inspect each table and prove Account B cannot read/update/delete Account A records |
| Critical / unverified | File storage | Storage policies and direct object access not reviewed | Test unauthorized download, list, overwrite, deletion, signed URL expiration and revoked shares |
| High / unverified | Sharing | UI code alone cannot prove enforcement | Test allowed sections, invite acceptance, revocation, expired links and ownership validation |
| High / unverified | Privileged functions | Edge Function and function permissions unreviewed | Check caller auth, service-role isolation, input validation, safe failure |
| High / unverified | Account deletion | Initial success previously reported, but not independently verified | Verify data/file cleanup, partial-failure behavior, error feedback and no orphaned accessible objects |
| High / unverified | Consent | Signup UI currently has passive acceptance text | Require unchecked explicit consent and server-stored timestamp/version, including OAuth |
| High / unverified | Recovery/auth flows | Redirect fix exists; Google/reset/magic-link unverified | Exercise fresh flows with disposable accounts and correct origins |
| High / unverified | Backups/retention | No verified policy or recovery procedure | Check backup, recovery, retention, access and deletion promises |
| High / unverified | Production security alerts | Supabase security warnings not inspected | Review privileged functions, password settings and advisor findings |
| Medium / unverified | Logging and monitoring | Not examined | Check logging avoids document contents, tokens and sensitive fields |

## Evidence collection protocol

Record precise action, account identity (use synthetic labels such as A/B), target resource type, expected behavior, actual result, date, and test environment. Do not store email verification tokens, auth headers, full object URLs with secrets, private documents or credentials.

Use **deny-by-default** database and storage rules. UI-only hiding is insufficient. Verify authorization server-side for all reads, updates, deletes and entitlements. Avoid running destructive SQL against live data; seek approval for production changes.

## Known code observations

- `login.html` explicitly sets production-domain confirmation and Google OAuth redirects after PR #8. This improves navigation, not the security of account access itself.
- `dashboard.html` requests the Supabase session; database and storage protection still depends on server-side enforcement.
- `pricing.html`, `privacy.html`, and `terms.html` exist, but their legal/security assertions need validation against real infrastructure.

## Acceptance gate for sensitive documents

Before inviting real sensitive uploads: review policies and roles; pass two-account negative authorization tests; verify sharing and revocation; validate deletion/retention; resolve high-severity exposures; review privacy/terms and incident response with appropriate experts. Maintain evidence links and exceptions here.

## Read-only production audit, 2026-11-05

| Severity | Evidence | Status and next check |
|---|---|---|
| High | Invite owners control `shared_access.owner_name`. Dashboard and multi-plan welcome cards previously interpolated that value into HTML. A recipient opening their plan list could execute attacker-controlled script in a signed-in Clarevo page. Outgoing cards also interpolated row fields into HTML and inline handlers. | Fixed on feature branch with static markup, text assignment and callback bindings. Stub regression passed. Verify in a browser with synthetic data before release. |
| High | Dashboard accept and decline handlers ignore database errors. Decline sends only status, while the deployed enabled invitee guard requires the new recipient ID to match the signed-in user. A pending invitation with no bound ID can fail silently. | Separate change. Test both transitions and rejected updates, then only mutate UI state after confirmed persistence. |
| High | Shared view mints one-hour bearer URLs as it renders. Existing signed links may survive removal of the share until expiry. | Validate after revocation. Review on-demand authenticated downloads separately. |
| High | Login sends recovery links to the dashboard. Source review found no dedicated recovery password update flow. | Implement and verify password reset completion with a synthetic mailbox. |
| Medium | Supabase advisor reports leaked-password protection disabled and two authenticated SECURITY DEFINER RPCs. | Inspect project options and review the expected RPC exposure before changing grants. |

Read-only catalog evidence: all 14 public tables have RLS enabled. Binder owner rules use user IDs, and shared reads call a section-specific helper bound to the JWT user ID and registered/active invitation. The assessments SELECT policy also matches JWT email. The live invitee-update guard is enabled and blocks changes to owner and section flags. The `documents` bucket is private with a 10 MiB limit and PDF/JPEG/PNG allowlist. Storage has owner-folder rules, a quota rule and section-linked shared read rules. These observations establish configuration, with runtime authorization tests still pending.

Deployed Edge Function metadata shows JWT verification enabled for `send-invite` and `delete-account`. Source inspection of deployed `send-invite` confirmed caller validation and invite lookup scoped to the caller's owner ID. Repository deletion code verifies caller identity before cleanup. Deployed delete-account v3 source matched the repository byte for byte. The live schema cascades Auth deletion to entitlements, code attempts, binder rows and bound sharing records. The redemption record uses SET NULL on the former account reference. Deletion runtime, unbound invitations and cleanup under partial failure remain open. No customer records or documents were queried.
