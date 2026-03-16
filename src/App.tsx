import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
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
              <div className="ico-info">
                <h3>ICO Rules</h3>
                <ul>
                  <li><strong>Price:</strong> 0.2 USDT = 1 PAULO</li>
                  <li><strong>Min Purchase:</strong> 40 USDT</li>
                  <li><strong>Max Purchase:</strong> 400 USDT per transaction</li>
                  <li><strong>Account Limit:</strong> 400 USDT total</li>
                  <li><strong>Lock Period:</strong> 1 year or 4 years</li>
                </ul>
                {!isConnected && (
                  <p className="connect-hint">Connect your wallet to participate</p>
                )}
              </div>
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
