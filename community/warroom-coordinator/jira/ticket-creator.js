// community/warroom-coordinator/jira/ticket-creator.js
// Creates the Jira incident ticket via MCP Gateway

const PRIORITY_MAP = { P1: 'Critical', P2: 'High', P3: 'Medium' };

export async function createTicket({ incidentId, service, severity, summary, description, runbookUrl, approver, triggeredAt }, airiaTools) {
  return airiaTools.jiraMCP.createIssue({
    fields: {
      project:    { key: process.env.JIRA_PROJECT_KEY || 'INC' },
      issuetype:  { name: 'Incident' },
      priority:   { name: PRIORITY_MAP[severity] || 'High' },
      summary:    summary || `[${severity}] ${service} incident — ${incidentId}`,
      description: {
        type: 'doc', version: 1,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: description || `Incident ${incidentId}. Approved by: ${approver}.` }] }],
      },
      labels: ['guardian-automated', severity.toLowerCase()],
    },
  });
}
