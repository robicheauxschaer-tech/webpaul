import { useState, useEffect } from 'react'
import { useICO } from '../../hooks/useICO'
import { useWallet } from '../../hooks/useWallet'
import { ICO_CONFIG } from '../../constants/ico'

export default function PurchasePanel() {
  const { isConnected } = useWallet()
  const {
    error,
    calculatePauloAmount,
    isWritePending,
    isConfirming,
    isConfirmed,
    needsApproval,
    approveUsdt,
    buy,
    saleInfo,
    refetchAll,
  } = useICO()

  const [localAmount, setLocalAmount] = useState('')

  // Refresh data when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetchAll()
    }
  }, [isConfirmed, refetchAll])

  const handleAmountChange = (value: string) => {
    setLocalAmount(value)
  }

  const pauloAmount = calculatePauloAmount(localAmount)
  const amountBigInt = BigInt(Math.floor(parseFloat(localAmount || '0') * 1e18))

  const handleApprove = () => {
    if (amountBigInt > 0n) {
      approveUsdt(amountBigInt)
    }
  }

  const handleBuy = () => {
    if (amountBigInt > 0n) {
      buy(amountBigInt)
    }
  }

  const requiresApproval = needsApproval(amountBigInt)

  // Get dynamic lock duration from contract
  const phase1LockDays = saleInfo ? Math.floor(Number(saleInfo.phase1LockDuration) / 86400) : 365
  const phase2LockDays = saleInfo ? Math.floor(Number(saleInfo.phase2LockDuration) / 86400) : 1460

  // Format lock duration for display
  const formatLockDays = (days: number): string => {
    if (days >= 365) {
      const years = Math.floor(days / 365)
      return `${years} year${years > 1 ? 's' : ''}`
    }
    return `${days} days`
  }

  return (
    <div className="purchase-panel">
      <h3>Buy PAULO Tokens</h3>

      {!isConnected && (
        <p className="connect-hint">Connect your wallet to participate</p>
      )}

      <div className="input-group">
        <label>USDT Amount</label>
        <input
          type="number"
          value={localAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder={`${ICO_CONFIG.MIN_PURCHASE} - ${ICO_CONFIG.MAX_PURCHASE} USDT`}
          disabled={!isConnected}
          min={ICO_CONFIG.MIN_PURCHASE}
          max={ICO_CONFIG.MAX_PURCHASE}
          step="1"
        />
      </div>

      {localAmount && parseFloat(localAmount) > 0 && (
        <div className="calculation-result">
          <p>You will receive:</p>
          <p className="amount">{pauloAmount} PAULO</p>
          <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>
            Lock Period: {formatLockDays(phase1LockDays)} or {formatLockDays(phase2LockDays)} (based on phase)
          </p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <div className="purchase-actions">
        {requiresApproval && isConnected && (
          <button
            className="btn"
            disabled={isWritePending || isConfirming || !isConnected}
            onClick={handleApprove}
          >
            {isWritePending ? 'Approving...' : 'Approve USDT'}
          </button>
        )}
        <button
          className="btn"
          disabled={isWritePending || isConfirming || !isConnected || requiresApproval}
          onClick={handleBuy}
        >
          {isConfirming ? 'Confirming...' : isWritePending ? 'Buying...' : 'Buy'}
        </button>
      </div>

      <div className="purchase-info">
        <ul>
          <li><strong>Price:</strong> {ICO_CONFIG.PRICE} USDT = 1 PAULO</li>
          <li><strong>Min Purchase:</strong> {ICO_CONFIG.MIN_PURCHASE} USDT</li>
          <li><strong>Max Purchase:</strong> {ICO_CONFIG.MAX_PURCHASE} USDT</li>
          <li><strong>Account Limit:</strong> {ICO_CONFIG.MAX_PER_ACCOUNT} USDT</li>
          <li><strong>Lock Period:</strong> {formatLockDays(phase1LockDays)} or {formatLockDays(phase2LockDays)}</li>
        </ul>
      </div>
    </div>
  )
}
