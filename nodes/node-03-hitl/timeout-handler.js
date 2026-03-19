// nodes/node-03-hitl/timeout-handler.js
// 15-minute timeout + auto-escalation logic
// Airia HITL node handles the actual wait; this module defines the escalation behaviour

export const HITL_TIMEOUT_MINUTES = parseInt(process.env.HITL_TIMEOUT_MINUTES || '15', 10);

export function buildTimeoutEscalation(incident) {
  return {
    ...incident,
    severity: 'P1',       // Force P1 on timeout regardless of original classification
    hitl: {
      decision:             'AUTO_ESCALATED',
      approver:             'SYSTEM',
      approver_name:        'Auto-Escalation (timeout)',
      approved_at:          new Date().toISOString(),
      response_time_seconds: HITL_TIMEOUT_MINUTES * 60,
      timeout_flag:         true,
    },
  };
}

export function buildRejectionRecord(incident, approver) {
  const approverName = typeof approver === 'object' ? (approver.approver_name || approver.approver) : approver;
  return {
    incident_id:    incident.incident_id,
    decision:       'REJECTED',
    outcome:        'false_alarm',
    rejected_by:    approverName,
    approver,
    rejected_at:    new Date().toISOString(),
    false_positive: true,
  };
}
