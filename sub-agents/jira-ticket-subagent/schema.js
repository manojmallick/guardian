// sub-agents/jira-ticket-subagent/schema.js
import { z } from 'zod';

export const InputSchema = z.object({
  incident_id:  z.string(),
  service:      z.string(),
  severity:     z.enum(['P1', 'P2', 'P3']),
  summary:      z.string(),
  description:  z.string(),
  priority:     z.string().optional(),
  labels:       z.array(z.string()).optional(),
  assignee:     z.string().optional(),
  runbook_url:  z.string().optional(),
  approver:     z.string().optional(),
  triggered_at: z.string().optional(),
});

export const OutputSchema = z.object({
  ticket_id:   z.string(),
  ticket_url:  z.string(),
  created_at:  z.string(),
});
