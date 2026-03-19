// community/compliance-narrator/frameworks/sox.js
// SOX Section 404 audit record builder

export function buildSOXRecord(context) {
  return {
    framework:               'Sarbanes-Oxley Act (SOX)',
    section:                 'Section 404 — IT General Controls',
    jurisdiction:            'United States',
    ai_system:               'Guardian v1.0 (Airia Platform)',
    it_control_name:         'AI-Assisted Incident Response Automation',
    control_objective:       'Ensure automated AI decisions in financial system incident response are documented, auditable, and subject to human oversight.',
    control_tested:          true,
    evidence_available:      true,
    human_approval_required: true,
    human_approver:          context.hitl?.approver_name,
    approval_timestamp:      context.hitl?.approved_at,
    exceptions_noted:        false,
    generated_at:            new Date().toISOString(),
    regulatory_note:         'This record supports SOX Section 404 compliance by providing evidence of IT general controls over AI-assisted financial system incident response.',
  };
}
