// nodes/node-04-warroom/channel-builder.js
// Builds Slack channel name and war room message body

export function buildSlackChannelName(incidentId, service) {
  return "inc-" + incidentId.toLowerCase() + "-" + service.replace(/[^a-z0-9]/g, "-");
}

export function buildSlackWarRoomMessage(incident, channelName, oncallTeam) {
  const { incident_id, service, severity, confidence, reasoning, runbooks, alert_raw, hitl, jira_ticket, jira_url } = incident;
  const team = Array.isArray(oncallTeam) ? oncallTeam : [];
  const runbook = runbooks && runbooks[0];
  const topSteps = (runbook && runbook.steps && runbook.steps.slice(0, 3)) || [];
  const stepLines = topSteps.map(function(s, i) { return (i+1) + '. ' + s; }).join('\n');
  const approvedAt = (hitl && hitl.approved_at) ? new Date(hitl.approved_at).toUTCString().split(" ")[4] : "N/A";
  const parts = [
    incident_id + " - " + service + " " + severity + " Incident",
    "Severity: " + severity + " (" + confidence + "% confidence)",
    "Service: " + service,
    "Impact: " + (alert_raw && alert_raw.transactionsAffected) + " transactions affected",
    "",
    "AI Triage Summary:",
    reasoning || "",
    "",
    runbook ? "Recommended Runbook: " + runbook.title : "",
    stepLines,
    "",
    jira_ticket ? "Jira Ticket: " + jira_ticket : "",
    "",
    "Approved by: " + (hitl && hitl.approver_name) + " at " + approvedAt + " UTC",
    "War Room activated by: Guardian (Airia)",
    "",
    "cc: " + team.join(" ")
  ];
  return parts.join('\n');
}
