// sub-agents/slack-warroom-subagent/schema.js
import { z } from 'zod';

export const InputSchema = z.object({
  channel_name:  z.string(),
  incident_id:   z.string(),
  service:       z.string(),
  severity:      z.enum(['P1', 'P2', 'P3']),
  ai_summary:    z.string(),
  runbook_url:   z.string().optional(),
  runbook_steps: z.array(z.string()).optional(),
  oncall_team:   z.array(z.string()),
  approver:      z.string(),
  approved_at:   z.string(),
  alert_raw:     z.record(z.unknown()).optional(),
  confidence:    z.number(),
});

export const OutputSchema = z.object({
  channel_id:   z.string(),
  channel_url:  z.string(),
  message_ts:   z.string(),
  created_at:   z.string(),
});
