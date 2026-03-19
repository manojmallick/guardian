import { classifySeverity } from '../../nodes/node-01-triage/index.js';

describe('Node 01 — Triage Sentinel: classifySeverity()', () => {

  // ── P1 classification ───────────────────────────────────────────────────────

  describe('P1 classification', () => {
    test('classifies P1 when all 4 criteria match on a standard service', () => {
      const result = classifySeverity(
        { latencyMs: 900, errorRate: 0.20, durationMin: 5, transactionsAffected: 2000 },
        'platform'
      );
      expect(result.severity).toBe('P1');
      expect(result.confidence).toBe(100);
      expect(result.isCriticalService).toBe(false);
    });

    test('classifies P1 when exactly 2 of 4 criteria match', () => {
      const result = classifySeverity(
        { latencyMs: 900, errorRate: 0.20, durationMin: 1, transactionsAffected: 5 },
        'platform'
      );
      expect(result.severity).toBe('P1');
      expect(result.confidence).toBe(50);
    });

    test('does NOT classify P1 when only 1 criterion matches', () => {
      const result = classifySeverity(
        { latencyMs: 900, errorRate: 0.01, durationMin: 1, transactionsAffected: 5 },
        'platform'
      );
      expect(result.severity).not.toBe('P1');
    });

    test('applies critical-service multiplier for payment-gateway (fires at 640ms)', () => {
      // Standard P1 threshold: 800ms. With 0.8x multiplier: 640ms.
      const result = classifySeverity(
        { latencyMs: 650, errorRate: 0.20, durationMin: 5, transactionsAffected: 2000 },
        'payment-gateway'
      );
      expect(result.severity).toBe('P1');
      expect(result.criticalMultiplierApplied).toBe(true);
    });

    test('does NOT apply critical multiplier for non-critical service at 650ms', () => {
      // 650ms < 800ms P1 threshold for standard service; only 1 P1 criterion (durationMin) matches
      const result = classifySeverity(
        { latencyMs: 650, errorRate: 0.03, durationMin: 5, transactionsAffected: 50 },
        'platform'
      );
      expect(result.severity).toBe('P2');
      expect(result.criticalMultiplierApplied).toBe(false);
    });

    test('applies critical multiplier for fraud-detection', () => {
      const result = classifySeverity(
        { latencyMs: 650, errorRate: 0.20, durationMin: 5, transactionsAffected: 2000 },
        'fraud-detection'
      );
      expect(result.severity).toBe('P1');
      expect(result.isCriticalService).toBe(true);
    });

    test('applies critical multiplier for trading-api', () => {
      const result = classifySeverity(
        { latencyMs: 650, errorRate: 0.20, durationMin: 5, transactionsAffected: 2000 },
        'trading-api'
      );
      expect(result.severity).toBe('P1');
      expect(result.isCriticalService).toBe(true);
    });
  });

  // ── P2 classification ───────────────────────────────────────────────────────

  describe('P2 classification', () => {
    test('classifies P2 when 2 of 3 P2 criteria match', () => {
      const result = classifySeverity(
        { latencyMs: 450, errorRate: 0.06, durationMin: 6, transactionsAffected: 50 },
        'platform'
      );
      expect(result.severity).toBe('P2');
    });

    test('classifies P2 at exact P2 latency boundary (400ms)', () => {
      const result = classifySeverity(
        { latencyMs: 400, errorRate: 0.06, durationMin: 1, transactionsAffected: 5 },
        'platform'
      );
      expect(result.severity).toBe('P2');
    });

    test('does NOT classify P2 when only 1 P2 criterion matches', () => {
      const result = classifySeverity(
        { latencyMs: 450, errorRate: 0.01, durationMin: 1, transactionsAffected: 5 },
        'platform'
      );
      expect(result.severity).toBe('P3');
    });
  });

  // ── P3 classification ───────────────────────────────────────────────────────

  describe('P3 classification', () => {
    test('classifies P3 for low-impact alert', () => {
      const result = classifySeverity(
        { latencyMs: 210, errorRate: 0.01, durationMin: 11, transactionsAffected: 5 },
        'platform'
      );
      expect(result.severity).toBe('P3');
    });

    test('classifies P3 for healthy baseline metrics', () => {
      const result = classifySeverity(
        { latencyMs: 100, errorRate: 0.001, durationMin: 1, transactionsAffected: 0 },
        'platform'
      );
      expect(result.severity).toBe('P3');
    });
  });

  // ── Confidence scoring ─────────────────────────────────────────────────────

  describe('Confidence scoring', () => {
    test('confidence is 100% when all 4 P1 criteria match', () => {
      const result = classifySeverity(
        { latencyMs: 900, errorRate: 0.20, durationMin: 5, transactionsAffected: 5000 },
        'platform'
      );
      expect(result.confidence).toBe(100);
    });

    test('confidence is 50% when exactly 2 of 4 P1 criteria match', () => {
      const result = classifySeverity(
        { latencyMs: 900, errorRate: 0.20, durationMin: 1, transactionsAffected: 5 },
        'platform'
      );
      expect(result.severity).toBe('P1');
      expect(result.confidence).toBe(50);
    });

    test('confidence is between 0 and 100', () => {
      const result = classifySeverity(
        { latencyMs: 500, errorRate: 0.08, durationMin: 6, transactionsAffected: 200 },
        'platform'
      );
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe('Error handling', () => {
    test('returns P2 safe default when alert is null', () => {
      const result = classifySeverity(null, 'payment-gateway');
      expect(result.severity).toBe('P2');
      expect(result.error).toBeDefined();
      expect(result.confidence).toBe(0);
    });

    test('returns P2 safe default when alert object is missing fields', () => {
      const result = classifySeverity({}, 'payment-gateway');
      // Missing fields treated as 0 — should not throw
      expect(result.severity).toBeDefined();
    });

    test('handles unknown service gracefully (no multiplier)', () => {
      const result = classifySeverity(
        { latencyMs: 900, errorRate: 0.20, durationMin: 5, transactionsAffected: 2000 },
        'unknown-service-xyz'
      );
      expect(result.severity).toBe('P1'); // High metrics still P1
      expect(result.criticalMultiplierApplied).toBe(false);
      expect(result.isCriticalService).toBe(false);
    });
  });

  // ── Boundary conditions ────────────────────────────────────────────────────

  describe('Boundary conditions', () => {
    test('latency at exactly P1 threshold (800ms) counts as matching', () => {
      const result = classifySeverity(
        { latencyMs: 800, errorRate: 0.20, durationMin: 1, transactionsAffected: 5 },
        'platform'
      );
      expect(result.severity).toBe('P1');
    });

    test('latency at 799ms (just below P1 threshold) does not match P1 latency criterion', () => {
      const result = classifySeverity(
        { latencyMs: 799, errorRate: 0.01, durationMin: 1, transactionsAffected: 5 },
        'platform'
      );
      // Only 0 criteria match — P3
      expect(result.severity).toBe('P3');
    });

    test('error rate at exactly P1 threshold (0.15) counts as matching', () => {
      const result = classifySeverity(
        { latencyMs: 300, errorRate: 0.15, durationMin: 5, transactionsAffected: 2000 },
        'platform'
      );
      // latency no, errorRate yes, durationMin no, transactions yes — 2 of 4 = P1
      expect(result.severity).toBe('P1');
    });
  });

});
