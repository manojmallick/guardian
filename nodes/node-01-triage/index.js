// nodes/node-01-triage/index.js
// Guardian Node 01 — Triage Sentinel
// Runs inside Airia Code Block node
// Input: PagerDuty webhook payload as `input`
// Output: severity JSON passed to Agent Variables

import { THRESHOLDS, CRITICAL_SERVICE_MULTIPLIER, CRITICAL_SERVICES } from './thresholds.js';

export function classifySeverity(alert, service) {
  if (!alert || typeof alert !== 'object') {
    return {
      error:                    'INVALID_ALERT',
      severity:                 'P2',
      confidence:               0,
      reasoning:                'Alert object missing — defaulted to P2 for safety',
      isCriticalService:        false,
      criticalMultiplierApplied: false,
    };
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

  const severity   = p1Score >= THRESHOLDS.P1.criteriaRequired ? 'P1'
                   : p2Score >= THRESHOLDS.P2.criteriaRequired ? 'P2'
                   : 'P3';

  const matchScore    = severity === 'P1' ? p1Score : p2Score;
  const maxCriteria   = severity === 'P1' ? 4 : 3;
  const confidence    = Math.round((matchScore / maxCriteria) * 100);

  return {
    severity,
    confidence,
    isCriticalService:        isCritical,
    criticalMultiplierApplied: isCritical,
    reasoning: `Matched ${matchScore} of ${maxCriteria} ${severity} criteria. Critical service multiplier: ${isCritical}.`,
  };
}

// ─── Airia Code Block entry point ───────────────────────────────────────────
// When running inside Airia, `input` is injected globally.
// For local testing, export the function and call it directly.

// ─── Default export for local testing / integration tests ─────────────────
export default function runTriageNode(input) {
  if (!input || !input.alert || !input.service) {
    return {
      error:      'INVALID_PAYLOAD',
      severity:   'P2',
      confidence: 0,
      reasoning:  'Payload parse failure — defaulted to P2 for safety',
      raw_input:  input,
      timestamp:  new Date().toISOString(),
    };
  }
  const result = classifySeverity(input.alert, input.service);
  return {
    incident_id:               input.incident_id,
    service:                   input.service,
    severity:                  result.severity,
    confidence:                result.confidence,
    reasoning:                 result.reasoning,
    isCriticalService:         result.isCriticalService,
    criticalMultiplierApplied: result.criticalMultiplierApplied,
    alert_raw:                 input.alert,
    triggered_at:              input.triggered_at,
    triage_completed_at:       new Date().toISOString(),
  };
}

if (typeof input !== 'undefined') {
  // Running inside Airia Code Block
  if (!input || !input.alert || !input.service) {
    /* eslint-disable no-undef */
    output = {
      error:      'INVALID_PAYLOAD',
      severity:   'P2',
      confidence: 0,
      reasoning:  'Payload parse failure — defaulted to P2 for safety',
      raw_input:  input,
      timestamp:  new Date().toISOString(),
    };
  } else {
    const result = classifySeverity(input.alert, input.service);

    output = {
      incident_id:             input.incident_id,
      service:                 input.service,
      severity:                result.severity,
      confidence:              result.confidence,
      reasoning:               result.reasoning,
      isCriticalService:       result.isCriticalService,
      criticalMultiplierApplied: result.criticalMultiplierApplied,
      alert_raw:               input.alert,
      triggered_at:            input.triggered_at,
      triage_completed_at:     new Date().toISOString(),
    };
    /* eslint-enable no-undef */
  }
}
