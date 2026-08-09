# Security Policy

## Supported Versions

| Version | Supported              |
| ------- | ---------------------- |
| 1.x     | ✅ Currently supported |
| < 1.0   | ❌ Development builds  |

## Reporting a Vulnerability

**Email:** security@oceanfresh.in
**Response SLA:** 24 hours acknowledgment

Please do NOT open public GitHub issues for security vulnerabilities.

## Security Architecture

OceanFresh follows a zero-trust architecture:

1. **All business logic runs server-side** (Supabase Edge Functions / API routes)
2. **Client-side code is considered untrusted**
3. **Supabase Row-Level Security (RLS) policies enforce authorization** (not the client)
4. **Input validated server-side with Zod** (client validation is UX only)
5. **All admin actions are audited**

For details, see [docs/SECURITY.md](docs/SECURITY.md) and [docs/security/](docs/security/).
