// community/compliance-narrator/sections/summary.js
export function buildSummarySection(context) {
  const start = new Date(context.triggered_at);
  const end   = new Date(context.resolved_at || new Date());
  const durationMinutes = Math.round((end - start) / 60000);

  return {
    service:               context.service,
    severity:              context.severity,
    duration_minutes:      durationMinutes,
    transactions_affected: context.alert_raw?.transactionsAffected,
    sla_status:            context.sla_breached ? 'BREACHED' : 'MAINTAINED',
    resolution_summary:    context.resolution_summary || 'See timeline for full incident details.',
    incident_id:           context.incident_id,
    triggered_at:          context.triggered_at,
    resolved_at:           context.resolved_at || 'OPEN',
  };
}
