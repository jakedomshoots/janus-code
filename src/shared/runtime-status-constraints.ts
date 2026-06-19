import type { RuntimeStatusPortingField } from './runtime-status-porting-field'

export type RuntimeStatusPortingNumericConstraint = {
  integer: true
  minimum: number
  nullable?: true
}

export type RuntimeStatusPortingStringConstraint = {
  minLength: number
  trim?: true
}

export type RuntimeStatusPortingArrayConstraint = {
  itemType: 'string'
}

export const RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS = {
  runtimeProtocolVersion: { integer: true, minimum: 1 },
  minCompatibleRuntimeClientVersion: { integer: true, minimum: 1 },
  rendererGraphEpoch: { integer: true, minimum: 0 },
  liveTabCount: { integer: true, minimum: 0 },
  liveLeafCount: { integer: true, minimum: 0 },
  authoritativeWindowId: { integer: true, minimum: 0, nullable: true }
} as const satisfies Partial<
  Record<RuntimeStatusPortingField, RuntimeStatusPortingNumericConstraint>
>

export const RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS = {
  runtimeId: { minLength: 1, trim: true }
} as const satisfies Partial<
  Record<RuntimeStatusPortingField, RuntimeStatusPortingStringConstraint>
>

export const RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS = {
  capabilities: { itemType: 'string' }
} as const satisfies Partial<Record<RuntimeStatusPortingField, RuntimeStatusPortingArrayConstraint>>
