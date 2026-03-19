# Guardian — Architecture Reference

## Overview

Guardian is a five-node AI agent pipeline built on the Airia platform. All five nodes are **Python 3 code blocks** running inside Airia Agent Studio (`airia-ready/`). It eliminates the 8–12 minutes of manual coordination overhead at the start of every financial services production incident, and simultaneously produces the compliance audit trail required by DORA Article 11 and SOX Section 404.

## Pipeline Diagram

```mermaid
flowchart TD
    PD["🚨 PagerDuty Alert\nWebhook POST"]

    subgraph N01["Node 01 — Triage Sentinel · node_01_triage.py"]
        direction TB
        N01A["Deterministic P1/P2/P3 Classification\n(latency · error rate · duration · transactions)"]
        N01B["Claude 3.5 Sonnet — AI Reasoning\n(explains decision in plain English)"]
        N01A --> N01B
    end

    subgraph N02["Node 02 — Runbook Agent · node_02_runbook.py"]
        direction TB
        N02A["Airia Knowledge Graph\n(semantic search across Confluence space)"]
        N02B["MCP Gateway → Atlassian Confluence\n(fetches runbook title · URL · top 3 steps)"]
        N02A --> N02B
    end

    subgraph N03["Node 03 — HITL Gate · node_03_hitl.py"]
        direction TB
        N03A["Slack Block Kit Approval Card\n(severity · reasoning · runbook steps · SLA)"]
        N03B["Airia HITL Node\n(waits for human Approve / Reject)"]
        N03C["DORA Article 11 ✅\n(approver identity + timestamp recorded)"]
        N03A --> N03B --> N03C
    end

    subgraph N04["Node 04 — War Room Coordinator · node_04_warroom.py"]
        direction LR
        N04A["Slack Channels API\n#inc-ID-service created\non-call team notified"]
        N04B["Jira REST API\nINC ticket created\nPriority: Highest / High"]
    end

    subgraph N05["Node 05 — Compliance Narrator · node_05_narrator.py"]
        direction TB
        N05A["DORA / SOX Audit Timeline\n(Node 01→05 decisions · approver · timestamps)"]
        N05B["Governance Entry\nGOV-INC-ID-DATE"]
        N05C["compliance_status: DORA_SOX_COMPLIANT"]
        N05A --> N05B --> N05C
    end

    SLACK["💬 Slack\n#inc-* war room"]
    JIRA["📋 Jira\nINC ticket"]
    GOV["📊 Airia Governance\nDashboard + Post-mortem"]

    PD --> N01
    N01 -->|"severity · confidence · reasoning"| N02
    N02 -->|"+ runbook title · steps · URL"| N03
    N03 -->|"+ hitl.decision · approver · approved_at"| N04
    N04 -->|"+ slack_channel_url · jira_ticket"| N05
    N04 --> SLACK
    N04 --> JIRA
    N05 --> GOV

    style N01 fill:#1e3a5f,color:#fff,stroke:#4a9eff
    style N02 fill:#1e3a5f,color:#fff,stroke:#4a9eff
    style N03 fill:#5f1e1e,color:#fff,stroke:#ff4a4a
    style N04 fill:#1e4f3a,color:#fff,stroke:#4aff9e
    style N05 fill:#3a1e5f,color:#fff,stroke:#c44aff
    style PD fill:#e63946,color:#fff,stroke:#c1121f
    style SLACK fill:#4a154b,color:#fff,stroke:#e01e5a
    style JIRA fill:#0052cc,color:#fff,stroke:#003d99
    style GOV fill:#2d1b69,color:#fff,stroke:#6b3fa0
```

## Airia Features Used (All 16)

| # | Feature | Node | Purpose |
|---|---------|------|---------|
| 01 | Webhook Trigger | 01 | Receives PagerDuty alert webhook |
| 02 | Python Code Block | 01–05 | All pipeline logic — deterministic classification, API calls, audit trail |
| 03 | AI Model Call | 01, 05 | Reasoning explanation + root cause analysis |
| 04 | Structured Output | All | Type-safe JSON between nodes |
| 05 | Agent Variables | All | Context propagated through pipeline |
| 06 | Knowledge Graph | 02 | Semantic search across Confluence runbooks |
| 07 | MCP Gateway | 02, 04 | Atlassian Confluence + Jira + Slack (zero credentials) |
| 08 | MCP Apps | 03 | Interactive Slack approval buttons (Feb 2026) |
| 09 | Human-in-the-Loop | 03 | Mandatory DORA compliance checkpoint |
| 10 | Nested Agents | 04 | Slack + Jira sub-agents run in parallel |
| 11 | Slack Bot Deployment | 03, 04 | War room + HITL message channel |
| 12 | API Endpoint | 01 | Production-grade webhook receiver |
| 13 | Document Generator | 05 | Post-mortem PDF |
| 14 | Governance Dashboard | 05 | AI decision audit trail |
| 15 | Compliance Automation | 05 | DORA/SOX record generation |
| 16 | Community (×3) | All | Triage Sentinel, War Room, Compliance Narrator |

## Data Flow — Key Payloads

### Node 01 → Node 02
```json
{
  "incident_id": "INC-4471",
  "service": "payment-gateway",
  "severity": "P1",
  "confidence": 94,
  "reasoning": "Matched 4 of 4 P1 criteria. Critical service multiplier: true.",
  "ai_explanation": "...",
  "alert_raw": { "latencyMs": 847, "errorRate": 0.23, ... },
  "triggered_at": "...",
  "triage_completed_at": "..."
}
```

### Node 02 → Node 03
All Node 01 fields plus:
```json
{
  "runbooks": [{ "title": "...", "url": "...", "steps": [...], "owner": "payments-oncall" }],
  "runbook_retrieved_at": "..."
}
```

### Node 03 → Node 04
All Node 02 fields plus:
```json
{
  "hitl": {
    "decision": "approved",
    "approver": "U0123456789",
    "approver_name": "Jane Smith",
    "approved_at": "...",
    "response_time_seconds": 109
  }
}
```

### Node 04 → Node 05 (on resolution)
All Node 03 fields plus:
```json
{
  "slack_channel": "https://...",
  "slack_channel_id": "C123456",
  "jira_ticket": "INC-4471",
  "jira_url": "https://...",
  "oncall_notified": ["@payments-oncall", "@sre-lead"],
  "warroom_activated_at": "...",
  "resolved_at": "...",
  "sla_breached": false
}
```

## Severity Classification Logic

```
P1 (≥2 of 4 criteria):
  latencyMs ≥ 800    errorRate ≥ 0.15
  durationMin ≥ 3    transactionsAffected ≥ 1000

P2 (≥2 of 3 criteria):
  latencyMs ≥ 400    errorRate ≥ 0.05
  durationMin ≥ 5

P3: Everything else

Critical services (payment-gateway, fraud-detection, trading-api):
  All P1 thresholds × 0.8 (fires earlier)
```

## Security Design

- **Zero credentials in code** — All MCP Gateway connections store secrets in the Airia secrets vault
- **Deterministic-first AI** — The Node.js algorithm decides severity; the AI explains it. AI cannot override thresholds.
- **HITL as circuit breaker** — No automated action (Slack, Jira, PagerDuty pages) executes without human approval
- **Input validation** — All node inputs validated with Zod schemas before processing
- **Audit trail** — Every AI decision logged with model name, input, output, and confidence in Governance Dashboard

## Regulatory Compliance

| Framework | Requirement | Guardian Implementation |
|-----------|-------------|------------------------|
| DORA Art. 11 | ICT incident detection and classification | Node 01 deterministic algorithm + AI reasoning |
| DORA Art. 11 | Human oversight of AI recommendations | Node 03 HITL gate — mandatory approval |
| DORA Art. 11 | Incident timeline documentation | Node 05 post-mortem Section 2 |
| DORA Art. 11 | AI decision explainability | Node 05 Section 3 AI Decision Audit |
| SOX Sec. 404 | IT general controls documentation | Node 05 Section 4 compliance record |
| EU AI Act | AI system transparency | Governance Dashboard + full audit trail |
