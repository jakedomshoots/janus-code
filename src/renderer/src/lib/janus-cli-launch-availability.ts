import { isOrcaCliAvailableOnPath } from '@/lib/agent-skill-cli-prerequisite'

/**
 * Whether the `janus` CLI will resolve on PATH in the terminal an agent launch
 * is about to create. Used to gate launch-prompt hints that recommend `janus`
 * commands, so prompts never point agents at a command that cannot run.
 */
export async function isJanusCliAvailableForLaunch(args: { remote: boolean }): Promise<boolean> {
  // Why: SSH worktrees always have the CLI — the relay deploys a Janus shim
  // and the remote PTY provider prepends it to PATH. Only local launches
  // depend on the user's install state.
  if (args.remote) {
    return true
  }
  try {
    return isOrcaCliAvailableOnPath(await window.api.cli.getInstallStatus())
  } catch {
    return false
  }
}
