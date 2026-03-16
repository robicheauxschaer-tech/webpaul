// ICO Contract ABI
export const icoAbi = [
  // Read functions
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getPurchaseRecords',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'pauloAmount', type: 'uint256' },
          { name: 'lockPeriod', type: 'uint256' },
          { name: 'purchaseTime', type: 'uint256' },
          { name: 'unlockTime', type: 'uint256' },
          { name: 'claimed', type: 'bool' },
        ],
        name: 'records',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getTotalPurchased',
    outputs: [{ name: 'total', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getClaimableAmount',
    outputs: [{ name: 'amount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [{ name: 'usdtAmount', type: 'uint256' }],
    name: 'purchase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'recordId', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'usdtAmount', type: 'uint256' },
      { indexed: false, name: 'pauloAmount', type: 'uint256' },
      { indexed: false, name: 'lockPeriod', type: 'uint256' },
    ],
    name: 'Purchased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'recordId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Claimed',
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

// Purchase Record type
export interface PurchaseRecord {
  id: bigint
  amount: bigint
  pauloAmount: bigint
  lockPeriod: bigint
  purchaseTime: bigint
  unlockTime: bigint
  claimed: boolean
}
