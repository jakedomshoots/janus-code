import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { writeFeatureUserStoryStatusProjectFiles } from './feature-user-story-status-project-files.mjs'

export function makeProject({ csvRows }) {
  const root = mkdtempSync(path.join(tmpdir(), 'janus-feature-story-status-'))
  writeFeatureUserStoryStatusProjectFiles({ root, csvRows })

  return root
}
