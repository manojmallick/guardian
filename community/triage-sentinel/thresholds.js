// community/triage-sentinel/thresholds.js
// EDIT THIS FILE to customise severity thresholds for your environment

export const THRESHOLDS = {
  P1: { latencyMs: 800,  errorRate: 0.15, durationMin: 3,  transactionsAffected: 1000, criteriaRequired: 2 },
  P2: { latencyMs: 400,  errorRate: 0.05, durationMin: 5,  transactionsAffected: 100,  criteriaRequired: 2 },
  P3: { latencyMs: 200,  errorRate: 0.01, durationMin: 10, transactionsAffected: 10,   criteriaRequired: 1 },
};

// Services in this list use a stricter (0.8×) threshold — add your critical services here
export const CRITICAL_SERVICES = ['payment-gateway', 'fraud-detection', 'trading-api'];

export const CRITICAL_SERVICE_MULTIPLIER = 0.8;
