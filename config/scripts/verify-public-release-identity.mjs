#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()

export function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'))
}

export function readText(path) {
  return readFileSync(join(root, path), 'utf8')
}

export function verifyIdentity({ identity, packageJson, builderConfigText }) {
  const failures = []
  const releaseRepo = `${identity.githubOwner}/${identity.githubRepo}`

  if (packageJson.name !== identity.productSlug) {
    failures.push(`package.json name must be ${identity.productSlug}`)
  }
  if (packageJson.homepage !== identity.homepage) {
    failures.push(`package.json homepage must be ${identity.homepage}`)
  }
  if (!builderConfigText.includes(`appId: '${identity.appId}'`)) {
    failures.push(`electron-builder appId must be ${identity.appId}`)
  }
  if (!builderConfigText.includes(`productName: '${identity.productName}'`)) {
    failures.push(`electron-builder productName must be ${identity.productName}`)
  }
  if (!builderConfigText.includes(`owner: '${identity.githubOwner}'`)) {
    failures.push(`electron-builder publish owner must be ${identity.githubOwner}`)
  }
  if (!builderConfigText.includes(`repo: '${identity.githubRepo}'`)) {
    failures.push(`electron-builder publish repo must be ${identity.githubRepo}`)
  }
  if (
    builderConfigText.includes("owner: 'stablyai'") ||
    builderConfigText.includes("repo: 'orca'")
  ) {
    failures.push('electron-builder publish config still points at stablyai/orca')
  }
  if (releaseRepo === 'stablyai/orca') {
    failures.push('public fork release repo must not be stablyai/orca')
  }

  return failures
}

export function main() {
  const identity = readJson('config/public-release-identity.json')
  const packageJson = readJson('package.json')
  const builderConfigText = readText('config/electron-builder.config.cjs')
  const failures = verifyIdentity({ identity, packageJson, builderConfigText })
  if (failures.length > 0) {
    console.error('Public release identity verification failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }
  console.log(`Verified public release identity for ${identity.productName}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
