import { describe, expect, it } from 'vitest'
import { matchProtectedResourcePolicies } from './protected-resource-policy'

describe('protected resource policy', () => {
  it('matches protected command, branch, environment, and paths cross-platform', () => {
    const matches = matchProtectedResourcePolicies(
      [
        {
          id: 'prod-policy',
          label: 'Production guard',
          scope: { kind: 'global' },
          commandPatterns: ['*kubectl*prod*'],
          branchPatterns: ['main'],
          environmentPatterns: ['production'],
          pathPatterns: ['**/.env*']
        }
      ],
      {
        repoId: 'repo-1',
        command: 'kubectl apply -f prod/deploy.yaml',
        branchName: 'main',
        environmentName: 'production',
        targetPaths: ['C:\\repo\\.env.production'],
        platform: 'win32',
        shellKind: 'posix'
      }
    )

    expect(matches).toEqual([
      {
        policyId: 'prod-policy',
        label: 'Production guard',
        scope: { kind: 'global' },
        requiresApproval: true,
        reasons: ['command', 'branch', 'environment', 'path']
      }
    ])
  })

  it('keeps repo-scoped policies isolated while preserving global policies', () => {
    const matches = matchProtectedResourcePolicies(
      [
        {
          id: 'global-prod',
          label: 'Global prod',
          scope: { kind: 'global' },
          branchPatterns: ['release/*']
        },
        {
          id: 'repo-prod',
          label: 'Repo prod',
          scope: { kind: 'repo', repoId: 'repo-1' },
          branchPatterns: ['release/*']
        },
        {
          id: 'other-repo-prod',
          label: 'Other repo prod',
          scope: { kind: 'repo', repoId: 'repo-2' },
          branchPatterns: ['release/*']
        }
      ],
      {
        repoId: 'repo-1',
        branchName: 'release/2026-06',
        platform: 'linux',
        shellKind: 'posix'
      }
    )

    expect(matches.map((match) => match.policyId)).toEqual(['global-prod', 'repo-prod'])
  })

  it('requires approval for unsupported shells when command patterns exist', () => {
    const matches = matchProtectedResourcePolicies(
      [
        {
          id: 'prod-command',
          label: 'Production command',
          scope: { kind: 'global' },
          commandPatterns: ['terraform apply*']
        }
      ],
      {
        repoId: 'repo-1',
        command: 'terraform apply -auto-approve',
        platform: 'linux',
        shellKind: 'unsupported'
      }
    )

    expect(matches).toEqual([
      {
        policyId: 'prod-command',
        label: 'Production command',
        scope: { kind: 'global' },
        requiresApproval: true,
        reasons: ['unsupported-shell']
      }
    ])
  })
})
