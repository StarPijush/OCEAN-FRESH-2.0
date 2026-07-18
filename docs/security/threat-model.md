# Threat Model

## STRIDE Analysis

| Threat | Asset | Risk | Mitigation |
|---|---|---|---|
| **Spoofing** | Admin identity | Attacker gains admin access | Firebase Auth + MFA + Custom Claims |
| **Tampering** | Order data | Customer gets wrong order | Cloud Function validation + Firestore rules |
| **Repudiation** | Order placement | "I didn't order this" | Audit logs + confirmation notifications |
| **Information Disclosure** | Customer PII | Privacy violation per IT Act | Firestore rules + encryption + access controls |
| **Denial of Service** | Public endpoints | Service unavailable | App Check + Rate limiting + Quotas |
| **Elevation of Privilege** | Customer → Admin | Unauthorized data access | Custom claims validated on every request |

## Attack Surface

### Public (Unauthenticated)
- Product listing (GET)
- Pincode check
- Search
- **Risk:** Low (read-only)

### Authenticated (Customer)
- Place order
- View own order history
- **Risk:** Medium (PII exposure)

### Admin (Custom Claim)
- Dashboard analytics
- Product CRUD
- Order management
- Settings management
- **Risk:** High (full data access)

### System
- Cloud Functions
- Firestore writes
- Storage uploads
- **Risk:** High (data integrity)

## Attack Trees

### Admin Account Takeover
```
1. Brute force password → Rate limited (blocked)
2. OTP interception → Server-generated, never exposed (blocked)
3. Firebase Auth exploit → Google-managed security (blocked)
4. Social engineering → Training + MFA (mitigated)
5. Session hijacking → Short-lived tokens + refresh (mitigated)
```

### Data Exfiltration
```
1. Direct Firestore access → Rules block unauthenticated (blocked)
2. Compromised admin account → MFA + anomaly detection (mitigated)
3. SSRF via Cloud Functions → Scoped service accounts (blocked)
4. XSS to steal tokens → CSP + React auto-escaping (blocked)
5. Malicious dependency → Dependabot + npm audit (mitigated)
```

## Data Classification

| Classification | Examples | Storage | Access |
|---|---|---|---|
| Public | Product names, prices, categories | Firestore (read: true) | Anyone |
| Internal | Delivery charge, service pincodes | Firestore (read: auth) | Authenticated users |
| Confidential | Customer names, phones, addresses | Firestore (read: owner/admin) | Customer + Admins |
| Restricted | Admin credentials, Firebase project keys | Firebase Auth / Secrets Manager | Super admin only |
