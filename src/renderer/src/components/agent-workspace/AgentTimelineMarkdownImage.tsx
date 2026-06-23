import { useEffect, useState } from 'react'
import { useLocalImageSrc } from '@/components/editor/useLocalImageSrc'
import { cn } from '@/lib/utils'

type AgentTimelineMarkdownImageProps = React.ComponentProps<'img'> & {
  readonly filePath: string
  readonly node?: unknown
}

export function AgentTimelineMarkdownImage({
  src,
  alt,
  className,
  filePath,
  node: _node,
  onError,
  ...props
}: AgentTimelineMarkdownImageProps): React.JSX.Element {
  const rawSrc = typeof src === 'string' ? src : undefined
  const displaySrc = useLocalImageSrc(rawSrc, filePath)
  const [failed, setFailed] = useState(false)
  const altText = alt?.trim() || 'Agent response image'

  useEffect(() => {
    setFailed(false)
  }, [displaySrc])

  if (!rawSrc || !displaySrc || failed) {
    return (
      <span
        className="agent-timeline-markdown-image-placeholder"
        data-agent-markdown-image-placeholder="true"
        role="img"
        aria-label={altText}
      >
        <span className="agent-timeline-markdown-image-placeholder-text">{altText}</span>
      </span>
    )
  }

  return (
    <span className="agent-timeline-markdown-image-frame" data-agent-markdown-image-frame="true">
      <img
        {...props}
        src={displaySrc}
        alt={alt ?? ''}
        className={cn('agent-timeline-markdown-image', className)}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          onError?.(event)
          if (!event.defaultPrevented) {
            setFailed(true)
          }
        }}
      />
    </span>
  )
}
