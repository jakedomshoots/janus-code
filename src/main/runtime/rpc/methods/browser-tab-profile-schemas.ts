import { z } from 'zod'
import { BrowserTarget, OptionalString, requiredString } from '../schemas'

export const TabList = z.object({ worktree: OptionalString })

// Why: --index xor --page must be present. The refine guards that invariant
// so the dispatcher surfaces a single legible error instead of either shape
// leaking into the runtime.
//
// `focus` is opt-in: when true, the runtime sends `browser:pane-focus` to
// the renderer after the switch lands. The renderer surfaces the browser
// pane only if the user is already on the targeted worktree; otherwise it
// pre-stages per-worktree state silently. This avoids cross-worktree screen
// theft when multiple agents drive browsers in parallel worktrees.
export const TabSwitch = BrowserTarget.extend({
  index: z
    .unknown()
    .transform((v) => (typeof v === 'number' ? v : undefined))
    .pipe(z.union([z.number(), z.undefined()]))
    .optional(),
  focus: z.boolean().optional()
}).refine(
  (val) => {
    if (val.page !== undefined) {
      return true
    }
    return val.index !== undefined && Number.isInteger(val.index) && val.index >= 0
  },
  { message: 'Missing required --index (non-negative integer) or --page' }
)

export const TabCreate = z.object({
  url: OptionalString,
  worktree: OptionalString,
  profileId: OptionalString,
  waitForRegistration: z.boolean().optional()
})

export const TabShow = z.object({
  page: requiredString('Missing required --page'),
  worktree: OptionalString
})

export const TabCurrent = z.object({ worktree: OptionalString })

export const TabClose = z.object({
  index: z
    .unknown()
    .transform((v) => (typeof v === 'number' ? v : undefined))
    .pipe(z.union([z.number(), z.undefined()]))
    .optional(),
  page: OptionalString,
  worktree: OptionalString
})

export const TabSetProfile = BrowserTarget.extend({
  profileId: requiredString('Missing required --profile')
})

export const TabProfileClone = BrowserTarget.extend({
  profileId: requiredString('Missing required --profile')
})

export const ProfileCreate = z.object({
  label: requiredString('Missing required --label'),
  // Strict enum so unknown scope values surface validation errors instead of being
  // silently coerced to 'isolated' (pr-bug-scan finding from #1397).
  scope: z.enum(['isolated', 'imported'])
})

export const ProfileDelete = z.object({
  profileId: requiredString('Missing required --profile')
})

export const ProfileImportFromBrowser = z.object({
  profileId: requiredString('Missing required --profile'),
  browserFamily: requiredString('Missing required --browser-family'),
  browserProfile: OptionalString
})
