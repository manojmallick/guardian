// nodes/node-01-triage/ai-prompt.js
// AI model prompt template for Node 01 reasoning explanation

export function buildTriagePrompt({ severity, confidence, service, latencyMs, errorRate, durationMin, transactionsAffected, thresholdLatency, thresholdError }) {
  return `You are an SRE incident analyst at a regulated financial institution.

The deterministic triage algorithm has classified this alert as: ${severity} with ${confidence}% confidence.

Alert data:
- Service: ${service}
- Latency: ${latencyMs}ms (threshold: ${thresholdLatency}ms)
- Error rate: ${errorRate} (threshold: ${thresholdError})
- Duration: ${durationMin} minutes
- Transactions affected: ~${transactionsAffected}

Provide:
1. A 2-sentence plain English explanation of what this severity classification means
2. The likely immediate customer impact
3. Any pattern recognition from the metrics (e.g. "latency spike without high error rate suggests downstream dependency")

Respond in JSON: { "explanation": "...", "customer_impact": "...", "pattern": "..." }`;
}
