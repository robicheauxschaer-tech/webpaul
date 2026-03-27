// ICO Configuration Constants
export const ICO_CONFIG = {
  // Price: 0.2 USDT = 1 PAULO, so 1 USDT = 5 PAULO
  PRICE: 0.2,                    // 0.2 USDT = 1 PAULO
  PAULO_PER_USDT: 5,             // 1 USDT = 5 PAULO

  // Phase 1: Fixed amount, one purchase per address
  PHASE1_PURCHASE: 10_000,       // Fixed 10,000 USDT per purchase
  PHASE1_PAULO: 50_000,          // 10,000 USDT * 5 = 50,000 PAULO

  // Phase 2: Range purchase, max 4 purchases per address
  PHASE2_MIN_PURCHASE: 40,       // Minimum 40 USDT per transaction
  PHASE2_MAX_PURCHASE: 400,      // Maximum 400 USDT per transaction
  PHASE2_MAX_PURCHASES: 4,       // Maximum 4 purchases per address

  // Total supply allocation
  TOTAL_SUPPLY: 120_000_000,     // 120 million total
  PHASE1_TOTAL: 20_000_000,      // 20 million for Phase 1 (1 year lock)
  PHASE2_TOTAL: 100_000_000,     // 100 million for Phase 2 (4 years lock)

  // Lock periods in seconds
  LOCK_1_YEAR_SECONDS: 365 * 24 * 60 * 60,  // 1 year
  LOCK_4_YEAR_SECONDS: 4 * 365 * 24 * 60 * 60,  // 4 years
} as const

// BSC USDT Contract Address
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`

// ICO Contract Address (to be filled in)
export const ICO_CONTRACT_ADDRESS = (import.meta.env.VITE_ICO_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

// WalletConnect Project ID (to be filled in)
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

// BSC Chain Configuration
export const BSC_CHAIN = {
  id: 56,
  name: 'BNB Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed1.binance.org'] },
    public: { http: ['https://bsc-dataseed1.binance.org'] },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
} as const
