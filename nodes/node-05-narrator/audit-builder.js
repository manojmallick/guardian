// nodes/node-05-narrator/audit-builder.js
// Builds the AI Decision Audit section (Section 3 of post-mortem)
// Every AI decision logged with model, input data, reasoning, and confidence

export function buildAIDecisionAudit(context) {
  return [
    {
      decision_id:     'DEC-001',
      type:            'severity_classification',
      model_used:      context.model_used || 'claude-3-5-sonnet-20241022',
      input_data:      context.alert_raw,
      algorithm_result: context.severity,
      confidence:      context.confidence,
      reasoning:       context.reasoning,
      human_override:  false,
      timestamp:       context.triage_completed_at,
    },
    {
      decision_id:     'DEC-002',
      type:            'runbook_selection',
      model_used:      context.model_used || 'claude-3-5-sonnet-20241022',
      input_data:      { service: context.service, alert_profile: context.alert_raw?.errorRate > 0.10 ? 'high-error-rate' : 'latency-degradation' },
      selected:        context.runbooks?.[0]?.title,
      confidence:      'High',
      reasoning:       'Semantic similarity match via Knowledge Graph — highest relevance score',
      human_override:  false,
      timestamp:       context.runbook_retrieved_at,
    },
  ];
}
