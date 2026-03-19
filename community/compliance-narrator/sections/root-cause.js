// community/compliance-narrator/sections/root-cause.js
export function buildRootCauseSection(context) {
  return {
    root_cause:          context.root_cause || 'Under investigation — update after post-incident review.',
    contributing_factors: context.contributing_factors || [],
    recommendations:     context.recommendations || ['Complete root cause analysis within 48 hours of resolution.'],
    prevention_actions:  context.prevention_actions || ['Review and update runbooks based on this incident.'],
  };
}
