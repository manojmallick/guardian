import { buildTimeline, calcDurationMinutes } from '../../nodes/node-05-narrator/timeline-builder.js';
import { buildAIDecisionAudit } from '../../nodes/node-05-narrator/audit-builder.js';
import { buildComplianceRecord, buildGovernanceDashboardEntry } from '../../nodes/node-05-narrator/compliance-record.js';

const MOCK_RESOLVED = {
  incident_id: 'INC-4471',
  service: 'payment-gateway',
  severity: 'P1',
  confidence: 94,
  reasoning: 'Matched 4 of 4 P1 criteria.',
  model_used: 'claude-3-5-sonnet-20241022',
  alert_raw: { latencyMs: 847, errorRate: 0.23, durationMin: 4, transactionsAffected: 3400 },
  triggered_at: '2026-03-15T02:47:13Z',
  triage_completed_at: '2026-03-15T02:47:16Z',
  runbooks: [
    {
      title: 'Payment Gateway Latency Degradation Runbook',
      url: 'https://yourcompany.atlassian.net/wiki/spaces/RUNBOOKS/pages/12345',
      steps: ['Check Stripe status', 'Verify DB pool', 'Check deployments'],
      owner: 'payments-oncall',
    },
  ],
  runbook_retrieved_at: '2026-03-15T02:47:18Z',
  hitl: {
    decision: 'approved',
    approver: 'U0123456789',
    approver_name: 'Jane Smith',
    approved_at: '2026-03-15T02:49:02Z',
    response_time_seconds: 109,
  },
  slack_channel: 'https://yourworkspace.slack.com/archives/C123456',
  slack_channel_id: 'C123456',
  jira_ticket: 'INC-4471',
  warroom_activated_at: '2026-03-15T02:49:06Z',
  resolved_at: '2026-03-15T03:22:00Z',
  sla_breached: false,
};

describe('Node 05 — Compliance Narrator', () => {

  // ── calcDurationMinutes() ─────────────────────────────────────────────────

  describe('calcDurationMinutes()', () => {
    test('calculates duration correctly from triggered_at to resolved_at', () => {
      const duration = calcDurationMinutes(MOCK_RESOLVED);
      // 02:47 to 03:22 = 35 minutes
      expect(duration).toBe(35);
    });

    test('returns a positive number', () => {
      const duration = calcDurationMinutes(MOCK_RESOLVED);
      expect(duration).toBeGreaterThan(0);
    });

    test('handles missing resolved_at by using current time', () => {
      const context = { ...MOCK_RESOLVED, resolved_at: undefined };
      const duration = calcDurationMinutes(context);
      expect(duration).toBeGreaterThan(0);
    });
  });

  // ── buildTimeline() ────────────────────────────────────────────────────────

  describe('buildTimeline()', () => {
    test('returns an array of timeline events', () => {
      const timeline = buildTimeline(MOCK_RESOLVED);
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(4);
    });

    test('first event is the PagerDuty alert', () => {
      const timeline = buildTimeline(MOCK_RESOLVED);
      expect(timeline[0].event).toContain('PagerDuty');
    });

    test('includes triage event', () => {
      const timeline = buildTimeline(MOCK_RESOLVED);
      const triageEvent = timeline.find((e) => e.event.toLowerCase().includes('triage'));
      expect(triageEvent).toBeDefined();
    });

    test('includes HITL approved event', () => {
      const timeline = buildTimeline(MOCK_RESOLVED);
      const hitlEvent = timeline.find((e) => e.event.toLowerCase().includes('hitl') || e.event.toLowerCase().includes('approved'));
      expect(hitlEvent).toBeDefined();
    });

    test('includes war room activated event', () => {
      const timeline = buildTimeline(MOCK_RESOLVED);
      const warRoomEvent = timeline.find((e) => e.event.toLowerCase().includes('war room'));
      expect(warRoomEvent).toBeDefined();
    });

    test('each event has time and event fields', () => {
      const timeline = buildTimeline(MOCK_RESOLVED);
      for (const entry of timeline) {
        expect(entry).toHaveProperty('time');
        expect(entry).toHaveProperty('event');
      }
    });

    test('approver name appears in HITL event', () => {
      const timeline = buildTimeline(MOCK_RESOLVED);
      const hitlEvent = timeline.find((e) => e.event.includes('Jane Smith'));
      expect(hitlEvent).toBeDefined();
    });
  });

  // ── buildAIDecisionAudit() ─────────────────────────────────────────────────

  describe('buildAIDecisionAudit()', () => {
    test('returns an array with at least 2 decisions', () => {
      const audit = buildAIDecisionAudit(MOCK_RESOLVED);
      expect(Array.isArray(audit)).toBe(true);
      expect(audit.length).toBeGreaterThanOrEqual(2);
    });

    test('first decision is severity_classification', () => {
      const audit = buildAIDecisionAudit(MOCK_RESOLVED);
      expect(audit[0].type).toBe('severity_classification');
    });

    test('second decision is runbook_selection', () => {
      const audit = buildAIDecisionAudit(MOCK_RESOLVED);
      expect(audit[1].type).toBe('runbook_selection');
    });

    test('each decision has required fields', () => {
      const audit = buildAIDecisionAudit(MOCK_RESOLVED);
      for (const decision of audit) {
        expect(decision).toHaveProperty('decision_id');
        expect(decision).toHaveProperty('type');
        expect(decision).toHaveProperty('model_used');
        expect(decision).toHaveProperty('reasoning');
        expect(decision).toHaveProperty('human_override');
      }
    });

    test('human_override is false for both decisions', () => {
      const audit = buildAIDecisionAudit(MOCK_RESOLVED);
      for (const decision of audit) {
        expect(decision.human_override).toBe(false);
      }
    });

    test('uses provided model_used from context', () => {
      const audit = buildAIDecisionAudit(MOCK_RESOLVED);
      expect(audit[0].model_used).toBe('claude-3-5-sonnet-20241022');
    });

    test('triage decision includes correct confidence', () => {
      const audit = buildAIDecisionAudit(MOCK_RESOLVED);
      expect(audit[0].confidence).toBe(94);
    });
  });

  // ── buildComplianceRecord() ────────────────────────────────────────────────

  describe('buildComplianceRecord()', () => {
    test('returns object with DORA and SOX frameworks', () => {
      const record = buildComplianceRecord(MOCK_RESOLVED);
      expect(record.framework_dora).toContain('Article 11');
      expect(record.framework_sox).toContain('Section 404');
    });

    test('audit_trail_complete is true', () => {
      const record = buildComplianceRecord(MOCK_RESOLVED);
      expect(record.audit_trail_complete).toBe(true);
    });

    test('human_oversight_points is 1', () => {
      const record = buildComplianceRecord(MOCK_RESOLVED);
      expect(record.human_oversight_points).toBe(1);
    });

    test('ai_system references Guardian', () => {
      const record = buildComplianceRecord(MOCK_RESOLVED);
      expect(record.ai_system).toContain('Guardian');
    });

    test('includes generated_at timestamp', () => {
      const record = buildComplianceRecord(MOCK_RESOLVED);
      expect(record.generated_at).toBeDefined();
      expect(() => new Date(record.generated_at)).not.toThrow();
    });
  });

  // ── buildGovernanceDashboardEntry() ───────────────────────────────────────

  describe('buildGovernanceDashboardEntry()', () => {
    test('returns entry with guardian_session matching incident_id', () => {
      const entry = buildGovernanceDashboardEntry(MOCK_RESOLVED);
      expect(entry.guardian_session).toBe('INC-4471');
    });

    test('includes all 5 pipeline execution keys', () => {
      const entry = buildGovernanceDashboardEntry(MOCK_RESOLVED);
      expect(entry.pipeline_execution).toHaveProperty('node_01_triage');
      expect(entry.pipeline_execution).toHaveProperty('node_02_runbook');
      expect(entry.pipeline_execution).toHaveProperty('node_03_hitl');
      expect(entry.pipeline_execution).toHaveProperty('node_04_warroom');
      expect(entry.pipeline_execution).toHaveProperty('node_05_narrator');
    });

    test('compliance_status is FULLY_AUDITABLE', () => {
      const entry = buildGovernanceDashboardEntry(MOCK_RESOLVED);
      expect(entry.compliance_status).toBe('FULLY_AUDITABLE');
    });

    test('total_human_decisions is 1', () => {
      const entry = buildGovernanceDashboardEntry(MOCK_RESOLVED);
      expect(entry.total_human_decisions).toBe(1);
    });

    test('HITL node shows approver and decision', () => {
      const entry = buildGovernanceDashboardEntry(MOCK_RESOLVED);
      expect(entry.pipeline_execution.node_03_hitl.decision).toBe('APPROVED');
      expect(entry.pipeline_execution.node_03_hitl.approver).toBe('Jane Smith');
    });
  });

});
