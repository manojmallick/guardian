# 🛡 Guardian
## AI-Governed Incident Response for Regulated Financial Systems

> Built to prove that agentic AI projects don't have to be in the 40% that fail.

**Airia AI Agents Hackathon 2026 · Track 2: Active Agents**

[![Winning Index](https://img.shields.io/badge/Winning%20Index-9.87%20%2F%2010.0-purple)]()
[![Airia Features](https://img.shields.io/badge/Airia%20Features-16-blue)]()
[![Node.js](https://img.shields.io/badge/Node.js-20-green)]()
[![Regulatory](https://img.shields.io/badge/DORA%20%7C%20SOX-Compliant-orange)]()

---

## What Guardian Does

When a payment gateway degrades at 2:47 AM, Guardian handles the entire incident response in under 10 seconds:

| Step | Guardian Action | Time |
|------|----------------|------|
| PagerDuty alert fires | Node 01 classifies severity (P1/P2/P3) using deterministic logic + AI reasoning | +3s |
| Severity determined | Node 02 retrieves relevant runbook from Confluence via MCP Gateway | +5s |
| Runbook retrieved | Node 03 sends interactive Slack approval request (Airia MCP Apps) | +7s |
| Engineer approves | Node 04 creates war room channel + Jira ticket in parallel | +11s |
| Incident resolved | Node 05 generates post-mortem PDF with full AI decision audit trail | async |

**Zero manual coordination. Full DORA Article 11 + SOX Section 404 compliance record. Automatically.**

---

## Architecture

```
PagerDuty → [Triage Sentinel] → [Runbook Agent] → [HITL Gate] → [War Room] → [Compliance Narrator]
               Node.js + AI        Confluence MCP    MCP Apps      Slack+Jira    PDF + Governance
```

## Tech Stack

- **Platform:** Airia Agent Studio (16 features used)
- **Language:** Node.js 20 (ESM)
- **Integrations:** PagerDuty, Confluence, Slack, Jira
- **Regulatory:** DORA Article 11, SOX Section 404, EU AI Act
- **Airia Features:** Webhook, Code Block, AI Model, Knowledge Graph, MCP Gateway, MCP Apps, HITL, Nested Agents, Document Generator, Governance Dashboard, Compliance Automation, Community (×3), + more

## Community Modules

Fork any of these for your own use:

| Module | Description | Fork For |
|--------|-------------|----------|
| [Triage Sentinel](https://community.airia.com/agents/triage-sentinel) | Universal alert classification | Any alerting tool |
| [War Room Coordinator](https://community.airia.com/agents/warroom-coordinator) | Slack + Jira war room in 4s | Any SRE team |
| [Compliance Narrator](https://community.airia.com/agents/compliance-narrator) | AI audit trail PDF | Any regulated industry |

## Setup

```bash
git clone https://github.com/manojmallick/guardian
cd guardian
cp .env.example .env        # Fill in your credentials
npm install
node scripts/setup.js       # Verify all connections (Day 1 gate check)
node scripts/seed-confluence.js  # Create Confluence runbook pages
npm run demo                # Trigger a test alert end-to-end
```

## Built By

**Manoj Mallick** — Solution Architect, 15+ years fintech  
LearnHubPlay BV · Amsterdam, Netherlands
