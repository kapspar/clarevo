# Founding-member codes (administrator procedure)

Founding-member access is a **lifetime account entitlement**, separate from beta access and future Stripe subscriptions. All users keep current beta access; codes do not charge anyone.

## Issue codes

In Supabase SQL Editor, execute the following **once** as the project administrator. **Save the returned plaintext codes immediately** in a secure place; only SHA-256 hashes are stored in the database, and plaintext cannot be retrieved afterward.

```sql
WITH generated AS MATERIALIZED (
  SELECT 'CLV-' || upper(replace(gen_random_uuid()::text, '-', '')) AS code
  FROM generate_series(1, 25)
), inserted AS (
  INSERT INTO private.founding_codes (code_hash)
  SELECT encode(sha256(convert_to(code, 'UTF8')), 'hex') FROM generated
  RETURNING code_hash
)
SELECT generated.code
FROM generated JOIN inserted
  ON inserted.code_hash = encode(sha256(convert_to(generated.code, 'UTF8')), 'hex')
ORDER BY generated.code;
```

Code format: `CLV-` followed by 32 random hexadecimal characters. Codes are high entropy and single-use. A code that has been redeemed cannot be reused even if its original user later deletes their account.

To issue another batch, adjust `generate_series(1, 25)`. Codes should be delivered privately to intended testers. Do not email a code in a public newsletter or commit plaintext codes to GitHub.

## Redemption flow

1. User signs in (including Google login).
2. In **Dashboard → Settings**, enter code in **Founding member invitation**.
3. RPC validates the logged-in user, rate limits attempts to 5 per hour, and atomically consumes the code.
4. Account gets `founding_lifetime` entitlement.
5. Settings confirms **Clarevo Family — Founding Member (Lifetime)**.

The redeem RPC cannot be called anonymously. Ordinary users cannot insert their own entitlements or read code hashes.

## Prelaunch checks

- Test with a disposable account and one issued code.
- Test reusing a redeemed code with a second test account, incorrect code, and repeated failed attempts.
- Confirm deleting a test account removes its entitlement but does not reopen its code.
- Run security advisors and review the intentional SECURITY DEFINER RPC.
- No paid-feature gating is activated by this migration. Enforce Family-only storage and access through server-side policies **after** beta, not by hiding upload controls.
- A permanent entitlement grants Family access only while the Family service exists, not unannounced future products.
