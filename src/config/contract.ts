// Lock Record type (from contract)
export interface LockRecord {
  amount: bigint        // PAULO amount (6 decimals)
  purchaseTime: bigint  // purchase timestamp
  claimed: boolean
}

// User Summary type (from getUserSummary)
export interface UserSummary {
  totalSpentUsdt: bigint
  remainingUsdtQuota: bigint
  phase1Locked: bigint
  phase1Claimable: bigint
  phase1AlreadyClaimed: bigint
  phase1EarliestUnlock: bigint
  phase2Locked: bigint
  phase2Claimable: bigint
  phase2AlreadyClaimed: bigint
  phase2EarliestUnlock: bigint
}

// Sale Info type (from getSaleInfo)
export interface SaleInfo {
  phase1Sold: bigint
  phase1Remaining: bigint
  phase2Sold: bigint
  phase2Remaining: bigint
  totalSold: bigint
  totalRemaining: bigint
  totalUsdtRaised: bigint
  saleActive: boolean
  phase1LockDuration: bigint
  phase2LockDuration: bigint
}

// ICO Contract ABI (matching PATESTSale contract)
export const icoAbi = [
  // View: Get user's Phase 1 lock records
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserPhase1Locks',
    outputs: [
      {
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'purchaseTime', type: 'uint256' },
          { name: 'claimed', type: 'bool' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // View: Get user's Phase 2 lock records
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserPhase2Locks',
    outputs: [
      {
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'purchaseTime', type: 'uint256' },
          { name: 'claimed', type: 'bool' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // View: Get user summary
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserSummary',
    outputs: [
      { name: 'totalSpentUsdt', type: 'uint256' },
      { name: 'remainingUsdtQuota', type: 'uint256' },
      { name: 'phase1Locked', type: 'uint256' },
      { name: 'phase1Claimable', type: 'uint256' },
      { name: 'phase1AlreadyClaimed', type: 'uint256' },
      { name: 'phase1EarliestUnlock', type: 'uint256' },
      { name: 'phase2Locked', type: 'uint256' },
      { name: 'phase2Claimable', type: 'uint256' },
      { name: 'phase2AlreadyClaimed', type: 'uint256' },
      { name: 'phase2EarliestUnlock', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // View: Get sale info
  {
    inputs: [],
    name: 'getSaleInfo',
    outputs: [
      { name: '_phase1Sold', type: 'uint256' },
      { name: '_phase1Remaining', type: 'uint256' },
      { name: '_phase2Sold', type: 'uint256' },
      { name: '_phase2Remaining', type: 'uint256' },
      { name: '_totalSold', type: 'uint256' },
      { name: '_totalRemaining', type: 'uint256' },
      { name: '_totalUsdtRaised', type: 'uint256' },
      { name: '_saleActive', type: 'bool' },
      { name: '_phase1LockDuration', type: 'uint256' },
      { name: '_phase2LockDuration', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // View: Get user spent USDT
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'userSpentUsdt',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write: Buy tokens
  {
    inputs: [{ name: 'usdtAmount', type: 'uint256' }],
    name: 'buy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Write: Claim Phase 1 by index
  {
    inputs: [{ name: 'index', type: 'uint256' }],
    name: 'claimPhase1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Write: Claim Phase 2 by index
  {
    inputs: [{ name: 'index', type: 'uint256' }],
    name: 'claimPhase2',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Write: Claim all Phase 1
  {
    inputs: [],
    name: 'claimAllPhase1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Write: Claim all Phase 2
  {
    inputs: [],
    name: 'claimAllPhase2',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'buyer', type: 'address' },
      { indexed: false, name: 'usdtAmount', type: 'uint256' },
      { indexed: false, name: 'phase1Amount', type: 'uint256' },
      { indexed: false, name: 'phase2Amount', type: 'uint256' },
    ],
    name: 'TokensPurchased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'index', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Phase1Claimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'index', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Phase2Claimed',
    type: 'event',
  },
] as const

// USDT Contract ABI (minimal for approval and balance)
export const usdtAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
