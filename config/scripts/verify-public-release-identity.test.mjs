import { describe, expect, it } from 'vitest'
import { verifyIdentity } from './verify-public-release-identity.mjs'

const identity = {
  productName: 'Janus Code',
  productSlug: 'janus-code',
  appId: 'com.jakedom.januscode',
  githubOwner: 'jakedomshoots',
  githubRepo: 'janus-code',
  homepage: 'https://github.com/jakedomshoots/janus-code'
}

describe('verifyIdentity', () => {
  it('accepts the public fork identity', () => {
    expect(
      verifyIdentity({
        identity,
        packageJson: {
          name: 'janus-code',
          homepage: 'https://github.com/jakedomshoots/janus-code'
        },
        builderConfigText: [
          "appId: 'com.jakedom.januscode'",
          "productName: 'Janus Code'",
          "owner: 'jakedomshoots'",
          "repo: 'janus-code'"
        ].join('\n')
      })
    ).toEqual([])
  })

  it('rejects upstream publish ownership', () => {
    expect(
      verifyIdentity({
        identity,
        packageJson: {
          name: 'janus-code',
          homepage: 'https://github.com/jakedomshoots/janus-code'
        },
        builderConfigText: [
          "appId: 'com.jakedom.januscode'",
          "productName: 'Janus Code'",
          "owner: 'stablyai'",
          "repo: 'orca'"
        ].join('\n')
      })
    ).toContain('electron-builder publish config still points at stablyai/orca')
  })
})
