# Guardian Node 01 — Triage Sentinel
# Airia Python Code Block
#
# Paste this entire file into an Airia "Python Code Block" node.
# Airia injects `input` (dict) and expects you to set `output` (dict).
# No external packages needed — pure Python logic.
#
# Input shape:  PagerDuty webhook payload
# Output shape: input + severity, confidence, reasoning, alert_raw

import ast
import json
from datetime import datetime, timezone

# ─── Threshold constants ───────────────────────────────────────────────────
THRESHOLDS = {
    "P1": {
        "latencyMs":            800,
        "errorRate":            0.15,   # 15%
        "durationMin":          3,
        "transactionsAffected": 1000,
        "criteriaRequired":     2,      # must match ≥2 of 4
    },
    "P2": {
        "latencyMs":            400,
        "errorRate":            0.05,   # 5%
        "durationMin":          5,
        "transactionsAffected": 100,
        "criteriaRequired":     2,      # must match ≥2 of 3
    },
}

CRITICAL_SERVICES  = ["payment-gateway", "fraud-detection", "trading-api"]
CRITICAL_MULTIPLIER = 0.8   # reduces P1 latency threshold by 20% for critical services


# ─── Core classification logic ─────────────────────────────────────────────
def classify_severity(alert, service):
    if not alert or not isinstance(alert, dict):
        return {
            "severity":   "P2",
            "confidence": 0,
            "reasoning":  "Alert missing or invalid — defaulted to P2 for safety",
            "isCriticalService": False,
            "criticalMultiplierApplied": False,
        }

    latency      = alert.get("latencyMs", 0)
    error_rate   = alert.get("errorRate", 0)
    duration     = alert.get("durationMin", 0)
    transactions = alert.get("transactionsAffected", 0)

    is_critical = service in CRITICAL_SERVICES
    multiplier  = CRITICAL_MULTIPLIER if is_critical else 1.0

    p1 = THRESHOLDS["P1"]
    p1_score = sum([
        latency      >= p1["latencyMs"] * multiplier,
        error_rate   >= p1["errorRate"],
        duration     >= p1["durationMin"],
        transactions >= p1["transactionsAffected"],
    ])

    p2 = THRESHOLDS["P2"]
    p2_score = sum([
        latency    >= p2["latencyMs"],
        error_rate >= p2["errorRate"],
        duration   >= p2["durationMin"],
    ])

    if p1_score >= p1["criteriaRequired"]:
        severity   = "P1"
        confidence = round((p1_score / 4) * 100)
        reasoning  = (f"Matched {p1_score} of 4 P1 criteria. "
                      f"Critical service multiplier: {is_critical}.")
    elif p2_score >= p2["criteriaRequired"]:
        severity   = "P2"
        confidence = round((p2_score / 3) * 100)
        reasoning  = f"Matched {p2_score} of 3 P2 criteria."
    else:
        severity   = "P3"
        confidence = 50
        reasoning  = "Below P2 thresholds — classified as P3."

    return {
        "severity":                  severity,
        "confidence":                confidence,
        "reasoning":                 reasoning,
        "isCriticalService":         is_critical,
        "criticalMultiplierApplied": is_critical,
    }


# ─── Airia entry point ─────────────────────────────────────────────────────
if isinstance(input, str):
    try:
        input = json.loads(input)
    except (json.JSONDecodeError, ValueError):
        input = ast.literal_eval(input)

alert   = input.get("alert", {})
service = input.get("service", "unknown")

result = classify_severity(alert, service)

output = {
    **input,
    "severity":                  result["severity"],
    "confidence":                result["confidence"],
    "reasoning":                 result["reasoning"],
    "isCriticalService":         result["isCriticalService"],
    "criticalMultiplierApplied": result["criticalMultiplierApplied"],
    "alert_raw":                 alert,
    "triggered_at":              input.get("triggered_at", datetime.now(timezone.utc).isoformat()),
    "triage_timestamp":          datetime.now(timezone.utc).isoformat(),
}
