// community/compliance-narrator/sections/ai-audit.js
export function buildAIAuditSection(context) {
  return {
    decisions: [
      {
        decision_id:     'DEC-001',
        type:            'severity_classification',
        model_used:      context.model_used || 'claude-3-5-sonnet-20241022',
        input_data:      context.alert_raw,
        result:          context.severity,
        confidence:      `${context.confidence}%`,
        reasoning:       context.reasoning,
        human_override:  false,
        timestamp:       context.triage_completed_at,
      },
      {
        decision_id:     'DEC-002',
        type:            'runbook_selection',
        model_used:      context.model_used || 'claude-3-5-sonnet-20241022',
        input_data:      { service: context.service },
        result:          context.runbooks?.[0]?.title,
        confidence:      'High',
        reasoning:       'Semantic similarity match via Knowledge Graph',
        human_override:  false,
        timestamp:       context.runbook_retrieved_at,
      },
    ],
    total_decisions: 2,
    models_used:     [context.model_used || 'claude-3-5-sonnet-20241022'],
    human_overrides: 0,
  };
}
