import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '..', '..');
const readJson = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8'));

describe('Axora npm release metadata', () => {
  const pkg = readJson('package.json');
  const lock = readJson('package-lock.json');
  const skill = readJson('skills/agentguard/package.json');

  it('publishes under the public Axora scope with a matching lockfile', () => {
    assert.equal(pkg.name, '@axora/agentguard');
    assert.equal(pkg.publishConfig?.access, 'public');
    assert.deepEqual(pkg.bin, { agentguard: 'dist/cli.js', 'agentguard-mcp': 'dist/mcp-server.js' });
    assert.equal(lock.name, pkg.name);
    assert.equal(lock.packages[''].name, pkg.name);
    assert.equal(lock.version, pkg.version);
  });

  it('installs the same Axora package from the bundled skill', () => {
    assert.equal(skill.dependencies?.[pkg.name], `^${pkg.version}`);
  });

  it('points the DSH bundle at the Axora package', () => {
    assert.match(readFileSync(join(root, 'dsh.cordis.patch.yml'), 'utf8'),
      /name: '@axora\/agentguard\/dist\/dsh\/plugin\.js'/);
  });
});
