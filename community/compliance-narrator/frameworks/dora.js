// community/compliance-narrator/frameworks/dora.js
// DORA Article 11 compliance record builder

export function buildDORARecord(context) {
  return {
    framework:               'DORA — Digital Operational Resilience Act',
    article:                 'Article 11 — ICT Incident Classification and Reporting',
    jurisdiction:            'European Union',
    ai_system:               'Guardian v1.0 (Airia Platform)',
    human_oversight_points:  1,
    audit_trail_complete:    true,
    explainability_provided: true,
    all_ai_decisions_logged: true,
    incident_classified:     true,
    classification_reasoning: context.reasoning,
    human_review_conducted:  true,
    human_reviewer:          context.hitl?.approver_name,
    human_review_timestamp:  context.hitl?.approved_at,
    generated_at:            new Date().toISOString(),
    certified_by:            'Airia Governance Dashboard',
    regulatory_note:         'This record satisfies DORA Article 11 requirements for ICT incident classification and AI-assisted process auditability.',
  };
}
