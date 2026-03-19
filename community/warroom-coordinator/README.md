# War Room Coordinator — Automated Incident Response Setup

> Eliminate the 8-minute war room scramble. Automated in 4 seconds.

A standalone, forkable module from the [Guardian](https://github.com/manojmallick/guardian) project — Airia AI Agents Hackathon 2026.

---

## What It Does

Given a severity classification and service name, creates a Slack incident channel, posts the war room summary with AI triage context, @mentions the on-call team, and opens a Jira incident ticket — all in parallel, all in under 5 seconds.

## Outputs

- Slack incident channel: `#inc-{id}-{service}`
- War room message with AI summary + runbook steps
- On-call team @mentioned
- Jira P1/P2/P3 ticket with SLA timer
- All in < 5 seconds via nested parallel execution

## Configuration

Edit `config/oncall-teams.js` to map your services to on-call Slack user groups.

## Fork For

- Any SRE team globally using Slack + Jira
- IT operations and NOC teams
- Any engineering team managing production incidents

## Airia Community

[https://community.airia.com/agents/warroom-coordinator](https://community.airia.com/agents/warroom-coordinator)
