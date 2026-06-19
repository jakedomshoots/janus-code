import {
  RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS
} from './runtime-status-constraints'
import { listRuntimeStatusPortingRequiredFields } from './runtime-status-contract-validation'
import {
  VALID_RUNTIME_GRAPH_STATUSES,
  VALID_RUNTIME_HOST_PLATFORMS
} from './runtime-status-enum-values'
import type { RuntimeStatusPortingField } from './runtime-status-porting-field'

export type RuntimeStatusPortingJsonSchema = {
  $schema: string
  $id: string
  title: string
  type: 'object'
  required: RuntimeStatusPortingField[]
  additionalProperties: false
  properties: {
    runtimeId: { type: 'string'; minLength: number }
    graphStatus: { type: 'string'; enum: string[] }
    hostPlatform: { type: 'string'; enum: string[] }
    runtimeProtocolVersion: { type: 'integer'; minimum: number }
    minCompatibleRuntimeClientVersion: { type: 'integer'; minimum: number }
    rendererGraphEpoch: { type: 'integer'; minimum: number }
    liveTabCount: { type: 'integer'; minimum: number }
    liveLeafCount: { type: 'integer'; minimum: number }
    authoritativeWindowId: { type: ['integer', 'null']; minimum: number }
    capabilities: { type: 'array'; items: { type: 'string' } }
  }
}

export function getRuntimeStatusPortingJsonSchema(): RuntimeStatusPortingJsonSchema {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'urn:janus:runtime-status-contract:json-schema:1',
    title: 'Janus Runtime status.get result',
    type: 'object',
    required: listRuntimeStatusPortingRequiredFields(),
    additionalProperties: false,
    properties: {
      runtimeId: {
        type: 'string',
        minLength: RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS.runtimeId.minLength
      },
      graphStatus: {
        type: 'string',
        enum: [...VALID_RUNTIME_GRAPH_STATUSES]
      },
      hostPlatform: {
        type: 'string',
        enum: [...VALID_RUNTIME_HOST_PLATFORMS]
      },
      runtimeProtocolVersion: {
        type: 'integer',
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.runtimeProtocolVersion.minimum
      },
      minCompatibleRuntimeClientVersion: {
        type: 'integer',
        minimum:
          RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.minCompatibleRuntimeClientVersion.minimum
      },
      rendererGraphEpoch: {
        type: 'integer',
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.rendererGraphEpoch.minimum
      },
      liveTabCount: {
        type: 'integer',
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.liveTabCount.minimum
      },
      liveLeafCount: {
        type: 'integer',
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.liveLeafCount.minimum
      },
      authoritativeWindowId: {
        type: ['integer', 'null'],
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.authoritativeWindowId.minimum
      },
      capabilities: {
        type: 'array',
        items: {
          type: RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS.capabilities.itemType
        }
      }
    }
  }
}
