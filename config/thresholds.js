// config/thresholds.js
// P1/P2/P3 threshold constants — single source of truth
// Node 01 imports from here. Community Triage Sentinel also imports this.

export const THRESHOLDS = {
  P1: {
    latencyMs:             800,
    errorRate:             0.15,    // 15%
    durationMin:           3,
    transactionsAffected:  1000,
    criteriaRequired:      2,       // Must match ≥2 of 4 criteria
  },
  P2: {
    latencyMs:             400,
    errorRate:             0.05,    // 5%
    durationMin:           5,
    transactionsAffected:  100,
    criteriaRequired:      2,       // Must match ≥2 of 3 criteria
  },
  P3: {
    latencyMs:             200,
    errorRate:             0.01,    // 1%
    durationMin:           10,
    transactionsAffected:  10,
    criteriaRequired:      1,
  },
};

// Critical service threshold multiplier
// Reduces P1 latency threshold by this factor for critical services
// e.g. 0.8 means P1 fires at latencyMs ≥ 640 instead of 800
export const CRITICAL_SERVICE_MULTIPLIER = 0.8;

export const CRITICAL_SERVICES = ['payment-gateway', 'fraud-detection', 'trading-api'];
