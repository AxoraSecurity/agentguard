# Architecture

## Project Structure

```
agentguard/
├── skills/agentguard/        # Agent Skills definition
│   ├── SKILL.md               # Skill entry point
│   ├── scan-rules.md          # Detection rule reference
│   ├── action-policies.md     # Action policy reference
│   └── scripts/               # CLI tools (trust-cli, action-cli, guard-hook)
├── hooks/hooks.json           # Plugin hooks configuration
├── src/                       # TypeScript source
│   ├── scanner/               # AgentGuard DeepScan
│   ├── action/                # Runtime action evaluator
│   ├── registry/              # Trust level management
│   ├── policy/                # Default policies and presets
│   └── tests/                 # Test suite
├── examples/vulnerable-skill/ # Demo project for testing
├── data/registry.json         # Trust registry storage
├── setup.sh                   # One-click install script
└── dist/                      # Compiled output
```

## Two-Layer Architecture

```
┌──────────────────────────────────────────────────────┐
│  Layer 1: Auto Guard (hooks — install once, forget)  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ PreToolUse   │ │ PostToolUse  │ │ Config       │  │
│  │ Block danger │ │ Audit log    │ │ 3 levels     │  │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘  │
│         └────────┬───────┘               │           │
│                  ▼                       │           │
│        ActionScanner Engine ◄────────────┘           │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│  Layer 2: AgentGuard DeepScan (on demand)                │
│  /agentguard scan   — static analysis                │
│  /agentguard action — Runtime action evaluation      │
│  /agentguard trust  — Skill trust management         │
│  /agentguard report — Security event log             │
└──────────────────────────────────────────────────────┘
```

## Testing

```bash
npm install && npm run build && npm test
```

The test suite covers scanner rules, the exec command detector, the network request detector, and registry CRUD.
