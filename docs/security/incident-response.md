# Security Incident Response Plan

## Severity Levels

### SEV-1: Critical (Service Down / Data Breach)

**Examples:**
- Service unavailable for all users
- PII data breach confirmed
- Admin account compromised

**Response:**
- **Acknowledge:** <5 minutes
- **Mitigate:** <1 hour
- **Notify affected users:** <24 hours (legal requirement)
- **Post-mortem:** <48 hours

**Team:**
- On-call engineer (primary)
- Principal architect (secondary)
- CTO (escalation)

### SEV-2: High (Degraded Service)

**Examples:**
- Service slow for significant subset of users
- Cloud Function errors >5%
- Firebase quota exceeded

**Response:**
- **Acknowledge:** <15 minutes
- **Mitigate:** <2 hours
- **Post-mortem:** <1 week

### SEV-3: Medium (Minor Issue)

**Examples:**
- UI bug affecting small subset of users
- Performance degradation <20%
- Non-critical feature broken

**Response:**
- **Acknowledge:** <2 hours
- **Fix:** Next sprint

## Communication

| Channel | Purpose |
|---|---|
| Slack #incidents | Real-time incident communication |
| status.oceanfresh.in | Public status page |
| Email (all-hands) | Major incident notifications |

## Incident Process

1. **Detect:** Automated alert or user report
2. **Acknowledge:** Responder claims incident in Slack #incidents
3. **Triage:** Determine severity, impact, and affected components
4. **Mitigate:** Apply hotfix, rollback, or feature flag
5. **Resolve:** Confirm service is healthy (all checks pass)
6. **Learn:** Write post-mortem, update runbooks

## Post-Mortem Template

```
## Title: [Brief description]

## Date: YYYY-MM-DD

## Severity: SEV-1/SEV-2/SEV-3

## Summary
[2-3 sentence description of what happened]

## Timeline
- HH:MM - Alert triggered
- HH:MM - Engineer acknowledged
- HH:MM - Root cause identified
- HH:MM - Mitigation applied
- HH:MM - Service healthy confirmed

## Root Cause
[Technical explanation]

## Impact
- Users affected: [count]
- Duration: [minutes]
- Data loss: [yes/no]

## Action Items
- [ ] Short-term fix (owner, deadline)
- [ ] Long-term fix (owner, deadline)
- [ ] Monitoring improvement (owner, deadline)

## Lessons Learned
[What went well, what went wrong]
```
