import type {
  ActionEnvelope,
  PolicyDecision,
  ActionEvidence,
  NetworkRequestData,
  WebSearchData,
  ExecCommandData,
  Web3TxData,
  Web3SignData,
  Decision,
} from '../types/action.js';
import type { RiskLevel } from '../types/scanner.js';
import type { CapabilityModel } from '../types/skill.js';
import { DEFAULT_CAPABILITY } from '../types/skill.js';
import { SkillRegistry } from '../registry/index.js';
import { analyzeNetworkRequest } from './detectors/network.js';
import { analyzeExecCommand } from './detectors/exec.js';
import { detectSecretLeak, containsCriticalSecrets } from './detectors/secret-leak.js';
import { extractDomain } from '../utils/patterns.js';
import { classifySystemPathOperation } from '../utils/system-paths.js';
import * as nodePath from 'path';

/**
 * Action Scanner options
 */
export interface ActionScannerOptions {
  /** Registry instance */
  registry?: SkillRegistry;
  /** Default capabilities when no registry record found */
  defaultCapabilities?: CapabilityModel;
}

function classifySensitiveFilePath(path: string): string | null {
  const normalized = path.replace(/\\/g, '/').toLowerCase();
  const parts = normalized.split('/').filter(Boolean);
  const basename = parts[parts.length - 1] || normalized;

  if (basename === '.env' || basename.startsWith('.env.')) return basename;
  if (basename === '.npmrc' || basename === '.netrc') return basename;
  if (basename === 'credentials.json' || basename === 'serviceaccountkey.json') return basename;
  if (basename === 'id_rsa' || basename === 'id_ed25519') return basename;
  if (basename.includes('private-key') || basename.includes('private_key')) return basename;
  if (basename.includes('seed')) return basename;

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const next = parts[index + 1];
    if (part === '.ssh' || part === '.gnupg') return part;
    if (part === '.aws' && (next === 'credentials' || next === 'config')) return `${part}/${next}`;
    if (part === '.kube' && next === 'config') return `${part}/${next}`;
  }

  return null;
}

/**
 * Action Scanner - Module C
 * Runtime action decision engine
 */
export class ActionScanner {
  private registry: SkillRegistry;
  private defaultCapabilities: CapabilityModel;

  constructor(options: ActionScannerOptions = {}) {
    this.registry = options.registry || new SkillRegistry();
    this.defaultCapabilities = options.defaultCapabilities || DEFAULT_CAPABILITY;
  }

  /**
   * Main decision method
   */
  async decide(envelope: ActionEnvelope): Promise<PolicyDecision> {
    const { actor, action, context } = envelope;

    // Look up skill capabilities
    const lookupResult = await this.registry.lookup(actor.skill);
    const capabilities = lookupResult.record === null
      ? this.defaultCapabilities
      : lookupResult.effective_capabilities;
    const trustLevel = lookupResult.effective_trust_level;

    // Route to appropriate handler based on action type
    switch (action.type) {
      case 'web_search':
        return this.handleWebSearch(action.data as WebSearchData, context.user_present);

      case 'network_request':
        return this.handleNetworkRequest(
          action.data as NetworkRequestData,
          capabilities,
          context.user_present
        );

      case 'exec_command':
        return this.handleExecCommand(
          action.data as ExecCommandData,
          capabilities
        );

      case 'web3_tx':
        return this.handleWeb3Tx(
          action.data as Web3TxData,
          capabilities,
          context.user_present
        );

      case 'web3_sign':
        return this.handleWeb3Sign(
          action.data as Web3SignData,
          capabilities,
          context.user_present
        );

      case 'secret_access':
        return this.handleSecretAccess(
          action.data as { secret_name: string; access_type: string },
          capabilities
        );

      case 'read_file':
      case 'write_file':
        return this.handleFileOperation(
          action.data as { path: string },
          action.type,
          capabilities
        );

      default:
        return {
          decision: 'deny',
          risk_level: 'high',
          risk_tags: ['UNKNOWN_ACTION_TYPE'],
          evidence: [
            {
              type: 'unknown_action',
              description: `Unknown action type: ${action.type}`,
            },
          ],
          explanation: `Unknown action type: ${action.type}`,
        };
    }
  }

  /**
   * Handle web search query actions
   */
  private handleWebSearch(
    search: WebSearchData,
    userPresent: boolean
  ): PolicyDecision {
    if (containsCriticalSecrets(search.query)) {
      return {
        decision: 'deny',
        risk_level: 'critical',
        risk_tags: ['CRITICAL_SECRET_EXFIL'],
        evidence: [
          {
            type: 'critical_secret',
            field: 'query',
            description: 'Search query contains a private key or mnemonic',
          },
        ],
        explanation: 'Critical secret in search query blocked',
      };
    }

    const secretLeak = detectSecretLeak(search.query);
    if (secretLeak.found) {
      return {
        decision: userPresent ? 'confirm' : 'deny',
        risk_level: secretLeak.risk_level,
        risk_tags: ['POTENTIAL_SECRET_EXFIL'],
        evidence: secretLeak.evidence,
        explanation: userPresent
          ? 'Search query may contain sensitive data'
          : 'Search query with sensitive data denied',
      };
    }

    return {
      decision: 'allow',
      risk_level: 'low',
      risk_tags: [],
      evidence: [],
    };
  }

  /**
   * Handle network request actions
   */
  private async handleNetworkRequest(
    request: NetworkRequestData,
    capabilities: CapabilityModel,
    userPresent: boolean
  ): Promise<PolicyDecision> {
    const analysis = analyzeNetworkRequest(
      request,
      capabilities.network_allowlist
    );

    // Critical secret leak - always deny
    if (analysis.risk_tags.includes('CRITICAL_SECRET_EXFIL')) {
      return {
        decision: 'deny',
        risk_level: 'critical',
        risk_tags: analysis.risk_tags,
        evidence: analysis.evidence,
        explanation: analysis.block_reason || 'Critical secret exfiltration blocked',
      };
    }

    // Should block
    if (analysis.should_block) {
      return {
        decision: 'deny',
        risk_level: analysis.risk_level,
        risk_tags: analysis.risk_tags,
        evidence: analysis.evidence,
        explanation: analysis.block_reason || 'Request blocked',
      };
    }

    // High risk - require confirmation
    if (analysis.risk_level === 'high' || analysis.risk_level === 'critical') {
      return {
        decision: userPresent ? 'confirm' : 'deny',
        risk_level: analysis.risk_level,
        risk_tags: analysis.risk_tags,
        evidence: analysis.evidence,
        explanation: userPresent
          ? 'High-risk request requires confirmation'
          : 'High-risk request denied (user not present)',
      };
    }

    // Untrusted read-only fetches are useful enough to allow, but still audit.
    // Mutating requests are elevated by the detector and handled above.
    if (analysis.risk_tags.includes('UNTRUSTED_DOMAIN')) {
      return {
        decision: 'allow',
        risk_level: analysis.risk_level,
        risk_tags: analysis.risk_tags,
        evidence: analysis.evidence,
        explanation: 'Request to untrusted domain allowed with audit',
      };
    }

    // Allow
    return {
      decision: 'allow',
      risk_level: analysis.risk_level,
      risk_tags: analysis.risk_tags,
      evidence: analysis.evidence,
    };
  }

  /**
   * Handle command execution actions
   */
  private handleExecCommand(
    command: ExecCommandData,
    capabilities: CapabilityModel
  ): PolicyDecision {
    const execAllowed = capabilities.exec === 'allow';
    const analysis = analyzeExecCommand(command, execAllowed);

    if (analysis.should_block) {
      // Critical threats (rm -rf, fork bomb, etc.) are always hard denied.
      // Non-critical blocked commands (exec not allowed but not dangerous)
      // return 'confirm' so balanced mode can prompt the user instead of blocking.
      const isCritical = analysis.risk_level === 'critical';
      return {
        decision: isCritical ? 'deny' : 'confirm',
        risk_level: analysis.risk_level,
        risk_tags: analysis.risk_tags,
        evidence: analysis.evidence,
        explanation: analysis.block_reason || 'Command execution blocked',
      };
    }

    // High-risk commands need confirmation even if exec is allowed
    if (analysis.risk_level === 'high' || analysis.risk_level === 'critical') {
      return {
        decision: 'confirm',
        risk_level: analysis.risk_level,
        risk_tags: analysis.risk_tags,
        evidence: analysis.evidence,
        explanation: 'High-risk command requires confirmation',
      };
    }

    return {
      decision: 'allow',
      risk_level: analysis.risk_level,
      risk_tags: analysis.risk_tags,
      evidence: analysis.evidence,
    };
  }

  /**
   * Handle Web3 transaction actions
   */
  private async handleWeb3Tx(
    tx: Web3TxData,
    capabilities: CapabilityModel,
    userPresent: boolean
  ): Promise<PolicyDecision> {
    const evidence: ActionEvidence[] = [];
    const riskTags: string[] = [];
    let riskLevel: RiskLevel = 'low';
    let decision: Decision = 'allow';

    // Check if chain is allowed
    if (capabilities.web3) {
      if (!capabilities.web3.chains_allowlist.includes(tx.chain_id)) {
        evidence.push({
          type: 'chain_not_allowed',
          description: `Chain ${tx.chain_id} not in allowlist`,
        });
        riskTags.push('CHAIN_NOT_ALLOWED');
        riskLevel = 'high';
        decision = 'deny';
      }
    }

    // Apply tx_policy
    if (capabilities.web3) {
      if (capabilities.web3.tx_policy === 'deny') {
        decision = 'deny';
      } else if (
        capabilities.web3.tx_policy === 'confirm_high_risk' &&
        riskLevel !== 'low'
      ) {
        if (decision === 'allow') decision = 'confirm';
      }
    }

    // User not present - upgrade confirm to deny
    if (!userPresent && decision === 'confirm') {
      decision = 'deny';
      evidence.push({
        type: 'user_not_present',
        description: 'Risky transaction denied because user is not present',
      });
    }

    return {
      decision,
      risk_level: riskLevel,
      risk_tags: riskTags,
      evidence,
      explanation:
        decision === 'deny'
          ? 'Transaction blocked due to security risks'
          : decision === 'confirm'
          ? 'Transaction requires user confirmation'
          : 'Transaction allowed',
    };
  }

  /**
   * Handle Web3 sign actions
   */
  private async handleWeb3Sign(
    sign: Web3SignData,
    capabilities: CapabilityModel,
    userPresent: boolean
  ): Promise<PolicyDecision> {
    const evidence: ActionEvidence[] = [];
    const riskTags: string[] = [];
    let riskLevel: RiskLevel = 'low';
    let decision: Decision = 'allow';

    // Check if chain is allowed
    if (capabilities.web3) {
      if (!capabilities.web3.chains_allowlist.includes(sign.chain_id)) {
        evidence.push({
          type: 'chain_not_allowed',
          description: `Chain ${sign.chain_id} not in allowlist`,
        });
        riskTags.push('CHAIN_NOT_ALLOWED');
        riskLevel = 'high';
        decision = 'deny';
      }
    }

    // Check typed data for permit signatures
    if (sign.typed_data) {
      const typedDataStr = JSON.stringify(sign.typed_data);

      // Check for Permit/Permit2 signatures
      if (
        typedDataStr.includes('Permit') ||
        typedDataStr.includes('permit')
      ) {
        evidence.push({
          type: 'permit_signature',
          description: 'Permit signature detected - can grant token approvals',
        });
        riskTags.push('PERMIT_SIGNATURE');
        if (riskLevel === 'low') riskLevel = 'medium';
        if (decision === 'allow') decision = 'confirm';
      }

      // Check for unlimited values
      if (
        typedDataStr.includes('ffffffff') ||
        typedDataStr.includes('max') ||
        /value.*:.*['"]\d{30,}['"]/.test(typedDataStr)
      ) {
        evidence.push({
          type: 'unlimited_value',
          description: 'Signature contains unlimited/max value',
        });
        riskTags.push('UNLIMITED_VALUE');
        if (riskLevel === 'low' || riskLevel === 'medium') riskLevel = 'high';
        if (decision === 'allow') decision = 'confirm';
      }
    }

    // Check message for sensitive data
    if (sign.message) {
      if (containsCriticalSecrets(sign.message)) {
        evidence.push({
          type: 'secret_in_message',
          description: 'Message to sign contains sensitive data',
        });
        riskTags.push('SECRET_IN_SIGNATURE');
        riskLevel = 'critical';
        decision = 'deny';
      }
    }

    // User not present - upgrade confirm to deny
    if (!userPresent && decision === 'confirm') {
      decision = 'deny';
      evidence.push({
        type: 'user_not_present',
        description: 'Risky signature denied because user is not present',
      });
    }

    return {
      decision,
      risk_level: riskLevel,
      risk_tags: riskTags,
      evidence,
      explanation:
        decision === 'deny'
          ? 'Signature request blocked due to security risks'
          : decision === 'confirm'
          ? 'Signature request requires user confirmation'
          : 'Signature request allowed',
    };
  }

  /**
   * Handle secret access
   */
  private handleSecretAccess(
    access: { secret_name: string; access_type: string },
    capabilities: CapabilityModel
  ): PolicyDecision {
    const isAllowed = capabilities.secrets_allowlist.includes(access.secret_name);

    if (isAllowed) {
      return {
        decision: 'allow',
        risk_level: 'low',
        risk_tags: [],
        evidence: [],
      };
    }

    return {
      decision: 'deny',
      risk_level: 'high',
      risk_tags: ['SECRET_NOT_ALLOWED'],
      evidence: [
        {
          type: 'secret_access_denied',
          field: 'secret_name',
          match: access.secret_name,
          description: `Secret ${access.secret_name} not in allowlist`,
        },
      ],
      explanation: `Access to secret '${access.secret_name}' is not allowed`,
    };
  }

  /**
   * Handle file operations
   */
  private handleFileOperation(
    file: { path: string },
    type: 'read_file' | 'write_file',
    capabilities: CapabilityModel
  ): PolicyDecision {
    // Normalize path to prevent traversal attacks (e.g. ./allowed/../../../etc/passwd)
    const normalizedPath = nodePath.normalize(file.path);
    if (normalizedPath !== file.path && file.path.includes('..')) {
      return {
        decision: 'deny',
        risk_level: 'high',
        risk_tags: ['PATH_TRAVERSAL'],
        evidence: [
          {
            type: 'path_traversal',
            field: 'path',
            match: file.path,
            description: `Path traversal detected: "${file.path}" resolves to "${normalizedPath}"`,
          },
        ],
        explanation: 'Path traversal attack blocked',
      };
    }

    const operation = type === 'read_file' ? 'read' : 'write';
    const systemPath = classifySystemPathOperation(normalizedPath, operation);
    if (systemPath) {
      const blocked = systemPath.decision === 'block';
      return {
        decision: blocked ? 'deny' : 'confirm',
        risk_level: systemPath.severity,
        risk_tags: [blocked ? 'SYSTEM_PATH_MUTATION' : 'SYSTEM_PATH_ACCESS'],
        evidence: [
          {
            type: blocked ? 'system_path_mutation' : 'system_path_access',
            field: 'path',
            match: systemPath.path,
            description: `${operation} operation targets ${systemPath.description}`,
          },
        ],
        explanation: blocked
          ? `${type === 'read_file' ? 'Read' : 'Write'} access to '${file.path}' is blocked by system path policy`
          : `${type === 'read_file' ? 'Read' : 'Write'} access to '${file.path}' requires approval`,
      };
    }

    const sensitivePath = classifySensitiveFilePath(normalizedPath);
    if (sensitivePath) {
      return {
        decision: 'confirm',
        risk_level: 'high',
        risk_tags: ['SENSITIVE_PATH'],
        evidence: [
          {
            type: 'sensitive_path',
            field: 'path',
            match: sensitivePath,
            description: 'File path matches a protected credential or secret pattern',
          },
        ],
        explanation: `${type === 'read_file' ? 'Read' : 'Write'} access to '${file.path}' requires approval`,
      };
    }

    // Check if path is in allowlist (use normalized path)
    const hasExplicitAllowlist = capabilities.filesystem_allowlist.length > 0;
    const isAllowed = capabilities.filesystem_allowlist.some((pattern) => {
      if (pattern === '*') return true;
      if (pattern.endsWith('/**')) {
        const prefix = pattern.slice(0, -3);
        return normalizedPath.startsWith(prefix);
      }
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -2);
        const remainder = normalizedPath.slice(prefix.length);
        return normalizedPath.startsWith(prefix) && !remainder.includes('/');
      }
      return normalizedPath === pattern || normalizedPath.startsWith(pattern + '/');
    });

    if (isAllowed) {
      return {
        decision: 'allow',
        risk_level: 'low',
        risk_tags: [],
        evidence: [],
      };
    }

    if (!hasExplicitAllowlist) {
      return {
        decision: 'allow',
        risk_level: 'low',
        risk_tags: [],
        evidence: [],
      };
    }

    return {
      decision: 'confirm',
      risk_level: 'high',
      risk_tags: ['PATH_NOT_ALLOWED'],
      evidence: [
        {
          type: 'path_access_denied',
          field: 'path',
          match: file.path,
          description: `Path ${file.path} not in allowlist`,
        },
      ],
      explanation: `${type === 'read_file' ? 'Read' : 'Write'} access to '${file.path}' is not allowed`,
    };
  }

}

// Export singleton instance
export const actionScanner = new ActionScanner();

// Re-export types and sub-modules
export * from './detectors/index.js';
