import { useICO } from '../../hooks/useICO'
import { useWallet } from '../../hooks/useWallet'

function formatLockPeriod(lockPeriodSeconds: bigint): string {
  const seconds = Number(lockPeriodSeconds)
  const oneYear = 365 * 24 * 60 * 60
  const fourYears = 4 * oneYear

  if (seconds >= fourYears) return '4 Years'
  if (seconds >= oneYear) return '1 Year'
  return 'Unknown'
}

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const value = Number(amount) / Math.pow(10, decimals)
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export default function PurchaseRecords() {
  const { isConnected } = useWallet()
  const { records } = useICO()

  if (!isConnected) {
    return (
      <div className="records-panel">
        <h3>Your Purchase Records</h3>
        <p className="no-records">Connect your wallet to view your purchase records.</p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="records-panel">
        <h3>Your Purchase Records</h3>
        <p className="no-records">No purchase records yet.</p>
      </div>
    )
  }

  return (
    <div className="records-panel">
      <h3>Your Purchase Records</h3>

      {records.map((record) => {
        const now = Math.floor(Date.now() / 1000)
        const isUnlocked = Number(record.unlockTime) <= now
        const status = record.claimed
          ? 'claimed'
          : isUnlocked
            ? 'claimable'
            : 'locked'

        return (
          <div key={record.id.toString()} className="record-item">
            <div className="record-header">
              <span className="record-id">#{record.id.toString()}</span>
              <span className={`record-status ${status}`}>
                {status === 'claimed' ? 'Claimed' : status === 'claimable' ? 'Claimable' : 'Locked'}
              </span>
            </div>
            <div className="record-details">
              <p><strong>Amount:</strong> {formatTokenAmount(record.amount)} USDT</p>
              <p><strong>PAULO:</strong> {formatTokenAmount(record.pauloAmount)} PAULO</p>
              <p><strong>Lock Period:</strong> {formatLockPeriod(record.lockPeriod)}</p>
              <p><strong>Purchase Time:</strong> {formatTimestamp(record.purchaseTime)}</p>
              <p><strong>Unlock Time:</strong> {formatTimestamp(record.unlockTime)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
