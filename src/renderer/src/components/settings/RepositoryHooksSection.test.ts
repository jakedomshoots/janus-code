import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { Repo } from '../../../../shared/types'
import { getDefaultSettings } from '../../../../shared/constants'
import { useAppStore } from '../../store'
import { getLocalCommandSourcePolicyNotice, RepositoryHooksSection } from './RepositoryHooksSection'

describe('getLocalCommandSourcePolicyNotice', () => {
  it('does not show a notice when no local scripts are saved', () => {
    expect(
      getLocalCommandSourcePolicyNotice({
        hooksInspectionReady: true,
        currentPolicy: 'shared-only',
        setupScript: '',
        archiveScript: '',
        hasSharedScript: false
      })
    ).toBeNull()
  })

  it('does not show a notice when command source already includes local scripts', () => {
    expect(
      getLocalCommandSourcePolicyNotice({
        hooksInspectionReady: true,
        currentPolicy: 'local-only',
        setupScript: 'pnpm install',
        archiveScript: '',
        hasSharedScript: true
      })
    ).toBeNull()

    expect(
      getLocalCommandSourcePolicyNotice({
        hooksInspectionReady: true,
        currentPolicy: 'run-both',
        setupScript: '',
        archiveScript: 'echo archive',
        hasSharedScript: true
      })
    ).toBeNull()
  })

  it('waits for hook inspection before recommending a command source', () => {
    expect(
      getLocalCommandSourcePolicyNotice({
        hooksInspectionReady: false,
        currentPolicy: 'shared-only',
        setupScript: 'pnpm install',
        archiveScript: '',
        hasSharedScript: false
      })
    ).toEqual({ kind: 'checking' })
  })

  it('recommends local commands when local scripts are saved and no shared script exists', () => {
    expect(
      getLocalCommandSourcePolicyNotice({
        hooksInspectionReady: true,
        currentPolicy: 'shared-only',
        setupScript: 'pnpm install',
        archiveScript: '',
        hasSharedScript: false
      })
    ).toEqual({ kind: 'action', policy: 'local-only', label: 'Use local commands' })
  })

  it('recommends run-both when local and shared scripts both exist', () => {
    expect(
      getLocalCommandSourcePolicyNotice({
        hooksInspectionReady: true,
        currentPolicy: 'shared-only',
        setupScript: '',
        archiveScript: 'echo archive',
        hasSharedScript: true
      })
    ).toEqual({ kind: 'action', policy: 'run-both', label: 'Run both' })
  })

  it('renders repository hook policy controls when hook settings are visible', () => {
    const repo: Repo = {
      id: 'repo-1',
      path: '/tmp/repo',
      displayName: 'Example Repo',
      badgeColor: '#000000',
      addedAt: 1,
      kind: 'git'
    }
    useAppStore.setState({
      settings: getDefaultSettings('/tmp'),
      settingsSearchQuery: ''
    })

    const html = renderToStaticMarkup(
      React.createElement(RepositoryHooksSection, {
        repo,
        yamlHooks: null,
        hasHooksFile: false,
        hooksInspectionReady: true,
        mayNeedUpdate: false,
        copiedTemplate: false,
        forceVisible: true,
        onCopyTemplate: vi.fn(),
        onUpdateHookSettings: vi.fn()
      })
    )

    expect(html).toContain('When to run')
    expect(html).toContain('Ask every time')
    expect(html).toContain('Run by default')
    expect(html).toContain('Skip by default')
    expect(html).toContain('Command Source')
    expect(html).toContain('orca.yaml only')
    expect(html).toContain('Local only')
    expect(html).toContain('Run both')
  })
})
