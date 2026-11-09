import { registerOpenClawPlugin } from '@axora/agentguard';

export default function setup(api) {
  registerOpenClawPlugin(api, {
    level: 'balanced',
    skipAutoScan: false,
  });
}
