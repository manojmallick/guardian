import { buildMCPAppsPayload } from '../../nodes/node-03-hitl/mcp-apps-builder.js';
import { buildTimeoutEscalation, buildRejectionRecord } from '../../nodes/node-03-hitl/timeout-handler.js';
import { buildGovernanceRecord } from '../../nodes/node-03-hitl/governance-logger.js';

const MOCK_INCIDENT = {
  incident_id: 'INC-4471',
  service: 'payment-gateway',
  severity: 'P1',
  confidence: 94,
  reasoning: 'Matched 4 of 4 P1 criteria. Critical service multiplier: true.',
  alert_raw: { latencyMs: 847, errorRate: 0.23, durationMin: 4, transactionsAffected: 3400 },
  runbooks: [
    {
      title: 'Payment Gateway Latency Degradation Runbook',
      url: 'https://yourcompany.atlassian.net/wiki/spaces/RUNBOOKS/pages/12345',
      steps: ['Check Stripe status', 'Verify DB pool', 'Check deployments'],
      owner: 'payments-oncall',
    },
  ],
};

describe('Node 03 — HITL Gate', () => {

  // ── buildMCPAppsPayload() ──────────────────────────────────────────────────

  describe('buildMCPAppsPayload()', () => {
    test('returns an object with type mcp_app_interactive', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      expect(payload.type).toBe('mcp_app_interactive');
    });

    test('includes blocks array', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      expect(Array.isArray(payload.blocks)).toBe(true);
      expect(payload.blocks.length).toBeGreaterThan(0);
    });

    test('includes header block with severity', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      const header = payload.blocks.find((b) => b.type === 'header');
      expect(header).toBeDefined();
      expect(header.text).toContain('P1');
    });

    test('includes actions block with 3 buttons', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      const actions = payload.blocks.find((b) => b.type === 'actions');
      expect(actions).toBeDefined();
      expect(actions.buttons).toHaveLength(3);
    });

    test('buttons have approve, escalate, and reject actions', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      const actions = payload.blocks.find((b) => b.type === 'actions');
      const ids = actions.buttons.map((b) => b.id);
      expect(ids).toContain('approve');
      expect(ids).toContain('escalate');
      expect(ids).toContain('reject');
    });

    test('includes timeout_minutes of 15', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      expect(payload.timeout_minutes).toBe(15);
    });

    test('includes runbook_preview block', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      const preview = payload.blocks.find((b) => b.type === 'runbook_preview');
      expect(preview).toBeDefined();
      expect(Array.isArray(preview.steps)).toBe(true);
    });

    test('includes timeout_action of auto_escalate', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      expect(payload.timeout_action).toBe('auto_escalate');
    });

    test('includes transactions affected in section fields', () => {
      const payload = buildMCPAppsPayload(MOCK_INCIDENT);
      const section = payload.blocks.find((b) => b.type === 'section');
      const impactField = section?.fields?.find((f) => f.label === 'Impact');
      expect(impactField?.value).toContain('3400');
    });
  });

  // ── buildTimeoutEscalation() ──────────────────────────────────────────────

  describe('buildTimeoutEscalation()', () => {
    test('returns escalated context with severity P1', () => {
      const p2incident = { ...MOCK_INCIDENT, severity: 'P2' };
      const result = buildTimeoutEscalation(p2incident);
      expect(result.severity).toBe('P1');
    });

    test('adds AUTO_ESCALATED flag in hitl.decision', () => {
      const result = buildTimeoutEscalation(MOCK_INCIDENT);
      expect(result.hitl.decision).toBe('AUTO_ESCALATED');
    });

    test('preserves original incident data', () => {
      const result = buildTimeoutEscalation(MOCK_INCIDENT);
      expect(result.incident_id).toBe('INC-4471');
      expect(result.service).toBe('payment-gateway');
    });

    test('includes a timestamp in hitl.approved_at', () => {
      const result = buildTimeoutEscalation(MOCK_INCIDENT);
      expect(result.hitl.approved_at).toBeDefined();
      expect(() => new Date(result.hitl.approved_at)).not.toThrow();
    });
  });

  // ── buildRejectionRecord() ────────────────────────────────────────────────

  describe('buildRejectionRecord()', () => {
    const hitlResponse = {
      decision: 'rejected',
      approver: 'U0987654321',
      approver_name: 'Alex Chen',
      rejected_at: '2026-03-15T09:14:30Z',
      response_time_seconds: 150,
    };

    test('returns a rejection record with decision = false_alarm', () => {
      const result = buildRejectionRecord(MOCK_INCIDENT, hitlResponse);
      expect(result.outcome).toBe('false_alarm');
    });

    test('includes rejected_by field', () => {
      const result = buildRejectionRecord(MOCK_INCIDENT, hitlResponse);
      expect(result.rejected_by).toBe('Alex Chen');
    });

    test('includes incident_id', () => {
      const result = buildRejectionRecord(MOCK_INCIDENT, hitlResponse);
      expect(result.incident_id).toBe('INC-4471');
    });
  });

  // ── buildGovernanceRecord() ───────────────────────────────────────────────

  describe('buildGovernanceRecord()', () => {
    const hitlResponse = {
      decision: 'approved',
      approver: 'U0123456789',
      approver_name: 'Jane Smith',
      approved_at: '2026-03-15T02:49:02Z',
      response_time_seconds: 109,
    };

    test('returns governance record with audit_event = HITL_DECISION', () => {
      const record = buildGovernanceRecord(MOCK_INCIDENT, hitlResponse);
      expect(record.audit_event).toBe('HITL_DECISION');
    });

    test('includes incident_id', () => {
      const record = buildGovernanceRecord(MOCK_INCIDENT, hitlResponse);
      expect(record.incident_id).toBe('INC-4471');
    });

    test('records human_decision as APPROVED', () => {
      const record = buildGovernanceRecord(MOCK_INCIDENT, hitlResponse);
      expect(record.human_decision).toBe('APPROVED');
    });

    test('includes a regulatory_note referencing DORA Article 11', () => {
      const record = buildGovernanceRecord(MOCK_INCIDENT, hitlResponse);
      expect(record.regulatory_note).toContain('DORA Article 11');
    });

    test('records the decision_maker name', () => {
      const record = buildGovernanceRecord(MOCK_INCIDENT, hitlResponse);
      expect(record.decision_maker).toContain('Jane Smith');
    });
  });

});
