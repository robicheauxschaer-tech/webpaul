// ICO Configuration Constants
export const ICO_CONFIG = {
  // Price: 0.2 USDT = 1 PAULO, so 1 USDT = 5 PAULO
  PRICE: 0.2,                    // 0.2 USDT = 1 PAULO
  PAULO_PER_USDT: 5,             // 1 USDT = 5 PAULO

  // Purchase limits (TESTING: reduced by 10x)
  MIN_PURCHASE: 4,               // Minimum 4 USDT per transaction
  MAX_PURCHASE: 40,              // Maximum 40 USDT per transaction
  MAX_PER_ACCOUNT: 40,           // Maximum 40 USDT per account total

  // Total supply allocation
  TOTAL_SUPPLY: 120_000_000,     // 120 million total
  LOCK_1_YEAR: 20_000_000,       // 20 million locked for 1 year
  LOCK_4_YEAR: 100_000_000,      // 100 million locked for 4 years

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
