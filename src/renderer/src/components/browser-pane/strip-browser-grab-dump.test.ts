import { describe, expect, it } from 'vitest'
import {
  containsLegacyBrowserGrabDump,
  stripInjectedBrowserGrabDump
} from './strip-browser-grab-dump'

describe('stripInjectedBrowserGrabDump', () => {
  it('removes legacy grab dump paragraphs while preserving user draft text', () => {
    const prompt = [
      'Please tighten the header layout.',
      '',
      'Attached browser context from http://127.0.0.1:5175/web-index.html',
      '',
      'Selected element:',
      'header',
      'Role: header',
      'Selector: header.flex.h-\\[52px\\]'
    ].join('\n')

    expect(stripInjectedBrowserGrabDump(prompt)).toBe('Please tighten the header layout.')
  })

  it('removes a legacy dump that fills the entire composer field', () => {
    const prompt = [
      'Attached browser context from http://127.0.0.1:5175/web-index.html',
      '',
      'Selected element:',
      'div',
      'Role: div',
      'Selector: header.flex.h-\\[52px\\] > div.min-w-0:nth-of-type(1)',
      'Dimensions: 100x22',
      '',
      'Text content:',
      '.factory idle',
      '',
      'Computed styles:',
      '  display: flex',
      '',
      'HTML:',
      '<div class="flex min-w-0 items-center gap-2"></div>',
      '',
      'Ancestor path: div > header > section',
      'Full DOM path: body > div#root > header.flex.h-\\[52px\\]'
    ].join('\n')

    expect(stripInjectedBrowserGrabDump(prompt)).toBe('')
  })

  it('detects legacy grab dump text', () => {
    expect(containsLegacyBrowserGrabDump('Please fix the header.')).toBe(false)
    expect(containsLegacyBrowserGrabDump('Attached browser context from https://example.com')).toBe(
      true
    )
  })

  it('extracts user feedback from verbose annotation markdown dumps', () => {
    const prompt = [
      '## Design Feedback: /web-index.html',
      '',
      '**URL:** http://127.0.0.1:5175/web-index.html',
      '**Browser tab id:** page-1',
      '**Viewport:** 1439x929',
      '',
      '### 1. header div',
      '**Intent:** change',
      '**Selector:** `header > div`',
      '**Feedback:** This text is still showing'
    ].join('\n')

    expect(stripInjectedBrowserGrabDump(prompt)).toBe('This text is still showing')
  })

  it('preserves paste-safe orca browser context blocks', () => {
    const prompt = [
      'Please update this button.',
      '',
      '[orca-browser-element]',
      'url: https://example.com/pricing',
      'tag: button',
      'selector: main button.primary',
      'label: Start free trial',
      'bounds: 148x44 @ (400, 300)'
    ].join('\n')

    expect(stripInjectedBrowserGrabDump(prompt)).toBe(prompt)
    expect(containsLegacyBrowserGrabDump(prompt)).toBe(false)
  })

  it('removes concise grab copy paragraphs', () => {
    const prompt = [
      'Use this feedback.',
      '',
      'Page: https://example.com',
      'Element: button',
      'Selector: main button.primary',
      'Text: Start free trial'
    ].join('\n')

    expect(stripInjectedBrowserGrabDump(prompt)).toBe('Use this feedback.')
  })
})
