import type { RuntimeStatusPortingField } from './runtime-status-porting-field'

export type RuntimeStatusPortingJsonSchema = {
  $schema: string
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
