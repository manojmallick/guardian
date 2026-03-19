// community/triage-sentinel/adapters/prometheus.js
// Normalises Prometheus Alertmanager webhook to the standard Guardian alert format

export function normalisePrometheus(payload) {
  const alert = payload.alerts?.[0] || payload;
  const labels  = alert.labels || {};
  const annotations = alert.annotations || {};

  return {
    incident_id:  `PROM-${labels.alertname || Date.now()}`,
    service:      (labels.service || labels.job || 'platform').toLowerCase(),
    triggered_at: alert.startsAt || new Date().toISOString(),
    alert: {
      latencyMs:            parseFloat(annotations.latency_ms   || 0),
      errorRate:            parseFloat(annotations.error_rate   || 0),
      durationMin:          parseFloat(annotations.duration_min || 0),
      transactionsAffected: parseInt(annotations.transactions_affected || 0, 10),
    },
  };
}
