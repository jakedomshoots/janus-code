export function getIsoTimestamp(value: number): string | null {
  return Number.isFinite(value) ? new Date(value).toISOString() : null
}

export function getSortTimestamp(value: string | null): number {
  return value ? Date.parse(value) : Number.NEGATIVE_INFINITY
}
