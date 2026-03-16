import { useConnect, useAccount } from 'wagmi'
import { useEffect } from 'react'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connect, isPending, error } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (isConnected) {
      onClose()
    }
  }, [isConnected, onClose])

  if (!isOpen) return null

  const handleConnect = (connector: typeof connectors[0]) => {
    connect({ connector })
  }

  const getConnectorIcon = (connectorId: string) => {
    if (connectorId === 'injected') {
      return 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg'
    }
    if (connectorId === 'walletConnect') {
      return 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4'
    }
    return 'https://via.placeholder.com/40'
  }

  const getConnectorName = (connectorId: string) => {
    if (connectorId === 'injected') {
      return 'MetaMask'
    }
    if (connectorId === 'walletConnect') {
      return 'WalletConnect'
    }
    return connectorId
  }

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Connect Your Wallet</h3>

        {error && (
          <div className="error-message">
            {error.message}
          </div>
        )}

        {connectors.map((connector) => (
          <button
            key={connector.uid}
            className="wallet-option"
            onClick={() => handleConnect(connector)}
            disabled={isPending}
          >
            <img
              src={getConnectorIcon(connector.id)}
              alt={connector.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'
              }}
            />
            <span>{getConnectorName(connector.id)}</span>
            {isPending && <span>Connecting...</span>}
          </button>
        ))}

        <button
          className="btn wallet-modal-close"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
