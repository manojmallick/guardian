#!/usr/bin/env python3
"""
Reads credentials from .env and writes pre-filled Python nodes to
airia-ready/ (gitignored) — safe to copy-paste directly into Airia Studio.

The nodes-python/ source files in git keep empty placeholders.
Run this script once; then open airia-ready/*.py and paste each into Airia.
"""
import re, os

ROOT    = os.path.join(os.path.dirname(__file__), '..')
SRC_DIR = os.path.join(ROOT, 'nodes-python')
OUT_DIR = os.path.join(ROOT, 'airia-ready')

# Parse .env
env = {}
with open(os.path.join(ROOT, '.env')) as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            for sep in ('  #', '\t#'):
                if sep in v:
                    v = v.split(sep)[0]
            env[k.strip()] = v.strip()

SECRETS = {
    "CONFLUENCE_BASE_URL":  env.get("CONFLUENCE_BASE_URL",  "https://mmallick1990.atlassian.net/wiki"),
    "CONFLUENCE_EMAIL":     env.get("CONFLUENCE_EMAIL",     "mmallick1990@gmail.com"),
    "CONFLUENCE_API_TOKEN": env.get("CONFLUENCE_API_TOKEN", ""),
    "CONFLUENCE_SPACE_KEY": env.get("CONFLUENCE_SPACE_KEY", "RUNBOOKS"),
    "JIRA_BASE_URL":        env.get("JIRA_BASE_URL",        "https://mmallick1990.atlassian.net"),
    "JIRA_EMAIL":           env.get("JIRA_EMAIL",           "mmallick1990@gmail.com"),
    "JIRA_API_TOKEN":       env.get("JIRA_API_TOKEN",       ""),
    "JIRA_PROJECT_KEY":     env.get("JIRA_PROJECT_KEY",     "INC"),
    "SLACK_BOT_TOKEN":      env.get("SLACK_BOT_TOKEN",      ""),
    "SLACK_ONCALL_CHANNEL": env.get("SLACK_ONCALL_CHANNEL", "C0AM7P3AEBH"),
    "SLACK_WORKSPACE_ID":   env.get("SLACK_WORKSPACE_ID",   "T0AMKMGMH5K"),
}

print("Credentials loaded from .env:")
for k, v in SECRETS.items():
    disp = (v[:40] + "...") if len(v) > 40 else v
    print(f"  {k:30s} = {disp}")

os.makedirs(OUT_DIR, exist_ok=True)

files = sorted(f for f in os.listdir(SRC_DIR) if f.endswith('.py'))
for fname in files:
    with open(os.path.join(SRC_DIR, fname)) as f:
        content = f.read()

    for key, value in SECRETS.items():
        if not value:
            continue
        escaped = value.replace('\\', '\\\\').replace('"', '\\"')
        # Replace existing default: os.environ.get("KEY", "old") → os.environ.get("KEY", "real")
        content = re.sub(
            r'os\.environ\.get\("' + re.escape(key) + r'",\s*"[^"]*"\)',
            f'os.environ.get("{key}", "{escaped}")',
            content
        )
        # No-default form: os.environ.get("KEY") → os.environ.get("KEY", "real")
        content = re.sub(
            r'os\.environ\.get\("' + re.escape(key) + r'"\)',
            f'os.environ.get("{key}", "{escaped}")',
            content
        )

    with open(os.path.join(OUT_DIR, fname), 'w') as f:
        f.write(content)
    print(f"  ✅ airia-ready/{fname}")

print(f"\n✅ Done — paste files from:  {os.path.abspath(OUT_DIR)}")
