import { resolveOnCallTeam } from '../../nodes/node-04-warroom/oncall-resolver.js';
import { buildSlackChannelName, buildSlackWarRoomMessage } from '../../nodes/node-04-warroom/channel-builder.js';
import { buildJiraTicket } from '../../nodes/node-04-warroom/jira-builder.js';

const MOCK_INCIDENT = {
  incident_id: 'INC-4471',
  service: 'payment-gateway',
  severity: 'P1',
  confidence: 94,
  reasoning: 'Matched 4 of 4 P1 criteria.',
  ai_explanation: 'Latency spike with high error rate.',
  runbooks: [
    {
      title: 'Payment Gateway Latency Degradation Runbook',
      url: 'https://yourcompany.atlassian.net/wiki/spaces/RUNBOOKS/pages/12345',
      steps: ['Check Stripe status', 'Verify DB pool', 'Check deployments'],
      owner: 'payments-oncall',
    },
  ],
  alert_raw: { latencyMs: 847, errorRate: 0.23, durationMin: 4, transactionsAffected: 3400 },
  hitl: {
    decision: 'approved',
    approver: 'U0123456789',
    approver_name: 'Jane Smith',
    approved_at: '2026-03-15T02:49:02Z',
    response_time_seconds: 109,
  },
};

describe('Node 04 — War Room Agent', () => {

  // ── resolveOnCallTeam() ────────────────────────────────────────────────────

  describe('resolveOnCallTeam()', () => {
    test('returns payments team for payment-gateway', () => {
      const team = resolveOnCallTeam('payment-gateway');
      expect(team).toContain('@payments-oncall');
    });

    test('returns risk team for fraud-detection', () => {
      const team = resolveOnCallTeam('fraud-detection');
      expect(team).toContain('@risk-oncall');
    });

    test('returns trading team for trading-api', () => {
      const team = resolveOnCallTeam('trading-api');
      expect(team).toContain('@trading-oncall');
    });

    test('returns platform team as fallback for unknown service', () => {
      const team = resolveOnCallTeam('unknown-xyz');
      expect(team).toContain('@platform-oncall');
    });

    test('returns an array', () => {
      const team = resolveOnCallTeam('payment-gateway');
      expect(Array.isArray(team)).toBe(true);
    });

    test('payment-gateway team includes sre-lead', () => {
      const team = resolveOnCallTeam('payment-gateway');
      expect(team).toContain('@sre-lead');
    });
  });

  // ── buildSlackChannelName() ────────────────────────────────────────────────

  describe('buildSlackChannelName()', () => {
    test('produces lowercase channel name with inc- prefix', () => {
      const name = buildSlackChannelName('INC-4471', 'payment-gateway');
      expect(name.startsWith('inc-')).toBe(true);
      expect(name).toBe(name.toLowerCase());
    });

    test('replaces special characters with hyphens', () => {
      const name = buildSlackChannelName('INC-4471', 'payment_gateway');
      expect(name).not.toContain('_');
    });

    test('contains both incident ID and service name', () => {
      const name = buildSlackChannelName('INC-4471', 'payment-gateway');
      expect(name).toContain('4471');
      expect(name).toContain('payment');
    });

    test('works for fraud-detection service', () => {
      const name = buildSlackChannelName('INC-4473', 'fraud-detection');
      expect(name).toContain('4473');
      expect(name).toContain('fraud');
    });

    test('stays within Slack channel name length limit (80 chars)', () => {
      const name = buildSlackChannelName('INC-9999', 'very-long-service-name-that-exceeds-normal-length');
      expect(name.length).toBeLessThanOrEqual(80);
    });
  });

  // ── buildSlackWarRoomMessage() ─────────────────────────────────────────────

  describe('buildSlackWarRoomMessage()', () => {
    const channelName = 'inc-4471-payment-gateway';
    const oncallTeam = ['@payments-oncall', '@sre-lead'];

    test('returns a non-empty string', () => {
      const msg = buildSlackWarRoomMessage(MOCK_INCIDENT, channelName, oncallTeam);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(50);
    });

    test('includes incident ID', () => {
      const msg = buildSlackWarRoomMessage(MOCK_INCIDENT, channelName, oncallTeam);
      expect(msg).toContain('INC-4471');
    });

    test('includes severity', () => {
      const msg = buildSlackWarRoomMessage(MOCK_INCIDENT, channelName, oncallTeam);
      expect(msg).toContain('P1');
    });

    test('includes runbook URL', () => {
      const msg = buildSlackWarRoomMessage(MOCK_INCIDENT, channelName, oncallTeam);
      expect(msg).toContain('Payment Gateway Latency Degradation Runbook');
    });

    test('includes approver name', () => {
      const msg = buildSlackWarRoomMessage(MOCK_INCIDENT, channelName, oncallTeam);
      expect(msg).toContain('Jane Smith');
    });
  });

  // ── buildJiraTicket() ──────────────────────────────────────────────────────

  describe('buildJiraTicket()', () => {
    test('returns object with required Jira fields', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket).toHaveProperty('project');
      expect(ticket).toHaveProperty('issuetype');
      expect(ticket).toHaveProperty('priority');
      expect(ticket).toHaveProperty('summary');
      expect(ticket).toHaveProperty('labels');
    });

    test('maps P1 severity to Critical priority', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket.priority).toBe('Critical');
    });

    test('maps P2 severity to High priority', () => {
      const ticket = buildJiraTicket({ ...MOCK_INCIDENT, severity: 'P2' });
      expect(ticket.priority).toBe('High');
    });

    test('maps P3 severity to Medium priority', () => {
      const ticket = buildJiraTicket({ ...MOCK_INCIDENT, severity: 'P3' });
      expect(ticket.priority).toBe('Medium');
    });

    test('includes guardian-automated label', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket.labels).toContain('guardian-automated');
    });

    test('includes dora-tracked label', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket.labels).toContain('dora-tracked');
    });

    test('summary contains service name', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket.summary).toContain('payment-gateway');
    });

    test('description contains approver name', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket.description).toContain('Jane Smith');
    });

    test('includes SLA custom fields', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket.customFields).toHaveProperty('sla_start');
      expect(ticket.customFields).toHaveProperty('sla_target_minutes');
      expect(ticket.customFields.ai_generated).toBe(true);
    });

    test('P1 SLA target is 30 minutes', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket.customFields.sla_target_minutes).toBe(30);
    });

    test('assignee is set from runbook owner', () => {
      const ticket = buildJiraTicket(MOCK_INCIDENT);
      expect(ticket.assignee).toBe('payments-oncall');
    });
  });

});
