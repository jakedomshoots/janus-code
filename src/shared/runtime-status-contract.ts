import type { RuntimeStatus } from './runtime-types'

export const RUNTIME_STATUS_PORTING_CONTRACT_METHOD = 'status.get'

const REQUIRED_RUNTIME_STATUS_PORTING_FIELDS = [
  'runtimeId',
  'rendererGraphEpoch',
  'graphStatus',
  'authoritativeWindowId',
  'liveTabCount',
  'liveLeafCount',
  'runtimeProtocolVersion',
  'minCompatibleRuntimeClientVersion',
  'capabilities',
  'hostPlatform'
] as const satisfies readonly (keyof RuntimeStatus)[]

export function assertRuntimeStatusPortingContract(status: RuntimeStatus): void {
  for (const field of REQUIRED_RUNTIME_STATUS_PORTING_FIELDS) {
    if (status[field] === undefined) {
      throw new Error(`Runtime status porting contract missing ${field}`)
    }
  }
}
