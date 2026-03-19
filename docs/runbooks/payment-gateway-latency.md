# Payment Gateway — Latency Degradation Runbook

**Owner:** @payments-oncall
**Last Updated:** 2026-02-15
**Applies To:** payment-gateway

## When to Use This Runbook

Use this runbook when the payment-gateway service reports sustained latency above 800ms or error rates above 15% for more than 3 consecutive minutes. Typical symptoms: checkout timeouts, transaction failure spikes, customer "payment declined" errors without actual card issues.

## Immediate Steps

1. Check payment processor API status at status.stripe.com — verify no active incidents
2. Verify database connection pool utilization in Datadog (Dashboard: Payment Gateway > DB Metrics)
3. Check recent deployments in the last 2 hours via GitHub Actions deployment log
4. If DB connections > 80%: restart connection pool on payment-db-01 (`kubectl rollout restart deployment/payment-db-proxy -n production`)
5. Escalate to payments team lead if not resolved within 10 minutes of starting this runbook

## Diagnostic Commands

```bash
# Check pod health
kubectl get pods -n production -l app=payment-gateway

# Tail recent error logs
kubectl logs -n production deployment/payment-gateway --since=5m | grep -E "ERROR|WARN|timeout"

# Check DB connection pool
kubectl exec -n production deployment/payment-gateway -- curl -s http://localhost:9090/metrics | grep db_pool

# Check upstream Stripe connectivity
curl -s -o /dev/null -w "%{http_code} (%{time_total}s)" https://api.stripe.com/v1/charges -H "Authorization: Bearer $STRIPE_KEY_READONLY"
```

## Escalation Path

- On-call: @payments-oncall
- Team lead: @payments-lead
- P1 escalation (if not resolved in 10 min): @payments-lead + @sre-lead
- External: Stripe support (P1 incidents): support.stripe.com/contact

## Related Runbooks

- [Payment Gateway Outage Runbook](./payment-gateway-outage.md) — for complete outages
- [Platform General Incident Runbook](./platform-general-incident.md) — for cross-service issues
