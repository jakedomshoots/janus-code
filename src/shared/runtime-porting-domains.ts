export type RuntimePortingDomainBoundary = 'runtime-rpc' | 'electron-host' | 'host-service'

export type RuntimePortingDomainDisposition = 'first-slice' | 'native-candidate' | 'retain-electron'

export type RuntimePortingDomainId =
  | 'runtime-status-diagnostics'
  | 'pty-lifecycle'
  | 'process-supervision'
  | 'filesystem-workspace-scanning'
  | 'browser-workbench'
  | 'app-shell'
  | 'provider-review-integrations'

export type RuntimePortingDomain = {
  id: RuntimePortingDomainId
  boundary: RuntimePortingDomainBoundary
  disposition: RuntimePortingDomainDisposition
}

export type RuntimePortingDomainSummary = {
  firstSlice: RuntimePortingDomain
  firstSliceMethod: RuntimePortingFirstSliceMethod
  nativeCandidates: readonly RuntimePortingDomain[]
  retainedElectron: readonly RuntimePortingDomain[]
  totalDomainCount: number
  nativeCandidateCount: number
  retainedElectronCount: number
}

export type RuntimePortingFirstSliceMethod = 'status.get'

export const RUNTIME_PORTING_FIRST_SLICE_METHOD: RuntimePortingFirstSliceMethod = 'status.get'

// Why: this keeps the porting plan machine-checkable before any Rust or host
// adapter code exists, so future slices can move one domain at a time.
export const RUNTIME_PORTING_DOMAINS = [
  {
    id: 'runtime-status-diagnostics',
    boundary: 'runtime-rpc',
    disposition: 'first-slice'
  },
  {
    id: 'pty-lifecycle',
    boundary: 'host-service',
    disposition: 'native-candidate'
  },
  {
    id: 'process-supervision',
    boundary: 'host-service',
    disposition: 'native-candidate'
  },
  {
    id: 'filesystem-workspace-scanning',
    boundary: 'host-service',
    disposition: 'native-candidate'
  },
  {
    id: 'browser-workbench',
    boundary: 'electron-host',
    disposition: 'retain-electron'
  },
  {
    id: 'app-shell',
    boundary: 'electron-host',
    disposition: 'retain-electron'
  },
  {
    id: 'provider-review-integrations',
    boundary: 'runtime-rpc',
    disposition: 'retain-electron'
  }
] as const satisfies readonly RuntimePortingDomain[]

export function getRuntimePortingDomain(id: RuntimePortingDomainId): RuntimePortingDomain {
  return RUNTIME_PORTING_DOMAINS.find((domain) => domain.id === id)!
}

export function getRuntimePortingFirstSliceDomain(): RuntimePortingDomain {
  return RUNTIME_PORTING_DOMAINS.find((domain) => domain.disposition === 'first-slice')!
}

export function isFirstRuntimePortingSlice(domain: RuntimePortingDomain): boolean {
  return domain.disposition === 'first-slice'
}

export function listRuntimePortingDomainsByBoundary(
  boundary: RuntimePortingDomainBoundary
): readonly RuntimePortingDomain[] {
  return RUNTIME_PORTING_DOMAINS.filter((domain) => domain.boundary === boundary)
}

export function listRuntimePortingDomainsByDisposition(
  disposition: RuntimePortingDomainDisposition
): readonly RuntimePortingDomain[] {
  return RUNTIME_PORTING_DOMAINS.filter((domain) => domain.disposition === disposition)
}

export function listNativeRuntimePortingCandidates(): readonly RuntimePortingDomain[] {
  return RUNTIME_PORTING_DOMAINS.filter((domain) => domain.disposition === 'native-candidate')
}

export function listRetainedElectronRuntimeDomains(): readonly RuntimePortingDomain[] {
  return RUNTIME_PORTING_DOMAINS.filter((domain) => domain.disposition === 'retain-electron')
}

export function getRuntimePortingDomainSummary(): RuntimePortingDomainSummary {
  const nativeCandidates = listNativeRuntimePortingCandidates()
  const retainedElectron = listRetainedElectronRuntimeDomains()

  return {
    firstSlice: getRuntimePortingFirstSliceDomain(),
    firstSliceMethod: getRuntimePortingFirstSliceMethod(),
    nativeCandidates,
    retainedElectron,
    totalDomainCount: RUNTIME_PORTING_DOMAINS.length,
    nativeCandidateCount: nativeCandidates.length,
    retainedElectronCount: retainedElectron.length
  }
}

export function getRuntimePortingFirstSliceMethod(): RuntimePortingFirstSliceMethod {
  return RUNTIME_PORTING_FIRST_SLICE_METHOD
}
