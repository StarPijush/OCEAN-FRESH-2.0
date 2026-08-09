# ADR 004: Cloud Functions for Sensitive Operations

**Status:** Superseded — sensitive operations now use Supabase Edge Functions  
**Date:** 2026-07-16

## Context

The current architecture performs all sensitive operations client-side:

1. OTP generation via `Math.random()`
2. Password comparison against plaintext in database
3. Order creation with client-generated order IDs
4. Auth session stored in `localStorage`

This is fundamentally insecure.

## Decision

Move all sensitive operations to Firebase Callable Cloud Functions.

## Operations Moved

| Operation            | Before                         | After                                    |
| -------------------- | ------------------------------ | ---------------------------------------- |
| OTP generation       | `Math.random()` in browser     | `crypto.randomInt()` in Cloud Function   |
| OTP verification     | Compare in memory              | Compare hashed value in Firestore        |
| Order creation       | `Store.addOrder()` from client | `createOrder` Cloud Function             |
| Admin claim          | Direct RTDB write              | `createAdminClaim` Cloud Function        |
| Image processing     | Client-side canvas             | `sharp` in Cloud Function                |
| Payment verification | None                           | `verifyPayment` Cloud Function           |
| Stats computation    | Client fetches ALL data        | `aggregateDailyStats` scheduled function |

## Rationale

- **Security:** Business logic cannot be inspected or modified by clients
- **Validation:** Server-side Zod validation protects against malformed requests
- **Rate limiting:** Applied server-side via Firebase Extensions
- **Audit:** All operations logged server-side
- **Atomicity:** Firestore transactions in Functions guarantee consistency

## Alternatives Considered

- **Firebase Extensions:** Too limited in customization (rejected)
- **Express server on Vercel:** Additional ops burden, cold starts (rejected — Functions are simpler)
- **Third-party BaaS:** Would fracture the architecture (rejected)

## Consequences

- Cold start latency for infrequent operations (~500ms-1s)
- Higher Firebase bill for function invocations
- Must handle Function errors gracefully on client
- Functions must be idempotent (Firestore at-least-once delivery)
