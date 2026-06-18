import { describe, expect, it } from 'vitest'
import { resolveWebBrowserGrabRoute, setWebBrowserGrabRoute } from './web-browser-grab-routing'

describe('web-browser-grab-routing', () => {
  it('maps local browser page ids to remote grab targets', () => {
    setWebBrowserGrabRoute('local-page', {
      worktreeSelector: 'id:wt-1',
      remotePageId: 'remote-page-1'
    })
    expect(resolveWebBrowserGrabRoute('local-page')).toEqual({
      worktreeSelector: 'id:wt-1',
      remotePageId: 'remote-page-1'
    })
    setWebBrowserGrabRoute('local-page', null)
    expect(resolveWebBrowserGrabRoute('local-page')).toBeNull()
  })
})
