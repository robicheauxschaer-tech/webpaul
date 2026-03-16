export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  if (!amount || amount === 0n) return '0'

  const value = Number(amount) / Math.pow(10, decimals)

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value.toFixed(2)
}
