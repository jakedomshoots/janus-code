import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import { useMountedRef } from '@/hooks/useMountedRef'
import { translate } from '@/i18n/i18n'
import { cn } from '../lib/utils'

const ORCA_STARGAZERS_URL = 'https://github.com/jakedomshoots/janus-code/stargazers'

type StarState = 'loading' | 'starred' | 'not-starred' | 'web-fallback' | 'hidden'

export function GitHubStarButton({ hasRepos }: { hasRepos: boolean }): React.JSX.Element | null {
  const [state, setState] = useState<StarState>('loading')
  const [menuOpen, setMenuOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const mountedRef = useMountedRef()

  useEffect(() => {
    let cancelled = false
    void window.api.gh.checkOrcaStarred().then((result) => {
      if (cancelled) {
        return
      }
      if (result === null) {
        setState('web-fallback')
      } else {
        setState(result ? 'starred' : 'not-starred')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) {
      return
    }
    const onDocClick = (e: MouseEvent): void => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const handleClick = async (): Promise<void> => {
    if (state === 'starred') {
      setMenuOpen((v) => !v)
      return
    }
    if (state === 'web-fallback') {
      await window.api.shell.openUrl(ORCA_STARGAZERS_URL)
      await window.api.starNag.complete()
      return
    }
    if (state !== 'not-starred') {
      return
    }
    setState('starred')
    const ok = await window.api.gh.starOrca('landing')
    if (!ok) {
      if (mountedRef.current) {
        setState('web-fallback')
      }
      return
    }
    // Why: starring from any entry point mutes the threshold-based nag.
    await window.api.starNag.complete()
  }

  if (state === 'hidden' || (state === 'starred' && hasRepos)) {
    return null
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-all duration-300',
          state === 'loading' && 'pointer-events-none opacity-0',
          state !== 'starred' &&
            'cursor-pointer border-amber-500/60 text-amber-700 hover:border-amber-500/80 hover:bg-amber-400/10 dark:border-amber-400/30 dark:text-amber-300/90 dark:hover:border-amber-400/50 dark:hover:bg-amber-400/[0.08]',
          state === 'starred' &&
            'cursor-pointer border-amber-500/50 bg-amber-400/10 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/[0.06] dark:text-amber-400/60'
        )}
        onClick={handleClick}
        disabled={state === 'loading'}
      >
        {state === 'web-fallback' ? (
          <ExternalLink className="size-3.5 text-amber-600 transition-all duration-300 dark:text-amber-400/80" />
        ) : (
          <Star
            className={cn(
              'size-3.5 transition-all duration-300',
              state === 'starred'
                ? 'fill-amber-500/70 text-amber-500/70 dark:fill-amber-400/60 dark:text-amber-400/60'
                : 'text-amber-600 dark:text-amber-400/80'
            )}
          />
        )}
        {state === 'starred'
          ? translate('auto.components.Landing.ec43b38ba7', 'Starred on GitHub')
          : state === 'web-fallback'
            ? translate('auto.components.Landing.157bb5ecbb', 'Open GitHub')
            : translate('auto.components.Landing.0d0ace8861', 'Star on GitHub')}
      </button>
      {state === 'starred' && menuOpen && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-10 min-w-[100px] rounded-md border border-border bg-popover py-1 shadow-md">
          <button
            className="w-full px-3 py-1.5 text-left text-[13px] text-foreground hover:bg-muted"
            onClick={() => {
              setMenuOpen(false)
              setState('hidden')
            }}
          >
            {translate('auto.components.Landing.c1cf168479', 'Hide')}
          </button>
        </div>
      )}
    </div>
  )
}
