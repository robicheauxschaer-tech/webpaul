import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useCallback } from 'react'
import { icoAbi, usdtAbi, type LockRecord, type UserSummary, type SaleInfo } from '../config/contract'
import { ICO_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS, ICO_CONFIG } from '../constants/ico'

export interface PhaseLockRecord extends LockRecord {
  index: number
  phase: 1 | 2
}

// Type for getUserSummary return
type UserSummaryResult = readonly [
  bigint, // totalSpentUsdt
  bigint, // phase1PurchasedFlag
  bigint, // phase2PurchasesUsed
  bigint, // phase2PurchasesLeft
  bigint, // phase1Locked
  bigint, // phase1Claimable
  bigint, // phase1AlreadyClaimed
  bigint, // phase1EarliestUnlock
  bigint, // phase2Locked
  bigint, // phase2Claimable
  bigint, // phase2AlreadyClaimed
  bigint, // phase2EarliestUnlock
]

// Type for getSaleInfo return
type SaleInfoResult = readonly [
  bigint,  // _phase1Sold
  bigint,  // _phase1Remaining
  bigint,  // _phase2Sold
  bigint,  // _phase2Remaining
  bigint,  // _totalSold
  bigint,  // _totalRemaining
  bigint,  // _totalUsdtRaised
  boolean, // _saleActive
  bigint,  // _phase1LockDuration
  bigint,  // _phase2LockDuration
]

export function useICO() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const [error, setError] = useState<string>('')

  // Read user's Phase 1 lock records
  const { data: phase1Locks, refetch: refetchPhase1 } = useReadContract({
    address: ICO_CONTRACT_ADDRESS,
    abi: icoAbi,
    functionName: 'getUserPhase1Locks',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read user's Phase 2 lock records
  const { data: phase2Locks, refetch: refetchPhase2 } = useReadContract({
    address: ICO_CONTRACT_ADDRESS,
    abi: icoAbi,
    functionName: 'getUserPhase2Locks',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read user summary
  const { data: userSummary, refetch: refetchSummary } = useReadContract({
    address: ICO_CONTRACT_ADDRESS,
    abi: icoAbi,
    functionName: 'getUserSummary',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read sale info
  const { data: saleInfo, refetch: refetchSaleInfo } = useReadContract({
    address: ICO_CONTRACT_ADDRESS,
    abi: icoAbi,
    functionName: 'getSaleInfo',
    query: {
      enabled: true,
    },
  })

  // Check USDT allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: usdtAbi,
    functionName: 'allowance',
    args: address ? [address, ICO_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Approve USDT spending
  const approveUsdt = useCallback((amount: bigint) => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }
    setError('')
    writeContract({
      address: USDT_CONTRACT_ADDRESS,
      abi: usdtAbi,
      functionName: 'approve',
      args: [ICO_CONTRACT_ADDRESS, amount],
    })
  }, [isConnected, writeContract])

  // Buy Phase 1 tokens (fixed 10,000 USDT, one per address)
  const buyPhase1 = useCallback(() => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }

    // Check if already purchased
    const summary = userSummary as UserSummaryResult | undefined
    if (summary && summary[1] === 1n) {
      setError('You have already purchased Phase 1')
      return
    }

    setError('')
    writeContract({
      address: ICO_CONTRACT_ADDRESS,
      abi: icoAbi,
      functionName: 'buyPhase1',
      args: [],
    })
  }, [isConnected, userSummary, writeContract])

  // Buy Phase 2 tokens (40-400 USDT, max 4 purchases)
  const buyPhase2 = useCallback((usdtAmount: bigint) => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }

    const usdtAmountNumber = Number(usdtAmount) / 1e18

    // Validate purchase amount
    if (usdtAmountNumber < ICO_CONFIG.PHASE2_MIN_PURCHASE) {
      setError(`Minimum purchase is ${ICO_CONFIG.PHASE2_MIN_PURCHASE} USDT`)
      return
    }
    if (usdtAmountNumber > ICO_CONFIG.PHASE2_MAX_PURCHASE) {
      setError(`Maximum purchase is ${ICO_CONFIG.PHASE2_MAX_PURCHASE} USDT per transaction`)
      return
    }

    // Check purchase count
    const summary = userSummary as UserSummaryResult | undefined
    const purchasesLeft = summary ? Number(summary[3]) : ICO_CONFIG.PHASE2_MAX_PURCHASES
    if (purchasesLeft <= 0) {
      setError(`Purchase limit reached (max ${ICO_CONFIG.PHASE2_MAX_PURCHASES} purchases)`)
      return
    }

    setError('')
    writeContract({
      address: ICO_CONTRACT_ADDRESS,
      abi: icoAbi,
      functionName: 'buyPhase2',
      args: [usdtAmount],
    })
  }, [isConnected, userSummary, writeContract])

  // Claim Phase 1 tokens by index
  const claimPhase1 = useCallback((index: bigint) => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }
    setError('')
    writeContract({
      address: ICO_CONTRACT_ADDRESS,
      abi: icoAbi,
      functionName: 'claimPhase1',
      args: [index],
    })
  }, [isConnected, writeContract])

  // Claim Phase 2 tokens by index
  const claimPhase2 = useCallback((index: bigint) => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }
    setError('')
    writeContract({
      address: ICO_CONTRACT_ADDRESS,
      abi: icoAbi,
      functionName: 'claimPhase2',
      args: [index],
    })
  }, [isConnected, writeContract])

  // Claim all Phase 1 tokens
  const claimAllPhase1 = useCallback(() => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }
    setError('')
    writeContract({
      address: ICO_CONTRACT_ADDRESS,
      abi: icoAbi,
      functionName: 'claimAllPhase1',
      args: [],
    })
  }, [isConnected, writeContract])

  // Claim all Phase 2 tokens
  const claimAllPhase2 = useCallback(() => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }
    setError('')
    writeContract({
      address: ICO_CONTRACT_ADDRESS,
      abi: icoAbi,
      functionName: 'claimAllPhase2',
      args: [],
    })
  }, [isConnected, writeContract])

  // Calculate PAULO amount from USDT
  const calculatePauloAmount = (usdtAmount: string): string => {
    const usdt = parseFloat(usdtAmount)
    if (isNaN(usdt)) return '0'
    return (usdt * ICO_CONFIG.PAULO_PER_USDT).toString()
  }

  // Check if needs approval
  const needsApproval = (amount: bigint): boolean => {
    if (!allowance) return true
    return allowance < amount
  }

  // Refetch all data
  const refetchAll = useCallback(() => {
    refetchPhase1()
    refetchPhase2()
    refetchSummary()
    refetchSaleInfo()
    refetchAllowance()
  }, [refetchPhase1, refetchPhase2, refetchSummary, refetchSaleInfo, refetchAllowance])

  // Format Phase 1 lock records
  const formattedPhase1Locks: PhaseLockRecord[] = phase1Locks
    ? (phase1Locks as LockRecord[]).map((record, index) => ({
        ...record,
        index,
        phase: 1 as const,
      }))
    : []

  // Format Phase 2 lock records
  const formattedPhase2Locks: PhaseLockRecord[] = phase2Locks
    ? (phase2Locks as LockRecord[]).map((record, index) => ({
        ...record,
        index,
        phase: 2 as const,
      }))
    : []

  // All records combined
  const allRecords = [...formattedPhase1Locks, ...formattedPhase2Locks]

  // Parse user summary
  const parsedUserSummary: UserSummary | null = userSummary
    ? (() => {
        const s = userSummary as UserSummaryResult
        return {
          totalSpentUsdt: s[0],
          phase1PurchasedFlag: s[1],
          phase2PurchasesUsed: s[2],
          phase2PurchasesLeft: s[3],
          phase1Locked: s[4],
          phase1Claimable: s[5],
          phase1AlreadyClaimed: s[6],
          phase1EarliestUnlock: s[7],
          phase2Locked: s[8],
          phase2Claimable: s[9],
          phase2AlreadyClaimed: s[10],
          phase2EarliestUnlock: s[11],
        }
      })()
    : null

  // Parse sale info
  const parsedSaleInfo: SaleInfo | null = saleInfo
    ? (() => {
        const s = saleInfo as SaleInfoResult
        return {
          phase1Sold: s[0],
          phase1Remaining: s[1],
          phase2Sold: s[2],
          phase2Remaining: s[3],
          totalSold: s[4],
          totalRemaining: s[5],
          totalUsdtRaised: s[6],
          saleActive: s[7],
          phase1LockDuration: s[8],
          phase2LockDuration: s[9],
        }
      })()
    : null

  return {
    // State
    error,
    setError,

    // Data
    phase1Locks: formattedPhase1Locks,
    phase2Locks: formattedPhase2Locks,
    allRecords,
    userSummary: parsedUserSummary,
    saleInfo: parsedSaleInfo,
    allowance,

    // Transaction status
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,

    // Actions
    approveUsdt,
    buyPhase1,
    buyPhase2,
    claimPhase1,
    claimPhase2,
    claimAllPhase1,
    claimAllPhase2,
    calculatePauloAmount,
    needsApproval,
    refetchAll,
  }
}
