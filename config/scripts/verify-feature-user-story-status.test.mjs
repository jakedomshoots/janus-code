/* oxlint-disable no-unused-expressions */
import { describe as c, expect as s, it as a } from 'vitest'
import { makeProject as r } from './feature-user-story-status-test-project.mjs'
import { main as n } from './verify-feature-user-story-status.mjs'
import { COMPLETE_FIXTURE_IDS as i } from './feature-user-story-status-fixture-ids.mjs'
import { COMPLETE_FIXTURE_CSV_ROWS as u } from './feature-user-story-status-csv-fixture-rows.mjs'
function o(t) {
  const e = t.split(':')[0] ?? 'feature'
  return `${t},${e},${t},"As a user, I can use ${t}.",The code-backed inventory includes ${t} and the app can expose it.,code,manual,Documented,2026-06-19,`
}
c('verify-feature-user-story-status', () => {
  ;(a('accepts a canonical spreadsheet that covers code-backed feature inventories', async () => {
    const t = r({ csvRows: u })
    await s(n(t)).resolves.toBe(0)
  }),
    a('rejects missing rows for persisted feature interactions', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects duplicate spreadsheet ids', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:workspace-board,interaction,Workspace board duplicate,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature education tips', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for terminal pane split sources', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'terminal-pane-split-source:keyboard').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for setup guide sources', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'setup-guide-source:help_menu').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature education sources', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'feature-education-source:tasks_open').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature interaction categories', async () => {
      const t = r({
        csvRows: i
          .filter((e) => e !== 'feature-interaction-category:source_control')
          .map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature interaction usage buckets', async () => {
      const t = r({
        csvRows: i
          .filter((e) => e !== 'feature-interaction-usage-bucket:count_1000_plus')
          .map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for agent terminal reveal reasons', async () => {
      const t = r({
        csvRows: i
          .filter((e) => e !== 'agent-terminal-reveal-reason:keyboard-shortcut')
          .map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for Computer Use permissions', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'computer-use-permission:screenshots').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for contextual tour outcomes', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'contextual-tour-outcome:skipped').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for setup guide close outcomes', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'setup-guide-close-outcome:interrupted').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for onboarding flow steps', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'onboarding-flow-step:integrations').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for right sidebar routes', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for settings navigation groups', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for settings sections', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for supported CLI agents', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for keyboard shortcut actions', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for default status bar items', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for onboarding feature setup items', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature wall setup steps', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature wall workflows', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature wall agent steps', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
          'feature-wall-workflow:tasks,feature-wall-workflow,Tasks,"As a user, I can tour Tasks in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
          'feature-wall-agent-step:statuses,feature-wall-agent-step,Agent Visibility,"As a user, I can tour Agent Visibility in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature wall workbench steps', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
          'feature-wall-workflow:tasks,feature-wall-workflow,Tasks,"As a user, I can tour Tasks in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
          'feature-wall-agent-step:statuses,feature-wall-agent-step,Agent Visibility,"As a user, I can tour Agent Visibility in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-agent-step:usage,feature-wall-agent-step,Usage,"As a user, I can tour Usage in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-workbench-step:terminal,feature-wall-workbench-step,Terminal,"As a user, I can tour Terminal in the feature wall.",The workbench step registry includes the step and completion can track it,src/shared/workbench-steps.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for feature wall review steps', async () => {
      const t = r({
        csvRows: [
          'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
          'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
          'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
          'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
          'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
          'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
          'feature-wall-workflow:tasks,feature-wall-workflow,Tasks,"As a user, I can tour Tasks in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
          'feature-wall-agent-step:statuses,feature-wall-agent-step,Agent Visibility,"As a user, I can tour Agent Visibility in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-agent-step:usage,feature-wall-agent-step,Usage,"As a user, I can tour Usage in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-workbench-step:terminal,feature-wall-workbench-step,Terminal,"As a user, I can tour Terminal in the feature wall.",The workbench step registry includes the step and completion can track it,src/shared/workbench-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-workbench-step:browser,feature-wall-workbench-step,Browser,"As a user, I can tour Browser in the feature wall.",The workbench step registry includes the step and completion can track it,src/shared/workbench-steps.ts,manual,Documented,2026-06-19,',
          'feature-wall-review-step:notes,feature-wall-review-step,Notes,"As a user, I can tour Notes in the feature wall.",The review step registry includes the step and completion can track it,src/shared/review-steps.ts,manual,Documented,2026-06-19,'
        ]
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for source-control actions', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'source-control-action:resolveComments').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for browser viewport presets', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'browser-viewport-preset:desktop').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for app icon options', async () => {
      const t = r({ csvRows: i.filter((e) => e !== 'app-icon:blue').map((e) => o(e)) })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for Linear estimate presets', async () => {
      const t = r({ csvRows: i.filter((e) => e !== 'linear-estimate-preset:8').map((e) => o(e)) })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for browser annotation intent options', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'browser-annotation-intent:question').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for terminal scrollback presets', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'terminal-scrollback-preset-mb:250').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for terminal quick command agent options', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'terminal-quick-command-agent:openclaude').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for markdown edit view modes', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'markdown-edit-view-mode:rich').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for editor toggle modes', async () => {
      const t = r({ csvRows: i.filter((e) => e !== 'editor-toggle-mode:changes').map((e) => o(e)) })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for branch prefix options', async () => {
      const t = r({ csvRows: i.filter((e) => e !== 'branch-prefix-option:none').map((e) => o(e)) })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for voice dictation modes', async () => {
      const t = r({ csvRows: i.filter((e) => e !== 'voice-dictation-mode:hold').map((e) => o(e)) })
      await s(n(t)).resolves.toBe(1)
    }),
    a('rejects missing rows for mobile auto-restore fit options', async () => {
      const t = r({
        csvRows: i.filter((e) => e !== 'mobile-auto-restore-fit:30m').map((e) => o(e))
      })
      await s(n(t)).resolves.toBe(1)
    }))
})
