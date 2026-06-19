import type { RuntimeStatusPortingField } from './runtime-status-porting-field'

export const REQUIRED_RUNTIME_STATUS_PORTING_FIELDS = [
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
] as const satisfies readonly RuntimeStatusPortingField[]

export const VERSIONED_RUNTIME_STATUS_PORTING_FIELDS = [
  'runtimeProtocolVersion',
  'minCompatibleRuntimeClientVersion'
] as const satisfies readonly RuntimeStatusPortingField[]

export const NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS = [
  'rendererGraphEpoch',
  'liveTabCount',
  'liveLeafCount'
] as const satisfies readonly RuntimeStatusPortingField[]

export const INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS = [
  ...VERSIONED_RUNTIME_STATUS_PORTING_FIELDS,
  ...NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
  'capabilities',
  'graphStatus',
  'runtimeId',
  'authoritativeWindowId',
  'hostPlatform'
] as const satisfies readonly RuntimeStatusPortingField[]
