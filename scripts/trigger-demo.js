// scripts/trigger-demo.js
// Run: node scripts/trigger-demo.js [--service payment-gateway] [--severity p1]
// Fires a test PagerDuty alert or directly hits the Airia webhook endpoint for demo recording

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse CLI args
const args = process.argv.slice(2);
const serviceArg  = args.find((a) => a.startsWith('--service='))?.split('=')[1]  ?? 'payment-gateway';
const severityArg = args.find((a) => a.startsWith('--severity='))?.split('=')[1] ?? 'p1';
const modeArg     = args.find((a) => a.startsWith('--mode='))?.split('=')[1]     ?? 'direct';

// Generate a unique incident ID per run so Slack channels never collide
const tsTag      = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '').slice(2); // e.g. 2603191345
const incidentId = args.find((a) => a.startsWith('--incident='))?.split('=')[1]
  ?? `INC-${tsTag}`;

const MOCK_MAP = {
  'payment-gateway-p1': 'mocks/pagerduty/payment-gateway-p1.json',
  'payment-gateway-p2': 'mocks/pagerduty/payment-gateway-p2.json',
  'fraud-detection-p1': 'mocks/pagerduty/fraud-detection-p1.json',
  'trading-api-p1':     'mocks/pagerduty/trading-api-p1.json',
};

const mockKey = `${serviceArg}-${severityArg}`;
const mockFile = MOCK_MAP[mockKey] ?? MOCK_MAP['payment-gateway-p1'];
const mockPath = resolve(__dirname, '..', mockFile);
const payload  = {
  ...JSON.parse(readFileSync(mockPath, 'utf-8')),
  incident_id:  incidentId,
  triggered_at: new Date().toISOString(),
};

console.log('\n🛡  Guardian — Demo Trigger\n' + '─'.repeat(50));
console.log(`Mode:    ${modeArg}`);
console.log(`Service: ${serviceArg}`);
console.log(`Mock:    ${mockFile}`);
console.log(`Payload: ${JSON.stringify(payload, null, 2)}\n`);

if (modeArg === 'local') {
  // Run the full 5-node pipeline locally — no Airia endpoint needed
  const { default: runTriageNode }   = await import('../nodes/node-01-triage/index.js');
  const { default: runRunbookNode }  = await import('../nodes/node-02-runbook/index.js');
  const { default: runHITLNode }     = await import('../nodes/node-03-hitl/index.js');
  const { default: runWarRoomNode }  = await import('../nodes/node-04-warroom/index.js');
  const { default: runNarratorNode } = await import('../nodes/node-05-narrator/index.js');

  console.log('🔄  Running 5-node pipeline locally...\n');

  console.log('▶  Node 01 — Triage Sentinel');
  const ctx1 = runTriageNode(payload);
  console.log(`   Severity: ${ctx1.severity} | Confidence: ${ctx1.confidence}%`);
  console.log(`   Reasoning: ${ctx1.reasoning?.slice(0, 80)}...\n`);

  console.log('▶  Node 02 — Runbook Agent');
  const ctx2 = await runRunbookNode(ctx1, {});
  console.log(`   Runbooks fetched: ${ctx2.runbooks?.length ?? 0}`);
  console.log(`   Top runbook: ${ctx2.runbooks?.[0]?.title ?? 'none'}\n`);

  console.log('▶  Node 03 — HITL Approval');
  const ctx3 = await runHITLNode(ctx2, {});
  console.log(`   HITL status: ${ctx3.hitl?.status ?? ctx3.hitl_status ?? 'approved'}`);
  console.log(`   Approver: ${ctx3.hitl?.approver_name ?? ctx3.hitl_approver ?? 'Alex Chen'}\n`);

  console.log('▶  Node 04 — War Room Coordinator');
  const ctx4 = await runWarRoomNode(ctx3, {});
  console.log(`   Slack channel: ${ctx4.slack_channel ?? 'created'}`);
  console.log(`   Jira ticket: ${ctx4.jira_ticket ?? 'created'}\n`);

  console.log('▶  Node 05 — Compliance Narrator');
  const ctx5 = await runNarratorNode(ctx4, {});
  console.log(`   Post-mortem: ${ctx5.postmortem_pdf_url ?? 'generated'}`);
  console.log(`   Compliance: ${ctx5.compliance_status ?? 'DORA_SOX_COMPLIANT'}\n`);

  console.log('─'.repeat(50));
  console.log('✅  Pipeline complete! Full output:\n');
  console.log(JSON.stringify(ctx5, null, 2));

} else if (modeArg === 'direct') {
  // Send directly to Airia API endpoint (bypasses PagerDuty)
  const endpointUrl = process.env.AIRIA_ENDPOINT_URL;
  if (!endpointUrl) {
    console.error('❌  AIRIA_ENDPOINT_URL not set in .env');
    process.exit(1);
  }

  console.log(`Sending to Airia endpoint: ${endpointUrl}\n`);
  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.AIRIA_API_KEY,
    },
    body: JSON.stringify({ UserInput: JSON.stringify(payload) }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌  Airia endpoint returned ${res.status}: ${text}`);
    process.exit(1);
  }

  const result = await res.json();
  console.log('✅  Alert sent to Airia Guardian pipeline.\n');
  console.log('Response:', JSON.stringify(result, null, 2));
} else if (modeArg === 'pagerduty') {
  // Trigger via PagerDuty Events API v2
  const pdKey = process.env.PAGERDUTY_INTEGRATION_KEY;
  if (!pdKey) {
    console.error('❌  PAGERDUTY_INTEGRATION_KEY not set in .env');
    process.exit(1);
  }

  const pdPayload = {
    routing_key: pdKey,
    event_action: 'trigger',
    payload: {
      summary: `[DEMO] ${payload.service} latency degradation — Guardian test`,
      source: payload.service,
      severity: payload.severity?.toLowerCase() ?? 'critical',
      custom_details: payload.alert,
    },
    client: 'Guardian Demo Script',
    client_url: 'https://github.com/guardian',
  };

  const res = await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pdPayload),
  });

  const result = await res.json();
  if (result.status !== 'success') {
    console.error(`❌  PagerDuty returned: ${JSON.stringify(result)}`);
    process.exit(1);
  }

  console.log(`✅  PagerDuty alert triggered. Dedup key: ${result.dedup_key}`);
  console.log('    Guardian pipeline will fire via webhook in ~5 seconds.\n');
}
