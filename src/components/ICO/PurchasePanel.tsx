import { useState, useEffect } from 'react'
import { useICO } from '../../hooks/useICO'
import { useWallet } from '../../hooks/useWallet'
import { ICO_CONFIG } from '../../constants/ico'

// Format lock duration for display
function formatLockDays(days: number): string {
  if (days >= 365) {
    const years = Math.floor(days / 365)
    return `${years} year${years > 1 ? 's' : ''}`
  }
  return `${days} day${days > 1 ? 's' : ''}`
}

function Phase1Panel() {
  const { isConnected } = useWallet()
  const {
    error,
    userSummary,
    saleInfo,
    isWritePending,
    isConfirming,
    isConfirmed,
    needsApproval,
    approveUsdt,
    buyPhase1,
    refetchAll,
  } = useICO()

  useEffect(() => {
    if (isConfirmed) {
      refetchAll()
    }
  }, [isConfirmed, refetchAll])

  const phase1Amount = BigInt(ICO_CONFIG.PHASE1_PURCHASE) * BigInt(1e18)
  const requiresApproval = needsApproval(phase1Amount)
  const alreadyPurchased = userSummary?.phase1PurchasedFlag === 1n
  const phase1LockDays = saleInfo ? Math.floor(Number(saleInfo.phase1LockDuration) / 86400) : 365
  const phase1Remaining = saleInfo ? Number(saleInfo.phase1Remaining) / 1e6 : 0

  const handleApprove = () => {
    approveUsdt(phase1Amount)
  }

  const handleBuy = () => {
    buyPhase1()
  }

  return (
    <div className="purchase-panel phase-panel">
      <h3>Phase 1 - Premium Sale</h3>

      <div className="calculation-result">
        <p><strong>Fixed Amount:</strong></p>
        <p className="amount">{ICO_CONFIG.PHASE1_PURCHASE.toLocaleString()} USDT = {ICO_CONFIG.PHASE1_PAULO.toLocaleString()} PAULO</p>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>
          Lock Period: {formatLockDays(phase1LockDays)}
        </p>
      </div>

      <div className="purchase-info">
        <ul>
          <li><strong>Price:</strong> {ICO_CONFIG.PRICE} USDT = 1 PAULO</li>
          <li><strong>Amount:</strong> {ICO_CONFIG.PHASE1_PURCHASE.toLocaleString()} USDT (fixed)</li>
          <li><strong>Limit:</strong> 1 purchase per address</li>
          <li><strong>Remaining:</strong> {phase1Remaining.toLocaleString()} PAULO</li>
        </ul>
      </div>

      {!isConnected && (
        <p className="connect-hint">Connect your wallet to participate</p>
      )}

      {error && <p className="error-message">{error}</p>}

      {isConnected && (
        <div className="purchase-actions">
          {alreadyPurchased ? (
            <button className="btn" disabled>
              Already Purchased
            </button>
          ) : (
            <>
              {requiresApproval && (
                <button
                  className="btn"
                  disabled={isWritePending || isConfirming}
                  onClick={handleApprove}
                >
                  {isWritePending ? 'Approving...' : `Approve ${ICO_CONFIG.PHASE1_PURCHASE.toLocaleString()} USDT`}
                </button>
              )}
              <button
                className="btn"
                disabled={isWritePending || isConfirming || requiresApproval}
                onClick={handleBuy}
              >
                {isConfirming ? 'Confirming...' : isWritePending ? 'Buying...' : `Buy ${ICO_CONFIG.PHASE1_PAULO.toLocaleString()} PAULO`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Phase2Panel() {
  const { isConnected } = useWallet()
  const {
    error,
    userSummary,
    saleInfo,
    calculatePauloAmount,
    isWritePending,
    isConfirming,
    isConfirmed,
    needsApproval,
    approveUsdt,
    buyPhase2,
    refetchAll,
  } = useICO()

  const [localAmount, setLocalAmount] = useState('')

  useEffect(() => {
    if (isConfirmed) {
      refetchAll()
    }
  }, [isConfirmed, refetchAll])

  const pauloAmount = calculatePauloAmount(localAmount)
  const amountBigInt = BigInt(Math.floor(parseFloat(localAmount || '0') * 1e18))
  const requiresApproval = needsApproval(amountBigInt)

  const purchasesUsed = userSummary ? Number(userSummary.phase2PurchasesUsed) : 0
  const purchasesLeft = userSummary ? Number(userSummary.phase2PurchasesLeft) : ICO_CONFIG.PHASE2_MAX_PURCHASES
  const reachedLimit = purchasesLeft <= 0
  const phase2LockDays = saleInfo ? Math.floor(Number(saleInfo.phase2LockDuration) / 86400) : 1460
  const phase2Remaining = saleInfo ? Number(saleInfo.phase2Remaining) / 1e6 : 0

  const handleApprove = () => {
    if (amountBigInt > 0n) {
      approveUsdt(amountBigInt)
    }
  }

  const handleBuy = () => {
    if (amountBigInt > 0n) {
      buyPhase2(amountBigInt)
    }
  }

  return (
    <div className="purchase-panel phase-panel">
      <h3>Phase 2 - Public Sale</h3>

      {!isConnected && (
        <p className="connect-hint">Connect your wallet to participate</p>
      )}

      <div className="input-group">
        <label>USDT Amount</label>
        <input
          type="number"
          value={localAmount}
          onChange={(e) => setLocalAmount(e.target.value)}
          placeholder={`${ICO_CONFIG.PHASE2_MIN_PURCHASE} - ${ICO_CONFIG.PHASE2_MAX_PURCHASE} USDT`}
          disabled={!isConnected || reachedLimit}
          min={ICO_CONFIG.PHASE2_MIN_PURCHASE}
          max={ICO_CONFIG.PHASE2_MAX_PURCHASE}
          step="1"
        />
      </div>

      {localAmount && parseFloat(localAmount) > 0 && (
        <div className="calculation-result">
          <p>You will receive:</p>
          <p className="amount">{pauloAmount} PAULO</p>
          <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>
            Lock Period: {formatLockDays(phase2LockDays)}
          </p>
        </div>
      )}

      <div className="purchase-info">
        <ul>
          <li><strong>Price:</strong> {ICO_CONFIG.PRICE} USDT = 1 PAULO</li>
          <li><strong>Range:</strong> {ICO_CONFIG.PHASE2_MIN_PURCHASE} - {ICO_CONFIG.PHASE2_MAX_PURCHASE} USDT per tx</li>
          <li><strong>Purchases:</strong> {purchasesUsed} / {ICO_CONFIG.PHASE2_MAX_PURCHASES} used ({purchasesLeft} left)</li>
          <li><strong>Remaining:</strong> {phase2Remaining.toLocaleString()} PAULO</li>
        </ul>
      </div>

      {error && <p className="error-message">{error}</p>}

      {isConnected && (
        <div className="purchase-actions">
          {reachedLimit ? (
            <button className="btn" disabled>
              Purchase Limit Reached ({ICO_CONFIG.PHASE2_MAX_PURCHASES}/{ICO_CONFIG.PHASE2_MAX_PURCHASES})
            </button>
          ) : (
            <>
              {requiresApproval && (
                <button
                  className="btn"
                  disabled={isWritePending || isConfirming}
                  onClick={handleApprove}
                >
                  {isWritePending ? 'Approving...' : 'Approve USDT'}
                </button>
              )}
              <button
                className="btn"
                disabled={isWritePending || isConfirming || requiresApproval}
                onClick={handleBuy}
              >
                {isConfirming ? 'Confirming...' : isWritePending ? 'Buying...' : 'Buy'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function PurchasePanel() {
  return (
    <>
      <Phase1Panel />
      <Phase2Panel />
    </>
  )
}
