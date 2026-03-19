# Payment Gateway — Outage Runbook

**Owner:** @payments-oncall
**Last Updated:** 2026-01-28
**Applies To:** payment-gateway

## When to Use This Runbook

Use this runbook when the payment gateway is completely unavailable — error rates above 90%, no successful transactions processing, or the service health check returning 5xx consistently for more than 1 minute.

## Immediate Steps

1. Declare major incident in PagerDuty and page the entire payments on-call team
2. Immediately disable payment feature flags to prevent further customer-facing failures (Feature Flags dashboard → `payment_gateway_enabled` → OFF)
3. Check Stripe, Adyen, and internal gateway health dashboards for upstream processor status
4. Review the last deployment — if deployed within the last 4 hours, roll back immediately (`kubectl rollout undo deployment/payment-gateway -n production`)
5. Notify customer support and prepare status page update at status.yourcompany.com

## Diagnostic Commands

```bash
# Check all payment gateway pods
kubectl get pods -n production -l app=payment-gateway -o wide

# Check service health endpoint
curl -s https://internal.yourcompany.com/api/health/payment-gateway

# Force rollback of last deployment
kubectl rollout undo deployment/payment-gateway -n production

# Check rollout status
kubectl rollout status deployment/payment-gateway -n production --timeout=120s

# Verify traffic is returning
watch -n 5 "kubectl logs -n production deployment/payment-gateway --since=30s | grep -c 'status=200'"
```

## Escalation Path

- On-call: @payments-oncall (immediate page, all members)
- VP Engineering: Page if duration > 15 minutes
- CTO bridge: Open if revenue impact > €100K estimated
- External: Stripe P1 support — +1-888-926-2289

## Related Runbooks

- [Payment Gateway Latency Runbook](./payment-gateway-latency.md) — for partial degradation
- [Platform General Incident Runbook](./platform-general-incident.md) — for infrastructure issues
