// community/triage-sentinel/adapters/cloudwatch.js
// Normalises AWS CloudWatch alarm SNS notification to the standard Guardian alert format

export function normaliseCloudWatch(payload) {
  const alarm = typeof payload.Message === 'string' ? JSON.parse(payload.Message) : payload;

  return {
    incident_id:  `CW-${alarm.AlarmName || Date.now()}`,
    service:      (alarm.AlarmName || 'platform').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    triggered_at: alarm.StateChangeTime || new Date().toISOString(),
    alert: {
      latencyMs:            alarm.NewStateValue === 'ALARM' ? 1000 : 0,  // Inferred from alarm state
      errorRate:            0,
      durationMin:          0,
      transactionsAffected: 0,
    },
  };
}
