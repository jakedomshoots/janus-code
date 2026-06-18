export type AppThemePreference = 'retro95' | 'system' | 'dark' | 'light'
export type ModernThemePreference = Exclude<AppThemePreference, 'retro95'>

export function isRetro95Theme(theme: AppThemePreference | null | undefined): boolean {
  return (theme ?? 'retro95') === 'retro95'
}

export function resolveModernThemePreference(
  theme: AppThemePreference | null | undefined
): ModernThemePreference {
  return theme === 'dark' || theme === 'light' || theme === 'system' ? theme : 'light'
}

export function resolveNativeThemeSource(
  theme: AppThemePreference | null | undefined
): ModernThemePreference {
  return resolveModernThemePreference(theme)
}
