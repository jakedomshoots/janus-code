/* oxlint-disable no-unused-expressions */
import r from 'node:fs/promises'
import n from 'node:path'
function a(t) {
  return [...t.matchAll(/\bid:\s*'([^']+)'/g)].map((e) => e[1])
}
function Gt(t) {
  const e = new Set([...t.matchAll(/\btab\s*===\s*'([^']+)'/g)].map((c) => c[1])),
    s = []
  ;(e.has('explorer') && s.push('right-sidebar:explorer-files'),
    e.has('search') && s.push('right-sidebar:explorer-search'))
  for (const c of [...e].sort()) {
    c !== 'explorer' && c !== 'search' && s.push(`right-sidebar:${c}`)
  }
  return s
}
function Vt(t) {
  const e = t.match(/const SETTINGS_NAV_GROUPS = \[([\s\S]*?)\]\s+as const/)
  return e ? a(e[1]).map((s) => `settings-nav:${s}`) : []
}
function Wt(t) {
  return [...t.matchAll(/<SettingsSection\s+id="([^"]+)"/g)].map((e) => `settings-section:${e[1]}`)
}
function Kt(t) {
  const e = t.match(/export const TUI_AGENT_CONFIG[\s\S]*?= \{([\s\S]*?)\n\}/)
  return e
    ? [...e[1].matchAll(/^\s{2}(?:'([^']+)'|([A-Za-z][\w-]*)):\s*\{/gm)].map(
        (s) => `tui-agent:${s[1] ?? s[2]}`
      )
    : []
}
function Bt(t) {
  const e = t.match(/export const TUI_AGENT_THINKING_MODES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `tui-agent-thinking-mode:${s[1]}`) : []
}
function Yt(t) {
  const e = t.match(/export const TASK_PROVIDERS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `task-provider:${s[1]}`) : []
}
function Xt(t) {
  const e = t.match(/export const DEFAULT_WORKSPACE_STATUSES[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `workspace-status:${s}`) : []
}
function qt(t) {
  const e = t.match(/export const WORKSPACE_STATUS_COLOR_IDS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `workspace-status-color:${s[1]}`) : []
}
function zt(t) {
  const e = t.match(/export const WORKSPACE_STATUS_ICON_IDS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `workspace-status-icon:${s[1]}`) : []
}
function Jt(t) {
  const e = t.match(/export const AUTOMATION_SCHEDULE_PRESET_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e
    ? [...e[1].matchAll(/\[\s*'([^']+)'/g)].map((s) => `automation-schedule-preset:${s[1]}`)
    : []
}
function Qt(t) {
  const e = t.match(/export const AUTOMATION_CRON_FIELD_LABELS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `automation-cron-field:${i(s[1])}`) : []
}
function Zt(t) {
  const e = []
  for (const s of ['FIXED_WORKTREE_CARD_PROPERTIES', 'DEFAULT_WORKTREE_CARD_PROPERTIES']) {
    const c = t.match(new RegExp(`(?:const|export const) ${s}[\\s\\S]*?= \\[([\\s\\S]*?)\\]`))
    c && e.push(...[...c[1].matchAll(/'([^']+)'/g)].map((l) => l[1]))
  }
  return [...new Set(e)].map((s) => `worktree-card-property:${s}`)
}
function te(t) {
  const e = t.match(/export const DEFAULT_OPEN_IN_APPLICATIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `open-in-application:${s}`) : []
}
function ee(t) {
  const e = t.match(
    /updateSettings\(\{\s*terminalLigatures:\s*option\s*\}\)[\s\S]*?options=\{\[([\s\S]*?)\]\}/
  )
  return e
    ? [...e[1].matchAll(/\bvalue:\s*'([^']+)'/g)].map((s) => `terminal-ligature-mode:${s[1]}`)
    : []
}
function se(t) {
  const e = t.match(/export const PROJECT_ORDER_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `sidebar-project-order:${s}`) : []
}
function re(t) {
  const e = t.match(/export const CARD_LAYOUT_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `sidebar-card-layout:${s}`) : []
}
function ne(t) {
  const e = t.match(/export const AGENT_ACTIVITY_DISPLAY_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `sidebar-agent-activity-display:${s}`) : []
}
function ce(t) {
  const e = t.match(/export const GROUP_BY_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `sidebar-workspace-group:${s}`) : []
}
function oe(t) {
  const e = t.match(/export const SORT_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `sidebar-workspace-sort:${s}`) : []
}
function ae(t) {
  const e = t.match(/export const KEYBINDING_DEFINITIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `keybinding:${s}`) : []
}
function ie(t) {
  const e = t.match(/export const DEFAULT_STATUS_BAR_ITEMS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `status-bar:${s[1]}`) : []
}
function le(t) {
  const e = t.match(/export const ONBOARDING_FEATURE_SETUP_IDS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `onboarding-feature-setup:${s[1]}`) : []
}
function ue(t) {
  const e = t.match(/export const FEATURE_WALL_SETUP_STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `feature-wall-setup:${s}`) : []
}
function me(t) {
  const e = t.match(/export const FEATURE_WALL_WORKFLOWS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `feature-wall-workflow:${s}`) : []
}
function pe(t) {
  const e = t.match(/export const AGENTS_STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `feature-wall-agent-step:${s}`) : []
}
function Se(t) {
  const e = t.match(/export const WORKBENCH_STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `feature-wall-workbench-step:${s}`) : []
}
function de(t) {
  const e = t.match(/export const REVIEW_STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `feature-wall-review-step:${s}`) : []
}
function he(t) {
  const e = t.match(/export const CONTEXTUAL_TOURS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `contextual-tour:${s}`) : []
}
function fe(t) {
  const e = t.match(/export const STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `onboarding-flow-step:${s}`) : []
}
function Te(t) {
  const e = t.match(/export const FEATURE_EDUCATION_SOURCES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `feature-education-source:${s[1]}`) : []
}
function Ee(t) {
  const e = t.match(/export const CONTEXTUAL_TOUR_OUTCOMES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `contextual-tour-outcome:${s[1]}`) : []
}
function ge(t) {
  const e = t.match(/export const TERMINAL_PANE_SPLIT_SOURCES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `terminal-pane-split-source:${s[1]}`) : []
}
function Ae(t) {
  const e = t.match(/export const SETUP_GUIDE_SOURCES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `setup-guide-source:${s[1]}`) : []
}
function _e(t) {
  const e = t.match(/export const SETUP_GUIDE_CLOSE_OUTCOMES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `setup-guide-close-outcome:${s[1]}`) : []
}
function Ie(t) {
  const e = []
  for (const s of ['SOURCE_CONTROL_TEXT_ACTION_IDS', 'SOURCE_CONTROL_LAUNCH_ACTION_IDS']) {
    const c = t.match(new RegExp(`export const ${s}[\\s\\S]*?= \\[([\\s\\S]*?)\\]`))
    c && e.push(...[...c[1].matchAll(/'([^']+)'/g)].map((l) => l[1]))
  }
  return e.map((s) => `source-control-action:${s}`)
}
function xe(t) {
  const e = t.match(/export const REPO_COLORS[\s\S]*?= \[([\s\S]*?)\]/)
  return e
    ? [...e[1].matchAll(/'#([0-9a-fA-F]{6})'/g)].map(
        (s) => `repo-badge-color:${s[1].toLowerCase()}`
      )
    : []
}
function Oe(t) {
  const e = t.match(/export const WORKSPACE_SOURCE_VALUES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `workspace-create-source:${s[1]}`) : []
}
function Re(t) {
  const e = t.match(/export const BROWSER_VIEWPORT_PRESETS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `browser-viewport-preset:${s}`) : []
}
function ke(t) {
  const e = t.match(/export const APP_ICON_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e ? a(e[1]).map((s) => `app-icon:${s}`) : []
}
function Ne(t) {
  const e = t.match(/const LINEAR_ESTIMATE_PRESETS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/\b(\d+)\b/g)].map((s) => `linear-estimate-preset:${s[1]}`) : []
}
function Fe(t) {
  const e = t.match(/const BROWSER_ANNOTATION_INTENT_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e
    ? [...e[1].matchAll(/\bvalue:\s*'([^']+)'/g)].map((s) => `browser-annotation-intent:${s[1]}`)
    : []
}
function Pe(t) {
  const e = t.match(/const EMPTY_STATE_ACTION_IDS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `cmd-j-empty-state-action:${s[1]}`) : []
}
function Ce(t) {
  const e = t.match(/export const SCROLLBACK_PRESETS_MB[\s\S]*?= \[([\s\S]*?)\]/)
  return e
    ? [...e[1].matchAll(/\b(\d+)\b/g)].map((s) => `terminal-scrollback-preset-mb:${s[1]}`)
    : []
}
function be(t) {
  const e = t.match(/const QUICK_COMMAND_AGENT_PRESENTATION_ORDER[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e
    ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `terminal-quick-command-agent:${s[1]}`)
    : []
}
function $e(t) {
  const e = t.match(/const MARKDOWN_EDIT_VIEW_MODES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `markdown-edit-view-mode:${s[1]}`) : []
}
function ve(t) {
  const e = t.match(/const CODE_EDIT_TOGGLE_MODES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `editor-toggle-mode:${s[1]}`) : []
}
function we(t) {
  const e = t.match(/\[\s*'git-username'\s*,\s*'custom'\s*,\s*'none'\s*\]\s+as const/)
  return e ? [...e[0].matchAll(/'([^']+)'/g)].map((s) => `branch-prefix-option:${s[1]}`) : []
}
function je(t) {
  const e = t.match(/\[\s*'toggle'\s*,\s*'hold'\s*\]\s+as const/)
  return e ? [...e[0].matchAll(/'([^']+)'/g)].map((s) => `voice-dictation-mode:${s[1]}`) : []
}
function Ue(t) {
  const e = t.match(/AUTO_RESTORE_FIT_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e
    ? [...e[1].matchAll(/\bvalue:\s*'([^']+)'/g)].map((s) => `mobile-auto-restore-fit:${s[1]}`)
    : []
}
function Le(t) {
  const e = t.match(/const LOCAL_HOOK_NAMES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `repository-local-hook:${s[1]}`) : []
}
function De(t) {
  const e = t.match(/function getSetupRunPolicyOptions\(\)[\s\S]*?return \[([\s\S]*?)\n  \]/)
  return e
    ? [...e[1].matchAll(/\bpolicy:\s*'([^']+)'/g)].map((s) => `repository-setup-run-policy:${s[1]}`)
    : []
}
function ye(t) {
  const e = t.match(/function getCommandSourcePolicyOptions\(\)[\s\S]*?return \[([\s\S]*?)\n  \]/)
  return e
    ? [...e[1].matchAll(/\bpolicy:\s*'([^']+)'/g)].map(
        (s) => `repository-command-source-policy:${s[1]}`
      )
    : []
}
function Me(t) {
  const e = t.match(/export const SETUP_SCRIPT_IMPORT_PROVIDERS[\s\S]*?= \[([\s\S]*?)\]/)
  return e
    ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `setup-script-import-provider:${s[1]}`)
    : []
}
function He(t) {
  const e = t.match(/export const LEFT_SIDEBAR_APPEARANCE_MODES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `left-sidebar-appearance:${s[1]}`) : []
}
function Ge(t) {
  const e = t.match(/export const AI_VAULT_AGENTS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `ai-vault-agent:${s[1]}`) : []
}
function Ve(t) {
  const e = t.match(/export const AGENT_STATUS_STATES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `agent-status-state:${s[1]}`) : []
}
function o(t, e, s) {
  const c = t.match(new RegExp(`export const ${e}[\\s\\S]*?= \\[([\\s\\S]*?)\\]`))
  return c ? [...c[1].matchAll(/'([^']+)'/g)].map((l) => `${s}:${l[1]}`) : []
}
function A(t, e, s) {
  const c = t.match(new RegExp(`export type ${e}\\s*=([\\s\\S]*?)(?:\\n\\n|$)`))
  return c ? [...c[1].matchAll(/'([^']+)'/g)].map((l) => `${s}:${l[1]}`) : []
}
function We(t) {
  const e = t.match(/export type RuntimeCompatVerdict\s*=([\s\S]*?)(?:\n\n|$)/)
  return e
    ? [...e[1].matchAll(/reason:\s*((?:'[^']+'\s*\|\s*)*'[^']+')/g)].flatMap((s) =>
        [...s[1].matchAll(/'([^']+)'/g)].map((c) => `runtime-compat-block-reason:${c[1]}`)
      )
    : []
}
function Ke(t) {
  const e = t.match(/export type CompatVerdict\s*=([\s\S]*?)(?:\n\n|$)/)
  return e
    ? [...e[1].matchAll(/reason:\s*((?:'[^']+'\s*\|\s*)*'[^']+')/g)].flatMap((s) =>
        [...s[1].matchAll(/'([^']+)'/g)].map((c) => `desktop-compat-block-reason:${c[1]}`)
      )
    : []
}
function Be(t) {
  const e = t.match(/export const SUPPORTED_UI_LOCALES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `ui-locale:${s[1]}`) : []
}
function Ye(t) {
  const e = t.match(/export const GITHUB_PR_MERGE_METHODS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `github-pr-merge-method:${s[1]}`) : []
}
function Xe(t) {
  const e = t.match(/export const CLOSE_ISSUE_REASONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  return e
    ? [...e[1].matchAll(/\breason:\s*'([^']+)'/g)].map((s) => `github-issue-close-reason:${s[1]}`)
    : []
}
function i(t) {
  return t
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
function qe(t) {
  const e = t.match(/CHROMIUM_COOKIE_IMPORT_SOURCES[\s\S]*?= \[([\s\S]*?)\]/)
  return e
    ? [...[...e[1].matchAll(/\blabel:\s*'([^']+)'/g)].map((c) => c[1]), 'Firefox', 'Safari'].map(
        (c) => `browser-cookie-import-source:${i(c)}`
      )
    : []
}
function ze(t) {
  const e = t.match(/const METADATA_KEYS[\s\S]*?= \[([\s\S]*?)\]/)
  return e
    ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `browser-screencast-metadata:${i(s[1])}`)
    : []
}
function Je(t) {
  const e = t.match(/export const AGENT_NAMES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `terminal-agent-name:${s[1]}`) : []
}
function F(t) {
  return `${t === t.toUpperCase() ? 'uppercase' : 'lowercase'}-${i(t)}`
}
function Qe(t) {
  const e = t.match(/const PROXY_ENV_KEYS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `network-proxy-env-key:${F(s[1])}`) : []
}
function Ze(t) {
  const e = t.match(/const NO_PROXY_ENV_KEYS[\s\S]*?= \[([\s\S]*?)\]/)
  return e
    ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `network-proxy-bypass-env-key:${F(s[1])}`)
    : []
}
function ts(t) {
  const e = t.match(/const LEGACY_REMOTE_REF_PREFIXES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `legacy-base-ref-prefix:${i(s[1])}`) : []
}
function es(t) {
  const e = t.match(/const KNOWN_HUGE_FOLDER_NAMES[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `known-huge-folder:${i(s[1])}`) : []
}
function ss(t) {
  return [...new Set([...t.matchAll(/amp\.on\('([^']+)'/g)].map((e) => e[1]))].map(
    (e) => `amp-plugin-event:${i(e)}`
  )
}
function rs(t) {
  const e = t.match(/const ANTIGRAVITY_EVENTS[\s\S]*?= \[([\s\S]*?)\]/)
  return e
    ? [...e[1].matchAll(/\beventName:\s*'([^']+)'/g)].map(
        (s) => `antigravity-hook-event:${i(s[1])}`
      )
    : []
}
function ns(t) {
  const e = t.match(/export const CLAUDE_EVENTS[\s\S]*?= \[([\s\S]*?)\]\s+as const/)
  return e
    ? [...e[1].matchAll(/\beventName:\s*'([^']+)'/g)].map((s) => `claude-hook-event:${i(s[1])}`)
    : []
}
function cs(t) {
  const e = t.match(/const CODEX_EVENTS[\s\S]*?= \[([\s\S]*?)\]\s+as const/)
  return e ? [...e[1].matchAll(/^\s*'([^']+)'/gm)].map((s) => `codex-hook-event:${i(s[1])}`) : []
}
function os(t) {
  const e = t.match(/const COMMAND_CODE_EVENTS[\s\S]*?= \[([\s\S]*?)\]\s+as const/)
  return e
    ? [...e[1].matchAll(/\beventName:\s*'([^']+)'/g)].map(
        (s) => `command-code-hook-event:${i(s[1])}`
      )
    : []
}
function as(t) {
  const e = t.match(/const COPILOT_EVENTS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/^\s*'([^']+)'/gm)].map((s) => `copilot-hook-event:${i(s[1])}`) : []
}
function is(t) {
  const e = t.match(/const CURSOR_EVENTS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `cursor-hook-event:${i(s[1])}`) : []
}
function ls(t) {
  const e = t.match(/const DROID_EVENTS[\s\S]*?= \[([\s\S]*?)\]\s+as const/)
  return e
    ? [...e[1].matchAll(/\beventName:\s*'([^']+)'/g)].map((s) => `droid-hook-event:${i(s[1])}`)
    : []
}
function us(t) {
  const e = t.match(/const GEMINI_EVENTS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `gemini-hook-event:${i(s[1])}`) : []
}
function ms(t) {
  const e = t.match(/const GROK_EVENTS[\s\S]*?= \[([\s\S]*?)\]\s+as const/)
  return e
    ? [...e[1].matchAll(/\beventName:\s*'([^']+)'/g)].map((s) => `grok-hook-event:${i(s[1])}`)
    : []
}
function ps(t) {
  const e = t.match(/const HERMES_EVENTS[\s\S]*?= \[([\s\S]*?)\]\s+as const/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `hermes-hook-event:${i(s[1])}`) : []
}
function Ss(t) {
  return [...new Set([...t.matchAll(/event\.type\s*===\s*"([^"]+)"/g)].map((e) => e[1]))].map(
    (e) => `opencode-plugin-event:${i(e)}`
  )
}
function ds(t) {
  const e = t.match(/export const RESUMABLE_TUI_AGENTS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `resumable-agent:${s[1]}`) : []
}
function hs(t) {
  return new Map(
    [...t.matchAll(/export const ([A-Z0-9_]+) = '([^']+)' as const/g)].map((e) => [e[1], e[2]])
  )
}
function fs(t) {
  const e = t.match(/export const RUNTIME_CAPABILITIES[\s\S]*?= \[([\s\S]*?)\]/)
  if (!e) {
    return []
  }
  const s = hs(t),
    c = []
  for (const l of e[1].split(',')) {
    const h = l.trim(),
      f = h.match(/^'([^']+)'$/)
    if (f) {
      c.push(f[1])
      continue
    }
    const T = s.get(h)
    T && c.push(T)
  }
  return c.map((l) => `runtime-capability:${l}`)
}
function Ts(t) {
  const e = t.match(/export const RUNTIME_PORTING_DOMAINS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? a(e[1]).map((s) => `runtime-porting-domain:${s}`) : []
}
function Es(t) {
  const e = t.match(/export const AGENT_HOOK_TARGETS[\s\S]*?= \[([\s\S]*?)\]/)
  return e ? [...e[1].matchAll(/'([^']+)'/g)].map((s) => `agent-hook-target:${s[1]}`) : []
}
function gs(t) {
  const e = t.match(/([\s\S]*?)export const FORGE_PROVIDERS/)
  return e ? [...e[1].matchAll(/\bid:\s*'([^']+)'/g)].map((s) => `forge-provider:${s[1]}`) : []
}
async function Is(t) {
  const [
    e,
    s,
    c,
    l,
    h,
    f,
    T,
    p,
    P,
    C,
    b,
    $,
    v,
    w,
    j,
    U,
    L,
    D,
    y,
    M,
    H,
    g,
    G,
    V,
    _,
    W,
    K,
    B,
    S,
    Y,
    X,
    m,
    E,
    q,
    z,
    J,
    Q,
    Z,
    tt,
    I,
    et,
    st,
    rt,
    nt,
    ct,
    ot,
    at,
    it,
    lt,
    ut,
    mt,
    pt,
    St,
    dt,
    ht,
    ft,
    Tt,
    Et,
    x,
    O,
    gt,
    At,
    _t,
    It,
    xt,
    R,
    Ot,
    d,
    Rt,
    kt,
    Nt,
    Ft,
    Pt,
    k,
    Ct,
    bt,
    $t,
    vt,
    wt,
    jt,
    Ut,
    Lt,
    Dt,
    N,
    yt,
    Mt,
    Ht
  ] = await Promise.all([
    r.readFile(n.join(t, 'src', 'shared', 'feature-interaction-catalog.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'feature-interaction-categories.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'feature-interaction-usage-buckets.ts'), 'utf8'),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'agent-workspace',
        'agent-terminal-visibility.ts'
      ),
      'utf8'
    ),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'settings',
        'computer-use-permission-definitions.tsx'
      ),
      'utf8'
    ),
    r.readFile(n.join(t, 'src', 'shared', 'feature-wall-tiles.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'feature-tips.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'feature-education-telemetry.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'contextual-tours.ts'), 'utf8'),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'onboarding',
        'use-onboarding-flow-types.ts'
      ),
      'utf8'
    ),
    r.readFile(n.join(t, 'src', 'shared', 'constants.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'source-control-ai-actions.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'workspace-source.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'browser-viewport-presets.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'app-icon.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'renderer', 'src', 'components', 'LinearItemDrawer.tsx'), 'utf8'),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'browser-pane', 'BrowserPane.tsx'),
      'utf8'
    ),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'cmd-j', 'palette-results.ts'),
      'utf8'
    ),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'settings', 'SettingsConstants.ts'),
      'utf8'
    ),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'settings', 'GitPane.tsx'),
      'utf8'
    ),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'settings',
        'VoiceDictationSettingsSection.tsx'
      ),
      'utf8'
    ),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'settings', 'RepositoryHooksSection.tsx'),
      'utf8'
    ),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'settings',
        'mobile-auto-restore-options.ts'
      ),
      'utf8'
    ),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'terminal-quick-commands',
        'terminal-quick-command-agent-options.ts'
      ),
      'utf8'
    ),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'editor', 'markdown-preview-controls.ts'),
      'utf8'
    ),
    r.readFile(n.join(t, 'src', 'shared', 'setup-script-import-providers.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'left-sidebar-appearance.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'ai-vault-types.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'agent-status-types.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'execution-host.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'execution-host-registry.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'nested-repo-telemetry.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'star-nag-telemetry.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'ui-locale.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'github-pr-merge-methods.ts'), 'utf8'),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'github', 'github-issue-close-reasons.tsx'),
      'utf8'
    ),
    r.readFile(n.join(t, 'src', 'shared', 'browser-cookie-import-sources.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'browser-screencast-protocol.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'agent-name-token-match.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'network-proxy.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'base-ref-search-result.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'git', 'huge-folder-ignore.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'amp', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'antigravity', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'claude', 'hook-settings.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'codex', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'command-code', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'copilot', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'cursor', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'droid', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'gemini', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'grok', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'hermes', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'opencode', 'hook-service.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'agent-session-resume.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'linear-agent-access.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'agent-hook-endpoint-file.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'protocol-version.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'protocol-compat.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'runtime-status-enum-values.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'runtime-porting-domains.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'agent-hook-types.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'gitlab', 'project-ref-parser.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'main', 'source-control', 'forge-provider.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'renderer', 'src', 'store', 'right-sidebar-route.ts'), 'utf8'),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'settings', 'Settings.tsx'),
      'utf8'
    ),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'settings',
        'TerminalTypographyAppearanceSection.tsx'
      ),
      'utf8'
    ),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'sidebar',
        'sidebar-workspace-options-menu-options.ts'
      ),
      'utf8'
    ),
    r.readFile(
      n.join(t, 'src', 'renderer', 'src', 'components', 'sidebar', 'host-header-menu-items.ts'),
      'utf8'
    ),
    r.readFile(n.join(t, 'src', 'shared', 'tui-agent-config.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'tui-agent-thinking.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'task-providers.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'workspace-status-defaults.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'workspace-statuses.ts'), 'utf8'),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'automations',
        'AutomationSchedulePicker.tsx'
      ),
      'utf8'
    ),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'automations',
        'AutomationCustomCronPanel.tsx'
      ),
      'utf8'
    ),
    r.readFile(n.join(t, 'src', 'shared', 'worktree-card-properties.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'open-in-applications.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'keybindings.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'status-bar-defaults.ts'), 'utf8'),
    r.readFile(
      n.join(
        t,
        'src',
        'renderer',
        'src',
        'components',
        'onboarding',
        'onboarding-feature-setup.ts'
      ),
      'utf8'
    ),
    r.readFile(n.join(t, 'src', 'shared', 'feature-wall-setup-steps.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'feature-wall-workflows.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'feature-wall-tour-depth.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'agents-orchestration-steps.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'workbench-steps.ts'), 'utf8'),
    r.readFile(n.join(t, 'src', 'shared', 'review-steps.ts'), 'utf8')
  ])
  return [
    ...a(e).map((u) => `interaction:${u}`),
    ...o(s, 'FEATURE_INTERACTION_CATEGORIES', 'feature-interaction-category'),
    ...o(c, 'FEATURE_INTERACTION_USAGE_BUCKETS', 'feature-interaction-usage-bucket'),
    ...o(l, 'AGENT_TERMINAL_REVEAL_REASONS', 'agent-terminal-reveal-reason'),
    ...a(h).map((u) => `computer-use-permission:${u}`),
    ...a(f).map((u) => `feature-wall:${u}`),
    ...a(T).map((u) => `feature-tip:${u}`),
    ...Te(p),
    ...Ee(p),
    ...ge(p),
    ...Ae(p),
    ..._e(p),
    ...he(P),
    ...fe(C),
    ...xe(b),
    ...Ie($),
    ...Oe(v),
    ...Re(w),
    ...ke(j),
    ...Ne(U),
    ...Fe(L),
    ...Pe(D),
    ...Ce(y),
    ...be(V),
    ...$e(_),
    ...ve(_),
    ...we(M),
    ...je(H),
    ...Ue(G),
    ...Le(g),
    ...De(g),
    ...ye(g),
    ...Me(W),
    ...He(K),
    ...Ge(B),
    ...Ve(S),
    ...o(S, 'AGENT_STATUS_PLAN_STEP_STATUSES', 'agent-status-plan-step-status'),
    ...o(S, 'AGENT_STATUS_TOOL_EVENT_STATUSES', 'agent-status-tool-event-status'),
    ...o(S, 'AGENT_STATUS_FAILURE_SOURCES', 'agent-status-failure-source'),
    ...o(S, 'AGENT_STATUS_APPROVAL_STATUSES', 'agent-status-approval-status'),
    ...A(Y, 'ExecutionHostKind', 'execution-host-kind'),
    ...A(X, 'ExecutionHostHealth', 'execution-host-health'),
    ...o(m, 'NESTED_REPO_TELEMETRY_SURFACES', 'nested-repo-surface'),
    ...o(m, 'NESTED_REPO_TELEMETRY_RUNTIME_KINDS', 'nested-repo-runtime-kind'),
    ...o(m, 'NESTED_REPO_SCAN_RESULTS', 'nested-repo-scan-result'),
    ...o(m, 'NESTED_REPO_IMPORT_ACTIONS', 'nested-repo-import-action'),
    ...o(m, 'NESTED_REPO_IMPORT_OUTCOMES', 'nested-repo-import-outcome'),
    ...o(m, 'NESTED_REPO_COUNT_BUCKETS', 'nested-repo-count-bucket'),
    ...o(E, 'STAR_NAG_OUTCOMES', 'star-nag-outcome'),
    ...o(E, 'STAR_NAG_PROMPT_SOURCES', 'star-nag-prompt-source'),
    ...o(E, 'STAR_NAG_PROMPT_MODES', 'star-nag-prompt-mode'),
    ...o(E, 'STAR_NAG_AGENT_BUCKETS', 'star-nag-agent-bucket'),
    ...Be(q),
    ...Ye(z),
    ...Xe(J),
    ...qe(Q),
    ...ze(Z),
    ...Je(tt),
    ...Qe(I),
    ...Ze(I),
    ...ts(et),
    ...es(st),
    ...ss(rt),
    ...rs(nt),
    ...ns(ct),
    ...cs(ot),
    ...os(at),
    ...as(it),
    ...is(lt),
    ...ls(ut),
    ...us(mt),
    ...ms(pt),
    ...ps(St),
    ...Ss(dt),
    ...ds(ht),
    ...o(ft, 'LINEAR_ERROR_CODES', 'linear-error-code'),
    ...o(Tt, 'AGENT_HOOK_ENDPOINT_FILE_NAMES', 'agent-hook-endpoint-file'),
    ...We(x),
    ...Ke(x),
    ...fs(Et),
    ...o(O, 'VALID_RUNTIME_GRAPH_STATUSES', 'runtime-graph-status'),
    ...o(O, 'VALID_RUNTIME_HOST_PLATFORMS', 'runtime-host-platform'),
    ...Ts(gt),
    ...Es(At),
    ...o(_t, 'DEFAULT_GITLAB_HOSTS', 'gitlab-default-host'),
    ...gs(It),
    ...Gt(xt),
    ...Vt(R),
    ...Wt(R),
    ...ee(Ot),
    ...se(d),
    ...re(d),
    ...ne(d),
    ...ce(d),
    ...oe(d),
    ...A(Rt, 'HostHeaderMenuAction', 'host-header-menu-action'),
    ...Kt(kt),
    ...Bt(Nt),
    ...Yt(Ft),
    ...Xt(Pt),
    ...qt(k),
    ...zt(k),
    ...Jt(Ct),
    ...Qt(bt),
    ...Zt($t),
    ...te(vt),
    ...ae(wt),
    ...ie(jt),
    ...le(Ut),
    ...ue(Lt),
    ...me(Dt),
    ...pe(yt),
    ...Se(Mt),
    ...de(Ht),
    ...o(N, 'FEATURE_WALL_TOUR_DEPTH_STEPS', 'feature-wall-tour-depth-step'),
    ...o(N, 'FEATURE_WALL_EXIT_ACTIONS', 'feature-wall-exit-action')
  ]
}
export { Is as collectExpectedRows }
