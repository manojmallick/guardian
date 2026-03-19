// sub-agents/slack-warroom-subagent/index.js
// SlackWarRoomSubAgent — creates incident channel, posts war room message, @mentions on-call
// Spawned by Node 04 War Room Agent in parallel with JiraTicketSubAgent
// MCP Gateway manages Slack credentials — never in code

import { buildWarRoomSlackBlocks } from './message-template.js';

export async function run(input, airiaTools) {
  const { channel_name, oncall_team, incident_id, service } = input;

  // Create the incident channel via Slack MCP Gateway
  const channel = await airiaTools.slackMCP.createChannel({
    name:    channel_name,
    private: false,
  });

  // Build the war room message blocks
  const blocks = buildWarRoomSlackBlocks(input);

  // Post war room message to the new channel
  const message = await airiaTools.slackMCP.postMessage({
    channel: channel.id,
    blocks,
    text:    `${incident_id} ${service} ${input.severity} war room`, // Fallback text for notifications
  });

  // Invite on-call team members
  if (oncall_team.length > 0) {
    await airiaTools.slackMCP.inviteUsergroupsToChannel({
      channel:     channel.id,
      usergroups:  oncall_team.map(t => t.replace('@', '')),
    });
  }

  return {
    channel_id:  channel.id,
    channel_url: `https://slack.com/archives/${channel.id}`,
    message_ts:  message.ts,
    created_at:  new Date().toISOString(),
  };
}

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  output = await run(input, airiaTools);
  /* eslint-enable no-undef */
}
