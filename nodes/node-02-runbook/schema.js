// nodes/node-02-runbook/schema.js
// Input/output JSON schema definitions using Zod

import { z } from 'zod';

const RunbookSchema = z.object({
  title:       z.string(),
  url:         z.string(),
  steps:       z.array(z.string()),
  lastUpdated: z.string(),
  owner:       z.string(),
  source:      z.string().optional(),
});

export const InputSchema = z.object({
  incident_id:          z.string(),
  service:              z.string(),
  severity:             z.enum(['P1', 'P2', 'P3']),
  confidence:           z.number(),
  reasoning:            z.string(),
  isCriticalService:    z.boolean(),
  alert_raw:            z.record(z.unknown()),
  triggered_at:         z.string(),
  triage_completed_at:  z.string(),
  ai_explanation:       z.string().nullable().optional(),
});

export const OutputSchema = InputSchema.extend({
  runbooks:             z.array(RunbookSchema),
  runbook_retrieved_at: z.string(),
});
