// nodes/node-04-warroom/jira-builder.js
// Constructs the Jira issue payload for P1/P2/P3 incidents

const PRIORITY_MAP = { P1: "Critical", P2: "High", P3: "Medium" };
const SLA_MINUTES  = { P1: 30, P2: 60, P3: 240 };

export function buildJiraTicket(incident, runbook, oncallTeam) {
  const rb       = runbook || (incident.runbooks && incident.runbooks[0]);
  const priority = PRIORITY_MAP[incident.severity] || "High";

  return {
    project:   process.env.JIRA_PROJECT_KEY || "INC",
    issuetype: "Incident",
    priority,
    summary:   "[" + incident.severity + "] " + incident.service + " degradation --- " + incident.incident_id,
    description: [
      "AI Triage: " + incident.reasoning,
      "",
      "Approved by: " + (incident.hitl && incident.hitl.approver_name) + " at " + (incident.hitl && incident.hitl.approved_at),
      "Runbook: " + (rb && rb.url && rb.url !== "CACHED_FALLBACK" ? rb.url : "Cached fallback"),
      "",
      "Guardian Audit Trail: See Airia Governance Dashboard for session " + incident.incident_id,
    ].join('\n'),
    labels:   ["guardian-automated", "dora-tracked", incident.severity.toLowerCase()],
    assignee: (rb && rb.owner) || "platform-oncall",
    customFields: {
      sla_start:          incident.triggered_at,
      sla_target_minutes: SLA_MINUTES[incident.severity] || 60,
      ai_generated:       true,
      human_approved_by:  (incident.hitl && incident.hitl.approver_name) || "",
      guardian_session:   incident.incident_id,
    },
  };
}
