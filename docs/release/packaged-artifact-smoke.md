# Packaged Artifact Smoke

## macOS Ad-Hoc Build

Run:

```bash
pnpm run build:mac
```

Check:

- `dist/mac-arm64/Agent Hub.app` exists on Apple Silicon.
- `dist/agent-hub-macos-arm64.dmg` exists.
- `dist/Agent Hub-<version>-arm64-mac.zip` exists.
- `dist/latest-mac.yml` exists.
- The app opens from Finder.
- The CLI launcher exists in packaged resources at `Contents/Resources/bin/agent-hub`.

## macOS Release Build

Run only with signing credentials:

```bash
pnpm run build:mac:release
```

Check:

- `codesign --verify --deep --strict "dist/mac-arm64/Agent Hub.app"` passes.
- `spctl --assess --type execute --verbose "dist/mac-arm64/Agent Hub.app"` passes.
- DMG opens and installs into `/Applications`.
