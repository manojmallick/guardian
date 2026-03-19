// nodes/node-02-runbook/fallback-cache.js
// Fallback runbook cache — loaded from Airia Knowledge Base when MCP Gateway is unavailable

export const RUNBOOK_CACHE = {
  'payment-gateway': {
    title: 'Payment Gateway Emergency Runbook (Cached)',
    steps: [
      'Check Stripe API status dashboard at status.stripe.com',
      'Verify DB connection pool utilization in Datadog',
      'Check for recent deployments in last 2 hours via GitHub Actions',
      'Restart connection pool on payment-db-01 if DB connections > 80%',
      'Escalate to payments team lead if not resolved in 10 minutes',
    ],
    url: 'CACHED_FALLBACK',
    owner: 'payments-oncall',
    lastUpdated: '2026-02-15T09:30:00Z',
  },
  'fraud-detection': {
    title: 'Fraud Detection Emergency Runbook (Cached)',
    steps: [
      'Check fraud scoring service health endpoint',
      'Verify ML model serving latency in monitoring dashboard',
      'Check recent model deployments or rule changes',
      'Scale up fraud detection pods if CPU > 80%',
      'Escalate to risk team lead if degradation persists beyond 5 minutes',
    ],
    url: 'CACHED_FALLBACK',
    owner: 'risk-oncall',
    lastUpdated: '2026-02-15T09:30:00Z',
  },
  'trading-api': {
    title: 'Trading API Emergency Runbook (Cached)',
    steps: [
      'Check market data feed connectivity',
      'Verify order routing service health',
      'Check for exchange connectivity issues',
      'Review recent configuration changes',
      'Immediately escalate to trading-oncall if any order execution is impacted',
    ],
    url: 'CACHED_FALLBACK',
    owner: 'trading-oncall',
    lastUpdated: '2026-02-15T09:30:00Z',
  },
  'platform': {
    title: 'Platform General Incident Runbook (Cached)',
    steps: [
      'Check platform health dashboard for service status',
      'Review recent deployments and infrastructure changes',
      'Check resource utilization (CPU, memory, disk) across affected nodes',
      'Review application logs for error patterns',
      'Escalate to platform-oncall with collected diagnostic information',
    ],
    url: 'CACHED_FALLBACK',
    owner: 'platform-oncall',
    lastUpdated: '2026-02-15T09:30:00Z',
  },
};

export async function loadFallbackRunbook(service) {
  const fallback = RUNBOOK_CACHE[service] || RUNBOOK_CACHE['platform'];
  return { ...fallback, source: 'CACHED_FALLBACK' };
}
