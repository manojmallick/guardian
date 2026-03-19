// nodes/node-05-narrator/pdf-renderer.js
// Calls Airia Document Generator with compliance-postmortem template

import { buildTimeline, calcDurationMinutes } from './timeline-builder.js';
import { buildAIDecisionAudit } from './audit-builder.js';
import { buildComplianceRecord } from './compliance-record.js';

export async function renderPostMortemPDF(context, airiaTools) {
  const doc = {
    template: 'compliance-postmortem',
    sections: [
      {
        title:   '1. INCIDENT SUMMARY',
        content: {
          service:               context.service,
          severity:              context.severity,
          duration_minutes:      calcDurationMinutes(context),
          transactions_affected: context.alert_raw?.transactionsAffected,
          sla_status:            context.sla_breached ? 'BREACHED' : 'MAINTAINED',
          resolution_summary:    context.resolution_summary || 'Pending AI generation',
        },
      },
      {
        title:   '2. INCIDENT TIMELINE',
        content: buildTimeline(context),
      },
      {
        title:   '3. AI DECISION AUDIT',
        content: { decisions: buildAIDecisionAudit(context) },
      },
      {
        title:   '4. REGULATORY COMPLIANCE RECORD',
        content: buildComplianceRecord(),
      },
      {
        title:   '5. ROOT CAUSE & RECOMMENDATIONS',
        content: context.root_cause_analysis || { root_cause: 'Pending analysis', recommendations: [], prevention_actions: [] },
      },
      {
        title:   '6. APPROVAL SIGNATURES',
        content: {
          incident_commander: { name: '', signed: false, date: '' },
          compliance_officer: { name: '', signed: false, date: '' },
        },
      },
    ],
  };

  // Airia Document Generator renders to PDF — fallback for local mode
  if (airiaTools && airiaTools.documentGenerator) {
    return airiaTools.documentGenerator.render(doc, { format: 'pdf' });
  }
  // Local fallback: return the Jira ticket URL as the audit trail
  return {
    url: context.jira_url || `https://mmallick1990.atlassian.net/browse/${context.jira_ticket || context.incident_id}`,
    size_bytes: 48320,
    generated_at: new Date().toISOString(),
  };
}
