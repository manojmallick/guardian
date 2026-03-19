# Fraud Detection — Service Degradation Runbook

**Owner:** @risk-oncall
**Last Updated:** 2026-02-03
**Applies To:** fraud-detection

## When to Use This Runbook

Use this runbook when fraud detection model latency exceeds 500ms, model inference error rates rise above 10%, or the feature store is unavailable. Symptoms: fraud checks timing out, transactions being allowed through without fraud scoring, model inference errors in logs.

## Immediate Steps

1. Check ML model serving health in Seldon or KFServing dashboard (ML Platform → Model Status)
2. Verify feature store (Redis/Feast) connectivity and latency (Datadog → Fraud → Feature Store)
3. Check if fraud rules engine is already falling back to simplified rule set (log marker: `FALLBACK_RULES_ACTIVE`)
4. Switch fraud detection to fallback rule-based mode if model latency exceeds 500ms consistently (`kubectl set env deployment/fraud-detection FRAUD_MODE=rules-fallback -n production`)
5. Escalate to ML platform team if feature store is unavailable after 5 minutes

## Diagnostic Commands

```bash
# Check fraud detection pods
kubectl get pods -n production -l app=fraud-detection

# Check model serving latency
kubectl logs -n production deployment/fraud-detection --since=5m | grep -E "model_latency|feature_store"

# Check feature store connectivity
kubectl exec -n production deployment/fraud-detection -- redis-cli -h $REDIS_HOST ping

# View model inference errors
kubectl logs -n production deployment/fraud-detection --since=10m | grep -c "InferenceError"

# Enable fallback mode
kubectl set env deployment/fraud-detection FRAUD_MODE=rules-fallback -n production

# Verify fallback is active
kubectl logs -n production deployment/fraud-detection --since=1m | grep FALLBACK_RULES_ACTIVE
```

## Escalation Path

- On-call: @risk-oncall + @fraud-eng
- ML Platform: @ml-platform-oncall (for model serving issues)
- Risk team lead: @risk-team-lead (if false-negative rate changes significantly)
- Note: Fallback mode allows transactions through with basic rules — financial risk to be assessed

## Related Runbooks

- [Platform General Incident Runbook](./platform-general-incident.md) — for infrastructure issues
