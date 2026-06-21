export type ProtectedResourcePolicyScope =
  | { readonly kind: 'global' }
  | { readonly kind: 'repo'; readonly repoId: string }

export type ProtectedResourcePolicy = {
  readonly id: string
  readonly label: string
  readonly scope: ProtectedResourcePolicyScope
  readonly pathPatterns?: readonly string[]
  readonly commandPatterns?: readonly string[]
  readonly branchPatterns?: readonly string[]
  readonly environmentPatterns?: readonly string[]
}

export type ProtectedResourcePolicyShellKind = 'posix' | 'powershell' | 'cmd' | 'unsupported'

export type ProtectedResourcePolicyMatchReason =
  | 'path'
  | 'command'
  | 'branch'
  | 'environment'
  | 'unsupported-shell'

export type ProtectedResourcePolicyContext = {
  readonly repoId?: string | null
  readonly command?: string | null
  readonly branchName?: string | null
  readonly environmentName?: string | null
  readonly targetPaths?: readonly string[]
  readonly platform?: NodeJS.Platform
  readonly shellKind?: ProtectedResourcePolicyShellKind
}

export type ProtectedResourcePolicyMatch = {
  readonly policyId: string
  readonly label: string
  readonly scope: ProtectedResourcePolicyScope
  readonly requiresApproval: true
  readonly reasons: readonly ProtectedResourcePolicyMatchReason[]
}

export function matchProtectedResourcePolicies(
  policies: readonly ProtectedResourcePolicy[] | null | undefined,
  context: ProtectedResourcePolicyContext
): readonly ProtectedResourcePolicyMatch[] {
  if (!policies || policies.length === 0) {
    return []
  }

  return policies.flatMap((policy) => {
    if (!policyAppliesToScope(policy, context.repoId)) {
      return []
    }
    const reasons = getPolicyMatchReasons(policy, context)
    if (reasons.length === 0) {
      return []
    }
    return [
      {
        policyId: policy.id,
        label: policy.label,
        scope: policy.scope,
        requiresApproval: true as const,
        reasons
      }
    ]
  })
}

function policyAppliesToScope(
  policy: ProtectedResourcePolicy,
  repoId: string | null | undefined
): boolean {
  return policy.scope.kind === 'global' || policy.scope.repoId === repoId
}

function getPolicyMatchReasons(
  policy: ProtectedResourcePolicy,
  context: ProtectedResourcePolicyContext
): ProtectedResourcePolicyMatchReason[] {
  const reasons: ProtectedResourcePolicyMatchReason[] = []

  // Why: when the shell cannot be classified, do not parse command text as safe;
  // require approval for command-protected policies instead.
  if (policy.commandPatterns?.length && context.shellKind === 'unsupported') {
    reasons.push('unsupported-shell')
  } else if (matchesAny(context.command, policy.commandPatterns)) {
    reasons.push('command')
  }

  if (matchesAny(context.branchName, policy.branchPatterns)) {
    reasons.push('branch')
  }
  if (matchesAny(context.environmentName, policy.environmentPatterns)) {
    reasons.push('environment')
  }
  if (matchesAnyPath(context.targetPaths, policy.pathPatterns, context.platform)) {
    reasons.push('path')
  }

  return reasons
}

function matchesAny(value: string | null | undefined, patterns?: readonly string[]): boolean {
  const normalizedValue = value?.trim()
  if (!normalizedValue || !patterns || patterns.length === 0) {
    return false
  }
  return patterns.some((pattern) =>
    wildcardPatternToRegExp(pattern, { pathSegments: false }).test(normalizedValue)
  )
}

function matchesAnyPath(
  paths: readonly string[] | null | undefined,
  patterns: readonly string[] | undefined,
  platform: NodeJS.Platform | undefined
): boolean {
  if (!paths || paths.length === 0 || !patterns || patterns.length === 0) {
    return false
  }
  const normalizedPaths = paths.map((path) => normalizePolicyPath(path, platform))
  return patterns.some((pattern) => {
    const matcher = wildcardPatternToRegExp(normalizePolicyPath(pattern, platform), {
      pathSegments: true
    })
    return normalizedPaths.some((path) => matcher.test(path))
  })
}

function normalizePolicyPath(value: string, platform: NodeJS.Platform | undefined): string {
  const normalized = value.trim().replace(/\\/g, '/')
  return platform === 'win32' ? normalized.toLowerCase() : normalized
}

function wildcardPatternToRegExp(
  pattern: string,
  { pathSegments }: { pathSegments: boolean }
): RegExp {
  let source = ''
  const trimmed = pattern.trim()
  for (let index = 0; index < trimmed.length; index += 1) {
    const character = trimmed[index]
    if (character === '*' && trimmed[index + 1] === '*') {
      source += '.*'
      index += 1
      continue
    }
    if (character === '*') {
      source += pathSegments ? '[^/]*' : '.*'
      continue
    }
    source += escapeRegExp(character)
  }
  return new RegExp(`^${source}$`, 'i')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
