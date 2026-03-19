# Guardian Node 02 — Runbook Agent
# Airia Python Code Block
#
# Paste this entire file into an Airia "Python Code Block" node.
# Requires: requests (available in Airia sandbox)
#
# Secrets to set in Airia vault:
#   CONFLUENCE_BASE_URL   = https://mmallick1990.atlassian.net/wiki
#   CONFLUENCE_EMAIL      = mmallick1990@gmail.com
#   CONFLUENCE_API_TOKEN  = <your token>
#   CONFLUENCE_SPACE_KEY  = RUNBOOKS
#
# Input shape:  Node 01 output (has service, severity, alert_raw, ...)
# Output shape: input + runbooks[], runbook_retrieved_at

import os
import re
import requests
from datetime import datetime, timezone

CONFLUENCE_BASE_URL  = os.environ.get("CONFLUENCE_BASE_URL",  "https://mmallick1990.atlassian.net/wiki")
CONFLUENCE_EMAIL     = os.environ.get("CONFLUENCE_EMAIL",     "")
CONFLUENCE_API_TOKEN = os.environ.get("CONFLUENCE_API_TOKEN", "")
CONFLUENCE_SPACE_KEY = os.environ.get("CONFLUENCE_SPACE_KEY", "RUNBOOKS")

# ─── Fallback cache (used when Confluence is unreachable) ─────────────────
FALLBACK_RUNBOOKS = {
    "payment-gateway": {
        "title": "Payment Gateway Emergency Runbook",
        "steps": [
            "Check Stripe API status dashboard at status.stripe.com",
            "Verify DB connection pool utilization in Datadog",
            "Check for recent deployments in last 2 hours via GitHub Actions",
            "Restart connection pool on payment-db-01 if DB connections > 80%",
            "Escalate to payments team lead if not resolved in 10 minutes",
        ],
        "url":    "https://mmallick1990.atlassian.net/wiki/spaces/RUNBOOKS/pages/payment-gateway",
        "owner":  "payments-oncall",
        "source": "FALLBACK_CACHE",
    },
    "fraud-detection": {
        "title": "Fraud Detection Emergency Runbook",
        "steps": [
            "Check fraud scoring service health endpoint",
            "Verify ML model serving latency in monitoring dashboard",
            "Check recent model deployments or rule changes",
            "Scale up fraud detection pods if CPU > 80%",
            "Escalate to risk team lead if degradation persists beyond 5 minutes",
        ],
        "url":    "https://mmallick1990.atlassian.net/wiki/spaces/RUNBOOKS/pages/fraud-detection",
        "owner":  "risk-oncall",
        "source": "FALLBACK_CACHE",
    },
    "trading-api": {
        "title": "Trading API Emergency Runbook",
        "steps": [
            "Check market data feed connectivity",
            "Verify order routing service health",
            "Review recent configuration changes",
            "Immediately escalate to trading-oncall if any order execution is impacted",
        ],
        "url":    "https://mmallick1990.atlassian.net/wiki/spaces/RUNBOOKS/pages/trading-api",
        "owner":  "trading-oncall",
        "source": "FALLBACK_CACHE",
    },
}

DEFAULT_RUNBOOK = {
    "title": "Platform General Incident Runbook",
    "steps": [
        "Check platform health dashboard for service status",
        "Review recent deployments and infrastructure changes",
        "Check resource utilization (CPU, memory, disk) across affected nodes",
        "Review application logs for error patterns",
        "Escalate to platform-oncall with collected diagnostic information",
    ],
    "url":    "https://mmallick1990.atlassian.net/wiki/spaces/RUNBOOKS/pages/platform",
    "owner":  "platform-oncall",
    "source": "FALLBACK_CACHE",
}


# ─── Helper: strip HTML tags from Confluence body ─────────────────────────
def strip_html(text):
    return re.sub(r"<[^>]+>", "", text or "").strip()


def extract_steps_from_html(html_body):
    """Pull <li> items out of Confluence storage format as plain-text steps."""
    raw_steps = re.findall(r"<li[^>]*>(.*?)</li>", html_body or "", re.DOTALL | re.IGNORECASE)
    steps = [strip_html(s) for s in raw_steps if strip_html(s)]
    return steps[:5] if steps else []


# ─── Confluence REST API search ───────────────────────────────────────────
def search_confluence(service, alert_profile):
    cql = (
        f'space = "{CONFLUENCE_SPACE_KEY}" '
        f'AND text ~ "{service}" '
        f'AND text ~ "runbook" '
        f'ORDER BY lastmodified DESC'
    )
    url    = f"{CONFLUENCE_BASE_URL}/rest/api/content/search"
    params = {"cql": cql, "limit": 3, "expand": "body.storage,version,metadata.labels"}

    try:
        resp = requests.get(
            url,
            auth=(CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN),
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])

        if not results:
            return None

        runbooks = []
        for page in results:
            html_body = page.get("body", {}).get("storage", {}).get("value", "")
            steps     = extract_steps_from_html(html_body)
            web_link  = page.get("_links", {}).get("webui", "")
            runbooks.append({
                "title":       page.get("title", "Runbook"),
                "url":         f"{CONFLUENCE_BASE_URL}{web_link}" if web_link else CONFLUENCE_BASE_URL,
                "steps":       steps if steps else ["Follow standard incident procedure"],
                "owner":       "platform-oncall",
                "lastUpdated": page.get("version", {}).get("when", datetime.now(timezone.utc).isoformat()),
                "source":      "CONFLUENCE",
            })
        return runbooks

    except Exception as exc:
        # Swallow — caller falls through to cache
        return None


# ─── Airia entry point ─────────────────────────────────────────────────────
service     = input.get("service", "unknown")
alert_raw   = input.get("alert_raw", {})
alert_profile = "high-error-rate" if (alert_raw.get("errorRate", 0) > 0.10) else "latency-degradation"

runbooks = search_confluence(service, alert_profile)

if not runbooks:
    fallback = FALLBACK_RUNBOOKS.get(service, DEFAULT_RUNBOOK)
    runbooks = [fallback]

output = {
    **input,
    "runbooks":              runbooks,
    "runbook_retrieved_at":  datetime.now(timezone.utc).isoformat(),
}
