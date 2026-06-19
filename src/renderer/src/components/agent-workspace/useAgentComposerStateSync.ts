import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { decodeAgentModelSelectionsKey } from './agent-composer-readiness'
import {
  isTuiAgentThinkingMode,
  type TuiAgentThinkingMode
} from '../../../../shared/tui-agent-thinking'
import type { TuiAgent } from '../../../../shared/types'

export function useAgentComposerStateSync({
  availableAgents,
  preferredAgent,
  pendingDraftAgent,
  selectedAgent,
  selectedThread,
  draftSessionId,
  settingsModelSelectionsKey,
  settingsThinkingMode,
  onPendingDraftAgentConsumed,
  onDraftSessionAgentChange,
  setSelectedAgent,
  setComposerModelSelections,
  setThinkingMode
}: {
  availableAgents: readonly { id: TuiAgent; label: string }[]
  preferredAgent: TuiAgent | null
  pendingDraftAgent: TuiAgent | null
  selectedAgent: TuiAgent | null
  selectedThread: unknown
  draftSessionId: string | null
  settingsModelSelectionsKey: string
  settingsThinkingMode: TuiAgentThinkingMode | undefined
  onPendingDraftAgentConsumed?: () => void
  onDraftSessionAgentChange?: (agent: TuiAgent) => void
  setSelectedAgent: Dispatch<SetStateAction<TuiAgent | null>>
  setComposerModelSelections: Dispatch<SetStateAction<Partial<Record<TuiAgent, string>>>>
  setThinkingMode: Dispatch<SetStateAction<TuiAgentThinkingMode>>
}): void {
  const onDraftSessionAgentChangeRef = useRef(onDraftSessionAgentChange)
  onDraftSessionAgentChangeRef.current = onDraftSessionAgentChange

  useEffect(() => {
    setSelectedAgent((current) =>
      current && availableAgents.some((agent) => agent.id === current)
        ? current
        : (preferredAgent ?? availableAgents[0]?.id ?? null)
    )
  }, [availableAgents, preferredAgent, setSelectedAgent])

  useEffect(() => {
    if (pendingDraftAgent && availableAgents.some((agent) => agent.id === pendingDraftAgent)) {
      setSelectedAgent(pendingDraftAgent)
    }
    if (pendingDraftAgent) {
      onPendingDraftAgentConsumed?.()
    }
  }, [availableAgents, onPendingDraftAgentConsumed, pendingDraftAgent, setSelectedAgent])

  useEffect(() => {
    if (!selectedThread && draftSessionId && selectedAgent && pendingDraftAgent !== selectedAgent) {
      onDraftSessionAgentChangeRef.current?.(selectedAgent)
    }
  }, [draftSessionId, pendingDraftAgent, selectedAgent, selectedThread])

  useEffect(() => {
    setComposerModelSelections(decodeAgentModelSelectionsKey(settingsModelSelectionsKey))
  }, [setComposerModelSelections, settingsModelSelectionsKey])

  useEffect(() => {
    if (settingsThinkingMode && isTuiAgentThinkingMode(settingsThinkingMode)) {
      setThinkingMode(settingsThinkingMode)
    }
  }, [setThinkingMode, settingsThinkingMode])
}
