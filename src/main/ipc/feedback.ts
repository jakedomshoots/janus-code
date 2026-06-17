import os from 'node:os'
import { app, ipcMain, net } from 'electron'

// Why: the production Mac build loads the renderer from a file:// origin, so a
// cross-origin POST from fetch() triggers a CORS preflight that the feedback
// endpoint rejects. Electron's net module runs in the main process and is not
// subject to CORS, so we proxy the submission through IPC. This mirrors the
// same pattern used by updater-changelog.ts and updater-nudge.ts.
const FEEDBACK_ENDPOINT_NOT_CONFIGURED =
  'Feedback submission is not configured for this Janus Code build.'
const FEEDBACK_REQUEST_TIMEOUT_MS = 10_000

export type FeedbackSubmissionType = 'feedback' | 'crash'

export type FeedbackSubmitArgs = {
  feedback: string
  submitAnonymously?: boolean
  githubLogin: string | null
  githubEmail: string | null
}

type FeedbackSubmitBody = {
  feedback: string
  submissionType: FeedbackSubmissionType
  githubLogin: string | null
  githubEmail: string | null
  appVersion: string
  platform: NodeJS.Platform
  osRelease: string
  arch: string
}

export type FeedbackSubmitResult =
  | { ok: true }
  | { ok: false; status: number | null; error: string }

type InternalFeedbackSubmitArgs = FeedbackSubmitArgs & {
  submissionType?: FeedbackSubmissionType
}

function getFeedbackApiUrl(): string | null {
  const value = process.env.JANUS_FEEDBACK_API_URL?.trim()
  return value ? value : null
}

function getFeedbackApiFallbackUrl(): string | null {
  const value = process.env.JANUS_FEEDBACK_API_FALLBACK_URL?.trim()
  return value ? value : null
}

// Why: follow-up investigation needs to know which Janus Code build and which
// OS the feedback came from. The main process is the only place with trusted
// access to these values, so we enrich the payload here rather than trusting
// the renderer.
function buildSubmitBody(args: InternalFeedbackSubmitArgs): FeedbackSubmitBody {
  const identity = args.submitAnonymously
    ? { githubLogin: null, githubEmail: null }
    : { githubLogin: args.githubLogin, githubEmail: args.githubEmail }

  // Why: anonymity is an IPC-only privacy decision. Allow-list fields here so
  // stale renderer state or future identity-shaped fields cannot leak upstream.
  return {
    feedback: args.feedback,
    submissionType: args.submissionType ?? 'feedback',
    ...identity,
    appVersion: app.getVersion(),
    platform: process.platform,
    osRelease: os.release(),
    arch: process.arch
  }
}

async function postFeedback(url: string, body: FeedbackSubmitBody): Promise<Response> {
  const controller = new AbortController()
  // Why: a silent feedback endpoint should not leave IPC or crash-report
  // submission flows pending forever.
  const timeout = setTimeout(() => controller.abort(), FEEDBACK_REQUEST_TIMEOUT_MS)
  try {
    return await net.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeout)
  }
}

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function submitFallbackFeedback(
  body: FeedbackSubmitBody,
  primaryError?: unknown
): Promise<FeedbackSubmitResult> {
  const fallbackUrl = getFeedbackApiFallbackUrl()
  if (!fallbackUrl) {
    if (primaryError === undefined) {
      return {
        ok: false,
        status: null,
        error: FEEDBACK_ENDPOINT_NOT_CONFIGURED
      }
    }
    return {
      ok: false,
      status: null,
      error: messageFromError(primaryError)
    }
  }
  try {
    const fallback = await postFeedback(fallbackUrl, body)
    if (fallback.ok) {
      return { ok: true }
    }
    return { ok: false, status: fallback.status, error: `status ${fallback.status}` }
  } catch (fallbackError) {
    const message = messageFromError(fallbackError)
    if (primaryError === undefined) {
      return { ok: false, status: null, error: message }
    }
    return {
      ok: false,
      status: null,
      error: `${messageFromError(primaryError)}; fallback: ${message}`
    }
  }
}

export async function submitFeedback(
  args: InternalFeedbackSubmitArgs
): Promise<FeedbackSubmitResult> {
  const feedbackUrl = getFeedbackApiUrl()
  if (!feedbackUrl) {
    return {
      ok: false,
      status: null,
      error: FEEDBACK_ENDPOINT_NOT_CONFIGURED
    }
  }
  const body = buildSubmitBody(args)
  try {
    const res = await postFeedback(feedbackUrl, body)
    if (res.ok) {
      return { ok: true }
    }
    // Why: only fall back on 404/5xx-style results and network errors — don't
    // mask real 4xx responses from a healthy Janus feedback host.
    if (res.status === 404 || res.status >= 500) {
      return submitFallbackFeedback(body)
    }
    return { ok: false, status: res.status, error: `status ${res.status}` }
  } catch (error) {
    // Why: when a Janus fallback endpoint is configured, network-level
    // failures on the primary host should still give the user one more chance
    // to submit without hiding real 4xx validation errors from a healthy host.
    return submitFallbackFeedback(body, error)
  }
}

export function registerFeedbackHandlers(): void {
  ipcMain.removeHandler('feedback:submit')
  ipcMain.handle('feedback:submit', (_event, args: FeedbackSubmitArgs) =>
    // Why: crash submissions are main-only. A compromised renderer can invoke
    // this channel directly, so force the public feedback lane at the boundary.
    submitFeedback({ ...args, submissionType: 'feedback' })
  )
}
