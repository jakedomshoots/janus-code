import type { SettingsSearchEntry } from './settings-search'
import { createLocalizedCatalog } from '@/i18n/localized-catalog'
import { translate } from '@/i18n/i18n'
import { translateSearchKeyword } from './settings-search-keywords'

export const getGuiAgentWorkspaceSearchEntry = createLocalizedCatalog(
  (): SettingsSearchEntry => ({
    title: translate(
      'auto.components.settings.experimental.search.guiAgentWorkspace.title',
      'GUI agent workspace'
    ),
    description: translate(
      'auto.components.settings.experimental.search.guiAgentWorkspace.description',
      'Replaces the terminal-first workspace with a GUI-first agent workspace while keeping the terminal available as a debug panel.'
    ),
    keywords: [
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.0d24759f14',
        'experimental'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.gui',
        'gui'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.workspace',
        'workspace'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.agent',
        'agent'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.agents',
        'agents'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.t3',
        't3'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.codex',
        'codex'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.desktop',
        'desktop'
      )
    ]
  })
)
