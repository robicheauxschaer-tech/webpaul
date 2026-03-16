import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useCallback } from 'react'
import { icoAbi, usdtAbi, type PurchaseRecord } from '../config/contract'
import { ICO_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS, ICO_CONFIG } from '../constants/ico'

export function useICO() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const [purchaseAmount, setPurchaseAmount] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Read user's purchase records
  const { data: records, refetch: refetchRecords } = useReadContract({
    address: ICO_CONTRACT_ADDRESS,
    abi: icoAbi,
    functionName: 'getPurchaseRecords',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read user's total purchased amount
  const { data: totalPurchased, refetch: refetchTotal } = useReadContract({
    address: ICO_CONTRACT_ADDRESS,
    abi: icoAbi,
    functionName: 'getTotalPurchased',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read claimable amount
  const { data: claimableAmount, refetch: refetchClaimable } = useReadContract({
    address: ICO_CONTRACT_ADDRESS,
    abi: icoAbi,
    functionName: 'getClaimableAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
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

  // Purchase PAULO tokens
  const purchase = useCallback((usdtAmount: bigint) => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }

    const usdtAmountNumber = Number(usdtAmount) / 1e18

    // Validate purchase amount
    if (usdtAmountNumber < ICO_CONFIG.MIN_PURCHASE) {
      setError(`Minimum purchase is ${ICO_CONFIG.MIN_PURCHASE} USDT`)
      return
    }
    if (usdtAmountNumber > ICO_CONFIG.MAX_PURCHASE) {
      setError(`Maximum purchase is ${ICO_CONFIG.MAX_PURCHASE} USDT per transaction`)
      return
    }

    // Check total purchased
    const totalPurchasedNumber = totalPurchased ? Number(totalPurchased) / 1e18 : 0
    if (totalPurchasedNumber + usdtAmountNumber > ICO_CONFIG.MAX_PER_ACCOUNT) {
      setError(`Account limit exceeded. Maximum ${ICO_CONFIG.MAX_PER_ACCOUNT} USDT per account`)
      return
    }

    setError('')
    writeContract({
      address: ICO_CONTRACT_ADDRESS,
      abi: icoAbi,
      functionName: 'purchase',
      args: [usdtAmount],
    })
  }, [isConnected, totalPurchased, writeContract])

  // Claim tokens for a specific record
  const claim = useCallback((recordId: bigint) => {
    if (!isConnected) {
      setError('Please connect wallet first')
      return
    }
    setError('')
    writeContract({
      address: ICO_CONTRACT_ADDRESS,
      abi: icoAbi,
      functionName: 'claim',
      args: [recordId],
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
    refetchRecords()
    refetchTotal()
    refetchClaimable()
    refetchAllowance()
  }, [refetchRecords, refetchTotal, refetchClaimable, refetchAllowance])

  // Format purchase records - handle the raw contract response
  const formattedRecords: PurchaseRecord[] = records ? (records as any[]).map((record) => ({
    id: record.id ?? record[0],
    amount: record.amount ?? record[1],
    pauloAmount: record.pauloAmount ?? record[2],
    lockPeriod: record.lockPeriod ?? record[3],
    purchaseTime: record.purchaseTime ?? record[4],
    unlockTime: record.unlockTime ?? record[5],
    claimed: record.claimed ?? record[6],
  })) : []

  return {
    // State
    purchaseAmount,
    setPurchaseAmount,
    error,
    setError,

    // Data
    records: formattedRecords,
    totalPurchased,
    claimableAmount,
    allowance,

    // Transaction status
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,

    // Actions
    approveUsdt,
    purchase,
    claim,
    calculatePauloAmount,
    needsApproval,
    refetchAll,
  }
}
