// nodes/node-03-hitl/schema.js
import { z } from 'zod';

const HITLSchema = z.object({
  decision:             z.enum(['approved', 'escalated', 'rejected', 'AUTO_ESCALATED']),
  approver:             z.string(),
  approver_name:        z.string(),
  approved_at:          z.string(),
  response_time_seconds: z.number(),
  timeout_flag:         z.boolean().optional(),
});

export const OutputSchema = z.object({
  incident_id:          z.string(),
  service:              z.string(),
  severity:             z.enum(['P1', 'P2', 'P3']),
  confidence:           z.number(),
  runbooks:             z.array(z.record(z.unknown())),
  ai_explanation:       z.string().nullable().optional(),
  hitl:                 HITLSchema,
});
