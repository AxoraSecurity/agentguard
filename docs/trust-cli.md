# Trust Management

Axora AgentGuard includes a trust registry for managing skill permissions.

## Commands

### Attest (Register a Skill)

```
/agentguard trust attest --id my-bot --source github.com/org/bot --version v1.0.0 --hash abc --trust-level restricted --preset read_only --reviewed-by admin
```

### Lookup

```
/agentguard trust lookup --source github.com/org/bot
```

### Revoke

```
/agentguard trust revoke --source github.com/org/bot --reason "security concern"
```

### List

```
/agentguard trust list --trust-level trusted
```

## Trust Levels

| Level | Description |
|-------|-------------|
| `trusted` | Full access per its capability model |
| `restricted` | Limited access, some actions require confirmation |
| `untrusted` | Minimal access, most actions blocked or require confirmation |

## Capability Presets

| Preset | Network | Filesystem | Exec | Secrets |
|--------|---------|------------|------|---------|
| `none` | No | No | No | No |
| `read_only` | No | Read `./**` | No | No |

## Auto-Scan on Session Start

When installed as a Claude Code plugin, AgentGuard automatically scans new skills on session start:

- Discovers skills in `~/.claude/skills/`
- Calculates artifact hash and checks the registry
- Runs `quickScan` on new or updated skills
- Auto-registers with trust level based on scan results:
  - Low risk → `trusted`
  - Medium risk → `restricted`
  - High/Critical risk → `untrusted`
