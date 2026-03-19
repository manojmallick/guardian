// nodes/node-04-warroom/oncall-resolver.js
// Resolves service name → on-call Slack user groups

import { SERVICES, DEFAULT_SERVICE } from '../../config/services.js';

export function resolveOnCallTeam(service) {
  return (SERVICES[service] || DEFAULT_SERVICE).onCallTeams;
}
