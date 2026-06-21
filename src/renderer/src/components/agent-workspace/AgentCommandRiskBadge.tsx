import { cn } from '@/lib/utils'
import { translate } from '@/i18n/i18n'
import type { AgentCommandRisk } from '../../../../shared/agent-command-risk'

export function AgentCommandRiskBadge({
  risk,
  className
}: {
  risk: AgentCommandRisk
  className?: string
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px]',
        getRiskBadgeClassName(risk.level),
        className
      )}
      title={risk.reason}
    >
      {getRiskLevelLabel(risk.level)} · {getRiskCategoryLabel(risk.category)}
    </span>
  )
}

function getRiskBadgeClassName(level: AgentCommandRisk['level']): string {
  switch (level) {
    case 'high':
      return 'border-destructive/40 bg-destructive/10 text-destructive'
    case 'medium':
      return 'border-border bg-muted text-muted-foreground'
    case 'low':
      return 'border-border bg-background text-muted-foreground'
  }
}

function getRiskLevelLabel(level: AgentCommandRisk['level']): string {
  switch (level) {
    case 'high':
      return translate('auto.components.agentWorkspace.risk.high', 'High risk')
    case 'medium':
      return translate('auto.components.agentWorkspace.risk.medium', 'Medium risk')
    case 'low':
      return translate('auto.components.agentWorkspace.risk.low', 'Low risk')
  }
}

function getRiskCategoryLabel(category: AgentCommandRisk['category']): string {
  switch (category) {
    case 'safe-read':
      return translate('auto.components.agentWorkspace.risk.safeRead', 'Safe read')
    case 'edit':
      return translate('auto.components.agentWorkspace.risk.edit', 'Edit')
    case 'install':
      return translate('auto.components.agentWorkspace.risk.install', 'Install')
    case 'delete':
      return translate('auto.components.agentWorkspace.risk.delete', 'Delete')
    case 'migration':
      return translate('auto.components.agentWorkspace.risk.migration', 'Migration')
    case 'deploy':
      return translate('auto.components.agentWorkspace.risk.deploy', 'Deploy')
    case 'credential':
      return translate('auto.components.agentWorkspace.risk.credential', 'Credential')
    case 'network':
      return translate('auto.components.agentWorkspace.risk.network', 'Network')
  }
}
