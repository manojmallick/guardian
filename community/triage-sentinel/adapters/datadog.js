// community/triage-sentinel/adapters/datadog.js
// Normalises Datadog monitor alert webhook to the standard Guardian alert format

export function normaliseDatadog(payload) {
  return {
    incident_id:  `DD-${payload.id || Date.now()}`,
    service:      (payload.tags?.service || payload.hostname || 'platform').toLowerCase(),
    triggered_at: new Date(payload.last_updated || Date.now()).toISOString(),
    alert: {
      latencyMs:            parseFloat(payload.value || 0),
      errorRate:            parseFloat(payload.tags?.error_rate || 0),
      durationMin:          0,
      transactionsAffected: parseInt(payload.tags?.transactions_affected || 0, 10),
    },
  };
}
