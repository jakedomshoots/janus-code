import type { SidebarHostOption } from './sidebar-host-options'

export function canSelectAddRepoHost(host: Pick<SidebarHostOption, 'health' | 'kind'>): boolean {
  if (host.health === 'local' || host.health === 'available') {
    return true
  }
  // Why: web/remote runtime hosts can appear before their live status probe
  // finishes; Add Project should still route paths through that selected host.
  return host.kind === 'runtime' && host.health === 'disconnected'
}
