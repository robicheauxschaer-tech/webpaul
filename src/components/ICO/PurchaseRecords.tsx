import { useICO, type PhaseLockRecord } from '../../hooks/useICO'
import { useWallet } from '../../hooks/useWallet'
import { useEffect } from 'react'

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format token amount with 6 decimals (PAULO token)
function formatTokenAmount(amount: bigint, decimals: number = 6): string {
  const value = Number(amount) / Math.pow(10, decimals)
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

// Format lock duration to readable string
function formatLockDuration(durationSeconds: bigint): string {
  const seconds = Number(durationSeconds)
  const days = Math.floor(seconds / 86400)
  const years = Math.floor(days / 365)

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`
  }
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  }
  const hours = Math.floor(seconds / 3600)
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return 'Instant'
}

function getTimeRemaining(unlockTime: number): string {
  const now = Math.floor(Date.now() / 1000)
  const remaining = unlockTime - now

  if (remaining <= 0) return 'Unlocked'

  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

function RecordItem({
  record,
  lockDuration
}: {
  record: PhaseLockRecord
  lockDuration: bigint
}) {
  const now = Math.floor(Date.now() / 1000)
  // Calculate unlock time dynamically: purchaseTime + lockDuration
  const unlockTime = Number(record.purchaseTime) + Number(lockDuration)
  const isUnlocked = unlockTime <= now
  const status = record.claimed
    ? 'claimed'
    : isUnlocked
      ? 'claimable'
      : 'locked'

  const lockDurationDisplay = formatLockDuration(lockDuration)
  const phaseLabel = record.phase === 1
    ? `Phase 1 (${lockDurationDisplay} lock)`
    : `Phase 2 (${lockDurationDisplay} lock)`

  // Get time remaining display
  const getTimeRemainingText = () => {
    if (record.claimed) return 'Already claimed'
    if (isUnlocked) return 'Available for claim'
    return getTimeRemaining(unlockTime)
  }

  return (
    <div className="record-item">
      <div className="record-header">
        <span className="record-phase">{phaseLabel}</span>
        <span className={`record-status ${status}`}>
          {status === 'claimed' ? 'Claimed' : status === 'claimable' ? 'Ready to Claim' : 'Locked'}
        </span>
      </div>
      <div className="record-details">
        <p><strong>Amount:</strong> {formatTokenAmount(record.amount)} PAULO</p>
        <p><strong>Unlock Time:</strong> {formatTimestamp(unlockTime)}</p>
        <p><strong>Time Remaining:</strong> {getTimeRemainingText()}</p>
      </div>
    </div>
  )
}

export default function PurchaseRecords() {
  const { isConnected } = useWallet()
  const { phase1Locks, phase2Locks, allRecords, userSummary, saleInfo, isConfirmed, refetchAll } = useICO()

  // Get lock durations from contract
  const phase1LockDuration = saleInfo?.phase1LockDuration ?? BigInt(365 * 24 * 60 * 60)
  const phase2LockDuration = saleInfo?.phase2LockDuration ?? BigInt(4 * 365 * 24 * 60 * 60)

  // Refresh data when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetchAll()
    }
  }, [isConfirmed, refetchAll])

  if (!isConnected) {
    return (
      <div className="records-panel">
        <h3>Your Purchase Records</h3>
        <p className="no-records">Connect your wallet to view your purchase records.</p>
      </div>
    )
  }

  if (allRecords.length === 0) {
    return (
      <div className="records-panel">
        <h3>Your Purchase Records</h3>
        <p className="no-records">No purchase records yet.</p>
      </div>
    )
  }

  // Helper function to calculate unlock time for a record
  const getUnlockTime = (record: PhaseLockRecord): number => {
    const lockDuration = record.phase === 1 ? phase1LockDuration : phase2LockDuration
    return Number(record.purchaseTime) + Number(lockDuration)
  }

  // Calculate totals
  const now = Math.floor(Date.now() / 1000)
  const totalPhase1 = phase1Locks.reduce((sum, r) => sum + r.amount, 0n)
  const totalPhase2 = phase2Locks.reduce((sum, r) => sum + r.amount, 0n)
  const totalLocked = allRecords.filter(r => !r.claimed && getUnlockTime(r) > now)
    .reduce((sum, r) => sum + r.amount, 0n)
  const totalClaimable = allRecords.filter(r => !r.claimed && getUnlockTime(r) <= now)
    .reduce((sum, r) => sum + r.amount, 0n)
  const totalClaimed = allRecords.filter(r => r.claimed)
    .reduce((sum, r) => sum + r.amount, 0n)

  return (
    <div className="records-panel">
      <h3>Your Purchase Records</h3>

      {/* Summary */}
      <div className="records-summary">
        <div className="summary-item">
          <span className="summary-label">Total Spent:</span>
          <span className="summary-value">
            {userSummary ? (Number(userSummary.totalSpentUsdt) / 1e18).toFixed(2) : 0} USDT
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total PAULO:</span>
          <span className="summary-value">{formatTokenAmount(totalPhase1 + totalPhase2)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Locked:</span>
          <span className="summary-value locked">{formatTokenAmount(totalLocked)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Claimable:</span>
          <span className="summary-value claimable">{formatTokenAmount(totalClaimable)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Claimed:</span>
          <span className="summary-value claimed">{formatTokenAmount(totalClaimed)}</span>
        </div>
      </div>

      {/* Phase 1 Records */}
      {phase1Locks.length > 0 && (
        <div className="phase-section">
          <h4>Phase 1 Records</h4>
          {phase1Locks.map((record) => (
            <RecordItem
              key={`p1-${record.index}`}
              record={record}
              lockDuration={phase1LockDuration}
            />
          ))}
        </div>
      )}

      {/* Phase 2 Records */}
      {phase2Locks.length > 0 && (
        <div className="phase-section">
          <h4>Phase 2 Records</h4>
          {phase2Locks.map((record) => (
            <RecordItem
              key={`p2-${record.index}`}
              record={record}
              lockDuration={phase2LockDuration}
            />
          ))}
        </div>
      )}
    </div>
  )
}
