# Guardian — Airia Studio Setup Guide

This guide walks you through building the 5-node Guardian pipeline in Airia Studio
using the Python Code Block files in this directory.

---

## Files in this directory

| File | Node | Description |
|---|---|---|
| `node_01_triage.py`  | Node 01 | Classifies PagerDuty alert → P1/P2/P3 (pure Python, no API) |
| `node_02_runbook.py` | Node 02 | Fetches Confluence runbook, falls back to cache |
| `node_03_hitl.py`    | Node 03 | Posts Slack approval message, returns HITL decision |
| `node_04_warroom.py` | Node 04 | Creates Slack channel + Jira ticket |
| `node_05_narrator.py`| Node 05 | Builds DORA/SOX post-mortem compliance record |

---

## Step 1 — Add secrets to Airia Vault

In Airia Studio → **Settings → Secrets**, add:

| Secret name | Value |
|---|---|
| `CONFLUENCE_BASE_URL`  | `https://mmallick1990.atlassian.net/wiki` |
| `CONFLUENCE_EMAIL`     | `mmallick1990@gmail.com` |
| `CONFLUENCE_API_TOKEN` | *(your Atlassian API token)* |
| `CONFLUENCE_SPACE_KEY` | `RUNBOOKS` |
| `JIRA_BASE_URL`        | `https://mmallick1990.atlassian.net` |
| `JIRA_EMAIL`           | `mmallick1990@gmail.com` |
| `JIRA_API_TOKEN`       | *(your Atlassian API token)* |
| `JIRA_PROJECT_KEY`     | `INC` |
| `SLACK_BOT_TOKEN`      | `xoxb-...` |
| `SLACK_ONCALL_CHANNEL` | `C0AM7P3AEBH` |
| `SLACK_WORKSPACE_ID`   | `T0AMKMGMH5K` |

---

## Step 2 — Create pipeline in Airia Studio

Create a new pipeline called **Guardian** and add 5 Python Code Block nodes:

### Node 01 — Triage Sentinel
1. Add a **Python Code Block** node
2. Name it `01 - Triage Sentinel`
3. Paste the entire contents of `node_01_triage.py`
4. **Input:** Pipeline trigger / webhook payload (set as `input`)

### Node 02 — Runbook Agent
1. Add a **Python Code Block** node
2. Name it `02 - Runbook Agent`
3. Paste the entire contents of `node_02_runbook.py`
4. Connect output of Node 01 → input of Node 02

### Node 03 — HITL Gate
1. Add a **Python Code Block** node
2. Name it `03 - HITL Gate`
3. Paste the entire contents of `node_03_hitl.py`
4. Connect output of Node 02 → input of Node 03
5. **For demo:** `AUTO_APPROVE = True` (line 28) — posts Slack message and auto-continues
6. **For production:** Set `AUTO_APPROVE = False` and connect to an Airia HITL node

### Node 04 — War Room Coordinator
1. Add a **Python Code Block** node
2. Name it `04 - War Room Coordinator`
3. Paste the entire contents of `node_04_warroom.py`
4. Connect output of Node 03 → input of Node 04

### Node 05 — Compliance Narrator
1. Add a **Python Code Block** node
2. Name it `05 - Compliance Narrator`
3. Paste the entire contents of `node_05_narrator.py`
4. Connect output of Node 04 → input of Node 05
5. *(Optional)* Connect an **AI Model** node before Node 05 to generate
   root cause analysis; pass its output as `input.ai_generated_summary`

---

## Step 3 — Set the pipeline trigger

Configure the pipeline entry point to accept this JSON payload shape:

```json
{
  "incident_id": "INC-4471",
  "service":     "payment-gateway",
  "alert": {
    "latencyMs":             847,
    "errorRate":             0.23,
    "durationMin":           4,
    "transactionsAffected":  3400,
    "p95LatencyMs":          1240,
    "p99LatencyMs":          2100,
    "errorTypes":            ["timeout", "connection_refused"],
    "affectedRegions":       ["eu-west-1", "eu-central-1"]
  },
  "triggered_at":   "2026-03-15T02:47:13Z",
  "pagerduty_url":  "https://yourcompany.pagerduty.com/incidents/INC-4471",
  "runbook_hint":   "payment-gateway-latency"
}
```

---

## Step 4 — Test in Airia Studio

Click **Run** with the payload above. Expected pipeline outputs:

| Node | Key output |
|---|---|
| Node 01 | `severity: "P1"`, `confidence: 100` |
| Node 02 | `runbooks[0].title: "Payment Gateway Emergency Runbook"` |
| Node 03 | `hitl.decision: "APPROVED"`, Slack message posted ✅ |
| Node 04 | `slack_channel: https://guardian-vvd5824.slack.com/channels/...`, `jira_ticket: INC-XXXX` ✅ |
| Node 05 | `compliance_status: "DORA_SOX_COMPLIANT"` ✅ |

---

## Demo scenarios

Run with different payloads to show the full range:

**Payment Gateway P1 (highest impact):**
```json
{ "incident_id": "INC-4471", "service": "payment-gateway", "alert": { "latencyMs": 847, "errorRate": 0.23, "durationMin": 4, "transactionsAffected": 3400 } }
```

**Fraud Detection P1:**
```json
{ "incident_id": "INC-4472", "service": "fraud-detection", "alert": { "latencyMs": 650, "errorRate": 0.18, "durationMin": 6, "transactionsAffected": 1500 } }
```

**Platform P2 (below critical threshold):**
```json
{ "incident_id": "INC-4473", "service": "platform", "alert": { "latencyMs": 450, "errorRate": 0.07, "durationMin": 8, "transactionsAffected": 200 } }
```

---

## Local fallback

The original Node.js pipeline still works for offline demo:
```bash
node scripts/trigger-demo.js --mode=local --service=payment-gateway --severity=p1
```
