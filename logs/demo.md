# Guardian — Demo Walkthrough

> 4-minute live demo for the Airia AI Agents Hackathon 2026

---

## Pre-Demo Setup

### 1. Start the local environment

```bash
cd guardian
npm run setup        # Verify all service connections are live
```

Expected output: all 5 checks green (Airia, PagerDuty, Slack, Jira, Confluence).

### 2. Browser layout (5 tabs, open before recording)

| Tab | URL | What to show |
|-----|-----|-------------|
| 1 | PagerDuty dashboard | Service list — payment-gateway highlighted |
| 2 | Airia Agent Studio | Guardian pipeline — 5 nodes visible |
| 3 | Slack — #inc-* channel area | War room channel will appear here |
| 4 | Jira — INC project board | Ticket will appear here live |
| 5 | Airia Studio → Guardian pipeline → **Runs** tab | Pre-run `npm run demo` first — open the latest completed run, click Node 05, expand `postmortem_content` in Output panel |

### 3. Slack DM open

Open the DM channel where HITL approval messages land (`D0AMSNK14JY`). The Block Kit approval card with **Approve / Reject** buttons appears here during Node 03.

---

## Trigger the Demo

```bash
npm run demo
```

This fires two things simultaneously:
- A **PagerDuty Events API v2** incident on the payment-gateway service
- The **Airia pipeline** with a realistic P1 payload (INC-2603XXXXXX, 847ms latency, 23% error rate)

---

## 4-Minute Walkthrough

### 0:00 – 0:30 · The Problem

**Show:** Tab 1 — PagerDuty dashboard

**Say:**
> "At 2:47 AM, your payment gateway degrades. 3,400 transactions are failing per minute. Your SLA breaches in 8 minutes. Without Guardian, this is 12 minutes of manual coordination before anyone starts fixing the problem — Slack pings, who owns this, find the runbook, create the ticket, stand up the war room. Guardian eliminates all of it."

---

### 0:30 – 0:45 · Alert Fires

**Show:** PagerDuty dashboard — new P1 incident appearing for payment-gateway

**Say:**
> "Guardian receives the PagerDuty webhook. Watch what happens in the next 4 seconds."

---

### 0:45 – 1:15 · Node 01 — Triage Sentinel

**Show:** Tab 2 — Airia Studio, Node 01 firing. Highlight the Python code block and the structured JSON output.

**Key output to point at:**
```json
{
  "severity":   "P1",
  "confidence": 94,
  "reasoning":  "Matched 3 of 4 P1 criteria. Latency 847ms (threshold 640ms for critical service). Error rate 23%. Duration 4 min. Critical service multiplier applied."
}
```

**Say:**
> "The Triage Sentinel classifies this as P1 with 94% confidence. Here is the exact reasoning — not a black box. Latency 847ms, error rate 23%, 4 consecutive minutes, on a payment-critical service. The AI explains every decision in plain English."

---

### 1:15 – 1:45 · Node 02 — Runbook Agent

**Show:** Tab 2 — Node 02 output. Show the Confluence runbook title and top 3 steps appearing.

**Key output to point at:**
```json
{
  "runbooks": [{
    "title": "Payment Gateway Latency Runbook",
    "url":   "https://your-domain.atlassian.net/wiki/...",
    "steps": [
      "Check payment processor health dashboard",
      "Verify database connection pool utilisation",
      "Check recent deployments in last 2h"
    ]
  }]
}
```

**Say:**
> "The Runbook Agent queries Confluence through Airia's MCP Gateway. No credentials in the pipeline code — Airia manages all of that in its vault. The correct runbook appears in 2 seconds."

---

### 1:45 – 2:15 · Node 03 — HITL Gate ⭐ KEY MOMENT

**Show:** Tab 3 — Slack DM — the Block Kit approval card with Approve / Reject buttons

**The card shows:** severity, AI reasoning, 3 runbook steps, SLA countdown

**Click Approve live (or have it pre-approved with AUTO_APPROVE=True)**

**Say:**
> "Before Guardian takes any automated action, it asks for human approval. This is not just a best practice — it is a DORA Article 11 legal requirement. An engineer reviews the AI reasoning and clicks Approve. Airia records the approver identity and exact timestamp. This appears in the post-mortem. This is your compliance audit entry."

---

### 2:15 – 2:45 · Node 04 — War Room Coordinator 💥 SILENCE MOMENT

**Show:** Split screen — Tab 3 (Slack) + Tab 4 (Jira)

**WAIT 4–5 seconds in silence.** Let the audience watch:
- `#inc-2603XXXXXX-payment-gateway` channel appear in Slack
- `INC-X` ticket appear in Jira with P1 priority, AI summary, runbook link

**Then say:**
> "War room created. On-call team notified. Jira ticket opened with full AI context. The entire 12-minute manual overhead — gone. In 4 seconds."

---

### 2:45 – 3:30 · Node 05 — Governance Dashboard ⭐ KNOCKOUT MOMENT

**Show (step 1):** Tab 5 — Airia Studio → Guardian pipeline → **Runs** tab → latest run → Node 05 → Output panel  
Expand `postmortem_content` → `compliance` block: `dora_metrics`, `sox_controls`, `compliance_status: COMPLIANT`

**Show (step 2):** Scroll up to `timeline` array — 6 audit entries, one per node  
Point at the HITL entry: `"event": "HITL approval: APPROVED by Alex Chen", "actor": "Guardian Node 03"`

**Show (step 3):** Top-level output fields  
`"governance_entry": "GOV-INC-2603192222-20260320"`  
`"compliance_status": "DORA_SOX_COMPLIANT"`

**Key output to point at:**
```json
{
  "governance_entry":  "GOV-INC-2603192222-20260320",
  "compliance_status": "DORA_SOX_COMPLIANT",
  "postmortem_pdf_url": "https://guardian-vvd5824.slack.com/archives/..."
}
```

**Say:**
> "This is what sets Guardian apart from every other incident response tool. Every AI decision is logged. Every model call is recorded with its reasoning. Every human approval is timestamped and linked to an identity. The post-mortem is DORA Article 11 compliant — your compliance officer can sign it, your auditor will accept it. Generated automatically."

---

### 3:30 – 4:00 · Community + Close

**Show:** 3 Airia Community module cards

**Say:**
> "Guardian is published as three community agents — Triage Sentinel, War Room Coordinator, and Compliance Narrator. Fork any of them for your stack. PagerDuty, OpsGenie, Datadog — it works with all of them. Slack and Jira — same. Any regulated industry — HIPAA, FISMA, DORA — same compliance narrator. Built to prove that agentic AI projects don't have to be in the 40% that fail."

---

## Full Pipeline Output (reference)

```json
{
  "incident_id":        "INC-2603192222",
  "service":            "payment-gateway",
  "severity":           "P1",
  "confidence":         94,
  "reasoning":          "Matched 3 of 4 P1 criteria. Critical service multiplier applied.",
  "runbook_title":      "Payment Gateway Latency Runbook",
  "hitl_decision":      "approved",
  "hitl_approver":      "auto-approved",
  "slack_channel":      "#inc-2603192222-payment-gateway",
  "slack_channel_url":  "https://guardian-vvd5824.slack.com/archives/C0AN4NHPSNM",
  "jira_ticket":        "INC-5",
  "jira_url":           "https://mmallick1990.atlassian.net/browse/INC-5",
  "governance_entry":   "GOV-INC-2603192222-20260320",
  "compliance_status":  "DORA_SOX_COMPLIANT",
  "postmortem_pdf_url": "https://guardian-vvd5824.slack.com/archives/C0AN4NHPSNM"
}
```

---

## Critical Notes for Recording

- **Never skip the Governance Dashboard moment** — it is the judging differentiator
- **The silence at 2:15 is intentional** — do not fill it with words, let the Slack+Jira split screen speak
- **Keep a rehearsed fallback** — if live API fails, pre-run `npm run demo` before recording and screenshot the output
- **Time every rehearsal with a stopwatch** — the 4:00 limit is firm
- **Record minimum 2 takes** — use the take where the demo gods cooperate

---

## Troubleshooting Common Demo Issues

| Symptom | Fix |
|---------|-----|
| `npm run demo` exits 401 | Check `AIRIA_API_KEY` in `.env` |
| PagerDuty alert not appearing | Check `PAGERDUTY_INTEGRATION_KEY` — must be Events API v2 integration key |
| Slack message not delivered | Check `SLACK_BOT_TOKEN` scopes: `chat:write`, `channels:manage`, `channels:write.topic` |
| Jira ticket not created | Verify `JIRA_PROJECT_KEY=INC` and priority `Highest` is enabled for that project |
| War room channel not created | Slack bot needs `channels:manage` scope — add at api.slack.com/apps and reinstall |
| Pipeline hangs at Node 02 | Confluence space `RUNBOOKS` must exist — run `npm run seed:confluence` first |

---

## Quick Reference

```bash
# Full demo trigger (PagerDuty + Airia pipeline)
npm run demo

# Check all connections before demo
node scripts/setup.js

# Run all tests (127)
npm test

# Specific scenario
node scripts/trigger-demo.js --scenario=payment-gateway-latency
node scripts/trigger-demo.js --scenario=fraud-detection-p1
node scripts/trigger-demo.js --scenario=trading-api-p1
```
