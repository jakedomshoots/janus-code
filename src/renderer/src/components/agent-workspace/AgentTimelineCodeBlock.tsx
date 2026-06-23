import { isValidElement, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { translate } from '@/i18n/i18n'

export function AgentTimelineCodeBlock({
  children,
  ...props
}: React.ComponentProps<'pre'>): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<number | null>(null)
  const codeText = getReactNodeText(children).replace(/\n$/, '')
  const codeLanguage = getCodeBlockLanguage(children)
  const codeLanguageLabel = codeLanguage ? formatCodeBlockLanguageLabel(codeLanguage) : null

  const clearResetTimer = useCallback((): void => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  useEffect(() => clearResetTimer, [clearResetTimer])

  const handleCopy = useCallback((): void => {
    const writeClipboardText =
      window.api?.ui?.writeClipboardText ??
      navigator.clipboard?.writeText?.bind(navigator.clipboard)
    if (!codeText || !writeClipboardText) {
      return
    }
    void writeClipboardText(codeText)
      .then(() => {
        clearResetTimer()
        setCopied(true)
        resetTimerRef.current = window.setTimeout(() => {
          resetTimerRef.current = null
          setCopied(false)
        }, 1500)
      })
      .catch(() => {
        /* best-effort */
      })
  }, [clearResetTimer, codeText])

  return (
    <div className="agent-timeline-code-block" data-agent-code-block="true">
      <div className="agent-timeline-code-block-header">
        {codeLanguage && codeLanguageLabel ? (
          <span className="agent-timeline-code-language" data-agent-code-language={codeLanguage}>
            {codeLanguageLabel}
          </span>
        ) : null}
        <button
          type="button"
          className="agent-timeline-code-copy-button"
          onClick={handleCopy}
          disabled={!codeText}
          aria-label={translate(
            'auto.components.agentWorkspace.timeline.copyCode',
            'Copy code block'
          )}
        >
          {copied ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <Copy className="size-3" aria-hidden="true" />
          )}
          <span>
            {copied
              ? translate('auto.components.agentWorkspace.timeline.copied', 'Copied')
              : translate('auto.components.agentWorkspace.timeline.copy', 'Copy')}
          </span>
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  )
}

function getCodeBlockLanguage(node: ReactNode): string | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const language = getCodeBlockLanguage(child)
      if (language) {
        return language
      }
    }
    return null
  }
  if (!isValidElement<{ className?: string; children?: ReactNode }>(node)) {
    return null
  }
  const className = node.props.className ?? ''
  const language = className.match(/\blanguage-([^\s]+)/)?.[1]?.trim()
  return language ? language.toLowerCase() : getCodeBlockLanguage(node.props.children)
}

function formatCodeBlockLanguageLabel(language: string): string {
  switch (language) {
    case 'js':
      return 'JavaScript'
    case 'jsx':
      return 'JSX'
    case 'ts':
      return 'TypeScript'
    case 'tsx':
      return 'TSX'
    case 'py':
    case 'python':
      return 'Python'
    case 'sh':
    case 'shell':
    case 'bash':
      return 'Shell'
    case 'md':
    case 'markdown':
      return 'Markdown'
    case 'json':
      return 'JSON'
    case 'yaml':
    case 'yml':
      return 'YAML'
    default:
      return language.toUpperCase()
  }
}

function getReactNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map((child) => getReactNodeText(child)).join('')
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getReactNodeText(node.props.children)
  }
  return ''
}
