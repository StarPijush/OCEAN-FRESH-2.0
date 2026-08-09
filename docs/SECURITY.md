# Security Policy

## Supported Versions

| Version       | Supported |
| ------------- | --------- |
| 1.x (current) | ✅        |
| < 1.0         | ❌        |

## Reporting a Vulnerability

**Email:** security@oceanfresh.in
**PGP Key:** Available at https://oceanfresh.in/.well-known/security.txt

Please do NOT open public GitHub issues for security vulnerabilities.

### Disclosure Timeline

| Severity | Acknowledgment | Fix Timeline | Public Disclosure  |
| -------- | -------------- | ------------ | ------------------ |
| Critical | 24 hours       | 7 days       | After fix deployed |
| High     | 48 hours       | 14 days      | After fix deployed |
| Medium   | 72 hours       | 30 days      | After fix deployed |
| Low      | 1 week         | 90 days      | Per discretion     |

## Security Architecture

### Defense in Depth

| Layer            | Mechanism                         |
| ---------------- | --------------------------------- |
| Network          | HTTPS enforced, HSTS, CSP, CORS   |
| Authentication   | Supabase Auth with email/phone    |
| Authorization    | Supabase RLS policies (row-level) |
| Input Validation | Zod on client + server            |
| Output Encoding  | React JSX (auto-escaped) + CSP    |
| Data Access      | PostgreSQL RLS per-table policies |
| Audit            | All admin actions logged          |
| Monitoring       | Sentry                            |

### Data Protection

- **Passwords:** Never stored or transmitted — Supabase Auth handles them with bcrypt
- **PII:** Customer data protected by PostgreSQL RLS policies
- **API Keys:** Supabase anon key is restricted by RLS (safe for client use)
- **Secrets:** Stored in GitHub Secrets + Supabase Secrets
- **Token Storage:** Supabase Auth refresh token in memory only (not localStorage)

### Compliance

- **India:** Compliant with IT Act 2000 + CERT-In reporting
- **GDPR:** Data export/delete available
- **PCI-DSS:** Payment processing via Razorpay (no card data touches our servers)

## Security Checklist (Pre-Release)

- [ ] RLS policies deployed and verified
- [ ] Storage bucket policies configured
- [ ] CSP headers configured
- [ ] All env vars documented (`.env.example`)
- [ ] No secrets committed to git
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all forms
- [ ] No dangerouslySetInnerHTML
- [ ] Admin auth uses Supabase Auth (not localStorage)
- [ ] Admin actions audited
- [ ] npm audit: zero high/critical
- [ ] OWASP ZAP scan passed
- [ ] No console.log in production
- [ ] Error messages sanitized

## Incident Response

See [docs/security/incident-response.md](security/incident-response.md)
