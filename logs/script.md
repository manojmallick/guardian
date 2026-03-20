# Guardian — Demo Script (4 Minutes Exact)

## Pre-Recording Setup

Browser layout:
- Tab 1: PagerDuty dashboard → `learnhubplay.eu.pagerduty.com` → Services → payment-gateway
- Tab 2: Airia Agent Studio → `https://airia.ai/019d062e-09e8-7829-a1e2-343c8176b0a3/agents/26fbebc7-1d0f-403d-b176-5499fd200dde/6.00` → Guardian pipeline (all 5 nodes visible)
- Tab 3: Slack → `guardian-vvd5824.slack.com` → channel list (war room channel appears here live)
- Tab 4: Jira → `https://mmallick1990.atlassian.net/jira/software/projects/INC/boards/1` (INC project board)
- Tab 5: Airia Studio → Guardian pipeline → **Runs** tab → open latest completed run → click Node 05 → Output panel (pre-expanded at `postmortem_content.compliance`)
- Tab 6: Post-mortem output → run `npm run demo`, copy `postmortem_pdf_url` from terminal output, open in browser

Trigger demo alert: `npm run demo` (fires PagerDuty + Airia pipeline simultaneously)

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

**SHOW:** Airia Agent Studio — Node 01 firing, Python code block executing, severity JSON output

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

**SHOW (step 1):** Airia Studio → Guardian pipeline → **Runs** tab → latest run → click Node 05 → **Output** panel  
Scroll to `postmortem_content` → expand `compliance` block — show `dora_metrics`, `sox_controls`, `frameworks`, `compliance_status: COMPLIANT`

**SHOW (step 2):** Scroll up to `timeline` array — 6 entries, one per node, each with timestamp + actor  
`{ "event": "HITL approval: APPROVED by Alex Chen", "actor": "Guardian Node 03 — HITL Gate" }`

**SHOW (step 3):** Top-level output — point at `governance_entry` and `compliance_status`  
`"governance_entry": "GOV-INC-2603192222-20260320"`  
`"compliance_status": "DORA_SOX_COMPLIANT"`

**SAY:**
> "This is what sets Guardian apart from every other incident response tool. Every AI decision is logged. Every model call is recorded with its reasoning. Every human approval is timestamped and tied to an identity. This compliance block — DORA metrics, SOX controls, audit trail — is generated automatically at the end of every incident. Your compliance officer can sign this. Your auditor will accept it."

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
- **Post-mortem backup** — run `npm run demo` once before recording, copy the `postmortem_pdf_url` from terminal output (Slack war room URL), keep it in a browser tab
- **Record 2 takes minimum** — use the take where the demo gods cooperate
- **Time with stopwatch** during all 3 rehearsals — the 4:00 limit is firm
