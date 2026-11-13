// @vitest-environment node
import { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

const eslint = new ESLint();

// The first lint loads the full config and plugins, which can take longer
// than the default test timeout when other test files run in parallel.
beforeAll(async () => {
  await eslint.lintText('', { filePath: 'src/warmup.ts' });
}, 30_000);

const errorsFor = async (filePath: string, code: string) => {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === 'no-restricted-imports');
};

describe('mock folder import rule', () => {
  it('fails when a screen or component imports the mock folder', async () => {
    expect(await errorsFor('src/pages/Dashboard.tsx', "import { mockServer } from '../api/mock/server';\n")).toHaveLength(1);
    expect(await errorsFor('src/components/Card.tsx', "import members from '../api/mock/members';\n")).toHaveLength(1);
  });

  it('allows the api client and test files', async () => {
    expect(await errorsFor('src/api/client.ts', "import { mockServer } from './mock/server';\n")).toHaveLength(0);
    expect(await errorsFor('src/pages/Dashboard.test.tsx', "import { resetMockServer } from '../api/mock/server';\n")).toHaveLength(0);
  });
});
