# Janus Mobile App Store Boundary

## Current Decision

Do not change the Janus mobile UX flow right now. Treat mobile/web first-class UX work as a parked product direction until Janus has a dedicated mobile release path.

## Why

Janus Code is a fork of Orca, and the existing Orca mobile app on the iOS App Store is a separate signed binary. Changes made in this repository under `mobile/` do not update the App Store Orca app.

The current Janus mobile configuration already defines a separate app identity:

- App name: `Janus Mobile`
- Expo slug: `janus-mobile`
- URL scheme: `janus`
- iOS bundle identifier: `com.jakedom.janusmobile`
- Android package: `com.jakedom.janusmobile`

That means Janus-specific mobile behavior requires shipping a Janus-owned mobile app build, not relying on the already-published Orca mobile app.

## Practical Implication

The existing Orca mobile app may only run the Orca-shipped mobile code and protocol assumptions. It will not include Janus mobile UI, branding, pairing, protocol, dictation, or workflow changes unless Orca itself ships them.

For Janus users to get Janus mobile behavior, Janus needs its own iOS/TestFlight/App Store release flow with its own signing, metadata, screenshots, privacy declarations, and compatibility testing against Janus desktop.

## Future Direction

When mobile work resumes, the product direction should be:

- Keep desktop as the rich local workbench.
- Make mobile a command deck for monitoring, prompting, approvals, review, and shipping.
- Make web the portable workbench for users away from their desktop app.
- Keep desktop, mobile, web, CLI, and automations aligned around one shared workspace model.

The target UX model remains:

```text
Project -> Workspace -> Sessions -> Review -> Ship
```

But mobile UX changes should wait until the Janus mobile app release path is real.
