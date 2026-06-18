import { z } from 'zod'
import { BrowserTarget, requiredString } from '../schemas'

export const GrabSetMode = BrowserTarget.extend({
  enabled: z.custom<boolean>((value) => typeof value === 'boolean', {
    message: 'Missing required enabled flag'
  })
})

export const GrabAwaitSelection = BrowserTarget.extend({
  opId: requiredString('Missing required opId')
})

export const GrabCaptureScreenshot = BrowserTarget.extend({
  rect: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  })
})
