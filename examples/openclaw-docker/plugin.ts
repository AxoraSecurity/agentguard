import { registerOpenClawPlugin } from '@axorasec/agentguard';

export default function setup(api) {
  registerOpenClawPlugin(api, {
    level: 'balanced',
    skipAutoScan: false,
  });
}
