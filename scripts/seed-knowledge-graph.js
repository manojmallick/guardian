// scripts/seed-knowledge-graph.js
// Run: node scripts/seed-knowledge-graph.js
// Triggers Airia Knowledge Graph re-indexing for the RUNBOOKS Confluence space

import 'dotenv/config';

const AIRIA_API_KEY    = process.env.AIRIA_API_KEY;
const AIRIA_WORKSPACE  = process.env.AIRIA_WORKSPACE_ID;
const KG_NAME          = 'guardian-runbooks-kg';

if (!AIRIA_API_KEY || !AIRIA_WORKSPACE) {
  console.error('❌  AIRIA_API_KEY and AIRIA_WORKSPACE_ID must be set in .env');
  process.exit(1);
}

async function airiaRequest(method, path, body) {
  const res = await fetch(`https://api.airia.com/v1/workspaces/${AIRIA_WORKSPACE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${AIRIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Airia API ${method} ${path} returned ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

console.log('\n🛡  Guardian — Knowledge Graph Indexer\n' + '─'.repeat(50));
console.log(`Workspace: ${AIRIA_WORKSPACE}`);
console.log(`KG Name:   ${KG_NAME}\n`);

// Step 1: Find the knowledge graph by name
let kg;
try {
  const graphs = await airiaRequest('GET', '/knowledge-graphs');
  kg = graphs.items?.find((g) => g.name === KG_NAME);
  if (!kg) {
    console.error(`❌  Knowledge Graph "${KG_NAME}" not found. Create it in Airia Studio first.`);
    console.log('    Airia Studio → Knowledge → New Knowledge Graph → Name: guardian-runbooks-kg');
    process.exit(1);
  }
  console.log(`✅  Found Knowledge Graph: ${kg.name} (id: ${kg.id})`);
} catch (err) {
  console.error(`❌  Could not list knowledge graphs: ${err.message}`);
  process.exit(1);
}

// Step 2: Trigger re-indexing
try {
  const job = await airiaRequest('POST', `/knowledge-graphs/${kg.id}/index`, {
    source:     'confluence',
    space_key:  process.env.CONFLUENCE_SPACE_KEY ?? 'RUNBOOKS',
    label_filter: 'guardian-indexed',
  });
  console.log(`✅  Indexing job started: ${job.job_id ?? 'queued'}`);
  console.log('    Indexing typically takes 2–5 minutes for a small space.');
  console.log('    Check progress in Airia Studio → Knowledge → guardian-runbooks-kg → Index Status\n');
} catch (err) {
  console.error(`❌  Could not trigger indexing: ${err.message}`);
  console.log('    Manually re-index in Airia Studio → Knowledge → guardian-runbooks-kg → Re-index\n');
}

console.log('─'.repeat(50));
console.log('🚀  Knowledge Graph seeding initiated. Guardian Node 02 is ready.\n');
