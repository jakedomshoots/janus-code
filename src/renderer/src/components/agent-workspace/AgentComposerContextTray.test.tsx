// @vitest-environment happy-dom

import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as harness from './agent-composer.test.harness'
import { makeAnnotation } from './agent-composer-test-fixtures'
import { AgentComposer } from './AgentComposer'

const mocks = harness.getAgentComposerMocks()
describe('AgentComposer', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    ;({ root, container } = harness.setupAgentComposerTestRoot())
  })

  afterEach(async () => {
    await harness.cleanupAgentComposerTestRoot(root)
  })

  it('attaches current browser annotations to the composer draft', async () => {
    mocks.browserState.browserTabsByWorktree = {
      'worktree-1': [
        {
          id: 'browser-tab-1',
          worktreeId: 'worktree-1',
          activePageId: 'browser-page-1',
          pageIds: ['browser-page-1'],
          url: 'https://example.com/pricing',
          title: 'Pricing',
          loading: false,
          faviconUrl: null,
          canGoBack: false,
          canGoForward: false,
          loadError: null,
          createdAt: 1
        }
      ]
    }
    mocks.browserState.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-1' }
    mocks.browserState.browserAnnotationsByPageId = {
      'browser-page-1': [makeAnnotation()]
    }

    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const attachButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Attach browser context"]'
    )
    expect(textarea).not.toBeNull()
    expect(attachButton).not.toBeNull()
    expect(attachButton?.disabled).toBe(false)

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Use this page context.')
    })
    await act(async () => {
      attachButton?.click()
    })

    expect(textarea?.value).toContain('Use this page context.')
    expect(textarea?.value).toContain('Make the primary action clearer.')
    expect(textarea?.value).not.toContain('Attached browser context from')
    expect(textarea?.value).not.toContain('## Design Feedback:')
    expect(container.textContent).toContain('Browser context attached.')
    const contextTray = container.querySelector<HTMLElement>('[aria-label="Prompt context"]')
    expect(contextTray).not.toBeNull()
    expect(contextTray!.textContent).toContain('Browser context')
    expect(contextTray!.textContent).toContain('1 annotation')
  })

  it('removes attached browser context from the composer draft before launch', async () => {
    mocks.browserState.browserTabsByWorktree = {
      'worktree-1': [
        {
          id: 'browser-tab-1',
          worktreeId: 'worktree-1',
          activePageId: 'browser-page-1',
          pageIds: ['browser-page-1'],
          url: 'https://example.com/pricing',
          title: 'Pricing',
          loading: false,
          faviconUrl: null,
          canGoBack: false,
          canGoForward: false,
          loadError: null,
          createdAt: 1
        }
      ]
    }
    mocks.browserState.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-1' }
    mocks.browserState.browserAnnotationsByPageId = {
      'browser-page-1': [makeAnnotation()]
    }

    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const attachButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Attach browser context"]'
    )
    expect(textarea).not.toBeNull()
    expect(attachButton).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Use this page context.')
    })
    await act(async () => {
      attachButton?.click()
    })

    const removeContextButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove browser context"]'
    )
    expect(removeContextButton).not.toBeNull()

    await act(async () => {
      removeContextButton?.click()
    })

    expect(textarea?.value).toBe('Use this page context.')
    expect(container.textContent).not.toContain('Browser context')
    expect(container.textContent).not.toContain('1 annotation')
  })

  it('warns when attached browser context no longer matches the live browser annotations', async () => {
    mocks.browserState.browserTabsByWorktree = {
      'worktree-1': [
        {
          id: 'browser-tab-1',
          worktreeId: 'worktree-1',
          activePageId: 'browser-page-1',
          pageIds: ['browser-page-1'],
          url: 'https://example.com/pricing',
          title: 'Pricing',
          loading: false,
          faviconUrl: null,
          canGoBack: false,
          canGoForward: false,
          loadError: null,
          createdAt: 1
        }
      ]
    }
    mocks.browserState.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-1' }
    mocks.browserState.browserAnnotationsByPageId = {
      'browser-page-1': [makeAnnotation()]
    }

    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const attachButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Attach browser context"]'
    )
    expect(textarea).not.toBeNull()
    expect(attachButton).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Use this page context.')
    })
    await act(async () => {
      attachButton?.click()
    })

    mocks.browserState.browserAnnotationsByPageId = {
      'browser-page-1': [
        {
          ...makeAnnotation(),
          id: 'annotation-2',
          comment: 'Move the comparison table above the fold.'
        }
      ]
    }
    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const contextTray = container.querySelector<HTMLElement>('[aria-label="Prompt context"]')
    expect(contextTray).not.toBeNull()
    expect(contextTray!.textContent).toContain('Browser context')
    expect(contextTray!.textContent).toContain('Browser context changed')

    const removeContextButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove browser context"]'
    )
    expect(removeContextButton).not.toBeNull()

    await act(async () => {
      removeContextButton?.click()
    })

    expect(container.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe(
      'Use this page context.'
    )
    expect(container.textContent).not.toContain('Browser context changed')
  })

  it('warns when attached browser context moves to a different browser tab source', async () => {
    const browserAnnotationMarkdown = [
      'Browser context:',
      '- page: https://example.com/pricing',
      '- note: Make the primary action clearer.'
    ].join('\n')
    const openBrowserWorkbench = vi.fn()

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          browserWorkbench={{
            browserWorkbenchReady: true,
            canOpenBrowserDrawer: true,
            browserAvailable: true,
            browserTabCount: 1,
            browserAnnotationCount: 1,
            browserAnnotationMarkdown,
            browserContextSourceId: 'browser-tab-1:browser-page-1',
            canAttachBrowserContext: true,
            openBrowserWorkbench
          }}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const attachButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Attach browser context"]'
    )
    expect(textarea).not.toBeNull()
    expect(attachButton).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Use this page context.')
    })
    await act(async () => {
      attachButton?.click()
    })
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          browserWorkbench={{
            browserWorkbenchReady: true,
            canOpenBrowserDrawer: true,
            browserAvailable: true,
            browserTabCount: 2,
            browserAnnotationCount: 1,
            browserAnnotationMarkdown,
            browserContextSourceId: 'browser-tab-2:browser-page-2',
            canAttachBrowserContext: true,
            openBrowserWorkbench
          }}
        />
      )
    })

    const contextTray = container.querySelector<HTMLElement>('[aria-label="Prompt context"]')
    expect(contextTray).not.toBeNull()
    expect(contextTray!.textContent).toContain('Browser context')
    expect(contextTray!.textContent).toContain('Browser context changed')
  })

  it('shows an agent memory hint only when the selected provider exposes one', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
      await harness.flushMicrotasks()
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()
    await act(async () => {
      harness.setTextControlValue(textarea!, 'Draft a memory-aware task.')
    })

    const contextTray = container.querySelector<HTMLElement>('[aria-label="Prompt context"]')
    expect(contextTray).not.toBeNull()
    expect(contextTray!.textContent).toContain('Agent memory')
    expect(contextTray!.textContent).toContain('/memory')

    await harness.openAgentSettings(container)
    await act(async () => {
      harness.getDocumentButton('Open provider menu')?.click()
    })
    const openCodeOption = harness.getDocumentButton('Set agent provider: OpenCode')
    expect(openCodeOption).not.toBeNull()

    await act(async () => {
      openCodeOption?.click()
      await harness.flushMicrotasks()
    })

    expect(container.textContent).not.toContain('Agent memory')
  })

  it('allows disabling the optional agent memory hint for one draft', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
      await harness.flushMicrotasks()
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()
    await act(async () => {
      harness.setTextControlValue(textarea!, 'Draft without optional memory.')
    })

    expect(container.textContent).toContain('Agent memory')
    const removeMemoryButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove agent memory context"]'
    )
    expect(removeMemoryButton).not.toBeNull()

    await act(async () => {
      removeMemoryButton?.click()
    })

    expect(container.textContent).not.toContain('Agent memory')
    expect(container.textContent).not.toContain('/memory')
  })

  it('strips verbose annotation markdown dumps from the composer draft', async () => {
    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(
        textarea!,
        [
          '## Design Feedback: /web-index.html',
          '',
          '**URL:** http://127.0.0.1:5175/web-index.html',
          '**Browser tab id:** page-1',
          '**Feedback:** This text is still showing'
        ].join('\n')
      )
    })

    expect(textarea?.value).toBe('This text is still showing')
  })

  it('strips legacy grab dumps from the composer draft', async () => {
    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(
        textarea!,
        [
          'Attached browser context from http://127.0.0.1:5175/web-index.html',
          '',
          'Selected element:',
          'header',
          'Dimensions: 100x22',
          'Full DOM path: body > div#root > header'
        ].join('\n')
      )
    })

    expect(textarea?.value).toBe('')
  })

  it('blocks legacy grab dumps pasted into the composer', async () => {
    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Keep this note.')
    })

    const legacyGrabDump = [
      'Attached browser context from http://127.0.0.1:5175/web-index.html',
      '',
      'Selected element:',
      'h1',
      'Full DOM path: body > div#root > h1'
    ].join('\n')

    await act(async () => {
      textarea!.selectionStart = textarea!.value.length
      textarea!.selectionEnd = textarea!.value.length
      const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          getData: (type: string) => (type === 'text/plain' ? legacyGrabDump : '')
        }
      })
      textarea!.dispatchEvent(pasteEvent)
    })

    expect(textarea?.value).toBe('Keep this note.')
  })
})
