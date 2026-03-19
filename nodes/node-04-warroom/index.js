// nodes/node-04-warroom/index.js
// Guardian Node 04 — War Room Agent
// Runs inside Airia Code Block node
// Spawns nested agents for Slack + Jira in parallel
// Input: approved incident context from Node 03

import { resolveOnCallTeam } from './oncall-resolver.js';
import { buildSlackChannelName } from './channel-builder.js';

export { resolveOnCallTeam } from './oncall-resolver.js';
export { buildSlackChannelName, buildSlackWarRoomMessage } from './channel-builder.js';
export { buildJiraTicket } from './jira-builder.js';

// ─── Default export for local testing / integration tests ─────────────────
export default async function runWarRoomNode(incident, airiaAgents) {
  const result = await activateWarRoom(incident, airiaAgents || {});
  return { ...incident, ...result };
}

export async function activateWarRoom(incident, airiaAgents) {
  const oncallTeam  = resolveOnCallTeam(incident.service);
  const channelName = buildSlackChannelName(incident.incident_id, incident.service);

  // Local mode: simulate sub-agent results when airiaAgents not available
  const hasAgents = airiaAgents && airiaAgents.SlackWarRoomSubAgent && airiaAgents.JiraTicketSubAgent;

  const [slackResult, jiraResult] = hasAgents
    ? await Promise.all([
        airiaAgents.SlackWarRoomSubAgent.run({
          channel_name:  channelName,
          incident_id:   incident.incident_id,
          service:       incident.service,
          severity:      incident.severity,
          ai_summary:    incident.reasoning,
          runbook_url:   incident.runbooks?.[0]?.url,
          runbook_steps: incident.runbooks?.[0]?.steps?.slice(0, 3),
          oncall_team:   oncallTeam,
          approver:      incident.hitl?.approver_name,
          approved_at:   incident.hitl?.approved_at,
          alert_raw:     incident.alert_raw,
          confidence:    incident.confidence,
        }),
        airiaAgents.JiraTicketSubAgent.run({
          incident_id:  incident.incident_id,
          service:      incident.service,
          severity:     incident.severity,
          summary:      `[${incident.severity}] ${incident.service} degradation — ${incident.incident_id}`,
          description:  `AI triage: ${incident.reasoning}\n\nApproved by: ${incident.hitl?.approver_name} at ${incident.hitl?.approved_at}\nRunbook: ${incident.runbooks?.[0]?.url}`,
          priority:     incident.severity === 'P1' ? 'Critical' : incident.severity === 'P2' ? 'High' : 'Medium',
          labels:       ['guardian-automated', 'dora-tracked', incident.severity.toLowerCase()],
          assignee:     incident.runbooks?.[0]?.owner,
          runbook_url:  incident.runbooks?.[0]?.url,
          approver:     incident.hitl?.approver_name,
          triggered_at: incident.triggered_at,
        }),
      ])
    : [
        { channel_url: `https://guardian-vvd5824.slack.com/channels/${channelName}`, channel_id: channelName },
        { ticket_id: `INC-${Date.now().toString().slice(-4)}`, ticket_url: `https://mmallick1990.atlassian.net/browse/INC-${Date.now().toString().slice(-4)}` },
      ];

  return {
    slack_channel:        slackResult.channel_url,
    slack_channel_id:     slackResult.channel_id,
    jira_ticket:          jiraResult.ticket_id,
    jira_url:             jiraResult.ticket_url,
    oncall_notified:      oncallTeam,
    warroom_activated_at: new Date().toISOString(),
  };
}

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  const warRoomResult = await activateWarRoom(input, airiaAgents);

  output = {
    ...input,
    ...warRoomResult,
  };
  /* eslint-enable no-undef */
}
