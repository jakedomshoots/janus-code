import { describe, expect, it } from 'vitest'
import { resolveTuiAgentApprovalInput } from './tui-agent-approval-input'

describe('resolveTuiAgentApprovalInput', () => {
  it('maps Claude approvals to numbered menu choices', () => {
    expect(resolveTuiAgentApprovalInput('claude', 'approve')).toBe('1\r')
    expect(resolveTuiAgentApprovalInput('claude', 'deny')).toBe('3\r')
  })

  it('maps Codex approvals to enter and deny shortcuts', () => {
    expect(resolveTuiAgentApprovalInput('codex', 'approve')).toBe('\r')
    expect(resolveTuiAgentApprovalInput('codex', 'deny')).toBe('n\r')
  })

  it('falls back to yes/no for other providers', () => {
    expect(resolveTuiAgentApprovalInput('opencode', 'approve')).toBe('y\r')
    expect(resolveTuiAgentApprovalInput('opencode', 'deny')).toBe('n\r')
  })
})
