import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  applyAgentPermissionMode,
  type AgentPermissionMode
} from '../../../../shared/tui-agent-permissions'
import {
  isTuiAgentModelSelection,
  TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
} from '../../../../shared/tui-agent-models'
import type { GlobalSettings, TuiAgent } from '../../../../shared/types'

export function useAgentComposerSettingsActions({
  selectedAgent,
  composerModelSelections,
  settings,
  updateSettings,
  setComposerModelSelections
}: {
  selectedAgent: TuiAgent | null
  composerModelSelections: Partial<Record<TuiAgent, string>>
  settings: GlobalSettings | null | undefined
  updateSettings: (patch: Partial<GlobalSettings>) => void | Promise<void>
  setComposerModelSelections: Dispatch<SetStateAction<Partial<Record<TuiAgent, string>>>>
}): {
  changeSelectedModel: (modelId: string) => void
  changePermissionMode: (mode: AgentPermissionMode) => void
} {
  const changeSelectedModel = useCallback(
    (modelId: string): void => {
      if (!selectedAgent || !isTuiAgentModelSelection(selectedAgent, modelId)) {
        return
      }
      const nextSelections = { ...composerModelSelections }
      if (modelId === TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID) {
        delete nextSelections[selectedAgent]
      } else {
        nextSelections[selectedAgent] = modelId
      }
      setComposerModelSelections(nextSelections)
      void updateSettings({ agentModelSelections: nextSelections })
    },
    [composerModelSelections, selectedAgent, setComposerModelSelections, updateSettings]
  )

  const changePermissionMode = useCallback(
    (mode: AgentPermissionMode): void => {
      if (mode === 'mixed') {
        return
      }
      void updateSettings(
        applyAgentPermissionMode({
          mode,
          agentDefaultArgs: settings?.agentDefaultArgs,
          agentDefaultEnv: settings?.agentDefaultEnv
        })
      )
    },
    [settings?.agentDefaultArgs, settings?.agentDefaultEnv, updateSettings]
  )

  return { changeSelectedModel, changePermissionMode }
}
