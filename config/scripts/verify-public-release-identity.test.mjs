import { describe, expect, it } from 'vitest'
import { verifyIdentity } from './verify-public-release-identity.mjs'

const identity = {
  productName: 'Agent Hub',
  productSlug: 'agent-hub',
  appId: 'com.jakedom.agenthub',
  githubOwner: 'jakedom',
  githubRepo: 'agent-hub',
  homepage: 'https://github.com/jakedomshoots/agent-hub'
}

describe('verifyIdentity', () => {
  it('accepts the public fork identity', () => {
    expect(
      verifyIdentity({
        identity,
        packageJson: { name: 'agent-hub', homepage: 'https://github.com/jakedomshoots/agent-hub' },
        builderConfigText: [
          "appId: 'com.jakedom.agenthub'",
          "productName: 'Agent Hub'",
          "owner: 'jakedom'",
          "repo: 'agent-hub'"
        ].join('\n')
      })
    ).toEqual([])
  })

  it('rejects upstream publish ownership', () => {
    expect(
      verifyIdentity({
        identity,
        packageJson: { name: 'agent-hub', homepage: 'https://github.com/jakedomshoots/agent-hub' },
        builderConfigText: [
          "appId: 'com.jakedom.agenthub'",
          "productName: 'Agent Hub'",
          "owner: 'stablyai'",
          "repo: 'orca'"
        ].join('\n')
      })
    ).toContain('electron-builder publish config still points at stablyai/orca')
  })
})
