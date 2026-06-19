import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  getRuntimePortingDomain,
  isFirstRuntimePortingSlice,
  getRuntimePortingFirstSliceMethod,
  listNativeRuntimePortingCandidates,
  listRetainedElectronRuntimeDomains,
  RUNTIME_PORTING_DOMAINS
} from './runtime-porting-domains'

describe('runtime porting domains', () => {
  it('marks runtime status diagnostics as the first safe porting slice', () => {
    const domain = getRuntimePortingDomain('runtime-status-diagnostics')

    expect(domain).toMatchObject({
      id: 'runtime-status-diagnostics',
      boundary: 'runtime-rpc',
      disposition: 'first-slice'
    })
    expect(isFirstRuntimePortingSlice(domain)).toBe(true)
  })

  it('keeps the embedded browser workbench out of the first native porting wave', () => {
    const domain = getRuntimePortingDomain('browser-workbench')

    expect(domain).toMatchObject({
      id: 'browser-workbench',
      boundary: 'electron-host',
      disposition: 'retain-electron'
    })
    expect(isFirstRuntimePortingSlice(domain)).toBe(false)
  })

  it('keeps every domain id unique', () => {
    const ids = RUNTIME_PORTING_DOMAINS.map((domain) => domain.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists host-service domains as native runtime porting candidates', () => {
    expect(listNativeRuntimePortingCandidates()).toEqual([
      getRuntimePortingDomain('pty-lifecycle'),
      getRuntimePortingDomain('process-supervision'),
      getRuntimePortingDomain('filesystem-workspace-scanning')
    ])
  })

  it('lists domains retained on the Electron side of the boundary', () => {
    expect(listRetainedElectronRuntimeDomains()).toEqual([
      getRuntimePortingDomain('browser-workbench'),
      getRuntimePortingDomain('app-shell'),
      getRuntimePortingDomain('provider-review-integrations')
    ])
  })

  it('maps the first runtime slice to the existing status RPC method', () => {
    expect(getRuntimePortingFirstSliceMethod()).toBe('status.get')
  })

  it('keeps the assessment document aligned with the first runtime slice', () => {
    const assessment = readFileSync(
      resolve(__dirname, '../../docs/reference/janus-runtime-porting-assessment.md'),
      'utf8'
    )

    expect(assessment).toContain('runtime-status-diagnostics')
    expect(assessment).toContain(getRuntimePortingFirstSliceMethod())
  })
})
