import { describe, expect, it } from 'vitest'

import { makeProject } from './feature-user-story-status-test-project.mjs'
import { main as verifyFeatureUserStoryStatus } from './verify-feature-user-story-status.mjs'
import { COMPLETE_FIXTURE_IDS } from './feature-user-story-status-fixture-ids.mjs'

function makeRequiredCsvRow(id) {
  const kind = id.split(':')[0] ?? 'feature'
  return `${id},${kind},${id},"As a user, I can use ${id}.",The code-backed inventory includes ${id} and the app can expose it.,code,manual,Documented,2026-06-19,`
}

describe('verify-feature-user-story-status', () => {
  it('rejects missing rows for browser screencast metadata keys', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'browser-screencast-metadata:page-scale-factor'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for terminal agent-name detection', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'terminal-agent-name:codex').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for network proxy environment keys', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'network-proxy-env-key:lowercase-http-proxy'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for legacy base-ref prefixes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'legacy-base-ref-prefix:upstream').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for known huge folders', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'known-huge-folder:next').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Amp plugin events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'amp-plugin-event:agent-end').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Antigravity hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'antigravity-hook-event:stop').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Claude hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'claude-hook-event:stop').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Codex hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'codex-hook-event:stop').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Command Code hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'command-code-hook-event:stop').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Copilot hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'copilot-hook-event:stop').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Cursor hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'cursor-hook-event:stop').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Droid hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'droid-hook-event:stop').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Gemini hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'gemini-hook-event:after-agent').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Grok hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'grok-hook-event:stop').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Hermes hook events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'hermes-hook-event:on-session-end').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for OpenCode plugin events', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'opencode-plugin-event:session-error'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for resumable agents', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'resumable-agent:codex').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for Linear error codes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'linear-error-code:linear_invalid_write_id'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for agent hook endpoint files', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'agent-hook-endpoint-file:endpoint.cmd'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for runtime capabilities', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'runtime-capability:project-host-setup.v1'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for runtime graph statuses', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'runtime-graph-status:reloading').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for runtime host platforms', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'runtime-host-platform:linux').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for runtime porting domains', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'runtime-porting-domain:process-supervision'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for agent hook targets', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'agent-hook-target:codex').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for default GitLab hosts', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'gitlab-default-host:gitlab.com').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for forge providers', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'forge-provider:github').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for TUI agent thinking modes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'tui-agent-thinking-mode:deep').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for task providers', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'task-provider:jira').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for default workspace statuses', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'workspace-status:todo').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for default worktree card properties', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'worktree-card-property:inline-agents'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for default Open In applications', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'open-in-application:vscode').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for terminal ligature modes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'terminal-ligature-mode:off').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar project order options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'sidebar-project-order:recent').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar card layout options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'sidebar-card-layout:compact').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar agent activity display options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'sidebar-agent-activity-display:full'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar workspace grouping options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'sidebar-workspace-group:repo').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar workspace sort options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'sidebar-workspace-sort:manual').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for host header menu actions', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'host-header-menu-action:manage').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })
})
