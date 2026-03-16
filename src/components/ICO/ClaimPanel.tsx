import { useICO } from '../../hooks/useICO'
import { useWallet } from '../../hooks/useWallet'

function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const value = Number(amount) / Math.pow(10, decimals)
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ClaimPanel() {
  const { isConnected } = useWallet()
  const { records, claim, isWritePending, isConfirming } = useICO()

  if (!isConnected) {
    return (
      <div className="claim-panel">
        <h3>Claim Your Tokens</h3>
        <p className="no-records">Connect your wallet to claim your tokens.</p>
      </div>
    )
  }

  // Filter records that are claimable (unlocked and not claimed)
  const claimableRecords = records.filter((record) => {
    const now = Math.floor(Date.now() / 1000)
    const isUnlocked = Number(record.unlockTime) <= now
    return isUnlocked && !record.claimed
  })

  if (claimableRecords.length === 0) {
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

  const handleClaim = (recordId: bigint) => {
    claim(recordId)
  }

  // Calculate total claimable amount
  const totalClaimable = claimableRecords.reduce((sum, record) => sum + record.pauloAmount, 0n)

  return (
    <div className="claim-panel">
      <h3>Claim Your Tokens</h3>

      <div className="claim-summary">
        <p><strong>Total Claimable:</strong> {formatTokenAmount(totalClaimable)} PAULO</p>
        <p><strong>Records Ready:</strong> {claimableRecords.length}</p>
      </div>

      <div className="claim-list">
        {claimableRecords.map((record) => (
          <div key={record.id.toString()} className="record-item">
            <div className="record-header">
              <span className="record-id">#{record.id.toString()}</span>
              <span className="record-status claimable">Ready to Claim</span>
            </div>
            <div className="record-details">
              <p><strong>PAULO Amount:</strong> {formatTokenAmount(record.pauloAmount)} PAULO</p>
              <p><strong>Unlocked:</strong> {formatTimestamp(record.unlockTime)}</p>
            </div>
            <button
              className="btn claim-btn"
              onClick={() => handleClaim(record.id)}
              disabled={isWritePending || isConfirming}
            >
              {isConfirming ? 'Confirming...' : isWritePending ? 'Claiming...' : 'Claim'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
