// nodes/node-04-warroom/schema.js
import { z } from 'zod';

export const OutputSchema = z.object({
  incident_id:          z.string(),
  service:              z.string(),
  severity:             z.enum(['P1', 'P2', 'P3']),
  slack_channel:        z.string(),
  slack_channel_id:     z.string(),
  jira_ticket:          z.string(),
  jira_url:             z.string(),
  oncall_notified:      z.array(z.string()),
  warroom_activated_at: z.string(),
});
