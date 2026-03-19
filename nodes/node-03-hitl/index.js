// nodes/node-03-hitl/index.js
// Guardian Node 03 — HITL Gate
// Constructs the MCP Apps interactive Slack payload for HITL approval
// Airia HITL Node handles the waiting and timeout logic
// Input: triage + runbook output from Node 02

import { buildMCPAppsPayload } from './mcp-apps-builder.js';
export { buildMCPAppsPayload } from './mcp-apps-builder.js';
export { buildGovernanceRecord } from './governance-logger.js';
export { buildTimeoutEscalation, buildRejectionRecord } from './timeout-handler.js';

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  output = buildMCPAppsPayload(input);
  // Airia HITL node sends this message, waits for response, then passes:
  // { ...input, hitl: { decision, approver, approved_at, response_time_seconds } }
  /* eslint-enable no-undef */
}

// ─── Local / integration export ─────────────────────────────────────────────
export default async function runHITLNode(input) {
  const payload = buildMCPAppsPayload(input);
  // In local mode, simulate auto-approval
  return {
    ...input,
    hitl_payload: payload,
    hitl: {
      decision: 'APPROVED',
      approver_name: 'Alex Chen (simulated)',
      approved_at: new Date().toISOString(),
      response_time_seconds: 42,
      status: 'approved',
    },
  };
}
