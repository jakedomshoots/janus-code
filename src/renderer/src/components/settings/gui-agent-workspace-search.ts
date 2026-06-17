import type { SettingsSearchEntry } from './settings-search'
import { createLocalizedCatalog } from '@/i18n/localized-catalog'
import { translate } from '@/i18n/i18n'
import { translateSearchKeyword } from './settings-search-keywords'

export const getGuiAgentWorkspaceSearchEntry = createLocalizedCatalog(
  (): SettingsSearchEntry => ({
    title: translate(
      'auto.components.settings.experimental.search.guiAgentWorkspace.title',
      'Classic terminal workspace'
    ),
    description: translate(
      'auto.components.settings.experimental.search.guiAgentWorkspace.description',
      'Use the classic terminal-first workspace as the primary workspace. The GUI agent workspace remains the default.'
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
        'auto.components.settings.experimental.search.guiAgentWorkspace.classic',
        'classic'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.terminal',
        'terminal'
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
        'auto.components.settings.experimental.search.guiAgentWorkspace.codexDesktop',
        'codex desktop'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.codex',
        'codex'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.desktop',
        'desktop'
      ),
      ...translateSearchKeyword(
        'auto.components.settings.experimental.search.guiAgentWorkspace.fallback',
        'fallback'
      )
    ]
  })
)
