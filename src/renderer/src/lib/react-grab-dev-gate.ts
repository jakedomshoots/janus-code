export type ReactGrabDevEnv = {
  readonly dev: boolean
  readonly enableFlag?: string
  readonly guiAgentWorkspaceEnabled?: boolean
}

export function shouldEnableReactGrab(env: ReactGrabDevEnv): boolean {
  // Why: GUI agent mode already has browser grab/annotation flows; React Grab's
  // global Cmd/Ctrl+C copy competes and can repopulate the clipboard with DOM
  // dumps the composer is trying to suppress.
  if (env.guiAgentWorkspaceEnabled === true) {
    return false
  }
  // Why: the global React Grab overlay intercepts app-level annotation targets;
  // keep it opt-in so Janus' own browser annotation flow sees the real UI.
  return env.dev && env.enableFlag === 'true'
}
