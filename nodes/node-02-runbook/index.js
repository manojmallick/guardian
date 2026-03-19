// nodes/node-02-runbook/index.js
// Guardian Node 02 — Runbook Agent
// Runs inside Airia Code Block node
// Uses Airia MCP Gateway for Confluence — no credentials in this code
// Input: triage output from Node 01

import { searchConfluenceRunbooks } from './confluence-mcp.js';
import { loadFallbackRunbook } from './fallback-cache.js';

export async function fetchRunbook(service, alertProfile, airiaTools) {
  if (airiaTools?.confluenceMCP) {
    return searchConfluenceRunbooks(service, alertProfile, airiaTools);
  }
  // No MCP tools available (local test mode)
  return loadFallbackRunbook(service);
}

export function determineAlertProfile(alert_raw) {
  if (!alert_raw) return 'latency-degradation';
  return alert_raw.errorRate > 0.10 ? 'high-error-rate' : 'latency-degradation';
}

// ─── Default export for local testing / integration tests ─────────────────
export default async function runRunbookNode(input, airiaTools) {
  const alertProfile = determineAlertProfile(input.alert_raw);
  const result = await fetchRunbook(input.service, alertProfile, airiaTools);
  const runbooks = Array.isArray(result) ? result : [result];
  return { ...input, runbooks, runbook_retrieved_at: new Date().toISOString() };
}

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  const alertProfile = determineAlertProfile(input.alert_raw);
  const runbooks = await fetchRunbook(input.service, alertProfile, airiaTools);

  output = {
    ...input,
    runbooks,
    runbook_retrieved_at: new Date().toISOString(),
  };
  /* eslint-enable no-undef */
}
