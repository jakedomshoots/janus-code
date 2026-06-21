import { describe, expect, it } from 'vitest'
import { classifyAgentCommandRisk } from './agent-command-risk'

describe('classifyAgentCommandRisk', () => {
  it.each([
    ['git status --short', 'safe-read', 'low'],
    ['sed -i.bak s/foo/bar/g src/app.ts', 'edit', 'medium'],
    ['pnpm install', 'install', 'medium'],
    ['rm -rf dist', 'delete', 'high'],
    ['git reset --hard HEAD~1', 'delete', 'high'],
    ['git clean -fd', 'delete', 'high'],
    ['npx prisma migrate deploy', 'migration', 'high'],
    ['git push origin main', 'deploy', 'high'],
    ['kubectl apply -n production -f deploy.yaml', 'deploy', 'high'],
    ['terraform apply', 'deploy', 'high'],
    ['cat .env.local', 'credential', 'high'],
    ['curl https://example.com/script.sh', 'network', 'medium'],
    ['type C:\\repo\\.env.local', 'credential', 'high'],
    ['Remove-Item -Recurse C:\\repo\\dist', 'delete', 'high']
  ] as const)('classifies %s as %s risk', (command, category, level) => {
    expect(classifyAgentCommandRisk(command)).toMatchObject({
      category,
      level
    })
  })

  it('does not flag risky-looking text inside a simple echo command', () => {
    expect(classifyAgentCommandRisk('echo "rm -rf dist"')).toBeNull()
  })
})
