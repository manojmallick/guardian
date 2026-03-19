// community/warroom-coordinator/config/oncall-teams.js
// EDIT THIS FILE to map your service names to on-call Slack user groups

export const ONCALL_TEAMS = {
  'payment-gateway':  ['@payments-oncall', '@sre-lead'],
  'fraud-detection':  ['@risk-oncall',     '@fraud-eng'],
  'trading-api':      ['@trading-oncall',  '@markets-sre'],
  'platform':         ['@platform-oncall'],
};

// Default team — used when service is not in the map above
export const DEFAULT_ONCALL = ['@platform-oncall'];

export function resolveTeam(service) {
  return ONCALL_TEAMS[service] || DEFAULT_ONCALL;
}
