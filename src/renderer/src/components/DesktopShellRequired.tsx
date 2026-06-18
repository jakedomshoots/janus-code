import { translate } from '@/i18n/i18n'

// Why: the electron-vite dev URL is only valid inside the desktop shell preload;
// loading it in a browser tab or embedded workbench otherwise crashes App.
export function DesktopShellRequired(): React.JSX.Element {
  return (
    <div
      className="flex h-full min-h-screen flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground"
      role="alert"
    >
      <div className="font-medium text-foreground">
        {translate(
          'auto.components.DesktopShellRequired.title',
          'Open Janus Code in the desktop app'
        )}
      </div>
      <div className="max-w-md text-xs">
        {translate(
          'auto.components.DesktopShellRequired.description',
          'This URL is the Electron dev renderer and only works inside the Janus Code window launched by pnpm dev. For browser testing, use the paired web client at http://127.0.0.1:5175/ instead.'
        )}
      </div>
    </div>
  )
}
