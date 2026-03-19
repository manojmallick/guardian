// scripts/test-node.js
// Run: node scripts/test-node.js --node=01
// Tests a single Guardian node in isolation using mock payloads

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const nodeArg = args.find((a) => a.startsWith('--node='))?.split('=')[1];
const mockArg = args.find((a) => a.startsWith('--mock='))?.split('=')[1];

if (!nodeArg) {
  console.error('Usage: node scripts/test-node.js --node=01 [--mock=payment-gateway-p1]');
  console.error('Nodes: 01, 02, 03, 04, 05');
  process.exit(1);
}

const NODE_MAP = {
  '01': { dir: 'nodes/node-01-triage',     mock: 'mocks/pagerduty/payment-gateway-p1.json' },
  '02': { dir: 'nodes/node-02-runbook',    mock: 'mocks/resolved/triage-output.json'        },
  '03': { dir: 'nodes/node-03-hitl',       mock: 'mocks/resolved/runbook-output.json'       },
  '04': { dir: 'nodes/node-04-warroom',    mock: 'mocks/resolved/hitl-approved.json'        },
  '05': { dir: 'nodes/node-05-narrator',   mock: 'mocks/resolved/full-incident-context.json'},
};

const nodeConfig = NODE_MAP[nodeArg];
if (!nodeConfig) {
  console.error(`❌  Unknown node: ${nodeArg}. Valid: 01, 02, 03, 04, 05`);
  process.exit(1);
}

const mockFile = mockArg
  ? `mocks/${mockArg}.json`
  : nodeConfig.mock;
const mockPath = resolve(__dirname, '..', mockFile);
const input = JSON.parse(readFileSync(mockPath, 'utf-8'));

console.log('\n🛡  Guardian — Node Test Runner\n' + '─'.repeat(50));
console.log(`Node: ${nodeArg} (${nodeConfig.dir})`);
console.log(`Mock: ${mockFile}`);
console.log(`\nInput:\n${JSON.stringify(input, null, 2)}\n`);
console.log('─'.repeat(50));

// Import the node module and run it
const nodePath = resolve(__dirname, '..', nodeConfig.dir, 'index.js');
const nodeModule = await import(nodePath);
const runFn = nodeModule.default ?? nodeModule.run ?? Object.values(nodeModule)[0];

if (typeof runFn !== 'function') {
  console.error('❌  Node module does not export a default function or run()');
  process.exit(1);
}

try {
  const start = Date.now();
  const output = await runFn(input);
  const elapsed = Date.now() - start;

  console.log(`\n✅  Node ${nodeArg} completed in ${elapsed}ms`);
  console.log(`\nOutput:\n${JSON.stringify(output, null, 2)}\n`);
} catch (err) {
  console.error(`\n❌  Node ${nodeArg} threw an error:`);
  console.error(err);
  process.exit(1);
}
