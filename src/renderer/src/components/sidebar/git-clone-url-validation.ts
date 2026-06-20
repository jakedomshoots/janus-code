export const GIT_CLONE_URL_VALIDATION_MESSAGE =
  'Enter a valid Git URL, such as https://github.com/user/repo.git.'

const SCP_LIKE_GIT_URL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+:[^\s]+$/

export function isValidGitCloneUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || /\s/.test(trimmed)) {
    return false
  }

  if (SCP_LIKE_GIT_URL.test(trimmed)) {
    return trimmed.split(':')[1]?.includes('/') === true
  }

  try {
    const url = new URL(trimmed)
    if (!['https:', 'http:', 'ssh:', 'git:'].includes(url.protocol)) {
      return false
    }
    return Boolean(url.hostname && url.pathname.replace(/^\/+/, '').includes('/'))
  } catch {
    return false
  }
}

export function getGitCloneUrlValidationError(value: string): string | null {
  if (!value.trim()) {
    return null
  }
  return isValidGitCloneUrl(value) ? null : GIT_CLONE_URL_VALIDATION_MESSAGE
}
