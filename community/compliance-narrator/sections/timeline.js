// community/compliance-narrator/sections/timeline.js
export function buildTimelineSection(context) {
  return [
    { time: context.triggered_at,         event: 'Alert triggered' },
    { time: context.triage_completed_at,  event: `AI Triage: ${context.severity} (${context.confidence}% confidence)` },
    { time: context.runbook_retrieved_at, event: `Runbook retrieved: ${context.runbooks?.[0]?.title || 'General'}` },
    { time: context.hitl?.approved_at,    event: `Human approval: ${context.hitl?.decision} by ${context.hitl?.approver_name} (${context.hitl?.response_time_seconds}s)` },
    context.warroom_activated_at && { time: context.warroom_activated_at, event: `War room activated: ${context.slack_channel || 'N/A'} + ${context.jira_ticket || 'N/A'}` },
    context.resolved_at && { time: context.resolved_at, event: `Resolved by ${context.resolved_by || 'engineering team'}` },
  ].filter(Boolean);
}
