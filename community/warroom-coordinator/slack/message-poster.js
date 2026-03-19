// community/warroom-coordinator/slack/message-poster.js
// Posts war room summary + @mentions on-call team

export async function postWarRoomMessage({ channelId, incidentId, service, severity, aiSummary, runbookUrl, runbookSteps, oncallTeam, approver, jiraTicket, jiraUrl }, airiaTools) {
  const steps = (runbookSteps || []).slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n');
  const runbookRef = runbookUrl && runbookUrl !== 'CACHED_FALLBACK' ? `<${runbookUrl}|View Runbook>` : 'Runbook (cached)';

  const text = [
    `\u{1F6A8} *${incidentId} \u2014 ${service} ${severity}*`,
    '',
    `*AI Summary:* ${aiSummary}`,
    '',
    `*Runbook Steps:*\n${steps}`,
    `${runbookRef}`,
    '',
    jiraTicket ? `*Jira:* ${jiraUrl ? `<${jiraUrl}|${jiraTicket}>` : jiraTicket}` : '',
    '',
    `*Approved by:* ${approver}`,
    `cc: ${oncallTeam.join(' ')}`,
  ].filter(l => l !== undefined).join('\n');

  return airiaTools.slackMCP.postMessage({ channel: channelId, text });
}
