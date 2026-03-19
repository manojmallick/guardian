// config/airia.js
// Airia platform configuration — API base URLs, model names, feature flags

export const AIRIA_CONFIG = {
  apiBaseUrl:        'https://api.airia.com/v1',
  webhookBasePath:   '/webhooks',
  endpointPath:      '/guardian-triage',
  defaultModel:      process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
  maxTokens:         parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
  temperature:       parseFloat(process.env.AI_TEMPERATURE || '0.1'),

  features: {
    mcpApps:             true,
    knowledgeGraph:      true,
    governanceDashboard: true,
    complianceAutomation: true,
    hitlNode:            true,
    nestedAgents:        true,
  },

  hitl: {
    timeoutMinutes:  parseInt(process.env.HITL_TIMEOUT_MINUTES || '15', 10),
    timeoutAction:   'auto_escalate',
    channel:         process.env.SLACK_ONCALL_CHANNEL || '#sre-oncall',
  },
};
