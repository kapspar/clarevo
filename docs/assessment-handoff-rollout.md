# Assessment-to-account rollout

This change stops pre-account assessment database inserts. Answers are held temporarily in the same browser under `clarevo_pending_assessment_v1` (24-hour application expiry) and saved after authentication under `assessments.user_id`.

## Before merging
- Test the preview UI without real sensitive information.
- Check signup, password login, confirmation redirect and dashboard using the **same browser origin**. Supabase auth confirmation URLs must be allowlisted for the preview origin or the browser-local handoff will not transfer across domains.
- Confirm assessment score is visible as **Family Clarity Check**, separately from the dashboard **Plan Completion Score**.
- Confirm that an assessment collected for one email is not attached to another signed-in account.
- Confirm the temporary browser record is removed after a successful database insert.
- Test that an error preserves the temporary record for retry.
- Do not publish unverified account data via analytics.

## After merging and checking live signup flow
The previous anonymous workflow uses the permissive policy below. Remove it as soon as the new flow is verified:

```sql
DROP POLICY IF EXISTS "Anyone can insert assessment" ON public.assessments;
```

Leave the owner-only insert policy (`auth.uid() = user_id`) in place. Consider limiting Data API INSERT grants to `authenticated` only after verifying no other clients require anonymous inserts.

## Limitations
- A browser-only handoff does not persist between different devices, private browsing sessions, or different origins (including separate Vercel preview domains).
- The stored browser assessment contains questionnaire answers; avoid shared devices and clear it when no longer needed.
- The dashboard's plan completion score is intentionally different from the initial questionnaire score.
- A separate end-to-end privacy and permissions test is still required.
