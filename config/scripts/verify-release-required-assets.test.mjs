import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  extractManifestAssetNames,
  getRequiredReleaseAssetNames,
  resolveReleaseRepository,
  verifyRequiredReleaseAssets
} from './verify-release-required-assets.mjs'

const expectedRequiredAssets = [
  'latest-linux.yml',
  'latest-mac.yml',
  'latest.yml',
  'agent-hub-linux.AppImage',
  'agent-hub_1.4.27_amd64.deb',
  'agent-hub-1.4.27.x86_64.rpm',
  'agent-hub-windows-setup.exe',
  'agent-hub-windows-setup.exe.blockmap',
  'Agent Hub-1.4.27-mac.zip',
  'Agent Hub-1.4.27-mac.zip.blockmap',
  'Agent Hub-1.4.27-arm64-mac.zip',
  'Agent Hub-1.4.27-arm64-mac.zip.blockmap',
  'agent-hub-macos-x64.dmg',
  'agent-hub-macos-x64.dmg.blockmap',
  'agent-hub-macos-arm64.dmg',
  'agent-hub-macos-arm64.dmg.blockmap'
]

function jsonResponse(body) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: vi.fn(async () => body),
    text: vi.fn(async () => (typeof body === 'string' ? body : JSON.stringify(body)))
  }
}

function releaseWithAssets(tag, assetNames) {
  return {
    tag_name: tag,
    draft: true,
    prerelease: false,
    assets: assetNames.map((name, index) => ({
      id: index + 1,
      name,
      state: 'uploaded',
      size: 123
    }))
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getRequiredReleaseAssetNames', () => {
  it('returns the exact Agent Hub release asset names in upload order', () => {
    expect(getRequiredReleaseAssetNames('v1.4.27')).toEqual(expectedRequiredAssets)
  })
})

describe('resolveReleaseRepository', () => {
  it('defaults to the Agent Hub fork when GITHUB_REPOSITORY is unset', () => {
    expect(resolveReleaseRepository({})).toBe('jakedom/agent-hub')
  })

  it('uses GITHUB_REPOSITORY when provided by the workflow environment', () => {
    expect(resolveReleaseRepository({ GITHUB_REPOSITORY: 'owner/repo' })).toBe('owner/repo')
  })
})

describe('extractManifestAssetNames', () => {
  it('extracts relative and absolute manifest asset names', () => {
    expect(
      extractManifestAssetNames(
        [
          'files:',
          '  - url: Agent Hub-1.4.27-arm64-mac.zip',
          '  - url: https://example.com/downloads/agent-hub-windows-setup.exe',
          'path: agent-hub-linux.AppImage'
        ].join('\n')
      )
    ).toEqual([
      'Agent Hub-1.4.27-arm64-mac.zip',
      'agent-hub-windows-setup.exe',
      'agent-hub-linux.AppImage'
    ])
  })
})

describe('verifyRequiredReleaseAssets', () => {
  it('fails when a manifest-referenced asset has not been uploaded', async () => {
    const tag = 'v1.4.27'
    const required = getRequiredReleaseAssetNames(tag)
    const assets = required.filter((name) => name !== 'Agent Hub-1.4.27-arm64-mac.zip')
    const release = releaseWithAssets(tag, assets)
    const latestMacAsset = release.assets.find((asset) => asset.name === 'latest-mac.yml')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([release]))
      .mockResolvedValueOnce(
        jsonResponse(
          [
            'version: 1.4.27',
            'files:',
            '  - url: Agent Hub-1.4.27-arm64-mac.zip',
            '    sha512: test',
            'path: Agent Hub-1.4.27-arm64-mac.zip'
          ].join('\n')
        )
      )
      .mockResolvedValue(jsonResponse('version: 1.4.27\n'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      verifyRequiredReleaseAssets({ repo: 'jakedom/agent-hub', tag, token: 'token' })
    ).rejects.toThrow('Missing: Agent Hub-1.4.27-arm64-mac.zip')
    expect(latestMacAsset).toBeTruthy()
  })
})
