// community/warroom-coordinator/index.js
// War Room Coordinator — Automated Slack + Jira incident response
// Self-contained: configure oncall-teams.js then deploy to Airia

import { resolveTeam } from './config/oncall-teams.js';
import { buildChannelName, createChannel } from './slack/channel-creator.js';
import { postWarRoomMessage } from './slack/message-poster.js';
import { createTicket } from './jira/ticket-creator.js';

export async function activateWarRoom(input, airiaTools) {
  const { incident_id, service, severity, confidence, runbook_url, runbook_steps, ai_summary, hitl, alert_raw } = input;

  const oncallTeam  = resolveTeam(service);
  const channelName = buildChannelName(incident_id, service);

  // Run Slack + Jira in parallel
  const [channel, jiraIssue] = await Promise.all([
    createChannel(channelName, airiaTools),
    createTicket({
      incidentId:  incident_id,
      service,
      severity,
      description: `AI triage: ${ai_summary}\n\nApproved by: ${hitl?.approver_name} at ${hitl?.approved_at}`,
      approver:    hitl?.approver_name,
      runbookUrl:  runbook_url,
      triggeredAt: input.triggered_at,
    }, airiaTools),
  ]);

  const jiraBaseUrl = process.env.JIRA_BASE_URL || 'https://yourcompany.atlassian.net';

  await postWarRoomMessage({
    channelId:    channel.id,
    incidentId:   incident_id,
    service,
    severity,
    aiSummary:    ai_summary,
    runbookUrl:   runbook_url,
    runbookSteps: runbook_steps,
    oncallTeam,
    approver:     hitl?.approver_name,
    jiraTicket:   jiraIssue.key,
    jiraUrl:      `${jiraBaseUrl}/jira/browse/${jiraIssue.key}`,
  }, airiaTools);

  return {
    slack_channel:        `https://slack.com/archives/${channel.id}`,
    slack_channel_id:     channel.id,
    jira_ticket:          jiraIssue.key,
    jira_url:             `${jiraBaseUrl}/jira/browse/${jiraIssue.key}`,
    oncall_notified:      oncallTeam,
    warroom_activated_at: new Date().toISOString(),
  };
}

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  output = await activateWarRoom(input, airiaTools);
  /* eslint-enable no-undef */
}
