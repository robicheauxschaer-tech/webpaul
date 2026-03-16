/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ICO_CONTRACT_ADDRESS: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_USDT_CONTRACT_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
