# Trading API — Latency Degradation Runbook

**Owner:** @trading-oncall
**Last Updated:** 2026-02-10
**Applies To:** trading-api

## When to Use This Runbook

Use this runbook when the trading API reports latency above 800ms, order execution error rates above 15%, or order routing failures. This is a **regulatory-critical** service — any degradation must be logged per MiFID II Article 17 requirements. Guardian auto-classifies this as P1 due to trading SLA of 15 minutes.

## Immediate Steps

1. Check market data feed latency — Bloomberg/Refinitiv connection health in the market data dashboard
2. Verify order routing layer and FIX gateway connection pool status (Trading Ops → FIX Connections)
3. Check database connection pool on trading-db-01 and trading-db-02 (Datadog → Trading → DB)
4. Review circuit breaker status on downstream broker connections — any tripped breakers will cascade
5. Escalate to markets SRE immediately if latency remains above 500ms for more than 2 minutes — no further diagnostic steps before escalation

## Diagnostic Commands

```bash
# Check trading API pods
kubectl get pods -n production -l app=trading-api

# Check FIX gateway connections
kubectl logs -n production deployment/trading-api --since=5m | grep -E "FIX|circuit_breaker|BROKER"

# Check order execution latency
kubectl logs -n production deployment/trading-api --since=5m | grep "order_latency" | awk -F= '{print $2}' | sort -n | tail -20

# Verify DB connection pool
kubectl exec -n production deployment/trading-api -- curl -s localhost:9090/metrics | grep "db_pool_active\|db_pool_idle"

# Check circuit breakers
curl -s https://internal.yourcompany.com/api/trading/circuit-breakers | jq .

# Reset a specific circuit breaker (USE WITH CAUTION)
curl -X POST https://internal.yourcompany.com/api/trading/circuit-breakers/{breaker-id}/reset
```

## Regulatory Notes

All trading API incidents must be logged in the MiFID II incident register within 30 minutes of detection. Guardian's post-mortem PDF satisfies this requirement if completed before the 30-minute mark.

## Escalation Path

- On-call: @trading-oncall + @markets-sre (immediate, both)
- Trading desk: Notify head of trading if market hours + duration > 5 minutes
- Compliance: @compliance-officer if MiFID II reporting threshold reached
- Regulators: Via compliance team only — do not contact directly

## Related Runbooks

- [Platform General Incident Runbook](./platform-general-incident.md) — for infrastructure issues
