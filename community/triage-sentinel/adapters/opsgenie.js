// community/triage-sentinel/adapters/opsgenie.js
// Normalises OpsGenie alert webhook to the standard Guardian alert format

export function normaliseOpsGenie(payload) {
  const alert = payload.alert || payload;
  const details = alert.details || {};

  return {
    incident_id:  alert.alertId || alert.tinyId || 'UNKNOWN',
    service:      (alert.source || alert.entity || 'platform').toLowerCase().replace(/\s+/g, '-'),
    triggered_at: new Date(alert.createdAt || Date.now()).toISOString(),
    alert: {
      latencyMs:            parseFloat(details.latency_ms   || 0),
      errorRate:            parseFloat(details.error_rate   || 0),
      durationMin:          parseFloat(details.duration_min || 0),
      transactionsAffected: parseInt(details.transactions_affected || 0, 10),
    },
  };
}
