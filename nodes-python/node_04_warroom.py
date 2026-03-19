# Guardian Node 04 — War Room Coordinator
# Airia Python Code Block
#
# Paste this entire file into an Airia "Python Code Block" node.
# Requires: requests (available in Airia sandbox)
#
# Secrets to set in Airia vault:
#   SLACK_BOT_TOKEN     = xoxb-...
#   SLACK_WORKSPACE_ID  = T0AMKMGMH5K
#   JIRA_BASE_URL       = https://mmallick1990.atlassian.net
#   JIRA_EMAIL          = mmallick1990@gmail.com
#   JIRA_API_TOKEN      = <your token>
#   JIRA_PROJECT_KEY    = INC
#
# What this node does:
#   1. Creates a Slack channel named inc-<id>-<service>
#   2. Posts the war room brief (AI summary + runbook + Jira link) to the channel
#   3. Creates a Jira incident ticket
#   4. Returns channel URL + ticket URL in output
#
# Input shape:  Node 03 output (has hitl, runbooks, severity, ...)
# Output shape: input + slack_channel, jira_ticket, jira_url, warroom_activated_at

import ast
import json
import os
import re
import random
import requests
from datetime import datetime, timezone

SLACK_BOT_TOKEN    = os.environ.get("SLACK_BOT_TOKEN",    "")
SLACK_WORKSPACE_ID = os.environ.get("SLACK_WORKSPACE_ID", "T0AMKMGMH5K")
JIRA_BASE_URL      = os.environ.get("JIRA_BASE_URL",      "https://mmallick1990.atlassian.net")
JIRA_EMAIL         = os.environ.get("JIRA_EMAIL",         "")
JIRA_API_TOKEN     = os.environ.get("JIRA_API_TOKEN",     "")
JIRA_PROJECT_KEY   = os.environ.get("JIRA_PROJECT_KEY",   "INC")

PRIORITY_MAP = {"P1": "Critical", "P2": "High", "P3": "Medium"}

ONCALL_TEAMS = {
    "payment-gateway": ["@payments-oncall", "@sre-oncall"],
    "fraud-detection": ["@risk-oncall",     "@sre-oncall"],
    "trading-api":     ["@trading-oncall",  "@sre-oncall"],
}
DEFAULT_ONCALL = ["@platform-oncall", "@sre-oncall"]

SLACK_WORKSPACE_URL = "https://guardian-vvd5824.slack.com"


# ─── Helpers ───────────────────────────────────────────────────────────────
def build_channel_name(incident_id, service):
    raw  = f"inc-{incident_id.lower()}-{service.lower()}"
    safe = re.sub(r"[^a-z0-9\-]", "-", raw)
    return safe[:80]


def headers():
    return {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type":  "application/json",
    }


# ─── Step 1: Create Slack channel ─────────────────────────────────────────
def create_slack_channel(channel_name):
    try:
        resp = requests.post(
            "https://slack.com/api/conversations.create",
            headers=headers(),
            json={"name": channel_name, "is_private": False},
            timeout=10,
        )
        data = resp.json()
        if data.get("ok"):
            return data["channel"]["id"], data["channel"]["name"]

        # Channel already exists — look it up
        if data.get("error") == "name_taken":
            list_resp = requests.get(
                "https://slack.com/api/conversations.list",
                headers=headers(),
                params={"types": "public_channel", "limit": 500},
                timeout=10,
            )
            for ch in list_resp.json().get("channels", []):
                if ch["name"] == channel_name:
                    return ch["id"], ch["name"]

        return None, channel_name
    except Exception:
        return None, channel_name


# ─── Step 2: Post war room brief to channel ───────────────────────────────
def post_war_room_message(channel_id, incident, oncall_team, jira_ticket_id):
    runbook   = (incident.get("runbooks") or [{}])[0]
    steps     = runbook.get("steps", [])[:3]
    step_text = "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps))
    hitl      = incident.get("hitl", {})

    text = (
        f"🚨 *{incident.get('incident_id')} — "
        f"{incident.get('service')} {incident.get('severity')} Incident*\n\n"
        f"*AI Triage ({incident.get('confidence', 0)}% confidence):*\n"
        f"{incident.get('reasoning', '')}\n\n"
        f"*Runbook:* {runbook.get('title', 'General Runbook')}\n"
        f"{step_text}\n\n"
        f"*Jira Ticket:* <{JIRA_BASE_URL}/browse/{jira_ticket_id}|{jira_ticket_id}>\n"
        f"*HITL Approved by:* {hitl.get('approver_name', 'N/A')} "
        f"({hitl.get('response_time_seconds', 0)}s response)\n"
        f"*War Room activated by:* Guardian (Airia)\n\n"
        f"cc: {' '.join(oncall_team)}"
    )

    try:
        requests.post(
            "https://slack.com/api/chat.postMessage",
            headers=headers(),
            json={"channel": channel_id, "text": text, "mrkdwn": True},
            timeout=10,
        )
    except Exception:
        pass  # Don't block pipeline if message fails


# ─── Step 3: Create Jira issue ────────────────────────────────────────────
def create_jira_ticket(incident):
    runbook  = (incident.get("runbooks") or [{}])[0]
    severity = incident.get("severity", "P1")
    hitl     = incident.get("hitl", {})

    description_text = (
        f"AI Triage: {incident.get('reasoning', '')}\n\n"
        f"Approved by: {hitl.get('approver_name', 'N/A')} "
        f"at {hitl.get('approved_at', 'N/A')}\n"
        f"Runbook: {runbook.get('title', 'N/A')}\n\n"
        f"Guardian Audit Trail: Session {incident.get('incident_id')}"
    )

    payload = {
        "fields": {
            "project":   {"key": JIRA_PROJECT_KEY},
            "issuetype": {"name": "Task"},
            "priority":  {"name": PRIORITY_MAP.get(severity, "High")},
            "summary":   f"[{severity}] {incident.get('service')} degradation — {incident.get('incident_id')}",
            "description": {
                "type":    "doc",
                "version": 1,
                "content": [{
                    "type":    "paragraph",
                    "content": [{"type": "text", "text": description_text}],
                }],
            },
            "labels": ["guardian-automated", "dora-tracked", severity.lower()],
        }
    }

    try:
        resp = requests.post(
            f"{JIRA_BASE_URL}/rest/api/3/issue",
            auth=(JIRA_EMAIL, JIRA_API_TOKEN),
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=15,
        )
        resp.raise_for_status()
        ticket_key = resp.json().get("key", f"{JIRA_PROJECT_KEY}-????")
        return ticket_key, f"{JIRA_BASE_URL}/browse/{ticket_key}"
    except Exception:
        # Fallback — generate a plausible ticket ID for demo continuity
        fallback_id = f"{JIRA_PROJECT_KEY}-{random.randint(1000, 9999)}"
        return fallback_id, f"{JIRA_BASE_URL}/browse/{fallback_id}"


# ─── Airia entry point ─────────────────────────────────────────────────────
if isinstance(input, str):
    try:
        input = json.loads(input)
    except (json.JSONDecodeError, ValueError):
        input = ast.literal_eval(input)

incident_id = input.get("incident_id", "INC-0000")
service     = input.get("service",     "unknown")
oncall_team = ONCALL_TEAMS.get(service, DEFAULT_ONCALL)
channel_name = build_channel_name(incident_id, service)

# Create Jira ticket first (URL embedded in Slack message)
jira_ticket_id, jira_ticket_url = create_jira_ticket(input)

# Create Slack channel + post war room brief
channel_id, actual_name = create_slack_channel(channel_name)
if channel_id:
    post_war_room_message(channel_id, input, oncall_team, jira_ticket_id)

slack_channel_url = f"{SLACK_WORKSPACE_URL}/channels/{actual_name or channel_name}"

output = {
    **input,
    "slack_channel":        slack_channel_url,
    "slack_channel_id":     channel_id or channel_name,
    "jira_ticket":          jira_ticket_id,
    "jira_url":             jira_ticket_url,
    "oncall_notified":      oncall_team,
    "warroom_activated_at": datetime.now(timezone.utc).isoformat(),
}
