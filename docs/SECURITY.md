# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x (current) | ✅ |
| < 1.0 | ❌ |

## Reporting a Vulnerability

**Email:** security@oceanfresh.in
**PGP Key:** Available at https://oceanfresh.in/.well-known/security.txt

Please do NOT open public GitHub issues for security vulnerabilities.

### Disclosure Timeline

| Severity | Acknowledgment | Fix Timeline | Public Disclosure |
|---|---|---|---|
| Critical | 24 hours | 7 days | After fix deployed |
| High | 48 hours | 14 days | After fix deployed |
| Medium | 72 hours | 30 days | After fix deployed |
| Low | 1 week | 90 days | Per discretion |

## Security Architecture

### Defense in Depth

| Layer | Mechanism |
|---|---|
| Network | HTTPS enforced, HSTS, CSP, CORS |
| Application | Firebase App Check (reCAPTCHA v3) |
| Authentication | Firebase Auth with email/phone + MFA |
| Authorization | Custom Claims + Firestore rules |
| Input Validation | Zod on client + server |
| Output Encoding | React JSX (auto-escaped) + CSP |
| Rate Limiting | Cloud Functions rate-limiter |
| Data Access | Firestore per-document rules |
| Audit | All admin actions logged |
| Monitoring | Sentry + Firebase Alerts |

### Data Protection

- **Passwords:** Never stored or transmitted — Firebase Auth handles them
- **PII:** Customer data encrypted at rest (Firestore default)
- **API Keys:** Firebase API keys are public by design (restricted by App Check)
- **Secrets:** Stored in GitHub Secrets + Firebase Secrets Manager
- **Token Storage:** Firebase Auth ID tokens in memory only (not localStorage)

### Compliance

- **India:** Compliant with IT Act 2000 + CERT-In reporting
- **GDPR:** Data export/delete available
- **PCI-DSS:** Payment processing via Razorpay (no card data touches our servers)

## Security Checklist (Pre-Release)

- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] CSP headers configured
- [ ] All env vars documented (`.env.example`)
- [ ] App Check enabled
- [ ] No secrets committed to git
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all forms
- [ ] No dangerouslySetInnerHTML
- [ ] Custom claims validated on admin routes
- [ ] Audit logging for admin actions
- [ ] npm audit: zero high/critical
- [ ] OWASP ZAP scan passed
- [ ] No console.log in production
- [ ] Error messages sanitized

## Incident Response

See [docs/security/incident-response.md](security/incident-response.md)
