// scripts/seed-confluence.js
// Run: node scripts/seed-confluence.js
// Creates all 4 runbook pages (+ 1 general platform runbook) in the Confluence RUNBOOKS space

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL     = process.env.CONFLUENCE_BASE_URL;
const SPACE_KEY    = process.env.CONFLUENCE_SPACE_KEY ?? 'RUNBOOKS';
const EMAIL        = process.env.CONFLUENCE_EMAIL;
const TOKEN        = process.env.CONFLUENCE_API_TOKEN;
const CREDENTIALS  = Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

const RUNBOOKS = [
  { slug: 'payment-gateway-latency',    file: 'docs/runbooks/payment-gateway-latency.md'  },
  { slug: 'payment-gateway-outage',     file: 'docs/runbooks/payment-gateway-outage.md'   },
  { slug: 'fraud-detection-degradation',file: 'docs/runbooks/fraud-detection-degradation.md' },
  { slug: 'trading-api-latency',        file: 'docs/runbooks/trading-api-latency.md'      },
  { slug: 'platform-general-incident',  file: 'docs/runbooks/platform-general-incident.md'},
];

async function confluenceRequest(method, path, body) {
  const res = await fetch(`${BASE_URL}/rest/api${path}`, {
    method,
    headers: {
      Authorization: `Basic ${CREDENTIALS}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Confluence ${method} ${path} returned ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function getSpaceHomePage() {
  const data = await confluenceRequest('GET', `/space/${SPACE_KEY}?expand=homepage`);
  return data.homepage.id;
}

function markdownToConfluenceStorage(markdown) {
  // Minimal markdown → Confluence storage format conversion for runbook pages
  let html = markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/^- (.+)$/gm, '<li>$2</li>')
    .replace(/```bash\n([\s\S]+?)```/g, '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[$1]]></ac:plain-text-body></ac:structured-macro>')
    .replace(/\n\n/g, '</p><p>')
    .trim();

  // Wrap consecutive <li> elements in <ol> or <ul>
  html = html.replace(/((<li>.*<\/li>\n?)+)/g, '<ol>$1</ol>');

  return `<p>${html}</p>`;
}

console.log('\n🛡  Guardian — Confluence Runbook Seeder\n' + '─'.repeat(50));
console.log(`Space: ${SPACE_KEY} at ${BASE_URL}\n`);

let parentId;
try {
  parentId = await getSpaceHomePage();
  console.log(`✅  Found space home page (id: ${parentId})\n`);
} catch (err) {
  console.error(`❌  Could not get space home page: ${err.message}`);
  process.exit(1);
}

for (const runbook of RUNBOOKS) {
  const mdPath = resolve(__dirname, '..', runbook.file);
  let markdown;
  try {
    markdown = readFileSync(mdPath, 'utf-8');
  } catch {
    console.error(`❌  Could not read ${runbook.file} — has docs/runbooks/ been created?`);
    continue;
  }

  const title = markdown.match(/^# (.+)$/m)?.[1] ?? runbook.slug;
  const storageContent = markdownToConfluenceStorage(markdown);

  // Extract service label from slug
  const serviceLabel = runbook.slug.split('-').slice(0, 2).join('-');

  try {
    const page = await confluenceRequest('POST', '/content', {
      type:  'page',
      title,
      space: { key: SPACE_KEY },
      ancestors: [{ id: parentId }],
      body: {
        storage: {
          value:          storageContent,
          representation: 'storage',
        },
      },
      metadata: {
        labels: [
          { prefix: 'global', name: `service:${serviceLabel}` },
          { prefix: 'global', name: 'type:runbook'             },
          { prefix: 'global', name: 'guardian-indexed'         },
        ],
      },
    });
    console.log(`✅  Created: "${title}" (id: ${page.id})`);
  } catch (err) {
    console.error(`❌  Failed to create "${title}": ${err.message}`);
  }
}

console.log('\n' + '─'.repeat(50));
console.log('✅  Confluence seeding complete. Run seed-knowledge-graph.js next.\n');
