import { Badge } from '@/components/ui/badge'
import { translate } from '@/i18n/i18n'
import type { ProtectedResourcePolicyMatch } from '../../../../shared/protected-resource-policy'

export function AgentProtectedResourcePolicyBadges({
  matches
}: {
  matches?: readonly ProtectedResourcePolicyMatch[]
}): React.JSX.Element | null {
  if (!matches || matches.length === 0) {
    return null
  }

  return (
    <>
      {matches.map((match) => (
        <Badge
          key={match.policyId}
          variant="outline"
          className="h-5 rounded-md px-1.5 text-[10px] text-muted-foreground"
          title={match.reasons.join(', ')}
        >
          {translate('auto.components.agentWorkspace.protected.protected', 'Protected')} ·{' '}
          {match.label}
        </Badge>
      ))}
    </>
  )
}
