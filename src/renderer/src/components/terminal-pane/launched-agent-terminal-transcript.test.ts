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

  it('does not publish CLI trust prompts as assistant chat output', () => {
    const mirror = createLaunchedAgentTerminalTranscriptMirror()

    const preview = mirror.observe({
      data: [
        '\x1b]133;C\x07',
        '> tell me about this app',
        '133;C',
        '10;?11;?',
        'You are in /Users/jakedom/Documents/Fam-OSDoyoutrustthecontentsofthisdirectory?',
        'Workingwithuntrustedcontentscomeswithhigherriskofpromptinjection.',
        'Trustingthedirectoryallowsproject-localconfig,hooks,andexecpoliciestoload.',
        '1. Yes, continue2.No, 0HquitPress enter to continue',
        '10;?',
        '11;?'
      ].join('\r\n'),
      prompt: 'tell me about this app'
    })

    expect(preview).toBeNull()
  })

  it('waits through launch chatter and then publishes only the final answer', () => {
    const mirror = createLaunchedAgentTerminalTranscriptMirror()

    expect(
      mirror.observe({
        data: [
          '> tell me about this app',
          '133;C',
          'Do you trust the contents of this directory?',
          'Press enter to continue'
        ].join('\r\n'),
        prompt: 'tell me about this app'
      })
    ).toBeNull()

    const preview = mirror.observe({
      data: [
        '',
        'Fam-OS is a local-first family operating system for coordinating daily household work.',
        '',
        '## Current workflow',
        '',
        '- Track baby care events in a shared PWA.',
        '- Sync changes locally first, then through Convex when online.'
      ].join('\r\n'),
      prompt: 'tell me about this app'
    })

    expect(preview).toContain('Fam-OS is a local-first family operating system')
    expect(preview).toContain('## Current workflow')
    expect(preview).not.toContain('Do you trust')
    expect(preview).not.toContain('133;C')
  })
})
