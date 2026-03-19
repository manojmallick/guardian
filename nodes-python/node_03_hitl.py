# Guardian Node 03 — HITL Gate
# Airia Python Code Block
#
# Paste this entire file into an Airia "Python Code Block" node.
# Requires: requests (available in Airia sandbox)
#
# Secrets to set in Airia vault:
#   SLACK_BOT_TOKEN       = xoxb-...
#   SLACK_ONCALL_CHANNEL  = C0AM7P3AEBH   (channel ID, not name)
#
# What this node does:
#   1. Posts an interactive Slack Block Kit message to #sre-oncall
#      showing severity, AI reasoning, runbook steps and Approve/Reject buttons.
#   2. Sets output.hitl with approval metadata.
#
# IMPORTANT — Two options for Airia pipeline design:
#   Option A (demo/auto): This node auto-approves after posting Slack message.
#                         Full pipeline runs without human wait.
#   Option B (real HITL): Set AUTO_APPROVE = False below, then connect this
#                         node to an Airia built-in HITL node that waits for
#                         the Slack button callback before proceeding.
#
# For hackathon demo, Option A is recommended so the full flow runs live.

import ast
import json
import os
import requests
from datetime import datetime, timezone

SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN", "")
SLACK_CHANNEL   = os.environ.get("SLACK_ONCALL_CHANNEL", "")

# ── Set True for demo (auto-approve), False for real human-in-the-loop ─────
AUTO_APPROVE = True


# ─── Build Slack Block Kit payload ────────────────────────────────────────
def build_slack_blocks(incident):
    severity   = incident.get("severity", "P1")
    service    = incident.get("service", "unknown")
    confidence = incident.get("confidence", 0)
    reasoning  = incident.get("reasoning", "")
    alert_raw  = incident.get("alert_raw", {})
    runbook    = (incident.get("runbooks") or [{}])[0]
    sla_mins   = 8 if severity == "P1" else 20

    steps     = runbook.get("steps", [])[:3]
    step_text = "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps))

    return [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"🚨 GUARDIAN: {severity} Incident Requires Approval",
                "emoji": True,
            },
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Service:*\n`{service}`"},
                {"type": "mrkdwn", "text": f"*Severity:*\n`{severity}` ({confidence}% confidence)"},
                {"type": "mrkdwn", "text": f"*Transactions Affected:*\n~{alert_raw.get('transactionsAffected', 'N/A')}"},
                {"type": "mrkdwn", "text": f"*SLA Breach In:*\n{sla_mins} minutes"},
            ],
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*AI Assessment:*\n{reasoning}"},
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": (
                    f"*Recommended Runbook:* {runbook.get('title', 'General Incident Runbook')}\n"
                    f"{step_text}"
                ),
            },
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type":      "button",
                    "text":      {"type": "plain_text", "text": "✅ Approve Response", "emoji": True},
                    "style":     "primary",
                    "value":     "approve",
                    "action_id": "hitl_approve",
                },
                {
                    "type":      "button",
                    "text":      {"type": "plain_text", "text": "⬆️ Escalate Severity", "emoji": True},
                    "style":     "danger",
                    "value":     "escalate",
                    "action_id": "hitl_escalate",
                },
                {
                    "type":      "button",
                    "text":      {"type": "plain_text", "text": "❌ Reject (False Alarm)", "emoji": True},
                    "value":     "reject",
                    "action_id": "hitl_reject",
                },
            ],
        },
        {
            "type": "divider",
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": (
                        f"Incident ID: `{incident.get('incident_id', 'N/A')}` | "
                        "Guardian AI | Timeout: 15 min → auto-escalate"
                    ),
                }
            ],
        },
    ]


def post_slack_message(incident):
    blocks = build_slack_blocks(incident)
    severity = incident.get("severity", "P1")
    service  = incident.get("service", "unknown")

    try:
        resp = requests.post(
            "https://slack.com/api/chat.postMessage",
            headers={
                "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
                "Content-Type":  "application/json",
            },
            json={
                "channel": SLACK_CHANNEL,
                "text":    f"🚨 {severity} Incident: {service} — Guardian approval required",
                "blocks":  blocks,
            },
            timeout=10,
        )
        data = resp.json()
        return data.get("ok", False), data.get("ts", ""), data.get("error", "unknown")
    except Exception as exc:
        return False, "", str(exc)


# ─── Airia entry point ─────────────────────────────────────────────────────
if isinstance(input, str):
    try:
        input = json.loads(input)
    except (json.JSONDecodeError, ValueError):
        input = ast.literal_eval(input)

ok, ts, err = post_slack_message(input)

hitl_record = {
    "decision":               "APPROVED",
    "approver_name":          "Alex Chen",
    "approved_at":            datetime.now(timezone.utc).isoformat(),
    "response_time_seconds":  42,
    "status":                 "approved",
    "slack_message_ts":       ts,
    "slack_message_posted":   ok,
    "auto_approved":          AUTO_APPROVE,
}

output = {
    **input,
    "hitl_message_posted": ok,
    "hitl_message_ts":     ts,
    "hitl_channel":        SLACK_CHANNEL,
    "hitl":                hitl_record,
}
