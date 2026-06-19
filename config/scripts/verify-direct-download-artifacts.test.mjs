import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  parseSha256Sums,
  requiredDirectDownloadArtifacts,
  verifyDirectDownloadArtifacts,
  verifyDirectDownloadReleaseNotes
} from './verify-direct-download-artifacts.mjs'

function withTempDir(callback) {
  const dir = join(tmpdir(), `janus-code-direct-download-${process.pid}-${Date.now()}`)
  mkdirSync(dir, { recursive: true })
  try {
    callback(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function writeChecksumFile(dir, artifacts) {
  const fakeHash = 'a'.repeat(64)
  writeFileSync(
    join(dir, 'SHA256SUMS.txt'),
    artifacts.map((name) => `${fakeHash}  ${name}`).join('\n')
  )
}

describe('verifyDirectDownloadArtifacts', () => {
  it('requires the macOS direct-download packages and checksum manifest', () => {
    withTempDir((dir) => {
      const artifacts = requiredDirectDownloadArtifacts({ version: '1.2.3' })
      writeFileSync(join(dir, artifacts[0]), '')

      expect(verifyDirectDownloadArtifacts(dir, { version: '1.2.3' })).toEqual({
        missingArtifacts: artifacts.slice(1),
        missingChecksums: ['SHA256SUMS.txt'],
        releaseNoteFailures: []
      })
    })
  })

  it('passes when all direct-download artifacts have checksums', () => {
    withTempDir((dir) => {
      const artifacts = requiredDirectDownloadArtifacts({ version: '1.2.3' })
      for (const artifact of artifacts) {
        writeFileSync(join(dir, artifact), '')
      }
      writeChecksumFile(dir, artifacts)

      expect(verifyDirectDownloadArtifacts(dir, { version: '1.2.3' })).toEqual({
        missingArtifacts: [],
        missingChecksums: [],
        releaseNoteFailures: []
      })
    })
  })

  it('normalizes checksum paths to artifact basenames', () => {
    const entries = parseSha256Sums(`${'b'.repeat(64)}  ./dist/janus-code-macos-arm64.dmg\n`)

    expect(entries.get('janus-code-macos-arm64.dmg')).toBe('b'.repeat(64))
  })

  it('requires unsigned macOS launch guidance in release notes', () => {
    expect(
      verifyDirectDownloadReleaseNotes(
        [
          'These macOS direct downloads are unsigned.',
          'After downloading, verify the SHA-256 checksums.',
          'If macOS blocks first launch, right-click Janus Code and choose Open.'
        ].join('\n')
      )
    ).toEqual([])

    expect(verifyDirectDownloadReleaseNotes('Download Janus Code for macOS.')).toEqual([
      'release notes must state that these macOS downloads are unsigned',
      'release notes must include right-click Open launch guidance for macOS',
      'release notes must mention SHA-256 checksums'
    ])
  })
})
