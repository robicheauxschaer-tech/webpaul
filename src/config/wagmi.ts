import { createConfig, http } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { injected, walletConnect } from '@wagmi/connectors'
import { WALLETCONNECT_PROJECT_ID } from '../constants/ico'

export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID || 'demo-project-id',
      showQrModal: true,
    }),
  ],
  transports: {
    [bsc.id]: http('https://bsc-dataseed1.binance.org'),
  },
})

// Type declaration for wagmi
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
