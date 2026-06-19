import type { RuntimeStatus } from './runtime-types'

type RuntimeStatusPortingField = keyof RuntimeStatus

export type RuntimeStatusPortingValidationResult =
  | { ok: true }
  | { ok: false; missingFields: RuntimeStatusPortingField[] }
  | { ok: false; invalidFields: RuntimeStatusPortingField[] }
