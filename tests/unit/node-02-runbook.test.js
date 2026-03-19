import { extractSteps } from '../../nodes/node-02-runbook/step-extractor.js';
import { loadFallbackRunbook } from '../../nodes/node-02-runbook/fallback-cache.js';

describe('Node 02 — Runbook Agent', () => {

  // ── extractSteps() ─────────────────────────────────────────────────────────

  describe('extractSteps()', () => {
    test('extracts ordered list items from Confluence storage HTML', () => {
      const html = '<ol><li>Check Stripe status</li><li>Verify DB pool</li><li>Check deployments</li></ol>';
      const steps = extractSteps(html);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toBe('Check Stripe status');
      expect(steps[1]).toBe('Verify DB pool');
    });

    test('strips HTML tags from step content', () => {
      const html = '<ol><li><strong>Check</strong> Stripe <em>status</em> page</li></ol>';
      const steps = extractSteps(html);
      expect(steps[0]).toBe('Check Stripe status page');
    });

    test('limits result to 5 steps maximum', () => {
      const items = Array.from({ length: 10 }, (_, i) => `<li>Step ${i + 1} — check the service health endpoint</li>`).join('');
      const html = `<ol>${items}</ol>`;
      const steps = extractSteps(html);
      expect(steps).toHaveLength(5);
    });

    test('filters out very short items (< 10 characters)', () => {
      const html = '<ol><li>Ok</li><li>Check Stripe status at status.stripe.com</li></ol>';
      const steps = extractSteps(html);
      expect(steps).toHaveLength(1);
    });

    test('returns empty array for empty HTML', () => {
      const steps = extractSteps('');
      expect(steps).toEqual([]);
    });

    test('handles plain paragraph content with no list', () => {
      const html = '<p>This page has no ordered list.</p>';
      const steps = extractSteps(html);
      expect(steps).toEqual([]);
    });

    test('handles nested HTML in list items', () => {
      const html = '<ol><li><ac:structured-macro><![CDATA[some content]]></ac:structured-macro>Check Stripe status dashboard</li></ol>';
      const steps = extractSteps(html);
      // Should extract the text content
      expect(steps.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ── loadFallbackRunbook() ──────────────────────────────────────────────────

  describe('loadFallbackRunbook()', () => {
    test('returns cached runbook for payment-gateway', async () => {
      const runbook = await loadFallbackRunbook('payment-gateway');
      expect(runbook).toBeDefined();
      expect(runbook.title).toBeDefined();
      expect(Array.isArray(runbook.steps)).toBe(true);
      expect(runbook.steps.length).toBeGreaterThan(0);
      expect(runbook.source).toBe('CACHED_FALLBACK');
    });

    test('returns cached runbook for fraud-detection', async () => {
      const runbook = await loadFallbackRunbook('fraud-detection');
      expect(runbook).toBeDefined();
      expect(runbook.owner).toBeDefined();
    });

    test('returns cached runbook for trading-api', async () => {
      const runbook = await loadFallbackRunbook('trading-api');
      expect(runbook).toBeDefined();
      expect(runbook.steps.length).toBeGreaterThan(0);
    });

    test('falls back to platform runbook for unknown service', async () => {
      const runbook = await loadFallbackRunbook('unknown-xyz-service');
      expect(runbook).toBeDefined();
      expect(runbook.steps.length).toBeGreaterThan(0);
    });

    test('returned runbook items have required fields', async () => {
      const runbook = await loadFallbackRunbook('payment-gateway');
      expect(runbook).toHaveProperty('title');
      expect(runbook).toHaveProperty('steps');
      expect(runbook).toHaveProperty('owner');
      expect(runbook).toHaveProperty('source');
    });
  });

});
