export default function Hero() {
  return (
    <section id="home">
      <div className="container">
        <div className="home-content">
          <img src="/paul.png" alt="Paul Octopus" className="home-logo" />
          <h1 className="home-title">Oracle Paul Rises!</h1>
          <p className="home-subtitle">Rule Crypto World Cup, A Community-Driven Decentralized Oracle Realm!</p>
          <p className="home-highlight">
            2026's Greatest Meme Coin is Unleashed!
          </p>
          <div className="social-icons">
            <a href="https://www.instagram.com/paul888octopus/" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://x.com/Paul888Octopus" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
        <div className="bottom-center-image">
          <img src="/rm.png" alt="RM Logo" />
        </div>
      </div>
    </section>
  )
}
