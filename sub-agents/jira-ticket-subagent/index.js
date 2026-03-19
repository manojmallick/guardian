// sub-agents/jira-ticket-subagent/index.js
// JiraTicketSubAgent — creates P1 incident ticket, sets SLA timer
// Spawned by Node 04 War Room Agent in parallel with SlackWarRoomSubAgent
// MCP Gateway manages Jira credentials — never in code

import { buildIssuePayload } from './ticket-template.js';

export async function run(input, airiaTools) {
  const issuePayload = buildIssuePayload(input);

  // Create Jira issue via MCP Gateway
  const issue = await airiaTools.jiraMCP.createIssue(issuePayload);

  const jiraBaseUrl = process.env.JIRA_BASE_URL || 'https://yourcompany.atlassian.net';

  return {
    ticket_id:  issue.key,
    ticket_url: `${jiraBaseUrl}/jira/browse/${issue.key}`,
    created_at: new Date().toISOString(),
  };
}

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  output = await run(input, airiaTools);
  /* eslint-enable no-undef */
}
