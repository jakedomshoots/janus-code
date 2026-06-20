import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { Dialog } from '@/components/ui/dialog'
import { CloneStep } from './AddRepoCloneStep'

function renderCloneStep(cloneUrl: string): string {
  return renderToStaticMarkup(
    <Dialog open>
      <CloneStep
        cloneUrl={cloneUrl}
        cloneDestination="/tmp/projects"
        cloneError={null}
        cloneProgress={null}
        isCloning={false}
        onUrlChange={vi.fn()}
        onDestChange={vi.fn()}
        onPickDestination={vi.fn()}
        onClone={vi.fn()}
      />
    </Dialog>
  )
}

describe('CloneStep', () => {
  it('blocks malformed Git URLs before clone submission', () => {
    const html = renderCloneStep('not a url')

    expect(html).toContain('Enter a valid Git URL, such as https://github.com/user/repo.git.')
    expect(html).toContain('disabled=""')
  })
})
