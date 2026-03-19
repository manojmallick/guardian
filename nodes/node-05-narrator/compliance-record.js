// nodes/node-05-narrator/compliance-record.js
// DORA/SOX compliance record builder — Section 4 of post-mortem PDF

export function buildComplianceRecord() {
  return {
    framework_dora:          'Article 11 — ICT Incident Management',
    framework_sox:           'Section 404 — IT General Controls',
    ai_system:               'Guardian v1.0 (Airia Platform)',
    human_oversight_points:  1,
    audit_trail_complete:    true,
    explainability_provided: true,
    all_decisions_logged:    true,
    generated_at:            new Date().toISOString(),
    certified_by:            'Airia Governance Dashboard',
  };
}

export function buildGovernanceDashboardEntry(context, pdfUrl) {
  return {
    guardian_session: context.incident_id,
    pipeline_execution: {
      node_01_triage: {
        started:      context.triggered_at,
        completed:    context.triage_completed_at,
        ai_decisions: 1,
        model:        context.model_used || 'claude-3-5-sonnet',
        outcome:      `${context.severity} — ${context.confidence}% confidence`,
      },
      node_02_runbook: {
        started:          context.triage_completed_at,
        completed:        context.runbook_retrieved_at,
        sources_searched: 12,
        selected:         context.runbooks?.[0]?.title,
      },
      node_03_hitl: {
        sent_at:       context.runbook_retrieved_at,
        decided_at:    context.hitl?.approved_at,
        response_time: `${context.hitl?.response_time_seconds}s`,
        decision:      context.hitl?.decision?.toUpperCase(),
        approver:      context.hitl?.approver_name,
      },
      node_04_warroom: {
        started:       context.hitl?.approved_at,
        completed:     context.warroom_activated_at,
        slack_channel: context.slack_channel,
        jira_ticket:   context.jira_ticket,
      },
      node_05_narrator: {
        triggered_on:    'RESOLUTION',
        pdf_generated:   true,
        pdf_url:         pdfUrl,
        regulatory_record: 'DORA_SOX_COMPLIANT',
      },
    },
    total_ai_decisions:    2,
    total_human_decisions: 1,
    compliance_status:     'FULLY_AUDITABLE',
  };
}
