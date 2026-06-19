import { spawn } from 'child_process'
import net from 'net'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { startMacOSNativeProviderSocket } from './macos-native-provider-transport'

vi.mock('child_process', () => ({
  spawn: vi.fn()
}))

vi.mock('./macos-native-provider-socket', () => ({
  connectMacOSProviderSocket: vi.fn(async () => {
    const socket = new net.Socket()
    socket.setEncoding = vi.fn()
    return socket
  })
}))

const spawnMock = vi.mocked(spawn)

describe('macOS native provider transport', () => {
  beforeEach(() => {
    spawnMock.mockReset()
    spawnMock.mockReturnValue({
      once: vi.fn(),
      off: vi.fn(),
      kill: vi.fn(),
      unref: vi.fn()
    } as never)
  })

  it('launches the helper app bundle so TCC evaluates the granted app identity', async () => {
    await startMacOSNativeProviderSocket({
      helperAppPath: '/Applications/Janus Code.app/Contents/Resources/Janus Computer Use.app',
      isCurrent: () => true
    })

    expect(spawnMock).toHaveBeenCalledWith(
      '/usr/bin/open',
      [
        '-n',
        '/Applications/Janus Code.app/Contents/Resources/Janus Computer Use.app',
        '--args',
        '--agent',
        expect.stringContaining('/provider.sock'),
        '--token-file',
        expect.stringContaining('/provider.token')
      ],
      { detached: true, stdio: 'ignore' }
    )
  })
})
