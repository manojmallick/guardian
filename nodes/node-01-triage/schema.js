// nodes/node-01-triage/schema.js
// Input/output JSON schema definitions using Zod

import { z } from 'zod';

export const InputSchema = z.object({
  incident_id:   z.string(),
  service:       z.string(),
  alert: z.object({
    latencyMs:            z.number(),
    errorRate:            z.number(),
    durationMin:          z.number(),
    transactionsAffected: z.number(),
    p95LatencyMs:         z.number().optional(),
    p99LatencyMs:         z.number().optional(),
    errorTypes:           z.array(z.string()).optional(),
    affectedRegions:      z.array(z.string()).optional(),
  }),
  triggered_at:  z.string().datetime(),
  pagerduty_url: z.string().optional(),
  runbook_hint:  z.string().optional(),
});

export const OutputSchema = z.object({
  incident_id:             z.string(),
  service:                 z.string(),
  severity:                z.enum(['P1', 'P2', 'P3']),
  confidence:              z.number().min(0).max(100),
  reasoning:               z.string(),
  isCriticalService:       z.boolean(),
  criticalMultiplierApplied: z.boolean(),
  alert_raw:               z.record(z.unknown()),
  triggered_at:            z.string(),
  triage_completed_at:     z.string(),
  ai_explanation:          z.string().nullable().optional(),
  error:                   z.string().optional(),
});
