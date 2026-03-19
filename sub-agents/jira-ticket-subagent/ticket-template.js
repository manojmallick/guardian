// sub-agents/jira-ticket-subagent/ticket-template.js
// Jira issue payload builder with custom Guardian fields

const PRIORITY_MAP = { P1: 'Critical', P2: 'High', P3: 'Medium' };
const SLA_MINUTES  = { P1: 30, P2: 60, P3: 240 };

export function buildIssuePayload(input) {
  const { incident_id, service, severity, summary, description, priority, labels, assignee, runbook_url, approver, triggered_at } = input;

  return {
    fields: {
      project:     { key: process.env.JIRA_PROJECT_KEY || 'INC' },
      issuetype:   { name: 'Incident' },
      priority:    { name: PRIORITY_MAP[severity] || priority || 'High' },
      summary,
      description: {
        type:    'doc',
        version: 1,
        content: [
          {
            type:    'paragraph',
            content: [{ type: 'text', text: description }],
          },
        ],
      },
      labels:      labels || ['guardian-automated', 'dora-tracked'],
      assignee:    assignee ? { accountId: assignee } : undefined,

      // Guardian custom fields
      customfield_10100: triggered_at,                    // SLA start time
      customfield_10101: SLA_MINUTES[severity] || 60,     // SLA target minutes
      customfield_10102: true,                             // guardian_ai_generated
      customfield_10103: approver || '',                   // hitl_approver
      customfield_10104: incident_id,                      // guardian_session_id
    },
  };
}
