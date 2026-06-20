import { writeFeatureUserStoryStatusProjectCoreFiles } from './feature-user-story-status-project-core-files.mjs'
import { writeFeatureUserStoryStatusProjectRuntimeFiles } from './feature-user-story-status-project-runtime-files.mjs'
import { writeFeatureUserStoryStatusProjectSettingsFiles } from './feature-user-story-status-project-settings-files.mjs'

export function writeFeatureUserStoryStatusProjectFiles({ root, csvRows }) {
  writeFeatureUserStoryStatusProjectCoreFiles({ root, csvRows })
  writeFeatureUserStoryStatusProjectSettingsFiles({ root, csvRows })
  writeFeatureUserStoryStatusProjectRuntimeFiles({ root, csvRows })
}
