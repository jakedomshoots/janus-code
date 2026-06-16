# GUI-First Manual QA

## Environment

- macOS Apple Silicon host
- Fresh app profile
- At least one GitHub-authenticated repository
- At least one CLI agent installed and authenticated

## First Run

- App launches to onboarding.
- Agent setup is visible without opening a terminal.
- Project setup offers existing folder, clone URL, and new project.
- Skipping optional onboarding still lands in the GUI workspace.

## Workspace

- Existing repository import creates a visible workspace.
- New worktree creation starts from the GUI composer.
- Active workspace switch updates immediately.
- Terminal debug surface is available from the GUI.
- Sleeping workspace can be reopened without losing context.

## Agent Flow

- Prompt composer starts an agent.
- Agent status changes are visible in the GUI.
- User follow-up can be sent without typing into raw terminal output.
- Raw terminal output can still be inspected.

## Source Control

- Modified files appear in Source Control.
- Commit message generation survives Source Control remount.
- PR description generation survives worktree switch and remount.
- Commit action works on a test repo.
- PR creation opens the expected hosted review path.

## Settings

- Account settings show installed/authenticated providers.
- Display name setting handles IME input.
- Privacy/telemetry controls are visible.
- Update check shows a clear status.

## Install/Uninstall

- DMG installs into `/Applications`.
- First launch passes Gatekeeper.
- `brew uninstall --zap` paths match public app identity.
