import { track } from '@/lib/telemetry'
import type { EventProps } from '../../../../shared/telemetry-events'

export type JanusCliFeatureTipSource = EventProps<'janus_cli_feature_tip_shown'>['source']
export type JanusCliFeatureTipSetupResult =
  EventProps<'janus_cli_feature_tip_setup_result'>['result']
export type CmdJPaletteFeatureTipSource = EventProps<'cmd_j_palette_feature_tip_shown'>['source']

export function getJanusCliFeatureTipTelemetrySource(value: unknown): JanusCliFeatureTipSource {
  return value === 'app_open' ? 'app_open' : 'manual'
}

export function trackJanusCliFeatureTipShown(source: JanusCliFeatureTipSource): void {
  track('janus_cli_feature_tip_shown', { source })
}

export function trackJanusCliFeatureTipSetupClicked(source: JanusCliFeatureTipSource): void {
  track('janus_cli_feature_tip_setup_clicked', { source })
}

export function trackJanusCliFeatureTipSetupResult(
  source: JanusCliFeatureTipSource,
  result: JanusCliFeatureTipSetupResult
): void {
  track('janus_cli_feature_tip_setup_result', { source, result })
}

export function trackCmdJPaletteFeatureTipShown(source: CmdJPaletteFeatureTipSource): void {
  track('cmd_j_palette_feature_tip_shown', { source })
}

export function trackCmdJPaletteFeatureTipAcknowledged(source: CmdJPaletteFeatureTipSource): void {
  track('cmd_j_palette_feature_tip_acknowledged', { source })
}
