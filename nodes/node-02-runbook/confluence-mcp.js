// nodes/node-02-runbook/confluence-mcp.js
// MCP Gateway Confluence search wrapper
// Credentials are managed by Airia secrets vault — never in this code

import { extractSteps, extractOwner } from './step-extractor.js';
import { loadFallbackRunbook } from './fallback-cache.js';

export async function searchConfluenceRunbooks(service, alertProfile, airiaTools) {
  const searchQuery = `${service} ${alertProfile} runbook incident procedure`;

  try {
    // Airia MCP Gateway handles credentials — zero credentials in this code
    const results = await airiaTools.confluenceMCP.search({
      query:   searchQuery,
      space:   process.env.CONFLUENCE_SPACE_KEY || 'RUNBOOKS',
      limit:   3,
      expand:  ['body.storage', 'metadata.labels', 'version'],
    });

    if (!results || results.length === 0) {
      return await loadFallbackRunbook(service);
    }

    return results.map(page => ({
      title:       page.title,
      url:         page._links?.webui || page.url,
      steps:       extractSteps(page.body?.storage?.value || ''),
      lastUpdated: page.version?.when || new Date().toISOString(),
      owner:       extractOwner(page.metadata?.labels || []),
      source:      'CONFLUENCE_MCP',
    }));

  } catch (err) {
    // MCP unavailable — fall through to cache
    console.warn(`Confluence MCP search failed: ${err.message}. Using fallback cache.`);
    return await loadFallbackRunbook(service);
  }
}
