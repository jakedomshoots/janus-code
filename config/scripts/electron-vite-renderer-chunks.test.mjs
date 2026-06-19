import { describe, expect, it } from 'vitest'
import { getRendererManualChunk } from '../../electron.vite.config.ts'

describe('renderer manual chunks', () => {
  it('keeps app modules in Rollup default chunks', () => {
    expect(getRendererManualChunk('/repo/src/renderer/src/App.tsx')).toBeUndefined()
  })

  it('groups heavy editor and diagram vendors into stable chunks', () => {
    expect(getRendererManualChunk('/repo/node_modules/mermaid/dist/mermaid.core.mjs')).toBe(
      'vendor-diagrams'
    )
    expect(getRendererManualChunk('/repo/node_modules/cytoscape/dist/cytoscape.esm.js')).toBe(
      'vendor-diagrams'
    )
    expect(getRendererManualChunk('/repo/node_modules/dagre/dist/dagre.js')).toBe('vendor-diagrams')
    expect(
      getRendererManualChunk('/repo/node_modules/monaco-editor/esm/vs/editor/editor.api.js')
    ).toBe('vendor-monaco')
    expect(getRendererManualChunk('/repo/node_modules/pdfjs-dist/build/pdf.mjs')).toBe('vendor-pdf')
  })

  it('handles Windows path separators', () => {
    expect(getRendererManualChunk('C:\\repo\\node_modules\\mermaid\\dist\\mermaid.core.mjs')).toBe(
      'vendor-diagrams'
    )
  })
})
