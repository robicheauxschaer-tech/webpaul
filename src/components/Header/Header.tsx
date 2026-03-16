import { useState, useEffect } from 'react'
import { useWallet } from '../../hooks/useWallet'
import WalletModal from './WalletModal'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const { address, isConnected, usdtBalance, formatAddress, disconnect } = useWallet()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header id="header" className={isScrolled ? 'scrolled' : ''}>
        <div className="container">
          <nav className="navbar">
            <a href="#home" className="logo-container">
              <img src="/paulcoinblack.jpg" alt="Paul Logo" className="logo-img" />
              <div className="logo-text">$<span>PAUL</span></div>
            </a>

            <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
              <li><a href="#home" className="active" onClick={handleNavClick}>Home</a></li>
              <li><a href="#ico" onClick={handleNavClick}>ICO</a></li>
              <li><a href="#whitepaper" onClick={handleNavClick}>Whitepaper</a></li>
              <li><a href="#about" onClick={handleNavClick}>About</a></li>
              <li><a href="#ecology" onClick={handleNavClick}>Ecology</a></li>
              <li><a href="#tokenomics" onClick={handleNavClick}>Tokenomics</a></li>
              <li><a href="#roadmap" onClick={handleNavClick}>Roadmap</a></li>
              <li><a href="#coreteam" onClick={handleNavClick}>Core Team</a></li>
              <li>
                {isConnected && address ? (
                  <div className="wallet-info">
                    <span className="wallet-address">{formatAddress(address)}</span>
                    {usdtBalance && (
                      <span className="wallet-balance">{parseFloat(usdtBalance.formatted).toFixed(2)} USDT</span>
                    )}
                    <button
                      className="wallet-btn connected"
                      onClick={() => disconnect()}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    className="wallet-btn"
                    onClick={() => setIsWalletModalOpen(true)}
                  >
                    <i className="fas fa-wallet"></i>
                    Connect Wallet
                  </button>
                )}
              </li>
            </ul>

            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </nav>
        </div>
      </header>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  )
}
