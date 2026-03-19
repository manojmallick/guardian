// scripts/generate-postmortem.js
// Run: node scripts/generate-postmortem.js [--incident=INC-4471]
// Manually triggers Node 05 (Compliance Narrator) with a resolved incident mock

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const incidentArg = args.find((a) => a.startsWith('--incident='))?.split('=')[1];
const liveArg = args.includes('--live');

// Load mock resolved context (default) or accept custom path
const contextPath = resolve(__dirname, '..', 'mocks/resolved/full-incident-context.json');
const context = JSON.parse(readFileSync(contextPath, 'utf-8'));

if (incidentArg) {
  context.incident_id = incidentArg;
}

// Add resolution timestamp if not present
if (!context.resolved_at) {
  context.resolved_at = new Date().toISOString();
}

console.log('\n🛡  Guardian — Post-Mortem Generator\n' + '─'.repeat(50));
console.log(`Incident: ${context.incident_id}`);
console.log(`Service:  ${context.service}`);
console.log(`Severity: ${context.severity}`);
console.log(`Mode:     ${liveArg ? 'LIVE (calls Airia Document Generator)' : 'MOCK (local only)'}\n`);

let airiaTools;
if (liveArg) {
  // Live mode — calls actual Airia Document Generator via API
  const apiKey = process.env.AIRIA_API_KEY;
  const workspaceId = process.env.AIRIA_WORKSPACE_ID;
  if (!apiKey || !workspaceId) {
    console.error('❌  AIRIA_API_KEY and AIRIA_WORKSPACE_ID required for live mode');
    process.exit(1);
  }

  airiaTools = {
    documentGenerator: {
      render: async (doc, opts) => {
        const res = await fetch(
          `https://api.airia.com/v1/workspaces/${workspaceId}/documents/render`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ document: doc, format: opts.format }),
          }
        );
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Document Generator returned ${res.status}: ${err}`);
        }
        return res.json();
      },
    },
    aiModel: {
      summarize: async () => 'AI-generated summary of the incident timeline.',
      analyzeRootCause: async () => ({
        root_cause: context.root_cause_notes ?? 'Root cause under investigation.',
        recommendations: ['Conduct blameless post-mortem', 'Add monitoring for similar patterns'],
        prevention_actions: ['Update runbook with findings', 'Review deployment process'],
      }),
    },
  };
} else {
  // Mock mode — generates local JSON output only
  airiaTools = {
    documentGenerator: {
      render: async (doc) => {
        console.log('\n[MOCK] Post-Mortem Document Structure:');
        console.log(JSON.stringify(doc, null, 2));
        return {
          url: `file://mock-postmortem-${context.incident_id}.pdf`,
          governance_id: `GOV-${context.incident_id}`,
        };
      },
    },
    aiModel: {
      summarize: async () => '[MOCK SUMMARY] Incident resolved after 35 minutes. SLA maintained.',
      analyzeRootCause: async () => ({
        root_cause: context.root_cause_notes ?? '[MOCK] Root cause pending.',
        recommendations: ['Add slow-query monitoring', 'Increase connection pool thresholds'],
        prevention_actions: ['Mandatory load test before deployment', 'DB migration dry-run'],
      }),
    },
  };
}

const { default: narratorNode } = await import('../nodes/node-05-narrator/index.js');

try {
  const result = await narratorNode(context, airiaTools);
  console.log('\n✅  Post-mortem generated successfully:\n');
  console.log(`  PDF URL:         ${result.postmortem_pdf_url}`);
  console.log(`  Governance ID:   ${result.governance_entry}`);
  console.log(`  Compliance:      ${result.compliance_status}`);
  console.log(`  Generated at:    ${result.generated_at}\n`);
} catch (err) {
  console.error('❌  Post-mortem generation failed:');
  console.error(err);
  process.exit(1);
}
