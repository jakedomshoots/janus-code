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
  'janus-code-linux.AppImage',
  'janus-code_1.4.27_amd64.deb',
  'janus-code-1.4.27.x86_64.rpm',
  'janus-code-windows-setup.exe',
  'janus-code-windows-setup.exe.blockmap',
  'Janus Code-1.4.27-mac.zip',
  'Janus Code-1.4.27-mac.zip.blockmap',
  'Janus Code-1.4.27-arm64-mac.zip',
  'Janus Code-1.4.27-arm64-mac.zip.blockmap',
  'janus-code-macos-x64.dmg',
  'janus-code-macos-x64.dmg.blockmap',
  'janus-code-macos-arm64.dmg',
  'janus-code-macos-arm64.dmg.blockmap'
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
  it('returns the exact Janus Code release asset names in upload order', () => {
    expect(getRequiredReleaseAssetNames('v1.4.27')).toEqual(expectedRequiredAssets)
  })
})

describe('resolveReleaseRepository', () => {
  it('defaults to the Janus Code fork when GITHUB_REPOSITORY is unset', () => {
    expect(resolveReleaseRepository({})).toBe('jakedomshoots/janus-code')
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
          '  - url: Janus Code-1.4.27-arm64-mac.zip',
          '  - url: https://example.com/downloads/janus-code-windows-setup.exe',
          'path: janus-code-linux.AppImage'
        ].join('\n')
      )
    ).toEqual([
      'Janus Code-1.4.27-arm64-mac.zip',
      'janus-code-windows-setup.exe',
      'janus-code-linux.AppImage'
    ])
  })
})

describe('verifyRequiredReleaseAssets', () => {
  it('fails when a manifest-referenced asset has not been uploaded', async () => {
    const tag = 'v1.4.27'
    const required = getRequiredReleaseAssetNames(tag)
    const assets = required.filter((name) => name !== 'Janus Code-1.4.27-arm64-mac.zip')
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
            '  - url: Janus Code-1.4.27-arm64-mac.zip',
            '    sha512: test',
            'path: Janus Code-1.4.27-arm64-mac.zip'
          ].join('\n')
        )
      )
      .mockResolvedValue(jsonResponse('version: 1.4.27\n'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      verifyRequiredReleaseAssets({ repo: 'jakedomshoots/janus-code', tag, token: 'token' })
    ).rejects.toThrow('Missing: Janus Code-1.4.27-arm64-mac.zip')
    expect(latestMacAsset).toBeTruthy()
  })
})
