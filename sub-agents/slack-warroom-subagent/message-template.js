// sub-agents/slack-warroom-subagent/message-template.js
// Slack Block Kit message builder for war room post

export function buildWarRoomSlackBlocks(input) {
  const { incident_id, service, severity, confidence, ai_summary, runbook_url, runbook_steps = [], oncall_team = [], approver, approved_at, alert_raw, jira_ticket, jira_url } = input;

  const stepLines = runbook_steps.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n');
  const runbookLink = runbook_url && runbook_url !== 'CACHED_FALLBACK'
    ? `<${runbook_url}|View Full Runbook>`
    : 'Cached runbook (Confluence unavailable)';

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: `\u{1F6A8} ${incident_id} \u2014 ${severity} Incident: ${service}` },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Severity:* ${severity} (${confidence}% confidence)` },
        { type: 'mrkdwn', text: `*Service:* ${service}` },
        { type: 'mrkdwn', text: `*Impact:* ~${alert_raw?.transactionsAffected} transactions` },
        { type: 'mrkdwn', text: `*Approved by:* ${approver}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*AI Summary:*\n${ai_summary}` },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Recommended Steps:*\n${stepLines}\n\n${runbookLink}` },
    },
    jira_ticket && {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Jira Ticket:* ${jira_url ? `<${jira_url}|${jira_ticket}>` : jira_ticket}` },
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `War room activated by Guardian (Airia) | cc: ${oncall_team.join(' ')}` }],
    },
  ].filter(Boolean);
}
