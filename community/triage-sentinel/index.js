// community/triage-sentinel/index.js
// Triage Sentinel — Universal AI-Powered Alert Classification Engine
// Self-contained: no Guardian dependencies

import { THRESHOLDS, CRITICAL_SERVICES, CRITICAL_SERVICE_MULTIPLIER } from './thresholds.js';

export function classifySeverity(alert, service) {
  if (!alert || typeof alert !== 'object') {
    return { error: 'INVALID_ALERT', severity: 'P2', confidence: 0, reasoning: 'Alert object missing — defaulted to P2 for safety', isCriticalService: false };
  }

  const { latencyMs = 0, errorRate = 0, durationMin = 0, transactionsAffected = 0 } = alert;
  const isCritical = CRITICAL_SERVICES.includes(service);
  const multiplier = isCritical ? CRITICAL_SERVICE_MULTIPLIER : 1.0;

  const p1Score = [
    latencyMs             >= THRESHOLDS.P1.latencyMs * multiplier,
    errorRate             >= THRESHOLDS.P1.errorRate,
    durationMin           >= THRESHOLDS.P1.durationMin,
    transactionsAffected  >= THRESHOLDS.P1.transactionsAffected,
  ].filter(Boolean).length;

  const p2Score = [
    latencyMs             >= THRESHOLDS.P2.latencyMs,
    errorRate             >= THRESHOLDS.P2.errorRate,
    durationMin           >= THRESHOLDS.P2.durationMin,
  ].filter(Boolean).length;

  const severity  = p1Score >= THRESHOLDS.P1.criteriaRequired ? 'P1'
                  : p2Score >= THRESHOLDS.P2.criteriaRequired ? 'P2'
                  : 'P3';

  const matchScore  = severity === 'P1' ? p1Score : p2Score;
  const maxCriteria = severity === 'P1' ? 4 : 3;
  const confidence  = Math.round((matchScore / maxCriteria) * 100);

  return {
    severity,
    confidence,
    isCriticalService:        isCritical,
    criticalMultiplierApplied: isCritical,
    reasoning: `Matched ${matchScore} of ${maxCriteria} ${severity} criteria. Critical service multiplier: ${isCritical}.`,
  };
}

export { normalisePagerDuty } from './adapters/pagerduty.js';
export { normaliseOpsGenie }  from './adapters/opsgenie.js';
export { normaliseDatadog }   from './adapters/datadog.js';
export { normaliseCloudWatch } from './adapters/cloudwatch.js';
export { normalisePrometheus } from './adapters/prometheus.js';

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  if (!input?.alert || !input?.service) {
    output = { error: 'INVALID_PAYLOAD', severity: 'P2', confidence: 0, reasoning: 'Payload parse failure — defaulted to P2', raw_input: input, timestamp: new Date().toISOString() };
  } else {
    const result = classifySeverity(input.alert, input.service);
    output = { incident_id: input.incident_id, service: input.service, triggered_at: input.triggered_at, triage_completed_at: new Date().toISOString(), alert_raw: input.alert, ...result };
  }
  /* eslint-enable no-undef */
}
