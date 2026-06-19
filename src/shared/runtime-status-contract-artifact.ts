import {
  getRuntimeStatusPortingContractSummary,
  type RuntimeStatusPortingContractSummary
} from './runtime-status-contract-summary'
import {
  getRuntimeStatusPortingJsonSchema,
  type RuntimeStatusPortingJsonSchema
} from './runtime-status-json-schema'

export type RuntimeStatusPortingContractArtifact = {
  summary: RuntimeStatusPortingContractSummary
  jsonSchema: RuntimeStatusPortingJsonSchema
}

export function getRuntimeStatusPortingContractArtifact(): RuntimeStatusPortingContractArtifact {
  return {
    summary: getRuntimeStatusPortingContractSummary(),
    jsonSchema: getRuntimeStatusPortingJsonSchema()
  }
}

export function getRuntimeStatusPortingContractArtifactJson(): string {
  return JSON.stringify(getRuntimeStatusPortingContractArtifact())
}
