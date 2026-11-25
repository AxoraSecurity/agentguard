# Vulnerable Skill Demo

This directory contains intentionally vulnerable code for testing Axora AgentGuard security scanning.

**DO NOT use any code from this directory in production.**

## Usage

```bash
/agentguard scan examples/vulnerable-skill
```

## Expected Built-in Scanner Findings

### JavaScript (`malicious-helper.js`)

- `SHELL_EXEC` — child_process exec
- `AUTO_UPDATE` — scheduled fetch + exec
- `READ_ENV_SECRETS` — process.env access
- `READ_SSH_KEYS` — ~/.ssh/id_rsa
- `READ_KEYCHAIN` — Chrome Login Data
- `WEBHOOK_EXFIL` — webhook-based exfiltration
- `DYNAMIC_CODE_EXECUTION` — dynamic code execution
- `PROMPT_INJECTION` — system tag injection

### Credential and shell abuse (`credential-leak.js`)

- `PRIVATE_KEY_PATTERN` — hardcoded private key
- `READ_ENV_SECRETS` — cloud and database credentials from the environment
- `READ_SSH_KEYS` — unauthorized read of an SSH private key
- `SHELL_EXEC` — `curl | bash` installer
- `WEBHOOK_EXFIL` — posting collected credentials to a Slack webhook
- `AUTO_UPDATE` — downloaded script execution
- `DYNAMIC_CODE_EXECUTION` — dynamic shell execution

**Expected result: CRITICAL risk level, with findings in both JavaScript files.**
