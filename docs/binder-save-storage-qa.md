# PR #7 — Binder save semantics, uploads and access QA

## Save versus remove

On the Vercel preview, use disposable test accounts and files only.

1. In **Insurance**, add a policy and press **Save Insurance**. Return to the dashboard and confirm the policy is listed.
2. Reopen Insurance, click **Remove**, confirm the prompt, and **return to the dashboard without Save**. The policy should still exist.
3. Reopen Insurance, remove the policy, then press **Save Insurance**. The dashboard should no longer list it.
4. Repeat steps 1–3 for at least one item in **Bills & Access** and **Finances** (they share ListManager).
5. On Insurance, select a PDF in an entry. Leave without saving; refresh to confirm it was not uploaded. Save another entry with the PDF, refresh, and confirm it exists.
6. Replace or remove an attachment, then leave without Save. Original file must remain. Repeat with Save; old file should disappear.
7. Repeat the attachment tests in **Legal Documents**, which uses a separate upload implementation.
8. Test repeated saves, an invalid/over-quota file, and a failed upload. A failed save must not destroy the existing file.

## File restrictions

- Only PDF, JPEG and PNG allowed; max **10 MiB (10,485,760 bytes)** per file.
- Combined owner-folder storage capped at **1 GiB (1,073,741,824 bytes)**, representing one owner-managed family binder in the current account model.
- The restriction applies in Supabase Storage, not just the browser.
- In Dashboard → Settings, verify storage usage displays correctly and increases after saving a file.
- A quota error must not change an existing saved record. The 1 GiB threshold and simultaneous uploads need a dedicated test (don't upload 1 GiB of real documents for this).
- The quota relies on Supabase Storage-populated metadata and an authenticated restricted policy. Recheck behaviour after future Storage API changes.

## Sharing security

Use two independent test users, Owner and Invitee.

1. Owner creates test entries with attached files in Legal, Insurance, Bills, Kids and Business.
2. Grant Invitee **only Legal**. Invitee should view authorized legal sections/files, not other sections.
3. Toggle Bills, Kids and Business separately; each allowed document should become readable only while its corresponding permission is active.
4. Revoke Invitee access; all shared records and file links should stop working (note previously issued signed URLs can remain usable until expiry).
5. An unrelated authenticated account must not be able to list, download, replace or delete Owner's documents.
6. Anonymous request must not use the shared-access helper.

## Supabase security advisor

- `public.has_shared_access` is a purpose-built SECURITY DEFINER function used by sharing RLS. Anonymous execution was revoked; signed-in execution remains to support policies. Review direct RPC exposure and possible move to a private schema separately. <https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable>
- `public.redeem_founding_code` is also intentionally SECURITY DEFINER; redemption requires an authenticated user, validates a high-entropy single-use code and rate-limits attempts. Direct authenticated execution remains necessary for the current dashboard RPC. Review further before commercial launch.
- **Leaked password protection remains disabled**. Enable it in Supabase dashboard Auth settings if supported by the plan: <https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection>
- Do not merge until the save/no-save and authorized-sharing tests above pass.

These migrations were applied to the live Supabase project for configuration testing. Frontend changes are only on the PR branch.
