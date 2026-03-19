// nodes/node-05-narrator/timeline-builder.js
// Constructs the ordered incident event timeline for post-mortem Section 2

export function buildTimeline(context) {
  const events = [
    { time: context.triggered_at,         event: 'PagerDuty alert triggered' },
    { time: context.triage_completed_at,  event: `Guardian Triage: ${context.severity}, ${context.confidence}% confidence (AI Model: ${context.model_used || 'claude-3-5-sonnet-20241022'})` },
    { time: context.runbook_retrieved_at, event: `Runbook retrieved: ${context.runbooks?.[0]?.title || 'General Runbook'} (Confluence MCP)` },
    { time: context.hitl?.approved_at,    event: `HITL ${context.hitl?.decision} by ${context.hitl?.approver_name} (${context.hitl?.response_time_seconds}s response time)` },
    { time: context.warroom_activated_at, event: `War room activated: ${context.slack_channel} + ${context.jira_ticket}` },
  ];

  if (context.resolved_at) {
    events.push({ time: context.resolved_at, event: `Incident resolved by ${context.resolved_by || 'unknown engineer'}` });
  }

  return events.filter(e => e.time);
}

export function calcDurationMinutes(context) {
  const start = new Date(context.triggered_at);
  const end   = new Date(context.resolved_at || new Date());
  return Math.round((end - start) / 60000);
}
