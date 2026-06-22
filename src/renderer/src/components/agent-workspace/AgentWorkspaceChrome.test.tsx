import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AgentWorkspaceChrome } from './AgentWorkspaceChrome'

describe('AgentWorkspaceChrome', () => {
  it('hosts the environment card as an overlay above the chat surface', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceChrome header={<div>Header</div>} rightPanel={<aside>Environment</aside>}>
        <main>Chat timeline</main>
      </AgentWorkspaceChrome>
    )

    expect(markup).toContain('relative flex min-h-0 min-w-0 flex-1 overflow-hidden')
    expect(markup.indexOf('<main>Chat timeline</main>')).toBeLessThan(
      markup.indexOf('<aside>Environment</aside>')
    )
  })
})
