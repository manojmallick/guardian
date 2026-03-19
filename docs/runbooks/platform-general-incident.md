# Platform — General Incident Runbook

**Owner:** @platform-oncall
**Last Updated:** 2026-02-01
**Applies To:** platform (all services)

## When to Use This Runbook

Use this runbook when:
- The affected service does not have a dedicated runbook
- Multiple services are degraded simultaneously (potential infrastructure issue)
- An incident is in the platform layer (Kubernetes, networking, DNS, load balancer)
- Guardian classifies the service as "unknown" and falls back to this runbook

## Immediate Steps

1. Determine blast radius: check how many services are affected via Datadog Service Map or status.yourcompany.com (internal)
2. Check infrastructure health: Kubernetes node status, load balancer health, DNS resolution
3. Review recent infrastructure changes: Terraform deployments, cert rotations, firewall rule changes in last 4 hours
4. If multi-service impact: declare P1 and page @sre-lead + service owners for all affected services
5. Isolate root cause layer: application code, configuration, infrastructure, or external dependency

## Diagnostic Commands

```bash
# Check all production pods for unhealthy state
kubectl get pods -n production --field-selector='status.phase!=Running' | head -30

# Check node conditions
kubectl get nodes -o custom-columns='NAME:.metadata.name,STATUS:.status.conditions[-1].type,REASON:.status.conditions[-1].reason'

# Check recent cluster events
kubectl get events -n production --sort-by='.metadata.creationTimestamp' | tail -20

# DNS resolution check
nslookup payment-gateway.production.svc.cluster.local

# Check load balancer health
kubectl describe service payment-gateway -n production | grep -A5 "Endpoints"

# Quick multi-service health scan
for svc in payment-gateway fraud-detection trading-api; do
  status=$(curl -s -o /dev/null -w "%{http_code}" https://internal.yourcompany.com/api/health/$svc)
  echo "$svc: HTTP $status"
done
```

## Escalation Path

- On-call: @platform-oncall
- SRE lead: @sre-lead (if P1 or multi-service)
- Infrastructure: @infra-oncall (for Kubernetes/networking issues)
- VP Engineering: Page if > 2 P1 services affected simultaneously

## Related Runbooks

- [Payment Gateway Latency Runbook](./payment-gateway-latency.md)
- [Payment Gateway Outage Runbook](./payment-gateway-outage.md)
- [Fraud Detection Degradation Runbook](./fraud-detection-degradation.md)
- [Trading API Latency Runbook](./trading-api-latency.md)
