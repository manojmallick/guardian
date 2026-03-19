// nodes/node-02-runbook/step-extractor.js
// Parses Confluence HTML storage format into clean step arrays

export function extractSteps(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') return [];

  // Parse numbered list items from Confluence storage format
  const listItemRegex = /<li>(.*?)<\/li>/gs;
  const steps = [];
  let match;
  while ((match = listItemRegex.exec(htmlContent)) !== null) {
    const cleanStep = match[1].replace(/<[^>]*>/g, '').trim();
    if (cleanStep.length > 10) steps.push(cleanStep);
  }
  return steps.slice(0, 5); // Top 5 steps only
}

export function extractOwner(labels = []) {
  const ownerLabel = labels.find(l => l.prefix === 'owner' || l.name?.startsWith('owner:'));
  if (!ownerLabel) return 'platform-oncall';
  return ownerLabel.name?.replace('owner:', '') || ownerLabel.name || 'platform-oncall';
}
