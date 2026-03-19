// scripts/setup.js
// Run: node scripts/setup.js
// Verifies all accounts, connections, and compatibility before building

import 'dotenv/config';

const checks = [
  {
    name: 'GATE 1: Node.js version',
    check: () => {
      const version = parseInt(process.version.slice(1));
      if (version < 20) throw new Error(`Node.js 20+ required. Current: ${process.version}`);
      return `Node.js ${process.version} ✓`;
    },
  },
  {
    name: 'GATE 2: Environment variables present',
    check: () => {
      const required = [
        'AIRIA_API_KEY',
        'PAGERDUTY_API_TOKEN',
        'CONFLUENCE_API_TOKEN',
        'JIRA_API_TOKEN',
        'SLACK_BOT_TOKEN',
      ];
      const missing = required.filter((k) => !process.env[k]);
      if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);
      return `All ${required.length} env vars present ✓`;
    },
  },
  {
    name: 'GATE 3: Airia credentials present',
    check: () => {
      const key = process.env.AIRIA_API_KEY || '';
      if (!key.startsWith('ak-')) throw new Error('AIRIA_API_KEY must start with ak-');
      if (key.length < 20) throw new Error('AIRIA_API_KEY looks too short');
      const wsId = process.env.AIRIA_WORKSPACE_ID || '';
      if (!wsId.match(/^[0-9a-f-]{36}$/)) throw new Error('AIRIA_WORKSPACE_ID must be a UUID');
      return `Airia key present (${key.slice(0, 10)}...) workspace=${wsId.slice(0, 8)}... ✓`;
    },
  },
  {
    name: 'GATE 4: Confluence API reachable',
    check: async () => {
      const credentials = Buffer.from(
        `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
      ).toString('base64');
      const res = await fetch(
        `${process.env.CONFLUENCE_BASE_URL}/rest/api/space/${process.env.CONFLUENCE_SPACE_KEY}`,
        { headers: { Authorization: `Basic ${credentials}` } }
      );
      if (!res.ok) {
        throw new Error(
          `Confluence returned ${res.status} — check ${process.env.CONFLUENCE_SPACE_KEY} space exists`
        );
      }
      return `Confluence ${process.env.CONFLUENCE_SPACE_KEY} space accessible ✓`;
    },
  },
  {
    name: 'GATE 5: Slack bot token valid',
    check: async () => {
      const res = await fetch('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
      });
      const data = await res.json();
      if (!data.ok) throw new Error(`Slack auth failed: ${data.error}`);
      return `Slack bot authenticated as ${data.bot_id} ✓`;
    },
  },
  {
    name: 'GATE 6: Jira project accessible',
    check: async () => {
      const credentials = Buffer.from(
        `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
      ).toString('base64');
      const res = await fetch(
        `${process.env.JIRA_BASE_URL}/rest/api/3/project/${process.env.JIRA_PROJECT_KEY}`,
        { headers: { Authorization: `Basic ${credentials}` } }
      );
      if (!res.ok) {
        throw new Error(
          `Jira project ${process.env.JIRA_PROJECT_KEY} returned ${res.status}`
        );
      }
      return `Jira project ${process.env.JIRA_PROJECT_KEY} accessible ✓`;
    },
  },
];

console.log('\n🛡  Guardian — Day 1 Setup Verification\n' + '─'.repeat(50));

let allPassed = true;
for (const { name, check } of checks) {
  try {
    const result = await check();
    console.log(`✅  ${name}\n    ${result}`);
  } catch (err) {
    console.log(`❌  ${name}\n    ERROR: ${err.message}`);
    allPassed = false;
  }
}

console.log('\n' + '─'.repeat(50));
if (allPassed) {
  console.log('🚀  All gates passed. Guardian is ready to build.\n');
} else {
  console.log('⚠️   Some gates failed. Fix the above before building.\n');
  process.exit(1);
}
