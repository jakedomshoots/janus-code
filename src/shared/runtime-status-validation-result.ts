import type { RuntimeStatusPortingField } from './runtime-status-porting-field'

export type RuntimeStatusPortingValidationResult =
  | { ok: true }
  | { ok: false; missingFields: RuntimeStatusPortingField[] }
  | { ok: false; invalidFields: RuntimeStatusPortingField[] }
