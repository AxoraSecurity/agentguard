# Axora AgentGuard

Local guard for AI agents.

## Features

- **AgentGuard DeepScan** — Checks code and `SKILL.md` before you install a skill, plugin, or MCP package, and returns a risk level, tags, and a summary.
- **Action evaluation** — Before a supported action runs, returns allow, require approval, or block.
- **Trust Registry** — Manage skill trust levels with capability-based access control
- **Security Patrol** — Automated daily security checks for OpenClaw environments
- **Agent Health Checkup** — Full security posture assessment with visual HTML report and shareable lobster mascot
- **Audit Logging** — Full security event trail with reporting

## Usage

```
/agentguard scan <path>          — Scan code for security risks
/agentguard action <description> — Evaluate runtime action safety
/agentguard patrol [run|setup|status] — Daily security patrol
/agentguard trust <subcommand>   — Manage skill trust levels
/agentguard report               — View security event audit log
/agentguard config <level>       — Set protection level: Observe (`permissive` in the CLI), Balanced (`balanced`, default), or Strict (`strict`)
/agentguard checkup              — Run agent health checkup with visual HTML report
/agentguard hermes-hooks         — Configure Hermes Agent shell hooks
```

## Hermes Agent hooks

When installed from SkillHub, Hermes sees the contents of this
`skills/agentguard` directory first. Runtime hooks are not loaded from
`SKILL.md` automatically. Run `agentguard init --agent hermes` to install this
skill into `HERMES_HOME` or `~/.hermes` and merge the hook entries into
`config.yaml`. The `hermes-hooks.yaml` file remains available for manual setups.

The hook runner is `scripts/hermes-hook.js`. It uses the published
`@axorasec/agentguard` package, so run `npm install` inside this skill directory
or install `@axorasec/agentguard` globally if the package is not already present.

## Agent Health Checkup 🦞

Run a full security health check on your AI agent and get a visual report in the browser:

```
/agentguard checkup
```

Evaluates these dimensions:

| Dimension | What's checked |
|-----------|---------------|
| **Skill & Code Safety** | AgentGuard DeepScan of installed skills |
| **Credential & Secrets** | File permissions on `~/.ssh/`, `~/.gnupg/`, leaked keys and API tokens |
| **Network & System** | Dangerous open ports, suspicious cron jobs, sensitive env vars |
| **Runtime Protection** | Security hooks, audit log, whether skills have been scanned |

Scores are combined into a composite 0–100 health score with a tier:

| Score | Tier | Lobster |
|-------|------|---------|
| 90–100 | **S** | 💪 Jacked — 5 random muscular variants |
| 70–89 | **A** | 🛡️ Healthy — 5 random armored variants |
| 50–69 | **B** | ☕ Tired — 5 random sleepy variants |
| 0–49 | **F** | 🚨 Critical — 5 random sick variants |

The report opens automatically in your browser. It includes a shareable image you can post to X, Telegram, or WhatsApp — with tier-specific copy in Chinese and English.

## Requirements

- Node.js 18+

## Author

Built by [Axora Security](https://github.com/AxoraSecurity).
