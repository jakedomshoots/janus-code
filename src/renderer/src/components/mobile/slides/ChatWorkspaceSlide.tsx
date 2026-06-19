import {
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  Code2,
  Eye,
  FileText,
  Folder,
  GitBranch,
  GitPullRequestArrow,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Paperclip,
  SlidersHorizontal,
  Terminal
} from 'lucide-react'
import { translate } from '@/i18n/i18n'

const tabs = [
  { label: translate('mobile.chatWorkspace.tabs.chat', 'Chat'), icon: MessageSquare, active: true },
  { label: translate('mobile.chatWorkspace.tabs.files', 'Files'), icon: Folder, active: false },
  {
    label: translate('mobile.chatWorkspace.tabs.changes', 'Changes'),
    icon: GitPullRequestArrow,
    active: false
  },
  { label: translate('mobile.chatWorkspace.tabs.preview', 'Preview'), icon: Eye, active: false },
  {
    label: translate('mobile.chatWorkspace.tabs.terminal', 'Terminal'),
    icon: Terminal,
    active: false
  }
] as const

export function ChatWorkspaceSlide(): React.JSX.Element {
  return (
    <div className="mp-device-screen">
      <div className="mp-chat-chrome">
        <div className="mp-chat-topbar">
          <button
            type="button"
            className="mp-chat-icon-button"
            aria-label={translate('mobile.chatWorkspace.back', 'Back')}
          >
            <ChevronLeft />
          </button>
          <div className="mp-chat-title-block">
            <div className="mp-chat-title">
              {translate('mobile.chatWorkspace.title', 'Fix composer chat UI')}
            </div>
            <div className="mp-chat-meta">
              <span className="mp-status-dot is-green" />
              <span>{translate('mobile.chatWorkspace.agent', 'Claude Opus 4.8')}</span>
              <span>
                {translate('mobile.chatWorkspace.branch', 'codex/janus-porting-safe-runtime')}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="mp-chat-icon-button"
            aria-label={translate('mobile.chatWorkspace.more', 'More actions')}
          >
            <MoreHorizontal />
          </button>
        </div>
        <div className="mp-chat-status-strip">
          <span>{translate('mobile.chatWorkspace.status.ready', 'Ready for review')}</span>
          <span>{translate('mobile.chatWorkspace.status.files', '5 files')}</span>
          <span>{translate('mobile.chatWorkspace.status.tests', '41 tests')}</span>
        </div>
      </div>

      <div className="mp-chat-scroll">
        <div className="mp-chat-message is-user">
          <div className="mp-chat-bubble">
            {translate(
              'mobile.chatWorkspace.userPrompt',
              'Make the mobile composer feel like the new desktop workflow.'
            )}
          </div>
        </div>

        <div className="mp-chat-message is-agent">
          <div className="mp-chat-agent-row">
            <span className="mp-chat-agent-avatar">
              <Code2 />
            </span>
            <span>{translate('mobile.chatWorkspace.agentLabel', 'Janus')}</span>
            <span className="mp-chat-agent-state">
              <CheckCircle2 />
              {translate('mobile.chatWorkspace.agentState', 'done')}
            </span>
          </div>
          <div className="mp-chat-bubble">
            {translate(
              'mobile.chatWorkspace.agentReply',
              'Mobile now opens with chat first, then keeps files, changes, preview, and terminal one tap away.'
            )}
          </div>
        </div>

        <button type="button" className="mp-mobile-artifact-card">
          <span className="mp-mobile-artifact-icon">
            <FileText />
          </span>
          <span className="mp-mobile-artifact-main">
            <span className="mp-mobile-artifact-title">
              {translate(
                'mobile.chatWorkspace.markdownFile',
                'janus-direct-download-release-handoff-2026-06-19.md'
              )}
            </span>
            <span className="mp-mobile-artifact-meta">
              {translate('mobile.chatWorkspace.markdownMeta', 'Markdown · opens reader')}
            </span>
          </span>
          <span className="mp-mobile-artifact-action">
            {translate('mobile.chatWorkspace.openAction', 'Open')}
          </span>
        </button>

        <button type="button" className="mp-mobile-change-card">
          <span className="mp-mobile-artifact-icon">
            <GitBranch />
          </span>
          <span className="mp-mobile-artifact-main">
            <span className="mp-mobile-artifact-title">
              {translate('mobile.chatWorkspace.changedFiles', 'Edited 5 files')}
            </span>
            <span className="mp-mobile-artifact-meta">
              <span className="mp-change-added">
                {translate('mobile.chatWorkspace.changedFilesAdded', '+133')}
              </span>
              <span className="mp-change-deleted">
                {translate('mobile.chatWorkspace.changedFilesDeleted', '-24')}
              </span>
              <span>{translate('mobile.chatWorkspace.changedFilesMeta', 'review card')}</span>
            </span>
          </span>
          <span className="mp-mobile-artifact-action">
            {translate('mobile.chatWorkspace.reviewAction', 'Review')}
          </span>
        </button>
      </div>

      <div
        className="mp-mobile-tabbar"
        aria-label={translate('mobile.chatWorkspace.tabsLabel', 'Workspace tabs')}
      >
        {tabs.map(({ label, icon: Icon, active }) => (
          <button key={label} type="button" className={active ? 'is-active' : undefined}>
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="mp-mobile-composer">
        <div className="mp-mobile-composer-tools">
          <button
            type="button"
            aria-label={translate('mobile.chatWorkspace.attach', 'Attach context')}
          >
            <Paperclip />
          </button>
          <button
            type="button"
            aria-label={translate('mobile.chatWorkspace.commands', 'Slash commands')}
          >
            <SlidersHorizontal />
          </button>
          <span className="mp-mobile-command-chip">
            {translate('mobile.chatWorkspace.commandChip', '/review')}
          </span>
        </div>
        <div className="mp-mobile-composer-row">
          <div className="mp-mobile-input">
            {translate('mobile.chatWorkspace.inputPlaceholder', 'Message Janus…')}
          </div>
          <button type="button" aria-label={translate('mobile.chatWorkspace.dictate', 'Dictate')}>
            <Mic />
          </button>
          <button
            type="button"
            className="is-send"
            aria-label={translate('mobile.chatWorkspace.send', 'Send')}
          >
            <ArrowUp />
          </button>
        </div>
      </div>
    </div>
  )
}
