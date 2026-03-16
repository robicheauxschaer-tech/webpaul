import { useAccount, useBalance, useDisconnect, useConnect } from 'wagmi'
import { injected } from '@wagmi/connectors'

export function useWallet() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { connectors, connect, isPending } = useConnect()

  // Get USDT balance
  const { data: usdtBalance, refetch: refetchUsdtBalance } = useBalance({
    address,
    token: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`, // BSC USDT
    query: {
      enabled: !!address,
    },
  })

  // Get BNB balance
  const { data: bnbBalance, refetch: refetchBnbBalance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  })

  const connectMetaMask = () => {
    connect({ connector: injected() })
  }

  const disconnectWallet = () => {
    disconnect()
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const refetchBalances = () => {
    refetchUsdtBalance()
    refetchBnbBalance()
  }

  return {
    address,
    isConnected,
    chain,
    usdtBalance,
    bnbBalance,
    connectors,
    connect,
    connectMetaMask,
    disconnect: disconnectWallet,
    formatAddress,
    isConnecting: isPending,
    refetchBalances,
  }
}
