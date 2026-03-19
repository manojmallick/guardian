// community/warroom-coordinator/slack/channel-creator.js
// Creates the incident Slack channel via MCP Gateway

export function buildChannelName(incidentId, service) {
  return `inc-${incidentId.toLowerCase()}-${service.replace(/[^a-z0-9]/g, '-')}`;
}

export async function createChannel(channelName, airiaTools) {
  return airiaTools.slackMCP.createChannel({ name: channelName, private: false });
}
