import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Whitepaper from './components/Whitepaper/Whitepaper'
import Ecology from './components/Ecology/Ecology'
import Tokenomics from './components/Tokenomics/Tokenomics'
import Roadmap from './components/Roadmap/Roadmap'
import Team from './components/Team/Team'
import Footer from './components/Footer/Footer'
import PurchasePanel from './components/ICO/PurchasePanel'
import PurchaseRecords from './components/ICO/PurchaseRecords'
import ClaimPanel from './components/ICO/ClaimPanel'
import { useWallet } from './hooks/useWallet'

function App() {
  const { isConnected } = useWallet()

  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <section id="ico" className="ico-section">
          <div className="container">
            <h2>PAULO ICO</h2>
            <p className="ico-subtitle">Participate in the PAULO token sale</p>
            <div className="ico-grid">
              <PurchasePanel />
            </div>
            <div className="ico-info" style={{ maxWidth: '800px', margin: '30px auto 0' }}>
              <h3>ICO Rules</h3>
              <ul>
                <li><strong>Price:</strong> 0.2 USDT = 1 PAULO</li>
                <li><strong>Phase 1:</strong> Fixed 10,000 USDT per purchase, 1 purchase per address, 1 year lock</li>
                <li><strong>Phase 2:</strong> 40 - 400 USDT per transaction, max 4 purchases per address, 4 years lock</li>
                <li><strong>Allocation:</strong> Phase 1: 20M PAULO | Phase 2: 100M PAULO</li>
              </ul>
              {!isConnected && (
                <p className="connect-hint">Connect your wallet to participate</p>
              )}
            </div>
            {isConnected && (
              <div className="ico-records">
                <PurchaseRecords />
                <ClaimPanel />
              </div>
            )}
          </div>
        </section>
        <About />
        <Whitepaper />
        <Ecology />
        <Tokenomics />
        <Roadmap />
        <Team />
      </main>
      <Footer />
    </div>
  )
}

export default App
