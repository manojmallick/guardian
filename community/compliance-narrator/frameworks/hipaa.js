// community/compliance-narrator/frameworks/hipaa.js
// HIPAA compliance record builder — for healthcare incident response forks

export function buildHIPAARecord(context) {
  return {
    framework:               'HIPAA — Health Insurance Portability and Accountability Act',
    rule:                    'Security Rule — Incident Response (§164.308(a)(6))',
    jurisdiction:            'United States',
    ai_system:               context.ai_system || 'AI-Assisted Incident Response',
    phi_involved:            false,    // Set to true if ePHI was potentially exposed
    breach_determination:    'PENDING', // Update after investigation
    incident_documented:     true,
    response_plan_followed:  true,
    human_review_conducted:  true,
    human_reviewer:          context.hitl?.approver_name,
    review_timestamp:        context.hitl?.approved_at,
    generated_at:            new Date().toISOString(),
    regulatory_note:         'This record supports HIPAA Security Rule incident response documentation requirements. Update phi_involved and breach_determination fields after investigation.',
  };
}
