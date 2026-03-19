// community/triage-sentinel/adapters/pagerduty.js
// Normalises PagerDuty webhook payload to the standard Guardian alert format

export function normalisePagerDuty(payload) {
  const pd = payload.messages?.[0]?.incident || payload;
  const customDetails = pd.body?.details || pd.custom_details || {};

  return {
    incident_id:  pd.id || pd.incident_number?.toString() || 'UNKNOWN',
    service:      pd.service?.name?.toLowerCase().replace(/\s+/g, '-') || 'platform',
    triggered_at: pd.created_at || new Date().toISOString(),
    alert: {
      latencyMs:            parseFloat(customDetails.latency_ms   || customDetails.latencyMs   || 0),
      errorRate:            parseFloat(customDetails.error_rate   || customDetails.errorRate   || 0),
      durationMin:          parseFloat(customDetails.duration_min || customDetails.durationMin || 0),
      transactionsAffected: parseInt(customDetails.transactions_affected || customDetails.transactionsAffected || 0, 10),
    },
  };
}
