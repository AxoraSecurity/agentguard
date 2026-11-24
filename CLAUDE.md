# Axora AgentGuard

Security framework for AI agents. Provides code scanning, runtime action evaluation, and trust management.

## Skill

This project provides a unified Claude Code skill: `/agentguard`

```
/agentguard scan <path>          — AgentGuard DeepScan for security risks
/agentguard action <description> — Evaluate runtime action safety (allow / require approval / block)
/agentguard patrol [run|setup|status] — Daily security patrol for OpenClaw environments
/agentguard trust <subcommand>   — Manage skill trust levels (lookup/attest/revoke/list)
/agentguard report               — View security event audit log
/agentguard config <level>       — Set protection level: Observe (`permissive` in the CLI), Balanced (`balanced`, default), or Strict (`strict`)
/agentguard checkup              — Run agent health checkup with visual HTML report
/agentguard privacy <cmd>        — Opt-in semantic privacy enhancement (status/enable/disable)
```

## Project Structure

- `skills/agentguard/` — Claude Code skill definition and supporting files
- `src/` — TypeScript source (scanner rules, registry, action detectors, MCP server)
- `data/` — Registry storage (`registry.json`)
- `dist/` — Compiled JavaScript output

## Setup for Trust & Action CLI

The `trust` and `action` subcommands use CLI scripts that require the agentguard package:

```bash
cd skills/agentguard/scripts && npm install
```
