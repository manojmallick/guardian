// nodes/node-05-narrator/schema.js
import { z } from 'zod';

export const OutputSchema = z.object({
  incident_id:         z.string(),
  postmortem_pdf_url:  z.string(),
  governance_entry:    z.string(),
  compliance_status:   z.literal('DORA_SOX_COMPLIANT'),
  generated_at:        z.string(),
});
