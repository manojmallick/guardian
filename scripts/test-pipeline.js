// scripts/test-pipeline.js
// Run: node scripts/test-pipeline.js
// Runs the full 5-node Guardian pipeline with mock data — no live APIs required

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load initial P1 mock payload
const p1Mock = JSON.parse(
  readFileSync(resolve(__dirname, '..', 'mocks/pagerduty/payment-gateway-p1.json'), 'utf-8')
);

// ----- Mock Airia tools for local pipeline run --------------------------------

const mockAiriaTools = {
  confluenceMCP: {
    search: async ({ query }) => {
      console.log(`  [MOCK] Confluence search: "${query}"`);
      return [
        {
          title: 'Payment Gateway Latency Degradation Runbook',
          _links: { webui: 'https://yourcompany.atlassian.net/wiki/spaces/RUNBOOKS/pages/12345' },
          body: { storage: { value: '<ol><li>Check Stripe status dashboard</li><li>Verify DB connection pool</li><li>Check recent deployments</li></ol>' } },
          metadata: { labels: [{ prefix: 'owner', name: 'payments-oncall' }] },
          version: { when: '2026-02-15T09:30:00Z' },
        },
      ];
    },
  },
  knowledgeBase: {
    get: async (key) => {
      console.log(`  [MOCK] Knowledge Base get: ${key}`);
      return JSON.parse(
        readFileSync(resolve(__dirname, '..', 'mocks/confluence/runbook-payment-latency.json'), 'utf-8')
      );
    },
  },
  slackMCP: {
    createChannel: async ({ name }) => {
      console.log(`  [MOCK] Slack createChannel: #${name}`);
      return { channel: { id: 'C_MOCK_123', name } };
    },
    postMessage: async ({ channel, text }) => {
      console.log(`  [MOCK] Slack postMessage to ${channel}`);
      return { ts: '1710467220.000001' };
    },
  },
  jiraMCP: {
    createIssue: async ({ summary }) => {
      console.log(`  [MOCK] Jira createIssue: "${summary}"`);
      return { id: '10042', key: 'INC-4471', self: 'https://yourcompany.atlassian.net/rest/api/3/issue/10042' };
    },
  },
  documentGenerator: {
    render: async (doc, opts) => {
      console.log(`  [MOCK] Document Generator: rendering ${opts.format} with ${doc.sections.length} sections`);
      return {
        url: 'https://airia.com/documents/mock-postmortem.pdf',
        governance_id: 'GOV-MOCK-001',
      };
    },
  },
  aiModel: {
    summarize: async (text) => `[MOCK SUMMARY] ${text.substring(0, 80)}...`,
    analyzeRootCause: async () => ({
      root_cause: '[MOCK] Database connection pool exhaustion from slow query in recent deployment.',
      recommendations: ['Roll back deployment d4f7a2c', 'Add slow query monitoring', 'Increase connection pool alert threshold'],
      prevention_actions: ['Mandatory load test before peak-hour deployments', 'DB migration dry-run procedure'],
    }),
  },
};

const mockAiriaAgents = {
  SlackWarRoomSubAgent: {
    run: async (input) => {
      console.log(`  [MOCK] SlackWarRoomSubAgent: creating #${input.channel_name}`);
      return {
        channel_url: `https://yourworkspace.slack.com/archives/C_MOCK_123`,
        channel_id: 'C_MOCK_123',
        message_ts: '1710467222.000001',
      };
    },
  },
  JiraTicketSubAgent: {
    run: async (input) => {
      console.log(`  [MOCK] JiraTicketSubAgent: creating ticket for ${input.incident_id}`);
      return {
        ticket_id: input.incident_id,
        ticket_url: `https://yourcompany.atlassian.net/jira/browse/${input.incident_id}`,
      };
    },
  },
};

// Mock HITL approval — skips interactive approval for pipeline test
const mockHITLApproval = {
  decision: 'approved',
  approver: 'U0123456789',
  approver_name: 'Jane Smith (MOCK)',
  approved_at: new Date().toISOString(),
  response_time_seconds: 5,
};

// ----- Import node modules ---------------------------------------------------

const { default: triageNode }   = await import('../nodes/node-01-triage/index.js');
const { default: runbookNode }  = await import('../nodes/node-02-runbook/index.js');
const { default: worroomNode }  = await import('../nodes/node-04-warroom/index.js');
const { default: narratorNode } = await import('../nodes/node-05-narrator/index.js');

// ----- Run pipeline ----------------------------------------------------------

console.log('\n🛡  Guardian — Full Pipeline Test\n' + '─'.repeat(50));
console.log(`Input: ${p1Mock.incident_id} — ${p1Mock.service} — ${JSON.stringify(p1Mock.alert)}\n`);

// Node 01 — Triage Sentinel
console.log('▶  Node 01: Triage Sentinel');
const triageOut = triageNode(p1Mock);
console.log(`   Result: ${triageOut.severity} (${triageOut.confidence}% confidence)\n`);

// Node 02 — Runbook Agent (with mock MCP tools)
console.log('▶  Node 02: Runbook Agent');
const runbookOut = await runbookNode(triageOut, mockAiriaTools);
console.log(`   Result: ${runbookOut.runbooks?.[0]?.title}\n`);

// Node 03 — HITL Gate (simulate approval — skip interactive)
console.log('▶  Node 03: HITL Gate (mock approval)');
const hitlOut = { ...runbookOut, hitl: mockHITLApproval };
console.log(`   Result: ${hitlOut.hitl.decision} by ${hitlOut.hitl.approver_name}\n`);

// Node 04 — War Room Agent
console.log('▶  Node 04: War Room Agent');
const warroomOut = await worroomNode(hitlOut, mockAiriaAgents);
console.log(`   Result: ${warroomOut.slack_channel} + ${warroomOut.jira_ticket}\n`);

// Node 05 — Compliance Narrator
console.log('▶  Node 05: Compliance Narrator');
const resolvedContext = {
  ...warroomOut,
  resolved_at: new Date().toISOString(),
  resolved_by: 'Jane Smith',
  sla_breached: false,
};
const narratorOut = await narratorNode(resolvedContext, mockAiriaTools);
console.log(`   Result: PDF → ${narratorOut.postmortem_pdf_url}\n`);

// Summary
console.log('─'.repeat(50));
console.log('✅  Full pipeline test complete.\n');
console.log('Pipeline Summary:');
console.log(`  Severity:        ${triageOut.severity} (${triageOut.confidence}% confidence)`);
console.log(`  Runbook:         ${runbookOut.runbooks?.[0]?.title}`);
console.log(`  HITL:            ${hitlOut.hitl.decision} by ${hitlOut.hitl.approver_name}`);
console.log(`  Slack Channel:   ${warroomOut.slack_channel}`);
console.log(`  Jira Ticket:     ${warroomOut.jira_url}`);
console.log(`  Post-mortem PDF: ${narratorOut.postmortem_pdf_url}`);
console.log(`  Compliance:      ${narratorOut.compliance_status}\n`);
