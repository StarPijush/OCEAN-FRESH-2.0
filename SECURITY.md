# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x | ✅ Currently supported |
| < 1.0 | ❌ Development builds |

## Reporting a Vulnerability

**Email:** security@oceanfresh.in
**Response SLA:** 24 hours acknowledgment

Please do NOT open public GitHub issues for security vulnerabilities.

## Security Architecture

OceanFresh follows a zero-trust architecture:

1. **All business logic runs server-side** (Firebase Cloud Functions)
2. **Client-side code is considered untrusted**
3. **Firestore security rules enforce authorization** (not the client)
4. **Firebase App Check blocks unverified clients**
5. **Input validated server-side with Zod** (client validation is UX only)
6. **All admin actions are audited**

For details, see [docs/SECURITY.md](docs/SECURITY.md) and [docs/security/](docs/security/).
