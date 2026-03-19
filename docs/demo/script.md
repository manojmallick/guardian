# Guardian — Demo Script (4 Minutes Exact)

## Pre-Recording Setup

Browser layout:
- Tab 1: PagerDuty dashboard (ready to trigger test alert)
- Tab 2: Airia Agent Studio (Guardian pipeline visible)
- Tab 3: Slack (war room channel area visible)
- Tab 4: Jira (INC project board)
- Tab 5: Airia Governance Dashboard
- Tab 6: Post-mortem PDF (pre-rendered backup at docs/demo/sample-postmortem.pdf)

Trigger demo alert: `npm run demo` or `node scripts/trigger-demo.js --mode=direct`

---

## Timestamped Script

### 0:00–0:30 — The Problem

**SHOW:** Chaotic Slack channel with manual pings, "who owns this?", SLA breach counter visible

**SAY:**
> "At 2:47 AM, your payment gateway degrades. Three thousand four hundred transactions are failing. Your SLA breaches in 8 minutes. This is what incident response looks like without Guardian — 12 minutes of manual coordination before anyone starts fixing the problem."

---

### 0:30–0:45 — Trigger the Alert

**SHOW:** PagerDuty dashboard — trigger test alert on payment-gateway service

**SAY:**
> "Guardian receives the PagerDuty webhook. Watch what happens in the next 4 seconds."

---

### 0:45–1:15 — Node 01: Triage Sentinel

**SHOW:** Airia Agent Studio — Node 01 firing, Node.js code block executing, severity JSON output

**SAY:**
> "The Triage Sentinel classifies this as P1 with 94% confidence. Here is the exact reasoning: latency 847ms, error rate 23%, 4 consecutive minutes, on a critical service. The AI explains its decision in plain English — not a black box."

---

### 1:15–1:45 — Node 02: Runbook Agent

**SHOW:** Node 02 firing — Confluence runbook appearing in real time in Airia output

**SAY:**
> "The Runbook Agent queries Confluence through Airia's MCP Gateway. No credentials in the code — Airia handles all of that. The top 3 runbook steps appear in 2 seconds."

---

### 1:45–2:15 — Node 03: HITL Gate (⭐ KEY MOMENT)

**SHOW:** Slack — MCP Apps interactive approval message with clickable buttons  
**THEN:** Engineer clicks Approve

**SAY:**
> "Before Guardian takes any automated action, it asks for human approval. This is not just a best practice — it is a DORA compliance requirement. An engineer clicks Approve. Airia records the approver's identity and timestamp. This record will appear in the post-mortem. This is your DORA Article 11 audit entry."

---

### 2:15–2:45 — Node 04: War Room (THE SILENCE MOMENT)

**SHOW:** SPLIT SCREEN — Slack war room channel appearing live + Jira ticket appearing live simultaneously

**WAIT 4–5 SECONDS IN SILENCE** — let judges watch. Do not narrate.

**SAY:**
> "In 4 seconds: war room created, on-call team notified, Jira ticket opened with full AI context. The entire 12 minutes of manual coordination overhead is gone."

---

### 2:45–3:30 — Node 05: Governance Dashboard (⭐ KNOCKOUT MOMENT)

**SHOW:** Airia Governance Dashboard — full AI decision audit trail  
**THEN:** Open post-mortem PDF — scroll to Section 4 DORA compliance record

**SAY:**
> "This is what sets Guardian apart from every other incident response tool. Every AI decision is logged. Every model call is recorded with its reasoning. Every human approval is timestamped. Open the post-mortem PDF — Section 4 is a DORA Article 11 compliance record, generated automatically. Your compliance officer can sign this. Your auditor will accept it."

---

### 3:30–4:00 — Community & Closing

**SHOW:** 3 Airia Community module cards  
**FINAL SLIDE:** "Built to prove that agentic AI projects don't have to be in the 40% that fail."

**SAY:**
> "Guardian is published as three modular agents in the Airia Community. Fork Triage Sentinel for any alerting tool. Fork War Room Coordinator for any Slack and Jira team. Fork Compliance Narrator for any regulated industry. Built to prove that agentic AI projects don't have to be in the 40% that fail."

---

## Critical Notes

- **Never cut the Governance Dashboard moment** — it is the judging differentiator
- **The silence at 2:15** is intentional — do not fill it with words
- **Keep a pre-rendered PDF as backup** — in `docs/demo/sample-postmortem.pdf`
- **Record 2 takes minimum** — use the take where the demo gods cooperate
- **Time with stopwatch** during all 3 rehearsals — the 4:00 limit is firm
