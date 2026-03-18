import { useICO } from '../../hooks/useICO'
import { useWallet } from '../../hooks/useWallet'
import { useEffect } from 'react'
import type { PhaseLockRecord } from '../../hooks/useICO'

// Format token amount with 6 decimals (PAULO token)
function formatTokenAmount(amount: bigint, decimals: number = 6): string {
  const value = Number(amount) / Math.pow(10, decimals)
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export default function ClaimPanel() {
  const { isConnected } = useWallet()
  const {
    phase1Locks,
    phase2Locks,
    saleInfo,
    claimPhase1,
    claimPhase2,
    claimAllPhase1,
    claimAllPhase2,
    isWritePending,
    isConfirming,
    isConfirmed,
    refetchAll,
  } = useICO()

  // Get lock durations from contract
  const phase1LockDuration = saleInfo?.phase1LockDuration ?? BigInt(365 * 24 * 60 * 60)
  const phase2LockDuration = saleInfo?.phase2LockDuration ?? BigInt(4 * 365 * 24 * 60 * 60)

  // Helper function to calculate unlock time
  const getUnlockTime = (record: PhaseLockRecord): number => {
    const lockDuration = record.phase === 1 ? phase1LockDuration : phase2LockDuration
    return Number(record.purchaseTime) + Number(lockDuration)
  }

  // Refresh data when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetchAll()
    }
  }, [isConfirmed, refetchAll])

  if (!isConnected) {
    return (
      <div className="claim-panel">
        <h3>Claim Your Tokens</h3>
        <p className="no-records">Connect your wallet to claim your tokens.</p>
      </div>
    )
  }

  const now = Math.floor(Date.now() / 1000)

  // Filter claimable records (using dynamic unlock time calculation)
  const claimablePhase1 = phase1Locks.filter(r => !r.claimed && getUnlockTime(r) <= now)
  const claimablePhase2 = phase2Locks.filter(r => !r.claimed && getUnlockTime(r) <= now)

  // Calculate totals
  const totalClaimablePhase1 = claimablePhase1.reduce((sum, r) => sum + r.amount, 0n)
  const totalClaimablePhase2 = claimablePhase2.reduce((sum, r) => sum + r.amount, 0n)
  const totalClaimable = totalClaimablePhase1 + totalClaimablePhase2

  if (totalClaimable === 0n) {
    return (
      <div className="claim-panel">
        <h3>Claim Your Tokens</h3>
        <p className="no-records">No tokens available to claim yet.</p>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>
          Your locked tokens will become available after the lock period expires.
        </p>
      </div>
    )
  }

  return (
    <div className="claim-panel">
      <h3>Claim Your Tokens</h3>

      {/* Summary */}
      <div className="claim-summary">
        <p><strong>Total Claimable:</strong> {formatTokenAmount(totalClaimable)} PAULO</p>
        {totalClaimablePhase1 > 0n && (
          <p><strong>Phase 1:</strong> {formatTokenAmount(totalClaimablePhase1)} PAULO ({claimablePhase1.length} records)</p>
        )}
        {totalClaimablePhase2 > 0n && (
          <p><strong>Phase 2:</strong> {formatTokenAmount(totalClaimablePhase2)} PAULO ({claimablePhase2.length} records)</p>
        )}
      </div>

      {/* Claim All Buttons */}
      <div className="claim-all-section">
        {totalClaimablePhase1 > 0n && (
          <button
            className="btn claim-btn"
            onClick={() => claimAllPhase1()}
            disabled={isWritePending || isConfirming}
          >
            {isConfirming ? 'Confirming...' : isWritePending ? 'Claiming...' : `Claim All Phase 1 (${formatTokenAmount(totalClaimablePhase1)} PAULO)`}
          </button>
        )}
        {totalClaimablePhase2 > 0n && (
          <button
            className="btn claim-btn"
            onClick={() => claimAllPhase2()}
            disabled={isWritePending || isConfirming}
          >
            {isConfirming ? 'Confirming...' : isWritePending ? 'Claiming...' : `Claim All Phase 2 (${formatTokenAmount(totalClaimablePhase2)} PAULO)`}
          </button>
        )}
      </div>

      {/* Individual Claim List */}
      <div className="claim-list">
        <h4>Individual Records</h4>

        {/* Phase 1 Records */}
        {claimablePhase1.map((record) => (
          <div key={`p1-${record.index}`} className="record-item">
            <div className="record-header">
              <span className="record-phase">Phase 1 #{record.index}</span>
              <span className="record-status claimable">Ready</span>
            </div>
            <div className="record-details">
              <p><strong>Amount:</strong> {formatTokenAmount(record.amount)} PAULO</p>
            </div>
            <button
              className="btn claim-btn-small"
              onClick={() => claimPhase1(BigInt(record.index))}
              disabled={isWritePending || isConfirming}
            >
              Claim
            </button>
          </div>
        ))}

        {/* Phase 2 Records */}
        {claimablePhase2.map((record) => (
          <div key={`p2-${record.index}`} className="record-item">
            <div className="record-header">
              <span className="record-phase">Phase 2 #{record.index}</span>
              <span className="record-status claimable">Ready</span>
            </div>
            <div className="record-details">
              <p><strong>Amount:</strong> {formatTokenAmount(record.amount)} PAULO</p>
            </div>
            <button
              className="btn claim-btn-small"
              onClick={() => claimPhase2(BigInt(record.index))}
              disabled={isWritePending || isConfirming}
            >
              Claim
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
