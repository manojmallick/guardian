# Triage Sentinel — AI-Powered Alert Classification Engine

> Works with any alerting tool. Plug in your webhook, get AI triage in 3 seconds.

A standalone, forkable module from the [Guardian](https://github.com/manojmallick/guardian) project — Airia AI Agents Hackathon 2026.

---

## What It Does

Receives an alert webhook (from any tool), runs deterministic P1/P2/P3 severity classification using configurable threshold logic, then enhances the result with AI reasoning. Same input always yields the same severity level — the algorithm decides, the AI explains.

## Compatible Alert Sources

| Tool | Adapter |
|------|---------|
| PagerDuty | `adapters/pagerduty.js` |
| OpsGenie | `adapters/opsgenie.js` |
| Datadog | `adapters/datadog.js` |
| CloudWatch | `adapters/cloudwatch.js` |
| Prometheus Alertmanager | `adapters/prometheus.js` |

## Customization

1. Edit `thresholds.js` to adjust P1/P2/P3 threshold values
2. Add services to the `CRITICAL_SERVICES` list for tighter thresholds
3. Swap the AI model in Airia — works with Claude, GPT-4o, Gemini

## Fork For

- **Healthcare:** EHR system alerts, patient monitoring degradation
- **Retail:** Checkout failures, payment processor latency
- **Infrastructure:** Any server or network monitoring stack

## Airia Community

[https://community.airia.com/agents/triage-sentinel](https://community.airia.com/agents/triage-sentinel)
