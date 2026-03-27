import { useState, useEffect, useRef } from 'react'
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

type TxStep = 'idle' | 'approving' | 'buying'

function Phase1Panel() {
  const { isConnected } = useWallet()
  const {
    error,
    userSummary,
    saleInfo,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    resetWrite,
    needsApproval,
    approveUsdt,
    buyPhase1,
    refetchAll,
  } = useICO()

  const [step, setStep] = useState<TxStep>('idle')
  const prevConfirmed = useRef(false)

  const phase1Amount = BigInt(ICO_CONFIG.PHASE1_PURCHASE) * BigInt(1e18)
  const requiresApproval = needsApproval(phase1Amount)
  const alreadyPurchased = userSummary?.phase1PurchasedFlag === 1n
  const phase1LockDays = saleInfo ? Math.floor(Number(saleInfo.phase1LockDuration) / 86400) : 365
  const phase1Remaining = saleInfo ? Number(saleInfo.phase1Remaining) / 1e6 : 0

  // Reset step on write error (e.g. user rejected in wallet)
  useEffect(() => {
    if (writeError && step !== 'idle') {
      setStep('idle')
      resetWrite()
    }
  }, [writeError, step, resetWrite])

  // Watch for transaction confirmation
  useEffect(() => {
    if (isConfirmed && !prevConfirmed.current) {
      if (step === 'approving') {
        // Approve done, now auto-buy
        refetchAll()
        setStep('buying')
        // Small delay to let allowance refetch settle
        setTimeout(() => {
          buyPhase1()
        }, 500)
      } else if (step === 'buying') {
        // Buy done
        refetchAll()
        setStep('idle')
      }
    }
    prevConfirmed.current = !!isConfirmed
  }, [isConfirmed, step, refetchAll, buyPhase1])

  const handlePurchase = () => {
    if (requiresApproval) {
      setStep('approving')
      approveUsdt(phase1Amount)
    } else {
      setStep('buying')
      buyPhase1()
    }
  }

  const isBusy = isWritePending || isConfirming

  const getButtonText = () => {
    if (step === 'approving') {
      if (isConfirming) return 'Confirming Approval...'
      if (isWritePending) return 'Approving...'
      return 'Approving...'
    }
    if (step === 'buying') {
      if (isConfirming) return 'Confirming Purchase...'
      if (isWritePending) return 'Buying...'
      return 'Buying...'
    }
    if (requiresApproval) {
      return `Approve & Buy ${ICO_CONFIG.PHASE1_PAULO.toLocaleString()} PAULO`
    }
    return `Buy ${ICO_CONFIG.PHASE1_PAULO.toLocaleString()} PAULO`
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
            <button
              className="btn"
              disabled={isBusy || step !== 'idle'}
              onClick={handlePurchase}
            >
              {getButtonText()}
            </button>
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
    writeError,
    resetWrite,
    needsApproval,
    approveUsdt,
    buyPhase2,
    refetchAll,
  } = useICO()

  const [localAmount, setLocalAmount] = useState('')
  const [step, setStep] = useState<TxStep>('idle')
  const prevConfirmed = useRef(false)
  const pendingAmountRef = useRef<bigint>(0n)

  const pauloAmount = calculatePauloAmount(localAmount)
  const amountBigInt = BigInt(Math.floor(parseFloat(localAmount || '0') * 1e18))
  const requiresApproval = needsApproval(amountBigInt)

  const purchasesUsed = userSummary ? Number(userSummary.phase2PurchasesUsed) : 0
  const purchasesLeft = userSummary ? Number(userSummary.phase2PurchasesLeft) : ICO_CONFIG.PHASE2_MAX_PURCHASES
  const reachedLimit = purchasesLeft <= 0
  const phase2LockDays = saleInfo ? Math.floor(Number(saleInfo.phase2LockDuration) / 86400) : 1460
  const phase2Remaining = saleInfo ? Number(saleInfo.phase2Remaining) / 1e6 : 0

  // Reset step on write error (e.g. user rejected in wallet)
  useEffect(() => {
    if (writeError && step !== 'idle') {
      setStep('idle')
      pendingAmountRef.current = 0n
      resetWrite()
    }
  }, [writeError, step, resetWrite])

  // Watch for transaction confirmation
  useEffect(() => {
    if (isConfirmed && !prevConfirmed.current) {
      if (step === 'approving') {
        // Approve done, now auto-buy
        refetchAll()
        setStep('buying')
        const amount = pendingAmountRef.current
        setTimeout(() => {
          buyPhase2(amount)
        }, 500)
      } else if (step === 'buying') {
        // Buy done
        refetchAll()
        setStep('idle')
        setLocalAmount('')
        pendingAmountRef.current = 0n
      }
    }
    prevConfirmed.current = !!isConfirmed
  }, [isConfirmed, step, refetchAll, buyPhase2])

  const handlePurchase = () => {
    if (amountBigInt <= 0n) return
    pendingAmountRef.current = amountBigInt
    if (requiresApproval) {
      setStep('approving')
      approveUsdt(amountBigInt)
    } else {
      setStep('buying')
      buyPhase2(amountBigInt)
    }
  }

  const isBusy = isWritePending || isConfirming

  const getButtonText = () => {
    if (step === 'approving') {
      if (isConfirming) return 'Confirming Approval...'
      if (isWritePending) return 'Approving...'
      return 'Approving...'
    }
    if (step === 'buying') {
      if (isConfirming) return 'Confirming Purchase...'
      if (isWritePending) return 'Buying...'
      return 'Buying...'
    }
    if (requiresApproval) {
      return 'Approve & Buy'
    }
    return 'Buy'
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
          disabled={!isConnected || reachedLimit || step !== 'idle'}
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
            <button
              className="btn"
              disabled={isBusy || step !== 'idle' || amountBigInt <= 0n}
              onClick={handlePurchase}
            >
              {getButtonText()}
            </button>
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
