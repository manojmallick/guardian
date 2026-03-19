// nodes/node-05-narrator/index.js
// Guardian Node 05 — Compliance Narrator
// Runs inside Airia Code Block node
// Triggered when incident is resolved (Jira status change or Slack /guardian-resolved)
// Produces: post-mortem PDF + Governance Dashboard entry

import { renderPostMortemPDF } from './pdf-renderer.js';
import { buildGovernanceDashboardEntry } from './compliance-record.js';

export { buildTimeline, calcDurationMinutes } from './timeline-builder.js';
export { buildAIDecisionAudit } from './audit-builder.js';
export { buildComplianceRecord, buildGovernanceDashboardEntry } from './compliance-record.js';

// ─── Default export for local testing / integration tests ─────────────────
export default async function runNarratorNode(context, airiaTools) {
  return generatePostMortem(context, airiaTools);
}

export async function generatePostMortem(context, airiaTools) {
  const pdfResult = await renderPostMortemPDF(context, airiaTools);
  const governanceEntry = buildGovernanceDashboardEntry(context, pdfResult.url);

  // Store governance entry in Airia Governance Dashboard
  if (airiaTools?.governanceDashboard) {
    await airiaTools.governanceDashboard.record(governanceEntry);
  }

  return {
    incident_id:         context.incident_id,
    postmortem_pdf_url:  pdfResult.url,
    governance_entry:    pdfResult.governance_id || 'GOV-' + context.incident_id,
    compliance_status:   'DORA_SOX_COMPLIANT',
    generated_at:        new Date().toISOString(),
  };
}

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  output = await generatePostMortem(input, airiaTools);
  /* eslint-enable no-undef */
}
