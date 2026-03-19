// nodes/node-03-hitl/mcp-apps-builder.js
// Constructs the MCP Apps interactive Slack payload for HITL approval
// MCP Apps renders real clickable buttons inside Slack (launched Feb 12, 2026)

export function buildMCPAppsPayload(incident) {
  const slaBreachMinutes = incident.severity === 'P1' ? 8 : 20;
  const topSteps = incident.runbooks?.[0]?.steps?.slice(0, 3) || [];

  return {
    // MCP Apps renders this as interactive Slack UI — not plain text
    type: 'mcp_app_interactive',
    channel: process.env.SLACK_ONCALL_CHANNEL || '#sre-oncall',
    blocks: [
      {
        type: 'header',
        text: `\u{1F6A8} GUARDIAN: ${incident.severity} Incident Requires Approval`,
      },
      {
        type: 'section',
        fields: [
          { label: 'Service',    value: incident.service },
          { label: 'Severity',   value: `${incident.severity} (${incident.confidence}% confidence)` },
          { label: 'Impact',     value: `~${incident.alert_raw?.transactionsAffected} transactions` },
          { label: 'SLA Breach', value: `In ${slaBreachMinutes} minutes` },
        ],
      },
      {
        type: 'context',
        text: `AI Assessment: ${incident.reasoning}`,
      },
      {
        type: 'runbook_preview',
        title: `Recommended: ${incident.runbooks?.[0]?.title || 'General Incident Runbook'}`,
        steps: topSteps,
        url:   incident.runbooks?.[0]?.url,
      },
      {
        type: 'actions',
        buttons: [
          { id: 'approve',  label: '\u2705 Approve Response',    style: 'primary' },
          { id: 'escalate', label: '\u2B06\uFE0F Escalate Severity',   style: 'warning' },
          { id: 'reject',   label: '\u274C Reject (False Alarm)', style: 'danger'  },
        ],
      },
    ],
    timeout_minutes: parseInt(process.env.HITL_TIMEOUT_MINUTES || '15', 10),
    timeout_action:  'auto_escalate',
  };
}
