// config/services.js
// Maps service names → on-call teams, runbook space labels, SLA targets
// Edit this file to add new services to Guardian

export const SERVICES = {
  'payment-gateway': {
    onCallTeams:    ['@payments-oncall', '@sre-lead'],
    runbookLabel:   'payment-gateway',
    slaMinutes:     { P1: 30, P2: 60, P3: 240 },
    jiraAssignee:   'payments-team-lead',
    isCritical:     true,
  },
  'fraud-detection': {
    onCallTeams:    ['@risk-oncall', '@fraud-eng'],
    runbookLabel:   'fraud-detection',
    slaMinutes:     { P1: 30, P2: 60, P3: 240 },
    jiraAssignee:   'risk-team-lead',
    isCritical:     true,
  },
  'trading-api': {
    onCallTeams:    ['@trading-oncall', '@markets-sre'],
    runbookLabel:   'trading-api',
    slaMinutes:     { P1: 15, P2: 30, P3: 120 },   // Tighter SLA for trading
    jiraAssignee:   'trading-team-lead',
    isCritical:     true,
  },
  'platform': {
    onCallTeams:    ['@platform-oncall'],
    runbookLabel:   'platform',
    slaMinutes:     { P1: 30, P2: 120, P3: 480 },
    jiraAssignee:   'platform-team-lead',
    isCritical:     false,
  },
};

// Default fallback for unknown services
export const DEFAULT_SERVICE = SERVICES['platform'];
