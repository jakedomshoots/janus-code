import { describe, expect, it } from 'vitest'
import { createLaunchedAgentTerminalTranscriptMirror } from './launched-agent-terminal-transcript'

describe('createLaunchedAgentTerminalTranscriptMirror', () => {
  it('extracts a Kimi assistant answer from terminal-only output', () => {
    const mirror = createLaunchedAgentTerminalTranscriptMirror()

    const preview = mirror.observe({
      data: [
        '/Users/jakedom/.zshrc:55: parse error near `\\n`',
        'Welcome to Kimi Code!',
        'Directory: /Users/jakedom/Documents/Fam-OS',
        '> tell me about this project',
        'yolo K2.7 Code thinking ~/Documents/Fam-OS',
        '... (19 more lines, ctrl+o to expand)',
        'Interrupted by user',
        '✨ Tell me about this project',
        '● The user is asking again "Tell me about this project". I already told them earlier.',
        '● This is Fam-OS - a shared family operating system built as a Progressive Web App (PWA).',
        '',
        'Core purpose',
        '',
        "It's designed for two-parent households to coordinate daily family life from their phones."
      ].join('\r\n'),
      prompt: 'tell me about this project'
    })

    expect(preview).toContain('This is Fam-OS')
    expect(preview).toContain('Core purpose')
    expect(preview).not.toContain('Welcome to Kimi Code')
    expect(preview).not.toContain('The user is asking')
    expect(preview).not.toContain('tell me about this project')
  })

  it('keeps terminal control sequences out of the mirrored answer', () => {
    const mirror = createLaunchedAgentTerminalTranscriptMirror()

    const preview = mirror.observe({
      data: '\x1b[2J\x1b[H> summarize\r\n\x1b[32mThe project has a clean local-first MVP.\x1b[0m',
      prompt: 'summarize'
    })

    expect(preview).toBe('The project has a clean local-first MVP.')
  })
})
