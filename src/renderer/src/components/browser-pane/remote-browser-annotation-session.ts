import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BrowserScreencastFrameMetadata } from '../../../../shared/browser-screencast-protocol'
import type {
  BrowserAnnotationIntent,
  BrowserAnnotationPayload,
  BrowserGrabPayload,
  BrowserGrabRect,
  BrowserPageAnnotation
} from '../../../../shared/browser-grab-types'
import { GRAB_BUDGET } from '../../../../shared/browser-grab-types'
import { useGrabMode } from './useGrabMode'
import {
  formatBrowserAnnotationsForAgentPrompt,
  formatBrowserAnnotationsForClipboard
} from './browser-annotation-output'
import { useAppStore } from '@/store'

const EMPTY_BROWSER_ANNOTATIONS: BrowserPageAnnotation[] = []
const PENDING_ANNOTATION_CARD_HEIGHT = 330
const DEFAULT_BROWSER_ANNOTATION_PRIORITY = 'suggestion' as const

export type RemoteBrowserOverlayAnchor = {
  x: number
  y: number
  below: boolean
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getPositiveFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

export function getRemoteBrowserOverlayAnchor(
  payload: BrowserGrabPayload,
  viewportEl: HTMLElement | null,
  imageEl: HTMLImageElement | null,
  frameMetadata: BrowserScreencastFrameMetadata | null
): RemoteBrowserOverlayAnchor {
  const containerRect = viewportEl?.getBoundingClientRect()
  const imageRect = imageEl?.getBoundingClientRect()
  const rect = payload.target.rectViewport
  const viewportWidth =
    getPositiveFiniteNumber(frameMetadata?.deviceWidth) ?? imageEl?.naturalWidth ?? rect.width
  const viewportHeight =
    getPositiveFiniteNumber(frameMetadata?.deviceHeight) ?? imageEl?.naturalHeight ?? rect.height
  const renderedWidth = imageRect?.width ?? containerRect?.width ?? viewportWidth
  const renderedHeight = imageRect?.height ?? containerRect?.height ?? viewportHeight
  const offsetX = (imageRect?.left ?? 0) - (containerRect?.left ?? 0)
  const offsetY = (imageRect?.top ?? 0) - (containerRect?.top ?? 0)
  const scaleX = viewportWidth > 0 ? renderedWidth / viewportWidth : 1
  const scaleY = viewportHeight > 0 ? renderedHeight / viewportHeight : 1
  const elementBottom = offsetY + (rect.y + rect.height) * scaleY
  const elementTop = offsetY + rect.y * scaleY
  const containerWidth = containerRect?.width ?? 0
  const containerHeight = containerRect?.height ?? 0
  const below = elementBottom + PENDING_ANNOTATION_CARD_HEIGHT < containerHeight
  return {
    x: clampNumber(
      offsetX + (rect.x + rect.width / 2) * scaleX,
      12,
      Math.max(12, containerWidth - 12)
    ),
    y: clampNumber(below ? elementBottom : elementTop, 12, Math.max(12, containerHeight - 12)),
    below
  }
}

function createBrowserAnnotationId(): string {
  return `browser-annotation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createBrowserAnnotationPayload(payload: BrowserGrabPayload): BrowserAnnotationPayload {
  return {
    ...payload,
    screenshot: null
  }
}

export type GrabIntent = 'copy' | 'annotate'

export function useRemoteBrowserAnnotationSession(args: {
  browserPageId: string
  worktreeId: string
  isActive: boolean
}): {
  grab: ReturnType<typeof useGrabMode>
  grabIntent: GrabIntent
  startGrabIntent: (intent: GrabIntent) => void
  pendingAnnotationPayload: BrowserGrabPayload | null
  handleAddBrowserAnnotation: (comment: string, intent: BrowserAnnotationIntent) => void
  handleCancelPendingBrowserAnnotation: () => void
  browserAnnotations: BrowserPageAnnotation[]
  browserAnnotationTrayOpen: boolean
  setBrowserAnnotationTrayOpen: (open: boolean) => void
  browserAnnotationsPrompt: string
  browserAnnotationsClipboardText: string
  browserAnnotationsCopied: boolean
  handleCopyBrowserAnnotations: () => void
} {
  const { browserPageId, isActive } = args
  const grab = useGrabMode(browserPageId)
  const guiAgentWorkspaceEnabled = useAppStore(
    (state) => state.settings?.guiAgentWorkspaceEnabled === true
  )
  const [grabIntent, setGrabIntent] = useState<GrabIntent>(() =>
    guiAgentWorkspaceEnabled ? 'annotate' : 'copy'
  )
  const [pendingAnnotationPayload, setPendingAnnotationPayload] =
    useState<BrowserGrabPayload | null>(null)
  const [browserAnnotationTrayOpen, setBrowserAnnotationTrayOpen] = useState(true)
  const [browserAnnotationsCopied, setBrowserAnnotationsCopied] = useState(false)
  const annotationCopyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const browserAnnotations = useAppStore(
    (state) => state.browserAnnotationsByPageId[browserPageId] ?? EMPTY_BROWSER_ANNOTATIONS
  )
  const addBrowserPageAnnotation = useAppStore((state) => state.addBrowserPageAnnotation)
  const recordFeatureInteraction = useAppStore((state) => state.recordFeatureInteraction)
  const browserAnnotationsPrompt = useMemo(
    () => formatBrowserAnnotationsForAgentPrompt(browserAnnotations),
    [browserAnnotations]
  )
  const browserAnnotationsClipboardText = useMemo(
    () => formatBrowserAnnotationsForClipboard(browserAnnotations),
    [browserAnnotations]
  )

  useEffect(() => {
    if (grab.state !== 'confirming' || !grab.payload) {
      return
    }
    if (grabIntent === 'annotate') {
      setPendingAnnotationPayload(grab.payload)
    }
  }, [grab.state, grab.payload, grabIntent])

  useEffect(() => {
    if (grab.state === 'idle' || grab.state === 'error') {
      setPendingAnnotationPayload(null)
    }
  }, [grab.state])

  useEffect(() => {
    return () => clearTimeout(annotationCopyTimerRef.current)
  }, [])

  const startGrabIntent = useCallback(
    (nextIntent: GrabIntent): void => {
      recordFeatureInteraction('browser-grab')
      if (nextIntent === 'annotate') {
        recordFeatureInteraction('browser-annotations')
      }
      setGrabIntent(nextIntent)
      if (nextIntent === 'copy') {
        setPendingAnnotationPayload(null)
      } else {
        setBrowserAnnotationTrayOpen(true)
      }
      if (grab.state === 'idle' || grab.state === 'error' || grabIntent === nextIntent) {
        grab.toggle()
      }
    },
    [grab, grabIntent, recordFeatureInteraction]
  )

  const handleAddBrowserAnnotation = useCallback(
    (comment: string, intent: BrowserAnnotationIntent): void => {
      if (!pendingAnnotationPayload) {
        return
      }
      addBrowserPageAnnotation({
        id: createBrowserAnnotationId(),
        browserPageId,
        comment,
        intent,
        priority: DEFAULT_BROWSER_ANNOTATION_PRIORITY,
        createdAt: new Date().toISOString(),
        payload: createBrowserAnnotationPayload(pendingAnnotationPayload)
      })
      recordFeatureInteraction('browser-annotations')
      setPendingAnnotationPayload(null)
      setBrowserAnnotationTrayOpen(true)
      grab.rearm()
    },
    [
      addBrowserPageAnnotation,
      browserPageId,
      grab,
      pendingAnnotationPayload,
      recordFeatureInteraction
    ]
  )

  const handleCancelPendingBrowserAnnotation = useCallback((): void => {
    setPendingAnnotationPayload(null)
    if (grabIntent === 'annotate' && grab.state === 'confirming') {
      grab.rearm()
    }
  }, [grab, grabIntent])

  const handleCopyBrowserAnnotations = useCallback((): void => {
    if (!browserAnnotationsClipboardText) {
      return
    }
    void window.api.ui.writeClipboardText(browserAnnotationsClipboardText)
    recordFeatureInteraction('browser-annotations')
    clearTimeout(annotationCopyTimerRef.current)
    setBrowserAnnotationsCopied(true)
    annotationCopyTimerRef.current = setTimeout(() => setBrowserAnnotationsCopied(false), 1400)
  }, [browserAnnotationsClipboardText, recordFeatureInteraction])

  useEffect(() => {
    if (!isActive) {
      return
    }
    return window.api.browser.onGrabModeToggle((tabId) => {
      if (tabId === browserPageId) {
        startGrabIntent('copy')
      }
    })
  }, [browserPageId, isActive, startGrabIntent])

  return {
    grab,
    grabIntent,
    startGrabIntent,
    pendingAnnotationPayload,
    handleAddBrowserAnnotation,
    handleCancelPendingBrowserAnnotation,
    browserAnnotations,
    browserAnnotationTrayOpen,
    setBrowserAnnotationTrayOpen,
    browserAnnotationsPrompt,
    browserAnnotationsClipboardText,
    browserAnnotationsCopied,
    handleCopyBrowserAnnotations
  }
}

export const REMOTE_BROWSER_ANNOTATION_COMMENT_MAX_LENGTH = GRAB_BUDGET.annotationCommentMaxLength
export type { BrowserGrabRect }
