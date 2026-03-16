export function formatLockPeriod(lockPeriodSeconds: bigint): string {
  const seconds = Number(lockPeriodSeconds)
  const year = Math.floor(seconds / (365 * 24 * 60 * 60))

  if (year >= 4) {
    return '4 Years'
  } else if (year >= 1) {
    return '1 Year'
  }
  return `${Math.floor(seconds / 86400)} Days`
}
