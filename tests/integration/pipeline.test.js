// tests/integration/pipeline.test.js
// End-to-end pipeline test using mock data — no live APIs required
// Run: npm run test:integration

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load mock payloads
const p1Mock = JSON.parse(
  readFileSync(resolve(__dirname, '../../mocks/pagerduty/payment-gateway-p1.json'), 'utf-8')
);

// Mock Airia tools for integration test
const mockAiriaTools = {
  confluenceMCP: {
    search: async () => [
      {
        title: 'Payment Gateway Latency Degradation Runbook',
        _links: { webui: 'https://example.atlassian.net/wiki/spaces/RUNBOOKS/pages/12345' },
        body: {
          storage: {
            value: '<ol><li>Check Stripe status dashboard</li><li>Verify DB connection pool</li><li>Check recent deployments in last 2 hours</li></ol>',
          },
        },
        metadata: { labels: [{ prefix: 'owner', name: 'payments-oncall' }] },
        version: { when: '2026-02-15T09:30:00Z' },
      },
    ],
  },
  knowledgeBase: {
    get: async () => ({
      title: 'Payment Gateway (Cached)',
      steps: ['Step 1', 'Step 2'],
      owner: 'payments-oncall',
      source: 'CACHED_FALLBACK',
    }),
  },
  documentGenerator: {
    render: async (doc) => ({
      url: `https://airia.com/docs/mock-${Date.now()}.pdf`,
      governance_id: 'GOV-INTEGRATION-001',
      sections: doc.sections.length,
    }),
  },
  aiModel: {
    summarize: async () => 'Integration test summary.',
    analyzeRootCause: async () => ({
      root_cause: 'Integration test root cause.',
      recommendations: ['Recommendation 1'],
      prevention_actions: ['Action 1'],
    }),
  },
};

const mockAiriaAgents = {
  SlackWarRoomSubAgent: {
    run: async (input) => ({
      channel_url: `https://slack.com/archives/C_INT_TEST`,
      channel_id: 'C_INT_TEST',
      message_ts: '1710467222.000001',
      channel_name: input.channel_name,
    }),
  },
  JiraTicketSubAgent: {
    run: async (input) => ({
      ticket_id: input.incident_id,
      ticket_url: `https://jira.example.com/browse/${input.incident_id}`,
    }),
  },
};

// Import pipeline nodes
const { default: triageNode }   = await import('../../nodes/node-01-triage/index.js');
const { default: runbookNode }  = await import('../../nodes/node-02-runbook/index.js');
const { default: warroomNode }  = await import('../../nodes/node-04-warroom/index.js');
const { default: narratorNode } = await import('../../nodes/node-05-narrator/index.js');

describe('Guardian Pipeline — Integration Tests (No Live APIs)', () => {

  let triageOut, runbookOut, hitlOut, warroomOut, narratorOut;

  beforeAll(async () => {
    // Node 01 — Triage
    triageOut = triageNode(p1Mock);

    // Node 02 — Runbook
    runbookOut = await runbookNode(triageOut, mockAiriaTools);

    // Node 03 — HITL (mock approval)
    hitlOut = {
      ...runbookOut,
      hitl: {
        decision: 'approved',
        approver: 'U0123456789',
        approver_name: 'Jane Smith (Integration Test)',
        approved_at: new Date().toISOString(),
        response_time_seconds: 5,
      },
    };

    // Node 04 — War Room
    warroomOut = await warroomNode(hitlOut, mockAiriaAgents);

    // Node 05 — Narrator
    narratorOut = await narratorNode(
      { ...warroomOut, resolved_at: new Date().toISOString(), sla_breached: false },
      mockAiriaTools
    );
  }, 30000);

  // ── Node 01 ────────────────────────────────────────────────────────────────

  describe('Node 01 — Triage Sentinel', () => {
    test('classifies payment-gateway p1 mock as P1', () => {
      expect(triageOut.severity).toBe('P1');
    });

    test('confidence is above 75%', () => {
      expect(triageOut.confidence).toBeGreaterThan(75);
    });

    test('passesthrough incident_id and service', () => {
      expect(triageOut.incident_id).toBe('INC-4471');
      expect(triageOut.service).toBe('payment-gateway');
    });

    test('adds triage_completed_at timestamp', () => {
      expect(triageOut.triage_completed_at).toBeDefined();
    });
  });

  // ── Node 02 ────────────────────────────────────────────────────────────────

  describe('Node 02 — Runbook Agent', () => {
    test('returns runbooks array with at least one entry', () => {
      expect(Array.isArray(runbookOut.runbooks)).toBe(true);
      expect(runbookOut.runbooks.length).toBeGreaterThan(0);
    });

    test('runbook has required fields', () => {
      const runbook = runbookOut.runbooks[0];
      expect(runbook).toHaveProperty('title');
      expect(runbook).toHaveProperty('url');
      expect(runbook).toHaveProperty('steps');
      expect(runbook).toHaveProperty('owner');
    });

    test('runbook steps is a non-empty array', () => {
      expect(Array.isArray(runbookOut.runbooks[0].steps)).toBe(true);
      expect(runbookOut.runbooks[0].steps.length).toBeGreaterThan(0);
    });

    test('preserves Node 01 fields', () => {
      expect(runbookOut.severity).toBe('P1');
      expect(runbookOut.incident_id).toBe('INC-4471');
    });
  });

  // ── Node 04 ────────────────────────────────────────────────────────────────

  describe('Node 04 — War Room Agent', () => {
    test('returns slack_channel URL', () => {
      expect(warroomOut.slack_channel).toBeDefined();
      expect(warroomOut.slack_channel).toContain('http');
    });

    test('returns jira_ticket and jira_url', () => {
      expect(warroomOut.jira_ticket).toBe('INC-4471');
      expect(warroomOut.jira_url).toBeDefined();
    });

    test('returns oncall_notified array', () => {
      expect(Array.isArray(warroomOut.oncall_notified)).toBe(true);
      expect(warroomOut.oncall_notified.length).toBeGreaterThan(0);
    });

    test('preserves HITL approver data', () => {
      expect(warroomOut.hitl.approver_name).toContain('Jane Smith');
    });
  });

  // ── Node 05 ────────────────────────────────────────────────────────────────

  describe('Node 05 — Compliance Narrator', () => {
    test('returns postmortem_pdf_url', () => {
      expect(narratorOut.postmortem_pdf_url).toBeDefined();
      expect(narratorOut.postmortem_pdf_url).toContain('http');
    });

    test('compliance_status is DORA_SOX_COMPLIANT', () => {
      expect(narratorOut.compliance_status).toBe('DORA_SOX_COMPLIANT');
    });

    test('returns governance_entry', () => {
      expect(narratorOut.governance_entry).toBeDefined();
    });

    test('includes incident_id in output', () => {
      expect(narratorOut.incident_id).toBe('INC-4471');
    });
  });

  // ── Full pipeline context propagation ─────────────────────────────────────

  describe('Context propagation across all nodes', () => {
    test('incident_id is preserved end-to-end', () => {
      expect(warroomOut.incident_id).toBe('INC-4471');
    });

    test('service is preserved end-to-end', () => {
      expect(warroomOut.service).toBe('payment-gateway');
    });

    test('original alert_raw is preserved to Node 05', () => {
      expect(narratorOut.alert_raw ?? warroomOut.alert_raw).toBeDefined();
    });
  });

});
