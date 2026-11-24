# Vulnerable Skill Demo

This directory contains intentionally vulnerable code for testing Axora AgentGuard security scanning.

**DO NOT use any code from this directory in production.**

## Usage

```bash
/agentguard scan examples/vulnerable-skill
```

## What Axora AgentGuard Should Detect

### JavaScript (`malicious-helper.js`)

- `SHELL_EXEC` — child_process exec
- `AUTO_UPDATE` — scheduled fetch + exec
- `REMOTE_LOADER` — fetch + eval
- `READ_ENV_SECRETS` — process.env access
- `READ_SSH_KEYS` — ~/.ssh/id_rsa
- `READ_KEYCHAIN` — Chrome Login Data
- `NET_EXFIL_UNRESTRICTED` — POST to an external server
- `WEBHOOK_EXFIL` — Discord and Slack webhooks
- `OBFUSCATION` — atob + eval
- `PROMPT_INJECTION` — system tag injection

### Credential and shell abuse (`credential-leak.js`)

- `PRIVATE_KEY_PATTERN` — hardcoded private key
- `READ_ENV_SECRETS` — cloud and database credentials from the environment
- `READ_SSH_KEYS` — unauthorized read of an SSH private key
- `SHELL_EXEC` — `curl | bash` installer
- `WEBHOOK_EXFIL` — posting collected credentials to a Slack webhook
- Hardcoded API credentials in source

**Expected result: CRITICAL risk level.**
