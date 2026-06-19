import type {
  RuntimePortingDomainId,
  RuntimePortingFirstSliceMethod
} from './runtime-porting-domains'
import type {
  RuntimeStatusPortingArrayConstraint,
  RuntimeStatusPortingNumericConstraint,
  RuntimeStatusPortingStringConstraint
} from './runtime-status-constraints'
import type { RuntimeStatus } from './runtime-types'

type RuntimeStatusPortingField = keyof RuntimeStatus

export type RuntimeStatusPortingContractSummary = {
  schemaVersion: 1
  domainId: RuntimePortingDomainId
  method: RuntimePortingFirstSliceMethod
  params: null
  requiredFields: RuntimeStatusPortingField[]
  invalidatableFields: RuntimeStatusPortingField[]
  enumValues: {
    graphStatus: string[]
    hostPlatform: string[]
  }
  numericConstraints: Partial<
    Record<RuntimeStatusPortingField, RuntimeStatusPortingNumericConstraint>
  >
  stringConstraints: Partial<
    Record<RuntimeStatusPortingField, RuntimeStatusPortingStringConstraint>
  >
  arrayConstraints: Partial<Record<RuntimeStatusPortingField, RuntimeStatusPortingArrayConstraint>>
}
