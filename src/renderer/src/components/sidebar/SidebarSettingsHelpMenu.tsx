import React, { useState } from 'react'
import {
  BookOpen,
  CircleHelp,
  ExternalLink,
  Github,
  Keyboard,
  Loader2,
  MessageSquareText,
  RefreshCw,
  RotateCw,
  School,
  ScrollText,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import logo from '../../../../../resources/logo.svg'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useMountedRef } from '@/hooks/useMountedRef'
import { useShortcutKeys } from '@/hooks/useShortcutLabel'
import { ShortcutKeyCombo } from '@/components/ShortcutKeyCombo'
import { showOnboardingFromRenderer } from '../onboarding/show-onboarding-event'
import { SetupGuideProgressRing } from '../setup-guide/SetupGuideProgressRing'
import { useSetupGuideProgress } from '../setup-guide/use-setup-guide-progress'
import { SidebarFeedbackDialog } from './SidebarFeedbackDialog'
import { translate } from '@/i18n/i18n'

const DOCS_URL = 'https://github.com/jakedomshoots/janus-code/tree/main/docs'
const CHANGELOG_URL = 'https://github.com/jakedomshoots/janus-code/releases'
const GITHUB_URL = 'https://github.com/jakedomshoots/janus-code'
const ISSUES_URL = 'https://github.com/jakedomshoots/janus-code/issues'

function openExternalUrl(url: string): void {
  void window.api.shell.openUrl(url)
}

function ExternalMenuItem({
  label,
  url,
  icon
}: {
  label: string
  url: string
  icon: React.ReactNode
}): React.JSX.Element {
  return (
    <DropdownMenuItem onSelect={() => openExternalUrl(url)}>
      {icon}
      {label}
      <ExternalLink className="ml-auto size-3 text-muted-foreground" />
    </DropdownMenuItem>
  )
}

export function SidebarSettingsHelpMenu(): React.JSX.Element {
  const openModal = useAppStore((s) => s.openModal)
  const openSettingsPage = useAppStore((s) => s.openSettingsPage)
  const openSettingsTarget = useAppStore((s) => s.openSettingsTarget)
  const updateStatus = useAppStore((s) => s.updateStatus)
  const setupProgress = useSetupGuideProgress(true, false, false)

  const settingsShortcutKeys = useShortcutKeys('app.settings')
  const [menuOpen, setMenuOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [showAdminOptions, setShowAdminOptions] = useState(false)
  const [isRestartingOrca, setIsRestartingOrca] = useState(false)
  const lastShowOnboardingAtRef = React.useRef(0)
  const mountedRef = useMountedRef()

  const showMilestones =
    setupProgress.ready && setupProgress.coreDoneCount < setupProgress.coreTotal

  const handleMenuOpenChange = (open: boolean): void => {
    setMenuOpen(open)
    if (!open) {
      setShowAdminOptions(false)
    }
  }

  const revealAdminOptions = (altKey: boolean): void => {
    // Why: onboarding replay and restart stay off the default Help menu; holding
    // Option/Alt before opening is an intentional power-user affordance.
    setShowAdminOptions(altKey)
  }

  const handleShowOnboarding = (): void => {
    const now = Date.now()
    if (now - lastShowOnboardingAtRef.current < 500) {
      return
    }
    lastShowOnboardingAtRef.current = now
    void showOnboardingFromRenderer()
  }

  const handleRestartOrca = (): void => {
    if (isRestartingOrca) {
      return
    }
    setIsRestartingOrca(true)
    toast.info(
      translate(
        'auto.components.sidebar.SidebarSettingsHelpMenu.5161eef55d',
        'Restarting Janus Code…'
      )
    )
    void window.api.app.restart().catch((error) => {
      if (mountedRef.current) {
        setIsRestartingOrca(false)
        toast.error(
          translate(
            'auto.components.sidebar.SidebarSettingsHelpMenu.4e8f5710d3',
            "Couldn't restart Janus Code."
          ),
          {
            description: error instanceof Error ? error.message : undefined
          }
        )
      }
    })
  }

  const openShortcutsSettings = (): void => {
    openSettingsTarget({ pane: 'shortcuts', repoId: null })
    openSettingsPage()
  }

  const handleCheckForUpdates = (event: Event): void => {
    const shiftKey = (event as PointerEvent).shiftKey
    void window.api.updater.check({ includePrerelease: shiftKey })
  }

  const openMilestones = (): void => {
    openModal('setup-guide', { telemetrySource: 'help_menu' })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              aria-label={translate(
                'auto.components.sidebar.SidebarSettingsHelpMenu.a428c25998',
                'Settings'
              )}
              className="text-muted-foreground"
              onClick={openSettingsPage}
            >
              <Settings className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="flex items-center gap-1.5">
            {translate('auto.components.sidebar.SidebarSettingsHelpMenu.a428c25998', 'Settings')}
            {settingsShortcutKeys.length > 0 ? (
              <ShortcutKeyCombo
                keys={settingsShortcutKeys}
                className="gap-0.5"
                keyCapClassName="min-w-0 border-background/20 bg-background/10 px-1 py-0 text-[10px] text-background shadow-none"
                separatorClassName="text-[10px] text-background/70"
              />
            ) : null}
          </TooltipContent>
        </Tooltip>
        <DropdownMenu modal={false} open={menuOpen} onOpenChange={handleMenuOpenChange}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  type="button"
                  aria-label={translate(
                    'auto.components.sidebar.SidebarSettingsHelpMenu.2991a0106c',
                    'Help'
                  )}
                  className="text-muted-foreground"
                  onPointerDown={(event) => revealAdminOptions(event.altKey)}
                  onClick={(event) => revealAdminOptions(event.altKey)}
                >
                  <CircleHelp className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>
              {translate('auto.components.sidebar.SidebarSettingsHelpMenu.2991a0106c', 'Help')}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-52">
            <DropdownMenuItem onSelect={openShortcutsSettings}>
              <Keyboard className="size-3.5" />
              {translate(
                'auto.components.sidebar.SidebarSettingsHelpMenu.e565171a7c',
                'Keyboard Shortcuts'
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setFeedbackOpen(true)}>
              <MessageSquareText className="size-3.5" />
              {translate(
                'auto.components.sidebar.SidebarSettingsHelpMenu.4cf5b868d7',
                'Send Feedback'
              )}
            </DropdownMenuItem>
            {showMilestones ? (
              <DropdownMenuItem onSelect={openMilestones}>
                <img
                  src={logo}
                  alt=""
                  aria-hidden="true"
                  className="size-3.5 object-contain invert opacity-55 dark:invert-0"
                />
                {translate(
                  'auto.components.sidebar.SidebarSettingsHelpMenu.f8a2c91d4e',
                  'Milestones'
                )}
                <SetupGuideProgressRing
                  done={setupProgress.coreDoneCount}
                  total={setupProgress.coreTotal}
                  sizeClassName="size-4"
                  className="ml-auto"
                />
              </DropdownMenuItem>
            ) : null}
            {showAdminOptions ? (
              <DropdownMenuItem
                className="whitespace-nowrap"
                onClick={handleShowOnboarding}
                onSelect={handleShowOnboarding}
              >
                <School className="size-3.5" />
                {translate(
                  'auto.components.sidebar.SidebarSettingsHelpMenu.b7e4d2a19c',
                  'Onboarding'
                )}
              </DropdownMenuItem>
            ) : null}
            <ExternalMenuItem
              label={translate(
                'auto.components.sidebar.SidebarSettingsHelpMenu.cdc87f897e',
                'Docs'
              )}
              url={DOCS_URL}
              icon={<BookOpen className="size-3.5" />}
            />
            <ExternalMenuItem
              label={translate(
                'auto.components.sidebar.SidebarSettingsHelpMenu.5f83d86d92',
                'Changelog'
              )}
              url={CHANGELOG_URL}
              icon={<ScrollText className="size-3.5" />}
            />
            <DropdownMenuSeparator />
            <ExternalMenuItem
              label={translate(
                'auto.components.sidebar.SidebarSettingsHelpMenu.5687ab246a',
                'GitHub'
              )}
              url={GITHUB_URL}
              icon={<Github className="size-3.5" />}
            />
            <ExternalMenuItem
              label={translate(
                'auto.components.sidebar.SidebarSettingsHelpMenu.c781f73e3f',
                'Issues'
              )}
              url={ISSUES_URL}
              icon={<MessageSquareText className="size-3.5" />}
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={updateStatus.state === 'checking' || updateStatus.state === 'downloading'}
              onSelect={handleCheckForUpdates}
            >
              {updateStatus.state === 'checking' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              {translate(
                'auto.components.sidebar.SidebarSettingsHelpMenu.29c56f30ee',
                'Check for Updates'
              )}
            </DropdownMenuItem>
            {showAdminOptions ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleRestartOrca} disabled={isRestartingOrca}>
                  <RotateCw className="size-3.5" />
                  {translate(
                    'auto.components.sidebar.SidebarSettingsHelpMenu.ad3d3ed7f1',
                    'Restart Janus Code'
                  )}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SidebarFeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  )
}
