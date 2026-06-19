import type { GlobalSettings } from '../../../shared/types'

type RuntimePtyInputSender = (
  settings: Pick<GlobalSettings, 'activeRuntimeEnvironmentId'> | null | undefined,
  ptyId: string,
  data: string
) => Promise<boolean>

let runtimePtyInputSender: RuntimePtyInputSender | null = null

export function setRuntimePtyInputSender(sender: RuntimePtyInputSender | null): void {
  runtimePtyInputSender = sender
}

export async function sendRegisteredRuntimePtyInputVerified(
  settings: Parameters<RuntimePtyInputSender>[0],
  ptyId: string,
  data: string
): Promise<boolean> {
  if (!runtimePtyInputSender) {
    console.warn('[runtime-terminal-input] sender is not registered')
    return false
  }
  return runtimePtyInputSender(settings, ptyId, data)
}
