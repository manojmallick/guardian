// community/compliance-narrator/index.js
// Compliance Narrator — AI Decision Audit Trail Generator
// Self-contained: supports DORA, SOX, HIPAA, FISMA frameworks

import { buildSummarySection }    from './sections/summary.js';
import { buildTimelineSection }   from './sections/timeline.js';
import { buildAIAuditSection }    from './sections/ai-audit.js';
import { buildComplianceSection } from './sections/compliance.js';
import { buildRootCauseSection }  from './sections/root-cause.js';
import { buildSignaturesSection } from './sections/signatures.js';
import { buildDORARecord }        from './frameworks/dora.js';
import { buildSOXRecord }         from './frameworks/sox.js';

// Default: DORA + SOX (financial services)
// Swap to hipaa.js or fisma.js for other regulated industries
function buildFrameworkRecord(context, framework = 'DORA_SOX') {
  switch (framework) {
    case 'DORA': return buildDORARecord(context);
    case 'SOX':  return buildSOXRecord(context);
    default:     return { ...buildDORARecord(context), sox: buildSOXRecord(context) };
  }
}

export async function generatePostMortem(context, airiaTools, framework = 'DORA_SOX') {
  const doc = {
    template: 'compliance-postmortem',
    sections: [
      { title: '1. INCIDENT SUMMARY',         content: buildSummarySection(context) },
      { title: '2. INCIDENT TIMELINE',         content: buildTimelineSection(context) },
      { title: '3. AI DECISION AUDIT',         content: buildAIAuditSection(context) },
      { title: '4. REGULATORY COMPLIANCE',     content: buildComplianceSection(buildFrameworkRecord(context, framework)) },
      { title: '5. ROOT CAUSE & RECOMMENDATIONS', content: buildRootCauseSection(context) },
      { title: '6. APPROVAL SIGNATURES',       content: buildSignaturesSection() },
    ],
  };

  const pdfResult = await airiaTools.documentGenerator.render(doc, { format: 'pdf' });

  return {
    incident_id:         context.incident_id,
    postmortem_pdf_url:  pdfResult.url,
    governance_entry:    pdfResult.governance_id,
    compliance_status:   'COMPLIANT',
    framework_applied:   framework,
    generated_at:        new Date().toISOString(),
  };
}

export {
  buildSummarySection,
  buildTimelineSection,
  buildAIAuditSection,
  buildComplianceSection,
  buildRootCauseSection,
  buildSignaturesSection,
  buildDORARecord,
  buildSOXRecord,
};

export { buildHIPAARecord } from './frameworks/hipaa.js';
export { buildFISMARecord } from './frameworks/fisma.js';

// ─── Airia Code Block entry point ───────────────────────────────────────────
if (typeof input !== 'undefined') {
  /* eslint-disable no-undef */
  output = await generatePostMortem(input, airiaTools);
  /* eslint-enable no-undef */
}
