// nodes/node-03-hitl/governance-logger.js
// Writes HITL decision to Governance audit record
// Every approval is timestamped and stored in Airia Governance Dashboard

export function buildGovernanceRecord(incident, hitlDecision) {
  return {
    audit_event:       'HITL_DECISION',
    incident_id:       incident.incident_id,
    ai_recommendation: `${incident.severity} response — approve war room activation`,
    human_decision:    hitlDecision.decision.toUpperCase(),
    decision_maker:    `${hitlDecision.approver_name} (Slack: ${hitlDecision.approver})`,
    timestamp:         hitlDecision.approved_at || new Date().toISOString(),
    regulatory_note:   'Satisfies DORA Article 11 human oversight requirement for AI-assisted incident management',
    model_used:        incident.model_used || 'claude-3-5-sonnet-20241022',
    pipeline_version:  'guardian-v1.0',
  };
}
