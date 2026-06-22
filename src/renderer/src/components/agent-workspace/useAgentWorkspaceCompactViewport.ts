import { useSyncExternalStore } from 'react'

const COMPACT_AGENT_WORKSPACE_QUERY = '(max-width: 799px)'

function matchesCompactAgentWorkspaceViewport(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(COMPACT_AGENT_WORKSPACE_QUERY).matches
  }
  return window.innerWidth <= 799
}

function subscribeCompactAgentWorkspaceViewport(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }
  if (typeof window.matchMedia !== 'function') {
    window.addEventListener('resize', onStoreChange)
    return () => window.removeEventListener('resize', onStoreChange)
  }

  const media = window.matchMedia(COMPACT_AGENT_WORKSPACE_QUERY)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

export function useAgentWorkspaceCompactViewport(): boolean {
  return useSyncExternalStore(
    subscribeCompactAgentWorkspaceViewport,
    matchesCompactAgentWorkspaceViewport,
    () => false
  )
}
